# ===============================
# 🧩 Etapa 1 — Builder
# ===============================
FROM node:20-slim AS builder

WORKDIR /app
ENV DEBIAN_FRONTEND=noninteractive

# Instalar Python + deps mínimas
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
      python3 python3-pip python3-venv git build-essential && \
    python3 -m pip install --no-cache-dir --upgrade pip setuptools wheel && \
    python3 -m pip install --no-cache-dir \
      flask==2.2.5 sentence-transformers==2.2.2 huggingface_hub==0.10.1 && \
    npm install -g pm2 --silent --no-audit --no-fund && \
    rm -rf /var/lib/apt/lists/* /root/.cache /tmp/*

# Clonar e instalar o Mwsm
RUN git clone --depth 1 https://github.com/MKCodec/Mwsm.git /app/Mwsm
WORKDIR /app/Mwsm
RUN npm install --omit=dev --no-audit --no-fund --silent && \
    npm cache clean --force

# ===============================
# 🚀 Etapa 2 — Runtime leve
# ===============================
FROM node:20-slim

WORKDIR /app/Mwsm
ENV NODE_ENV=production PYTHONUNBUFFERED=1 DEBIAN_FRONTEND=noninteractive

# Instalar Python mínimo e copiar ambiente
RUN apt-get update -y && apt-get install -y --no-install-recommends python3 && \
    rm -rf /var/lib/apt/lists/* /root/.cache /tmp/*

COPY --from=builder /usr/local/lib/python3* /usr/local/lib/
COPY --from=builder /usr/lib/python3 /usr/lib/python3
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /usr/local/bin/pm2 /usr/local/bin/
COPY --from=builder /app/Mwsm /app/Mwsm

EXPOSE 8000
CMD ["pm2-runtime", "mwsm.js"]
