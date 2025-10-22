# =========================
# 🧱 Etapa 1: Builder
# =========================
FROM node:20-bookworm AS builder

WORKDIR /var/api/Mwsm
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
      git python3 python3-pip python3-venv python3-dev \
      build-essential pkg-config curl wget unzip jq sqlite3 \
      ca-certificates openssl lsb-release xdg-utils dbus \
      fontconfig fonts-dejavu fonts-liberation locales \
      libgomp1 libopenblas-dev liblapack-dev \
      libxshmfence1 libgbm1 libxkbcommon0 libdrm2 \
      libasound2 libpulse0 \
      libcairo2 libpango1.0-0 libpangocairo-1.0-0 \
      libappindicator3-1 libatk-bridge2.0-0 libatk1.0-0 \
      libc6 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
      libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
      libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
      libxcomposite1 libxcursor1 libxdamage1 libxext6 \
      libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    && locale-gen pt_BR.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git .
RUN npm install --no-audit --no-fund

RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir \
      flask==2.2.5 \
      sentence-transformers==2.2.2 \
      huggingface_hub==0.10.1 \
      torch==2.0.1+cpu torchvision==0.15.2+cpu \
      --extra-index-url https://download.pytorch.org/whl/cpu


# =========================
# 🚀 Etapa 2: Runtime
# =========================
FROM node:20-bookworm

WORKDIR /var/api/Mwsm
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8
ENV PATH="/opt/venv/bin:$PATH"

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
      libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
      libxcomposite1 libxcursor1 libxdamage1 libxext6 \
      libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
      xdg-utils dbus chromium \
    && locale-gen pt_BR.UTF-8 && \
    ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    rm -rf /var/lib/apt/lists/*

# Chromium path fix (necessário para puppeteer/whatsapp-web.js)
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

RUN npm install -g pm2 --silent --no-audit --no-fund

EXPOSE 8000 5005
CMD ["pm2-runtime", "start", "mwsm.json"]
