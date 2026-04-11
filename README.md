# 💕 Victoria — Web Romántica

Una web elegante y romántica para compartir poemas de amor.

---

## 🚀 Despliegue en Vercel vía GitHub

### Paso 1 — Preparar el repositorio en GitHub

1. Ve a [github.com](https://github.com) y crea un nuevo repositorio llamado `victoria`
2. En tu computadora, dentro de esta carpeta, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Mi web de amor Victoria 💕"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/victoria.git
   git push -u origin main
   ```

### Paso 2 — Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub
2. Haz clic en **"New Project"**
3. Importa el repositorio `victoria` que acabas de crear
4. En la sección **"Environment Variables"**, agrega estas tres variables:

   | Variable | Valor |
   |----------|-------|
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_LcXMQ3pqISO9@ep-polished-waterfall-anb8bk5d-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require` |
   | `JWT_SECRET` | Una frase secreta larga (ej: `amor-eterno-victoria-2024-secreto`) |
   | `ADMIN_EMAIL` | Tu correo electrónico (el que usarás para ser admin) |

5. Haz clic en **"Deploy"** ✨

### Paso 3 — Inicializar la base de datos

Una vez desplegado, visita esta URL **una sola vez**:
```
https://tu-dominio.vercel.app/api/init
```
Esto creará las tablas y cargará los poemas iniciales.

### Paso 4 — Crear tu cuenta de admin

1. Ve a tu web y haz clic en **"Crear cuenta"**
2. Regístrate con el mismo correo que pusiste en `ADMIN_EMAIL`
3. ¡Ya eres admin! Podrás ver el panel secreto en `/admin`

---

## 💻 Desarrollo local

```bash
# 1. Instala dependencias
npm install

# 2. Copia el archivo de variables de entorno
cp .env.local.example .env.local

# 3. Edita .env.local con tus datos

# 4. Inicia el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

Luego visita [http://localhost:3000/api/init](http://localhost:3000/api/init) para inicializar la base de datos.

---

## ✨ Funcionalidades

- 📜 Poemas románticos con diseño elegante
- ❤️ Sistema de "me gusta" / corazoncitos
- 💬 Comentarios en cada poema
- 🔐 Registro e inicio de sesión con nombre, correo y contraseña
- 👑 Panel de administrador secreto (solo tú lo ves)
- 🟢 Indicador de conexión en tiempo real (en el panel admin)
- 📱 Diseño responsive para móvil y escritorio
