# =========================
# 🧱 Etapa 1: Builder (Node + Python)
# =========================
FROM node:20-bullseye AS builder

WORKDIR /var/api/Mwsm

# Instalar dependências básicas
RUN apt-get update && apt-get install -y \
    git python3 python3-pip python3-venv build-essential \
    curl wget unzip libglib2.0-0 libnss3 libx11-6 libxkbcommon0 libasound2 \
    libatk-bridge2.0-0 libcups2 libpango-1.0-0 libgbm1 fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Baixar apenas os arquivos necessários do repositório (como no setup.sh)
RUN git init && \
    git remote add origin https://github.com/MKCodec/Mwsm.git && \
    git config core.sparseCheckout true && \
    echo -e 'fonts/\nicon.png\nindex.html\njquery.js\nmwsm.db\nmwsm.js\nmwsm.json\nnodemon.json\npackage.json\nscript.js\nsocket.io.js\nstyle.css\nversion.json\nmwsm.py' > .git/info/sparse-checkout && \
    git pull origin main || git pull origin master

# Instalar dependências Node (sem lockfile, para atualizar o whatsapp-web.js)
RUN npm install --no-audit --no-fund --force

# Instalar dependências Python
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install flask requests sentence-transformers torch torchvision

# =========================
# 🧱 Etapa 2: Execução (Runtime)
# =========================
FROM node:20-bullseye

WORKDIR /var/api/Mwsm
ENV PATH="/opt/venv/bin:$PATH"

# Instalar libs mínimas do Chromium e sistema
RUN apt-get update && apt-get install -y \
    python3 git curl wget libglib2.0-0 libnss3 libx11-6 libxkbcommon0 libasound2 \
    libatk-bridge2.0-0 libcups2 libpango-1.0-0 libgbm1 fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Copiar ambiente e repositório do builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# Instalar PM2 global
RUN npm install -g pm2 --silent --no-audit --no-fund

# Instalar Puppeteer com Chromium correto
RUN npm install puppeteer@21.3.8 --silent --no-audit --no-fund && \
    npx puppeteer browsers install chrome

# Permitir execução do script principal
RUN chmod +x mwsm.sh

# Expor portas usadas
EXPOSE 8000 5005

# Iniciar com PM2 (mwsm.json gerencia JS e Python)
CMD ["pm2-runtime", "start", "mwsm.json"]
