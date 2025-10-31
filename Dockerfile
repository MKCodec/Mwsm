# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node:20.19.1-bookworm-slim AS builder

WORKDIR /var/api/Mwsm
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8

# -----------------------------------------------------------------
# Instala dependências essenciais + Rust
# -----------------------------------------------------------------
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
      git curl wget unzip build-essential pkg-config \
      python3 python3-dev python3-pip python3-venv \
      rustc cargo \
      chromium chromium-driver \
      sqlite3 jq ca-certificates openssl fontconfig locales \
      fonts-dejavu fonts-liberation \
      libgomp1 libopenblas-dev liblapack-dev \
      libxshmfence1 libgbm1 libxkbcommon0 libdrm2 \
      libasound2 libpulse0 libcairo2 libpango1.0-0 \
      libpangocairo-1.0-0 libappindicator3-1 libatk-bridge2.0-0 \
      libatk1.0-0 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
      libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
      libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils dbus && \
    locale-gen pt_BR.UTF-8 && \
    rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# Clone do repositório (raso)
# -----------------------------------------------------------------
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .

# -----------------------------------------------------------------
# Instala dependências Node.js
# -----------------------------------------------------------------
RUN npm install --no-audit --no-fund

# -----------------------------------------------------------------
# ⚙️ Aplica patch no WhatsApp Web.js
# -----------------------------------------------------------------
RUN FILE="/var/api/Mwsm/node_modules/whatsapp-web.js/src/util/Injected/Store.js"; \
    if [ -f "$FILE" ]; then \
        sed -i 's/() => false/() => true/' "$FILE"; \
    fi

# -----------------------------------------------------------------
# Ambiente Python (fixo, compatível com Debian Bookworm / Python 3.11)
# -----------------------------------------------------------------
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --no-cache-dir \
      "filelock<3.13.0" \
      "typing-extensions<4.6.0" \
      "flask==2.2.5" \
      "sentence-transformers==2.2.2" \
      "transformers==4.25.1" \
      "safetensors==0.3.1" \
      "huggingface_hub==0.10.1" \
      "torch==2.1.0+cpu" \
      "torchvision==0.16.0+cpu" \
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
    libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils dbus && \
  locale-gen pt_BR.UTF-8 && \
  ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
  rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------
# Copia ambiente Python e código do builder
# -----------------------------------------------------------------
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# -----------------------------------------------------------------
# Instala PM2 e define o entrypoint
# -----------------------------------------------------------------
RUN npm install -g pm2 --silent --no-audit --no-fund

EXPOSE 8000 5005
CMD ["pm2-runtime", "start", "mwsm.json"]
