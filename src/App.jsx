
import { useCallback, useEffect, useState } from "react";
import {
  BrainCircuit,
  BookOpen,
  Compass,
  House,
  GraduationCap,
  Users,
  Search,
  Bell,
  ArrowRight,
  Sparkles,
  Target,
  Trophy,
  Clock3,
  Play,
  Menu,
  X,
  Lightbulb,
  KeyRound,
  RefreshCw,
  UserRound,
} from "lucide-react";
import "./App.css";
import AuthScreen from "./AuthScreen";
import Challenge from "./Challenge";
import ClassLearningContent from "./ClassLearningContent";
import Progress from "./Progress";
import TeacherSpace from "./TeacherSpace";
import SaberGate from "./saber/SaberGate";
import Cuenta from "./saber/screens/Cuenta";
import Historia from "./saber/screens/Historia";
import { useSesion } from "./saber/nube/useSesion";
import "./saber/saber.css";
import { MODO_SABER } from "./config";
import { supabaseConfigured } from "./supabaseConfig";
import {
  addNotification,
  getEnrollment,
  getNotifications,
  getProfile,
  joinClassByCode,
  markNotificationsRead,
  saveProfile,
} from "./storage";

const activities = [
  {
    category: "MATEMÁTICAS",
    title: "Descubre tu manera de resolver problemas",
    description:
      "Practica con retos que se adaptan a lo que necesitas reforzar.",
    level: "Principiante",
    duration: "10 min",
    icon: Target,
    color: "lavender",
  },
  {
    category: "PROGRAMACIÓN",
    title: "Aprende a tomar decisiones con código",
    description:
      "Comprende las condiciones y pon a prueba tu lógica.",
    level: "Principiante",
    duration: "15 min",
    icon: BrainCircuit,
    color: "mint",
  },
  {
    category: "CIENCIAS",
    title: "Explora, pregunta y experimenta",
    description:
      "Conecta conceptos con situaciones de la vida cotidiana.",
    level: "Todos los niveles",
    duration: "12 min",
    icon: Lightbulb,
    color: "peach",
  },
  {
    category: "LECTURA",
    title: "Comprende lo que lees",
    description:
      "Practica idea principal, causa y efecto, e inferencias con textos cortos.",
    level: "Todos los niveles",
    duration: "12 min",
    icon: BookOpen,
    color: "sky",
  },
];

const navItems = [
  { label: "Inicio", icon: House },
  { label: "Mi ruta Saber", icon: Target },
  { label: "Mi cuenta", icon: UserRound },
  { label: "Explorar recursos", icon: BookOpen },
  { label: "Mi aprendizaje", icon: GraduationCap },
  { label: "Espacio docente", icon: Users },
];

function App() {
  // La primera pantalla es siempre el inicio; desde ahí se entra a la ruta (y a la cuenta).
  const [activeNav, setActiveNav] = useState("Inicio");
  const sesion = useSesion();
  const [saberModo, setSaberModo] = useState("entrar");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const [showSaber, setShowSaber] = useState(false);
  const [showTeacherSpace, setShowTeacherSpace] = useState(false);
  const [profile, setProfile] = useState(getProfile);
  const [accountProfile, setAccountProfile] = useState(null);
  const [authReady, setAuthReady] = useState(
    !supabaseConfigured || MODO_SABER
  );
  const [accountError, setAccountError] = useState("");
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [demoMode, setDemoMode] = useState(MODO_SABER);
  const [enrollment, setEnrollment] = useState(getEnrollment);
  const [studentEnrollments, setStudentEnrollments] = useState(() =>
    getEnrollment() ? [getEnrollment()] : []
  );
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState(() => getProfile().name);
  const [joinMessage, setJoinMessage] = useState("");
  const [notifications, setNotifications] = useState(getNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [classResources, setClassResources] = useState({
    classId: "",
    items: [],
    error: "",
  });
  const [resourceRefresh, setResourceRefresh] = useState(0);

  useEffect(() => {
    if (!supabaseConfigured || MODO_SABER) {
      return undefined;
    }

    let active = true;
    let unsubscribe = () => {};

    import("./supabaseSession")
      .then(({ observeAccount }) => {
        if (!active) return;
        unsubscribe = observeAccount(
          (authenticatedProfile) => {
            if (!active) return;
            setAccountError("");
            if (!authenticatedProfile) {
              setAccountProfile(null);
              setEnrollment(getEnrollment());
              setStudentEnrollments(getEnrollment() ? [getEnrollment()] : []);
              setAuthReady(true);
              return;
            }

            try {
              const localProfile = saveProfile(authenticatedProfile);
              setProfile(localProfile);
              setAccountProfile(localProfile);
              setEnrollment(null);
              setStudentEnrollments([]);
              setAuthReady(true);
              if (localProfile.role === "student") {
                import("./cloudData")
                  .then(({ getCloudEnrollments }) =>
                    getCloudEnrollments(localProfile.id)
                  )
                  .then((enrollments) => {
                    if (active) {
                      setStudentEnrollments(enrollments);
                      setEnrollment(enrollments[0] || null);
                    }
                  })
                  .catch((error) => {
                    console.error(
                      "No se pudo cargar la inscripción del estudiante:",
                      error
                    );
                    if (active) {
                      setJoinMessage(
                        "No se pudo cargar tu clase. Comprueba tu conexión e inténtalo de nuevo."
                      );
                    }
                  });
              } else {
                setEnrollment(null);
              }
            } catch (error) {
              console.error("No se pudo guardar el perfil local:", error);
              setAccountError(
                "No se pudo preparar tu perfil en este dispositivo."
              );
              setAccountProfile(null);
              setAuthReady(true);
            }
          },
          (error) => {
            if (!active) return;
            console.error("No se pudo cargar el perfil de Lumora:", error);
            setAccountError(error.message);
            setAccountProfile(null);
            setAuthReady(true);
          },
          () => {
            if (active) setPasswordRecovery(true);
          }
        );
      })
      .catch((error) => {
        console.error("No se pudo iniciar Supabase:", error);
        if (active) {
          setAccountError(
            "No se pudo conectar con Supabase. Revisa la configuración e inténtalo de nuevo."
          );
          setAuthReady(true);
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const activeAccount = demoMode ? null : accountProfile;
  const activeAccountId = activeAccount?.id;
  const activeAccountRole = activeAccount?.role;
  const enrollmentClassId = enrollment?.classId;
  const unreadCount = notifications.filter((item) => !item.read).length;
  const cuentaSaber = MODO_SABER && sesion.fase === "activa" ? sesion.perfil : null;
  const displayName = cuentaSaber?.apodo || profile.name || "Tu espacio";

  useEffect(() => {
    if (
      !activeAccountId ||
      activeAccountRole !== "student" ||
      !enrollmentClassId
    ) return undefined;

    let active = true;
    import("./cloudData")
      .then(({ getCloudResources }) =>
        getCloudResources(activeAccountId, enrollmentClassId)
      )
      .then((resources) => {
        if (active) {
          setClassResources({
            classId: enrollmentClassId,
            items: resources,
            error: "",
          });
        }
      })
      .catch((error) => {
        console.error("No se pudieron cargar los recursos de la clase:", error);
        if (active) {
          setClassResources({
            classId: enrollmentClassId,
            items: [],
            error: "No pudimos cargar los recursos de tu clase. Inténtalo de nuevo.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [activeAccountId, activeAccountRole, enrollmentClassId, resourceRefresh]);

  const currentClassResources =
    classResources.classId === enrollmentClassId
      ? classResources.items
      : [];

  const visibleNavItems = navItems.filter(({ label }) => {
    if (MODO_SABER) {
      if (label === "Mi cuenta") return sesion.fase === "activa";
      return label === "Inicio" || label === "Mi ruta Saber";
    }
    if (label === "Mi cuenta") return false;
    if (!activeAccount) return true;
    return activeAccount.role === "teacher"
      ? label !== "Mi aprendizaje" && label !== "Mi ruta Saber"
      : label !== "Espacio docente";
  });

  const filteredActivities = activities.filter((activity) =>
    `${activity.title} ${activity.category} ${activity.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  
  function chooseSection(label, modoAcceso = "entrar") {
    if (MODO_SABER && label !== "Inicio") {
      label = label === "Mi cuenta" && sesion.fase === "activa" ? "Mi cuenta" : "Mi ruta Saber";
    }
    setSaberModo(modoAcceso);

    if (
      (activeAccount &&
        label === "Espacio docente" &&
        activeAccount?.role !== "teacher") ||
      (activeAccount &&
        (label === "Mi aprendizaje" || label === "Mi ruta Saber") &&
        activeAccount?.role === "teacher")
    ) {
      return;
    }

    setActiveNav(label);
    setMenuOpen(false);
    setNotificationsOpen(false);
    if (!activeAccount) {
      setEnrollment(getEnrollment());
      setStudentEnrollments(getEnrollment() ? [getEnrollment()] : []);
      setProfile(getProfile());
    }
    setNotifications(getNotifications());
    setShowTeacherSpace(label === "Espacio docente");
    setShowProgress(label === "Mi aprendizaje");
    setShowSaber(label === "Mi ruta Saber");

    if (label === "Inicio") {
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 0);
      return;
    }

    if (label === "Explorar recursos") {
      window.setTimeout(() => {
        document
          .getElementById("recursos")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }

  const goHome = useCallback(() => {
    setShowChallenge(false);
    setSelectedActivity("");
    setShowProgress(false);
    setShowSaber(false);
    setShowTeacherSpace(false);
    setActiveNav("Inicio");
    setMenuOpen(false);
  }, []);

  async function joinClass(event) {
    event.preventDefault();

    if (activeAccount && activeAccount.role !== "student") {
      setJoinMessage("Solo las cuentas de estudiante pueden unirse a una clase.");
      return;
    }

    if (activeAccount) {
      try {
        const { joinCloudClass } = await import("./cloudData");
        const joined = await joinCloudClass(
          activeAccount.id,
          activeAccount.name,
          joinCode
        );
        setStudentEnrollments((previous) => [
          joined,
          ...previous.filter((item) => item.classId !== joined.classId),
        ]);
        setEnrollment(joined);
        setJoinCode("");
        setJoinMessage(`Te uniste a ${joined.className}.`);
      } catch (error) {
        console.error("No se pudo unir a la clase:", error);
        setJoinMessage(error.message || "No se pudo unir a la clase.");
      }
      return;
    }

    const name = joinName.trim();
    const nextProfile = saveProfile({
      ...profile,
      name,
    });
    setProfile(nextProfile);

    if (!name) {
      setJoinMessage("Escribe tu nombre para unirte a una clase.");
      return;
    }

    const result = joinClassByCode(joinCode, nextProfile);
    setJoinMessage(result.message);

    if (result.ok) {
      setEnrollment(result.enrollment);
      setStudentEnrollments([result.enrollment]);
      setJoinCode("");
      setNotifications(
        addNotification({
          title: "Te uniste a una clase",
          message: result.message,
        })
      );
    }
  }

  function toggleNotifications() {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);

    if (nextOpen) {
      setNotifications(markNotificationsRead());
    }
  }

  async function handleSignOut() {
    try {
      const { signOutAccount } = await import("./supabaseSession");
      await signOutAccount();
      setAccountError("");
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      window.alert("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  }

  if (!demoMode) {
    if (!supabaseConfigured) {
      return (
        <AuthScreen
          configured={false}
          onContinueDemo={() => setDemoMode(true)}
        />
      );
    }

    if (passwordRecovery) {
      return (
        <AuthScreen
          configured
          recoveryMode
          onPasswordUpdated={() => setPasswordRecovery(false)}
        />
      );
    }

    if (!authReady) {
      return (
        <main className="auth-page" aria-live="polite">
          <p className="auth-info">Cargando tu espacio de Lumora...</p>
        </main>
      );
    }

    if (!activeAccount || accountError) {
      return (
        <AuthScreen
          configured
          profileError={accountError}
          onSignOut={handleSignOut}
          onContinueDemo={() => setDemoMode(true)}
        />
      );
    }
  }


  
  if (showChallenge) {
    return (
      <Challenge
        activity={selectedActivity}
        cloudAccount={Boolean(activeAccount)}
        profile={activeAccount}
        enrollment={enrollment}
        onBack={goHome}
        onFinished={() => {
          setShowChallenge(false);
          setSelectedActivity("");
          setShowProgress(!activeAccount || activeAccount.role === "student");
          setShowTeacherSpace(false);
          setActiveNav(
            activeAccount?.role === "teacher"
              ? "Inicio"
              : "Mi aprendizaje"
          );
          if (activeAccount?.role === "student") {
            setShowProgress(true);
          }
          setNotifications(getNotifications());
        }}
      />
    );
  }


  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <a
          className="brand"
          href="#inicio"
          onClick={(event) => {
            event.preventDefault();
            chooseSection("Inicio");
          }}
        >
          <span className="brand-mark">
            <BrainCircuit size={27} />
          </span>
          <span>
            <strong>Lumora</strong>
            <small>Aprende a tu manera</small>
          </span>
        </a>

        <div className="sidebar-label">MENÚ PRINCIPAL</div>

        <nav className="main-nav" aria-label="Navegación principal">
          {visibleNavItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => chooseSection(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === "Explorar recursos" && (
                <span className="nav-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="note-icon">
            <Sparkles size={20} />
          </span>
          <h3>Cada error te enseña algo</h3>
          <p>Avanza a tu ritmo. Lo importante es comprender.</p>
          <button
            className="text-button"
            onClick={() => chooseSection("Mi aprendizaje")}
          >
            Conoce tu progreso <ArrowRight size={15} />
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong>{displayName}</strong>
            <small>
              {cuentaSaber
                ? [cuentaSaber.institucion, cuentaSaber.ciudad]
                    .filter(Boolean)
                    .join(" · ") || (cuentaSaber.prueba === "saberpro" ? "Saber Pro" : "Saber 11")
                : profile.role === "teacher"
                ? [profile.institution, profile.countryCity]
                    .filter(Boolean)
                    .join(" · ") || "Docente"
                : enrollment
                  ? enrollment.className
                  : "Aprendizaje personal"}
            </small>
          </div>
          <span className="online-dot" />
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-content" id="inicio">
        <header className="topbar">
          <button
            className="mobile-menu-button icon-button"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="breadcrumb">
            <span>Tu espacio</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activeNav}</strong>
          </div>

          <div className="topbar-actions">
            {!MODO_SABER && (
            <span className="open-library">
              <span className="online-dot" />
              Biblioteca abierta
            </span>
            )}
            {!MODO_SABER && (
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Notificaciones"
                title="Notificaciones"
                onClick={toggleNotifications}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              {notificationsOpen && (
                <div className="notification-panel" role="dialog" aria-label="Avisos">
                  <strong>Avisos</strong>
                  {notifications.length === 0 ? (
                    <p>Aún no tienes avisos. Completa un reto o únete a una clase.</p>
                  ) : (
                    <ul>
                      {notifications.map((item) => (
                        <li key={item.id}>
                          <span>{item.title}</span>
                          <small>{item.message}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            )}
            <button
              className="profile-button"
              onClick={() =>
                activeAccount
                  ? handleSignOut()
                  : cuentaSaber
                    ? chooseSection("Mi cuenta")
                    : chooseSection("Mi aprendizaje")
              }
              title={
                activeAccount
                  ? "Cerrar sesión"
                  : cuentaSaber
                    ? "Mi cuenta"
                    : MODO_SABER
                    ? sesion.fase === "local" ? "Mi ruta Saber" : "Iniciar sesión"
                    : "Ver mi aprendizaje"
              }
            >
              <span className="profile-avatar">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              <span>{activeAccount ? "Salir" : cuentaSaber ? cuentaSaber.apodo : MODO_SABER && sesion.fase !== "local" ? "Iniciar sesión" : "Mi espacio"}</span>
            </button>
          </div>
        </header>

        {activeAccount && (
          <p className="account-prototype-warning" role="status">
            Cuenta conectada: tus retos, progreso, clases y recursos se
            sincronizan con Supabase.
          </p>
        )}

        <div className="page-container">
          {showTeacherSpace ? (
            <TeacherSpace
              onBack={() => chooseSection("Inicio")}
              cloudAccount={Boolean(activeAccount)}
              profile={profile}
            />
          ) : activeNav === "Mi cuenta" && cuentaSaber ? (
            <Cuenta
              sesion={sesion}
              onSalio={() => {
                setActiveNav("Inicio");
                setShowSaber(false);
              }}
            />
          ) : showSaber ? (
            <SaberGate
              sesion={sesion}
              nombreLocal={profile.name}
              usuarioLocalId={profile.id}
              modoInicial={saberModo}
            />
          ) : showProgress ? (
            <Progress
              onBack={() => chooseSection("Inicio")}
              onExplore={() => chooseSection("Explorar recursos")}
              onEnrollmentChange={(nextEnrollments) => {
                setStudentEnrollments(nextEnrollments);
                setEnrollment(nextEnrollments[0] || null);
              }}
              cloudAccount={Boolean(activeAccount)}
              profile={activeAccount}
            />
          ) : (
          <>
          <section className="welcome-section">
            <div className="welcome-copy">
              <div className="eyebrow">
                <Sparkles size={15} />
                APRENDER ES DESCUBRIR
              </div>
              <h1>
                {(MODO_SABER ? cuentaSaber?.apodo : profile.name)
                  ? `Hola, ${MODO_SABER ? cuentaSaber.apodo : profile.name}. ¡Bienvenida a `
                  : "Hola, ¡bienvenida a "}
                <span>Lumora!</span>
              </h1>
              <p>
                {MODO_SABER
                  ? "Un buen puntaje en Saber abre puertas. Descubre qué errores repites, practica justo eso y compruébalo con problemas nuevos. Para quien está en 11° y para quien está en la universidad, haya hecho un preicfes o no."
                  : "No se trata solo de encontrar la respuesta. Se trata de comprender cómo llegar a ella. Prepárate para Saber 11 y Saber Pro descubriendo qué errores repites y practicando justo eso."}
              </p>
              <div className="welcome-actions">
                {activeAccount?.role !== "teacher" && (
                  <button
                    className="primary-button"
                    onClick={() =>
                      chooseSection(
                        "Mi ruta Saber",
                        cuentaSaber ? "entrar" : "registro"
                      )
                    }
                  >
                    {cuentaSaber ? "Continuar mi ruta Saber" : "Empezar mi ruta Saber"}{" "}
                    <ArrowRight size={18} />
                  </button>
                )}
                {MODO_SABER && sesion.fase === "anonimo" && (
                  <button
                    className="secondary-button"
                    onClick={() => chooseSection("Mi ruta Saber", "entrar")}
                  >
                    Ya tengo cuenta
                  </button>
                )}
                {!MODO_SABER && (
                <button
                  className="secondary-button"
                  onClick={() =>
                    document
                      .getElementById("recursos")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explorar actividades
                </button>
                )}
              </div>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <span className="floating-symbol symbol-one">+</span>
              <span className="floating-symbol symbol-two">✳</span>
              <span className="floating-symbol symbol-three">✦</span>
              <div className="hero-circle">
                <BrainCircuit size={86} strokeWidth={1.3} />
              </div>
              <div className="floating-card floating-card-top">
                <span className="mini-icon">
                  <Lightbulb size={18} />
                </span>
                <span>
                  <strong>¡Ajá!</strong>
                  <small>Ahora lo entiendo</small>
                </span>
              </div>
              <div className="floating-card floating-card-bottom">
                <span className="success-icon">✓</span>
                <span>
                  <strong>Un paso más</strong>
                  <small>Vas por buen camino</small>
                </span>
              </div>
            </div>
          </section>

          <section className="principles-row" aria-label="Cómo aprender en Lumora">
            <div className="principle">
              <span className="principle-icon icon-purple">
                <Compass size={21} />
              </span>
              <div>
                <strong>Descubre</strong>
                <p>Identifica lo que ya sabes</p>
              </div>
            </div>
            <div className="principle">
              <span className="principle-icon icon-green">
                <BrainCircuit size={21} />
              </span>
              <div>
                <strong>Comprende</strong>
                <p>Aprende de tus errores</p>
              </div>
            </div>
            <div className="principle">
              <span className="principle-icon icon-orange">
                <Trophy size={21} />
              </span>
              <div>
                <strong>Demuestra</strong>
                <p>Resuelve un reto nuevo</p>
              </div>
            </div>
          </section>

          {MODO_SABER && (
            <div className="historia-inicio">
              <Historia />
            </div>
          )}

          {!MODO_SABER && (
          <>
          <section className="resources-section" id="recursos">
            <div className="section-heading">
              <div>
                <span className="section-kicker">TU PRÓXIMO DESCUBRIMIENTO</span>
                <h2>¿Qué te gustaría aprender?</h2>
                <p>
                  Explora recursos abiertos y encuentra un reto para comenzar.
                </p>
              </div>
              <label className="search-box">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Buscar un tema..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Buscar actividades"
                />
              </label>
            </div>

            {activeAccount?.role === "student" &&
              studentEnrollments.length > 0 && (
              <section
                className="class-resources-panel"
                aria-label="Mis clases y contenidos"
              >
                <h3>Mis clases y contenidos</h3>
                <div className="student-class-switcher">
                  {studentEnrollments.map((classItem) => (
                    <button
                      key={classItem.classId}
                      type="button"
                      className={
                        classItem.classId === enrollmentClassId
                          ? "selected"
                          : ""
                      }
                      onClick={() => setEnrollment(classItem)}
                    >
                      {classItem.className}
                    </button>
                  ))}
                </div>
                <h4>Contenido de {enrollment?.className}</h4>
                {enrollment?.description && (
                  <p className="class-resources-description">
                    {enrollment.description}
                  </p>
                )}
                {activeAccount && enrollmentClassId && (
                  <ClassLearningContent
                    key={`${activeAccount.id}-${enrollmentClassId}`}
                    studentId={activeAccount.id}
                    classId={enrollmentClassId}
                  />
                )}
                <button
                  type="button"
                  className="student-resources-refresh"
                  onClick={() => setResourceRefresh((previous) => previous + 1)}
                  disabled={classResources.classId !== enrollmentClassId}
                >
                  <RefreshCw size={15} />
                  Actualizar contenido
                </button>
                {classResources.classId !== enrollmentClassId ? (
                  <p className="class-resources-empty" role="status">
                    Cargando recursos...
                  </p>
                ) : classResources.error ? (
                  <p className="class-resources-empty" role="alert">
                    {classResources.error}
                  </p>
                ) : currentClassResources.length === 0 ? (
                  <p className="class-resources-empty">
                    Tu docente aún no ha compartido recursos.
                  </p>
                ) : (
                  <ul className="class-resources-list">
                    {currentClassResources.map((resource) => (
                      <li key={resource.id}>
                        <strong>{resource.title}</strong>
                        {resource.description && <p>{resource.description}</p>}
                        {resource.fileUrl && (
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Descargar {resource.fileName}
                          </a>
                        )}
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Abrir recurso
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            <div className="activity-grid">
              {filteredActivities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <article className="activity-card" key={activity.title}>
                    <div className={`activity-illustration ${activity.color}`}>
                      <span className="activity-icon">
                        <Icon size={31} strokeWidth={1.7} />
                      </span>
                      <span className="illustration-sparkle">✦</span>
                    </div>
                    <div className="activity-body">
                      <span className="activity-category">
                        {activity.category}
                      </span>
                      <h3>{activity.title}</h3>
                      <p>{activity.description}</p>
                      <div className="activity-meta">
                        <span>
                          <GraduationCap size={15} /> {activity.level}
                        </span>
                        <span>
                          <Clock3 size={15} /> {activity.duration}
                        </span>
                      </div>
                      <button
                        className="activity-button"
                        onClick={() => {
                          setSelectedActivity(activity.category);
                          setShowChallenge(true);
                        }}
                      >
                        Comenzar reto <Play size={15} fill="currentColor" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredActivities.length === 0 && (
              <div className="empty-search">
                <Search size={25} />
                <h3>No encontramos ese tema todavía</h3>
                <p>Prueba con otra palabra para explorar los recursos.</p>
              </div>
            )}

            <div className="library-banner">
              <div className="library-banner-icon">
                <BookOpen size={25} />
              </div>
              <div>
                <h3>Aprender está al alcance de todos</h3>
                <p>
                  Explora la biblioteca abierta de Lumora. Puedes comenzar sin
                  un código de clase.
                </p>
              </div>
              <button
                className="banner-button"
                onClick={() => {
                  setSearch("");
                  document
                    .getElementById("recursos")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explorar biblioteca <ArrowRight size={17} />
              </button>
            </div>
          </section>

          <section className="spaces-section" id="espacios">
            <div className="section-heading">
              <div>
                <span className="section-kicker">APRENDE A TU MANERA</span>
                <h2>Un espacio para cada camino</h2>
                <p>
                  Lumora acompaña tanto el aprendizaje independiente como las
                  clases guiadas.
                </p>
              </div>
            </div>

            <div className="spaces-grid">
              <article className="space-card join-space">
                <span className="space-icon">
                  <KeyRound size={25} />
                </span>
                <h3>Únete con un código</h3>
                <p>
                  Si tu docente ya creó una clase, escribe el código para
                  entrar a su grupo.
                </p>
                {activeAccount?.role === "teacher" ? (
                  <p className="join-message" role="status">
                    Los códigos para unirse a clases están disponibles para
                    estudiantes.
                  </p>
                ) : (
                  <form className="join-form" onSubmit={joinClass}>
                    {!activeAccount && (
                      <input
                        type="text"
                        value={joinName}
                        onChange={(event) => setJoinName(event.target.value)}
                        placeholder="Tu nombre"
                        aria-label="Tu nombre"
                        maxLength={40}
                      />
                    )}
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(event) =>
                        setJoinCode(event.target.value.toUpperCase())
                      }
                      placeholder="Código de clase"
                      aria-label="Código de clase"
                      maxLength={12}
                    />
                    <button type="submit" className="space-link">
                      Unirme a otra clase <ArrowRight size={16} />
                    </button>
                  </form>
                )}
                {activeAccount?.role !== "teacher" &&
                  studentEnrollments.length > 0 && (
                    <p className="join-status">
                      Ya estás en {studentEnrollments.length}{" "}
                      {studentEnrollments.length === 1 ? "clase" : "clases"}.
                      Puedes agregar otra con su código.
                    </p>
                  )}
                {joinMessage && (
                  <p className="join-message" role="status">
                    {joinMessage}
                  </p>
                )}
              </article>

              <article className="space-card student-space">
                <span className="space-icon">
                  <GraduationCap size={25} />
                </span>
                <h3>Aprende por tu cuenta</h3>
                <p>
                  Practica, descubre qué necesitas reforzar y sigue avanzando a
                  tu ritmo.
                </p>
                <button
                  onClick={() => chooseSection("Mi aprendizaje")}
                  className="space-link"
                >
                  Mi aprendizaje <ArrowRight size={16} />
                </button>
              </article>

              <article className="space-card teacher-space">
                <span className="space-icon">
                  <Users size={25} />
                </span>
                <h3>Enseña y acompaña</h3>
                <p>
                  Un espacio pensado para que los docentes organicen clases,
                  recursos y actividades.
                </p>
                <button
                  onClick={() => chooseSection("Espacio docente")}
                  className="space-link"
                >
                  Espacio docente <ArrowRight size={16} />
                </button>
              </article>
            </div>
          </section>

          </>
          )}

          <footer className="page-footer">
            <a
              href="#inicio"
              className="footer-brand"
              onClick={(event) => {
                event.preventDefault();
                chooseSection("Inicio");
              }}
            >
              <BrainCircuit size={19} /> Lumora
            </a>
            <span>Aprende practicando. Comprende tus errores.</span>
            {!MODO_SABER && <a href="#recursos">Biblioteca abierta</a>}
          </footer>
        </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
