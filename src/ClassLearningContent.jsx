import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, LoaderCircle } from "lucide-react";
import "./ClassLearningContent.css";

export default function ClassLearningContent({ studentId, classId }) {
  const [items, setItems] = useState([]);
  const [answersByQuiz, setAnswersByQuiz] = useState({});
  const [resultsByQuiz, setResultsByQuiz] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingQuizId, setSubmittingQuizId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    import("./cloudData")
      .then(({ getStudentClassContent }) =>
        getStudentClassContent(studentId, classId)
      )
      .then((content) => {
        if (active) setItems(content);
      })
      .catch((loadError) => {
        console.error("No se pudo cargar el contenido de la clase:", loadError);
        if (active) {
          setError(
            "No pudimos cargar las actividades y los retos de tu clase. Inténtalo de nuevo."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [studentId, classId]);

  async function submitQuiz(quiz) {
    const answers = answersByQuiz[quiz.id] || [];
    if (
      answers.length !== quiz.questions.length ||
      answers.some((item) => item === undefined)
    ) {
      return;
    }

    setSubmittingQuizId(quiz.id);
    setError("");
    try {
      const { submitStudentClassQuiz } = await import("./cloudData");
      const result = await submitStudentClassQuiz(studentId, quiz.id, answers);
      setResultsByQuiz((previous) => ({ ...previous, [quiz.id]: result }));
      setItems((previous) =>
        previous.map((item) =>
          item.id === quiz.id
            ? {
                ...item,
                completed: true,
                correctAnswers: result.correctAnswers,
                totalQuestions: result.totalQuestions,
              }
            : item
        )
      );
    } catch (submitError) {
      console.error("No se pudo enviar el reto de clase:", submitError);
      setError(
        submitError.message ||
          "No pudimos guardar tus respuestas. Inténtalo de nuevo."
      );
    } finally {
      setSubmittingQuizId("");
    }
  }

  if (loading) {
    return (
      <section className="student-class-content" aria-live="polite">
        <p className="student-class-content-status">
          <LoaderCircle size={16} className="student-content-spinner" />
          Cargando actividades y retos...
        </p>
      </section>
    );
  }

  const activities = items.filter((item) => item.type === "activity");
  const quizzes = items.filter((item) => item.type === "quiz");

  return (
    <section className="student-class-content" aria-label="Actividades y retos">
      <h4>
        <ClipboardList size={17} />
        Actividades y retos
      </h4>

      {error && (
        <p className="student-class-content-error" role="alert">
          {error}
        </p>
      )}

      {activities.length === 0 && quizzes.length === 0 ? (
        <p className="student-class-content-empty">
          Tu docente aún no ha compartido actividades ni retos.
        </p>
      ) : (
        <>
          {activities.map((activity) => (
            <article className="student-class-activity" key={activity.id}>
              <strong>{activity.title}</strong>
              {activity.instructions && <p>{activity.instructions}</p>}
              {activity.url && (
                <a href={activity.url} target="_blank" rel="noreferrer">
                  Abrir actividad
                </a>
              )}
            </article>
          ))}

          {quizzes.map((quiz) => {
            const result = resultsByQuiz[quiz.id];
            const feedback = result?.feedback || quiz.feedback || [];
            const answers = answersByQuiz[quiz.id] || [];
            const completed = quiz.completed || Boolean(result);

            return (
              <article className="student-class-quiz" key={quiz.id}>
                <div className="student-class-quiz-heading">
                  <strong>{quiz.title}</strong>
                  <span>
                    {quiz.questions.length}{" "}
                    {quiz.questions.length === 1 ? "pregunta" : "preguntas"}
                  </span>
                </div>

                {completed ? (
                  <p className="student-class-quiz-complete" role="status">
                    <CheckCircle2 size={17} />
                    {result
                      ? `Completaste el reto: ${result.correctAnswers} de ${result.totalQuestions} respuestas correctas.`
                      : `Reto completado: ${quiz.correctAnswers} de ${quiz.totalQuestions} respuestas correctas.`}
                  </p>
                ) : (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitQuiz(quiz);
                    }}
                  >
                    {quiz.questions.map((question, questionIndex) => (
                      <fieldset
                        className="student-class-question"
                        key={`${quiz.id}-${questionIndex}`}
                      >
                        <legend>
                          {questionIndex + 1}. {question.prompt}
                        </legend>
                        {question.options.map((option, optionIndex) =>
                          option ? (
                            <label
                              className="student-class-answer"
                              key={`${questionIndex}-${optionIndex}`}
                            >
                              <input
                                type="radio"
                                name={`${quiz.id}-${questionIndex}`}
                                value={optionIndex}
                                checked={answers[questionIndex] === optionIndex}
                                onChange={() =>
                                  setAnswersByQuiz((previous) => {
                                    const nextAnswers = [
                                      ...(previous[quiz.id] || []),
                                    ];
                                    nextAnswers[questionIndex] = optionIndex;
                                    return {
                                      ...previous,
                                      [quiz.id]: nextAnswers,
                                    };
                                  })
                                }
                                disabled={Boolean(submittingQuizId)}
                              />
                              <span>{option}</span>
                            </label>
                          ) : null
                        )}
                        {result?.feedback?.[questionIndex] && (
                          <p className="student-class-feedback">
                            {result.feedback[questionIndex].explanation}
                          </p>
                        )}
                      </fieldset>
                    ))}
                    <button
                      className="student-class-submit"
                      type="submit"
                      disabled={
                        Boolean(submittingQuizId) ||
                        answers.length !== quiz.questions.length ||
                        answers.some((answer) => answer === undefined)
                      }
                    >
                      {submittingQuizId === quiz.id
                        ? "Guardando respuestas..."
                        : "Enviar reto"}
                    </button>
                  </form>
                )}

                {feedback.length > 0 && (
                  <ol className="student-class-feedback-list">
                    {feedback.map((item, index) => (
                      <li key={`${quiz.id}-feedback-${index}`}>
                        <strong>
                          {item.selectedIndex === item.correctIndex
                            ? "Respuesta correcta"
                            : `Respuesta correcta: ${item.options[item.correctIndex]}`}
                        </strong>
                        {item.explanation && <p>{item.explanation}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            );
          })}
        </>
      )}
    </section>
  );
}
