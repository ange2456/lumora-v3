import { useEffect, useState } from "react";
import "./Challenge.css";
import {
  addNotification,
  getEnrollment,
  getProfile,
  getProgress,
  saveProgressRecord,
} from "./storage";
const questionSets = {
  MATEMÁTICAS: [
    {
      type: "diagnostico",
      skillId: "division-reparto",
      skillName: "División en partes iguales",
      title: "Primero, descubre qué sabes",
      question:
        "Una profesora reparte 12 cuadernos en partes iguales entre 3 estudiantes. ¿Cuántos recibe cada uno?",
      options: ["3 cuadernos", "4 cuadernos", "9 cuadernos", "36 cuadernos"],
      correct: 1,
      explanation:
        "Dividir en partes iguales significa repartir la cantidad. Como 12 ÷ 3 = 4, cada estudiante recibe 4 cuadernos.",
      reinforcement: {
        question:
          "Tienes 15 galletas y las repartes por igual entre 5 niños. ¿Cuántas recibe cada uno?",
        options: ["2 galletas", "3 galletas", "5 galletas", "10 galletas"],
        correct: 1,
        explanation:
          "Dividimos 15 entre 5. Como 5 × 3 = 15, cada niño recibe 3 galletas.",
      },
    },
    {
      type: "practica",
      skillId: "division-reparto",
      skillName: "División en partes iguales",
      title: "Vamos a reforzar lo aprendido",
      question:
        "Hay 20 lápices para repartir por igual entre 5 personas. ¿Cuántos recibe cada una?",
      options: ["4 lápices", "5 lápices", "15 lápices", "25 lápices"],
      correct: 0,
      explanation:
        "Dividimos 20 entre 5. Como 5 × 4 = 20, cada persona recibe 4 lápices.",
      reinforcement: {
        question:
          "Se reparten 18 caramelos entre 6 estudiantes en partes iguales. ¿Cuántos recibe cada uno?",
        options: ["2 caramelos", "3 caramelos", "6 caramelos", "12 caramelos"],
        correct: 1,
        explanation:
          "18 ÷ 6 = 3. Cada estudiante recibe 3 caramelos.",
      },
    },
    {
      type: "transferencia",
      skillId: "division-agrupacion",
      skillName: "División para formar grupos",
      title: "Ahora, llévalo a otra situación",
      question:
        "Una tienda organiza 24 botellas en cajas con 6 botellas cada una. ¿Cuántas cajas necesita?",
      options: ["3 cajas", "4 cajas", "6 cajas", "18 cajas"],
      correct: 1,
      explanation:
        "Calculamos 24 ÷ 6 = 4. La tienda necesita 4 cajas.",
      reinforcement: {
        question:
          "Una biblioteca acomoda 30 libros en estantes con 10 libros cada uno. ¿Cuántos estantes necesita?",
        options: ["2 estantes", "3 estantes", "10 estantes", "20 estantes"],
        correct: 1,
        explanation:
          "Calculamos 30 ÷ 10 = 3. Se necesitan 3 estantes.",
      },
    },
  ],

  PROGRAMACIÓN: [
    {
      type: "diagnostico",
      skillId: "comparacion-mayor-igual",
      skillName: "Comparaciones con mayor o igual",
      title: "Descubre tu lógica de programación",
      question:
        "Una variable llamada edad tiene el valor 18. Si una condición verifica que edad >= 18, ¿qué resultado obtiene?",
      options: [
        "Falso, porque debe ser mayor que 18",
        "Verdadero, porque tiene 18",
        "Un error siempre",
        "El valor 0",
      ],
      correct: 1,
      explanation:
        "El operador >= significa 'mayor o igual que'. Como edad vale 18, la condición es verdadera.",
      reinforcement: {
        question:
          "Si edad = 20, ¿qué resultado da la condición edad >= 18?",
        options: ["Verdadero", "Falso", "Un error siempre", "No se puede comparar"],
        correct: 0,
        explanation:
          "20 es mayor que 18, por eso la condición edad >= 18 es verdadera.",
      },
    },
    {
      type: "practica",
      skillId: "comparacion-mayor",
      skillName: "Comparaciones con mayor que",
      title: "Practiquemos las condiciones",
      question:
        "Si puntos = 7 y el código verifica si puntos > 10, ¿se cumple la condición?",
      options: [
        "Sí, porque 7 es mayor que 10",
        "No, porque 7 es menor que 10",
        "Sí, porque todos los números cumplen",
        "No, porque 7 no es un número",
      ],
      correct: 1,
      explanation:
        "El símbolo > significa 'mayor que'. Como 7 es menor que 10, la condición es falsa.",
      reinforcement: {
        question: "Si puntos = 12, ¿se cumple la condición puntos > 10?",
        options: ["Sí, porque 12 es mayor que 10", "No, porque 12 es menor que 10", "Nunca se cumple", "Solo se cumple con cero"],
        correct: 0,
        explanation:
          "12 es mayor que 10, así que la condición puntos > 10 es verdadera.",
      },
    },
    {
      type: "transferencia",
      skillId: "condiciones-booleanas",
      skillName: "Condiciones verdaderas y falsas",
      title: "Aplica la lógica en otro caso",
      question:
        "Una aplicación permite ingresar cuando usuarioActivo es verdadero. Si usuarioActivo = false, ¿qué ocurre?",
      options: [
        "La condición se cumple",
        "La condición no se cumple",
        "La variable se vuelve 10",
        "La aplicación siempre permite ingresar",
      ],
      correct: 1,
      explanation:
        "false representa una condición falsa. Por eso, la aplicación no permite ingresar si depende de que usuarioActivo sea verdadero.",
      reinforcement: {
        question:
          "Un sistema solo permite entrar si accesoPermitido = true. Si accesoPermitido = true, ¿qué sucede?",
        options: [
          "La condición se cumple",
          "La condición no se cumple",
          "La variable se vuelve false",
          "El sistema se apaga siempre",
        ],
        correct: 0,
        explanation:
          "true significa verdadero. Como el sistema exige que accesoPermitido sea true, la condición se cumple.",
      },
    },
  ],

  CIENCIAS: [
    {
      type: "diagnostico",
      skillId: "cambio-estado-fusion",
      skillName: "Cambios de estado: fusión",
      title: "Observa y descubre",
      question:
        "Dejas un cubo de hielo fuera del congelador y comienza a convertirse en agua. ¿Qué proceso está ocurriendo?",
      options: ["Congelación", "Evaporación", "Fusión", "Condensación"],
      correct: 2,
      explanation:
        "La fusión ocurre cuando una sustancia pasa de estado sólido a líquido, como sucede con el hielo al derretirse.",
      reinforcement: {
        question:
          "Cuando un cubo de hielo se derrite, ¿de qué estado pasa a cuál?",
        options: [
          "De líquido a sólido",
          "De sólido a líquido",
          "De gas a líquido",
          "De líquido a gas",
        ],
        correct: 1,
        explanation:
          "El hielo está en estado sólido y, al derretirse, se convierte en agua líquida. Ese cambio se llama fusión.",
      },
    },
    {
      type: "practica",
      skillId: "fotosintesis",
      skillName: "Elementos de la fotosíntesis",
      title: "Comprendamos lo que sucede",
      question:
        "¿Qué necesita principalmente una planta para realizar la fotosíntesis?",
      options: [
        "Luz, agua y dióxido de carbono",
        "Solo tierra seca",
        "Oscuridad permanente",
        "Únicamente oxígeno",
      ],
      correct: 0,
      explanation:
        "Para realizar la fotosíntesis, las plantas utilizan luz, agua y dióxido de carbono para producir azúcares y liberar oxígeno.",
      reinforcement: {
        question: "¿Cuál es una fuente de energía que utiliza la planta en la fotosíntesis?",
        options: ["La luz del sol", "La oscuridad", "Las piedras", "El plástico"],
        correct: 0,
        explanation:
          "La planta utiliza la energía de la luz para realizar la fotosíntesis.",
      },
    },
    {
      type: "transferencia",
      skillId: "cambio-estado-condensacion",
      skillName: "Cambios de estado: condensación",
      title: "Conecta la ciencia con la vida diaria",
      question:
        "Después de una ducha caliente, aparecen pequeñas gotas en el espejo frío. ¿Qué explica este fenómeno?",
      options: [
        "La fusión del espejo",
        "La condensación del vapor de agua",
        "La congelación del aire",
        "La desaparición del agua",
      ],
      correct: 1,
      explanation:
        "El vapor de agua se enfría al entrar en contacto con el espejo y pasa a formar pequeñas gotas líquidas. Este proceso se llama condensación.",
      reinforcement: {
        question:
          "Cuando el vapor de agua se enfría y forma gotas líquidas, ¿cómo se llama el proceso?",
        options: ["Fusión", "Evaporación", "Condensación", "Congelación"],
        correct: 2,
        explanation:
          "La condensación ocurre cuando el vapor de agua se enfría y pasa del estado gaseoso al líquido.",
      },
    },
  ],

  LECTURA: [
    {
      type: "diagnostico",
      skillId: "lectura-causa-efecto",
      skillName: "Comprensión de causa y efecto",
      title: "Lee con atención",
      question:
        "Ana guardó su cuaderno en la mochila porque empezó a llover. ¿Por qué lo guardó?",
      options: [
        "Porque quería dibujar",
        "Para protegerlo de la lluvia",
        "Porque se le olvidó en casa",
        "Porque el cuaderno estaba vacío",
      ],
      correct: 1,
      explanation:
        "El texto dice que empezó a llover. Ana guardó el cuaderno para protegerlo.",
      reinforcement: {
        question:
          "Si un texto dice que alguien cierra la ventana porque hace frío, ¿cuál es la causa?",
        options: [
          "Hace calor",
          "Quiere ver la calle",
          "Hace frío",
          "La ventana está rota",
        ],
        correct: 2,
        explanation:
          "La palabra 'porque' introduce la causa: hace frío.",
      },
    },
    {
      type: "practica",
      skillId: "lectura-idea-principal",
      skillName: "Identificación de la idea principal",
      title: "Encuentra la idea principal",
      question:
        "Los árboles dan sombra, limpian el aire y son hogar de muchos animales. ¿Cuál es la idea principal?",
      options: [
        "Los animales corren rápido",
        "Los árboles son importantes para la vida",
        "La sombra es de color verde",
        "El aire nunca se mueve",
      ],
      correct: 1,
      explanation:
        "Todas las oraciones hablan de beneficios de los árboles. Esa es la idea principal.",
      reinforcement: {
        question:
          "Un párrafo habla de que el agua hidrata, limpia y ayuda a las plantas. ¿Cuál es la idea principal?",
        options: [
          "El agua es necesaria",
          "Las plantas son azules",
          "Hay que correr cada día",
          "La limpieza no importa",
        ],
        correct: 0,
        explanation:
          "Los ejemplos apoyan una misma idea: el agua es necesaria.",
      },
    },
    {
      type: "transferencia",
      skillId: "lectura-inferencias",
      skillName: "Comprensión de inferencias",
      title: "Infiere lo que no está dicho",
      question:
        "Lucas salió con paraguas y botas. En la calle había charcos. ¿Qué se puede inferir?",
      options: [
        "Hacía mucho calor",
        "Había llovido o estaba lloviendo",
        "Lucas iba a la playa",
        "Era de noche siempre",
      ],
      correct: 1,
      explanation:
        "El paraguas, las botas y los charcos permiten inferir que había lluvia.",
      reinforcement: {
        question:
          "María llega sonriendo con un diploma en la mano. ¿Qué se puede inferir?",
        options: [
          "Probablemente logró algo importante",
          "Perdió su cuaderno",
          "Siempre está enojada",
          "No fue a la escuela",
        ],
        correct: 0,
        explanation:
          "La sonrisa y el diploma sugieren un logro, aunque el texto no lo diga de forma directa.",
      },
    },
  ],
};

const activityNames = {
  MATEMÁTICAS: "Matemáticas",
  PROGRAMACIÓN: "Programación",
  CIENCIAS: "Ciencias",
  LECTURA: "Lectura",
};

function createAdaptiveQuestionSet(activity, records) {
  const baseQuestions = questionSets[activity];
  const skillMisses = new Map();

  records
    .filter((record) => record.activityKey === activity)
    .forEach((record) => {
      (Array.isArray(record.skillResults) ? record.skillResults : []).forEach(
        (result) => {
          if (!result || !result.skillId) return;

          const current = skillMisses.get(result.skillId) || {
            skillName: result.skillName,
            misses: 0,
            lastMissedAt: "",
          };
          current.skillName = result.skillName || current.skillName;
          current.misses = result.correct ? 0 : current.misses + 1;
          current.lastMissedAt = record.completedAt || "";
          skillMisses.set(result.skillId, current);
        }
      );
    });

  const weakestSkill = [...skillMisses.entries()]
    .filter(([, skill]) => skill.misses > 0)
    .sort(
      ([, first], [, second]) =>
        second.misses - first.misses ||
        second.lastMissedAt.localeCompare(first.lastMissedAt)
    )[0];

  if (!weakestSkill) {
    return { questions: baseQuestions, adaptedSkill: null };
  }

  const [skillId, skill] = weakestSkill;
  const sourceQuestion = baseQuestions.find(
    (question) => question.skillId === skillId && question.reinforcement
  );
  const practiceIndex = baseQuestions.findIndex(
    (question) => question.type === "practica"
  );

  if (!sourceQuestion || practiceIndex === -1) {
    return { questions: baseQuestions, adaptedSkill: null };
  }

  const practiceQuestion = {
    ...baseQuestions[practiceIndex],
    skillId,
    skillName: sourceQuestion.skillName,
    title: `Práctica personalizada: ${sourceQuestion.skillName}`,
    question: sourceQuestion.reinforcement.question,
    options: sourceQuestion.reinforcement.options,
    correct: sourceQuestion.reinforcement.correct,
    explanation: sourceQuestion.reinforcement.explanation,
    reinforcement: {
      question: sourceQuestion.question,
      options: sourceQuestion.options,
      correct: sourceQuestion.correct,
      explanation: sourceQuestion.explanation,
    },
    adapted: true,
  };

  return {
    questions: baseQuestions.map((question, index) =>
      index === practiceIndex ? practiceQuestion : question
    ),
    adaptedSkill: skill.skillName,
  };
}

export default function Challenge({
  onBack,
  onFinished,
  activity = "MATEMÁTICAS",
  cloudAccount = false,
  profile,
  enrollment,
}) {
  const normalizedActivity = activityNames[activity] ? activity : "MATEMÁTICAS";
  const activityName = activityNames[normalizedActivity];

  const [adaptiveContent, setAdaptiveContent] = useState(() =>
    createAdaptiveQuestionSet(
      normalizedActivity,
      cloudAccount ? [] : getProgress()
    )
  );
  const [adaptiveLoading, setAdaptiveLoading] = useState(cloudAccount);
  const { questions, adaptedSkill } = adaptiveContent;
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [checked, setChecked] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const [reinforcementAnswer, setReinforcementAnswer] = useState(null);
  const [reinforcementChecked, setReinforcementChecked] = useState(false);
  const [reinforcementDone, setReinforcementDone] = useState(false);
  const [reinforcementSuccesses, setReinforcementSuccesses] = useState(0);
  const [skillResults, setSkillResults] = useState([]);

  const current = questions[step];
  const isCorrect = answer === current.correct;
  const reinforcement = current.reinforcement;
  const reinforcementIsCorrect =
    reinforcementAnswer === reinforcement.correct;

  useEffect(() => {
    if (!cloudAccount || !profile?.id) return undefined;

    let active = true;
    import("./cloudData")
      .then(({ getCloudProgress }) => getCloudProgress(profile.id))
      .then((records) => {
        if (active) {
          setAdaptiveContent(
            createAdaptiveQuestionSet(normalizedActivity, records)
          );
          setAdaptiveLoading(false);
        }
      })
      .catch((error) => {
        console.error("No se pudo cargar el historial de aprendizaje:", error);
        if (active) {
          setAdaptiveLoading(false);
          window.alert(
            "No pudimos cargar tu historial. Revisa tu conexión e inténtalo de nuevo."
          );
          onBack();
        }
      });

    return () => {
      active = false;
    };
  }, [cloudAccount, normalizedActivity, onBack, profile?.id]);

  function checkAnswer() {
    if (answer === null || checked) return;

    setChecked(true);
    setSkillResults((previous) => [
      ...previous,
      {
        skillId: current.skillId,
        skillName: current.skillName,
        correct: isCorrect,
      },
    ]);

    if (isCorrect) {
      setCorrectAnswers((previous) => previous + 1);
      setReinforcementDone(true);
    } else {
      setMistakes((previous) => previous + 1);
      setReinforcementDone(false);
    }
  }

  function checkReinforcement() {
    if (reinforcementAnswer === null) return;

    setReinforcementChecked(true);

    if (reinforcementIsCorrect) {
      setReinforcementDone(true);
      setReinforcementSuccesses((previous) => previous + 1);
    }
  }

  function retryReinforcement() {
    setReinforcementAnswer(null);
    setReinforcementChecked(false);
  }

  async function nextQuestion() {
    if (step < questions.length - 1) {
      setStep((previous) => previous + 1);
      setAnswer(null);
      setChecked(false);
      setReinforcementAnswer(null);
      setReinforcementChecked(false);
      setReinforcementDone(false);
      return;
    }

    const activeProfile = profile || getProfile();
    const activeEnrollment = enrollment || getEnrollment();

    const result = {
      id: crypto.randomUUID(),
      activity: activityName,
      activityKey: normalizedActivity,
      completedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      correctAnswers,
      mistakes,
      reinforcementSuccesses,
      skillResults,
      adaptedSkill,
      completed: true,
      studentId: activeProfile.id,
      studentName: activeProfile.name || "Estudiante",
      classId: activeEnrollment?.classId || null,
      classCode: activeEnrollment?.code || null,
    };

    try {
      if (cloudAccount) {
        const { saveCloudProgress } = await import("./cloudData");
        await saveCloudProgress(activeProfile.id, result);
      } else {
        saveProgressRecord(result);
        addNotification({
          title: `Reto de ${activityName} completado`,
          message: `Lograste ${correctAnswers} de ${questions.length} respuestas correctas.`,
        });
      }
      setFinished(true);
    } catch (error) {
      console.error("No se pudo guardar el progreso:", error);
      window.alert(
        cloudAccount
          ? "No pudimos guardar tu progreso en Supabase. Revisa tu conexión e inténtalo de nuevo."
          : "No pudimos guardar tu progreso. Revisa el almacenamiento del navegador."
      );
    }
  }

  async function restart() {
    try {
      const records = cloudAccount
        ? await import("./cloudData").then(({ getCloudProgress }) =>
            getCloudProgress(profile.id)
          )
        : getProgress();
      setAdaptiveContent(
        createAdaptiveQuestionSet(normalizedActivity, records)
      );
    } catch (error) {
      console.error("No se pudo actualizar la práctica adaptativa:", error);
      window.alert(
        "No pudimos preparar el siguiente reto. Revisa tu conexión e inténtalo de nuevo."
      );
      return;
    }

    setStep(0);
    setAnswer(null);
    setChecked(false);
    setMistakes(0);
    setFinished(false);
    setCorrectAnswers(0);
    setReinforcementAnswer(null);
    setReinforcementChecked(false);
    setReinforcementDone(false);
    setReinforcementSuccesses(0);
    setSkillResults([]);
  }

  if (adaptiveLoading) {
    return (
      <main className="challenge-page" aria-live="polite">
        <section className="challenge-card">
          <p className="challenge-question">
            Preparando un reto según tu progreso...
          </p>
        </section>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="challenge-page">
        <section className="challenge-card completion">
          <div className="challenge-symbol">✦</div>
          <p className="challenge-eyebrow">RETO COMPLETADO</p>
          <h1>¡Lo hiciste muy bien!</h1>
          <p>
            Terminaste las tres etapas de {activityName}. Practicar y
            comprender tus errores también es avanzar.
          </p>

          <div className="challenge-result">
            <strong>
              {correctAnswers} de {questions.length}
            </strong>
            <span>respuestas correctas</span>
            <strong>{mistakes}</strong>
            <span>respuestas incorrectas</span>
            <strong>{reinforcementSuccesses}</strong>
            <span>ejercicios de refuerzo superados</span>
          </div>

          <button className="challenge-primary" onClick={restart}>
            Volver a practicar
          </button>
          <button
            className="challenge-secondary"
            onClick={onFinished || onBack}
          >
            Ver mi aprendizaje
          </button>
          <button className="challenge-secondary" onClick={onBack}>
            Volver al inicio
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="challenge-page">
      <section className="challenge-card">
        <button className="challenge-back" onClick={onBack}>
          ← Volver al inicio
        </button>

        <p className="challenge-eyebrow">{activityName.toUpperCase()}</p>

        {adaptedSkill && (
          <div className="challenge-adaptive-note" role="status">
            <strong>Práctica adaptada para ti</strong>
            <span>
              Elegimos un ejercicio para reforzar: {adaptedSkill}.
            </span>
          </div>
        )}

        <div className="challenge-progress">
          <span>Tu recorrido de aprendizaje</span>
          <span>
            {step + 1} de {questions.length}
          </span>
        </div>

        <div className="challenge-progress-track">
          <div
            className="challenge-progress-fill"
            style={{
              width: `${((step + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <p className="challenge-eyebrow">
          {current.type === "diagnostico"
            ? "ETAPA 1 · DIAGNÓSTICO"
            : current.type === "practica"
              ? "ETAPA 2 · PRÁCTICA"
              : "ETAPA 3 · TRANSFERENCIA"}
        </p>

        <h1>{current.title}</h1>
        <p className="challenge-question">{current.question}</p>

        <div className="challenge-options">
          {current.options.map((option, index) => {
            let optionClass = "";

            if (checked && index === current.correct) {
              optionClass = "correct";
            } else if (checked && index === answer) {
              optionClass = "incorrect";
            } else if (answer === index) {
              optionClass = "selected";
            }

            return (
              <button
                key={option}
                className={`challenge-option ${optionClass}`}
                onClick={() => !checked && setAnswer(index)}
                disabled={checked}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
                {checked && index === current.correct && (
                  <span className="option-status">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {checked && (
          <div
            className={`challenge-feedback ${
              isCorrect ? "good" : "try-again"
            }`}
          >
            <strong>
              {isCorrect ? "¡Correcto! 🎉" : "Vamos a comprenderlo 💡"}
            </strong>
            <p>{current.explanation}</p>
            {!isCorrect && (
              <p>
                Como esta pregunta fue difícil, Lumora te propone un ejercicio
                de refuerzo antes de continuar.
              </p>
            )}
          </div>
        )}

        {checked && !isCorrect && (
          <div className="challenge-feedback">
            <strong>Práctica de refuerzo</strong>
            <p>{reinforcement.question}</p>

            <div className="challenge-options">
              {reinforcement.options.map((option, index) => {
                let optionClass = "";

                if (
                  reinforcementChecked &&
                  index === reinforcement.correct
                ) {
                  optionClass = "correct";
                } else if (
                  reinforcementChecked &&
                  index === reinforcementAnswer
                ) {
                  optionClass = "incorrect";
                } else if (reinforcementAnswer === index) {
                  optionClass = "selected";
                }

                return (
                  <button
                    key={option}
                    className={`challenge-option ${optionClass}`}
                    onClick={() => {
                      if (!reinforcementChecked) setReinforcementAnswer(index);
                    }}
                    disabled={reinforcementChecked}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                    {reinforcementChecked &&
                      index === reinforcement.correct && (
                        <span className="option-status">✓</span>
                      )}
                  </button>
                );
              })}
            </div>

            {reinforcementChecked && (
              <div
                className={`challenge-feedback ${
                  reinforcementIsCorrect ? "good" : "try-again"
                }`}
              >
                <strong>
                  {reinforcementIsCorrect
                    ? "¡Muy bien! Has reforzado este concepto."
                    : "Casi lo logras. Inténtalo una vez más."}
                </strong>
                <p>{reinforcement.explanation}</p>
              </div>
            )}

            {reinforcementChecked && !reinforcementIsCorrect ? (
              <button
                className="challenge-primary"
                onClick={retryReinforcement}
              >
                Intentar de nuevo
              </button>
            ) : !reinforcementChecked ? (
              <button
                className="challenge-primary"
                onClick={checkReinforcement}
                disabled={reinforcementAnswer === null}
              >
                Comprobar refuerzo
              </button>
            ) : null}
          </div>
        )}

        {checked && (isCorrect || reinforcementDone) && (
          <button className="challenge-primary" onClick={nextQuestion}>
            {step === questions.length - 1 ? "Ver mi resultado" : "Continuar"}
            {" →"}
          </button>
        )}

        {!checked && (
          <button
            className="challenge-primary"
            onClick={checkAnswer}
            disabled={answer === null}
          >
            Comprobar respuesta
          </button>
        )}
      </section>
    </main>
  );
}
