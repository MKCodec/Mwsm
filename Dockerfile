# ==========================================================
# 🧱 Etapa 1: Builder (imagem imutável do Node via digest)
# ==========================================================
FROM node@sha256:83e53269616ca1b22cf7533e5db4e2f1a0c24a8e818b21691d6d4a69ec9e2c6d AS builder

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8

WORKDIR /var/api/Mwsm

# Instala dependências do sistema necessárias para build e runtime (Torch CPU, SQLite, libs gráficas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git wget curl ca-certificates apt-transport-https lsb-release \
    python3 python3-pip python3-venv python3-dev \
    build-essential pkg-config gfortran libatlas-base-dev \
    libopenblas-dev liblapack-dev libgomp1 \
    sqlite3 libsqlite3-dev \
    xdg-utils dbus locales tzdata \
    fontconfig fonts-dejavu fonts-liberation \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
    libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
    libxss1 libxtst6 libgbm1 libxshmfence1 libxkbcommon0 libdrm2 \
    libasound2 libpulse0 libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    libgtk-3-0 libnss3 libnspr4 libstdc++6 libgcc1 libfontconfig1 \
    && locale-gen pt_BR.UTF-8 \
    && ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
    && rm -rf /var/lib/apt/lists/*

# Copia somente o necessário do repo (clone raso)
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .

# Instala dependências Node respeitando package.json (sem atualizar)
RUN npm install --no-audit --no-fund

# Cria venv e instala pacotes Python nas versões exatas (CPU wheel)
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --no-cache-dir \
      flask==2.2.5 \
      sentence-transformers==2.2.2 \
      huggingface_hub==0.10.1 \
      torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu

# Remove caches (reduz camada)
RUN rm -rf /root/.cache/pip /tmp/*

# ==========================================================
# 🚀 Etapa 2: Runtime (mesma base imutável)
# ==========================================================
FROM node@sha256:83e53269616ca1b22cf7533e5db4e2f1a0c24a8e818b21691d6d4a69ec9e2c6d

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /var/api/Mwsm

# Instala runtime libs mínimas (não atualizar libs do app)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv sqlite3 ca-certificates tzdata \
    fonts-dejavu fonts-liberation fontconfig \
    libgomp1 libopenblas-dev liblapack-dev \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
    libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
    libxss1 libxtst6 libgbm1 libxshmfence1 libxkbcommon0 libdrm2 \
    libasound2 libpulse0 libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    libgtk-3-0 libnss3 libnspr4 libstdc++6 libgcc1 libfontconfig1 xdg-utils dbus \
    && ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
    && rm -rf /var/lib/apt/lists/*

# Copia ambiente Python e código do builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# Instala PM2 globalmente (versão do registry; isso não altera package.json do app)
RUN npm install -g pm2 --no-fund --no-audit

# Expõe portas do serviço
EXPOSE 8000 5005

# Workdir por segurança
WORKDIR /var/api/Mwsm

# Inicializa via PM2 (mantém comport. original do seu script)
CMD ["pm2-runtime", "start", "mwsm.json"]
