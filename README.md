# Sistema de Licencias

## Instalación

Para instalar las dependencias del proyecto, ejecuta:

```bash
npm run install:deps
```
O simplemente:

```bash
npm install
```

> **Nota:** El proyecto está configurado para usar automáticamente `--legacy-peer-deps` durante la instalación debido a algunas incompatibilidades entre paquetes.

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El servidor se iniciará en [http://localhost:3000](http://localhost:3000).

Para configurar el frontend y conectarlo con el backend, crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# API connection (requerido)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Iniciar en producción

Para iniciar el proyecto en modo producción después de construirlo:

```bash
npm start
```
