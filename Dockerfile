# =========================
# 🧱 Etapa 1: Builder (Node + Python)
# =========================
FROM node:20-bullseye AS builder

WORKDIR /var/api/Mwsm

# Configurações básicas
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# Instalar dependências de compilação e Chromium necessárias para o WhatsApp Web JS
RUN apt-get update && apt-get install -y \
    git python3 python3-pip python3-venv build-essential \
    curl wget unzip jq sqlite3 ca-certificates lsb-release xdg-utils \
    fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
    libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 \
    libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    && rm -rf /var/lib/apt/lists/*

# Baixar apenas arquivos essenciais do repositório (como o setup.sh faz)
RUN git init && \
    git remote add origin https://github.com/MKCodec/Mwsm.git && \
    git config core.sparseCheckout true && \
    echo -e 'fonts/\nicon.png\nindex.html\njquery.js\nmwsm.db\nmwsm.js\nmwsm.json\nnodemon.json\npackage.json\nscript.js\nsocket.io.js\nstyle.css\nversion.json\nmwsm.py' > .git/info/sparse-checkout && \
    git pull origin main || git pull origin master

# Instalar dependências Node (sem lockfile — sempre atualizando o WhatsApp Web JS)
RUN npm install --no-audit --no-fund --force

# Criar ambiente Python e instalar dependências da IA
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir \
      flask==2.2.5 \
      sentence-transformers==2.2.2 \
      huggingface_hub==0.10.1 \
      torch==2.9.0+cpu \
      torchvision==0.24.0+cpu \
      --index-url https://download.pytorch.org/whl/cpu

# =========================
# 🚀 Etapa 2: Runtime (Execução final)
# =========================
FROM node:20-bullseye

WORKDIR /var/api/Mwsm
ENV PATH="/opt/venv/bin:$PATH"
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# Instalar dependências Linux necessárias para Chromium e o WhatsApp Web JS
RUN apt-get update && apt-get install -y \
    python3 git curl wget jq sqlite3 ca-certificates \
    fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
    libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 \
    libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    lsb-release xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# Copiar ambiente Python e arquivos Node do builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# Instalar PM2 global (gerenciador de processos)
RUN npm install -g pm2 --silent --no-audit --no-fund

# Garantir timezone correto
RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime

# Expor portas do Mwsm (Node e Flask)
EXPOSE 8000 5005

# Iniciar automaticamente com PM2 (define mwsm.js + mwsm.py)
CMD ["pm2-runtime", "start", "mwsm.json"]
