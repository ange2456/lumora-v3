import { useEffect, useMemo, useRef, useState } from 'react';
import { generarDiagnostico } from './data/banco.js';
import { COMPETENCIA_INICIAL, esCompetencia } from './data/questions.js';
import { calcularDiagnostico } from './lib/diagnosis.js';
import { cargar, claveDia, guardar, nuevaSemilla } from './lib/saberStorage.js';
import Inicio from './screens/Inicio.jsx';
import Nia from './screens/Nia.jsx';
import EstadoNube from './screens/EstadoNube.jsx';
import { useSincronizacion } from './nube/useSincronizacion.js';
import { fusionar } from './lib/fusion.js';
import { recompensa as calcularRecompensa } from './lib/logros.js';
import Pregunta from './screens/Pregunta.jsx';
import Practica from './screens/Practica.jsx';
import Resultado from './screens/Resultado.jsx';
import Ruta from './screens/Ruta.jsx';
export default function SaberApp({ usuarioId, nombre, nube = null }) {
    // Con cuenta, el perfil (apodo y prueba) viene de la cuenta.
    const perfilCuenta = nube ? { apodo: nube.perfil.apodo, prueba: nube.perfil.prueba } : null;
    const [guardado, setEstado] = useState(() => cargar(usuarioId));
    const [pantalla, setPantalla] = useState(() => (perfilCuenta || cargar(usuarioId).perfil ? 'ruta' : 'inicio'));
    // Con cuenta, el perfil se deriva de la cuenta en cada render (si lo cambia en «Mi cuenta», aquí se ve igual).
    const apodoCuenta = perfilCuenta?.apodo;
    const pruebaCuenta = perfilCuenta?.prueba;
    const estado = useMemo(() => (apodoCuenta === undefined ? guardado : { ...guardado, perfil: { apodo: apodoCuenta, prueba: pruebaCuenta } }), [guardado, apodoCuenta, pruebaCuenta]);
    const sincro = useSincronizacion(nube, estado, setEstado);
    const [tipoPractica, setTipoPractica] = useState('base');
    // La competencia elegida se guarda con el progreso.
    const competencia = esCompetencia(estado.competencia) ? estado.competencia : COMPETENCIA_INICIAL;
    const cambiarCompetencia = (c) => setEstado((e) => ({ ...e, competencia: c }));
    const [claveSesion, setClaveSesion] = useState(0);
    // Lo que se ganó al terminar el último diagnóstico o práctica (no se guarda).
    const [recompensa, setRecompensa] = useState(null);
    const [semillaSesion, setSemillaSesion] = useState(() => nuevaSemilla());
    useEffect(() => {
        guardar(usuarioId, estado);
    }, [usuarioId, estado]);
    // Al cambiar de pantalla, el foco pasa al título: quien usa lector de pantalla o teclado sabe dónde está.
    const primera = useRef(true);
    const sesionInicial = useRef(null);
    useEffect(() => {
        if (primera.current) {
            primera.current = false;
            return;
        }
        const h = document.querySelector('.saber h1');
        if (h) {
            h.tabIndex = -1;
            h.focus({ preventScroll: true });
        }
    }, [pantalla]);
    const ir = (p) => {
        setPantalla(p);
        window.scrollTo(0, 0);
    };
    // Los diagnósticos antiguos no traen competencia: eran de razonamiento cuantitativo.
    const intentosComp = estado.intentos.filter((i) => (i.competencia ?? COMPETENCIA_INICIAL) === competencia);
    const ultimoIntento = intentosComp[intentosComp.length - 1];
    const enCurso = estado.enCurso;
    const competenciaEnCurso = enCurso?.competencia ?? COMPETENCIA_INICIAL;
    // Las preguntas se regeneran desde la semilla: no hace falta guardarlas.
    const semillaEnCurso = enCurso?.semilla;
    const semillaUltimo = ultimoIntento?.semilla;
    const preguntasEnCurso = (semillaEnCurso == null ? [] : generarDiagnostico(semillaEnCurso, competenciaEnCurso));
    const preguntasUltimo = (semillaUltimo == null ? [] : generarDiagnostico(semillaUltimo, competencia));
    const diag = ultimoIntento ? calcularDiagnostico(ultimoIntento.respuestas, preguntasUltimo) : null;
    const indiceActual = enCurso ? enCurso.respuestas.length : 0;
    const crearPerfil = (perfil) => {
        setEstado((e) => ({ ...e, perfil }));
        ir('ruta');
    };
    const empezarDiagnostico = () => {
        setEstado((e) => ({ ...e, enCurso: { respuestas: [], semilla: nuevaSemilla(), competencia } }));
        ir('diagnostico');
    };
    const responder = (opcionId, confianza) => {
        if (!enCurso)
            return;
        const pregunta = preguntasEnCurso[indiceActual];
        const respuestas = [...enCurso.respuestas, { preguntaId: pregunta.id, opcionId, confianza }];
        if (respuestas.length < preguntasEnCurso.length) {
            setEstado((e) => ({ ...e, enCurso: { ...enCurso, respuestas } }));
            window.scrollTo(0, 0);
            return;
        }
        const d = calcularDiagnostico(respuestas, preguntasEnCurso);
        const nuevo = {
            ...estado,
            enCurso: undefined,
            intentos: [
                ...estado.intentos,
                {
                    fecha: new Date().toISOString(),
                    competencia: competenciaEnCurso,
                    semilla: enCurso.semilla,
                    aciertos: d.aciertos,
                    total: d.total,
                    puntosCiegos: d.puntosCiegos,
                    prioridad: d.prioridad,
                    respuestas,
                },
            ],
        };
        setRecompensa(calcularRecompensa(estado, nuevo));
        setEstado(nuevo);
        ir('resultado');
    };
    const importar = (nuevo) => {
        // Con cuenta, lo importado se suma a lo que ya hay (nunca se pierde progreso de la cuenta).
        setEstado((e) => (nube ? fusionar(e, { ...nuevo, perfil: e.perfil }) : nuevo));
        ir('ruta');
    };
    const practicar = (tipo) => {
        sesionInicial.current = estado; // para saber qué se ganó en toda la sesión
        setRecompensa(null);
        setTipoPractica(tipo);
        setSemillaSesion(nuevaSemilla());
        setClaveSesion((k) => k + 1);
        ir('practica');
    };
    const registrarEjercicio = () => {
        const hoy = claveDia();
        setEstado((e) => ({ ...e, actividad: { ...e.actividad, [hoy]: (e.actividad[hoy] ?? 0) + 1 } }));
    };
    const terminarSesion = (r) => {
        const previo = estado.progreso[r.tipo];
        const nuevo = {
            ...estado,
            progreso: {
                ...estado.progreso,
                [r.tipo]: {
                    sesiones: (previo?.sesiones ?? 0) + 1,
                    ultimaPractica: r.aciertos,
                    ultimaTransferencia: r.transferencia,
                    dominado: (r.transferencia && r.aciertos >= 2) || !!previo?.dominado,
                },
            },
        };
        setRecompensa(calcularRecompensa(sesionInicial.current ?? estado, nuevo));
        setEstado(nuevo);
    };
    const erroresDe = (tipo) => diag?.porTipo.find((t) => t.tipo === tipo)?.errores ?? 0;
    return (<div className="saber">
      {pantalla !== 'ruta' && pantalla !== 'inicio' && (<button className="volver" type="button" onClick={() => ir('ruta')}>
          ← Volver a mi ruta
        </button>)}

      <div className="saber-contenido">
        {nube && <EstadoNube {...sincro}/>}
        {pantalla === 'inicio' && <Inicio onCrear={crearPerfil} onImportar={importar} nombreInicial={nombre}/>}

        {pantalla === 'ruta' && (<Ruta combinar={!!nube} estado={estado} competencia={competencia} onCompetencia={cambiarCompetencia} intentos={intentosComp} diag={diag} hayDiagnosticoEnCurso={!!enCurso && competenciaEnCurso === competencia && enCurso.respuestas.length > 0} onDiagnostico={empezarDiagnostico} onContinuarDiagnostico={() => ir('diagnostico')} onVerResultado={() => ir('resultado')} onPracticar={practicar} onImportar={importar}/>)}

        {pantalla === 'diagnostico' && enCurso && indiceActual < preguntasEnCurso.length && (<Pregunta key={preguntasEnCurso[indiceActual].id} pregunta={preguntasEnCurso[indiceActual]} indice={indiceActual} total={preguntasEnCurso.length} onConfirmar={responder}/>)}

        {pantalla === 'resultado' && ultimoIntento && (<Resultado apodo={estado.perfil?.apodo ?? 'Tú'} competencia={competencia} recompensa={recompensa} intentos={intentosComp} preguntas={preguntasUltimo} diag={diag} onPracticar={practicar} onRuta={() => ir('ruta')} onRepetir={empezarDiagnostico}/>)}

        {pantalla === 'practica' && (<Practica key={claveSesion} recompensa={recompensa} tipo={tipoPractica} semilla={semillaSesion} erroresDiagnostico={erroresDe(tipoPractica)} onEjercicio={registrarEjercicio} onTerminar={terminarSesion} onRepetir={() => practicar(tipoPractica)} onSalir={() => ir('ruta')}/>)}
      </div>

      {pantalla !== 'inicio' && pantalla !== 'diagnostico' && (<Nia contexto={{ perfil: estado.perfil, competencia, diag, progreso: estado.progreso, actividad: estado.actividad, tipoActual: pantalla === 'practica' ? tipoPractica : null }} onPracticar={practicar}/>)}
    </div>);
}
