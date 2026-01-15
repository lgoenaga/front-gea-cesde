#!/bin/bash

# ==========================================
# Script de Inicialización
# Sistema de Gestión Educativa CESDE
# ==========================================

echo "🎓 Iniciando Sistema de Gestión Educativa CESDE"
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "📦 Verificando requisitos..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Por favor, instala Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js debe ser >= 18.0.0${NC}"
    echo "Versión actual: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v)${NC}"
echo ""

# Verificar si existe .env
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠️  Revisa y ajusta las variables en .env según tu entorno${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Archivo .env existe${NC}"
    echo ""
fi

# Instalar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
    else
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
    echo -e "${YELLOW}💡 Ejecuta 'npm install' si necesitas actualizar${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo "Para iniciar el servidor de desarrollo:"
echo -e "${YELLOW}npm run dev${NC}"
echo ""
echo "La aplicación estará disponible en:"
echo -e "${GREEN}http://localhost:5173${NC}"
echo ""
echo "📚 Para más información, consulta:"
echo "   - README.md (documentación completa)"
echo "   - QUICKSTART.md (guía rápida)"
echo ""
echo "================================================"
