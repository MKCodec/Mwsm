# ==================================
# Stage 1 – Builder (Node + Python)
# ==================================
FROM node:20-slim AS builder
WORKDIR /var/api/Mwsm

# Instalar Python, Git e utilitários essenciais
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends python3 python3-pip python3-venv git curl && \
    rm -rf /var/lib/apt/lists/*

# Criar ambiente virtual Python
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copiar repositório
COPY . .

# Instalar dependências Node (produção)
RUN npm install --omit=dev --silent --no-audit --no-fund

# Instalar dependências Python (CPU-only)
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu \
    flask==2.2.5 \
    sentence-transformers==2.2.2 \
    huggingface_hub==0.10.1

# Limpeza de cache
RUN find /opt/venv -name "*.dist-info" -exec rm -rf {} + && \
    find /opt/venv -name "__pycache__" -exec rm -rf {} + && \
    rm -rf /root/.cache


# ============================
# Stage 2 – Runtime (final)
# ============================
FROM node:20-slim
WORKDIR /var/api/Mwsm

# Dependências do Chromium / Puppeteer / WhatsApp Web
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
    libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
    libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release \
    wget curl git jq xdg-utils build-essential && \
    rm -rf /var/lib/apt/lists/*

# Instalar Python runtime mínimo
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Copiar ambiente virtual e app do builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /var/api/Mwsm /var/api/Mwsm

# Ativar ambiente virtual
ENV PATH="/opt/venv/bin:$PATH"

# Instalar PM2 global
RUN npm install -g pm2 --silent --no-audit --no-fund

# 🔹 Instalar Puppeteer completo (com Chromium embutido)
RUN npm install puppeteer@21.3.8 --silent --no-audit --no-fund

# 🔹 Baixar manualmente o Chrome correto e validar
RUN node -e "const p=require('puppeteer');p.createBrowserFetcher().download('127.0.6533.88').then(()=>console.log('✅ Chromium baixado com sucesso')).catch(console.error)"

# Expor portas (Node + Flask)
EXPOSE 8000 5005

# Comando principal
CMD ["pm2-runtime", "mwsm.json"]
