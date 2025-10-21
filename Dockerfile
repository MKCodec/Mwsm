# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node:20-trixie AS builder

WORKDIR /var/api/Mwsm
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# -----------------------------------------------------------------
# 🔧 Dependências completas (equivalentes ao mwsm.sh ultimate)
# Inclui: Python, Node, Git, DBs, IA libs, e ferramentas do sistema
# -----------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
  git curl wget unzip jq nano vim sudo \
  build-essential pkg-config python3 python3-pip python3-venv python3-dev \
  sqlite3 sqlite3-tools libsqlite3-dev \
  libatlas-base-dev libopenblas-dev liblapack-dev gfortran \
  libffi-dev libssl-dev libxml2-dev libxslt1-dev zlib1g-dev \
  ca-certificates fonts-liberation xdg-utils lsb-release \
  nodejs npm pm2 \
  ffmpeg imagemagick ghostscript \
  chromium chromium-driver \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc-s1 libglib2.0-0 \
  libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 libappindicator3-1 \
  && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# 🎯 Clone do repositório Mwsm
# -----------------------------------------------------------------
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .

# -----------------------------------------------------------------
# 🧩 Instalação Node.js
# -----------------------------------------------------------------
RUN npm install --no-audit --no-fund

# -----------------------------------------------------------------
# 🧠 Ambiente virtual Python e bibliotecas de IA
# -----------------------------------------------------------------
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --no-cache-dir \
      flask==2.2.5 \
      sentence-transformers==2.2.2 \
      huggingface_hub==0.10.1 \
      torch torchvision torchaudio \
      transformers==4.38.0 \
      accelerate==0.27.2 \
      safetensors==0.4.2 \
      numpy pandas tqdm requests psutil pillow \
      scikit-learn scipy \
      matplotlib seaborn \
      --extra-index-url https://download.pytorch.org/whl/cpu

# =========================
# 📦 Etapa 2: Runtime
# =========================
FROM node:20-trixie

WORKDIR /var/api/Mwsm
ENV PATH="/opt/venv/bin:$PATH"
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# -----------------------------------------------------------------
# 🔹 Dependências de execução equivalentes (runtime mínimo completo)
# -----------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 python3-venv sqlite3 ca-certificates fonts-liberation \
  ffmpeg imagemagick ghostscript \
  chromium chromium-driver \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc-s1 libglib2.0-0 \
  libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 libappindicator3-1 xdg-utils \
  && ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
  && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# 🔄 Copiar ambiente virtual e código-fonte do builder
# -----------------------------------------------------------------
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# -----------------------------------------------------------------
# ⚙️ PM2 global
# -----------------------------------------------------------------
RUN npm install -g pm2 --silent --no-audit --no-fund

# -----------------------------------------------------------------
# 🔌 Portas expostas
# -----------------------------------------------------------------
EXPOSE 8000 5005

# -----------------------------------------------------------------
# 🚀 Inicialização do Mwsm
# -----------------------------------------------------------------
CMD ["pm2-runtime", "start", "mwsm.json"]
