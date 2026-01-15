# 🚀 Guía de Inicio Rápido

Esta guía te ayudará a poner en marcha el Sistema de Gestión Educativa CESDE en 5 minutos.

## ⚡ Inicio Rápido

### 1️⃣ Requisitos

```bash
# Verificar versiones
node --version    # Debe ser >= 18.0.0
npm --version     # Debe ser >= 9.0.0
```

### 2️⃣ Instalación

```bash
# Clonar y acceder al proyecto
git clone <repository-url>
cd front-gea-cesde/app-gestion-educativa

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tu URL de API (opcional si usas localhost:8080)
nano .env
```

### 3️⃣ Ejecutar

```bash
# Iniciar en modo desarrollo
npm run dev
```

🎉 **¡Listo!** La aplicación estará en: `http://localhost:5173`

---

## 🔑 Credenciales de Prueba

Una vez que el backend esté corriendo, puedes usar:

```
Usuario: admin
Contraseña: admin123
```

_(Estas credenciales deben estar configuradas en el backend)_

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to API"

**Causa:** El backend no está corriendo o la URL es incorrecta.

**Solución:**

```bash
# Verifica que el backend esté corriendo en http://localhost:8080
curl http://localhost:8080/api/health

# Si no está corriendo, inícialo:
cd ../back-bd-API
./start-api.sh
```

### Error: "Module not found"

**Causa:** Dependencias no instaladas correctamente.

**Solución:**

```bash
# Limpia y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error: Puerto 5173 en uso

**Causa:** Otra aplicación está usando el puerto.

**Solución:**

```bash
# Mata el proceso en el puerto 5173
lsof -ti:5173 | xargs kill -9

# O usa otro puerto
npm run dev -- --port 3000
```

---

## 📚 Próximos Pasos

1. 📖 Lee el [README completo](README.md) para entender la arquitectura
2. 🎨 Familiarízate con los componentes en `src/components/ui`
3. 🔐 Revisa el sistema de autenticación en `src/contexts/AuthContext.tsx`
4. 📄 Explora las páginas en `src/pages/`
5. 🛠️ Revisa los servicios API en `src/services/`

---

## 🔗 Enlaces Útiles

- 📖 [Documentación completa](README.md)
- 🐛 [Reportar un bug](https://github.com/tu-repo/issues)
- 💬 [Soporte](mailto:soporte@cesde.edu.co)

---

**¿Todo funcionó? ¡Excelente! Ahora puedes empezar a desarrollar. 🚀**
