# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node:20-bookworm-slim AS builder

WORKDIR /var/api/Mwsm

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=America/Sao_Paulo \
    LANG=pt_BR.UTF-8 \
    LC_ALL=pt_BR.UTF-8

# -----------------------------------------------------------------
# Instalação de dependências completas para build
# -----------------------------------------------------------------
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
  git python3 python3-pip python3-venv python3-dev \
  build-essential pkg-config curl wget unzip jq sqlite3 \
  ca-certificates openssl lsb-release xdg-utils dbus \
  fontconfig fonts-dejavu fonts-liberation locales \
  libgomp1 libopenblas-dev liblapack-dev \
  libxshmfence1 libgbm1 libxkbcommon0 libdrm2 \
  libasound2 libpulse0 \
  libcairo2 libpango1.0-0 libpangocairo-1.0-0 \
  libappindicator3-1 libatk-bridge2.0-0 libatk1.0-0 \
  libgtk-3-0 libnss3 libx11-6 libxss1 libxtst6 \
  && locale-gen pt_BR.UTF-8 \
  && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# 🎯 Clone raso do repositório
# -----------------------------------------------------------------
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .

# -----------------------------------------------------------------
# Instalação das dependências Node.js
# -----------------------------------------------------------------
RUN npm install --no-fund && npm audit fix --force || true

# -----------------------------------------------------------------
# Criação do ambiente virtual Python e instalação dos pacotes
# -----------------------------------------------------------------
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --no-cache-dir \
      flask==2.2.5 \
      sentence-transformers==2.2.2 \
      huggingface_hub==0.10.1 \
      torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    /opt/venv/bin/pip check || true


# =========================
# 🚀 Etapa 2: Runtime
# =========================
FROM node:20-bookworm-slim

WORKDIR /var/api/Mwsm

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=America/Sao_Paulo \
    LANG=pt_BR.UTF-8 \
    LC_ALL=pt_BR.UTF-8 \
    PATH="/opt/venv/bin:$PATH"

# -----------------------------------------------------------------
# Instalação mínima porém completa de dependências
# -----------------------------------------------------------------
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
  python3 python3-venv sqlite3 ca-certificates openssl \
  fonts-dejavu fonts-liberation fontconfig locales \
  libgomp1 libopenblas-dev liblapack-dev \
  libxshmfence1 libgbm1 libxkbcommon0 libdrm2 \
  libasound2 libpulse0 \
  libcairo2 libpango1.0-0 libpangocairo-1.0-0 \
  libappindicator3-1 libatk-bridge2.0-0 libatk1.0-0 \
  libgtk-3-0 libnss3 libx11-6 libxss1 libxtst6 xdg-utils dbus \
  && locale-gen pt_BR.UTF-8 && \
  ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
  apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /root/.cache

# -----------------------------------------------------------------
# Copiar ambiente virtual e código-fonte do builder
# -----------------------------------------------------------------
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# -----------------------------------------------------------------
# Instalar e corrigir dependências Node globalmente
# -----------------------------------------------------------------
RUN npm install -g pm2 --no-fund && npm audit fix --force || true

# -----------------------------------------------------------------
# Expor portas utilizadas
# -----------------------------------------------------------------
EXPOSE 8000 5005

# -----------------------------------------------------------------
# Comando principal
# -----------------------------------------------------------------
CMD ["pm2-runtime", "start", "mwsm.json"]
