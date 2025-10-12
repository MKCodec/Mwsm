<h1 align="center">📦 MkAuth WhatsApp Send Message (Mwsm)</h1>
<p align="center">
  <a href="javascript:void(0)">
          <img src="https://img.shields.io/badge/Build-3.0.0-blue?style=for-the-badge" alt="Badge">
  </a>
  <a href="javascript:void(0)">
          <img src="https://img.shields.io/badge/Update-10%2F10%2F2025%2015:46-green?style=for-the-badge" alt="Badge">
  </a>
  <a href="https://github.com/MKCodec/Mwsm">
          <img src="https://img.shields.io/github/stars/MKCodec/Mwsm?style=for-the-badge" alt="Badge">
  </a>
  <a href="https://github.com/MKCodec/Mwsm/issues">
          <img src="https://img.shields.io/github/issues/MKCodec/Mwsm?style=for-the-badge" alt="Badge">
  </a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/MKCodec/Mwsm/main/img/Mwsm.png?style=for-the-badge" width="600" alt="Mwsm Logo"/>
</p>

<h3 align="center">💖 Apoie o projeto Mwsm:</h3>
<p align="center">
          <a href="https://github.com/sponsors/MKCodec" target="_blank">
          <img src="https://img.shields.io/github/sponsors/MKCodec?label=Sponsors&logo=github&style=for-the-badge" alt="Badge">
          </a>
          <a href="https://ko-fi.com/mkcodec" target="_blank">
          <img src="https://img.shields.io/badge/Ko--fi-5-FF5E5B?logo=ko-fi&logoColor=white&style=for-the-badge" alt="Badge">
          </a>
          <a href="https://mkcodec.github.io/Mwsm/pix.html" target="_blank">
          <img src="https://img.shields.io/badge/PIX-Doar-32CD32?logo=pix&logoColor=white&style=for-the-badge" alt="Badge">
          </a>
</p>




---

## 🚀 Sobre o Projeto

O **Mwsm** é uma API que integra notificações automatizadas por **WhatsApp** ao sistema **MkAuth**.  
Ela permite disparar mensagens, sincronizar cobranças e automatizar comunicações com seus clientes.

---

## 🧩 Compatibilidade

| Gateway/Banco | BAR | PIX | QR | QRL | PDF |
| -------------- | --- | --- | -- | --- | --- |
| **Gerencianet** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Iugu**        | ✅ | ✅ | ✅ | ✅ | ✅ |
| **GalaxPay**    | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Santander**   | ✅ | ❌ | ❌ | ❌ | ✅ |

> ⚠️ Compatibilidade relatada por usuários. Pode funcionar com outros gateways não listados.

---

## 🧠 Requisitos

- Servidor Linux (Ubuntu, Debian ou Proxmox)
- [API MkAuth](https://github.com/MKCodec/MkAuth-API) modificada para uso com Mwsm

---

## ⚙️ Instalação

### Pré-instalação

Execute no MkAuth se o Mwsm for instalado separadamente:

```sh
cd ~ && sudo wget https://raw.githubusercontent.com/MKCodec/MkAuth-API/main/titulo.api -O /opt/mk-auth/api/titulo.api
```

### Instalação

Rode o instalador (Ubuntu/Proxmox ou Debian/MkAuth):

```sh
bash <(wget -qO- "https://raw.githubusercontent.com/MKCodec/Mwsm/refs/heads/main/bash/setup.sh?nocache=$(date +%s)")
```

---

<details>
<summary>🧭 Configuração</summary>

### 1️⃣ Ative o Túnel Dev API no MkAuth

```
Opções > Rede do Servidor > MkTunel > (Ativar e Gravar)
```

![MkAuth Dev](https://raw.githubusercontent.com/MKCodec/Mwsm/main/img/dev.png)

### 2️⃣ Ative os Endpoints `titulo.api GET` e `cliente.api GET`

```
Provedor > Controle de Usuarios > API
ou
Provedor > DEV > API do Usuario
```

![Endpoints](https://raw.githubusercontent.com/MKCodec/Mwsm/main/img/endpoint.png)

### 3️⃣ Acesse o servidor via IP:PORTA

![Terminal](https://raw.githubusercontent.com/MKCodec/Mwsm/main/img/terminal.png)

### 4️⃣ Escaneie o QR Code com o WhatsApp

![QRCode](https://raw.githubusercontent.com/MKCodec/Mwsm/main/img/settings.png)

### 5️⃣ Configure a API do MkAuth no Mwsm

| Campo | Descrição |
| ------ | ---------- |
| `TUNEL` | URL do túnel configurado no MkAuth |
| `CLIENT` | Código do cliente |
| `SECRET` | Código secreto |
| `DOMAIN` | Domínio/IP do servidor MkAuth |
| `VERSION` | Selecione v1 ou v2 |
| `MODE` | Escolha o tipo de conexão |

![Sync](https://raw.githubusercontent.com/MKCodec/Mwsm/main/img/sync.png)

</details>

---

<details>
<summary>📊 Gerenciamento</summary>

Escolha seu gerenciador principal: **MkAuth** ou **Mwsm**.

### 🧩 MkAuth

1️⃣ Configure o servidor no MkAuth seguindo as instruções do painel web.

**Senha:** insira o *Token fixo* de acesso.

#### MkAuth até versão 24.02
```
Opções > Servidor de SMS > Servidor
```

![MkAuth](https://raw.githubusercontent.com/MKCodec/Mwsm/main/img/mkauth.png)

#### MkAuth 24.03 ou superior
```
Opções > Servidor de WhatsApp > Servidor
```

![WhatsApp](https://raw.githubusercontent.com/MKCodec/Mwsm/main/img/whatsapp.png)

### 🧩 Mwsm

No Mwsm:

```
Settings > API > Tela 2
```

As mensagens são disparadas conforme o agendamento configurado na API.

![Autobot](https://raw.githubusercontent.com/MKCodec/Mwsm/main/img/autobot.png)

</details>

---

## 💬 Dúvidas, Erros e Suporte

Se ocorrerem erros, ative o modo **Debug** em:

```
Settings > Extras > Debug ON
```

Em caso de persistência, visite o fórum oficial:  
🔗 [https://mk-auth.com.br/forum/topics/envio-de-mensagem-via-whatsapp-100-gratuito](https://mk-auth.com.br/forum/topics/envio-de-mensagem-via-whatsapp-100-gratuito)

---

## 💖 Doações PIX

Apoie o projeto e ajude a manter o **Mwsm** gratuito e atualizado.

![Pix](https://github.com/user-attachments/assets/53092d48-c31b-430b-bc10-68ba5b43f7c2)

**Chave:**  
```sh
e9b9d669-4412-4dec-994c-310005904088
```

**Copia e Cola:**  
```sh
00020126580014BR.GOV.BCB.PIX0136e9b9d669-4412-4dec-994c-3100059040885204000053039865802BR5924CLEBER FERREIRA DE SOUZA6007CARUARU62070503***63045854
```

---

<p align="center">© 2025 MkAuth WhatsApp Send Message - Desenvolvido por MKCodec</p>
