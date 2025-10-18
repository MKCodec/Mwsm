#!/bin/bash

# ==============================
# 🧹 Limpeza e restauração do terminal
# ==============================
cleanup_terminal() {
  stty sane 2>/dev/null || true
  tput cnorm 2>/dev/null || true
}
trap cleanup_terminal EXIT INT TERM

# ==============================
# 🛡️ Bloqueio de teclado e cursor
# ==============================
stty -echo -icanon -isig
tput civis
trap '' INT TSTP QUIT

clear

# ==============================
# 🎨 Logo ASCII (MWSM)
# ==============================
cat <<'EOF'

                        ####
                    ############
                ########    ###### 
            ########  ######  ########
        ########    ############  ########
      ######            ############  ########
    ######  ####            ############  ####      ########        ########
    ####  ##########            ########  ####      ########        ########
    ####    ############    ############  ####      ####  ##      ####  ####  ####      ####    ####    ########    ##  ######    ###### 
    ####  ##    ##################  ####  ####      ####  ####    ####  ####  ####    ######    ####  ####    ##    ######  ######  #### 
    ####  ####      ##########      ####  ####      ####  ####    ##    ####    ####  ######    ####  ####          ####    ####      #### 
    ####  ####        ######        ####  ####      ####    ##  ####    ####    ####  ##  ##    ##      ######      ####    ####      #### 
    ####  ####        ######        ####  ####      ####    ########    ####    ####  ##  ########          ####    ####    ####      #### 
    ####  ####        ######        ####  ####      ####    ######      ####      ######  ########          ####    ####    ####      #### 
    ####  ####        ######        ####  ####      ####      ####      ####      ######    ####      ##########    ####    ####      #### 
    ######  ##        ######        ##    #### 
    ########          ######          ######## 
        ########      ######      ########## 
            ########    ##    ########## 
                #################### 
                  ############## 
                      ###### 

EOF

# ==============================
# 🔄 Função spinner contínuo
# ==============================
spinner_start() {
  local message="$1"
  local spin='-\|/'
  local i=0
  while true; do
    i=$(( (i+1) %4 ))
    printf "\r  ${spin:$i:1} %s" "$message"
    sleep 0.1
  done
}

# ==============================
# 🔍 Detecta sudo
# ==============================
if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
else
  SUDO="sudo"
fi

# ==============================
# 🔍 Detectar distribuição
# ==============================
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

  # 🚀 Detecta Docker antes de qualquer fallback
  if [ -f /.dockerenv ] || grep -qE '/docker/' /proc/1/cgroup 2>/dev/null; then
    DISTRO_DETECT="docker"
    return 0
  fi

  DISTRO_DETECT="other"
  return 1
}

detect_distro

# ==============================
# 🧾 Log
# ==============================
LOG_FILE="/var/log/mwsm.log"
$SUDO mkdir -p "$(dirname "$LOG_FILE")" >/dev/null 2>&1
$SUDO touch "$LOG_FILE" >/dev/null 2>&1
$SUDO chmod 666 "$LOG_FILE" >/dev/null 2>&1
echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Iniciando instalador" >>"$LOG_FILE"

# ==============================
# ⚙️ Execução com spinner
# ==============================
spinner_start "Inicializando instalador..." &
SPIN_PID=$!

{
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Verificando dependências..." >>"$LOG_FILE"

  # ==============================
  # 🐋 Caso esteja em Docker (modo ultrarrápido)
  # ==============================
  if [[ "$DISTRO_DETECT" == "docker" ]]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Ambiente Docker detectado - iniciando modo ultrarrápido" >>"$LOG_FILE"
    if ! systemctl is-active --quiet docker; then
      echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Iniciando serviço Docker" >>"$LOG_FILE"
      $SUDO systemctl start docker >/dev/null 2>&1
    fi
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Baixando imagem mkcodec/mwsm:latest" >>"$LOG_FILE"
    $SUDO docker pull mkcodec/mwsm:latest >/dev/null 2>&1
    if $SUDO docker ps -a --format '{{.Names}}' | grep -q '^mwsm$'; then
      echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Removendo container antigo Mwsm" >>"$LOG_FILE"
      $SUDO docker stop mwsm >/dev/null 2>&1
      $SUDO docker rm mwsm >/dev/null 2>&1
    fi
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Iniciando container Mwsm" >>"$LOG_FILE"
    $SUDO docker run -d --name mwsm -p 8000:8000 -p 5005:5005 mkcodec/mwsm:latest >/dev/null 2>&1
    sleep 5
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Acessando logs do PM2 dentro do container" >>"$LOG_FILE"
    $SUDO docker exec -it mwsm pm2 logs
  else
    # ==============================
    # 🧩 Correção silenciosa Debian antigo
    # ==============================
    detect_distro

    if [[ "$DISTRO_DETECT" == "devuan" ]]; then
      echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Corrigindo repositórios (Devuan)" >>"$LOG_FILE"
      $SUDO bash -c '
        sed -i "s|deb.debian.org|archive.debian.org|g" /etc/apt/sources.list
        sed -i "s|security.debian.org|archive.debian.org/debian-security|g" /etc/apt/sources.list
        echo "Acquire::Check-Valid-Until false;" > /etc/apt/apt.conf.d/99archive
        apt-get clean -qq >/dev/null 2>&1
        rm -rf /var/lib/apt/lists/* >/dev/null 2>&1
        apt-get update --allow-releaseinfo-change -o Acquire::Check-Valid-Until=false -y -qq >/dev/null 2>&1
      ' >>"$LOG_FILE" 2>&1
    fi

# ==============================
# 📦 Curl e dependências
# ==============================
if ! command -v curl >/dev/null 2>&1; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Instalando curl" >>"$LOG_FILE"
  $SUDO apt-get update -qq >/dev/null 2>&1
  $SUDO apt-get install -y -qq curl >/dev/null 2>&1
fi

# ==============================
# 🧰 Git e dependências
# ==============================
if ! command -v git >/dev/null 2>&1; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Instalando git" >>"$LOG_FILE"
  $SUDO apt-get update -qq >/dev/null 2>&1
  $SUDO apt-get install -y -qq git >/dev/null 2>&1
fi

    # ==============================
    # 🕒 Ajuste de fuso horário e NTP
    # ==============================
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Ajustando fuso horário e NTP" >>"$LOG_FILE"
    if command -v timedatectl >/dev/null 2>&1; then
      $SUDO timedatectl set-timezone America/Sao_Paulo >/dev/null 2>&1
      $SUDO timedatectl set-ntp true >/dev/null 2>&1
    else
      $SUDO ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime >/dev/null 2>&1
      echo "America/Sao_Paulo" | $SUDO tee /etc/timezone >/dev/null 2>&1
      command -v hwclock >/dev/null 2>&1 && $SUDO hwclock --systohc >/dev/null 2>&1
    fi

    # ==============================
    # ⬇️ Download do mwsm.sh (modo normal)
    # ==============================
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Baixando mwsm.sh" >>"$LOG_FILE"
    $SUDO mkdir -p /var/api/Mwsm >/dev/null 2>&1
    MWSM_URL="https://raw.githubusercontent.com/MKCodec/Mwsm/refs/heads/main/bash/mwsm.sh?nocache=$(date +%s)"
    $SUDO curl -sSL "$MWSM_URL" -o /var/api/Mwsm/mwsm.sh >/dev/null 2>&1
    $SUDO chmod +x /var/api/Mwsm/mwsm.sh >/dev/null 2>&1
  fi

} >>"$LOG_FILE" 2>&1

# ==============================
# ⏳ Finalização
# ==============================
sleep 2
kill $SPIN_PID >/dev/null 2>&1
wait $SPIN_PID 2>/dev/null

# ==============================
# 🧪 Verificação
# ==============================
if ! grep -q '# 📦 Gerenciador do Bot-Mwsm' /var/api/Mwsm/mwsm.sh 2>/dev/null; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Erro ao baixar mwsm.sh" >>"$LOG_FILE"
  stty sane; tput cnorm; exit 1
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') - [SETUP] Setup concluído com sucesso" >>"$LOG_FILE"

# ==============================
# 🚀 Executa menu principal
# ==============================
clear
cd /var/api/Mwsm >/dev/null 2>&1
stty sane
tput cnorm
if [ -f /var/api/Mwsm/mwsm.sh ]; then
  ln -sf /var/api/Mwsm/mwsm.sh /usr/local/bin/mwsm 2>/dev/null || $SUDO ln -sf /var/api/Mwsm/mwsm.sh /usr/local/bin/mwsm
  chmod +x /usr/local/bin/mwsm 2>/dev/null || $SUDO chmod +x /usr/local/bin/mwsm
fi
exec bash ./mwsm.sh
