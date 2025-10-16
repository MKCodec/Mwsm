#!/usr/bin/env python3
import os
import sys
import logging
import warnings
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import huggingface_hub.file_download as fd
from huggingface_hub import constants

# =========================================
# 🔇 SILÊNCIO TOTAL NO TERMINAL
# =========================================
sys.stdout = open(os.devnull, 'w')
sys.stderr = open(os.devnull, 'w')
warnings.filterwarnings("ignore")

# =========================================
# 🧩 LOG CONFIG
# =========================================
log_path = "/var/api/Mwsm/mwsm.log"
os.makedirs(os.path.dirname(log_path), exist_ok=True)

# Prefixo fixo padronizado
PREFIX = "> Bot-Mwsm :"

def log(message, level="info"):
    """Loga mensagens com prefixo padronizado."""
    full_message = f"{PREFIX} {message}"
    if level == "error":
        logging.error(full_message)
    else:
        logging.info(full_message)

logging.basicConfig(
    filename=log_path,
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
)
if not os.environ.get("HF_ENDPOINT"):
    os.environ["HF_ENDPOINT"] = "https://huggingface.co"
os.environ["HF_HUB_OFFLINE"] = "0"

fd.HUGGINGFACE_CO_PREFIX = os.environ["HF_ENDPOINT"]
fd._CACHED_API_URL = f"{os.environ['HF_ENDPOINT']}/api"
constants.HUGGINGFACE_CO_URL_TEMPLATE = f"{os.environ['HF_ENDPOINT']}/{{repo_id}}/resolve/{{revision}}/{{filename}}"

log("Endpoint Hugging Face: https://huggingface.co")
log(f"_CACHED_API_URL: {fd._CACHED_API_URL}")
log(f"HUGGINGFACE_CO_URL_TEMPLATE: {constants.HUGGINGFACE_CO_URL_TEMPLATE}")
log("Loading SentenceTransformer model...")
try:
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    log("Model loaded successfully.")
except Exception as e:
    log(f"Model loading failed: {e}", level="error")
    sys.exit(1)
app = Flask(__name__)
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "online", "model": "all-MiniLM-L6-v2"}), 200
@app.route("/embed", methods=["POST"])
def embed():
    data = request.json or {}
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "Missing or empty 'text' field"}), 400
    try:
        embedding = model.encode([text])[0].tolist()
        return jsonify({"embedding": embedding}), 200
    except Exception as e:
        log(f"Embedding processing error: {e}", level="error")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    log("Flask server started on http://0.0.0.0:5005")
    app.run(host="0.0.0.0", port=5005)
