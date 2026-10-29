# IMEI Frontend

Interfaz web para consultar dispositivos por IMEI o serial. Está construida con React, TypeScript y Vite.

## Cómo levantar el proyecto

### Requisitos

- Node.js 20.19+ o 22.12+.
- pnpm para instalar las dependencias y ejecutar los comandos.
- Variables de entorno de Supabase para que la aplicación pueda iniciar.

### 1. Instalar dependencias

Desde esta carpeta (`IMEI-front`), instala las dependencias definidas en `pnpm-lock.yaml`:

```bash
pnpm install
```

Si no tienes pnpm instalado globalmente, puedes ejecutarlo mediante Corepack, incluido con versiones actuales de Node.js:

```bash
corepack pnpm install
```

Corepack solo descarga/selecciona pnpm y ejecuta el comando; no es requisito de Vite ni del servidor de desarrollo.

El archivo `pnpm-workspace.yaml` no configura un monorepo en este proyecto. Declara explícitamente los paquetes cuyas dependencias necesitan scripts de instalación (`@swc/core`, `esbuild` y `sharp`), para que pnpm moderno pueda instalarlas. Sin esa autorización, pnpm puede bloquear dichos scripts y fallar la compilación.

### 2. Configurar el entorno local

Desde `IMEI-front`, copia el archivo de ejemplo y reemplaza los valores de Supabase por los de tu proyecto:

```bash
cp .env.example .env.local
```

`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son obligatorias. La aplicación lanza un error al iniciar si faltan. `VITE_API_URL` es opcional; si no se define, el frontend usa `http://localhost:8000`.

No uses una clave secreta de Supabase en el frontend. Usa únicamente la clave publicable/anon correspondiente a la configuración del proyecto.

### 3. Iniciar el frontend

Desde `IMEI-front`:

```bash
pnpm dev
```

Vite muestra la URL local en la terminal, normalmente <http://localhost:5173>. Mantén esa terminal abierta mientras desarrollas; para detener el servidor, usa `Ctrl+C`.

Si no tienes pnpm instalado globalmente, también puedes iniciar Vite con `corepack pnpm dev`.

Para permitir conexiones desde otros dispositivos de la red local:

```bash
corepack pnpm dev -- --host 0.0.0.0
```

### 4. Iniciar el backend

Las consultas al servicio requieren también el backend FastAPI. En otra terminal, desde la carpeta `IMEI`:

```bash
cd ../IMEI
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

El backend debe estar disponible en <http://localhost:8000>. Su configuración y credenciales requeridas están descritas en [IMEI/README.md](../IMEI/README.md). Si usas otro host o puerto, establece `VITE_API_URL` en `.env.local` y reinicia Vite.

## Comandos disponibles

Ejecuta estos comandos desde `IMEI-front`:

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo con recarga en caliente. |
| `pnpm build` | Comprueba TypeScript y genera la versión de producción en `dist/`. |
| `pnpm preview` | Sirve localmente la compilación de producción. |
| `pnpm lint` | Ejecuta ESLint. |

## Solución de problemas

- **Error de variables de Supabase:** verifica que `.env.local` esté dentro de `IMEI-front`, que los nombres de las variables sean exactos y reinicia el servidor.
- **No conecta con la API:** confirma que el backend esté ejecutándose en `http://localhost:8000` o ajusta `VITE_API_URL`.
- **La cámara no funciona:** permite el acceso a la cámara. En desarrollo, abre el frontend desde `localhost`; los navegadores normalmente requieren HTTPS para usar la cámara en otros hosts.
