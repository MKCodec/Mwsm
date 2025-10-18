# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node:20-bullseye AS builder

WORKDIR /var/api/Mwsm

# Configurações básicas (para o builder)
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# Instalação de dependências do sistema necessárias para BUILD e RUNTIME
# Não há problema em ter tudo aqui, mas idealmente seria dividido
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

# Clone do Repositório e Instalação de Node.js
RUN git init && \
    git remote add origin https://github.com/MKCodec/Mwsm.git && \
    git config core.sparseCheckout true && \
    echo -e 'fonts/\nicon.png\nindex.html\njquery.js\nmwsm.db\nmwsm.js\nmwsm.json\nnodemon.json\npackage.json\nscript.js\nsocket.io.js\nstyle.css\nversion.json\nmwsm.py' > .git/info/sparse-checkout && \
    git pull origin main || git pull origin master

RUN npm install --no-audit --no-fund # Removido --force

# Criação do Virtual Environment Python
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir \
      flask==2.2.5 \
      sentence-transformers==2.2.2 \
      huggingface_hub==0.10.1 \
      torch \
      torchvision \
      --index-url https://download.pytorch.org/whl/cpu

# =========================
# 📦 Etapa 2: Runtime
# =========================
FROM node:20-bullseye

WORKDIR /var/api/Mwsm
ENV PATH="/opt/venv/bin:$PATH"
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# ATENÇÃO: Se as dependências de sistema listadas no Builder forem estritamente
# necessárias para o runtime (ex.: as libs X11), você precisará delas aqui.
# No entanto, a base 'node:20-bullseye' já contém muitas libs básicas.
# Removido apt-get install duplicado. 

# Configuração do Timezone (melhor com ln -sf)
RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime

# Cópia dos Artefatos do Builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# Instalação do PM2 (Global)
RUN npm install -g pm2 --silent --no-audit --no-fund

EXPOSE 8000 5005

CMD ["pm2-runtime", "start", "mwsm.json"]
