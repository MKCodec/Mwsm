#!/bin/bash

# =====================================
# 📦 Gerenciador do Bot-Mwsm
# =====================================
tput civis

if [ "$(id -u)" -eq 0 ] || [ -f /.dockerenv ] || grep -qE '/docker/' /proc/1/cgroup 2>/dev/null; then
  SUDO=""
else
  SUDO="sudo"
fi

cleanup_terminal() {
  if [ -t 1 ]; then
    stty sane >/dev/null 2>&1 || true
  fi
  command -v tput >/dev/null 2>&1 && tput cnorm >/dev/null 2>&1 || true
}
trap cleanup_terminal EXIT INT TERM

pause_and_restore() {
  tput cnorm >/dev/null 2>&1 || true
  stty sane >/dev/null 2>&1 || true
  sleep 0.2
  echo
  read -rp "Pressione ENTER para voltar ao menu..."
  tput civis >/dev/null 2>&1 || true
}

# ===============================
# Diretórios dinâmicos globais
# ===============================
  BASE_DIR="/var/api/Mwsm"
  LOG_DIR="/var/log"
  LOG_FILE="$LOG_DIR/mwsm.log"
  TMP_SCRIPT="/tmp/mwsm.sh"
  mkdir -p "$BASE_DIR" "$LOG_DIR"
  touch "$LOG_FILE"
  chmod 644 "$LOG_FILE"

if [ -s /proc/$$/fd/0 ]; then
    cat /proc/$$/fd/0 > "$BASE_DIR/mwsm.sh"
    chmod +x "$BASE_DIR/mwsm.sh"
fi

uninstall_concluido() {
  local dirs=(
    "$BASE_DIR"
    "$LOG_DIR"
    "/root/.pm2/logs/Ask-Mwsm-out.log"
    "/root/.pm2/logs/Ask-Mwsm-error.log"
  )

  for d in "${dirs[@]}"; do
    if [ -e "$d" ]; then
      return 1  # ainda tem algo, desinstalação incompleta
    fi
  done

  return 0  # tudo removido → pode pular pro install
}

# =====================================
# 🔍 Detectar distribuição
# =====================================
detect_distro() {
  local id=""
  local codename=""

  if [ -f /etc/os-release ]; then
    . /etc/os-release
    id=$(echo "${ID:-}" | tr '[:upper:]' '[:lower:]')
    codename=$(grep -E '^VERSION_CODENAME=' /etc/os-release | cut -d= -f2 | tr -d '"')
  fi

  if [[ "$id" == "devuan" ]] || grep -qi "devuan" /etc/os-release 2>/dev/null; then
    DISTRO_DETECT="devuan"
    return 0
  fi

  if [[ "$codename" == "bookworm" || "$codename" == "trixie" ]]; then
    DISTRO_DETECT="debian"
    return 0
  fi

  if [[ "$id" == "ubuntu" ]]; then
    DISTRO_DETECT="ubuntu"
    return 0
  fi

  if [ -f /.dockerenv ] || grep -qE '/docker/' /proc/1/cgroup 2>/dev/null; then
    DISTRO_DETECT="docker"
    return 0
  fi

  DISTRO_DETECT="other"
  return 1
}

Setup_Mwsm() {
  local SCRIPT_PATH="$BASE_DIR/mwsm.sh"
  local SRC=""
  local LOG_PREFIX
  LOG_PREFIX="$(date '+%Y-%m-%d %H:%M:%S') - [SETUP]"

  # Detectar origem real do script
  if [ -n "${BASH_SOURCE[0]:-}" ]; then
    SRC="${BASH_SOURCE[0]}"
  fi

  if [ -n "$SRC" ] && realpath "$SRC" >/dev/null 2>&1; then
    SRC="$(realpath "$SRC")"
  fi

  # Evitar usar STDIN (terminal) como fonte
  if [ ! -f "$SRC" ] || [ -z "$SRC" ]; then
    if [[ -r "$0" && "$0" != "bash" ]]; then
      SRC="$0"
    elif [ -r "/proc/self/exe" ]; then
      SRC="/proc/self/exe"
    else
      echo "$LOG_PREFIX ⚠️ Não foi possível determinar o caminho real do script, ignorando restauração" >>"$LOG_FILE"
      return 0
    fi
  fi
  # Se o script destino não existir, restaura a partir da origem detectada
  if [[ -d $BASE_DIR && ! -f "$SCRIPT_PATH" ]]; then
    echo "$LOG_PREFIX 🔁 Restaurando mwsm.sh a partir de $SRC" >>"$LOG_FILE"

    if [ "$(id -u)" -eq 0 ]; then
      cp -f "$SRC" "$SCRIPT_PATH" 2>>"$LOG_FILE" || {
        echo "$LOG_PREFIX ❌ Falha ao copiar $SRC -> $SCRIPT_PATH" >>"$LOG_FILE"
        return 1
      }
      chmod +x "$SCRIPT_PATH" 2>>"$LOG_FILE" || true
    else
      $SUDO bash -c "cp -f '$SRC' '$SCRIPT_PATH' && chmod +x '$SCRIPT_PATH'" 2>>"$LOG_FILE" || {
        echo "$LOG_PREFIX ❌ Falha ao copiar (sudo) $SRC -> $SCRIPT_PATH" >>"$LOG_FILE"
        return 1
      }
    fi

    if [ -f "$SCRIPT_PATH" ]; then
      echo "$LOG_PREFIX ✅ mwsm.sh restaurado em $SCRIPT_PATH" >>"$LOG_FILE"
    else
      echo "$LOG_PREFIX ❌ Após copiar, $SCRIPT_PATH ainda não existe." >>"$LOG_FILE"
      return 1
    fi
  fi

  return 0
}

silent_menu() {
    local local_file="$BASE_DIR/mwsm.sh"
    local remote_url="https://raw.githubusercontent.com/MKCodec/Mwsm/refs/heads/main/bash/mwsm.sh"
    if curl -sL "$remote_url" -o "$local_file"; then
        $SUDO chmod +x "$local_file" >/dev/null 2>&1
        exec "$SUDO" "$local_file" >/dev/null 2>&1 &
        exit 0
    fi
}

export PATH="$PATH:/usr/local/bin:/usr/bin:/bin"
if [ -f /etc/os-release ]; then
  . /etc/os-release
  DISTRO=$(echo "${ID:-}" | tr '[:upper:]' '[:lower:]' | tr -d '"')
else
  DISTRO=""
fi
DISTRO=${DISTRO:-$(lsb_release -si 2>/dev/null | tr '[:upper:]' '[:lower:]')}
echo "$(date '+%Y-%m-%d %H:%M:%S') - [INFO] Detectado sistema: $DISTRO" >>"$LOG_FILE"

# Detecta Devuan (usa eudev, sem systemd)
if grep -qi "devuan" /etc/os-release 2>/dev/null; then
  IS_DEVUAN=true
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [INFO] Detectado sistema Devuan (sem systemd)" >>"$LOG_FILE"
else
  IS_DEVUAN=false
fi

ACTION_DONE=false
INSTALL_FAILED=false
IS_REINSTALL=false
NODE_REPO_FAILED=false
NODE_INSTALL_FAILED=false
NPM_INSTALL_FAILED=false
LAST_SUCCESS=""
detect_distro

# =================================
# Modo de log completo
# =================================
if [[ "$1" == "full" ]]; then
  [ -f "$LOG_FILE" ] && tail -f "$LOG_FILE"
  exit 0
fi

# =================================
# Função de execução
# =================================
run_step() {
  local CMD="$1"
  local MSG="$2"
  local CONTEXT="$3"
  local spin='-\|/'
  local i=0
  tput civis 2>/dev/null
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [STEP] Iniciando: $MSG" >>"$LOG_FILE"

  # Skip manual explícito
  if [ "$CMD" = "skip" ] || [ "$CMD" = "true" ]; then
    for _ in $(seq 30); do
      i=$(((i + 1) % 4))
      printf "\r${spin:$i:1} %s" "$MSG"
      sleep 0.1
    done
    printf "\r✔ %s\n" "$MSG"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [STEP] Finalizado: $MSG (SKIP)" >>"$LOG_FILE"
    return 0
  fi

  # Executa o comando real
  (
    set +e
    if declare -f "${CMD%% *}" >/dev/null 2>&1; then
      ${CMD}
    else
      bash -c "$CMD"
    fi
  ) &>>"$LOG_FILE" &
  local PID=$!

  # Spinner visual
  while kill -0 $PID 2>/dev/null; do
    i=$(((i + 1) % 4))
    printf "\r${spin:$i:1} %s" "$MSG"
    sleep 0.1
  done
  wait $PID
  local STATUS=$?

  # Falso positivo
  if [ $STATUS -ne 0 ]; then
    local LAST_LOG
    LAST_LOG=$(tail -n 15 "$LOG_FILE")

    if echo "$LAST_LOG" | grep -qE "No process found|not a git repository|nothing to commit|already up to date"; then
      for _ in $(seq 30); do
        i=$(((i + 1) % 4))
        printf "\r${spin:$i:1} %s" "$MSG"
        sleep 0.1
      done
      printf "\r✔ %s\n" "$MSG"
      echo "$(date '+%Y-%m-%d %H:%M:%S') - [STEP] Finalizado: $MSG (SKIP)" >>"$LOG_FILE"
      return 0
    fi

    # Erro real
    printf "\r❌ %s\n" "$MSG"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [STEP] Finalizado: $MSG (FAIL)" >>"$LOG_FILE"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [ERROR] Falha ao executar: $CMD" >>"$LOG_FILE"
    INSTALL_FAILED=true
    return 1
  fi

  # Sucesso real
  printf "\r✔ %s\n" "$MSG"
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [STEP] Finalizado: $MSG (OK)" >>"$LOG_FILE"
  return 0
}

# ========================
# Instalar
# ========================
install() {
  local NO_CLEAR=false
  local NO_PAUSE=false

  if [ "$1" = "no_clear" ]; then
    NO_CLEAR=true
  fi
  if [ "$2" = "no_pause" ]; then
    NO_PAUSE=true
  fi

  if [[ -d $BASE_DIR && -f $BASE_DIR/package.json ]]; then
    echo "-------------------------------------"
    echo "⚠️  O Mwsm já está instalado!"
    echo "-------------------------------------"
    sleep 2
    return
  fi

  INSTALL_FAILED=false
  NODE_REPO_FAILED=false
  NODE_INSTALL_FAILED=false
  NPM_INSTALL_FAILED=false
  CUSTOM_API_URL="https://raw.githubusercontent.com/MKCodec/MkAuth-API/main/titulo.api"
  API_PATH="/opt/mk-auth/api/titulo.api"

  if [ "$IS_REINSTALL" = false ]; then
    if [ "$NO_CLEAR" = false ]; then
      clear
      echo "====================================="
      echo "   🚀 Instalando Mwsm"
      echo "====================================="
    fi
  fi

  # -------------------------
  # Pacotes básicos
  # -------------------------

  export DEBIAN_FRONTEND=noninteractive
  $SUDO rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock
  run_step "$SUDO dpkg --configure -a || true" "Corrigindo pendências..." install
  run_step '[[ $(df /opt --output=avail | tail -1) -gt 102400 ]]' "Validando partição..." install

  # Detect distribution precisely (silent)
  detect_distro
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [INFO] DISTRO_DETECT=$DISTRO_DETECT" >>"$LOG_FILE"

  if [[ "$DISTRO_DETECT" == "devuan" ]]; then
    run_step "$SUDO bash -c '
      if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$(echo ${ID:-} | tr [:upper:] [:lower:])
        DEBIAN_VERSION=$(grep VERSION_CODENAME /etc/os-release 2>/dev/null | cut -d= -f2)
        if [ -z \"$DEBIAN_VERSION\" ]; then
          DEBIAN_VERSION=$(grep VERSION_ID /etc/os-release 2>/dev/null | cut -d= -f2 | tr -d \\\" )
        fi

        if [ \"$DISTRO\" = devuan ]; then
          if [ -z \"$DEBIAN_VERSION\" ] || [ \"$DEBIAN_VERSION\" = buster ] || [ \"$DEBIAN_VERSION\" = stretch ]; then
            if [ -f /etc/apt/sources.list ]; then
              sed -i \"s|deb\\.debian\\.org|archive\\.debian\\.org|g\" /etc/apt/sources.list
              sed -i \"s|security\\.debian\\.org|archive\\.debian\\.org/debian-security|g\" /etc/apt/sources.list
            fi
            echo \"Acquire::Check-Valid-Until false;\" > /etc/apt/apt.conf.d/99archive
            apt-get clean -qq >/dev/null 2>&1
            rm -rf /var/lib/apt/lists/* >/dev/null 2>&1
            apt-get update --allow-releaseinfo-change -o Acquire::Check-Valid-Until=false -y -qq >/dev/null 2>&1
          fi
        fi
      fi
    '" "Ajustando repositórios" install

    run_step "$SUDO bash -c 'apt-get clean && rm -rf /var/lib/apt/lists/* && apt-get update --allow-releaseinfo-change -o Acquire::Check-Valid-Until=false -y'" "Recarregando cache APT" install
    run_step "$SUDO bash -c '
      apt --fix-broken install -y || true
      apt-get clean
      apt-get update --allow-releaseinfo-change -y || true
    '" "Reparando dependências quebradas..." install

    run_step "$SUDO apt update -y" "Atualizando pacotes..." install
    run_step "$SUDO apt install -y curl git wget jq build-essential \
      -o Dpkg::Options::='--force-confdef' \
      -o Dpkg::Options::='--force-confold'" "Instalando pacotes base..." install

    run_step "$SUDO apt install -y ca-certificates fonts-liberation libappindicator3-1 \
      libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 \
      libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 \
      libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
      libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
      libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
      libxss1 libxtst6 lsb-release xdg-utils \
      -o Dpkg::Options::='--force-confdef' \
      -o Dpkg::Options::='--force-confold'" "Instalando pacotes extras..." install
  else
run_step "(
  $SUDO apt update -y >>\"$LOG_FILE\" 2>&1
  $SUDO apt upgrade -y \
    -o Dpkg::Options::='--force-confdef' \
    -o Dpkg::Options::='--force-confold' >>\"$LOG_FILE\" 2>&1
  $SUDO apt install -y curl git wget \
    -o Dpkg::Options::='--force-confdef' \
    -o Dpkg::Options::='--force-confold' >>\"$LOG_FILE\" 2>&1
)" "Instalando pacotes base..." install

run_step "$SUDO apt install -y \
  ca-certificates fonts-liberation libappindicator3-1 \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 \
  libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 lsb-release xdg-utils \
  -o Dpkg::Options::='--force-confdef' \
  -o Dpkg::Options::='--force-confold'" "Instalando pacotes extras..." install

run_step '(
  set -e
  if ! '"$SUDO"' apt-get install -y git wget curl jq build-essential libnss3-dev \
    libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2 \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" >/dev/null 2>&1; then
      '"$SUDO"' apt-get install -y libgdk-pixbuf-xlib-2.0-dev \
        -o Dpkg::Options::="--force-confdef" \
        -o Dpkg::Options::="--force-confold" >/dev/null 2>&1
  fi
)' "Instalando dependências..." install

  fi

  # -------------------------
  # Instalando SQLite3 (comum)
  # -------------------------
  run_step "command -v sqlite3 >/dev/null 2>&1 || $SUDO apt-get install -y sqlite3 --no-install-recommends" "Instalando SQLite3" install

  # -------------------------
  # Node.js - Configurar repositório
  # -------------------------
run_step "$SUDO bash -c '
  cd /root || exit 1
  apt-get update -y
  apt-get install -y curl gnupg ca-certificates lsb-release apt-transport-https --no-install-recommends
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || exit 1
'" "Configurando repositório Node.js" install

  if [ "$NODE_REPO_FAILED" = true ]; then
    printf "❌ Instalando Node.js\n"
    printf "❌ Instalando dependências Node\n"
    printf "❌ Iniciando serviços\n"
    INSTALL_FAILED=true
  else
    run_step "$SUDO bash -c '
      cd /root || exit 1
      apt-get update -y
      apt-get install -y nodejs \
        -o Dpkg::Options::=\"--force-confdef\" \
        -o Dpkg::Options::=\"--force-confold\" --no-install-recommends
    '" "Instalando Node.js" install

    if [ "$NODE_INSTALL_FAILED" = true ]; then
      printf "❌ Instalando dependências Node\n"
      printf "❌ Iniciando serviços\n"
      INSTALL_FAILED=true
    else


# -------------------------
# 🐍 Python + Pip + Libs
# -------------------------

# Detecta se o pip suporta --break-system-packages (compatibilidade entre versões)
if python3 -m pip install --help 2>&1 | grep -q -- '--break-system-packages'; then
  PIP_BREAK_OPT="--break-system-packages"
else
  PIP_BREAK_OPT=""
fi

if [[ "$DISTRO_DETECT" == "devuan" ]]; then
  # --- Instalação simplificada (Devuan já possui CUDA + PyTorch nativo) ---
  run_step "$SUDO apt update -y >/dev/null 2>&1 && \
    $SUDO apt install -y python3 python3-pip python3-venv \
    -o Dpkg::Options::='--force-confdef' \
    -o Dpkg::Options::='--force-confold' >/dev/null 2>&1" \
    'Instalando Python' install

  if ! command -v pip3 >/dev/null 2>&1; then
    run_step "$SUDO python3 -m ensurepip --upgrade >/dev/null 2>&1" \
      'Restaurando pip' install
  fi

  run_step "cd /tmp && \
    PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_ROOT_USER_ACTION=ignore \
    $SUDO python3 -m pip install --quiet --no-input --upgrade pip setuptools wheel" \
    'Atualizando Python' install

  run_step "PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_ROOT_USER_ACTION=ignore \
    $SUDO python3 -m pip install --quiet --no-input \
      'flask==2.2.5' \
      'sentence-transformers==2.2.2' \
      'transformers==4.25.1' \
      'safetensors==0.3.1' \
      'huggingface_hub==0.10.1'" \
    'Instalando libs Python' install

else
  # --- Caminho completo para Debian/Ubuntu (sem CUDA) ---
  run_step "$SUDO apt update -y >/dev/null 2>&1 && \
    $SUDO apt install -y python3 python3-pip python3-venv \
    -o Dpkg::Options::='--force-confdef' \
    -o Dpkg::Options::='--force-confold' >/dev/null 2>&1" \
    'Instalando Python' install

  if ! command -v pip3 >/dev/null 2>&1; then
    run_step "$SUDO python3 -m ensurepip --upgrade >/dev/null 2>&1" \
      'Restaurando pip' install
  fi

  run_step "cd /tmp && \
    PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_ROOT_USER_ACTION=ignore \
    $SUDO python3 -m ensurepip --upgrade >/dev/null 2>&1 && \
    $SUDO python3 -m pip install --no-input --quiet --upgrade setuptools wheel >/dev/null 2>&1 || true" \
    'Atualizando Python' install

  run_step "PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_ROOT_USER_ACTION=ignore \
    $SUDO env PIP_EXTRA_INDEX_URL='https://download.pytorch.org/whl/cpu' \
    python3 -m pip install --quiet --no-input $PIP_BREAK_OPT \
      --target=/usr/lib/python3/dist-packages \
      'filelock<3.13.0' \
      'typing-extensions<4.6.0' \
      'flask==2.2.5' \
      'sentence-transformers==2.2.2' \
      'transformers==4.25.1' \
      'safetensors==0.3.1' \
      'huggingface_hub==0.10.1' \
      'torch==1.13.1+cpu' \
      'torchvision==0.14.1+cpu' \
      -f https://download.pytorch.org/whl/cpu >/dev/null 2>&1 || true" \
    'Instalando libs Python' install
fi

if [[ "$DISTRO_DETECT" == "devuan" ]]; then
  # --- Compatibilidade Devuan (simples, sem sobreposição) ---
  run_step "
    command -v pip3 >/dev/null 2>&1 || $SUDO apt install -y python3-pip >/dev/null 2>&1
    for pkg in flask sentence-transformers huggingface_hub; do
      python3 -m pip show \$pkg >/dev/null 2>&1 || \
      $SUDO python3 -m pip install --quiet --no-input \$pkg >/dev/null 2>&1 || true
    done
  " 'Verificando integridade Python' install
else
  # --- Compatibilidade Debian/Ubuntu ---
  run_step "
    command -v pip3 >/dev/null 2>&1 || $SUDO apt install -y python3-pip >/dev/null 2>&1
    for pkg in flask sentence-transformers huggingface_hub; do
      python3 -m pip show \$pkg >/dev/null 2>&1 || \
      $SUDO env PIP_EXTRA_INDEX_URL='https://download.pytorch.org/whl/cpu' \
      python3 -m pip install --quiet --no-input \$PIP_BREAK_OPT --target=/usr/lib/python3/dist-packages \$pkg >/dev/null 2>&1 || true
    done
  " 'Verificando integridade Python' install
fi




  
# -------------------------
# Repositório Mwsm
# -------------------------
cp "$0" "$TMP_SCRIPT" >/dev/null 2>&1 || true
run_step "rm -rf $BASE_DIR && mkdir -p $BASE_DIR && cd $BASE_DIR && \
git init && git remote add origin https://github.com/MKCodec/Mwsm.git && \
git config core.sparseCheckout true && \
echo -e 'fonts/\nicon.png\nindex.html\njquery.js\nmwsm.db\nmwsm.js\nmwsm.json\nnodemon.json\npackage.json\nscript.js\nsocket.io.js\nstyle.css\nversion.json\nmwsm.py' > .git/info/sparse-checkout && \
git pull origin main || git pull origin master" "Baixando repositório Mwsm" install

# 🧩 Se já existir instalação anterior, ativa modo silencioso
if [ -f "$BASE_DIR/mwsm.sh" ]; then
  silent_menu
  exit 0
fi

if [ -f "$TMP_SCRIPT" ]; then
  cp "$TMP_SCRIPT" "$BASE_DIR/mwsm.sh" >/dev/null 2>&1
  chmod +x "$BASE_DIR/mwsm.sh"
  ln -sf "$BASE_DIR/mwsm.sh" /usr/local/bin/mwsm 2>/dev/null || $SUDO ln -sf "$BASE_DIR/mwsm.sh" /usr/local/bin/mwsm
  rm -f "$TMP_SCRIPT"
fi

CURRENT_USER=$(logname 2>/dev/null || echo "$USER")
$SUDO chown -R "$CURRENT_USER":"$CURRENT_USER" "$BASE_DIR"

      # -------------------------
      # Dependências Node
      # -------------------------
cd $BASE_DIR || return
run_step "node -v >/dev/null 2>&1" "Verificando instalação do Node.js" install
run_step "$SUDO npm install -g npm@latest --quiet --no-progress" "Atualizando NPM" install
run_step "$SUDO npm cache clean --force >/dev/null 2>&1" "Limpando cache NPM" install
run_step "npm config set registry https://registry.npmjs.org >/dev/null 2>&1" "Configurando registro NPM" install

      if [[ "$DISTRO_DETECT" == "devuan" ]]; then
        run_step "$SUDO npm install -g npm@latest node-gyp@latest" "Atualizando npm e node-gyp" install
        run_step "$SUDO npm install --silent --no-fund --no-audit" "Instalando dependências Node" install
        command -v node >/dev/null 2>&1 || $SUDO ln -sf /usr/bin/nodejs /usr/bin/node
        run_step "node -v && npm -v" "Verificando Node.js e NPM" install

        $SUDO mkdir -p /opt/mk-auth/api
        $SUDO chmod 755 /opt/mk-auth/api

        if ! ping -c1 raw.githubusercontent.com &>/dev/null; then
          echo "$(date '+%Y-%m-%d %H:%M:%S') - [WARN] Falha de conexão com raw.githubusercontent.com" >>"$LOG_FILE"
        fi

        if ping -c1 raw.githubusercontent.com &>/dev/null; then
          EXPECTED_HASH=$($SUDO wget -qO- "$CUSTOM_API_URL" | sha256sum | awk '{print $1}')
          if [[ ! -f "$API_PATH" ]]; then
            run_step "$SUDO wget -q \"$CUSTOM_API_URL\" -O \"$API_PATH\"" "Instalando integração MkAuth" install
          else
            LOCAL_HASH=$(sha256sum "$API_PATH" | awk '{print $1}')
            if [[ "$LOCAL_HASH" != "$EXPECTED_HASH" ]]; then
              run_step "$SUDO wget -q \"$CUSTOM_API_URL\" -O \"$API_PATH\"" "Atualizando integração MkAuth" install
            fi
          fi
        else
          run_step "false" "Instalando integração MkAuth" install
        fi

      else
        run_step "$SUDO npm install --silent --no-fund --no-audit" "Instalando dependências Node" install
        command -v node >/dev/null 2>&1 || $SUDO ln -sf /usr/bin/nodejs /usr/bin/node
        run_step "node -v && npm -v" "Verificando Node.js e NPM" install
      fi


if [ -f /var/api/Mwsm/node_modules/whatsapp-web.js/src/util/Injected/Store.js ]; then
    run_step '$SUDO sed -i "s/() => false/() => true/" /var/api/Mwsm/node_modules/whatsapp-web.js/src/util/Injected/Store.js' "Aplicando compatibilidade wwjs" update
fi

      # -------------------------
      # Instalação e atualização do PM2
      # -------------------------
if command -v pm2 >/dev/null 2>&1; then
  CURRENT_PM2_VERSION=$(pm2 -v | head -n1 | tr -d '[:space:]')
  LATEST_PM2_VERSION=$(npm view pm2 version 2>/dev/null | tr -d '[:space:]')

  if [[ -n "$LATEST_PM2_VERSION" && "$CURRENT_PM2_VERSION" != "$LATEST_PM2_VERSION" ]]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [INFO] Atualizando PM2 de $CURRENT_PM2_VERSION para $LATEST_PM2_VERSION" >>"$LOG_FILE"
    run_step "$SUDO npm install -g pm2@$LATEST_PM2_VERSION --silent --no-audit --no-fund" \
      "Atualizando PM2" install
  else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [INFO] PM2 já está atualizado (v$CURRENT_PM2_VERSION)" >>"$LOG_FILE"
    run_step "$SUDO pm2 update >/dev/null 2>&1 || true" \
      "Sincronizando PM2" install
  fi
else
  run_step "$SUDO npm install -g pm2@latest --silent --no-audit --no-fund" \
    "Instalando PM2" install
  run_step "$SUDO timeout 15s pm2 update >/dev/null 2>&1 || { $SUDO pm2 kill >/dev/null 2>&1; rm -rf ~/.pm2; $SUDO pm2 update >/dev/null 2>&1 || true; }" \
    "Inicializando PM2" install
fi

      # -------------------------
      # Inicialização dos serviços
      # -------------------------
      if [[ "$DISTRO_DETECT" == "devuan" ]]; then
        run_step "$SUDO sh -c 'crontab -l 2>/dev/null | grep -v \"$BASE_DIR/mwsm.js\"; echo \"@reboot cd $BASE_DIR && npm run start:mkauth\"' | crontab -" "Configurando inicialização" install
        run_step "$SUDO npm run setup:mkauth" "Iniciando serviços" install
      else
        run_step "$SUDO npm run setup:mwsm" "Iniciando serviços" install
      fi

    fi
  fi

  # -------------------------
  # Resultado final
  # -------------------------
  if [ "$IS_REINSTALL" = false ]; then
    if [ "$INSTALL_FAILED" = false ]; then
      echo "-------------------------------------"
      echo "✅ Instalação concluída!"
      echo "-------------------------------------"
      LAST_SUCCESS="install"
    else
      echo "-------------------------------------"
      echo "❌ Falha na instalação."
      echo "-------------------------------------"
      if [ -d "$BASE_DIR" ]; then
        rm -rf $BASE_DIR
        echo "$(date '+%Y-%m-%d %H:%M:%S') - [ROLLBACK] Diretório $BASE_DIR removido por falha." >>"$LOG_FILE"
      fi
    fi
  fi

  # Log
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [INSTALL] Fim da instalação (status: $([ "$INSTALL_FAILED" = true ] && echo FAIL || echo OK))" >>"$LOG_FILE"

  # Se for chamado pelo reinstall, não pausa
  if [ "$NO_PAUSE" = true ]; then
    return
  fi

  echo
  pause_and_restore

}

# -------------------------
# As demais funções do script original seguem exatamente como antes:
# backup_mwsm_db, migrate_mwsm, update, uninstall, reinstall, view_log_hidden, clear_log_hidden, menu, etc.
# (Vou preservar estas funções conforme estavam no seu script original, sem alterações.)
# -------------------------

backup_mwsm_db() {
  local DB_PATH="$BASE_DIR/mwsm.db"
  local BACKUP_DIR="/tmp/Mwsm"
  local BACKUP_FILE="$BACKUP_DIR/mwsm.db"

  mkdir -p "$BACKUP_DIR"

  if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_FILE"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [BACKUP] Backup criado em $BACKUP_FILE" >>"$LOG_FILE"
  else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [BACKUP] ⚠️ Banco original não encontrado em $DB_PATH" >>"$LOG_FILE"
    return 1
  fi
}

migrate_mwsm() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [MIGRATION] Iniciando migração de banco Mwsm" >>"$LOG_FILE"

  local SRC_DB="/tmp/Mwsm/mwsm.db"
  local DEST_DB="$BASE_DIR/mwsm.db"
  local SQLITE_BIN
  SQLITE_BIN=$(command -v sqlite3)
  local SYSTEM_TABLES=("attachments" "resources" "emotions" "console" "engine")

  if [ ! -f "$SRC_DB" ]; then
    echo "[MIGRATION] ERRO: Backup não encontrado em $SRC_DB" >>"$LOG_FILE"
    return 1
  fi

  if [ ! -f "$DEST_DB" ]; then
    echo "[MIGRATION] ERRO: Banco de destino não encontrado em $DEST_DB" >>"$LOG_FILE"
    return 1
  fi

  echo "[MIGRATION] Copiando dados personalizados do backup para o novo banco..." >>"$LOG_FILE"

  for table in $($SQLITE_BIN "$SRC_DB" ".tables"); do
    [[ -z "$table" ]] && continue

    for sys in "${SYSTEM_TABLES[@]}"; do
      [[ "$table" == "$sys" ]] && {
        echo "[MIGRATION] Ignorando tabela de sistema: $table" >>"$LOG_FILE"
        continue 2
      }
    done

    if ! $SQLITE_BIN "$DEST_DB" "SELECT name FROM sqlite_master WHERE type='table' AND name='$table';" | grep -q "$table"; then
      echo "[MIGRATION] ⚠️ Tabela $table não existe no novo DB — ignorando." >>"$LOG_FILE"
      continue
    fi

    local src_count dest_count
    src_count=$($SQLITE_BIN "$SRC_DB" "SELECT COUNT(*) FROM '$table';")
    dest_count=$($SQLITE_BIN "$DEST_DB" "SELECT COUNT(*) FROM '$table';")

    if [ "$src_count" -eq 0 ]; then
      echo "[MIGRATION] ⚠️ Nenhum dado em $table no backup — pulando." >>"$LOG_FILE"
      continue
    fi

    echo "[MIGRATION] 🔄 Migrando dados da tabela: $table" >>"$LOG_FILE"

    local columns
    columns=$($SQLITE_BIN "$SRC_DB" "PRAGMA table_info('$table');" | awk -F'|' '{print $2}' | xargs | tr ' ' ',')

    for id in $($SQLITE_BIN "$SRC_DB" "SELECT id FROM '$table';"); do
      if ! $SQLITE_BIN "$DEST_DB" "SELECT id FROM '$table' WHERE id=$id;" | grep -q "$id"; then
        $SQLITE_BIN "$DEST_DB" "INSERT INTO '$table' SELECT * FROM '$SRC_DB'.'$table' WHERE id=$id;" 2>>"$LOG_FILE" \
          && echo "[MIGRATION] ➕ Inserido registro id=$id em $table" >>"$LOG_FILE"
        continue
      fi

      local updates=()
      while IFS='|' read -r col val; do
        [[ "$col" == "id" ]] && continue
        [[ -z "$val" ]] && continue
        local current
        current=$($SQLITE_BIN "$DEST_DB" "SELECT $col FROM '$table' WHERE id=$id;")
        if [ -z "$current" ] || [ "$current" = "NULL" ] || [ "$current" != "$val" ]; then
          updates+=("$col='$(echo "$val" | sed "s/'/''/g")'")
        fi
      done < <($SQLITE_BIN "$SRC_DB" "SELECT * FROM '$table' WHERE id=$id;" -separator '|' -header | tail -n +2 | awk -F'|' '{ for(i=1;i<=NF;i++) print i"|"$i }' | while read -r line; do
        idx=$(echo "$line" | cut -d'|' -f1)
        val=$(echo "$line" | cut -d'|' -f2-)
        col=$($SQLITE_BIN "$SRC_DB" "PRAGMA table_info('$table');" | awk -F'|' -v i="$idx" '$1==i-1 {print $2}')
        echo "$col|$val"
      done)

      if [ "${#updates[@]}" -gt 0 ]; then
        local set_clause
        set_clause=$(IFS=,; echo "${updates[*]}")
        $SQLITE_BIN "$DEST_DB" "UPDATE '$table' SET $set_clause WHERE id=$id;" 2>>"$LOG_FILE" \
          && echo "[MIGRATION] 🔁 Atualizado registro id=$id em $table" >>"$LOG_FILE"
      fi
    done
  done

  echo "[MIGRATION] Migração concluída com sucesso." >>"$LOG_FILE"

  rm -f "$SRC_DB"
  echo "[MIGRATION] Backup removido: $SRC_DB" >>"$LOG_FILE"
}

# ========================
# Atualiza
# ========================
update() {
  INSTALL_FAILED=false

  if [[ ! -d $BASE_DIR || ! -f $BASE_DIR/package.json ]]; then
    echo "-------------------------------------"
    echo "⚠️  O Mwsm não está instalado!"
    echo "-------------------------------------"
    sleep 2
    return
  fi
  cd $BASE_DIR || return
  clear
  echo "====================================="
  echo "   🔄 Atualizando Mwsm"
  echo "====================================="

  if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$(echo "${ID:-}" | tr '[:upper:]' '[:lower:]')
  else
    DISTRO="unknown"
  fi

  if command -v pm2 >/dev/null 2>&1; then
    run_step "$SUDO pm2 flush" "Limpando logs PM2" update
    run_step "$SUDO pm2 delete all && $SUDO pm2 kill" "Parando serviços" update
  fi
  run_step "backup_mwsm_db" "Exportando dados Mwsm" update
 
cp "$0" "$TMP_SCRIPT" >/dev/null 2>&1 || true

run_step "cd $BASE_DIR && \
  git fetch origin main && git reset --hard origin/main" \
  "Atualizando repositório Mwsm" update

if [ -f "$TMP_SCRIPT" ]; then
  cp "$TMP_SCRIPT" "$BASE_DIR/mwsm.sh" >/dev/null 2>&1
  chmod +x "$BASE_DIR/mwsm.sh"
  ln -sf "$BASE_DIR/mwsm.sh" /usr/local/bin/mwsm 2>/dev/null || \
    $SUDO ln -sf "$BASE_DIR/mwsm.sh" /usr/local/bin/mwsm
  rm -f "$TMP_SCRIPT"
fi

CURRENT_USER=$(logname 2>/dev/null || echo "$USER")
$SUDO chown -R "$CURRENT_USER":"$CURRENT_USER" "$BASE_DIR" >/dev/null 2>&1

Setup_Mwsm

  run_step "$SUDO apt-get update -y >/dev/null 2>&1" "Verificando repositórios APT" update
  run_step "$SUDO apt --fix-broken install -y >/dev/null 2>&1 || true" "Corrigindo pacotes quebrados" update
  run_step "$SUDO apt-get install -y git wget curl jq build-essential sqlite3 --no-install-recommends >/dev/null 2>&1" "Verificando dependências" update

  if ! command -v node >/dev/null 2>&1; then
    run_step "$SUDO bash -c 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs'" "Reinstalando Node.js" update
  fi

  run_step "node -v && npm -v" "Verificando Node.js e NPM" update
  run_step "$SUDO npm cache clean --force" "Limpando cache NPM" update
  run_step "npm config set registry https://registry.npmjs.org" "Configurando repositório NPM" update

  # Use precise detection for update branches if needed
  detect_distro

  if [[ "$DISTRO_DETECT" == "devuan" ]]; then
    run_step "$SUDO npm install -g npm@latest node-gyp@latest --silent --no-audit --no-fund" "Atualizando npm e node-gyp" update
  else
    run_step "$SUDO npm install -g npm@latest --silent --no-audit --no-fund" "Atualizando npm" update
  fi

  run_step "$SUDO npm install --silent --no-fund --no-audit" "Atualizando dependências Node.js" update

if [ -f /var/api/Mwsm/node_modules/whatsapp-web.js/src/util/Injected/Store.js ]; then
    run_step '$SUDO sed -i "s/() => false/() => true/" /var/api/Mwsm/node_modules/whatsapp-web.js/src/util/Injected/Store.js' "Aplicando compatibilidade wwjs" update
fi


# -------------------------
# 🐍 Atualização Python + Pip + Libs
# -------------------------

# Detecta se o pip suporta --break-system-packages (compatibilidade entre versões)
if python3 -m pip install --help 2>&1 | grep -q -- '--break-system-packages'; then
  PIP_BREAK_OPT="--break-system-packages"
else
  PIP_BREAK_OPT=""
fi

if [[ "$DISTRO_DETECT" == "devuan" ]]; then
  # --- Devuan com CUDA: atualização mínima ---
  if ! command -v python3 >/dev/null 2>&1; then
    run_step "$SUDO apt install -y python3 python3-pip python3-venv --no-install-recommends >/dev/null 2>&1" "Instalando Python" update
  fi

  run_step "$SUDO python3 -m pip install --quiet --upgrade pip setuptools wheel" "Atualizando pip" update

  run_step "PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_ROOT_USER_ACTION=ignore \
    $SUDO python3 -m pip install --quiet --no-input \
      'flask==2.2.5' \
      'sentence-transformers==2.2.2' \
      'transformers==4.25.1' \
      'safetensors==0.3.1' \
      'huggingface_hub==0.10.1'" \
    "Atualizando libs Python" update

else
  # --- Debian/Ubuntu sem CUDA ---
  if ! command -v python3 >/dev/null 2>&1; then
    run_step "$SUDO apt update -y >/dev/null 2>&1 && \
      $SUDO apt install -y python3 python3-pip python3-venv \
      -o Dpkg::Options::='--force-confdef' \
      -o Dpkg::Options::='--force-confold' >/dev/null 2>&1" \
      "Instalando Python" update
  fi

  run_step "cd /tmp && \
    PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_ROOT_USER_ACTION=ignore \
    $SUDO python3 -m ensurepip --upgrade >/dev/null 2>&1 && \
    $SUDO python3 -m pip install --no-input --quiet --upgrade setuptools wheel >/dev/null 2>&1 || true" \
    "Atualizando pip" update

  run_step "cd /tmp && \
    PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_ROOT_USER_ACTION=ignore \
    $SUDO env PIP_EXTRA_INDEX_URL='https://download.pytorch.org/whl/cpu' \
    python3 -m pip install --quiet --no-input $PIP_BREAK_OPT \
      --target=/usr/lib/python3/dist-packages \
      'filelock<3.13.0' \
      'typing-extensions<4.6.0' \
      'flask==2.2.5' \
      'sentence-transformers==2.2.2' \
      'transformers==4.25.1' \
      'safetensors==0.3.1' \
      'huggingface_hub==0.10.1' \
      'torch==1.13.1+cpu' \
      'torchvision==0.14.1+cpu' \
      -f https://download.pytorch.org/whl/cpu >/dev/null 2>&1 || true" \
    "Atualizando libs Python" update
fi


  if command -v pm2 >/dev/null 2>&1; then
    CURRENT_PM2_VERSION=$(pm2 -v | head -n1 | tr -d '[:space:]')
    LATEST_PM2_VERSION=$(npm view pm2 version 2>/dev/null | tr -d '[:space:]')
    if [[ -n "$LATEST_PM2_VERSION" && "$CURRENT_PM2_VERSION" != "$LATEST_PM2_VERSION" ]]; then
      run_step "$SUDO npm install -g pm2@$LATEST_PM2_VERSION --silent --no-audit --no-fund" "Atualizando PM2" update
    else
      run_step "$SUDO pm2 update >/dev/null 2>&1 || true" "Sincronizando PM2" update
    fi
  else
    run_step "$SUDO npm install -g pm2@latest --silent --no-audit --no-fund" "Instalando PM2" update
    run_step "$SUDO timeout 15s pm2 update >/dev/null 2>&1 || { $SUDO pm2 kill >/dev/null 2>&1; rm -rf ~/.pm2; $SUDO pm2 update >/dev/null 2>&1 || true; }" "Inicializando PM2" update
  fi

  run_step "migrate_mwsm" "Importando dados Mwsm" update

  if [[ "$DISTRO_DETECT" == "devuan" ]]; then
    run_step "$SUDO sh -c 'crontab -l 2>/dev/null | grep -v \"$BASE_DIR/mwsm.js\"; echo \"@reboot cd $BASE_DIR && npm run start:mkauth\"' | crontab -" "Configurando inicialização" update
    run_step "$SUDO npm run setup:mkauth" "Reiniciando serviços" update

  else
    run_step "$SUDO npm run setup:mwsm" "Reiniciando serviços" update
  fi

  if [ "$INSTALL_FAILED" = false ]; then
    echo "-------------------------------------"
    echo "✅ Atualização concluída com sucesso!"
    echo "-------------------------------------"
    LAST_SUCCESS="install"
  else
    echo "-------------------------------------"
    echo "❌ Falha na atualização."
    echo "-------------------------------------"
  fi

  echo "$(date '+%Y-%m-%d %H:%M:%S') - [UPDATE] Fim da atualização (status: $([ "$INSTALL_FAILED" = true ] && echo FAIL || echo OK))" >>"$LOG_FILE"
  echo
  pause_and_restore

}

# ========================
# Desinstalar
# ========================
uninstall() {
  local NO_CLEAR=false
  local NO_PAUSE=false

  if [ "$IS_REINSTALL" = false ]; then
    if [[ ! -d $BASE_DIR || ! -f $BASE_DIR/package.json ]]; then
      echo "-------------------------------------"
      echo "⚠️  O Mwsm não está instalado!"
      echo "-------------------------------------"
      sleep 2
      return
    fi
  fi

  if [ "$1" = "no_clear" ]; then
    NO_CLEAR=true
  fi
  if [ "$2" = "no_pause" ]; then
    NO_PAUSE=true
  fi

  if [ "$NO_CLEAR" = false ]; then
    clear
    echo "====================================="
    echo "   🗑️ Removendo Mwsm"
    echo "====================================="
  fi

  UNINSTALL_FAILED=false

  if command -v pm2 >/dev/null 2>&1; then
    run_step "$SUDO pm2 stop all && $SUDO pm2 delete all" "Removendo serviços" uninstall || UNINSTALL_FAILED=true
  else
    run_step "skip" "Removendo serviços" uninstall
  fi

  # Removendo inicialização
  if command -v pm2 >/dev/null 2>&1; then

    detect_distro

    if [[ "$DISTRO_DETECT" == "devuan" ]]; then
      run_step "crontab -l 2>/dev/null | grep -v '$BASE_DIR/mwsm.js' | crontab -" "Removendo inicialização" uninstall || UNINSTALL_FAILED=true
    else
      run_step "$SUDO pm2 unstartup systemd" "Removendo inicialização" uninstall || UNINSTALL_FAILED=true
    fi

  else
    run_step "skip" "Removendo inicialização" uninstall
  fi

  if command -v pm2 >/dev/null 2>&1; then
    run_step "$SUDO npm remove -g pm2" "Removendo PM2" uninstall || UNINSTALL_FAILED=true
  else
    run_step "skip" "Removendo PM2" uninstall
  fi

  if command -v npm >/dev/null 2>&1; then
    if [ -d "$HOME/.npm" ]; then
      run_step "cd /tmp && $SUDO npm cache clean --force" "Limpando cache NPM" uninstall || UNINSTALL_FAILED=true
    else
      run_step "skip" "Limpando cache NPM" uninstall
    fi
  else
    run_step "skip" "Limpando cache NPM" uninstall
  fi

  if [[ -d $BASE_DIR ]]; then
    [[ "$PWD" =~ $BASE_DIR ]] && cd /root 2>/dev/null || cd /tmp
    run_step "rm -rf $BASE_DIR" "Limpando diretórios" uninstall || UNINSTALL_FAILED=true
  else
    run_step "skip" "Limpando diretórios" uninstall
  fi

  # Removendo link do comando mwsm
  if [ -L /usr/local/bin/mwsm ] || [ -f /usr/local/bin/mwsm ]; then
    run_step "$SUDO rm -f /usr/local/bin/mwsm" "Removendo comando mwsm" uninstall || UNINSTALL_FAILED=true
  else
    run_step "skip" "Removendo comando mwsm" uninstall
  fi

  if [ "$NO_PAUSE" = false ]; then
    if [ "$UNINSTALL_FAILED" = false ]; then
      echo "-------------------------------------"
      echo "✅ Remoção concluída!"
      echo "-------------------------------------"
      echo "$(date '+%Y-%m-%d %H:%M:%S') - [UNINSTALL] Fim da remoção (OK)" >>"$LOG_FILE"
    else
      echo "-------------------------------------"
      echo "❌ Falha na remoção."
      echo "-------------------------------------"
      echo "$(date '+%Y-%m-%d %H:%M:%S') - [UNINSTALL] Fim da remoção (FAIL)" >>"$LOG_FILE"
    fi
  else
    if [ "$UNINSTALL_FAILED" = false ]; then
      echo "$(date '+%Y-%m-%d %H:%M:%S') - [UNINSTALL] Fim da remoção (OK - modo silencioso)" >>"$LOG_FILE"
    else
      echo "$(date '+%Y-%m-%d %H:%M:%S') - [UNINSTALL] Fim da remoção (FAIL - modo silencioso)" >>"$LOG_FILE"
    fi
  fi

  if [ "$NO_PAUSE" = true ]; then
    return
  fi

  echo
  if [ "$NO_PAUSE" = false ]; then
    pause_and_restore
  fi
}

# ========================
# Reinstalar
# ========================
reinstall() {
  INSTALL_FAILED=false
  IS_REINSTALL=true

  clear
  echo "====================================="
  echo "   ♻️ Reinstalando Mwsm"
  echo "====================================="

  if ! uninstall_concluido; then
    uninstall no_clear no_pause
  fi

  install no_clear no_pause

  echo
  echo "-------------------------------------"
  if [ "$INSTALL_FAILED" = false ]; then
    echo "✅ Reinstalação concluída!"
    echo "-------------------------------------"
    LAST_SUCCESS="install"
  else
    echo "❌ Reinstalação concluída com falhas."
    echo "-------------------------------------"
  fi

  echo "$(date '+%Y-%m-%d %H:%M:%S') - [REINSTALL] Fim da reinstalação (status: $([ "$INSTALL_FAILED" = true ] && echo FAIL || echo OK))" >>"$LOG_FILE"
  echo
  pause_and_restore
}

view_log_hidden() {
  # sempre restaura o terminal ao sair (mesmo se der erro)
  cleanup_view() {
    stty sane >/dev/null 2>&1 || true
    tput cnorm >/dev/null 2>&1 || true
    tput sgr0 >/dev/null 2>&1 || true
  }
  trap cleanup_view EXIT

  cleanup_view  # garante início limpo
  while true; do
    clear
    echo "====================================="
    echo "   📜 Logs do Mwsm"
    echo "====================================="
    echo "1) Últimas 24h"
    echo "2) Completo"
    echo "3) Bruto"
    echo "0) Voltar"
    echo "-------------------------------------"
    printf "Escolha uma opção: "

    read -rsn1 log_choice
    echo "$log_choice"

    case $log_choice in
      1)
        cleanup_view
cutoff_date=$(date -d '24 hours ago' '+%Y-%m-%d %H:%M:%S')
grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}" "$LOG_FILE" | \
awk -v cutoff="$cutoff_date" '
{
  if ($0 >= cutoff) print $0
}' | iconv -f utf-8 -t utf-8
        echo
        read -rp "Pressione ENTER para voltar..."
        ;;
      2)
        cleanup_view
        grep "^[0-9]\\{4\\}-" "$LOG_FILE" | iconv -f utf-8 -t utf-8
        echo
        read -rp "Pressione ENTER para voltar..."
        ;;
      3)
        cleanup_view
        grep -v "^[0-9]\\{4\\}-" "$LOG_FILE" | iconv -f utf-8 -t utf-8
        echo
        read -rp "Pressione ENTER para voltar..."
        ;;
      0)
        cleanup_view
        break
        ;;
      *)
        continue
        ;;
    esac
  done

  cleanup_view
  trap - EXIT
  sleep 0.1
  clear
stty sane >/dev/null 2>&1 || true
tput civis >/dev/null 2>&1 || true

}

# ========================
# Limpar logs oculto
# ========================
clear_log_hidden() {
  : >"$LOG_FILE"
  echo "-------------------------------------"
  echo "🧹 Log limpo com sucesso!"
  echo "-------------------------------------"
  sleep 2
stty sane >/dev/null 2>&1 || true
tput civis >/dev/null 2>&1 || true
}

# ========================
# Menu principal
# ========================
menu() {
  command -v tput >/dev/null 2>&1 && tput civis >/dev/null 2>&1 || true
  detect_distro
  while true; do

if [ -t 0 ]; then
  stty sane >/dev/null 2>&1 || true
fi

    clear

    echo "====================================="
    echo "   📦 Gerenciador do Bot-Mwsm"
    echo "-------------------------------------"
    if [[ "$DISTRO_DETECT" == "devuan" ]]; then
    echo "Sistema: MkAuth"
    else
    echo "Sistema: $(echo "$DISTRO_DETECT" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
    fi
    echo "====================================="
    echo "1) Instalar"
    echo "2) Atualizar"
    echo "3) Reinstalar"
    echo "4) Desinstalar"
    echo "0) Sair"
    echo "-------------------------------------"
    printf "Escolha uma opção: "

    command -v tput >/dev/null 2>&1 && tput civis >/dev/null 2>&1 || true


while true; do
  stty -echo -icanon time 0 min 0 2>/dev/null || true
  read -rsn1 choice
  stty sane 2>/dev/null || true
  case "$choice" in
    [0-6]) break ;;
    *) continue ;;
  esac
done

    echo "$choice"

    echo "$(date '+%Y-%m-%d %H:%M:%S') - [MENU] Opção $choice selecionada" >>"$LOG_FILE"

    case $choice in
      1) install ;;
      2) update ;;
      3) reinstall ;;
      4) uninstall ;;
      5) view_log_hidden ;; # oculto
      6) clear_log_hidden ;; # oculto
      0)
        command -v tput >/dev/null 2>&1 && tput cnorm >/dev/null 2>&1 || true
        if [[ "$LAST_SUCCESS" == "install" ]]; then
          if command -v pm2 >/dev/null 2>&1; then
            NAME=$(jq -r .name $BASE_DIR/package.json 2>/dev/null)
            MATCHED=""

            if [[ -n "$NAME" && -f $BASE_DIR/mwsm.json ]]; then
              if jq -r 'tostring' $BASE_DIR/mwsm.json 2>/dev/null | grep -q "$NAME"; then
                MATCHED="$NAME"
              fi
            fi

            if [[ -z "$MATCHED" ]]; then
              if $SUDO pm2 list | grep -q "Bot-Mwsm"; then
                MATCHED="Bot-Mwsm"
              fi
            fi

            if [[ -n "$MATCHED" ]]; then
              $SUDO pm2 update >/dev/null 2>&1
              $SUDO pm2 flush >/dev/null 2>&1
              clear
              exec $SUDO pm2 logs "$MATCHED"
            fi
          fi
        fi
        unset DEBIAN_FRONTEND
        clear
        silent_menu
        exit 0
        ;;
    esac
  done

  command -v tput >/dev/null 2>&1 && tput cnorm >/dev/null 2>&1 || true
}

menu
