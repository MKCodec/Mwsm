# =============================
# Stage 1 – Builder (Python + Node)
# =============================
FROM node:20-slim AS builder
WORKDIR /app

# Instalar Python e dependências mínimas
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends python3 python3-pip python3-venv git && \
    rm -rf /var/lib/apt/lists/*

# Criar e ativar ambiente virtual Python
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copiar repositório Mwsm
COPY . .

# Instalar dependências Node (produção apenas)
RUN npm ci --omit=dev --silent --no-audit --no-fund

# Instalar dependências Python (somente CPU)
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu \
    flask==2.2.5 \
    sentence-transformers==2.2.2 \
    huggingface_hub==0.10.1

# Remover caches e arquivos temporários
RUN find /opt/venv -name "*.dist-info" -exec rm -rf {} + && \
    find /opt/venv -name "__pycache__" -exec rm -rf {} + && \
    rm -rf /root/.cache

# ============================
# Stage 2 – Runtime (mínimo)
# ============================
FROM node:20-slim
WORKDIR /app

# Instalar Python runtime mínimo
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends python3 python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Copiar ambiente virtual e app do builder
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app

# Ativar o ambiente virtual
ENV PATH="/opt/venv/bin:$PATH"

# PM2 global (modo runtime)
RUN npm install -g pm2 --silent --no-audit --no-fund

# Expor portas (Node + Flask)
EXPOSE 8000 5005

# Comando principal
CMD ["pm2-runtime", "mwsm.json"]

