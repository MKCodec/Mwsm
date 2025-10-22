# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node:20-trixie AS builder

WORKDIR /var/api/Mwsm

# Configurações básicas
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# -----------------------------------------------------------------
# Instalação de dependências completas do sistema
# (Simulação do mwsm.sh ultimate no Debian 13)
# -----------------------------------------------------------------
RUN apt-get update && apt-get install -y \
  # Núcleo de build e ferramentas essenciais
  build-essential curl wget git jq unzip ca-certificates xdg-utils lsb-release fonts-liberation tzdata locales sudo nano net-tools iputils-ping \
  # Python e ambiente científico
  python3 python3-pip python3-venv python3-dev gfortran libatlas-base-dev libopenblas-dev liblapack-dev python3-numpy python3-scipy python3-pandas python3-sqlalchemy \
  # SQLite e dependências do banco
  sqlite3 libsqlite3-dev \
  # Dependências de IA e compatibilidade com PyTorch e Transformers
  libffi-dev libssl-dev libxml2-dev libxslt1-dev zlib1g-dev libjpeg-dev libpng-dev \
  # Suporte gráfico e Chromium headless
  libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
  libgbm1 libgcc-s1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
  libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 chromium \
  # Outras ferramentas utilizadas pelo mwsm.sh ultimate
  pm2 nodejs npm \
  && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# 🎯 Clone raso do repositório
# -----------------------------------------------------------------
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .

# -----------------------------------------------------------------
# Instalação das dependências Node.js
# -----------------------------------------------------------------
RUN npm install --no-audit --no-fund

# -----------------------------------------------------------------
# Criação do ambiente virtual Python e instalação dos pacotes de IA
# -----------------------------------------------------------------
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --no-cache-dir \
      flask==2.2.5 \
      sentence-transformers==2.2.2 \
      huggingface_hub==0.10.1 \
      torch \
      torchvision \
      numpy scipy pandas sqlalchemy \
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
# Instalação mínima porém funcional (tudo que o mwsm precisa em runtime)
# -----------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 python3-venv ca-certificates fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
  libgbm1 libgcc-s1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
  libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils \
  chromium sqlite3 git curl wget jq nano \
  && ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
  && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# Copiar ambiente virtual e código-fonte
# -----------------------------------------------------------------
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# -----------------------------------------------------------------
# Instalação global do PM2
# -----------------------------------------------------------------
RUN npm install -g pm2 --silent --no-audit --no-fund

# Expor as portas utilizadas
EXPOSE 8000 5005

# -----------------------------------------------------------------
# Comando principal de inicialização
# -----------------------------------------------------------------
CMD ["pm2-runtime", "start", "mwsm.json"]
