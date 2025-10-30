# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node:20.19.1-bookworm-slim AS builder

WORKDIR /var/api/Mwsm
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# -----------------------------------------------------------------
# Instala dependências essenciais + Rust (necessário p/ tokenizers)
# -----------------------------------------------------------------
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
      git curl wget unzip build-essential pkg-config \
      python3 python3-dev python3-pip python3-venv \
      rustc cargo \
      chromium chromium-driver \
      sqlite3 jq ca-certificates openssl lsb-release \
      fonts-dejavu fonts-liberation fontconfig locales \
      libgomp1 libopenblas-dev liblapack-dev \
      libxshmfence1 libgbm1 libxkbcommon0 libdrm2 \
      libasound2 libpulse0 \
      libcairo2 libpango1.0-0 libpangocairo-1.0-0 \
      libappindicator3-1 libatk-bridge2.0-0 libatk1.0-0 \
      libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
      libxcursor1 libxdamage1 libxext6 libxfixes3 \
      libxi6 libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils dbus \
    && locale-gen pt_BR.UTF-8 && \
    rm -rf /var/lib/apt/lists/*

ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8

# -----------------------------------------------------------------
# Clone do repositório (raso)
# -----------------------------------------------------------------
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .

# -----------------------------------------------------------------
# Instala dependências Node.js (mantendo versões do package.json)
# -----------------------------------------------------------------
RUN npm install --no-audit --no-fund

# -----------------------------------------------------------------
# Ambiente virtual Python com versões fixas
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
FROM node:20.19.1-bookworm-slim

WORKDIR /var/api/Mwsm
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8
ENV PATH="/opt/venv/bin:$PATH"

# -----------------------------------------------------------------
# Instala dependências mínimas do runtime
# -----------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv chromium chromium-driver \
    sqlite3 ca-certificates openssl fontconfig locales \
    fonts-dejavu fonts-liberation \
    libgomp1 libopenblas-dev liblapack-dev \
    libxshmfence1 libgbm1 libxkbcommon0 libdrm2 \
    libasound2 libpulse0 libcairo2 libpango1.0-0 \
    libpangocairo-1.0-0 libappindicator3-1 libatk-bridge2.0-0 \
    libatk1.0-0 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
    libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils dbus \
  && locale-gen pt_BR.UTF-8 && \
  ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
  rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# Copia ambiente Python e código do builder
# -----------------------------------------------------------------
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# -----------------------------------------------------------------
# PM2 para gerenciar processos
# -----------------------------------------------------------------
RUN npm install -g pm2 --silent --no-audit --no-fund

# -----------------------------------------------------------------
# Variáveis do Honeygain
# -----------------------------------------------------------------
ARG HG_EMAIL
ARG HG_PASS
ENV HG_EMAIL=$HG_EMAIL
ENV HG_PASS=$HG_PASS

# -----------------------------------------------------------------
# Copia o binário oficial do Honeygain
# -----------------------------------------------------------------
COPY --from=honeygain/honeygain:latest /entrypoint.sh /usr/local/bin/honeygain-cli
RUN chmod +x /usr/local/bin/honeygain-cli

EXPOSE 8000 5005
CMD ["pm2-runtime", "start", "mwsm.json"]

