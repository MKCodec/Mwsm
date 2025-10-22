# ==========================================================
# 🧩 Dockerfile.fullupgrade — Debian 13 (Multi-stage)
# Inclui upgrade total do sistema e dependências fixas
# ==========================================================

# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node@sha256:83e53269616ca1b22cf7533e5db4e2f1a0c24a8e818b21691d6d4a69ec9e2c6d AS builder

LABEL maintainer="MKCodec <dev@mkcodec.org>"
WORKDIR /var/api/Mwsm
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8

# -----------------------------------------------------------------
# 🔧 1. Atualização completa do sistema + dependências de build
# -----------------------------------------------------------------
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        git python3 python3-dev python3-pip python3-venv \
        build-essential pkg-config curl wget unzip jq sqlite3 \
        ca-certificates openssl lsb-release xdg-utils dbus \
        fontconfig fonts-dejavu fonts-liberation locales \
        libgomp1 libopenblas-dev liblapack-dev gfortran \
        libxshmfence1 libgbm1 libxkbcommon0 libdrm2 \
        libasound2 libpulse0 \
        libcairo2 libpango1.0-0 libpangocairo-1.0-0 \
        libappindicator3-1 libatk-bridge2.0-0 libatk1.0-0 \
        libc6 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
        libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
        libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
        libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
        libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
        libxss1 libxtst6 chromium chromium-driver && \
    locale-gen pt_BR.UTF-8 && \
    rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# 🎯 2. Clone completo do repositório
# -----------------------------------------------------------------
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .

# -----------------------------------------------------------------
# 📦 3. Instala dependências Node.js (sem atualizar versões)
# -----------------------------------------------------------------
RUN npm install --no-audit --no-fund

# -----------------------------------------------------------------
# 🐍 4. Cria venv e instala dependências Python (versões fixas)
# -----------------------------------------------------------------
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir \
        torch==2.4.0 \
        torchvision==0.19.0 \
        torchaudio==2.4.0 \
        transformers==4.44.2 \
        sentencepiece==0.2.0 \
        accelerate==0.34.0 \
        safetensors==0.4.5 \
        fastapi==0.115.0 \
        uvicorn==0.30.6 \
        aiofiles==24.1.0 \
        python-multipart==0.0.9 \
        requests==2.32.3 \
        beautifulsoup4==4.12.3 \
        lxml==5.2.1 \
        nltk==3.9.1 \
        pandas==2.2.3 \
        numpy==2.1.2 \
        scikit-learn==1.5.2


# =========================
# 🚀 Etapa 2: Runtime
# =========================
FROM node@sha256:83e53269616ca1b22cf7533e5db4e2f1a0c24a8e818b21691d6d4a69ec9e2c6d

WORKDIR /var/api/Mwsm
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8
ENV PATH="/opt/venv/bin:$PATH"

# -----------------------------------------------------------------
# ⚙️ 5. Instala dependências de execução
# -----------------------------------------------------------------
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        python3 python3-venv sqlite3 ca-certificates openssl \
        fonts-dejavu fonts-liberation fontconfig locales \
        libgomp1 libopenblas-dev liblapack-dev \
        libxshmfence1 libgbm1 libxkbcommon0 libdrm2 \
        libasound2 libpulse0 \
        libcairo2 libpango1.0-0 libpangocairo-1.0-0 \
        libappindicator3-1 libatk-bridge2.0-0 libatk1.0-0 \
        libc6 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
        libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
        libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
        libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
        libxi6 libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils dbus chromium && \
    locale-gen pt_BR.UTF-8 && \
    ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# 🧩 6. Copia app + venv do builder
# -----------------------------------------------------------------
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# -----------------------------------------------------------------
# 🔄 7. Instala PM2 global
# -----------------------------------------------------------------
RUN npm install -g pm2 --silent --no-audit --no-fund

# -----------------------------------------------------------------
# 🌐 8. Portas e inicialização
# -----------------------------------------------------------------
EXPOSE 8000 5005
CMD ["pm2-runtime", "start", "mwsm.json"]
