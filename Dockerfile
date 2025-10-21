# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node:20-trixie AS builder

WORKDIR /var/api/Mwsm

# Configurações básicas (para o builder)
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# -----------------------------------------------------------------
# Instalação de dependências do sistema (Python, Git, e libs de runtime)
# -----------------------------------------------------------------
RUN apt-get update && apt-get install -y \
  git python3 python3-pip python3-venv build-essential curl wget unzip jq sqlite3 ca-certificates lsb-release xdg-utils fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
  libgbm1 libgcc-s1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
  libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
  && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# 🎯 Clone Completo Raso do repositório
# -----------------------------------------------------------------
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .

# -----------------------------------------------------------------
# Instalação das dependências Node.js
# -----------------------------------------------------------------
RUN npm install --no-audit --no-fund

# -----------------------------------------------------------------
# Criação do ambiente virtual Python e instalação dos pacotes
# -----------------------------------------------------------------
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --no-cache-dir \
      flask==2.2.5 \
      sentence-transformers==2.2.2 \
      huggingface_hub==0.10.1 \
      torch \
      torchvision \
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
# Instalação mínima de dependências no runtime
# Inclui bibliotecas essenciais para Puppeteer / Chromium headless
# -----------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 python3-venv ca-certificates fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
  libgbm1 libgcc-s1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
  libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils \
  && ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
  && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# Copiar ambiente virtual e código-fonte do builder
# -----------------------------------------------------------------
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# -----------------------------------------------------------------
# Instalação do PM2 (global)
# -----------------------------------------------------------------
RUN npm install -g pm2 --silent --no-audit --no-fund

# Expor as portas utilizadas
EXPOSE 8000 5005

# -----------------------------------------------------------------
# Comando principal de inicialização
# -----------------------------------------------------------------
CMD ["pm2-runtime", "start", "mwsm.json"]
