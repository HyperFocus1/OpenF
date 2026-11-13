import { HttpErrorResponse } from '@angular/common/http';
import { SessionFailure } from '@models/auth/auth.model';

export function authError(error: unknown): string {
  if (error instanceof SessionFailure) {
    switch (error.code) {
      case 'invalid-credentials': return 'El correo o la contraseña no son correctos.';
      case 'email-taken': return 'Ya existe una cuenta con ese correo.';
      case 'invalid-response': return 'El servidor no devolvió una sesión válida. Inténtalo de nuevo.';
    }
  }
  if (!(error instanceof HttpErrorResponse)) return 'No se pudo completar la solicitud. Inténtalo de nuevo.';
  switch (error.status) {
    case 0:
    case 502:
    case 503:
    case 504: return 'No pudimos conectar con el servidor. Inténtalo de nuevo en unos momentos.';
    case 400: return 'Revisa los datos introducidos e inténtalo de nuevo.';
    case 401: return 'El correo o la contraseña no son correctos.';
    case 403: return 'La sesión del formulario ha caducado. Vuelve a intentarlo.';
    case 404: return 'El servicio de acceso no está disponible.';
    case 409: return 'Ya existe una cuenta con ese correo.';
    case 429: return 'Has realizado demasiados intentos. Espera un momento antes de continuar.';
    default: return 'Ocurrió un error en el servidor. Inténtalo de nuevo.';
  }
}
