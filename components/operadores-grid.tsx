"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XCircle, Pencil, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usuarioService } from "@/services/usuario-service"
import type { Usuario } from "@/types/usuario-types"

interface OperadoresGridProps {
  role: string
  onEdit?: (operadorId: number) => void
}

export default function OperadoresGrid({ role, onEdit }: OperadoresGridProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const response = await usuarioService.listarUsuarios()
      if (response.success) {
        setUsuarios(response.usuarios)
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los operadores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (id: number, nuevoEstado: boolean) => {
    try {
      const result = await usuarioService.cambiarEstadoUsuario(id, nuevoEstado)
      if (result.success) {
        // Recargar la lista
        await cargarUsuarios()
        toast({
          title: "Éxito",
          description: `Operador ${nuevoEstado ? "activado" : "desactivado"} correctamente`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
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
            <TableHead>Roles</TableHead>
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
              <TableCell>{usuario.mail}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {usuario.roles?.map((rol, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {rol}
                    </Badge>
                  ))}
                </div>
              </TableCell>
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
                    onClick={() => handleEdit(usuario.id!)}
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  {usuario.activo ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cambiarEstado(usuario.id!, false)}
                      className="transition-transform duration-300 hover:scale-105"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Desactivar
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => cambiarEstado(usuario.id!, true)}
                      className="transition-transform duration-300 hover:scale-105"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
