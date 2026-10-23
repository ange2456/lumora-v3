import { supabase } from "./supabaseClient";

async function requireAccount(uid) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session || session.user.id !== uid) {
    throw new Error("Inicia sesión con la cuenta que corresponde.");
  }
}

async function requireTeacherAccount(uid) {
  await requireAccount(uid);
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", uid)
    .single();
  if (error) throw error;
  if (data.role !== "teacher") {
    throw new Error("Inicia sesión con una cuenta registrada como docente.");
  }
}

function fromDatabaseProgress(record) {
  return {
    id: record.id,
    activity: record.activity,
    activityKey: record.activity_key,
    completedAt: record.completed_at,
    totalQuestions: record.total_questions,
    correctAnswers: record.correct_answers,
    mistakes: record.mistakes,
    reinforcementSuccesses: record.reinforcement_successes,
    skillResults: record.skill_results || [],
    adaptedSkill: record.adapted_skill || "",
    completed: record.completed,
    studentId: record.student_id,
    studentName: record.student_name,
    classId: record.class_id,
    classCode: record.class_code,
  };
}

function toDatabaseProgress(uid, record) {
  return {
    id: record.id,
    student_id: uid,
    activity: record.activity,
    activity_key: record.activityKey,
    completed_at: record.completedAt,
    total_questions: record.totalQuestions,
    correct_answers: record.correctAnswers,
    mistakes: record.mistakes,
    reinforcement_successes: record.reinforcementSuccesses,
    skill_results: record.skillResults,
    adapted_skill: record.adaptedSkill,
    completed: record.completed,
    student_name: record.studentName || "Estudiante",
    class_id: record.classId || null,
    class_code: record.classCode || null,
  };
}

export async function getCloudProgress(uid) {
  await requireAccount(uid);
  const { data, error } = await supabase
    .from("challenge_attempts")
    .select("*")
    .eq("student_id", uid)
    .order("completed_at", { ascending: true });
  if (error) throw error;
  return data.map(fromDatabaseProgress);
}

export async function saveCloudProgress(uid, record) {
  await requireAccount(uid);
  const { error } = await supabase
    .from("challenge_attempts")
    .insert(toDatabaseProgress(uid, record));
  if (error) throw error;
}

function makeClassCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return [...bytes]
    .map((byte) => alphabet[byte % alphabet.length])
    .join("");
}

function fromDatabaseResource(resource, signedUrl = "") {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    url: resource.url,
    contentType: resource.content_type || (resource.url ? "link" : "text"),
    fileName: resource.file_name || "",
    fileType: resource.file_type || "",
    fileSize: Number(resource.file_size) || 0,
    fileUrl: signedUrl,
    createdBy: resource.created_by,
    createdAt: resource.created_at,
  };
}

async function withSignedFileUrl(resource) {
  if (!resource.file_path) return fromDatabaseResource(resource);
  const { data, error } = await supabase.storage
    .from("class-resources")
    .createSignedUrl(resource.file_path, 60 * 60);
  if (error) throw error;
  return fromDatabaseResource(resource, data.signedUrl);
}

function fromDatabaseAttempt(record) {
  return {
    id: record.id,
    activity: record.activity,
    activityKey: record.activity_key,
    completedAt: record.completed_at,
    totalQuestions: Number(record.total_questions) || 0,
    correctAnswers: Number(record.correct_answers) || 0,
    mistakes: Number(record.mistakes) || 0,
    reinforcementSuccesses: Number(record.reinforcement_successes) || 0,
    skillResults: record.skill_results || [],
    adaptedSkill: record.adapted_skill || "",
  };
}

function teacherDashboardQueryError(error, resourceName, migrationPath = "") {
  const missingSchema =
    ["PGRST204", "PGRST205", "42P01", "42703"].includes(error.code) ||
    /schema cache|does not exist|could not find the table|could not find the column/i.test(
      error.message || ""
    );

  if (missingSchema && migrationPath) {
    return new Error(
      `No se pudo cargar ${resourceName} porque falta aplicar la migración ${migrationPath}. ${error.message || ""}`
    );
  }
  if (error.code === "42501") {
    return new Error(
      `Supabase bloqueó el acceso a ${resourceName} por permisos RLS. Asegúrate de haber aplicado las migraciones en orden y de iniciar sesión con una cuenta docente.`
    );
  }
  return new Error(
    `No se pudo cargar ${resourceName}. ${error.message || "Revisa la conexión con Supabase."}`
  );
}

export async function getTeacherDashboard(uid) {
  await requireAccount(uid);
  const { data: classes, error: classError } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", uid)
    .order("created_at", { ascending: false });
  if (classError) {
    throw teacherDashboardQueryError(classError, "tus clases");
  }

  return Promise.all(
    classes.map(async (item) => {
      const [
        { data: members, error: membersError },
        { data: resources, error: resourcesError },
        { data: attempts, error: attemptsError },
        { data: quizAttempts, error: quizAttemptsError },
        { data: classContent, error: contentError },
      ] = await Promise.all([
        supabase
          .from("class_members")
          .select("student_id,student_name")
          .eq("class_id", item.id),
        supabase
          .from("class_resources")
          .select(
            "id,title,description,url,content_type,file_path,file_name,file_type,file_size,created_by,created_at"
          )
          .eq("class_id", item.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("challenge_attempts")
          .select(
            "id,student_id,activity,activity_key,completed_at,total_questions,correct_answers,mistakes,reinforcement_successes,skill_results,adapted_skill"
          )
          .eq("class_id", item.id),
        supabase
          .from("class_quiz_attempts")
          .select(
            "id,quiz_id,student_id,correct_answers,total_questions,completed_at"
          )
          .eq("class_id", item.id),
        supabase
          .from("class_learning_content")
          .select(
            "id,class_id,content_type,title,instructions,url,questions,created_at"
          )
          .eq("class_id", item.id)
          .order("created_at", { ascending: true }),
      ]);

      if (membersError) {
        throw teacherDashboardQueryError(membersError, "los estudiantes");
      }
      if (resourcesError) {
        throw teacherDashboardQueryError(
          resourcesError,
          "los recursos",
          "20261021180000_classroom_content_storage.sql"
        );
      }
      if (attemptsError) {
        throw teacherDashboardQueryError(attemptsError, "el progreso");
      }
      if (quizAttemptsError) {
        throw teacherDashboardQueryError(
          quizAttemptsError,
          "los resultados de los retos de clase",
          "20261022120000_student_class_quizzes.sql"
        );
      }
      if (contentError) {
        throw teacherDashboardQueryError(
          contentError,
          "las actividades y los retos",
          "20261021190000_class_learning_content.sql"
        );
      }

      const progressByStudent = new Map();
      attempts.forEach((record) => {
        const totals = progressByStudent.get(record.student_id) || {
          challenges: 0,
          correct: 0,
          total: 0,
        };
        totals.challenges += 1;
        totals.correct += Number(record.correct_answers) || 0;
        totals.total += Number(record.total_questions) || 0;
        progressByStudent.set(record.student_id, totals);
      });

      return {
        id: item.id,
        teacherId: item.teacher_id,
        name: item.name,
        subject: item.subject,
        description: item.description || "",
        archived: item.archived,
        code: item.code,
        createdAt: item.created_at,
        resources: await Promise.all(resources.map(withSignedFileUrl)),
        classContent: classContent.map((content) => ({
          id: content.id,
          type: content.content_type,
          title: content.title,
          instructions: content.instructions || "",
          url: content.url || "",
          questions: content.questions || [],
          createdAt: content.created_at,
        })),
        students: members.map((member) => {
          const totals = progressByStudent.get(member.student_id) || {
            challenges: 0,
            correct: 0,
            total: 0,
          };
          return {
            id: member.student_id,
            name: member.student_name || "Estudiante",
            challenges: totals.challenges,
            percentage: totals.total
              ? Math.round((totals.correct / totals.total) * 100)
              : 0,
            attempts: attempts
              .filter((record) => record.student_id === member.student_id)
              .map(fromDatabaseAttempt)
              .sort(
                (left, right) =>
                  new Date(right.completedAt).getTime() -
                  new Date(left.completedAt).getTime()
              ),
            quizAttempts: quizAttempts
              .filter((record) => record.student_id === member.student_id)
              .map((record) => ({
                id: record.id,
                title:
                  classContent.find((content) => content.id === record.quiz_id)
                    ?.title || "Reto de clase",
                correctAnswers: record.correct_answers,
                totalQuestions: record.total_questions,
                completedAt: record.completed_at,
              }))
              .sort(
                (left, right) =>
                  new Date(right.completedAt).getTime() -
                  new Date(left.completedAt).getTime()
              ),
          };
        }),
      };
    })
  );
}

export async function createCloudClass(uid, { name, subject, description }) {
  await requireTeacherAccount(uid);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeClassCode();
    const { data, error } = await supabase
      .from("classes")
      .insert({
        teacher_id: uid,
        name: name.trim(),
        subject,
        description: String(description || "").trim(),
        code,
      })
      .select("id,teacher_id,name,subject,description,code,created_at")
      .single();

    if (!error) {
      return {
        id: data.id,
        teacherId: data.teacher_id,
        name: data.name,
        subject: data.subject,
        description: data.description || "",
        code: data.code,
        createdAt: data.created_at,
        resources: [],
        classContent: [],
        students: [],
      };
    }
    if (error.code !== "23505" || attempt === 4) {
      if (error.code === "42501") {
        throw new Error(
          "Supabase rechazó la creación por permisos (RLS). Confirma que tu perfil tenga el rol teacher y que la política de creación de clases esté instalada."
        );
      }
      throw error;
    }
  }
  throw new Error("No se pudo generar un código de clase único.");
}

export async function createClassLearningContent(uid, classId, content) {
  await requireTeacherAccount(uid);
  const title = String(content.title || "").trim();
  const instructions = String(content.instructions || "").trim();
  const url = String(content.url || "").trim();
  const type = content.type;
  const questions = Array.isArray(content.questions) ? content.questions : [];

  if (!title || title.length > 100) {
    throw new Error("El título debe tener entre 1 y 100 caracteres.");
  }
  if (instructions.length > 2000) {
    throw new Error("Las instrucciones no pueden superar 2000 caracteres.");
  }
  if (url) {
    try {
      if (new URL(url).protocol !== "https:") {
        throw new Error("El enlace debe comenzar con https://.");
      }
    } catch {
      throw new Error("Escribe un enlace válido que comience con https://.");
    }
    if (url.length > 1000) {
      throw new Error("El enlace no puede superar 1000 caracteres.");
    }
  }

  if (type === "activity") {
    if (!instructions && !url) {
      throw new Error("Agrega instrucciones o un enlace para la actividad.");
    }
    if (questions.length !== 0) {
      throw new Error("Una actividad no puede incluir preguntas de reto.");
    }
  } else if (type === "quiz") {
    if (questions.length < 1 || questions.length > 20) {
      throw new Error("El reto debe tener entre 1 y 20 preguntas.");
    }
    questions.forEach((question, index) => {
      const prompt = String(question.prompt || "").trim();
      const options = Array.isArray(question.options)
        ? question.options.map((option) => String(option || "").trim())
        : [];
      if (!prompt || prompt.length > 1000) {
        throw new Error(`Completa el enunciado de la pregunta ${index + 1}.`);
      }
      if (options.filter(Boolean).length < 2 || options.length !== 4) {
        throw new Error(
          `La pregunta ${index + 1} necesita al menos dos opciones.`
        );
      }
      if (
        !Number.isInteger(question.correctIndex) ||
        question.correctIndex < 0 ||
        question.correctIndex > 3 ||
        !options[question.correctIndex]
      ) {
        throw new Error(
          `Selecciona una respuesta correcta disponible en la pregunta ${index + 1}.`
        );
      }
      if (String(question.explanation || "").trim().length > 1000) {
        throw new Error(
          `La explicación de la pregunta ${index + 1} no puede superar 1000 caracteres.`
        );
      }
    });
  } else {
    throw new Error("El tipo de contenido no es válido.");
  }

  const { data, error } = await supabase
    .from("class_learning_content")
    .insert({
      class_id: classId,
      created_by: uid,
      content_type: type,
      title,
      instructions,
      url,
      questions,
    })
    .select(
      "id,class_id,content_type,title,instructions,url,questions,created_at"
    )
    .single();
  if (error) throw error;
  return {
    id: data.id,
    type: data.content_type,
    title: data.title,
    instructions: data.instructions || "",
    url: data.url || "",
    questions: data.questions || [],
    createdAt: data.created_at,
  };
}

export async function deleteClassLearningContent(uid, classId, contentId) {
  await requireTeacherAccount(uid);
  const { error } = await supabase
    .from("class_learning_content")
    .delete()
    .eq("id", contentId)
    .eq("class_id", classId);
  if (error) throw error;
}

export async function joinCloudClass(uid, studentName, code) {
  await requireAccount(uid);
  const { data, error } = await supabase.rpc("join_class_by_code", {
    input_code: String(code || "").trim().toUpperCase(),
    input_student_name: String(studentName || "").trim(),
  });
  if (error) throw error;
  return {
    classId: data.class_id,
    className: data.class_name,
    description: data.class_description || "",
    subject: data.subject,
    code: data.code,
    teacherId: data.teacher_id,
  };
}

export async function getCloudEnrollments(uid) {
  await requireAccount(uid);
  const { data, error } = await supabase
    .from("class_enrollments")
    .select(
      "class_id,class_name,class_description,subject,code,teacher_id,joined_at"
    )
    .eq("student_id", uid)
    .order("joined_at", { ascending: false });
  if (error) throw error;
  return data.map((item) => ({
    classId: item.class_id,
    className: item.class_name,
    description: item.class_description || "",
    subject: item.subject,
    code: item.code,
    teacherId: item.teacher_id,
    joinedAt: item.joined_at,
  }));
}

export async function getCloudEnrollment(uid) {
  const enrollments = await getCloudEnrollments(uid);
  return enrollments[0] || null;
}

export async function getCloudResources(uid, classId) {
  await requireAccount(uid);
  const { data, error } = await supabase
    .from("class_resources")
    .select(
      "id,title,description,url,content_type,file_path,file_name,file_type,file_size,created_by,created_at"
    )
    .eq("class_id", classId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return Promise.all(data.map(withSignedFileUrl));
}

export async function getStudentClassContent(uid, classId) {
  await requireAccount(uid);
  const { data, error } = await supabase.rpc(
    "get_student_class_content",
    { input_class_id: classId }
  );
  if (error) throw error;
  return data.map((item) => ({
    id: item.id,
    type: item.content_type,
    title: item.title,
    instructions: item.instructions || "",
    url: item.url || "",
    questions: item.questions || [],
    completed: item.completed,
    correctAnswers: item.correct_answers,
    totalQuestions: item.total_questions,
    feedback: item.feedback || [],
  }));
}

export async function submitStudentClassQuiz(uid, quizId, answers) {
  await requireAccount(uid);
  const { data, error } = await supabase.rpc("submit_class_quiz", {
    input_quiz_id: quizId,
    input_answers: answers,
  });
  if (error?.code === "23505") {
    throw new Error(
      "Ya completaste este reto. Actualiza la clase para ver tu resultado."
    );
  }
  if (error) throw error;
  return {
    id: data.id,
    correctAnswers: data.correctAnswers,
    totalQuestions: data.totalQuestions,
    completedAt: data.completedAt,
    feedback: data.feedback,
  };
}

export async function createCloudResource(uid, classId, resource) {
  await requireAccount(uid);
  const title = String(resource.title || "").trim();
  const description = String(resource.description || "").trim();
  const url = String(resource.url || "").trim();
  const file = resource.file instanceof File ? resource.file : null;

  if (!title || title.length > 100) {
    throw new Error("El título debe tener entre 1 y 100 caracteres.");
  }
  if (description.length > 2000) {
    throw new Error("La descripción no puede superar 2000 caracteres.");
  }
  if (url) {
    try {
      if (new URL(url).protocol !== "https:") {
        throw new Error("El enlace debe comenzar con https://.");
      }
    } catch {
      throw new Error("Escribe un enlace seguro válido que comience con https://.");
    }
    if (url.length > 1000) {
      throw new Error("El enlace no puede superar 1000 caracteres.");
    }
  }

  if (!url && !description && !file) {
    throw new Error("Agrega texto, un enlace o un archivo al recurso.");
  }

  const allowedFileTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]);
  if (file && file.size > 5 * 1024 * 1024) {
    throw new Error("El archivo supera el límite de 5 MB.");
  }
  if (file && !allowedFileTypes.has(file.type)) {
    throw new Error(
      "Tipo no permitido. Sube PDF, imagen JPG/PNG/WEBP, texto o documento de Office."
    );
  }

  let filePath = null;
  if (file) {
    const safeFileName = file.name
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "_")
      .slice(-120);
    filePath = `${classId}/${uid}/${crypto.randomUUID()}-${safeFileName}`;
    const { error: uploadError } = await supabase.storage
      .from("class-resources")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) throw uploadError;
  }

  const payload = {
    class_id: classId,
    created_by: uid,
    title,
    description,
    url,
    content_type: file ? "file" : url ? "link" : "text",
    file_path: filePath,
    file_name: file?.name || null,
    file_type: file?.type || null,
    file_size: file?.size || null,
  };
  const { data, error } = await supabase
    .from("class_resources")
    .insert(payload)
    .select(
      "id,title,description,url,content_type,file_path,file_name,file_type,file_size,created_by,created_at"
    )
    .single();
  if (error) {
    if (filePath) {
      const { error: cleanupError } = await supabase.storage
        .from("class-resources")
        .remove([filePath]);
      if (cleanupError) {
        console.error("No se pudo limpiar el archivo tras fallar el recurso:", cleanupError);
      }
    }
    throw error;
  }
  return withSignedFileUrl(data);
}

export async function deleteCloudResource(uid, classId, resourceId) {
  await requireAccount(uid);
  const { data: resource, error: lookupError } = await supabase
    .from("class_resources")
    .select("file_path")
    .eq("id", resourceId)
    .eq("class_id", classId)
    .maybeSingle();
  if (lookupError) throw lookupError;

  const { error } = await supabase
    .from("class_resources")
    .delete()
    .eq("id", resourceId)
    .eq("class_id", classId);
  if (error) throw error;
  if (resource?.file_path) {
    const { error: storageError } = await supabase.storage
      .from("class-resources")
      .remove([resource.file_path]);
    if (storageError) {
      throw new Error(
        "El recurso se eliminó, pero no pudimos borrar su archivo del almacenamiento."
      );
    }
  }
}

export async function archiveCloudClass(uid, classId) {
  await requireAccount(uid);
  const { error } = await supabase
    .from("classes")
    .update({ archived: true })
    .eq("id", classId)
    .eq("teacher_id", uid);
  if (error) throw error;
}

export async function leaveCloudClass(uid, classId) {
  await requireAccount(uid);
  const { error: enrollmentError } = await supabase
    .from("class_enrollments")
    .delete()
    .eq("student_id", uid)
    .eq("class_id", classId);
  if (enrollmentError) throw enrollmentError;

  const { error: memberError } = await supabase
    .from("class_members")
    .delete()
    .eq("student_id", uid)
    .eq("class_id", classId);
  if (memberError) throw memberError;
}
