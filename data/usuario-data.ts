import { type Usuario, Rol } from "@/types/usuario-types"

// Datos de ejemplo para usuarios
export const usuariosDB: Usuario[] = [
  {
    id: 1,
    nombre: "Administrador",
    apellido: "Sistema",
    fechaNacimiento: "1970-01-01",
    username: "admin",
    rol: Rol.SUPER_USER,
    activo: true,
  },
  {
    id: 2,
    nombre: "Operador",
    apellido: "Turno1",
    fechaNacimiento: "1985-06-15",
    username: "operador",
    rol: Rol.OPERADOR,
    activo: true,
  },
  {
    id: 3,
    nombre: "Juan",
    apellido: "Pérez",
    fechaNacimiento: "1990-03-22",
    username: "jperez",
    rol: Rol.OPERADOR,
    activo: true,
  },
  {
    id: 4,
    nombre: "María",
    apellido: "González",
    fechaNacimiento: "1988-11-05",
    username: "mgonzalez",
    rol: Rol.OPERADOR,
    activo: false,
  },
]
