#!/bin/bash

# =====================================
# 📦 Gerenciador do Bot-Mwsm
# =====================================

if [ "$(id -u)" -eq 0 ]; then
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

LOG_FILE="/var/log/mwsm.log"
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chmod 644 "$LOG_FILE"
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

# =================================
# Função de execução
# =================================
run_step() {
  local CMD="$1"
  local MSG="$2"
  local CONTEXT="$3"
  local spin='-\|/'
  local i=0

  echo "$(date '+%Y-%m-%d %H:%M:%S') - [STEP] Iniciando: $MSG" >>"$LOG_FILE"

  # Executa o comando em subshell com captura de erro real
  (
    set -e
    if declare -f "${CMD%% *}" >/dev/null 2>&1; then
      ${CMD}
    else
      eval "$CMD"
    fi
  ) &>>"$LOG_FILE" &
  local PID=$!

  command -v tput >/dev/null 2>&1 && tput civis
  while kill -0 $PID 2>/dev/null; do
    i=$(((i + 1) % 4))
    printf "\r${spin:$i:1} %s" "$MSG"
    sleep 0.1
  done
  command -v tput >/dev/null 2>&1 && tput cnorm
  wait $PID
  local STATUS=$?

  if [ $STATUS -eq 0 ]; then
    printf "\r✔ %s\n" "$MSG"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [STEP] Finalizado: $MSG (OK)" >>"$LOG_FILE"
  else
    printf "\r❌ %s\n" "$MSG"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [STEP] Finalizado: $MSG (FAIL)" >>"$LOG_FILE"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [ERROR] Falha ao executar: $CMD" >>"$LOG_FILE"
    INSTALL_FAILED=true
  fi
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

    if [[ -d /var/api/Mwsm && -f /var/api/Mwsm/package.json ]]; then
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

    # Cabeçalho
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

if [[ "$DISTRO" == "debian" ]]; then

run_step "$SUDO bash -c '
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$(echo ${ID:-} | tr [:upper:] [:lower:])
    DEBIAN_VERSION=$(grep VERSION_CODENAME /etc/os-release 2>/dev/null | cut -d= -f2)
    if [ -z \"$DEBIAN_VERSION\" ]; then
      DEBIAN_VERSION=$(grep VERSION_ID /etc/os-release 2>/dev/null | cut -d= -f2 | tr -d \\\" )
    fi

    if [ \"$DISTRO\" = debian ] || [ \"$DISTRO\" = devuan ]; then
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
'" "Ajustando repositórios Debian antigos" install


  run_step "$SUDO bash -c 'apt-get clean && rm -rf /var/lib/apt/lists/* && apt-get update --allow-releaseinfo-change -o Acquire::Check-Valid-Until=false -y'" "Recarregando cache APT" install
  run_step "$SUDO bash -c '
    apt --fix-broken install -y || true
    apt-get clean
    apt-get update --allow-releaseinfo-change -y || true
  '" "Reparando dependências quebradas..." install
fi
    if [[ "$DISTRO" == "ubuntu" ]]; then
      run_step "$SUDO apt update -y; $SUDO apt upgrade -y \
      -o Dpkg::Options::='--force-confdef' \
      -o Dpkg::Options::='--force-confold'" "Atualizando pacotes..." install
      run_step "$SUDO apt-get install -y git wget curl jq build-essential libnss3-dev \
      libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2 \
      -o Dpkg::Options::='--force-confdef' \
      -o Dpkg::Options::='--force-confold'" "Instalando dependências..." install
    else
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
  fi
  run_step "command -v sqlite3 >/dev/null 2>&1 || $SUDO apt-get install -y sqlite3 --no-install-recommends" "Instalando SQLite3" install
  # -------------------------
  # Node.js
  # -------------------------
run_step "$SUDO bash -c '
  cd /root || exit 1
  apt-get update -y
  apt-get install -y curl gnupg ca-certificates --no-install-recommends
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
    node -v && npm -v
  '" "Instalando Node.js" install

  if [ "$NODE_INSTALL_FAILED" = true ]; then
    printf "❌ Instalando dependências Node\n"
    printf "❌ Iniciando serviços\n"
    INSTALL_FAILED=true
  else
  # -------------------------
  # Python + Pip + Libs
  # -------------------------
  run_step "$SUDO apt install -y python3 python3-pip \
  -o Dpkg::Options::='--force-confdef' \
  -o Dpkg::Options::='--force-confold'" "Instalando Python" install
  run_step "cd /tmp && $SUDO python3 -m pip install --quiet --disable-pip-version-check --no-input --upgrade pip" "Atualizando pip" install
  if grep -qiE 'debian|devuan' /etc/os-release; then
    run_step "cd /tmp && $SUDO python3 -m pip install --quiet --disable-pip-version-check --no-input \
      'flask==2.2.5' 'sentence-transformers==2.2.2' 'transformers==4.28.1' 'safetensors==0.3.1'" \
      "Instalando libs Python" install
  else
    run_step "cd /tmp && $SUDO python3 -m pip install --quiet --disable-pip-version-check --no-input flask sentence-transformers" \
      "Instalando libs Python" install
  fi
  # -------------------------
  # Repositório Mwsm
  # -------------------------
  run_step "rm -rf /var/api/Mwsm && mkdir -p /var/api/Mwsm && cd /var/api/Mwsm && \
  git init && git remote add origin https://github.com/MKCodec/Mwsm.git && \
  git config core.sparseCheckout true && echo -e 'fonts/\\nicon.png\\nindex.html\\njquery.js\\nmwsm.db\\nmwsm.js\\nmwsm.json\\nnodemon.json\\npackage.json\\nscript.js\\nsocket.io.js\\nstyle.css\\nversion.json\\nmwsm.py' > .git/info/sparse-checkout && \
  git pull origin main || git pull origin master" "Baixando repositório Mwsm" install
  CURRENT_USER=$(logname 2>/dev/null || echo "$USER")
  $SUDO chown -R "$CURRENT_USER":"$CURRENT_USER" /var/api/Mwsm

  # -------------------------
  # Dependências Node
  # -------------------------
  cd /var/api/Mwsm || return
  run_step "node -v >/dev/null 2>&1" "Verificando instalação do Node.js" install
  run_step "$SUDO npm cache clean --force" "Limpando cache NPM" install
  run_step "npm config set registry https://registry.npmjs.org" "Configurando registro NPM" install

  if [[ "$DISTRO" == "debian" ]]; then
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
        run_step "$SUDO wget -q \"$CUSTOM_API_URL\" -O \"$API_PATH\"" "Instalando integração MkAuth" install
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
if [ "$NPM_INSTALL_FAILED" = true ]; then
  printf "❌ Iniciando serviços\n"
  INSTALL_FAILED=true
else
# -------------------------
# Inicialização dos serviços
# -------------------------
if [[ "$DISTRO" == "ubuntu" ]]; then
  run_step "$SUDO npm run setup:mwsm" "Iniciando serviços" install
else
run_step "$SUDO sh -c 'crontab -l 2>/dev/null | grep -v \"/var/api/Mwsm/mwsm.js\"; echo \"@reboot cd /var/api/Mwsm && npm run start:mkauth\"' | crontab -" "Configurando crontab" install
run_step "$SUDO npm run setup:mkauth" "Iniciando serviços" install
fi
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
  if [ -d "/var/api/Mwsm" ]; then
    rm -rf /var/api/Mwsm
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [ROLLBACK] Diretório /var/api/Mwsm removido por falha." >>"$LOG_FILE"
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
read -rp "Pressione ENTER para voltar ao menu..."
}



backup_mwsm_db() {
  local DB_PATH="/var/api/Mwsm/mwsm.db"
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
  local DEST_DB="/var/api/Mwsm/mwsm.db"
  local SQLITE_BIN
  SQLITE_BIN=$(command -v sqlite3)
  local SYSTEM_TABLES=("attachments" "resources" "emotions" "console" "engine")

  # Verificações iniciais
  if [ ! -f "$SRC_DB" ]; then
    echo "[MIGRATION] ERRO: Backup não encontrado em $SRC_DB" >>"$LOG_FILE"
    return 1
  fi

  if [ ! -f "$DEST_DB" ]; then
    echo "[MIGRATION] ERRO: Banco de destino não encontrado em $DEST_DB" >>"$LOG_FILE"
    return 1
  fi

  echo "[MIGRATION] Copiando dados personalizados do backup para o novo banco..." >>"$LOG_FILE"

  # Percorre todas as tabelas do backup
  for table in $($SQLITE_BIN "$SRC_DB" ".tables"); do
    [[ -z "$table" ]] && continue

    # Ignorar tabelas de sistema
    for sys in "${SYSTEM_TABLES[@]}"; do
      [[ "$table" == "$sys" ]] && {
        echo "[MIGRATION] Ignorando tabela de sistema: $table" >>"$LOG_FILE"
        continue 2
      }
    done

    # Verifica se a tabela também existe no novo banco
    if ! $SQLITE_BIN "$DEST_DB" "SELECT name FROM sqlite_master WHERE type='table' AND name='$table';" | grep -q "$table"; then
      echo "[MIGRATION] ⚠️ Tabela $table não existe no novo DB — ignorando." >>"$LOG_FILE"
      continue
    fi

    # Conta registros
    local src_count dest_count
    src_count=$($SQLITE_BIN "$SRC_DB" "SELECT COUNT(*) FROM '$table';")
    dest_count=$($SQLITE_BIN "$DEST_DB" "SELECT COUNT(*) FROM '$table';")

    # Se backup não tiver dados, pula
    if [ "$src_count" -eq 0 ]; then
      echo "[MIGRATION] ⚠️ Nenhum dado em $table no backup — pulando." >>"$LOG_FILE"
      continue
    fi

    echo "[MIGRATION] 🔄 Migrando dados da tabela: $table" >>"$LOG_FILE"

    # Recupera nomes de colunas
    local columns
    columns=$($SQLITE_BIN "$SRC_DB" "PRAGMA table_info('$table');" | awk -F'|' '{print $2}' | xargs | tr ' ' ',')

    # Loop por ID — assume que há uma coluna "id"
    for id in $($SQLITE_BIN "$SRC_DB" "SELECT id FROM '$table';"); do
      # Se registro não existe no novo, insere
      if ! $SQLITE_BIN "$DEST_DB" "SELECT id FROM '$table' WHERE id=$id;" | grep -q "$id"; then
        $SQLITE_BIN "$DEST_DB" "INSERT INTO '$table' SELECT * FROM '$SRC_DB'.'$table' WHERE id=$id;" 2>>"$LOG_FILE" \
          && echo "[MIGRATION] ➕ Inserido registro id=$id em $table" >>"$LOG_FILE"
        continue
      fi

      # Se existe, faz update seletivo
      local updates=()
      while IFS='|' read -r col val; do
        # Pula colunas nulas ou id
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

      # Aplica atualização, se houver colunas a atualizar
      if [ "${#updates[@]}" -gt 0 ]; then
        local set_clause
        set_clause=$(IFS=,; echo "${updates[*]}")
        $SQLITE_BIN "$DEST_DB" "UPDATE '$table' SET $set_clause WHERE id=$id;" 2>>"$LOG_FILE" \
          && echo "[MIGRATION] 🔁 Atualizado registro id=$id em $table" >>"$LOG_FILE"
      fi
    done
  done

  echo "[MIGRATION] Migração concluída com sucesso." >>"$LOG_FILE"

  # Remove backup após migração
  rm -f "$SRC_DB"
  echo "[MIGRATION] Backup removido: $SRC_DB" >>"$LOG_FILE"
}

update() {
  INSTALL_FAILED=false
  clear
  echo "====================================="
  echo "   🔄 Atualizando Mwsm"
  echo "====================================="

  cd /var/api/Mwsm || return

  if command -v pm2 >/dev/null 2>&1; then
    run_step "$SUDO pm2 flush" "Limpando logs PM2" update
    run_step "$SUDO pm2 delete all && $SUDO pm2 kill" "Parando serviços antigos" update
  fi

  run_step "backup_mwsm_db" "Fazendo backup do banco Mwsm" update
  run_step "git reset --hard HEAD && git pull --rebase --autostash origin main" "Atualizando repositório Mwsm" update
  run_step "$SUDO npm install --silent --no-fund --no-audit" "Atualizando dependências Node" update
  run_step "$SUDO npm cache clean --force" "Limpando cache npm" update
  run_step "migrate_mwsm" "Migrando banco de dados Mwsm" update

  if [[ "$DISTRO" == "ubuntu" ]]; then
    run_step "$SUDO npm run setup:mwsm" "Reiniciando serviços" update
  else
    run_step "$SUDO npm run setup:mkauth" "Reiniciando serviços" update
  fi

  if [ "$INSTALL_FAILED" = false ]; then
    echo "-------------------------------------"
    echo "✅ Atualização concluída!"
    echo "-------------------------------------"
LAST_SUCCESS="install"
  else
    echo "-------------------------------------"
    echo "❌ Falha na atualização."
    echo "-------------------------------------"
  fi

  echo "$(date '+%Y-%m-%d %H:%M:%S') - [UPDATE] Fim da atualização (status: $([ "$INSTALL_FAILED" = true ] && echo FAIL || echo OK))" >>"$LOG_FILE"
  echo
  read -rp "Pressione ENTER para voltar ao menu..."
}

# ========================
# Desinstalar
# ========================
uninstall() {
  local NO_CLEAR=false
  local NO_PAUSE=false

  # Verifica se foi chamado com parâmetros especiais
  if [ "$1" = "no_clear" ]; then
    NO_CLEAR=true
  fi
  if [ "$2" = "no_pause" ]; then
    NO_PAUSE=true
  fi

  # Cabeçalho
  if [ "$NO_CLEAR" = false ]; then
    clear
    echo "====================================="
    echo "   🗑️ Removendo Mwsm"
    echo "====================================="
  fi

  UNINSTALL_FAILED=false

  # Parando serviços PM2
  if command -v pm2 >/dev/null 2>&1; then
    run_step "$SUDO pm2 stop all && $SUDO pm2 delete all" "Removendo serviços" uninstall || UNINSTALL_FAILED=true
  else
  run_step "skip" "Removendo serviços" uninstall
fi

# Removendo inicialização
if command -v pm2 >/dev/null 2>&1; then
  if [[ "$DISTRO" == "ubuntu" ]]; then
    run_step "$SUDO pm2 unstartup systemd" "Removendo inicialização" uninstall || UNINSTALL_FAILED=true
  else
  run_step "crontab -l 2>/dev/null | grep -v '/var/api/Mwsm/mwsm.js' | crontab -" "Removendo inicialização" uninstall || UNINSTALL_FAILED=true
fi
else
run_step "skip" "Removendo inicialização" uninstall
fi

# Removendo PM2 global
if command -v pm2 >/dev/null 2>&1; then
  run_step "$SUDO npm remove -g pm2" "Removendo PM2" uninstall || UNINSTALL_FAILED=true
else
run_step "skip" "Removendo PM2" uninstall
fi

# Limpando cache do NPM
if command -v npm >/dev/null 2>&1; then
  if [ -d "$HOME/.npm" ]; then
    run_step "cd /tmp && $SUDO npm cache clean --force" "Limpando cache NPM" uninstall || UNINSTALL_FAILED=true
  else
  run_step "skip" "Limpando cache NPM" uninstall
fi
else
run_step "skip" "Limpando cache NPM" uninstall
fi


# Limpando diretórios
if [[ -d /var/api/Mwsm ]]; then
  run_step "rm -rf /var/api/Mwsm" "Limpando diretórios" uninstall || UNINSTALL_FAILED=true
else
run_step "skip" "Limpando diretórios" uninstall
fi

# Exibe resultado final
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
  read -rp "Pressione ENTER para voltar ao menu..."
  while read -t 0; do read -r; done
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

  uninstall no_clear no_pause
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
read -rp "Pressione ENTER para voltar ao menu..."
}

view_log_hidden() {
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

    # Lê uma única tecla (sem Enter) e só aceita 0–3
    while true; do
      read -rsn1 log_choice
      case "$log_choice" in
      [0-3]) break ;;
      *) continue ;;
    esac
  done
  echo "$log_choice"

  case $log_choice in
  1)
  cutoff_epoch=$(date -d '24 hours ago' +%s)
  # awk: encontra a primeira timestamp válida em cada linha, converte e compara
  awk -v cutoff="$cutoff_epoch" '
  {
    if (match($0, /[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]/)) {
      ts = substr($0, RSTART, RLENGTH)
      cmd = "date -d \"" ts "\" +%s"
      cmd | getline t
      close(cmd)
      if (t >= cutoff) print $0
    }
  }' "$LOG_FILE" | iconv -f utf-8 -t utf-8

  printf "\\nPressione ENTER para voltar ao menu principal..."
  IFS= read -r _
  break
  ;;
  2)
  cat "$LOG_FILE" | grep "^[0-9]\\{4\\}-" | iconv -f utf-8 -t utf-8
  printf "\\nPressione ENTER para voltar ao menu principal..."
  IFS= read -r _
  break
  ;;
  3)
  cat "$LOG_FILE" | grep -v "^[0-9]\\{4\\}-" | iconv -f utf-8 -t utf-8
  printf "\\nPressione ENTER para voltar ao menu principal..."
  IFS= read -r _
  break
  ;;
  0)
  break
  ;;
esac
done
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
}

# ========================
# Menu principal
# ========================
menu() {
  while true; do
    # Oculta o cursor e desabilita entrada momentaneamente
if [ -t 0 ]; then
  stty -echo -icanon time 0 min 0 || true
fi
command -v tput >/dev/null 2>&1 && tput civis >/dev/null 2>&1 || true
    clear
    # Restaura comportamento normal e volta a mostrar o cursor
if [ -t 0 ]; then
  stty sane || true
fi
command -v tput >/dev/null 2>&1 && tput cnorm >/dev/null 2>&1 || true

    echo "====================================="
    echo "   📦 Gerenciador do Bot-Mwsm"
    echo "====================================="
    echo "1) Instalar"
    echo "2) Atualizar"
    echo "3) Reinstalar"
    echo "4) Desinstalar"
    echo "0) Sair"
    echo "-------------------------------------"
    printf "Escolha uma opção: "

    # Oculta o cursor
    tput civis

    # Lê uma única tecla (sem Enter)
    while true; do
      read -rsn1 choice
      case "$choice" in
      [0-6]) break ;;  # aceita apenas 0–6
      *) continue ;;   # ignora qualquer outra tecla
    esac
  done

  # Mostra novamente o cursor
  tput cnorm
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
  if [[ "$LAST_SUCCESS" == "install" ]]; then
    if command -v pm2 >/dev/null 2>&1; then
      NAME=$(jq -r .name /var/api/Mwsm/package.json 2>/dev/null)
      MATCHED=""

      if [[ -n "$NAME" && -f /var/api/Mwsm/mwsm.json ]]; then
        if jq -r 'tostring' /var/api/Mwsm/mwsm.json 2>/dev/null | grep -q "$NAME"; then
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
  exit 0
  ;;
esac
done
}


menu
