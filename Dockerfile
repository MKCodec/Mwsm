# ========================================
# 🐋 Mwsm - Ambiente Completo
# ========================================
FROM node:20-bullseye

# Instalar pacotes do sistema e Python
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv sqlite3 git curl wget jq build-essential \
    libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2 \
    ca-certificates fonts-liberation libappindicator3-1 \
    libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
    libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
    libxrender1 libxss1 libxtst6 lsb-release xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Instalar libs Python
RUN pip3 install --no-cache-dir \
    flask==2.2.5 \
    sentence-transformers==2.2.2 \
    huggingface_hub==0.10.1 \
    transformers==4.25.1 \
    safetensors==0.3.1

# Instalar PM2 globalmente
RUN npm install -g pm2@latest

# Criar diretório do app
WORKDIR /var/api/Mwsm

# Copiar o projeto local
COPY . .

# Instalar dependências Node
RUN npm install --production

# Expor a porta padrão
EXPOSE 8000

# Iniciar via PM2 (como no Ubuntu real)
CMD ["pm2-runtime", "npm", "--", "run", "setup:mwsm"]
