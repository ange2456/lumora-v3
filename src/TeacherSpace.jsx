import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Users,
  Plus,
  Copy,
  BookOpen,
  GraduationCap,
  Sparkles,
  Trash2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  BrainCircuit,
  Search,
  X,
} from "lucide-react";
import "./TeacherSpace.css";
import {
  addNotification,
  generateClassCode,
  getClasses,
  getProgress,
  saveClasses,
} from "./storage";

function getStudentProgress(progress, studentId) {
  const records = progress.filter((record) => record.studentId === studentId);
  const totals = records.reduce(
    (result, record) => {
      result.challenges += 1;
      result.correct += Number(record.correctAnswers) || 0;
      result.total += Number(record.totalQuestions) || 0;
      return result;
    },
    { challenges: 0, correct: 0, total: 0 }
  );

  return {
    ...totals,
    percentage: totals.total
      ? Math.round((totals.correct / totals.total) * 100)
      : 0,
  };
}

function ClassResourcesManager({ profile, classItem, readOnly = false }) {
  const [resources, setResources] = useState(classItem.resources || []);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function addResource(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const { createCloudResource } = await import("./cloudData");
      const resource = await createCloudResource(profile.id, classItem.id, {
        title,
        description,
        url,
        file,
      });
      setResources((previous) => [...previous, resource]);
      setTitle("");
      setDescription("");
      setUrl("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage("El recurso quedó guardado y ya está disponible para la clase.");
    } catch (error) {
      console.error("No se pudo guardar el recurso:", error);
      setMessage(error.message || "No se pudo guardar el recurso.");
    } finally {
      setBusy(false);
    }
  }

  async function removeResource(resourceId) {
    const resource = resources.find((item) => item.id === resourceId);
    if (
      !window.confirm(
        `¿Eliminar el recurso${resource ? ` "${resource.title}"` : ""}?`
      )
    ) {
      return;
    }
    setMessage("");
    try {
      const { deleteCloudResource } = await import("./cloudData");
      await deleteCloudResource(profile.id, classItem.id, resourceId);
      setResources((previous) =>
        previous.filter((resource) => resource.id !== resourceId)
      );
    } catch (error) {
      console.error("No se pudo eliminar el recurso:", error);
      setMessage("No se pudo eliminar el recurso. Inténtalo de nuevo.");
    }
  }

  return (
    <section className="teacher-resource-manager">
      <h4>Contenido y materiales de la clase</h4>
      {resources.length === 0 ? (
        <p className="teacher-resource-empty">Aún no hay recursos compartidos.</p>
      ) : (
        <ul className="teacher-resource-list">
          {resources.map((resource) => (
            <li key={resource.id}>
              <div>
                <strong>{resource.title}</strong>
                {resource.description && <p>{resource.description}</p>}
                {resource.url && (
                  <a href={resource.url} target="_blank" rel="noreferrer">
                    Abrir recurso
                  </a>
                )}
                {resource.fileUrl && (
                  <a href={resource.fileUrl} target="_blank" rel="noreferrer">
                    Abrir archivo: {resource.fileName}
                  </a>
                )}
              </div>
              {!readOnly && (
                <button
                  type="button"
                  className="teacher-delete-button"
                  onClick={() => removeResource(resource.id)}
                  aria-label={`Eliminar recurso ${resource.title}`}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!readOnly && (
        <form className="teacher-resource-form" onSubmit={addResource}>
          <label htmlFor={`resource-title-${classItem.id}`}>Título</label>
          <input
            id={`resource-title-${classItem.id}`}
            maxLength={100}
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Guía de fracciones"
          />
          <label htmlFor={`resource-description-${classItem.id}`}>
            Explicación o instrucciones
          </label>
          <textarea
            id={`resource-description-${classItem.id}`}
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Escribe una breve descripción para tus estudiantes."
            rows={3}
          />
          <label htmlFor={`resource-url-${classItem.id}`}>
            Enlace seguro (opcional)
          </label>
          <input
            id={`resource-url-${classItem.id}`}
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://..."
          />
          <label htmlFor={`resource-file-${classItem.id}`}>
            Archivo (PDF, imagen, texto o documento; máximo 5 MB)
          </label>
          <input
            ref={fileInputRef}
            id={`resource-file-${classItem.id}`}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          {file && (
            <small>
              Archivo seleccionado: {file.name} (
              {Math.max(1, Math.ceil(file.size / 1024))} KB)
            </small>
          )}
          <button className="teacher-copy-button" type="submit" disabled={busy}>
            {busy ? "Guardando..." : "Publicar contenido"}
          </button>
          {message && (
            <p className="teacher-message" role="status">
              {message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

function newQuestion() {
  return {
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  };
}

function ClassLearningContentManager({
  classItem,
  readOnly,
  onCreate,
  onDelete,
}) {
  const [activityTitle, setActivityTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [url, setUrl] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([newQuestion()]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submitActivity(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await onCreate(classItem.id, {
        type: "activity",
        title: activityTitle,
        instructions,
        url,
        questions: [],
      });
      setActivityTitle("");
      setInstructions("");
      setUrl("");
      setMessage("La actividad se compartió con la clase.");
    } catch (error) {
      setMessage(error.message || "No se pudo compartir la actividad.");
    } finally {
      setBusy(false);
    }
  }

  async function submitQuiz(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await onCreate(classItem.id, {
        type: "quiz",
        title: quizTitle,
        questions,
      });
      setQuizTitle("");
      setQuestions([newQuestion()]);
      setMessage("El reto quedó guardado en esta clase.");
    } catch (error) {
      setMessage(error.message || "No se pudo guardar el reto.");
    } finally {
      setBusy(false);
    }
  }

  async function removeContent(contentId) {
    setMessage("");
    try {
      await onDelete(classItem.id, contentId);
    } catch (error) {
      setMessage(error.message || "No se pudo eliminar el contenido.");
    }
  }

  function updateQuestion(index, update) {
    setQuestions((previous) =>
      previous.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...update } : question
      )
    );
  }

  function updateOption(questionIndex, optionIndex, value) {
    setQuestions((previous) =>
      previous.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentIndex) =>
                currentIndex === optionIndex ? value : option
              ),
            }
          : question
      )
    );
  }

  const activities = (classItem.classContent || []).filter(
    (content) => content.type === "activity"
  );
  const quizzes = (classItem.classContent || []).filter(
    (content) => content.type === "quiz"
  );

  return (
    <div className="teacher-learning-content">
      <section className="teacher-detail-section">
        <h3>
          <ClipboardList size={17} />
          Actividades de la clase
          <span className="teacher-content-count">{activities.length}</span>
        </h3>
        {!readOnly && (
          <form className="teacher-learning-form" onSubmit={submitActivity}>
            <input
              aria-label="Título de la actividad"
              maxLength={100}
              required
              value={activityTitle}
              onChange={(event) => setActivityTitle(event.target.value)}
              placeholder="Título de la actividad"
            />
            <textarea
              aria-label="Instrucciones de la actividad"
              maxLength={2000}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Instrucciones (opcional)"
              rows={3}
            />
            <input
              aria-label="Enlace al recurso"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Enlace al recurso (opcional, https://)"
            />
            <button
              type="submit"
              className="teacher-create-button"
              disabled={busy}
            >
              <Plus size={16} />
              Compartir actividad
            </button>
          </form>
        )}
        {activities.length === 0 ? (
          <p className="teacher-learning-empty">
            Aún no has compartido actividades en esta clase.
          </p>
        ) : (
          <ul className="teacher-learning-list">
            {activities.map((activity) => (
              <li key={activity.id}>
                <div>
                  <strong>{activity.title}</strong>
                  {activity.instructions && <p>{activity.instructions}</p>}
                  {activity.url && (
                    <a href={activity.url} target="_blank" rel="noreferrer">
                      Abrir recurso
                    </a>
                  )}
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    className="teacher-delete-button"
                    onClick={() => removeContent(activity.id)}
                    aria-label={`Eliminar actividad ${activity.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="teacher-detail-section">
        <h3>
          <BrainCircuit size={17} />
          Retos con preguntas
          <span className="teacher-content-count">{quizzes.length}</span>
        </h3>
        {!readOnly && (
          <form className="teacher-learning-form" onSubmit={submitQuiz}>
            <strong>Crear un reto con preguntas</strong>
            <input
              aria-label="Título del reto"
              maxLength={100}
              required
              value={quizTitle}
              onChange={(event) => setQuizTitle(event.target.value)}
              placeholder="Título del reto (Ej. Fracciones básicas)"
            />
            {questions.map((question, questionIndex) => (
              <fieldset className="teacher-question-editor" key={questionIndex}>
                <legend>Pregunta {questionIndex + 1}</legend>
                <textarea
                  aria-label={`Enunciado de pregunta ${questionIndex + 1}`}
                  maxLength={1000}
                  required
                  value={question.prompt}
                  onChange={(event) =>
                    updateQuestion(questionIndex, {
                      prompt: event.target.value,
                    })
                  }
                  placeholder="Escribe la pregunta"
                  rows={2}
                />
                {question.options.map((option, optionIndex) => (
                  <label
                    className="teacher-answer-option"
                    key={optionIndex}
                    htmlFor={`answer-${questionIndex}-${optionIndex}`}
                  >
                    <input
                      id={`correct-${questionIndex}-${optionIndex}`}
                      type="radio"
                      name={`correct-answer-${questionIndex}`}
                      checked={question.correctIndex === optionIndex}
                      onChange={() =>
                        updateQuestion(questionIndex, {
                          correctIndex: optionIndex,
                        })
                      }
                    />
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    <input
                      id={`answer-${questionIndex}-${optionIndex}`}
                      aria-label={`Opción ${String.fromCharCode(65 + optionIndex)} de pregunta ${questionIndex + 1}`}
                      maxLength={300}
                      required={optionIndex < 2}
                      value={option}
                      onChange={(event) =>
                        updateOption(
                          questionIndex,
                          optionIndex,
                          event.target.value
                        )
                      }
                      placeholder={`Opción ${String.fromCharCode(65 + optionIndex)}${optionIndex > 1 ? " (opcional)" : ""}`}
                    />
                  </label>
                ))}
                <small>
                  Marca el círculo de la respuesta correcta. Las opciones C y D
                  son opcionales.
                </small>
                <textarea
                  aria-label={`Explicación de pregunta ${questionIndex + 1}`}
                  maxLength={1000}
                  value={question.explanation}
                  onChange={(event) =>
                    updateQuestion(questionIndex, {
                      explanation: event.target.value,
                    })
                  }
                  placeholder="Explicación para el estudiante (opcional)"
                  rows={2}
                />
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="teacher-question-remove"
                    onClick={() =>
                      setQuestions((previous) =>
                        previous.filter((_, index) => index !== questionIndex)
                      )
                    }
                  >
                    Quitar pregunta
                  </button>
                )}
              </fieldset>
            ))}
            <button
              type="button"
              className="teacher-secondary-button"
              disabled={questions.length >= 20}
              onClick={() =>
                setQuestions((previous) => [...previous, newQuestion()])
              }
            >
              <Plus size={16} />
              Agregar pregunta
            </button>
            <button
              type="submit"
              className="teacher-create-button"
              disabled={busy}
            >
              <BrainCircuit size={16} />
              Publicar reto ({questions.length} preguntas)
            </button>
          </form>
        )}
        {quizzes.length === 0 ? (
          <p className="teacher-learning-empty">
            Aún no has publicado retos con preguntas.
          </p>
        ) : (
          <ul className="teacher-learning-list">
            {quizzes.map((quiz) => (
              <li key={quiz.id}>
                <div>
                  <strong>{quiz.title}</strong>
                  <p>
                    {quiz.questions.length}{" "}
                    {quiz.questions.length === 1 ? "pregunta" : "preguntas"}
                  </p>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    className="teacher-delete-button"
                    onClick={() => removeContent(quiz.id)}
                    aria-label={`Eliminar reto ${quiz.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      {message && (
        <p className="teacher-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

function ClassDetailsModal({
  item,
  profile,
  cloudAccount,
  progress,
  onClose,
  onCopyCode,
  onCreateContent,
  onDeleteContent,
}) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="teacher-modal-backdrop">
      <section
        className="teacher-class-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="teacher-class-modal-title"
      >
        <button
          type="button"
          className="teacher-modal-close"
          onClick={onClose}
          aria-label="Cerrar detalles de la clase"
        >
          <X size={20} />
        </button>
        <div className="teacher-modal-icon">
          <BookOpen size={22} />
        </div>
        {item.archived && (
          <span className="teacher-archived-badge">Archivada · solo lectura</span>
        )}
        <span className="teacher-modal-kicker">DETALLES DE LA CLASE</span>
        <h2 id="teacher-class-modal-title">{item.name}</h2>
        <p className="teacher-modal-subtitle">{item.subject}</p>
        <div className="teacher-class-facts">
          <div>
            <span>Código de acceso</span>
            <strong>{item.archived ? "Desactivado" : item.code}</strong>
            {!item.archived && (
              <button
                type="button"
                className="teacher-secondary-button"
                onClick={() => onCopyCode(item.code)}
              >
                <Copy size={15} />
                Copiar código
              </button>
            )}
          </div>
          <div>
            <Users size={17} />
            <span>Estudiantes registrados</span>
            <strong>{item.students.length}</strong>
          </div>
          <div>
            <CalendarDays size={17} />
            <span>Fecha de creación</span>
            <strong>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("es-CO")
                : "—"}
            </strong>
          </div>
        </div>
        <ClassLearningContentManager
          classItem={item}
          readOnly={item.archived}
          onCreate={onCreateContent}
          onDelete={onDeleteContent}
        />
        {cloudAccount && (
          <ClassResourcesManager
            profile={profile}
            classItem={item}
            readOnly={item.archived}
          />
        )}
        <div className="teacher-modal-students">
          <h3>
            <Users size={17} />
            Estudiantes de la clase
          </h3>
          {item.students.length === 0 ? (
            <p>Aún nadie se ha unido con este código.</p>
          ) : (
            <ul>
              {item.students.map((student) => {
                const stats = cloudAccount
                  ? student
                  : getStudentProgress(progress, student.id);
                return (
                  <li key={student.id}>
                    <strong>{student.name || "Estudiante"}</strong>
                    <span>
                      {stats.challenges}{" "}
                      {stats.challenges === 1 ? "reto" : "retos"}
                      {stats.challenges > 0
                        ? ` · ${stats.percentage}% de aciertos`
                        : " · sin retos todavía"}
                    </span>
                    {cloudAccount && student.attempts?.length > 0 && (
                      <details className="teacher-student-progress">
                        <summary>Ver historial de retos</summary>
                        <ul>
                          {student.attempts.map((attempt) => (
                            <li key={attempt.id}>
                              <strong>{attempt.activity}</strong>
                              <small>
                                {new Date(
                                  attempt.completedAt
                                ).toLocaleDateString("es-CO")}
                                {" · "}
                                {attempt.correctAnswers}/
                                {attempt.totalQuestions} aciertos
                                {" · "}
                                {attempt.mistakes} errores
                              </small>
                              {attempt.adaptedSkill && (
                                <small>
                                  Refuerzo: {attempt.adaptedSkill}
                                </small>
                              )}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    {cloudAccount && student.quizAttempts?.length > 0 && (
                      <details className="teacher-student-progress">
                        <summary>Ver resultados de retos de clase</summary>
                        <ul>
                          {student.quizAttempts.map((attempt) => (
                            <li key={attempt.id}>
                              <strong>{attempt.title}</strong>
                              <small>
                                {new Date(
                                  attempt.completedAt
                                ).toLocaleDateString("es-CO")}
                                {" · "}
                                {attempt.correctAnswers}/
                                {attempt.totalQuestions} aciertos
                              </small>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default function TeacherSpace({
  onBack,
  cloudAccount = false,
  profile,
}) {
  const [classes, setClasses] = useState(() =>
    cloudAccount ? [] : getClasses()
  );
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("Matemáticas");
  const [classDescription, setClassDescription] = useState("");
  const [message, setMessage] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [loading, setLoading] = useState(cloudAccount);
  const [loadError, setLoadError] = useState("");
  const progress = cloudAccount ? [] : getProgress();
  const visibleClasses = classes.filter((item) =>
    [item.name, item.subject, item.code]
      .join(" ")
      .toLocaleLowerCase("es")
      .includes(classSearch.trim().toLocaleLowerCase("es"))
  );
  const selectedClass = classes.find((item) => item.id === selectedClassId);

  useEffect(() => {
    if (!cloudAccount || !profile?.id) return undefined;

    let active = true;
    import("./cloudData")
      .then(({ getTeacherDashboard }) => getTeacherDashboard(profile.id))
      .then((dashboard) => {
        if (active) {
          setClasses(dashboard);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("No se pudieron cargar las clases docentes:", error);
        if (active) {
          setLoadError(error.message || "No pudimos cargar tus clases.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [cloudAccount, profile?.id]);

  async function refreshClasses() {
    setLoadError("");
    setLoading(true);
    try {
      if (cloudAccount) {
        const { getTeacherDashboard } = await import("./cloudData");
        setClasses(await getTeacherDashboard(profile.id));
      } else {
        setClasses(getClasses());
      }
    } catch (error) {
      console.error("No se pudieron actualizar las clases:", error);
      setLoadError(error.message || "No pudimos actualizar tus clases.");
    } finally {
      setLoading(false);
    }
  }

  async function createClass(event) {
    event.preventDefault();

    if (!className.trim()) {
      setMessage("Escribe el nombre de la clase.");
      return;
    }

    if (cloudAccount) {
      try {
        const { createCloudClass } = await import("./cloudData");
        const newClass = await createCloudClass(profile.id, {
          name: className,
          subject,
          description: classDescription,
        });
        setClasses((previous) => [...previous, newClass]);
        setClassName("");
        setSubject("Matemáticas");
        setClassDescription("");
        setMessage("¡Tu clase se creó y ya puedes compartir el código!");
      } catch (error) {
        console.error("No se pudo crear la clase:", error);
        setMessage(error.message || "No se pudo crear la clase.");
      }
      return;
    }

    const newClass = {
      id: Date.now(),
      name: className.trim(),
      subject,
      description: classDescription.trim(),
      code: generateClassCode(classes.map((item) => item.code)),
      students: [],
      resources: [],
      classContent: [],
      createdAt: new Date().toISOString(),
    };

    const updatedClasses = [...classes, newClass];

    try {
      saveClasses(updatedClasses);
      addNotification({
        title: "Clase creada",
        message: `${newClass.name} quedó lista. El código es ${newClass.code}.`,
      });
      setClasses(updatedClasses);
      setClassName("");
      setSubject("Matemáticas");
      setClassDescription("");
      setMessage("¡Tu clase se creó correctamente!");
    } catch {
      setMessage("No se pudo guardar la clase en este navegador.");
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setMessage(`Código ${code} copiado.`);
    } catch {
      setMessage(`Tu código es: ${code}. Puedes copiarlo manualmente.`);
    }
  }

  async function createClassContent(classId, content) {
    let savedContent;
    if (cloudAccount) {
      const { createClassLearningContent } = await import("./cloudData");
      savedContent = await createClassLearningContent(
        profile.id,
        classId,
        content
      );
    } else {
      if (!content.title.trim()) {
        throw new Error("Escribe un título para el contenido.");
      }
      if (
        content.type === "activity" &&
        !content.instructions.trim() &&
        !content.url.trim()
      ) {
        throw new Error("Agrega instrucciones o un enlace para la actividad.");
      }
      if (
        content.type === "quiz" &&
        (content.questions.length < 1 || content.questions.length > 20)
      ) {
        throw new Error("El reto debe tener entre 1 y 20 preguntas.");
      }
      if (
        content.type === "quiz" &&
        content.questions.some(
          (question) =>
            !question.prompt.trim() ||
            question.options.filter((option) => option.trim()).length < 2 ||
            !question.options[question.correctIndex]?.trim()
        )
      ) {
        throw new Error(
          "Completa cada pregunta y marca una respuesta correcta disponible."
        );
      }
      savedContent = {
        id: crypto.randomUUID(),
        ...content,
        title: content.title.trim(),
        instructions: String(content.instructions || "").trim(),
        url: String(content.url || "").trim(),
        createdAt: new Date().toISOString(),
      };
    }

    const updatedClasses = classes.map((item) =>
      item.id === classId
        ? {
            ...item,
            classContent: [...(item.classContent || []), savedContent],
          }
        : item
    );
    if (!cloudAccount) saveClasses(updatedClasses);
    setClasses(updatedClasses);
    return savedContent;
  }

  async function deleteClassContent(classId, contentId) {
    if (!window.confirm("¿Eliminar este contenido de la clase?")) return;
    if (cloudAccount) {
      const { deleteClassLearningContent } = await import("./cloudData");
      await deleteClassLearningContent(profile.id, classId, contentId);
    }
    const updatedClasses = classes.map((item) =>
      item.id === classId
        ? {
            ...item,
            classContent: (item.classContent || []).filter(
              (content) => content.id !== contentId
            ),
          }
        : item
    );
    if (!cloudAccount) saveClasses(updatedClasses);
    setClasses(updatedClasses);
  }

  async function removeClass(classId) {
    if (
      !window.confirm(
        "¿Archivar esta clase? El código dejará de funcionar y conservarás sus recursos e historial."
      )
    ) {
      return;
    }
    if (cloudAccount) {
      try {
        const { archiveCloudClass } = await import("./cloudData");
        await archiveCloudClass(profile.id, classId);
        setClasses((previous) =>
          previous.map((item) =>
            item.id === classId ? { ...item, archived: true } : item
          )
        );
        setMessage("La clase se archivó y su código dejó de estar activo.");
      } catch (error) {
        console.error("No se pudo eliminar la clase:", error);
        setMessage("No se pudo eliminar la clase. Inténtalo de nuevo.");
      }
      return;
    }

    const archivedClasses = getClasses().map((item) =>
      item.id === classId ? { ...item, archived: true } : item
    );
    saveClasses(archivedClasses);
    setClasses(archivedClasses);
    setMessage("La clase se archivó y su código dejó de estar activo.");
  }

  return (
    <main className="teacher-page">
      <div className="teacher-container">
        <button className="teacher-back" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver a Lumora
        </button>

        <header className="teacher-heading">
          <span className="teacher-kicker">
            <Sparkles size={15} />
            ESPACIO DOCENTE
          </span>

          <h1>Enseña, acompaña e inspira.</h1>

          <p>
            Crea una clase, comparte el código y consulta cómo avanza cada
            estudiante que se une.
          </p>
        </header>

        <section className="teacher-welcome">
          <div>
            <span>{cloudAccount ? "TU INSTITUCIÓN" : "BIENVENIDO A TU ESPACIO"}</span>
            <h2>
              {cloudAccount
                ? profile?.institution || "Institución docente"
                : "Tus clases, en un solo lugar"}
            </h2>
            <p>
              {cloudAccount
                ? profile?.countryCity || "País o ciudad no registrado"
                : "El código permite que tus estudiantes se unan desde Inicio o Explorar recursos."}
            </p>
          </div>

          <div className="teacher-welcome-icon">
            <GraduationCap size={42} />
          </div>
        </section>

        <div className="teacher-layout">
          <section className="teacher-form-card">
            <div className="teacher-section-heading">
              <span className="teacher-icon-box">
                <Plus size={22} />
              </span>
              <div>
                <h2>Crear una clase</h2>
                <p>Configura tu nuevo grupo de aprendizaje.</p>
              </div>
            </div>

            <form onSubmit={createClass}>
              <label htmlFor="className">Nombre de la clase</label>
              <input
                id="className"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder="Ej. Programación básica"
                maxLength={70}
              />

              <label htmlFor="subject">Asignatura</label>
              <select
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              >
                <option>Matemáticas</option>
                <option>Programación</option>
                <option>Ciencias</option>
                <option>Lectura y escritura</option>
                <option>Otra asignatura</option>
              </select>
              <label htmlFor="classDescription">
                Descripción e indicaciones (opcional)
              </label>
              <textarea
                id="classDescription"
                maxLength={2000}
                value={classDescription}
                onChange={(event) =>
                  setClassDescription(event.target.value)
                }
                placeholder="Cuenta a los estudiantes qué aprenderán en esta clase."
                rows={3}
              />

              <button className="teacher-create-button" type="submit">
                <Plus size={18} />
                Crear clase
              </button>

              {message && (
                <p className="teacher-message" role="status">
                  {message}
                </p>
              )}
              {loadError && (
                <p className="teacher-message" role="alert">
                  {loadError}
                </p>
              )}
            </form>
          </section>

          <section className="teacher-classes-card">
            <div className="teacher-section-heading">
              <span className="teacher-icon-box teacher-icon-green">
                <BookOpen size={22} />
              </span>
              <div>
                <h2>Mis clases</h2>
                <p>
                  {classes.length}{" "}
                  {classes.length === 1 ? "clase creada" : "clases creadas"}
                </p>
              </div>
              <button
                type="button"
                className="teacher-copy-button"
                onClick={refreshClasses}
                disabled={loading}
              >
                Actualizar
              </button>
            </div>

            {loading ? (
              <div className="teacher-empty" role="status">
                Cargando tus clases...
              </div>
            ) : loadError ? (
              <div className="teacher-empty" role="alert">
                {loadError}
              </div>
            ) : classes.length === 0 ? (
              <div className="teacher-empty">
                <Users size={34} />
                <h3>Aún no tienes clases</h3>
                <p>
                  Cuando crees tu primera clase, aparecerá aquí con su
                  código para compartir.
                </p>
              </div>
            ) : (
              <>
                <label className="teacher-search">
                  <Search size={17} />
                  <input
                    value={classSearch}
                    onChange={(event) => setClassSearch(event.target.value)}
                    placeholder="Buscar por nombre, asignatura o código..."
                    aria-label="Buscar clases"
                  />
                </label>
                {visibleClasses.length === 0 ? (
                  <div className="teacher-empty">
                    No encontramos clases que coincidan con tu búsqueda.
                  </div>
                ) : (
                  <div className="teacher-class-list">
                    {visibleClasses.map((item) => (
                  <article className="teacher-class-item" key={item.id}>
                    <div className="teacher-class-top">
                      <div>
                        <h3>{item.name}</h3>
                        <span>{item.subject}</span>
                        {item.description && <p>{item.description}</p>}
                      </div>
                      {item.archived && (
                        <span className="teacher-archived-badge">
                          Archivada
                        </span>
                      )}
                      <span className="teacher-student-count">
                        <Users size={15} />
                        {item.students.length}
                      </span>
                    </div>

                    <div className="teacher-code-row">
                      <div>
                        <span>
                          {item.archived
                            ? "CÓDIGO DESACTIVADO"
                            : "CÓDIGO DE CLASE"}
                        </span>
                        <strong>
                          {item.archived ? "Archivada" : item.code}
                        </strong>
                      </div>

                      <div className="teacher-class-actions">
                        {!item.archived && (
                          <>
                            <button
                              type="button"
                              className="teacher-copy-button"
                              onClick={() => copyCode(item.code)}
                              aria-label={`Copiar código ${item.code}`}
                            >
                              <Copy size={17} />
                              Copiar
                            </button>
                          </>
                        )}
                        {!item.archived && (
                          <button
                            type="button"
                            className="teacher-delete-button"
                            onClick={() => removeClass(item.id)}
                            aria-label={`Archivar clase ${item.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="teacher-class-footer">
                      <span>
                        <CalendarDays size={15} />
                        {new Date(item.createdAt).toLocaleDateString("es-CO")}
                      </span>
                      <button
                        type="button"
                        className="teacher-details-button"
                        onClick={() => setSelectedClassId(item.id)}
                      >
                        Ver detalles
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <p className="teacher-note">
          <Sparkles size={16} />
          Cada estudiante aprende a su ritmo. Lumora te ayuda a acompañar
          ese proceso.
        </p>
      </div>
      {selectedClass && (
        <ClassDetailsModal
          item={selectedClass}
          profile={profile}
          cloudAccount={cloudAccount}
          progress={progress}
          onClose={() => setSelectedClassId(null)}
          onCopyCode={copyCode}
          onCreateContent={createClassContent}
          onDeleteContent={deleteClassContent}
        />
      )}
    </main>
  );
}
