# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node:20-trixie AS builder

WORKDIR /var/api/Mwsm

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# -----------------------------------------------------------------
# 🔧 Atualização e instalação de dependências completas
# -----------------------------------------------------------------
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
  git python3 python3-pip python3-venv python3-dev build-essential curl wget unzip jq sqlite3 ca-certificates lsb-release xdg-utils fonts-liberation \
  libblas-dev liblapack-dev libopenblas-dev gfortran rustc cargo \
  libayatana-appindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
  libgbm1 libgcc-s1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
  libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# 🎯 Clone completo raso do repositório Mwsm
# -----------------------------------------------------------------
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .

# -----------------------------------------------------------------
# 📦 Instalação das dependências Node.js
# -----------------------------------------------------------------
RUN npm install --no-audit --no-fund

# -----------------------------------------------------------------
# 🧠 Ambiente virtual Python e pacotes essenciais
# -----------------------------------------------------------------
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir \
      flask==2.2.5 \
      sentence-transformers==2.2.2 \
      huggingface_hub==0.10.1 \
      torch torchvision \
      --extra-index-url https://download.pytorch.org/whl/cpu


# =========================
# 🚀 Etapa 2: Runtime
# =========================
FROM node:20-trixie

WORKDIR /var/api/Mwsm
ENV PATH="/opt/venv/bin:$PATH"
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# -----------------------------------------------------------------
# 🔧 Atualização e dependências mínimas de execução
# -----------------------------------------------------------------
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
  python3 python3-venv ca-certificates fonts-liberation \
  rustc cargo liblapack-dev libopenblas-dev gfortran \
  libayatana-appindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
  libgbm1 libgcc-s1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
  libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils \
  && ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# 📂 Copiar ambiente virtual e fonte do builder
# -----------------------------------------------------------------
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# -----------------------------------------------------------------
# ⚙️ Instalação global do PM2
# -----------------------------------------------------------------
RUN npm install -g pm2 --silent --no-audit --no-fund

# -----------------------------------------------------------------
# 🌐 Portas utilizadas
# -----------------------------------------------------------------
EXPOSE 8000 5005

# -----------------------------------------------------------------
# 🏁 Inicialização do serviço
# -----------------------------------------------------------------
CMD ["pm2-runtime", "start", "mwsm.json"]
