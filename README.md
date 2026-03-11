# 🌿 GreenManager

App de gestão pessoal com tema verde, desenvolvido especialmente para combinar com iPhone 15 Verde.

## 📱 Funcionalidades

- ✅ **Lembretes**: Crie e gerencie seus lembretes
- 🛒 **Listas de Compras**: Listas com auto-remoção após 24h
- 💰 **Finanças**: Controle de receitas e despesas com categorias
- 🏷️ **Categorias Editáveis**: Crie, edite e remova categorias
- 💾 **Backup**: Exporte e importe seus dados
- 🌙 **Modo Escuro**: Interface adaptativa
- 🎨 **Tema Verde**: Combinando com iPhone 15

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Xcode (para build iOS)
- CocoaPods

### Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/green-manager.git

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Adicione as plataformas
npx cap add ios
npx cap add android

# Sincronize com Capacitor
npx cap sync

# Abra no Xcode (iOS)
npx cap open ios
