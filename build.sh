#!/bin/bash

echo "🚀 Iniciando build do GreenManager..."
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar erros
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro: $1${NC}"
        exit 1
    fi
}

# 1. Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install --legacy-peer-deps
check_error "Falha ao instalar dependências"

# 2. Build dos assets web
echo -e "${YELLOW}🏗️  Buildando assets web...${NC}"
npm run build
check_error "Falha no build web"

# 3. Sincronizar Capacitor
echo -e "${YELLOW}🔄 Sincronizando Capacitor...${NC}"
npx cap sync ios
check_error "Falha na sincronização do Capacitor"

# 4. Build iOS
echo -e "${YELLOW}📱 Buildando iOS...${NC}"
cd ios/App || exit

xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -derivedDataPath ../build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

check_error "Falha no build iOS"

# 5. Listar artefatos
echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo -e "${YELLOW}📁 Artefatos gerados:${NC}"
ls -la ../build/Build/Products/Release-iphoneos/

echo ""
echo "======================================"
echo "📱 Arquivo .app disponível em:"
echo "../build/Build/Products/Release-iphoneos/App.app"
echo ""
echo "Para instalar no iPhone via Sideloadly:"
echo "1. Baixe o arquivo .app"
echo "2. Converta para .ipa (opcional)"
echo "3. Use o Sideloadly para instalar"
echo "======================================"
