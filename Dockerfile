# =============================
# Stage 1 – Builder (Python + Node)
# =============================
FROM node:20-slim AS builder
WORKDIR /app

# Instalar Python e dependências mínimas
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends python3 python3-pip git && \
    rm -rf /var/lib/apt/lists/*

# Copiar repositório Mwsm
COPY . .

# Instalar dependências Node (produção apenas)
RUN npm ci --omit=dev --silent --no-audit --no-fund

# Instalar dependências Python (Flask e SentenceTransformer)
RUN pip install --no-cache-dir flask==2.2.5 \
    sentence-transformers==2.2.2 \
    huggingface_hub==0.10.1

# ============================
# Stage 2 – Runtime (mínimo)
# ============================
FROM node:20-slim
WORKDIR /app

# Copiar tudo do builder
COPY --from=builder /app /app

# Instalar Python runtime (sem cache)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# PM2 global (modo runtime)
RUN npm install -g pm2 --silent --no-audit --no-fund

# Expor portas (Node + Flask)
EXPOSE 8000 5005

# Comando principal
CMD ["pm2-runtime", "mwsm.json"]

