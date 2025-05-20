import LoginForm from "@/components/login-form"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-white/20 p-1 backdrop-blur-sm shadow-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo-licencias-nuevo.png"
                  alt="Logo Sistema de Licencias"
                  width={80}
                  height={80}
                  className="rounded-full object-contain p-1"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Sistema Municipal de Gestión de Licencias</h1>
            <p className="text-slate-300 mt-2">Acceda al sistema para gestionar licencias de conducir</p>
          </div>
          <LoginForm />
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-8">
        <div className="max-w-lg">
          <Image
            src="/images/licencia-hero.png"
            alt="Gestión de licencias de conducir"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
          <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Gestión Eficiente de Licencias de Conducir
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Sistema integral para la emisión y administración de licencias de conducir municipales
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
