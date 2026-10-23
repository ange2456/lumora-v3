
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Target,
  Trophy,
  ChartNoAxesColumnIncreasing,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Users,
} from "lucide-react";
import "./Progress.css";
import {
  getEnrollment,
  getProgress,
  getProfile,
  leaveClass,
} from "./storage";

function getStudentRecords() {
  const profile = getProfile();
  return getProgress().filter(
    (record) => String(record.studentId) === String(profile.id)
  );
}

function getNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function getRecordStats(record) {
  const totalQuestions = getNumber(record.totalQuestions);
  const correctAnswers = Math.min(
    getNumber(record.correctAnswers),
    totalQuestions
  );

  const mistakes =
    record.mistakes !== undefined &&
    record.mistakes !== null
      ? getNumber(record.mistakes)
      : Math.max(0, totalQuestions - correctAnswers);

  const percentage = totalQuestions
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  return {
    totalQuestions,
    correctAnswers,
    mistakes,
    percentage,
  };
}

function formatDate(date) {
  if (!date) return "Fecha no disponible";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha no disponible";
  }

  return parsedDate.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getRecommendation(totalChallenges, percentage, weakestSkill) {
  if (totalChallenges === 0) {
    return {
      title: "Tu camino comienza aquí",
      message:
        "Cada reto será una oportunidad para aprender, descubrir tus habilidades y ganar confianza.",
      action: "Comienza explorando una actividad.",
      icon: Sparkles,
    };
  }

  if (weakestSkill) {
    return {
      title: "Practiquemos un tema paso a paso",
      message: `Tus respuestas muestran que ${weakestSkill.skillName.toLowerCase()} merece un poco más de práctica. Cada intento te ayuda a avanzar.`,
      action: "Vuelve a la actividad para practicar este tema.",
      icon: Target,
    };
  }

  if (percentage < 60) {
    return {
      title: "Vamos paso a paso",
      message:
        "Los errores también forman parte del aprendizaje. Repasa las explicaciones y practica con calma antes de avanzar.",
      action: "Vuelve a practicar los temas que te resultaron difíciles.",
      icon: Target,
    };
  }

  if (percentage < 80) {
    return {
      title: "Estás avanzando",
      message:
        "Ya tienes una buena base. Con un poco más de práctica podrás comprender mejor los temas y fortalecer tus conocimientos.",
      action: "Intenta otro reto para afianzar lo aprendido.",
      icon: TrendingUp,
    };
  }

  return {
    title: "¡Vas por buen camino!",
    message:
      "Tus resultados muestran un buen desempeño. Sigue explorando nuevos desafíos y aplica lo aprendido en situaciones diferentes.",
    action: "Atrévete a resolver un reto de mayor dificultad.",
    icon: Trophy,
  };
}

export default function Progress({
  onBack,
  onExplore,
  onEnrollmentChange,
  cloudAccount = false,
  profile,
}) {
  const [records, setRecords] = useState(() =>
    cloudAccount ? [] : getStudentRecords()
  );
  const [enrollments, setEnrollments] = useState(() => {
    const localEnrollment = cloudAccount ? null : getEnrollment();
    return localEnrollment ? [localEnrollment] : [];
  });
  const [enrollment, setEnrollment] = useState(() =>
    cloudAccount ? null : getEnrollment()
  );
  const [loading, setLoading] = useState(cloudAccount);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!cloudAccount || !profile?.id) return undefined;

    let active = true;
    import("./cloudData")
      .then(({ getCloudProgress, getCloudEnrollments }) =>
        Promise.all([
          getCloudProgress(profile.id),
          getCloudEnrollments(profile.id),
        ])
      )
      .then(([cloudRecords, cloudEnrollments]) => {
        if (!active) return;
        setRecords(cloudRecords);
        setEnrollments(cloudEnrollments);
        setEnrollment(cloudEnrollments[0] || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("No se pudo cargar tu progreso:", error);
        if (active) {
          setLoadError(true);
          setActionError(
            "No pudimos cargar tu progreso. Revisa tu conexión e inténtalo de nuevo."
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [cloudAccount, profile?.id]);

  const skillStats = useMemo(() => {
    const grouped = new Map();

    records.forEach((record) => {
      if (!Array.isArray(record.skillResults)) return;

      record.skillResults.forEach((result) => {
        if (!result || !result.skillId) return;

        const current = grouped.get(result.skillId) || {
          skillId: result.skillId,
          skillName: result.skillName || "Habilidad por reforzar",
          mistakes: 0,
          latestCorrect: true,
        };
        if (!result.correct) current.mistakes += 1;
        current.skillName = result.skillName || current.skillName;
        current.latestCorrect = result.correct;
        grouped.set(result.skillId, current);
      });
    });

    return [...grouped.values()]
      .filter((skill) => !skill.latestCorrect)
      .sort((first, second) => second.mistakes - first.mistakes);
  }, [records]);

  const attemptChanges = useMemo(() => {
    const previousScores = new Map();
    const changes = new Map();

    records.forEach((record) => {
      const activityKey = record.activityKey || record.activity || "Reto";
      const previousScore = previousScores.get(activityKey);
      const currentScore = getRecordStats(record).percentage;
      if (previousScore !== undefined) {
        changes.set(record, currentScore - previousScore);
      }

      previousScores.set(activityKey, currentScore);
    });

    return changes;
  }, [records]);

  const stats = useMemo(() => {
    const totalChallenges = records.length;

    const totals = records.reduce(
      (result, record) => {
        const current = getRecordStats(record);

        result.totalQuestions += current.totalQuestions;
        result.correctAnswers += current.correctAnswers;
        result.mistakes += current.mistakes;

        return result;
      },
      {
        totalQuestions: 0,
        correctAnswers: 0,
        mistakes: 0,
      }
    );

    const percentage = totals.totalQuestions
      ? Math.round(
          (totals.correctAnswers / totals.totalQuestions) * 100
        )
      : 0;

    return {
      totalChallenges,
      ...totals,
      percentage,
    };
  }, [records]);

  const recommendation = getRecommendation(
    stats.totalChallenges,
    stats.percentage,
    skillStats[0]
  );

  const RecommendationIcon = recommendation.icon;

  const subjectStats = useMemo(() => {
    const grouped = records.reduce((result, record) => {
      const name = record.activity || "Reto";
      const current = getRecordStats(record);

      if (!result[name]) {
        result[name] = {
          activity: name,
          totalQuestions: 0,
          correctAnswers: 0,
        };
      }

      result[name].totalQuestions += current.totalQuestions;
      result[name].correctAnswers += current.correctAnswers;
      return result;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        percentage: item.totalQuestions
          ? Math.round((item.correctAnswers / item.totalQuestions) * 100)
          : 0,
      }))
      .sort((a, b) => a.percentage - b.percentage);
  }, [records]);

  async function refreshProgress() {
    setActionError("");
    if (!cloudAccount) {
      setRecords(getStudentRecords());
      const localEnrollment = getEnrollment();
      setEnrollments(localEnrollment ? [localEnrollment] : []);
      setEnrollment(localEnrollment);
      return;
    }

    try {
      const { getCloudProgress, getCloudEnrollments } = await import(
        "./cloudData"
      );
      const [cloudRecords, cloudEnrollments] = await Promise.all([
        getCloudProgress(profile.id),
        getCloudEnrollments(profile.id),
      ]);
      setRecords(cloudRecords);
      setEnrollments(cloudEnrollments);
      setEnrollment(cloudEnrollments[0] || null);
      setLoadError(false);
      setActionError("");
    } catch (error) {
      console.error("No se pudo actualizar tu progreso:", error);
      setActionError(
        "No pudimos actualizar tu progreso. Revisa tu conexión e inténtalo de nuevo."
      );
    }
  }

  async function handleLeaveClass(classItem = enrollment) {
    if (!classItem) return;
    setActionError("");
    try {
      if (cloudAccount) {
        const { leaveCloudClass } = await import("./cloudData");
        await leaveCloudClass(profile.id, classItem.classId);
      } else {
        const localProfile = getProfile();
        leaveClass(localProfile.id);
      }
      const remaining = enrollments.filter(
        (item) => item.classId !== classItem.classId
      );
      setEnrollments(remaining);
      setEnrollment((current) =>
        current?.classId === classItem.classId
          ? remaining[0] || null
          : current
      );
      onEnrollmentChange?.(remaining);
    } catch (error) {
      console.error("No se pudo salir de la clase:", error);
      setActionError(
        "No pudimos actualizar tu inscripción. Revisa tu conexión e inténtalo de nuevo."
      );
    }
  }

  return (
    <main className="progress-page">
      <div className="progress-container">
        <button
          type="button"
          className="progress-back"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Volver a Lumora
        </button>

        <header className="progress-heading">
          <span className="progress-kicker">
            TU CAMINO DE APRENDIZAJE
          </span>

          <h1>Mi aprendizaje</h1>

          <p>
            Cada reto te ayuda a descubrir lo que sabes y lo que
            puedes seguir mejorando. ¡Celebra cada avance!
          </p>
        </header>

        {actionError && (
          <p className="progress-error" role="alert">
            {actionError}
          </p>
        )}
        {loading && (
          <p className="progress-encouragement" role="status">
            Cargando tu progreso sincronizado...
          </p>
        )}

        <section
          className="progress-summary"
          aria-label="Resumen de tu aprendizaje"
        >
          <article className="progress-stat purple-stat">
            <span className="progress-stat-icon">
              <Trophy size={23} />
            </span>

            <span className="progress-stat-label">
              Retos completados
            </span>

            <strong>{stats.totalChallenges}</strong>
          </article>

          <article className="progress-stat green-stat">
            <span className="progress-stat-icon">
              <Target size={23} />
            </span>

            <span className="progress-stat-label">
              Respuestas correctas
            </span>

            <strong>{stats.correctAnswers}</strong>
          </article>

          <article className="progress-stat orange-stat">
            <span className="progress-stat-icon">
              <ChartNoAxesColumnIncreasing size={23} />
            </span>

            <span className="progress-stat-label">
              Porcentaje de aciertos
            </span>

            <strong>{stats.percentage}%</strong>
          </article>
        </section>

        <section
          className="progress-recommendation"
          aria-labelledby="recommendation-title"
        >
          <div className="recommendation-symbol">
            <RecommendationIcon size={24} />
          </div>

          <div>
            <span className="recommendation-label">
              TU SIGUIENTE PASO
            </span>

            <h2 id="recommendation-title">
              {recommendation.title}
            </h2>

            <p>{recommendation.message}</p>

            <strong>{recommendation.action}</strong>

            {onExplore && (
              <button
                type="button"
                className="progress-primary recommendation-button"
                onClick={onExplore}
              >
                Ir a las actividades
              </button>
            )}
          </div>
        </section>

        {enrollments.length > 0 && (
          <section className="progress-class" aria-label="Tus clases">
            <div className="progress-section-title">
              <Users size={21} />
              <h2>Mis clases</h2>
            </div>
            <div className="progress-class-list">
              {enrollments.map((classItem) => (
                <article key={classItem.classId}>
                  <div>
                    <strong>{classItem.className}</strong>
                    {classItem.subject && <span> · {classItem.subject}</span>}
                    <p>Código {classItem.code}</p>
                  </div>
                  <button
                    type="button"
                    className="progress-text-button"
                    onClick={() => void handleLeaveClass(classItem)}
                  >
                    Salir de la clase
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {subjectStats.length > 0 && (
          <section className="progress-subjects" aria-label="Avance por tema">
            <div className="progress-section-title">
              <Target size={21} />
              <h2>Avance por tema</h2>
            </div>

            <div className="progress-subject-list">
              {subjectStats.map((subject) => (
                <article className="progress-subject" key={subject.activity}>
                  <div className="progress-bar-labels">
                    <span>{subject.activity}</span>
                    <strong>{subject.percentage}%</strong>
                  </div>
                  <div
                    className="progress-bar-track"
                    role="progressbar"
                    aria-valuenow={subject.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Aciertos en ${subject.activity}`}
                  >
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {skillStats.length > 0 && (
          <section
            className="progress-skills"
            aria-label="Habilidades por reforzar"
          >
            <div className="progress-section-title">
              <Target size={21} />
              <h2>Habilidades por reforzar</h2>
            </div>
            <p>
              Lumora usa tus respuestas para elegir prácticas más útiles en
              tus próximos retos.
            </p>
            <ul>
              {skillStats.slice(0, 3).map((skill) => (
                <li key={skill.skillId}>
                  <span>{skill.skillName}</span>
                  <strong>
                    {skill.mistakes}{" "}
                    {skill.mistakes === 1 ? "error" : "errores"} registrados
                  </strong>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="progress-detail">
          <div className="progress-section-title">
            <BookOpen size={21} />
            <h2>Tu resumen</h2>
          </div>

          <div className="progress-bar-labels">
            <span>Respuestas correctas</span>
            <strong>{stats.percentage}%</strong>
          </div>

          <div
            className="progress-bar-track"
            role="progressbar"
            aria-valuenow={stats.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Porcentaje de respuestas correctas"
          >
            <div
              className="progress-bar-fill"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>

          <div className="progress-counts">
            <span>
              <CheckCircle2 size={15} />
              {stats.totalQuestions} preguntas respondidas
            </span>

            <span>
              <XCircle size={15} />
              {stats.mistakes} respuestas incorrectas
            </span>
          </div>
        </section>

        <section className="progress-history">
          <div className="progress-section-title">
            <CalendarDays size={21} />
            <h2>Historial de retos</h2>
          </div>

          {loading ? (
            <div className="progress-empty" role="status">
              Cargando tus resultados...
            </div>
          ) : loadError ? (
            <div className="progress-empty">
              <h3>No pudimos cargar el historial</h3>
              <p>Comprueba tu conexión y vuelve a intentarlo.</p>
              <button
                type="button"
                className="progress-primary"
                onClick={refreshProgress}
              >
                Intentar de nuevo
              </button>
            </div>
          ) : records.length === 0 ? (
            <div className="progress-empty">
              <GraduationCap size={40} />

              <h3>Tu historia comienza aquí</h3>

              <p>
                Todavía no tienes retos registrados. Explora las
                actividades de Lumora, responde las preguntas y
                vuelve aquí para consultar tus resultados.
              </p>

              <button
                type="button"
                className="progress-primary"
                onClick={onBack}
              >
                Explorar retos
              </button>
            </div>
          ) : (
            <>
              <div className="progress-records">
                {[...records].reverse().map((record, index) => {
                  const result = getRecordStats(record);

                  const recordKey =
                    record.id ??
                    `${record.completedAt ?? "reto"}-${index}`;
                  const change = attemptChanges.get(record);

                  return (
                    <article
                      className="progress-record"
                      key={recordKey}
                    >
                      <div className="progress-record-icon">
                        <BookOpen size={22} />
                      </div>

                      <div className="progress-record-info">
                        <strong>
                          {record.activity || "Reto de aprendizaje"}
                        </strong>

                        <span>
                          {formatDate(record.completedAt)}
                        </span>

                        <span>
                          {result.correctAnswers} de{" "}
                          {result.totalQuestions} respuestas correctas
                        </span>

                        {result.mistakes > 0 && (
                          <span>
                            {result.mistakes} respuestas incorrectas
                          </span>
                        )}
                        {change !== undefined && (
                          <span>
                            {change > 0
                              ? `Mejoraste ${change} puntos porcentuales`
                              : change < 0
                                ? `Tu resultado bajó ${Math.abs(change)} puntos`
                                : "Mantuviste tu resultado"}{" "}
                            frente al intento anterior.
                          </span>
                        )}
                      </div>

                      <div className="progress-record-score">
                        <strong>{result.percentage}%</strong>
                        <span>aciertos</span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <button
                type="button"
                className="progress-primary"
                onClick={refreshProgress}
              >
                Actualizar resultados
              </button>
            </>
          )}
        </section>

        <p className="progress-encouragement">
          Recuerda: equivocarte no es retroceder. Es una oportunidad
          para comprender mejor. ¡Sigue aprendiendo a tu ritmo!
        </p>
      </div>
    </main>
  );
}
