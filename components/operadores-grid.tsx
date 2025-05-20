"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Pencil } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

// Datos de ejemplo para operadores
const operadoresEjemplo = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    email: "jperez@municipio.gob",
    fechaNacimiento: "1985-06-15",
    activo: true,
    rol: "OPERADOR",
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    email: "mgonzalez@municipio.gob",
    fechaNacimiento: "1990-03-22",
    activo: true,
    rol: "OPERADOR",
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "crodriguez@municipio.gob",
    fechaNacimiento: "1988-11-10",
    activo: false,
    rol: "OPERADOR",
  },
]

interface OperadoresGridProps {
  role: string
  onEdit?: (operadorId: number) => void
}

export default function OperadoresGrid({ role, onEdit }: OperadoresGridProps) {
  const [usuarios, setUsuarios] = useState(operadoresEjemplo)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulamos la carga de datos
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  const cambiarEstado = async (id: number, nuevoEstado: boolean) => {
    try {
      // Simulamos la llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Actualizamos la lista local
      setUsuarios(usuarios.map((u) => (u.id === id ? { ...u, activo: nuevoEstado } : u)))

      toast({
        title: "Éxito",
        description: `Operador ${nuevoEstado ? "activado" : "desactivado"} correctamente`,
      })
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del operador",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (id: number) => {
    if (onEdit) {
      onEdit(id)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-slate-500 dark:text-slate-400">Cargando operadores...</p>
      </div>
    )
  }

  if (usuarios.length === 0) {
    return (
      <div className="p-6">
        <p className="text-center text-slate-500 dark:text-slate-400">No hay operadores registrados</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Fecha Nacimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell className="font-medium">
                {usuario.nombre} {usuario.apellido}
              </TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell>{format(new Date(usuario.fechaNacimiento), "dd/MM/yyyy", { locale: es })}</TableCell>
              <TableCell>
                {usuario.activo ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
                ) : (
                  <Badge variant="outline" className="text-red-500 border-red-500">
                    Inactivo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(usuario.id)}
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={usuario.activo ? "destructive" : "default"}
                    size="sm"
                    onClick={() => cambiarEstado(usuario.id, !usuario.activo)}
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    {usuario.activo ? (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activar
                      </>
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
