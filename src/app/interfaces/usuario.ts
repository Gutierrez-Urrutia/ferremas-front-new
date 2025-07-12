export interface Direccion {
  id?: number;
  calle: string;
  numero: string;
  comuna: string | { id: number; nombre: string };
  region: string | { id: number; nombre: string };
  comunaId?: number;
  regionId?: number;
  esPrincipal?: boolean;
  usuarioId?: number;
  usuario?: { id: number };
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  direcciones?: Direccion[];
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
