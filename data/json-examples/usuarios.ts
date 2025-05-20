export const crearUsuarioRequest = {
  nombre: "Nuevo",
  apellido: "Operador",
  fechaNacimiento: "1992-08-15",
  username: "noperador",
  password: "clave123",
  rol: "OPERADOR",
}

export const crearUsuarioResponse = {
  success: true,
  message: "Usuario creado correctamente",
  usuario: {
    id: 5,
    nombre: "Nuevo",
    apellido: "Operador",
    fechaNacimiento: "1992-08-15",
    username: "noperador",
    rol: "OPERADOR",
    activo: true,
  },
}

export const listarUsuariosResponse = {
  success: true,
  usuarios: [
    {
      id: 1,
      nombre: "Administrador",
      apellido: "Sistema",
      fechaNacimiento: "1970-01-01",
      username: "admin",
      rol: "SUPER_USER",
      activo: true,
    },
    {
      id: 2,
      nombre: "Operador",
      apellido: "Turno1",
      fechaNacimiento: "1985-06-15",
      username: "operador",
      rol: "OPERADOR",
      activo: true,
    },
    {
      id: 3,
      nombre: "Juan",
      apellido: "Pérez",
      fechaNacimiento: "1990-03-22",
      username: "jperez",
      rol: "OPERADOR",
      activo: true,
    },
    {
      id: 4,
      nombre: "María",
      apellido: "González",
      fechaNacimiento: "1988-11-05",
      username: "mgonzalez",
      rol: "OPERADOR",
      activo: false,
    },
  ],
}
