// Quien llega sin cuenta practica como «invitado»: su avance vive en este dispositivo.
// Al crear una cuenta o entrar, ese avance se SUMA a la cuenta (nunca se pierde ni se pisa).
import { borrarLocal, cargar, guardar } from './saberStorage.js';
import { fusionar } from './fusion.js';

export const INVITADO = 'invitado';

export function tieneAvance(estado) {
    return estado.intentos.length > 0 || Object.keys(estado.progreso).length > 0 || Object.keys(estado.actividad).length > 0;
}

/** Pasa lo del invitado a la cuenta (en este dispositivo) y borra la copia de invitado. Es segura de repetir. */
export function pasarInvitadoACuenta(uid) {
    const invitado = cargar(INVITADO);
    if (!tieneAvance(invitado))
        return false;
    guardar(uid, fusionar(cargar(uid), invitado));
    borrarLocal(INVITADO);
    return true;
}
