# ==========================================
# 📦 Mwsm - Dockerfile Debian 13 (Full)
# Baseado no mwsm.sh ultimate (compatível 100%)
# ==========================================
FROM debian:13-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# Atualização e ferramentas básicas
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    curl wget git unzip zip tar jq sudo ca-certificates gnupg lsb-release && \
    apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv python3-dev && \
    apt-get install -y --no-install-recommends \
    build-essential g++ gcc make cmake pkg-config libssl-dev libffi-dev && \
    apt-get install -y --no-install-recommends \
    libsqlite3-dev sqlite3 && \
    apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libcairo2 libxkbcommon-x11-0 libgbm1 libasound2 && \
    apt-get install -y --no-install-recommends \
    libgfortran5 libatlas-base-dev libopenblas-dev liblapack-dev && \
    apt-get install -y --no-install-recommends \
    ffmpeg nodejs npm && \
    apt-get install -y --no-install-recommends \
    fonts-noto-color-emoji xz-utils zlib1g-dev libncurses5-dev libncursesw5-dev && \
    apt-get install -y --no-install-recommends \
    nano vim net-tools iputils-ping && \
    npm install -g pm2 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copiar código do Mwsm
COPY . .

# Expor porta padrão do Mwsm
EXPOSE 3000

# Iniciar o aplicativo com PM2
CMD ["pm2-runtime", "start", "mwsm.sh"]
