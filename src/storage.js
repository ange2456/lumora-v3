
const KEYS = {
  progress: "lumoraProgress",
  classes: "lumoraClasses",
  enrollment: "lumoraEnrollment",
  profile: "lumoraProfile",
  notifications: "lumoraNotifications",
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(`No se pudo leer ${key}:`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile() {
  const saved = readJson(KEYS.profile, null);

  if (
    saved &&
    typeof saved === "object" &&
    saved.id
  ) {
    return {
      id: String(saved.id),
      name:
        typeof saved.name === "string"
          ? saved.name.trim()
          : "",
      ...(typeof saved.email === "string"
        ? { email: saved.email.trim().toLowerCase() }
        : {}),
      ...(saved.role === "teacher" ||
      saved.role === "student" ||
      saved.role === "pending_teacher"
        ? { role: saved.role }
        : {}),
      ...(typeof saved.institution === "string"
        ? { institution: saved.institution.trim() }
        : {}),
      ...(typeof saved.countryCity === "string"
        ? { countryCity: saved.countryCity.trim() }
        : {}),
    };
  }

  const profile = {
    id: `lumora-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    name: "",
  };

  writeJson(KEYS.profile, profile);
  return profile;
}

export function saveProfile(profile) {
  if (!profile || typeof profile !== "object") {
    throw new Error("El perfil no es válido.");
  }

  const current = {
    id: String(profile.id || getProfile().id),
    name:
      typeof profile.name === "string"
        ? profile.name.trim()
        : "",
    ...(typeof profile.email === "string"
      ? { email: profile.email.trim().toLowerCase() }
      : {}),
    ...(profile.role === "teacher" ||
    profile.role === "student" ||
    profile.role === "pending_teacher"
      ? { role: profile.role }
      : {}),
    ...(typeof profile.institution === "string"
      ? { institution: profile.institution.trim() }
      : {}),
    ...(typeof profile.countryCity === "string"
      ? { countryCity: profile.countryCity.trim() }
      : {}),
  };

  writeJson(KEYS.profile, current);
  return current;
}

export function getProgress() {
  const saved = readJson(KEYS.progress, []);

  if (!Array.isArray(saved)) {
    return [];
  }

  return saved.filter(
    (record) =>
      record && typeof record === "object"
  );
}

export function saveProgressRecord(record) {
  if (!record || typeof record !== "object") {
    throw new Error("El resultado del reto no es válido.");
  }

  const profile = getProfile();

  const newRecord = {
    ...record,
    studentId: record.studentId || profile.id,
    studentName:
      record.studentName || profile.name || "Estudiante",
  };

  const records = [...getProgress(), newRecord];

  writeJson(KEYS.progress, records);

  return newRecord;
}

function normalizeClass(item) {
  const students = Array.isArray(item.students)
    ? item.students
    : [];

  return {
    ...item,
    code: String(item.code || "").trim().toUpperCase(),
    students,
  };
}

export function getClasses() {
  const saved = readJson(KEYS.classes, []);

  if (!Array.isArray(saved)) {
    return [];
  }

  return saved
    .filter((item) => item && typeof item === "object")
    .map(normalizeClass);
}

export function saveClasses(classes) {
  if (!Array.isArray(classes)) {
    throw new Error("La lista de clases no es válida.");
  }

  const normalized = classes.map(normalizeClass);

  writeJson(KEYS.classes, normalized);

  return normalized;
}

export function generateClassCode(existingCodes = []) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const used = new Set(
    existingCodes.map((code) =>
      String(code).trim().toUpperCase()
    )
  );

  for (let attempt = 0; attempt < 100; attempt += 1) {
    let code = "";

    for (let index = 0; index < 6; index += 1) {
      code += chars[
        Math.floor(Math.random() * chars.length)
      ];
    }

    if (!used.has(code)) {
      return code;
    }
  }

  throw new Error(
    "No se pudo generar un código único. Inténtalo de nuevo."
  );
}

export function getEnrollment() {
  const saved = readJson(KEYS.enrollment, null);

  if (
    !saved ||
    typeof saved !== "object" ||
    !saved.code
  ) {
    return null;
  }

  return saved;
}

export function saveEnrollment(enrollment) {
  if (
    !enrollment ||
    typeof enrollment !== "object" ||
    !enrollment.code
  ) {
    throw new Error("La inscripción no es válida.");
  }

  const normalized = {
    ...enrollment,
    code: String(enrollment.code).trim().toUpperCase(),
  };

  writeJson(KEYS.enrollment, normalized);

  return normalized;
}

export function clearEnrollment() {
  localStorage.removeItem(KEYS.enrollment);
}

export function joinClassByCode(code, student = getProfile()) {
  const normalizedCode = String(code || "")
    .trim()
    .toUpperCase();

  if (!normalizedCode) {
    return {
      ok: false,
      message: "Escribe el código de la clase.",
    };
  }

  if (!student || !student.id) {
    return {
      ok: false,
      message: "No se encontró el perfil del estudiante.",
    };
  }

  const classes = getClasses();

  const index = classes.findIndex(
    (item) => item.code === normalizedCode && !item.archived
  );

  if (index === -1) {
    return {
      ok: false,
      message:
        "No encontramos una clase con ese código en este navegador.",
    };
  }

  const current = classes[index];

  const alreadyJoined = current.students.some(
    (item) => String(item.id) === String(student.id)
  );

  if (!alreadyJoined) {
    current.students = [
      ...current.students,
      {
        id: String(student.id),
        name: student.name || "Estudiante",
        joinedAt: new Date().toISOString(),
      },
    ];

    classes[index] = current;
    saveClasses(classes);
  }

  const enrollment = {
    studentId: String(student.id),
    classId: current.id,
    className: current.name,
    subject: current.subject,
    code: current.code,
    joinedAt: new Date().toISOString(),
  };

  saveEnrollment(enrollment);

  addNotification({
    title: "Te uniste a una clase",
    message: `Ahora formas parte de ${current.name}.`,
  });

  return {
    ok: true,
    enrollment,
    message: `Te uniste a ${current.name}.`,
  };
}

export function leaveClass(studentId) {
  const enrollment = getEnrollment();

  if (!enrollment) {
    return;
  }

  const activeStudentId =
    studentId || enrollment.studentId || getProfile().id;

  const classes = getClasses().map((item) => {
    if (String(item.id) !== String(enrollment.classId)) {
      return item;
    }

    return {
      ...item,
      students: item.students.filter(
        (student) =>
          String(student.id) !== String(activeStudentId)
      ),
    };
  });

  saveClasses(classes);
  clearEnrollment();
}

export function deleteClassById(classId) {
  const remaining = getClasses().filter(
    (item) => String(item.id) !== String(classId)
  );

  saveClasses(remaining);

  const enrollment = getEnrollment();

  if (
    enrollment &&
    String(enrollment.classId) === String(classId)
  ) {
    clearEnrollment();
  }

  return remaining;
}

export function getNotifications() {
  const saved = readJson(KEYS.notifications, []);

  return Array.isArray(saved) ? saved : [];
}

export function addNotification({ title, message }) {
  const list = [
    {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    },
    ...getNotifications(),
  ].slice(0, 20);

  writeJson(KEYS.notifications, list);

  return list;
}

export function markNotificationsRead() {
  const list = getNotifications().map((item) => ({
    ...item,
    read: true,
  }));

  writeJson(KEYS.notifications, list);

  return list;
}
