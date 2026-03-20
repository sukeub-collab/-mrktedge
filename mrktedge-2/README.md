# MRKT EDGE — Guía de despliegue

## Lo que necesitas (todo gratis)
1. Cuenta en **GitHub** → github.com
2. Cuenta en **Finnhub** → finnhub.io (API key gratis)
3. Cuenta en **Vercel** → vercel.com

---

## PASO 1 — Subir el código a GitHub

1. Ve a **github.com** → click en "+" → "New repository"
2. Nombre: `mrktedge` → click "Create repository"
3. En la página siguiente verás instrucciones. Sigue las que dicen **"upload an existing file"**
4. Sube todos los archivos de esta carpeta manteniendo la estructura de carpetas
5. Click "Commit changes"

---

## PASO 2 — Conectar con Vercel

1. Ve a **vercel.com** → "Sign up" con tu cuenta de GitHub
2. Click "Add New Project"
3. Selecciona el repositorio `mrktedge`
4. Click "Deploy" (Vercel detecta Next.js automáticamente)

---

## PASO 3 — Añadir tu API Key de Finnhub

1. En Vercel, ve a tu proyecto → "Settings" → "Environment Variables"
2. Añade esta variable:
   - **Name:** `FINNHUB_KEY`
   - **Value:** tu API key de finnhub.io
3. Click "Save"
4. Ve a "Deployments" → click "Redeploy"

---

## ¡Listo! 🚀

Tu app estará disponible en una URL como:
`https://mrktedge.vercel.app`

## Para actualizar la app
Cualquier cambio que hagas en GitHub se despliega automáticamente en Vercel.
