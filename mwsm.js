//******************************************************************
// MkAuth WhatsApp Send Message
//******************************************************************
const Playground = "00000000000";
const Initialize = false;


import {
	createRequire
} from 'module';
import {
	fileURLToPath
} from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
	exec as execCb,
	execSync
} from 'child_process';
import {
	promisify
} from 'util';

const {
	Client,
	LocalAuth,
	Buttons,
	List,
	MessageMedia
} = require('whatsapp-web.js');
const express = require('express');
const {
	body,
	validationResult
} = require('express-validator');

var Delay, Wait, Reboot, Sending, Permission = false,
	wwjsRun = true;
var MsgBox = false,
	Session = false;

const activeSupportIA = new Map();
const activeMenus = new Map();
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const https = require('https');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');

const app = express();
const os = require("os");
const hostName = os.hostname();
const emoji = require('Emoji-API');
const server = http.createServer(app);
const io = socketIO(server);
const sys = require('util');
const fs = require('fs');
const fsPromises = require('fs').promises;
const ip = require('ip');
const Url2PDF = require("Url2PDF");
const cron = require('node-cron');
const htmlPDF = new Url2PDF();

const exec = promisify(execCb);

let isPanelAuthorized = false;

const link = require('better-sqlite3')('mwsm.db');
link.pragma('journal_mode = WAL');

const db = {
	run: (sql, params, callback) => {
		try {
			const info = link.prepare(sql).run(params || []);
			if (typeof callback === 'function') callback(null, info);
		} catch (err) {
			if (typeof callback === 'function') callback(err);
		}
	},
	get: (sql, params, callback) => {
		try {
			const row = link.prepare(sql).get(params || []);
			if (typeof callback === 'function') callback(null, row);
		} catch (err) {
			if (typeof callback === 'function') callback(err);
		}
	},
	all: (sql, params, callback) => {
		try {
			const rows = link.prepare(sql).all(params || []);
			if (typeof callback === 'function') callback(null, rows);
		} catch (err) {
			if (typeof callback === 'function') callback(err);
		}
	},
	serialize: (callback) => {
		if (typeof callback === 'function') callback();
	}
};

const register = new Date().getDate();
const Package = require('./package.json');
require('events').EventEmitter.defaultMaxListeners = Infinity;
const WServer = "https://raw.githubusercontent.com/MKCodec/Mwsm/main/version.json";
const crypto = require('crypto');
const Keygen = (length = 7, characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') => Array.from(crypto.randomFillSync(new Uint32Array(length))).map((x) => characters[x % characters.length]).join('');
var Password = [Debug('OPTIONS').token, Keygen()];

process.env.LANG = "pt-BR.utf8";
global.io = io;

const {
	Queue,
	Worker,
	QueueEvents,
	DelayedError
} = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis({
	host: '127.0.0.1',
	port: 6379,
	maxRetriesPerRequest: null,
	retryStrategy(times) {
		const delay = Math.min(times * 500, 5000);
		return delay;
	}
});

const messageQueue = new Queue('Row', {
	connection,
	skipVersionCheck: true
});

const queueEvents = new QueueEvents('Row', {
	connection,
	skipVersionCheck: true
});

// Configuração única do express.json com verify para capturar o rawBody corretamente
app.use(express.json({
	verify: (req, res, buf) => {
		if (buf && buf.length) {
			req.rawBody = buf.toString('utf8');
		}
	}
}));
app.use(express.urlencoded({
	extended: true
}));

const EnqueueWithPriority = async (payload, delayMs = 0, isPostRoute = false) => {
	const queueInstance = typeof messageQueue !== 'undefined' ? messageQueue : global.messageQueue;

	if (!queueInstance) {
		return false;
	}

	const RETENTION_30_DAYS = 30 * 24 * 3600;
	const hoje = new Date().toISOString().split('T')[0];
	const codigoTitulo = payload.code || payload.titulo || payload.codeTitle || `${Keygen(7)}`;

	const rawPriority = Number(payload?.priority ?? 4);
	const effectivePriority = isPostRoute ? 0 : rawPriority;
	const jobIdPriority = (isPostRoute || rawPriority === 0) ? 4 : rawPriority;

	const uniqueJobId = `msg-${codigoTitulo}-p${jobIdPriority}-${hoje}`;

	const jobOptions = {
		jobId: uniqueJobId,
		priority: effectivePriority,
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 5000
		},
		removeOnComplete: {
			age: RETENTION_30_DAYS
		},
		removeOnFail: {
			age: RETENTION_30_DAYS
		}
	};

	if (delayMs > 0) {
		jobOptions.delay = delayMs;
	}

	try {
		const existingJob = await queueInstance.getJob(uniqueJobId);

		if (existingJob) {
			return null;
		}

		const resultJob = await queueInstance.add('send-message', {
			...payload,
			priority: effectivePriority
		}, jobOptions);

		return resultJob;

	} catch (err) {
		const isDuplicate = err.message && (
			err.message.includes('Job') ||
			err.message.includes('already exists') ||
			err.message.includes('exists')
		);

		if (isDuplicate) {
			return null;
		}

		throw err;
	}
};

const RemoveExistingJob = async (jobId) => {
	const queueInstance = typeof messageQueue !== 'undefined' ? messageQueue : global.messageQueue;

	if (!queueInstance || !jobId) return false;

	try {
		const existingJob = await queueInstance.getJob(jobId);

		if (existingJob) {
			const state = await existingJob.getState();

			if (['failed', 'delayed', 'waiting'].includes(state)) {
				await existingJob.remove();
				return true;
			}
		}
		return false;
	} catch (err) {
		return false;
	}
};

app.post('/webhook/mkauth', async (req, res) => {
	writeLog('WEBHOOK RECEBIDO', {
		headers: req.headers,
		query: req.query,
		body: req.body
	});

	try {
		const isWebhookEnabled = Boolean(Debug('MKAUTH').whstatus);
		if (!isWebhookEnabled) {
			writeLog('WEBHOOK IGNORADO: Webhook desativado nas configurações.');
			return res.status(200).json({
				status: 'ignored',
				message: 'Webhook is disabled.'
			});
		}

		const signature = req.headers['x-webhook-signature'];

		if (!signature) {
			writeLog('WEBHOOK ERRO: Assinatura ausente.');
			return res.status(401).json({
				error: 'Missing webhook signature'
			});
		}

		const secretMkauth = Debug('MKAUTH').webhook;
		const payloadString = req.rawBody || JSON.stringify(req.body || {});
		const computedSignature = crypto
			.createHmac('sha256', secretMkauth)
			.update(payloadString)
			.digest('hex');

		if (signature !== computedSignature) {
			writeLog('WEBHOOK ERRO: Assinatura inválida.');
			return res.status(401).json({
				error: 'Invalid webhook signature'
			});
		}

		if (!Boolean(Debug('MKAUTH').module) || !Boolean(Debug('MKAUTH').aimbot) || !Boolean(Debug('SCHEDULER').onpay)) {
			writeLog('WEBHOOK IGNORADO: Validações do sistema desativadas.');
			return res.status(200).json({
				status: 'ignored',
				message: 'Validations disabled.'
			});
		}

		const payload = req.body || {};
		const dadosWebhook = payload.dados || payload;

		let numeroTitulo = null;

		numeroTitulo = dadosWebhook.titulo ||
			dadosWebhook.id_titulo ||
			dadosWebhook.code ||
			dadosWebhook.nossonumero ||
			dadosWebhook.seu_numero ||
			dadosWebhook.id_transacao ||
			dadosWebhook.custom_id ||
			payload.titulo;

		if (!numeroTitulo && dadosWebhook.historico) {
			const matchHistorico = dadosWebhook.historico.match(/(?:titulo|tÃ­tulo|tit|fatura|boleto)\s*[:#-]?\s*(\d+)/i);
			if (matchHistorico && matchHistorico[1]) {
				numeroTitulo = matchHistorico[1];
			}
		}

		if (!numeroTitulo) {
			const rawContent = JSON.stringify(payload);
			const matchTitulo = rawContent.match(/(?:titulo|tÃ­tulo|tit|nossonumero|fatura|boleto)\s*[:#-]?\s*(\d+)/i);
			if (matchTitulo && matchTitulo[1]) {
				numeroTitulo = matchTitulo[1];
			}
		}

		if (numeroTitulo) {
			writeLog(`WEBHOOK PROCESSANDO TÍTULO: ${numeroTitulo}`);
			const Resolve = await MkAuth('all', numeroTitulo, 'list');
			const isBank = Array.isArray(Resolve) ? Resolve[0] : (Resolve ? Object.assign({}, Resolve)[0] : null);

			if (isBank && (isBank.Payment === 'paid' || isBank.Payment === 'pago')) {
				const localSchedule = await link.prepare('SELECT * FROM scheduling WHERE title=?').get(isBank.Identifier);
				const isBlocked = isBank.unLock === 'false' || isBank.unLock === '0' || isBank.unLock === false;
				const processFactor = isBlocked ? 'unlock' : 'pending';

				const messagePayload = {
					client: isBank.Client || localSchedule?.client,
					authority: isBank.Authority || isBank.Client || localSchedule?.client,
					user: isBank.Connect || localSchedule?.user,
					code: isBank.Identifier,
					status: "finished",
					contact: isBank.Contact || localSchedule?.contact,
					reward: isBank.Reward || localSchedule?.reward,
					push: DateTime(),
					option: localSchedule?.option || isBank.Working,
					unlock: isBank.unLock || 'true',
					process: processFactor,
					token: Debug('OPTIONS').token,
					cash: isBank.Cash || localSchedule?.cash,
					gateway: isBank.Gateway || localSchedule?.gateway || 'gerencianet',
					payment: 'paid',
					priority: 1
				};

				const processResult = await ProcessMkAuthMessage(messagePayload);

				if (processResult && processResult.Status === "Success") {
					await link.prepare('DELETE FROM scheduling WHERE title=?').run(isBank.Identifier);

					if (global.io) {
						global.io.emit('schedresume', {
							title: isBank.Identifier,
							status: 'paid'
						});
					}
					writeLog(`WEBHOOK SUCESSO: Título ${isBank.Identifier} processado e removido do SQLite.`);
				}
			}
		}

		return res.status(200).json({
			status: 'success'
		});
	} catch (error) {
		writeLog('WEBHOOK ERRO CRÍTICO NO PROCESSAMENTO', {
			message: error.message,
			stack: error.stack
		});

		return res.status(500).json({
			error: 'Internal Server Error'
		});
	}
});

const processedDispatchesToday = new Set();
let currentDayCache = new Date().getDate();

function isDuplicate(code, priority, processDate) {
	const today = new Date().getDate();
	if (today !== currentDayCache) {
		processedDispatchesToday.clear();
		currentDayCache = today;
	}

	const executionDate = processDate.split(" ")[0];

	const uniqueKey = `${code}_P${priority}_${executionDate}`;

	if (processedDispatchesToday.has(uniqueKey)) {
		return true;
	}

	processedDispatchesToday.add(uniqueKey);
	return false;
}


async function broadcastPanelStats(customEngine = null, customKeygen = null) {
	try {
		const options = Debug('OPTIONS');
		const targetKeygen = customKeygen || options.keygen;
		let inputEngine = customEngine || options.engine;

		let targetModule = await new Promise((resolve) => {
			db.get("SELECT module FROM engine WHERE title = ? OR id = ? OR module = ?", [inputEngine, inputEngine, inputEngine], (err, row) => {
				resolve(row?.module || inputEngine);
			});
		});

		let Balance = '0,00';
		let Charge = null;

		let OpenRouter = await Openrout(targetKeygen);

		if (!OpenRouter || !OpenRouter.financial) {
			return false;
		}

		const isInvalidCharge = (c) => !c || (c.input_cost_brl === '0,00' && c.output_cost_brl === '0,00');

		Charge = OpenRouter.models?.find(m =>
			m.id === targetModule ||
			m.title === inputEngine ||
			(m.id && targetModule && m.id.toLowerCase() === String(targetModule).toLowerCase())
		);

		if (isInvalidCharge(Charge)) {
			await SyncEngineModules(targetKeygen);

			targetModule = await new Promise((resolve) => {
				db.get("SELECT module FROM engine WHERE title = ? OR id = ? OR module = ?", [inputEngine, inputEngine, inputEngine], (err, row) => {
					resolve(row?.module || inputEngine);
				});
			});

			OpenRouter = await Openrout(targetKeygen);
			Charge = OpenRouter?.models?.find(m =>
				m.id === targetModule ||
				m.title === inputEngine ||
				(m.id && targetModule && m.id.toLowerCase() === String(targetModule).toLowerCase())
			);
		}

		Balance = OpenRouter?.financial?.balance_brl || '0,00';

		const AskBrains = await new Promise((resolve) => {
			db.get("SELECT COUNT(*) AS total FROM intelligence", [], (err, row) => {
				resolve(row ? row.total : 0);
			});
		});

		const socketEvents = {
			AskBalance: Balance,
			AskInput: Charge?.input_cost_brl || '0,00',
			AskOutput: Charge?.output_cost_brl || '0,00',
			AskBrain: AskBrains
		};

		if (global.io) {
			for (const [event, value] of Object.entries(socketEvents)) {
				global.io.emit(event, value);
			}
		}

		return true;
	} catch (err) {
		return false;
	}
}

const Print = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",
	fg: {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",
		gray: "\x1b[90m",
		crimson: "\x1b[38m"
	},
	bg: {
		black: "\x1b[40m",
		red: "\x1b[41m",
		green: "\x1b[42m",
		yellow: "\x1b[43m",
		blue: "\x1b[44m",
		magenta: "\x1b[45m",
		cyan: "\x1b[46m",
		white: "\x1b[47m",
		gray: "\x1b[100m",
		crimson: "\x1b[48m"
	}
};

// Delay
function delay(t, v) {
	return new Promise((resolve) => {
		setTimeout(resolve.bind(null, v), t);
	});
}

// Get Date
function AddZero(num) {
	return (num >= 0 && num < 10) ? "0" + num : String(num);
}

// Capitalize
function toCapitalize(str) {
	if (!str) return "";
	return str
		.toLowerCase()
		.split(' ')
		.map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
		.join(' ');
}

// Search DataBase
function Debug(Select, Search = '*', Mode = 'single', Find = undefined) {
	const table = Select.toLowerCase();
	const fields = Search.toLowerCase();
	const mode = Mode.toLowerCase();

	const queries = {
		single: () => link.prepare(`SELECT ${fields} FROM ${table} ORDER BY ID DESC`).get(),
		multiple: () => link.prepare(`SELECT ${fields} FROM ${table}`).pluck().all(),
		all: () => link.prepare(`SELECT ${fields} FROM ${table} ORDER BY ID DESC`).all(),
		direct: () => link.prepare(`SELECT ${fields} FROM ${table} WHERE title = ?`).get(Find),
		id: () => link.prepare(`SELECT ${fields} FROM ${table} WHERE id = ?`).get(Find)
	};

	return queries[mode] ? queries[mode]() : undefined;
}


// Debug
function DebugMsg(Selector) {
	const mkauth = Debug('MKAUTH') || {};
	const last = mkauth.count || 0;
	const mode = (mkauth.level || '').toLowerCase();

	const modeStrategies = {
		direct: () => 1,
		random: () => Math.floor(Math.random() * 3) + 1,
		order: () => (last >= 1 && last <= 3) ? (last % 3) + 1 : 1
	};

	const returnId = (modeStrategies[mode] || modeStrategies.direct)();
	const msgRecord = Debug('MESSAGE', '*', 'ID', String(returnId));
	const message = msgRecord?.[Selector.toLowerCase()];

	Dataset('MKAUTH', 'COUNT', returnId, 'UPDATE');
	return message;
}


// SetDDI
function DDISet(contact) {
	if (!contact) return "";
	let numero = String(contact).replace(/\D/g, "").replace(/^0+/, "");
	if (!numero.startsWith("55") && (numero.length === 10 || numero.length === 11)) {
		numero = "55" + numero;
	}
	if (numero.startsWith("55") && numero.length === 12) {
		let ddiEddd = numero.substr(0, 4);
		let local = numero.substr(4);
		if (/^[6-9]/.test(local)) {
			local = "9" + local;
		}
		return ddiEddd + local;
	}
	return numero;
}

// RegEx
function validPhone(phone) {
	if (!Boolean(Debug('OPTIONS').regex)) {
		return true;
	}
	if (!phone) return false;
	const numeroFormatado = DDISet(phone);
	const regexWhatsApp = /^55((1[1-9])|([2-9][0-9]))9\d{8}$/;
	return regexWhatsApp.test(numeroFormatado);
}

function PromiseTimeout(delayms) {
	return new Promise(function(resolve, reject) {
		setTimeout(resolve, delayms);
	});
}

// Check Whatsapp
async function checkWhatsAppNumber(phone) {
	if (!validPhone(phone)) return false;
	try {
		const numberDetails = await client.getNumberId(phone);
		if (!numberDetails) return false;
		if (numberDetails.server === 'lid') {
			return phone;
		}

		return numberDetails._serialized || phone;
	} catch (error) {
		return false;
	}
}

// Manipulation DataBase
const Dataset = async (Table, Column, Value, Mode) => {
	const table = Table.toLowerCase();
	const column = Column ? Column.toLowerCase() : '';
	const mode = Mode.toLowerCase();

	try {
		const operations = {
			update: () => {
				const result = link.prepare(`UPDATE ${table} SET ${column} = ? WHERE id = ?`).run(Value, '1');
				return result.changes > 0;
			},
			insert: () => {
				const result = link.prepare(`INSERT INTO ${table} (${column}) VALUES (?)`).run(Value);
				return result.lastInsertRowid || false;
			},
			delete: () => {
				const result = link.prepare(`DELETE FROM ${table} WHERE id = ?`).run(Value);
				return result.changes > 0;
			},
			flush: () => {
				const target = String(Value).toLowerCase();
				const countResult = link.prepare(`SELECT COUNT(*) as total FROM ${target}`).get();
				const total = countResult?.total || 0;
				const result = link.prepare(`UPDATE ${table} SET ${column} = ? WHERE NAME = ?`).run(total.toString(), target);
				return result.changes > 0;
			}
		};

		return operations[mode] ? operations[mode]() : false;
	} catch (err) {
		return false;
	}
};


const isEmoji = (Value) => {
	return typeof Value === 'string' ? emoji.emojify(Value) : Value;
};


const Boolean = function(str) {
	if (str == null || str === "") {
		return false;
	}

	if (typeof str === 'boolean') {
		return str;
	}

	if (typeof str === 'number') {
		return str !== 0;
	}

	if (typeof str === 'string') {
		const normalized = str
			.trim()
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");

		if (/^(true|yes|y|sim|s|1|active|ativado|ativo|enabled|enable|on|ok|allow|allowed)$/.test(normalized)) {
			return true;
		}

		if (/^(false|no|not|n|nao|0|inactive|inativo|disabled|disable|off|deny|denied|null|undefined)$/.test(normalized)) {
			return false;
		}
	}
	if (!isNaN(str)) {
		return parseFloat(str) !== 0;
	}

	return undefined;
};

//ForEach Async Mode
Array.prototype.someAsync = function(callbackfn) {
	return new Promise(async (resolve, reject) => {
		await Promise.all(this.map(async item => {
			if (await callbackfn(item)) resolve(true)
		})).catch(reject)
		resolve(false)
	})
}

function wget(url, dest) {
	return new Promise((res) => {
		https.get(url, (response) => {
			if (response.statusCode == 302) {
				wget(String(response.headers.location), dest);
			} else {
				const file = fs.createWriteStream(dest);
				response.pipe(file);
				file.on("finish", function() {
					file.close();
					res();
				});
			}
		});
	});
}

function ArrayPosition(...criteria) {
	return (a, b) => {
		for (let i = 0; i < criteria.length; i++) {
			const curCriteriaComparatorValue = criteria[i](a, b)
			if (curCriteriaComparatorValue !== 0) {
				return curCriteriaComparatorValue
			}
		}
		return 0
	}
}

const GetUpdate = async (GET, SET, GUPForce = false) => {
	let status = false;
	let updated = "false";
	let conclusion = true;

	const fetchRemoteVersion = async (url) => {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return await res.json();
		} catch (err) {
			return {
				version: [{
					release: '0.0.0'
				}]
			};
		}
	};

	const getLocalVersion = () => {
		try {
			const localFilePath = path.join(__dirname, 'version.json');
			if (fs.existsSync(localFilePath)) {
				return JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
			}
		} catch (e) {}
		return {
			version: [{
				release: '0.0.0'
			}]
		};
	};

	const isUpdate = await fetchRemoteVersion(GET);
	const nowdate = getLocalVersion();

	const remoteRelease = isUpdate?.version?.[0]?.release || '0.0.0';
	const appName = Debug('OPTIONS').appname;

	if (remoteRelease <= Package.version && !SET && !GUPForce) {
		status = false;
		if (conclusion) {
			conclusion = false;
			global.io.emit('Patched', Release(Debug('RELEASE').mwsm));
			global.io.emit('message', `> ${appName} : ${Debug('CONSOLE').isalready}`);
		}
		updated = "false";
		global.io.emit('upgrade', true);
		await WwjsVersion(false);

	} else if (remoteRelease > Package.version || GUPForce) {
		global.io.emit('message', `> ${appName} : ${Debug('CONSOLE').isfound}`);
		global.io.emit('upgrade', false);

		const isUpdateAllowed = Boolean(Debug('RELEASE').isupdate) || Boolean(GUPForce);

		if (SET && isUpdateAllowed) {
			// 1. ATUALIZAÇÃO DE DB PRIMEIRO
			const register = await Dataset('RELEASE', 'MWSM', remoteRelease, 'UPDATE');

			if (register) {
				// 2. DISPAROS DE SOCKET ANTES DE BAIXAR O MWSM.JS
				global.io.emit('Patched', Release(Debug('RELEASE').mwsm));
				global.io.emit('upgrade', true);
				global.io.emit('message', `> ${appName} : ${Debug('CONSOLE').isupdated}`);
				global.io.emit('update', true);

				const baseUrl = "https://raw.githubusercontent.com/MKCodec/Mwsm/main";
				const targetDir = "/var/api/Mwsm";

				// 3. DOWNLOAD DOS ARQUIVOS SECUNDÁRIOS / ESTÁTICOS
				const staticFiles = [
					'script.js',
					'style.css',
					'index.html',
					'version.json'
				];

				for (const file of staticFiles) {
					try {
						await wget(`${baseUrl}/${file}`, `${targetDir}/${file}`);
					} catch (err) {
						console.error(`Erro ao baixar ${file}:`, err.message);
					}
				}

				// 4. DOWNLOAD E AJUSTE DO MWSM.JS POR ÚLTIMO (Gatilho do PM2)
				try {
					await wget(`${baseUrl}/mwsm.js`, `${targetDir}/mwsm.js`);

					let content = await fsPromises.readFile(`${targetDir}/mwsm.js`, 'utf8');
					if (!content.includes('createRequire')) {
						const header = `import { createRequire } from 'module';\nimport { fileURLToPath } from 'url';\nimport path from 'path';\nconst require = createRequire(import.meta.url);\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);\n\n`;
						content = header + content;
						await fsPromises.writeFile(`${targetDir}/mwsm.js`, content, 'utf8');
					}
				} catch (err) {
					console.error("Erro ao baixar e ajustar mwsm.js:", err.message);
				}

				// 5. FALLBACKS DE REINÍCIO (Caso o PM2 watch não esteja ativo)
				try {
					await exec('npm run restart:mwsm');
				} catch (err) {}

				await WwjsVersion(true);
				updated = "true";
			} else {
				updated = "false";
				global.io.emit('upgrade', false);
			}
			status = true;

		} else if (conclusion) {
			conclusion = false;
			status = true;
			if (!SET) {
				global.io.emit('message', `> ${appName} : ${Debug('CONSOLE').isneeds}`);
			}
			global.io.emit('upgrade', false);
			updated = "false";
		}

	} else if (conclusion) {
		conclusion = false;
		status = false;
		if (!SET) {
			global.io.emit('message', `> ${appName} : ${Debug('CONSOLE').isalready}`);
		}
		global.io.emit('upgrade', true);
		updated = "false";
	}

	return {
		Status: status,
		Update: updated
	};
};


// Set Debugger
function Terminal(Value) {
	if (Boolean(Debug('OPTIONS').debugger)) {
		console.error(Value);
	}
}

// Get Release
function Release(Value) {
	const [datePart, timePart = ''] = String(Value).split(' ');
	const formattedDate = new Date(datePart).toLocaleDateString('pt-BR');
	const [hours = '00', minutes = '00'] = timePart.split(':');

	return `${formattedDate} ${hours}:${minutes}`;
}


const checkRedisSentToday = async (code) => {
	try {
		const targetCode = String(code).trim();

		const isTargetJob = (job) => {
			const jobData = job.data || {};
			const jobOpts = job.opts || {};
			const priority = jobData.priority ?? jobOpts.priority;
			const jobCode = String(jobData.code || '').trim();

			return jobCode === targetCode && Number(priority) === 4;
		};

		const pendingJobs = await queue.getJobs(['waiting', 'active', 'delayed', 'prioritized'], 0, 1000);

		const jaEstaNaFila = pendingJobs.some(isTargetJob);

		if (jaEstaNaFila) {
			return true;
		}

		const completedJobs = await queue.getCompleted(0, 2000);

		if (!completedJobs || completedJobs.length === 0) {
			return false;
		}

		const jobsConcluidos = completedJobs.filter(isTargetJob);

		if (jobsConcluidos.length === 0) {
			return false;
		}

		jobsConcluidos.sort((a, b) => {
			const timeA = a.finishedOn || a.timestamp || 0;
			const timeB = b.finishedOn || b.timestamp || 0;
			return timeB - timeA;
		});

		const ultimoJob = jobsConcluidos[0];
		const returnValue = ultimoJob.returnvalue || {};
		const foiSucesso = returnValue.Status === "Success";

		const hoje = new Date();
		const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

		let dataUltimoJobStr = "";
		if (ultimoJob.finishedOn) {
			const dataJob = new Date(ultimoJob.finishedOn);
			dataUltimoJobStr = `${dataJob.getFullYear()}-${String(dataJob.getMonth() + 1).padStart(2, '0')}-${String(dataJob.getDate()).padStart(2, '0')}`;
		}

		const enviadoHoje = foiSucesso && (dataUltimoJobStr === hojeStr);

		return enviadoHoje;

	} catch (error) {
		return false;
	}
};

const SetSchedule = async (ShedForce = false) => {

	if (Boolean(Debug('ENGINE', 'ACTIVE', 'DIRECT', Debug('OPTIONS').engine)?.active)) {
		await SyncEngineModules();
	}

	const mkConfig = Debug('MKAUTH');
	const schedulerConfig = Debug('SCHEDULER');

	if (!Boolean(mkConfig?.module) || (!Boolean(mkConfig?.aimbot) && !Boolean(ShedForce))) {
		return;
	}

	var hasDays = [],
		Index = 0,
		hasReady = [],
		isSHED = [];

	if (Boolean(schedulerConfig?.bfive)) {
		hasDays.push({
			"Mode": "Before",
			"Set": 5,
			"Option": undefined
		});
	}

	if (Boolean(schedulerConfig?.inday)) {
		hasDays.push({
			"Mode": "Now",
			"Set": 0,
			"Option": undefined
		});
	}

	[5, 10, 15, 20, 25, 30, 35, 40].forEach((speedVal) => {
		const speedKey = ['lfive', 'lten', 'lfifteen', 'ltwenty', 'ltwentyfive', 'lthirty', 'lthirtyfive', 'lforty'][([5, 10, 15, 20, 25, 30, 35, 40].indexOf(speedVal))];

		if (Boolean(schedulerConfig?.[speedKey]) || schedulerConfig?.speed == speedVal) {
			hasDays.push({
				"Mode": "Later",
				"Set": speedVal,
				"Option": (Boolean(schedulerConfig?.onspeed) && schedulerConfig?.speed == speedVal) ? "speed" : undefined
			});
		}
	});

	if (Boolean(schedulerConfig?.onblock)) {
		hasDays.push({
			"Mode": "Later",
			"Set": schedulerConfig?.block,
			"Option": "Block"
		});
	}

	if (hasDays.length === 0) {
		return;
	}

	await (hasDays).someAsync(async (Days) => {

		const today = new Date();
		let targetDate = new Date(today);

		if (Days.Mode === "Before") {
			targetDate.setDate(today.getDate() + Days.Set);
		} else if (Days.Mode === "Later") {
			targetDate.setDate(today.getDate() - Days.Set);
		}

		const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');

		const Windows = await MkAuth(targetMonth, "all", 'list');
		const Master = await Scheduller(Days.Set, Days.Mode);

		if (Array.isArray(Master) && Master.length > 0) {

			Master.sort((a, b) => new Date(a.Reward) - new Date(b.Reward));

			await (Master).someAsync(async (Send) => {

				let MsgSET = false;

				const Identifier = Send.Identifier;
				const Connect = Send.Connect;
				const Contact = Send.Contact;
				const Authority = Send.Authority;
				const Client = Send.Client;
				const Reward = Send.Reward;
				let Payment = Send.Payment;

				let WhatsApp = true;

				if (Boolean(Debug('OPTIONS')?.regex)) {
					WhatsApp = validPhone(Contact);
				}

				const UnLock = Send.unLock ? 'true' : 'false';

				if (
					Reward &&
					(Reward.split(" ")[0]) == (DateTime()).split(" ")[0] &&
					Payment !== 'paid' &&
					Payment !== 'cancel'
				) {
					Payment = 'open';
				}

				const podeAgendar =
					Send.Working &&
					Payment !== 'paid' &&
					Payment !== 'cancel' &&
					WhatsApp &&
					Send.Ready;

				if (podeAgendar) {

					Index++;

					const Replies = await link
						.prepare('SELECT * FROM scheduling WHERE title=?')
						.get(Identifier);

					if (!Boolean(ShedForce)) {
						isSHED.push({
							"TITLE": Identifier,
							"CLIENT": Authority,
							"REWARD": Reward
						});
					}

					if (Replies == undefined) {

						const ShedInsert = await link.prepare(
							"INSERT INTO scheduling(title, user, authority, client, contact, reward, status, range, control, option, unlock, process) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
						).run(
							Identifier,
							Connect,
							Authority,
							Client,
							Contact,
							Reward,
							Payment,
							Days.Mode,
							Days.Set,
							Days.Option,
							UnLock,
							'wait'
						);

						if (ShedInsert) {
							MsgSET = true;

							hasReady.push({
								"ID": Connect
							});
						}

					} else {

						if (Replies.process === 'load') {

							const enviadoHojeNoRedis = await checkRedisSentToday(Identifier);

							if (!enviadoHojeNoRedis) {

								const ShedUpdate = await link.prepare(
									'UPDATE scheduling SET process=?, contact=?, option=?, control=?, range=?, status=?, unlock=?, client=?, authority=? WHERE title=?'
								).run(
									"wait",
									Contact,
									Days.Option,
									Days.Set,
									Days.Mode,
									Payment,
									UnLock,
									Client,
									Authority,
									Identifier
								);

								if (ShedUpdate) {
									MsgSET = true;

									hasReady.push({
										"ID": Connect
									});
								}
							}

						} else if (Replies.process !== 'success') {

							const exUpdate = await link
								.prepare('SELECT * FROM scheduling WHERE title=? AND process=?')
								.get(Identifier, "wait");

							if (exUpdate == undefined || Days.Option != exUpdate.option) {

								const ShedUpdate = await link.prepare(
									'UPDATE scheduling SET process=?, contact=?, option=?, control=?, range=?, status=?, unlock=?, client=?, authority=? WHERE title=?'
								).run(
									"wait",
									Contact,
									Days.Option,
									Days.Set,
									Days.Mode,
									Payment,
									UnLock,
									Client,
									Authority,
									Identifier
								);

								if (ShedUpdate) {
									MsgSET = true;

									hasReady.push({
										"ID": Connect
									});
								}
							}
						}
					}
				}

				if ((hasReady.length == Index) && MsgSET) {
					const logMsg = '> ' + Debug('OPTIONS')?.appname + ' : ' + Debug('CONSOLE')?.schedule;
					global.io.emit('message', logMsg);
				}
			});
		}

		if (Windows && Array.isArray(Windows)) {

			await (Windows).someAsync(async (Bank) => {
				if (Bank.Payment === "paid") {

					const delRes = await link
						.prepare('DELETE FROM scheduling WHERE title=?')
						.run(Bank.Identifier);
				}
			});
		}
	});

	if (isSHED.length > 0 && !Boolean(ShedForce)) {
		await global.io.emit('schedullers', isSHED);
	}

	return true;
};


const isAllowedTime = () => {
	const nowString = DateTime();

	if (!isWeek(nowString)) {
		return false;
	}

	const currentHour = parseInt(nowString.split(" ")[1].split(":")[0], 10);

	return isShift(currentHour);
};



const writeLog = (message, data = null) => {
	try {
		const logPath = path.join(__dirname, 'webhook.log');
		const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
		let logContent = `[${timestamp}] ${message}`;

		if (data !== null) {
			if (typeof data === 'object') {
				logContent += ` | DATA: ${JSON.stringify(data)}`;
			} else {
				logContent += ` | DATA: ${data}`;
			}
		}

		fs.appendFileSync(logPath, logContent + '\n', 'utf8');
	} catch (err) {
		console.error('Erro ao escrever no arquivo de log:', err);
	}
};

const GetSchedule = async () => {
	try {
		const moduleActive = Boolean(Debug('MKAUTH').module);
		const aimbotActive = Boolean(Debug('MKAUTH').aimbot);

		if (!moduleActive || !aimbotActive) {
			return;
		}

		let Check = 0;
		let isPaid = 0;
		let isLock = 0;
		let isUnLock = 0;
		let isDue = 0;

		const mkAuthCache = new Map();

		const DataBase = await Debug('SCHEDULING', 'TITLE', 'MULTIPLE');

		if (DataBase && DataBase.length >= 1) {
			for (const Target of DataBase) {
				const RawLocal = await link.prepare('SELECT * FROM scheduling WHERE title=?').get(Target);
				if (!RawLocal) {
					continue;
				}

				const Local = {
					Identifier: RawLocal.title,
					Connect: RawLocal.user,
					Authority: RawLocal.authority,
					Client: RawLocal.client,
					Contact: RawLocal.contact,
					Reward: RawLocal.reward,
					Payment: RawLocal.status,
					unLock: RawLocal.unlock === 'true' || RawLocal.unlock === true,
					Gateway: RawLocal.gateway,
					Cash: RawLocal.cash,
					id: RawLocal.id,
					process: RawLocal.process,
					range: RawLocal.range,
					control: RawLocal.control,
					option: RawLocal.option
				};

				const Rebase = await MkAuth('all', Target, 'list');
				mkAuthCache.set(Target, Rebase);

				if (Rebase != undefined && Rebase.Status == undefined) {
					const Bank = await Object.assign({}, Rebase)[0];

					if (!Bank) {
						continue;
					}

					const bankUnlockBool = Boolean(Bank.unLock);
					const localUnlockBool = Boolean(Local.unLock);
					const isBankReady = Boolean(Bank.Ready);

					const CheckVal = (bankUnlockBool !== localUnlockBool && isBankReady) ? 1 : 0;
					const IsPaidVal = (Bank.Payment !== Local.Payment && isBankReady) ? 1 : 0;

					if (IsPaidVal >= 1 && Local.process !== "success" && Bank.Payment === "paid") {
						const bankUnlockStr = bankUnlockBool ? 'true' : 'false';
						
						await link.prepare('UPDATE scheduling SET status=?, cash=?, gateway=?, unlock=? WHERE title=?')
							.run(Bank.Payment, Bank.Cash, Bank.Gateway, bankUnlockStr, Target);
					} else if (CheckVal >= 1 && Local.process !== "wait" && Local.process !== "success") {
						if (!bankUnlockBool && Local.process !== "unlock") {
							await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('lock', 'false', Target);
						} else if (bankUnlockBool) {
							await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('unlock', 'true', Target);
						}
					}
				} else {
					await link.prepare('DELETE FROM scheduling WHERE title=?').run(Target);
				}
			}
		}

		const Search = await link.prepare('SELECT * FROM scheduling').all();

		if (Search && Search.length > 0) {
			isPaid = Search.filter(Send => Send.process !== "success" && Send.status === "paid").length;
			isLock = Search.filter(Send => Send.process === "lock" && !Boolean(Send.unlock) && Send.status === "due").length;
			isUnLock = Search.filter(Send => Send.process === "unlock" && Boolean(Send.unlock) && Send.status === "due").length;
			isDue = Search.filter(Send => Send.process === "wait" && Send.status !== "paid").length;
		}

		const isLoad = {
			"Paid": isPaid,
			"Lock": isLock,
			"unLock": isUnLock,
			"Due": isDue
		};

		const onPayConfig = Boolean(Debug('SCHEDULER').onpay);
		const onLockConfig = Boolean(Debug('SCHEDULER').onlock);
		const onUnlockConfig = Boolean(Debug('SCHEDULER').onunlock);

		let isReturn = Object.assign({}, isLoad);
		if (typeof isLoad === 'object') {
			isReturn = JSON.stringify(isReturn, null, 4);
		}

		if (Boolean(Debug('OPTIONS').tag) && Boolean(Debug('MKAUTH').aimbot)) {
			const FrontEnd = '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').shedstatus;
			console.log(Print.bg.red, Print.fg.white, FrontEnd, Print.reset);
			console.log(Print.reset, Print.fg.white, isReturn, Print.reset);
		}

		if (DataBase && DataBase.length >= 1) {
			if (onPayConfig && isPaid >= 1) {
				const RawPaid = await link.prepare('SELECT * FROM scheduling WHERE status=? AND NOT process=?').get('paid', 'success');
				
				if (RawPaid != undefined) {
					const Paid = {
						Identifier: RawPaid.title,
						Connect: RawPaid.user,
						Authority: RawPaid.authority,
						Client: RawPaid.client,
						Contact: RawPaid.contact,
						Reward: RawPaid.reward,
						Payment: RawPaid.status,
						unLock: RawPaid.unlock === 'true' || RawPaid.unlock === true,
						Gateway: RawPaid.gateway,
						Cash: RawPaid.cash,
						id: RawPaid.id,
						process: RawPaid.process,
						range: RawPaid.range,
						control: RawPaid.control,
						option: RawPaid.option
					};

					const Resolve = mkAuthCache.get(Paid.Identifier) || await MkAuth('all', Paid.Identifier, 'list');
					const isBank = await Object.assign({}, Resolve)[0];

					if (Resolve != undefined) {
						if (Paid.Payment === "paid" && Boolean(isBank.Ready)) {
							await ProcessMkAuthMessage({
								user: Paid.Connect,
								client: Paid.Client,
								authority: Paid.Authority,
								code: Paid.Identifier,
								status: "pending",
								contact: Paid.Contact || "00000000000",
								reward: Paid.Reward,
								push: '00/00/0000 00:00:00',
								option: Paid.option,
								unlock: Paid.unLock,
								process: Paid.process,
								token: Debug('OPTIONS').token,
								cash: Paid.Cash,
								gateway: Paid.Gateway,
								payment: Paid.Payment,
								priority: 1
							});
						}
						if (global.io) {
							global.io.emit('schedresume', {
								title: Paid.Identifier,
								status: 'paid'
							});
						}
						
						const finalBankUnlock = Boolean(isBank.unLock) ? 'true' : 'false';
						await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('success', finalBankUnlock, Paid.Identifier);
					}
				}
			} else if (onLockConfig && isLock >= 1) {
				const RawLock = await link.prepare('SELECT * FROM scheduling WHERE process=? AND unlock=?').get('lock', 'false');
				
				if (RawLock != undefined) {
					const Lock = {
						Identifier: RawLock.title,
						Connect: RawLock.user,
						Authority: RawLock.authority,
						Client: RawLock.client,
						Contact: RawLock.contact,
						Reward: RawLock.reward,
						Payment: RawLock.status,
						unLock: RawLock.unlock === 'true' || RawLock.unlock === true,
						Gateway: RawLock.gateway,
						Cash: RawLock.cash,
						id: RawLock.id,
						process: RawLock.process,
						range: RawLock.range,
						control: RawLock.control,
						option: RawLock.option
					};

					const Resolve = mkAuthCache.get(Lock.Identifier) || await MkAuth('all', Lock.Identifier, 'list');
					const isBank = await Object.assign({}, Resolve)[0];

					if (Resolve != undefined) {
						if (Lock.Payment !== "paid" && Boolean(isBank.Ready)) {
							await ProcessMkAuthMessage({
								user: Lock.Connect,
								client: Lock.Client,
								authority: Lock.Authority,
								code: Lock.Identifier,
								status: "pending",
								contact: Lock.Contact || "00000000000",
								reward: Lock.Reward,
								push: '00/00/0000 00:00:00',
								option: Lock.option,
								unlock: Lock.unLock,
								process: Lock.process,
								token: Debug('OPTIONS').token,
								cash: Lock.Cash,
								gateway: Lock.Gateway,
								payment: Lock.Payment,
								priority: 2
							});
						}
						if (global.io) {
							global.io.emit('schedresume', Lock.Identifier);
						}
						await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('lock', 'false', Lock.Identifier);
					}
				}
			} else if (onUnlockConfig && isUnLock >= 1) {
				const RawUnLock = await link.prepare('SELECT * FROM scheduling WHERE process=? AND unlock=?').get('unlock', 'true');
				
				if (RawUnLock != undefined) {
					const UnLock = {
						Identifier: RawUnLock.title,
						Connect: RawUnLock.user,
						Authority: RawUnLock.authority,
						Client: RawUnLock.client,
						Contact: RawUnLock.contact,
						Reward: RawUnLock.reward,
						Payment: RawUnLock.status,
						unLock: RawUnLock.unlock === 'true' || RawUnLock.unlock === true,
						Gateway: RawUnLock.gateway,
						Cash: RawUnLock.cash,
						id: RawUnLock.id,
						process: RawUnLock.process,
						range: RawUnLock.range,
						control: RawUnLock.control,
						option: RawUnLock.option
					};

					const Resolve = mkAuthCache.get(UnLock.Identifier) || await MkAuth('all', UnLock.Identifier, 'list');
					const isBank = await Object.assign({}, Resolve)[0];

					if (Resolve != undefined) {
						if (UnLock.Payment !== "paid" && Boolean(isBank.Ready)) {
							await ProcessMkAuthMessage({
								user: UnLock.Connect,
								client: UnLock.Client,
								authority: UnLock.Authority,
								code: UnLock.Identifier,
								status: "pending",
								contact: UnLock.Contact || "00000000000",
								reward: UnLock.Reward,
								push: '00/00/0000 00:00:00',
								option: UnLock.option,
								unlock: UnLock.unLock,
								process: UnLock.process,
								token: Debug('OPTIONS').token,
								cash: UnLock.Cash,
								gateway: UnLock.Gateway,
								payment: UnLock.Payment,
								priority: 3
							});
						}
						if (global.io) {
							global.io.emit('schedresume', UnLock.Identifier);
						}
						await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('load', String(UnLock.unLock), UnLock.Identifier);
					}
				}
			} else if ((isWeek(DateTime(0))) && (isShift((DateTime(0).split(" ")[1]).split(":")[0])) || (validPhone(Playground) && Initialize)) {
				const RawDue = await link.prepare('SELECT * FROM scheduling WHERE NOT status=? AND process=?').get('paid', 'wait');
				
				if (RawDue != undefined) {
					const Due = {
						Identifier: RawDue.title,
						Connect: RawDue.user,
						Authority: RawDue.authority,
						Client: RawDue.client,
						Contact: RawDue.contact,
						Reward: RawDue.reward,
						Payment: RawDue.status,
						unLock: RawDue.unlock === 'true' || RawDue.unlock === true,
						Gateway: RawDue.gateway,
						Cash: RawDue.cash,
						id: RawDue.id,
						process: RawDue.process,
						range: RawDue.range,
						control: RawDue.control,
						option: RawDue.option
					};

					const Resolve = mkAuthCache.get(Due.Identifier) || await MkAuth('all', Due.Identifier, 'list');
					const isBank = await Object.assign({}, Resolve)[0];

					if (Resolve != undefined) {
						if (isDue >= 1) {
							if (Due.process !== "load" && Boolean(isBank.Ready)) {
								await ProcessMkAuthMessage({
									user: Due.Connect,
									client: Due.Client,
									authority: Due.Authority,
									code: Due.Identifier,
									status: Due.Payment,
									contact: Due.Contact || "00000000000",
									reward: Due.Reward,
									push: '00/00/0000 00:00:00',
									option: Due.option,
									unlock: undefined,
									process: Due.process,
									token: Debug('OPTIONS').token,
									cash: Due.Cash,
									gateway: Due.Gateway,
									payment: Due.Payment,
									priority: 4
								});
								if (global.io) {
									global.io.emit('schedresume', Due.Identifier);
								}
								
								const targetLockState = Boolean(isBank.unLock) ? 'true' : 'false';
								const nextProcess = !Boolean(isBank.unLock) && Boolean(Debug('SCHEDULER').onlock) ? "lock" : "load";

								await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run(nextProcess, targetLockState, Due.Identifier);
							} else {
								if (global.io) {
									global.io.emit('schedresume', Due.Identifier);
								}
								
								const targetLockState = Boolean(isBank.unLock) ? 'true' : 'false';
								await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run("load", targetLockState, Due.Identifier);
							}
						} else {
							if (global.io) {
								global.io.emit('schedresume', 'true');
							}
						}
					}
				}
			}
		}

		return true;

	} catch (error) {
		return false;
	}
};

// ==========================================
// CONFIGURAÃ‡ÃƒO DOS CRONS (AJUSTADA)
// ==========================================

// Sua função ZoneByUF
async function ZoneByUF(uf) {
	try {
		const row = await dbQuery.get("SELECT timezone FROM localzone WHERE uf = ?", [uf]);
		return row?.timezone || "America/Sao_Paulo";
	} catch {
		return "America/Sao_Paulo";
	}
}

const timezone = await ZoneByUF(Debug('OPTIONS').timezone);
cron.schedule('*/2 1-2 * * *', async () => {
	await GetUpdate(WServer, true);
	await WwjsVersion(true);
}, {
	scheduled: true,
	timezone
});

cron.schedule('0 0 * * *', async () => {
	await SetSchedule();
}, {
	scheduled: true,
	timezone
});

cron.schedule('30 0 * * *', async () => {
	if (Boolean(Debug('OPTIONS').onreboot)) {
		await exec('npm run reboot:mwsm');
	}
}, {
	scheduled: true,
	timezone
});

cron.schedule(`*/${Debug('SCHEDULER').cron} 0-23 * * *`, async () => {
	if (!Boolean(Debug('RELEASE').reload)) {
		await GetSchedule();
	}
}, {
	scheduled: true,
	timezone
});

app.use(express.json({
	limit: '500mb'
}));
app.use(express.urlencoded({
	limit: '500mb',
	extended: true
}));
app.use(express.text({
	limit: '500mb'
}));

app.use("/", express.static(__dirname + "/"))

app.get('/', (req, res) => {
	isPanelAuthorized = false;
	res.sendFile('index.html', {
		root: __dirname
	});
});

app.get('/lock-panel', (req, res) => {
	isPanelAuthorized = false;
	res.json({
		status: "locked"
	});
});

// Get Date (Otimizado)
function DateTime(Days = 0, Mode) {
	const date = new Date();

	if (Days !== 0) {
		const offset = Mode === 'some' ? Days : Mode === 'subtract' ? -Days : 0;
		date.setDate(date.getDate() + offset);
	}

	const formatter = new Intl.DateTimeFormat("pt-BR", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	});

	const parts = formatter.formatToParts(date);
	const p = {};
	parts.forEach(({
		type,
		value
	}) => {
		p[type] = value;
	});

	const hourFixed = p.hour === '24' ? '00' : p.hour;

	return `${p.year}-${p.month}-${p.day} ${hourFixed}:${p.minute}:${p.second}`;
}

const GetBoletosFiltrados = async (CPF) => {
	const cpfLimpo = String(CPF).replace(/\D/g, '');

	const rawData = await MkList(cpfLimpo, "titulos");

	if (!rawData) return false;

	let listaTitulos = [];
	if (Array.isArray(rawData)) {
		listaTitulos = rawData;
	} else if (rawData.titulos && Array.isArray(rawData.titulos)) {
		listaTitulos = rawData.titulos;
	} else {
		return false;
	}

	if (listaTitulos.length === 0) return false;

	const primeiroTitulo = listaTitulos[0];
	const clienteNome = primeiroTitulo.nome || primeiroTitulo.nome_res || "Não Informado";
	const clienteCPF = primeiroTitulo.cpf_cnpj || cpfLimpo;

	const uf = Debug('OPTIONS').timezone || 'SP';
	const timezoneUser = await getTimezoneByUF(uf);

	const formatter = new Intl.DateTimeFormat('pt-BR', {
		timeZone: timezoneUser,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	});

	const parts = formatter.formatToParts(new Date());
	const anoAtual = Number(parts.find(p => p.type === 'year').value);
	const mesAtual = Number(parts.find(p => p.type === 'month').value) - 1;
	const diaAtual = Number(parts.find(p => p.type === 'day').value);

	const hojeZeroHora = new Date(anoAtual, mesAtual, diaAtual);
	const dataLimite3Meses = new Date(anoAtual, mesAtual - 3, diaAtual);

	const vencidos3Meses = [];
	let abertoMesCorrente = null;

	for (const item of listaTitulos) {
		if (!item.datavenc) continue;

		const status = (item.status || "").toLowerCase();

		if (status === 'pago' || status === 'quitado' || status === 'baixado') {
			continue;
		}

		const [dataParte] = item.datavenc.split(" ");
		const [ano, mes, dia] = dataParte.split("-").map(Number);
		const dataVenc = new Date(ano, mes - 1, dia);

		const boletoFormatado = {
			titulo: item.titulo,
			valor: item.valor,
			vencimento: dataParte,
			status: item.status,
		};

		const jaVenceu = dataVenc < hojeZeroHora;
		const dentroDos3Meses = dataVenc >= dataLimite3Meses;

		if ((status === 'vencido' || jaVenceu) && dentroDos3Meses) {
			vencidos3Meses.push(boletoFormatado);
		} else if (
			status === 'aberto' &&
			!jaVenceu &&
			dataVenc.getFullYear() === anoAtual &&
			dataVenc.getMonth() === mesAtual
		) {
			abertoMesCorrente = boletoFormatado;
		}
	}

	return {
		Client: clienteNome,
		CPF: clienteCPF,
		Dados: {
			Due: vencidos3Meses,
			Open: abertoMesCorrente
		}
	};
};

const MkList = async (FIND, REFINE = "titulos", FORMAT = false) => {
	const mkConfig = Debug('MKAUTH');
	if (!mkConfig) return false;

	const serverMap = {
		tunel: mkConfig.tunel,
		domain: mkConfig.domain
	};
	const Server = serverMap[mkConfig.client_link] || mkConfig.client_link;

	try {
		const authResponse = await axios.get(`https://${Server}/api/`, {
			auth: {
				username: mkConfig.client_id,
				password: mkConfig.client_secret
			}
		});

		const token = authResponse.data;
		if (!token) return false;

		const syncResponse = await axios.get(`https://${Server}/api/titulo/${REFINE}/${FIND}`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		let data = syncResponse.data;

		if (typeof data === "string") {
			let trimmedData = data.trim();
			
			if (!trimmedData.endsWith('}') && !trimmedData.endsWith(']')) {
				const lastCloseObj = trimmedData.lastIndexOf('}');
				const lastCloseArr = trimmedData.lastIndexOf(']');
				const validEnd = Math.max(lastCloseObj, lastCloseArr);
				if (validEnd !== -1) {
					trimmedData = trimmedData.substring(0, validEnd + 1);
				}
			}
			
			data = JSON.parse(trimmedData);
		}

		if (!data || data.mensagem !== undefined || data.error !== undefined) {
			return false;
		}

		let rawList = [];
		if (Array.isArray(data)) {
			rawList = data;
		} else if (data.titulos && Array.isArray(data.titulos)) {
			rawList = data.titulos;
		} else if (typeof data === 'object') {
			const keys = Object.keys(data);
			if (keys.length === 0) return false;
			rawList = data.titulos ? (Array.isArray(data.titulos) ? data.titulos : [data.titulos]) : [data];
		}

		if (!rawList || rawList.length === 0) return false;

		if (!FORMAT) {
			const keys = Object.keys(data);
			if (keys.length <= 2 && data.titulos) return data.titulos;
			return data;
		}

		const statusMap = {
			'aberto': 'open',
			'pago': 'paid',
			'vencido': 'due',
			'cancelado': 'cancel'
		};

		const formattedList = rawList.map(item => {
			const Phone = item.celular
				? String(item.celular).replace(/\D/g, '')
				: "00000000000";

			const rawStatus = String(item.status || '').toLowerCase().trim();
			const paymentStatus = statusMap[rawStatus] || rawStatus;

			return {
				Identifier: String(item.titulo || ''),
				Connect: item.login || '',
				Client: item.nome_res || '',
				Authority: item.nome || '',
				Reward: item.datavenc || '',
				Payment: paymentStatus,
				Contact: Phone,
				Working: Boolean(item.cli_ativado),
				unLock: !Boolean(item.bloqueado),
				LowSpeed: item.dias_corte || '0',
				Ready: Boolean(item.zap),
				Cash: item.valor || '0.00'
			};
		});

		return formattedList;

	} catch (err) {
		return false;
	}
};

function isWeek(Sysdate) {
	const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	const currentDay = weekDays[new Date(Sysdate).getDay()];

	return Boolean(Debug('SCHEDULER')?.[currentDay]);
}

const Scheduller = async (DAYS, MODE) => {
	let targetDate;
	const modeLower = MODE ? MODE.toLowerCase() : "";

	if (modeLower === "now" && DAYS === 0) {
		targetDate = DateTime(0).split(" ")[0];
	} else if (modeLower === "before") {
		targetDate = DateTime(DAYS, "some").split(" ")[0];
	} else if (modeLower === "later") {
		targetDate = DateTime(DAYS, "subtract").split(" ")[0];
	}
	return await MkList(targetDate, 'titulos', true);
};


function inRange(x, min, max) {
	return ((x - min) * (x - max) <= 0);
}

function isShift(Turno) {
	const scheduler = Debug('SCHEDULER') || {};
	const minHour = Number(AddZero(scheduler.min));

	if (inRange(Turno, minHour, 11)) {
		return Boolean(scheduler.morning);
	}
	if (inRange(Turno, 12, 17)) {
		return Boolean(scheduler.afternoon);
	}
	if (inRange(Turno, 18, scheduler.max)) {
		return Boolean(scheduler.night);
	}

	return false;
}

async function WwjsVersion(GET) {
	const appName = Debug('OPTIONS').appname;
	let isUpdated = false;

	try {
		const pkg = require("whatsapp-web.js/package.json");
		const installed = pkg ? pkg.version : null;
		isUpdated = Boolean(installed && installed.length > 0);
	} catch (err) {
		console.error(`> ${appName} : Error checking whatsapp-web.js installation:`, err.message);
		isUpdated = false;
	}

	global.io.emit('Wwjs', isUpdated);

	if (!GET) return;

	const consoleConfig = Debug('CONSOLE') || {};
	const statusMsg = isUpdated ? consoleConfig.wwjsupdate : consoleConfig.wwjsfail;
	const formattedMessage = `> ${appName} : ${statusMsg}`;

	console.log(formattedMessage);
	global.io.emit('message', formattedMessage);
}

/// ==================================================
// Inteligencia Artificial
// ==================================================

const DEBUG_TAG = "[DEBUG_LOG]";

const dbQuery = {
	get: (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (err, row) => err ? rej(err) : res(row))),
	all: (sql, params = []) => new Promise((res, rej) => db.all(sql, params, (err, rows) => err ? rej(err) : res(rows))),
	run: (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function(err) {
		err ? rej(err) : res(this);
	}))
};


// Gerador de Embedding com fallback local
async function getEmbedding(text) {
	if (!text) return null;
	const {
		mwsmhost: host,
		mwsmport: port
	} = Debug('OPTIONS');

	try {
		console.time(`${DEBUG_TAG} Embedding Time`);
		const response = await axios.post(`http://${host}:${port}/embed`, {
			text
		}, {
			timeout: 10000
		});
		console.timeEnd(`${DEBUG_TAG} Embedding Time`);

		if (response.data?.embedding) return response.data.embedding;
		throw new Error('No embedding in payload');
	} catch (err) {
		console.log(`${DEBUG_TAG} Embedding API offline/error (${err.message}). Using local math fallback.`);
		return Array.from(text).map((ch, i) => ((ch.charCodeAt(0) + i * 13) % 255) / 255).slice(0, 256);
	}
}

async function getTimezoneByUF(uf) {
	try {
		const row = await dbQuery.get("SELECT timezone FROM localzone WHERE uf = ?", [uf]);
		return row?.timezone || "America/Sao_Paulo";
	} catch {
		return "America/Sao_Paulo";
	}
}

function getGreetingPeriod(timezone) {
	try {
		const hour = parseInt(new Intl.DateTimeFormat("pt-BR", {
			timeZone: timezone,
			hour: "numeric",
			hour12: false
		}).format(new Date()), 10);
		if (hour >= 5 && hour < 12) return "bom dia";
		if (hour >= 12 && hour < 18) return "boa tarde";
		if (hour >= 18 && hour < 24) return "boa noite";
		return "boa madrugada";
	} catch {
		return "";
	}
}

// Filtro por Palavras-chave
async function isRelevantQuestion(text) {
	try {
		const rows = await dbQuery.all("SELECT filter FROM keywords");
		if (!rows?.length) return true;
		const keywords = rows.map(r => (r.filter || "").toLowerCase().trim());
		const cleanText = (text || "").toLowerCase().trim();
		return keywords.some(k => cleanText.includes(k));
	} catch {
		return true;
	}
}

// Lógica Principal
async function askAI(question) {
	const startTime = Date.now();
	console.log(`${DEBUG_TAG} Start processing question: "${question}"`);

	try {
		const text = (question || "").toLowerCase().trim();

		// 1. Cumprimentos (Início de conversa)
		const greetingRows = await dbQuery.all("SELECT word FROM greetings");
		const greetings = greetingRows?.map(r => (r.word || "").toLowerCase()) || [];
		if (greetings.some(g => text.includes(g))) {
			const uf = Debug('OPTIONS').timezone || 'SP';
			const tz = await getTimezoneByUF(uf);
			const turno = getGreetingPeriod(tz);
			console.log(`${DEBUG_TAG} Matched greeting. Total execution: ${Date.now() - startTime}ms`);
			return turno ? `⚠️ Olá, ${turno}! Como posso te ajudar com sua conexão de internet?` : `⚠️ Olá! Como posso te ajudar com sua conexão de internet?`;
		}

		// 1.1. Agradecimentos / Encerramento (Fim de conversa)
		const endRows = await dbQuery.all("SELECT word FROM endofdiscussion");
		const endWords = endRows?.map(r => (r.word || "").toLowerCase().trim()) || [];

		// Compara a palavra exata ou verifica se a frase é composta basicamente pelo encerramento
		if (endWords.some(w => text === w || text.startsWith(w + " ") || text.endsWith(" " + w))) {
			console.log(`${DEBUG_TAG} Matched endofdiscussion word. Total execution: ${Date.now() - startTime}ms`);
			return "Por nada! Se precisar de mais alguma coisa em relação à sua conexão, estou à disposição. Tenha um ótimo dia! 😊";
		}

		// 2. Filtro de Relevância
		if (!await isRelevantQuestion(text)) {
			console.log(`${DEBUG_TAG} Question filtered out (not relevant). App: ${Debug('OPTIONS').appname} | Duration: ${Date.now() - startTime}ms`);
			return "⚠️ Posso ajudar apenas com dúvidas sobre sua conexão de internet e suporte técnico.";
		}

		const {
			aimode,
			keygen: apiKey,
			threshold,
			prompt: dbPrompt,
			aitimeout,
			appname: appName,
			engine: engineOption
		} = Debug('OPTIONS');

		const systemPrompt = `${dbPrompt || ''} Responda de forma curta, clara, objetiva e em português.`.trim();

		const aiModeParsed = parseInt(aimode);
		const thresholdParsed = parseFloat(threshold);
		const timeoutParsed = parseInt(aitimeout);

		// Busca flexível do módulo
		const regedit = await dbQuery.get("SELECT * FROM engine WHERE title = ? OR module = ? OR active = 1", [engineOption, engineOption]);
		const Module = regedit?.module || engineOption;

		if (!Module) {
			console.log(`${DEBUG_TAG} Error: Engine module not found for title "${engineOption}"`);
			return "⚠️ Indisponível no momento.";
		}

		// Modo 0: Nuvem direta
		if (aiModeParsed === 0) {
			console.log(`${DEBUG_TAG} AI Mode 0 (Direct Cloud) selected.`);
			const answer = await fetchCloudAnswer(question, apiKey, engineOption, Module, systemPrompt + ' Responda de forma curta, clara e em português.', timeoutParsed);
			console.log(`${DEBUG_TAG} Mode 0 completed in ${Date.now() - startTime}ms`);
			return answer;
		}

		// 3. Busca Local Otimizada (Embeddings / Cache)
		console.time(`${DEBUG_TAG} Local Search Latency`);
		const qEmbedding = await getEmbedding(question);
		let bestMatch = null;
		let bestScore = 0;

		if (qEmbedding) {
			const qVector = new Float32Array(qEmbedding);
			const rows = await dbQuery.all("SELECT id, answer, embedding FROM intelligence WHERE embedding IS NOT NULL AND embedding != ''") || [];

			console.log(`${DEBUG_TAG} Comparing vector against ${rows.length} local records`);

			for (let i = 0; i < rows.length; i++) {
				const r = rows[i];
				try {
					const rawEmb = typeof r.embedding === 'string' ? JSON.parse(r.embedding) : r.embedding;
					if (!Array.isArray(rawEmb) || rawEmb.length !== qVector.length) continue;

					const targetVector = new Float32Array(rawEmb);
					const score = cosineSimilarityFast(qVector, targetVector);

					if (score > bestScore) {
						bestScore = score;
						bestMatch = r;
					}
				} catch {}
			}
		}
		console.timeEnd(`${DEBUG_TAG} Local Search Latency`);

		if (bestMatch && bestScore >= thresholdParsed) {
			console.log(`${DEBUG_TAG} Local match found! ID: ${bestMatch.id} | Score: ${bestScore.toFixed(4)} (Threshold: ${thresholdParsed}) | App: ${appName}`);
			console.log(`${DEBUG_TAG} Total execution time (Local): ${Date.now() - startTime}ms`);

			dbQuery.run("UPDATE intelligence SET usage_count = usage_count + 1 WHERE id = ?", [bestMatch.id]).catch(() => {});
			return bestMatch.answer;
		}

		if (aiModeParsed === 1) {
			console.log(`${DEBUG_TAG} AI Mode 1 (Brain Only) active. No local match found above threshold. Skipping Cloud.`);
			return "⚠️ Desculpe, não encontrei essa informação em minha base de conhecimento local.";
		}

		console.log(`${DEBUG_TAG} Local match below threshold (${bestScore.toFixed(4)} < ${thresholdParsed}). Forwarding to Cloud.`);
		console.time(`${DEBUG_TAG} Cloud Answer Latency`);

		const aiAnswer = await fetchCloudAnswer(question, apiKey, engineOption, Module, systemPrompt, timeoutParsed);

		console.timeEnd(`${DEBUG_TAG} Cloud Answer Latency`);

		const isErrorResponse = !aiAnswer ||
			aiAnswer.startsWith("⚠️") ||
			aiAnswer.toLowerCase().includes("erro ao buscar") ||
			aiAnswer.toLowerCase().includes("modelo de ia não configurado") ||
			aiAnswer.toLowerCase().includes("não consegui acessar");

		if (aiModeParsed === 2 && !isErrorResponse) {
			try {
				await enforceKnowledgeLimit();
				const _embedding = qEmbedding || await getEmbedding(question);
				const embeddingStr = _embedding ? JSON.stringify(_embedding) : null;

				const existingRow = await dbQuery.get("SELECT id FROM intelligence WHERE question = ?", [question]);
				if (existingRow) {
					await dbQuery.run("UPDATE intelligence SET answer=?, embedding=?, source=?, usage_count=usage_count+1 WHERE id=?", [aiAnswer, embeddingStr, "local", existingRow.id]);
					console.log(`${DEBUG_TAG} Memory updated for existing question (ID: ${existingRow.id})`);
				} else {
					await dbQuery.run("INSERT INTO intelligence (question, answer, embedding, source, usage_count) VALUES (?, ?, ?, ?, 1)", [question, aiAnswer, embeddingStr, "local"]);
					console.log(`${DEBUG_TAG} New question and answer saved to local cache`);

					broadcastPanelStats();
				}
			} catch (e) {
				console.error(`${DEBUG_TAG} Embedding save failed:`, e?.message);
			}
		} else if (isErrorResponse) {
			console.log(`${DEBUG_TAG} Ignored saving to local memory: Response contains error or warning indicator.`);
		}

		console.log(`${DEBUG_TAG} Total execution time (Cloud/Hybrid): ${Date.now() - startTime}ms`);
		return aiAnswer;

	} catch (err) {
		console.error(`${DEBUG_TAG} IA Critical Error (${Date.now() - startTime}ms):`, err.message || err);
		return "⚠️ Não consegui acessar a inteligência artificial no momento.";
	}
}

async function fetchCloudAnswer(question, apiKey, Engine, Module, systemPrompt, aiTimeout) {
	try {
		const targetModel = Module || Engine;
		if (!targetModel) return "⚠️ Modelo de IA não configurado.";

		console.log(`${DEBUG_TAG} Calling OpenRouter API | Model: ${targetModel} | Timeout: ${aiTimeout}ms`);

		const response = await axios.post(
			"https://openrouter.ai/api/v1/chat/completions", {
				model: targetModel,
				messages: [{
						role: "system",
						content: systemPrompt
					},
					{
						role: "user",
						content: question
					}
				]
			}, {
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json"
				},
				timeout: aiTimeout
			}
		);

		const aiAnswer = response.data?.choices?.[0]?.message?.content?.trim() || "Desculpe, não consegui entender.";
		return aiAnswer.replace(/\s+/g, " ").trim();

	} catch (err) {
		console.error(`${DEBUG_TAG} OpenRouter Cloud Error:`, err?.response?.data || err?.message || err);
		return "⚠️ Erro ao buscar resposta da IA online.";
	}
}

function cosineSimilarityFast(vecA, vecB) {
	if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

	let dot = 0.0;
	let normA = 0.0;
	let normB = 0.0;

	const len = vecA.length;
	for (let i = 0; i < len; i++) {
		const valA = vecA[i];
		const valB = vecB[i];
		dot += valA * valB;
		normA += valA * valA;
		normB += valB * valB;
	}

	return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

async function enforceKnowledgeLimit() {
	try {
		const maxKnowledge = parseInt(Debug("OPTIONS").maxknowledge) || 1000;
		const row = await dbQuery.get("SELECT COUNT(*) as total FROM intelligence");
		const total = row?.total || 0;
		if (total <= maxKnowledge) return;

		const excess = total - maxKnowledge;
		console.log(`${DEBUG_TAG} Knowledge limit reached (${total}/${maxKnowledge}). Purging ${excess} oldest entries.`);
		await dbQuery.run(`DELETE FROM intelligence WHERE id IN (SELECT id FROM intelligence ORDER BY usage_count ASC, id ASC LIMIT ?)`, [excess]);
	} catch (err) {
		console.error(`${DEBUG_TAG} Error in enforceKnowledgeLimit:`, err.message);
	}
}

async function Openrout(apiKey) {
	try {
		const [exchangeRes, modelsRes, creditsRes] = await Promise.all([
			axios.get('https://api.exchangerate-api.com/v4/latest/USD'),
			axios.get('https://openrouter.ai/api/v1/models', {
				headers: {
					'Authorization': `Bearer ${apiKey}`
				}
			}),
			axios.get('https://openrouter.ai/api/v1/auth/key', {
				headers: {
					'Authorization': `Bearer ${apiKey}`
				}
			})
		]);

		const exchangeRate = exchangeRes.data?.rates?.BRL || 5.22;
		const openRouterModels = modelsRes.data?.data || [];
		const keyData = creditsRes.data?.data || {};

		const dbRows = await new Promise((resolve, reject) => {
			db.all("SELECT id, title, module, active FROM engine", [], (err, rows) => {
				if (err) reject(err);
				else resolve(rows || []);
			});
		});

		const formattedModels = dbRows.map(row => {
			const apiModel = openRouterModels.find(m => m.id === row.module) || {};
			const promptPrice = parseFloat(apiModel.pricing?.prompt || 0) * 1000000;
			const completionPrice = parseFloat(apiModel.pricing?.completion || 0) * 1000000;

			return {
				db_id: row.id,
				title: row.title,
				id: row.module,
				name: apiModel.name || row.title,
				active: row.active,
				input_cost_brl: (promptPrice * exchangeRate).toFixed(2).replace('.', ','),
				output_cost_brl: (completionPrice * exchangeRate).toFixed(2).replace('.', ','),
				input_cost_usd: promptPrice.toFixed(4),
				output_cost_usd: completionPrice.toFixed(4)
			};
		});

		// 4. Formata o saldo e gasto financeiro também com 2 casas decimais (ex: "52,22")
		const balanceUsd = keyData.limit ? (keyData.limit - keyData.usage) : 0;
		const spentUsd = keyData.usage || 0;

		return {
			currency: 'BRL',
			exchange_rate: exchangeRate,
			financial: {
				balance_brl: (balanceUsd * exchangeRate).toFixed(2).replace('.', ','),
				total_spent_brl: (spentUsd * exchangeRate).toFixed(2).replace('.', ','),
				balance_usd: balanceUsd,
				total_spent_usd: spentUsd
			},
			usage: {
				total_requests: keyData.is_free_tier ? 0 : 1,
				tokens_sent: 0,
				tokens_received: 0,
				tokens_total: 0
			},
			models: formattedModels
		};

	} catch (error) {
		console.error("Erro na execução do Openrout:", error.message);
		return null;
	}
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

delay(0).then(async function() {



});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const MkAuth = async (UID, FIND, EXT = 'titulos', TYPE = 'titulo', MODE = true) => {
	const mkConfig = Debug('MKAUTH');
	if (!mkConfig) return false;

	const Owner = Boolean(mkConfig.owner);

	const serverMap = {
		tunel: mkConfig.tunel,
		domain: mkConfig.domain
	};
	const Server = serverMap[mkConfig.client_link] || mkConfig.client_link;

	const findMap = {
		open: 'aberto',
		paid: 'pago',
		due: 'vencido',
		cancel: 'cancelado'
	};
	const targetFind = findMap[FIND] || FIND;
	const targetExt = EXT === "list" ? "listagem" : EXT;

	try {
		const authResponse = await axios.get(`https://${Server}/api/`, {
			auth: {
				username: mkConfig.client_id,
				password: mkConfig.client_secret
			}
		});

		const Authentication = authResponse.data;
		if (!Authentication) return false;

		const syncResponse = await axios.get(`https://${Server}/api/${TYPE}/${targetExt}/${UID}`, {
			headers: {
				Authorization: `Bearer ${Authentication}`
			}
		});

		let rawData = syncResponse.data;
		if (typeof rawData === "string") {
			const trimmed = rawData.trim();
			rawData = JSON.parse(trimmed.endsWith('}') ? trimmed : trimmed.slice(0, -1));
		}

		if (!rawData || rawData.mensagem !== undefined || rawData.error !== undefined) {
			if (targetExt === 'titulos') {
				Terminal({
					"MkAuth": "Cannot Find the Data > uid"
				});
			} else {
				Terminal({
					'MkAuth': 'Cannot Find the Data',
					'Request': UID,
					'Find': FIND
				});
			}
			return false;
		}

		const keys = Object.keys(rawData).length;
		let syncron;

		if (keys === 0) {
			syncron = undefined;
		} else if (keys <= 2) {
			syncron = rawData.titulos;
		} else {
			syncron = rawData;
		}

		if (!syncron || !Array.isArray(syncron)) {
			if (targetExt === 'titulos') {
				Terminal({
					"MkAuth": "Cannot Find the Data > find"
				});
				return {
					"Status": "Error"
				};
			}
			return false;
		}

		const statusTranslate = {
			aberto: 'open',
			pago: 'paid',
			vencido: 'due',
			cancelado: 'cancel'
		};

		if (targetExt === 'titulos') {
			const cleanFind = String(targetFind).replace(/^0+/, '');
			const match = syncron.find(Send =>
				Send.titulo == cleanFind ||
				parseInt(Send.titulo) === parseInt(targetFind) ||
				Send.linhadig === targetFind
			);

			if (!match) {
				Terminal({
					"MkAuth": "Cannot Find the Data > find"
				});
				return {
					"Status": "Error"
				};
			}

			let Bolix = '';
			let Json_Bar = "false";
			let Json_Pix = "false";
			let Json_QR = "false";
			let Json_Link = "false";

			if (match.linhadig) {
				Json_Bar = "true";
				Bolix = mkConfig.mode === 'v1' ?
					`http://${mkConfig.domain}/boleto/boleto.hhvm?titulo=${match.uuid}` :
					`http://${mkConfig.domain}/boleto/boleto.hhvm?titulo=${match.titulo}&contrato=${match.login}`;
			} else {
				match.linhadig = '';
			}

			if (match.pix) Json_Pix = "true";
			else match.pix = '';

			if (match.pix_qr) Json_QR = "true";
			else match.pix_qr = 'base64,';

			if (match.pix_link) Json_Link = "true";
			else match.pix_link = '';

			const SEND = [];
			if (Boolean(mkConfig.bar)) SEND.push(match.linhadig);
			if (Boolean(mkConfig.pix)) SEND.push(match.pix);
			if (Boolean(mkConfig.qrpix)) SEND.push(match.pix_qr);
			if (Boolean(mkConfig.qrlink)) SEND.push(match.pix_link);
			if (Boolean(mkConfig.pdf)) SEND.push(match.uuid);

			if (SEND.length === 0) return {
				"Status": "Error"
			};

			const STATUS = SEND.some(Row => Row === '') ? "Null" : match.status;
			const qrParts = match.pix_qr.split("base64,");

			const fullName = match.nome;
			const shortName = match.nome_res || match.nome;

			const Json = {
				"Status": statusTranslate[STATUS] || STATUS,
				"ID": match.titulo,
				"Name": Owner ? shortName : fullName,
				"Authority": fullName,
				"Payments": [{
						"value": match.linhadig,
						"caption": "Bar",
						"status": Json_Bar
					},
					{
						"value": match.pix,
						"caption": "Pix",
						"status": Json_Pix
					},
					{
						"value": qrParts[1] !== undefined ? qrParts[1] : qrParts[0],
						"caption": "QRCode",
						"status": Json_QR
					},
					{
						"value": match.pix_link,
						"caption": "Link",
						"status": Json_Link
					},
					{
						"value": Bolix,
						"caption": "Boleto",
						"status": Json_Bar
					}
				]
			};

			Terminal({
				"Payment": Json.Status,
				"Client": Json.Name,
				"Authority": Json.Authority,
				"MkAuth": [{
						"Module": "Bar",
						"Available": Json.Payments[0].status,
						"Allowed": `${mkConfig.bar}`
					},
					{
						"Module": "Pix",
						"Available": Json.Payments[1].status,
						"Allowed": `${mkConfig.pix}`
					},
					{
						"Module": "QRC",
						"Available": Json.Payments[2].status,
						"Allowed": `${mkConfig.qrpix}`
					},
					{
						"Module": "QRL",
						"Available": Json.Payments[3].status,
						"Allowed": `${mkConfig.qrlink}`
					},
					{
						"Module": "PDF",
						"Available": Json.Payments[4].status,
						"Allowed": `${mkConfig.pdf}`
					}
				]
			});

			return Json;
		}

		if (targetExt === 'listagem') {
			const push = [];
			const todayDate = DateTime().split(" ")[0];
			const isAllUID = UID === "all";

			let formattedUID = UID;
			if (!isAllUID && parseInt(UID) <= 9 && String(UID).length === 1) {
				formattedUID = "0" + UID;
			}

			const currentYearMonth = `${todayDate.split("-")[0]}-${formattedUID}-`;
			const isLongUID = !isAllUID && String(UID).replace(/[^0-9.]+/g, '').length > 4;

			for (const Send of syncron) {
				if (Send.cli_ativado !== 's' || Send.status === 'cancelado') continue;

				let list = [targetFind];
				if (targetFind === 'all') list = [Send.status];

				let jump = isAllUID;
				if (!jump && Send.datavenc) {
					jump = isLongUID ? Send.datavenc.includes(UID + "-") : Send.datavenc.includes(currentYearMonth);
				}

				const matchesFilter = list.some(row => Send.status.includes(row) || Send.login.includes(row) || Send.titulo.includes(row));
				if (!jump || !matchesFilter) continue;

				let statusClean = statusTranslate[Send.status] || Send.status;
				if (Send.datavenc && Send.datavenc.split(" ")[0] === todayDate && statusClean !== 'paid') {
					statusClean = 'open';
				}

				const celularClean = Send.celular ? Send.celular.replace(/[^0-9.]+/g, '') : undefined;
				const formapagClean = Send.formapag && Send.formapag !== "dinheiro" ? "banco" : Send.formapag;

				const fullName = Send.nome;
				const shortName = Send.nome_res || Send.nome;

				push.push({
					"Order": new Date(Send.datavenc).getDate(),
					"Identifier": Send.titulo,
					"Client": Owner ? shortName : fullName,
					"Authority": fullName,
					"Reward": Send.datavenc,
					"Payment": statusClean,
					"Connect": Send.login,
					"Contact": celularClean,
					"Working": Boolean(Send.cli_ativado),
					"unLock": !Boolean(Send.bloqueado),
					"LowSpeed": Send.dias_corte,
					"Ready": Boolean(Send.zap),
					"Cash": Send.valorpag,
					"Gateway": formapagClean
				});
			}

			if (push.length === 0) {
				Terminal({
					"Status": "Error"
				});
				return false;
			}

			push.sort((a, b) => a.Client.localeCompare(b.Client) || parseFloat(a.Order) - parseFloat(b.Order));

			const JSON_FINAL = push.map((Send, index) => ({
				"Order": index + 1,
				...Send
			}));

			Terminal(JSON_FINAL);
			return JSON_FINAL;
		}

		return false;
	} catch (err) {
		return false;
	}
};

// Check is Json
function testJSON(text) {
	if (typeof text !== "string" && typeof text !== "number") {
		return false;
	}

	const cleaned = String(text)
		.replace(/["']/g, "")
		.replace('uid:', '"uid":"')
		.replace(',find:', '","find":"')
		.replace('}', '"}');

	try {
		const json = JSON.parse(cleaned);
		return json !== null && typeof json === 'object';
	} catch (error) {
		return false;
	}
}



// ==========================================
// Heartbeat
// ==========================================
function setupConnectionWatchdog() {
	const rawDelay = parseInt(Debug('OPTIONS').heartdelay, 10);
	const delayMinutes = (isNaN(rawDelay) || rawDelay < 1) ? 5 : rawDelay;

	setInterval(async () => {
		try {
			if (!Boolean(Debug('OPTIONS').heartbeat)) return;

			if (Session) {
				const state = await client.getState().catch(() => null);

				if (!state || state !== 'CONNECTED') {
					const appName = Debug('OPTIONS').appname;
					const consoleMsg = Debug('CONSOLE').heartbeat;

					if (consoleMsg) {
						const formatted = `> ${appName} : ${consoleMsg}`;
						console.log(formatted);
						io.emit('message', formatted);
					}

					process.exit(1);
				}
			}
		} catch (err) {
			console.log('> ' + Debug('OPTIONS').appname + ' : ' + err);
		}
	}, delayMinutes * 60 * 1000);
}

// ==========================================
// Engine
// ==========================================
let customBrowserPath = (Debug('OPTIONS').browserpath || '').trim();
const appName = Debug('OPTIONS').appname;

const puppeteerConfig = {
	headless: true,
	args: [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-dev-shm-usage',
		'--disable-accelerated-2d-canvas',
		'--no-first-run',
		'--disable-gpu',
		'--disable-software-rasterizer'
	]
};

const client = new Client({
	authStrategy: new LocalAuth({
		clientId: appName
	}),
	puppeteer: puppeteerConfig
});

const logAndEmit = (consoleMsg, qrResource) => {
	const appName = Debug('OPTIONS').appname;
	if (consoleMsg) {
		const formatted = `> ${appName} : ${consoleMsg}`;
		console.log(formatted);
		io.emit('message', formatted);
	}
	if (qrResource) {
		io.emit('qr', qrResource);
	}
};

client.on('qr', (qr) => {
	if (!Session) {
		qrcode.toDataURL(qr, (err, url) => {
			if (err) {
				logAndEmit(err.toString());
				return;
			}
			logAndEmit(Debug('CONSOLE').connection, Debug('RESOURCES').connection);
			io.emit('Reset', true);

			setTimeout(() => {
				io.emit('qr', url);
				logAndEmit(Debug('CONSOLE').received);
			}, 1000);
		});
	}
});

client.on('ready', async () => {
	try {
		if (!Boolean(Debug('OPTIONS').auth)) {
			await link.prepare('UPDATE options SET auth=?').run(1);
		}
		logAndEmit(Debug('CONSOLE').ready, Debug('RESOURCES').ready);
		io.emit('Reset', false);
		Session = true;

		if (!Permission) {
			Permission = true;
			const wid = client.info?.wid?._serialized;
			if (wid) {
				await worker.resume();
				await client.sendMessage(wid, "*Mwsm Token:*\n" + Password[1]);
			}
			await GetUpdate(WServer, false);
			await WwjsVersion(false);

			setupConnectionWatchdog();
		}
	} catch (err) {
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + err);
	}
});

client.on('authenticated', () => {
	logAndEmit(Debug('CONSOLE').authenticated, Debug('RESOURCES').authenticated);
});

client.on('auth_failure', async () => {
	logAndEmit(Debug('CONSOLE').auth_failure, Debug('RESOURCES').auth_failure);
	try {
		await link.prepare('UPDATE options SET auth=?').run(0);
		io.emit('Reset', true);
		Session = false;
		wwjsRun = true;
	} catch (err) {
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + err);
	}
});

client.on('disconnected', async (reason) => {
	try {
		const appName = Debug('OPTIONS').appname;
		const msg = `> ${appName} : ${Debug('CONSOLE').disconnected}`;
		console.log(msg);
		if (global.io) {
			global.io.emit('message', msg);
			global.io.emit('qr', Debug('RESOURCES').disconnected);
			global.io.emit('Reset', true);
		}
		await worker.pause();
		await link.prepare('UPDATE options SET auth=?, token=?').run(0, null);
		Session = false;
		wwjsRun = true;
		try {
			await client.logout();
			await client.destroy();
		} catch (e) {}

		delay(1000).then(async function() {
			await exec('npm run restart:mwsm');
		});

	} catch (err) {
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + err);
	}
});

client.on('loading_screen', (percent) => {
	console.log(`> ${Debug('OPTIONS').appname} : Loading application ${percent}%`);
	io.emit('message', `> ${Debug('OPTIONS').appname} : Connecting Application ${percent}%`);

	if (parseInt(percent, 10) >= 100) {
		logAndEmit(Debug('CONSOLE').authenticated, Debug('RESOURCES').authenticated);
	} else {
		logAndEmit(Debug('CONSOLE').connection, Debug('RESOURCES').connection);
		io.emit('Reset', true);
	}

	setTimeout(() => {
		if (wwjsRun) {
			wwjsRun = false;
			WwjsVersion(true);
		}
	}, 1000);
});

io.on('connection', (socket) => {
	socket.emit('Version', Package.version);
	socket.emit('Manager', Debug('MKAUTH').aimbot);
	socket.emit('Patched', Release(Debug('RELEASE').mwsm));
	socket.emit('Reset', !Session);

	const appName = Debug('OPTIONS').appname;

	if (customBrowserPath === '') {
		console.log('> ' + appName + ' : ' + Debug('CONSOLE').webdefault);
		socket.emit('message', '> ' + appName + ' : ' + Debug('CONSOLE').webdefault);
	} else {
		if (fs.existsSync(customBrowserPath)) {
			console.log('> ' + appName + ' : ' + Debug('CONSOLE').websucess);
			socket.emit('message', '> ' + appName + ' : ' + Debug('CONSOLE').websucess);
		} else {
			console.log('> ' + appName + ' : ' + Debug('CONSOLE').webfail);
			socket.emit('message', '> ' + appName + ' : ' + Debug('CONSOLE').webfail);
		}
	}

	const isHeartbeatActive = Boolean(Debug('OPTIONS').heartbeat) && parseInt(Debug('OPTIONS').heartdelay, 10) > 0;
	const heartbeatMsg = isHeartbeatActive ? Debug('CONSOLE').hearton : Debug('CONSOLE').heartoff;

	if (heartbeatMsg) {
		const formattedHeartbeat = `> ${appName} : ${heartbeatMsg}`;
		console.log(formattedHeartbeat);
		socket.emit('message', formattedHeartbeat);
	}

	if (Session && Boolean(Debug('OPTIONS').auth)) {
		console.log(`> ${appName} : ${Debug('CONSOLE').authenticated}`);
		socket.emit('qr', Debug('RESOURCES').authenticated);
		socket.emit('message', `> ${appName} : ${Debug('CONSOLE').ready}`);
		socket.emit('qr', Debug('RESOURCES').ready);
	} else {
		socket.emit('message', `> ${appName} : ${Debug('CONSOLE').connection}`);
		console.log(`> ${appName} : ${Debug('CONSOLE').connection}`);
		socket.emit('qr', Debug('RESOURCES').connection);
	}

	socket.emit('background', Debug('RESOURCES').background);
	socket.emit('donation', Debug('RESOURCES').about);
	socket.emit('developer', Debug('RESOURCES').developer);

	setTimeout(async () => {
		if (Permission) {
			await GetUpdate(WServer, false);
			await WwjsVersion(false);
		}
	}, 2000);
});

// Reset
app.post('/reset', async (req, res) => {
	const {
		reset,
		erase
	} = req.body;

	try {
		logAndEmit(Debug('CONSOLE').connection, Debug('RESOURCES').connection);
		io.emit('Reset', true);

		global.io.emit('getlog', true);
		await worker.pause();
		if (erase === 'true') {
			const Eraser = await link.prepare('DELETE FROM target').run();

			if (Eraser) {
				await Dataset('SQLITE_SEQUENCE', 'SEQ', 'TARGET', 'FLUSH');
				res.json({
					Status: "Success"
				});
				const msgText = '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').cleanon;
				global.io.emit('message', msgText);
				console.log(msgText);
			} else {
				res.json({
					Status: "Fail"
				});
				const msgText = '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').cleanoff;
				global.io.emit('message', msgText);
				console.log(msgText);
			}
		} else if (reset === "true") {
			res.json({
				Status: undefined
			});
		}

		delay(1000).then(async () => {
			await exec('npm run restart:mwsm');
		});

	} catch (error) {
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + error);
		res.status(500).json({
			Status: "Error",
			Message: error.message
		});
	}
});

// ==================================================
// ?? Shutdown / Logout Route
// ==================================================
app.post('/shutdown', async (req, res) => {
	const {
		shutdown: Shutdown,
		token: Token
	} = req.body;
	const appName = Debug('OPTIONS').appname;

	if (Shutdown === "true" && [Password[0], Password[1]].includes(Token)) {
		res.json({
			Status: "Success"
		});

		global.io.emit('getlog', true);
		global.io.emit('message', '> ' + appName + ' : ' + Debug('CONSOLE').disconnected);
		console.log('> ' + appName + ' : ' + Debug('CONSOLE').disconnected);
		global.io.emit('qr', Debug('RESOURCES').disconnected);
		global.io.emit('Reset', true);
		await worker.pause();
		Session = false;

		try {
			link.prepare('UPDATE options SET auth=?, token=?').run(0, null);
		} catch (err) {
			console.log('> ' + appName + ' : ' + err);
		}

		try {
			if (typeof client !== 'undefined' && client) {
				await Promise.race([
					client.logout().catch(() => {}),
					delay(3000)
				]);
				await client.destroy().catch(() => {});
			}
		} catch (e) {
			console.log('> ' + appName + ' : ' + e);
		}

		delay(1000).then(async () => {
			global.io.emit('message', '> ' + appName + ' : ' + Debug('CONSOLE').connection);
			console.log('> ' + appName + ' : ' + Debug('CONSOLE').connection);
			global.io.emit('qr', Debug('RESOURCES').connection);
			await exec('npm run restart:mwsm');
		});

	} else {
		res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
		});
	}
});

// Authenticated
app.post('/authenticated', (req, res) => {
	res.json({
		Status: Boolean(Debug('OPTIONS').auth) ? "Success" : "Fail"
	});
});

// Debug
app.post('/debug', (req, res) => {
	const {
		debug
	} = req.body;

	if (Debug('OPTIONS').debugger === debug) {
		return res.json({
			Status: "Success",
			Return: debug
		});
	}

	db.run("UPDATE options SET debugger=?", [debug], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: Debug('OPTIONS').debugger
			});
		}
		res.json({
			Status: "Success",
			Return: debug
		});
	});
});



app.post('/send-mkauth', async (req, res) => {
	try {
		const result = await ProcessMkAuthMessage(req.body);
		if (result.Status === "Success") {
			return res.json({
				Status: "Success",
				Return: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success,
				RPush: DateTime(),
				RStatus: result.RStatus || "Sent",
				RCode: result.RCode
			});
		} else if (result.Status === "Ignored") {
			return res.json({
				Status: "Fail",
				Return: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').reason,
				RPush: DateTime(),
				RStatus: "Fail",
				RCode: result.RCode
			});
		} else {
			return res.json({
				Status: "Fail",
				Return: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error,
				RPush: DateTime(),
				RStatus: "Fail",
				RCode: result.RCode
			});
		}
	} catch (err) {
		return res.status(500).json({
			Status: "Fail",
			Return: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error,
			RPush: DateTime(),
			RStatus: "Fail",
			RCode: req.body.code
		});
	}
});


async function ProcessMkAuthMessage(payloadData) {
	const User = payloadData.user;
	const Client = payloadData.client;
	const Authority = payloadData.authority || payloadData.client;
	const Code = payloadData.code;
	const Status = payloadData.status;
	const Reward = payloadData.reward;
	const Token = payloadData.token;
	const Cash = payloadData.cash;
	const Gateway = payloadData.gateway;
	const UnLock = payloadData.unlock;
	const Option = payloadData.option;
	const Speed = Debug('SCHEDULER').speed;
	const Block = Debug('SCHEDULER').block;
	const Factor = payloadData.process;
	const Headshot = payloadData.headshot ?? false;

	const Priority = payloadData.priority || 4;
	let Pulse = DateTime();

	if (Code && isDuplicate(Code, Priority, Pulse) && !Headshot) {
		return {
			Status: "Ignored",
			RCode: Code
		};
	}

	let Contact = DDISet(payloadData.contact);
	let Process, Direct;
	let Payment = payloadData.payment;
	let Message = "";

	if (typeof Playground !== 'undefined' && validPhone(Playground)) {
		Contact = DDISet(Playground);
	}

	if (Option == "support") {
		Payment = "support";
	} else if (Reward && (Reward.split(" ")[0]) == (DateTime()).split(" ")[0] && Payment != "paid") {
		Payment = "open";
	}

	switch (Payment) {
		case 'paid':
			if (Boolean(Debug('SCHEDULER').onunlock) || Boolean(Debug('SCHEDULER').onlock)) {
				switch (Factor) {
					case 'unlock':
						Message = DebugMsg("PAY") + "##" + (DebugMsg("UNLOCK")).split(", ")[1];
						break;
					default:
						Message = DebugMsg("PAY");
				}
			} else {
				Message = DebugMsg("PAY");
			}
			if (Status && Status.toLowerCase() != "finished") {
				Process = "Finished";
			}
			Direct = "Pay";
			break;

		case 'due':
			if (Reward && (Reward.split(" ")[0]) == (DateTime()).split(" ")[0]) {
				Message = DebugMsg("DAY");
			} else if (Option != undefined) {
				if (Boolean(Debug('SCHEDULER').onspeed) && Option == 'speed') {
					Message = DebugMsg("SPEED");
				} else if (Boolean(Debug('SCHEDULER').onblock) && Option == 'block') {
					Message = DebugMsg("BLOCK");
				} else {
					Message = DebugMsg("LATER");
				}
			} else if (UnLock != undefined) {
				if (Boolean(Debug('SCHEDULER').onunlock) || Boolean(Debug('SCHEDULER').onlock)) {
					switch (Factor) {
						case 'unlock':
							Message = DebugMsg("UNLOCK");
							break;
						case 'lock':
							Message = DebugMsg("LOCK");
							break;
						default:
							Message = DebugMsg("LATER");
							break;
					}
				} else {
					Message = DebugMsg("LATER");
				}
			} else {
				Message = DebugMsg("LATER");
			}

			if (Status && (Status.toLowerCase() == "pending" || Status.toLowerCase() == "fail")) {
				Process = "Sent";
			} else if (Status && (Status.toLowerCase() == "sent" || Status.toLowerCase() == "resend")) {
				Process = "Resend";
			}
			break;

		case 'open':
			if (Reward && (Reward.split(" ")[0]) == (DateTime()).split(" ")[0]) {
				Message = DebugMsg("DAY");
			} else {
				Message = DebugMsg("BEFORE");
			}

			if (Status && (Status.toLowerCase() == "pending" || Status.toLowerCase() == "fail")) {
				Process = "Sent";
			} else if (Status && (Status.toLowerCase() == "sent" || Status.toLowerCase() == "resend")) {
				Process = "Resend";
			}
			break;

		case 'support':
			Message = DebugMsg("SUPPORT");
			break;
		default:
			break;
	}

	const dataVencimentoFormatada = Reward ?
		Reward.split(" ")[0].split("-").reverse().join("/") :
		"";

	const dataPagamentoFormatada = Pulse ?
		Pulse.split(" ")[0].split("-").reverse().join("/") + " as " + Pulse.split(" ")[1].substring(0, 5) :
		"";

	let MensagemFormatada = Message
		.replaceAll('%nomeresumido%', toCapitalize((Client || "").split(" ")[0]))
		.replaceAll('%vencimento%', dataVencimentoFormatada)
		.replaceAll('%logincliente%', User)
		.replaceAll('%valorpago%', Cash)
		.replaceAll('%bloqatrazo%', Block)
		.replaceAll('%metodo%', Gateway)
		.replaceAll('%reduzatrazo%', Speed)
		.replaceAll('%numerotitulo%', Code)
		.replaceAll('%pagamento%', dataPagamentoFormatada);

	const isValidToken = [Password[0], Password[1]].includes(Token);
	const isValidFormat = validPhone(Contact);

	if (isValidToken && isValidFormat) {
		const storageCheck = Debug("STORANGE", "*", "DIRECT", Code);
		if (!storageCheck || storageCheck.title == undefined) {
			await link.prepare("INSERT INTO storange(title, user, client, contact, reward, status, push) VALUES(?, ?, ?, ?, ?, ?, ?)").run(Code, User, Authority, Contact, Reward, Process, Pulse);
		} else {
			await link.prepare("UPDATE storange SET push=?, status=? WHERE title=?").run(Pulse, Process, Code);
		}

		const enqueueResult = await EnqueueWithPriority({
			to: Contact,
			msg: MensagemFormatada,
			auth: Debug('MKAUTH').aimbot,
			user: Authority,
			send: Direct,
			simulator: false,
			pass: Token,
			priority: Priority,
			code: Code
		});

		if (!enqueueResult) {
			return {
				Status: "Ignored",
				RStatus: Process,
				RCode: Code
			};
		}

		if (Code) {
			await link.prepare("UPDATE scheduling SET process='load' WHERE title=?").run(Code);
		}

		if (global.io) {
			global.io.emit('schedresume', Code);

			const pendenciasRestantes = await link.prepare("SELECT COUNT(*) as total FROM scheduling WHERE process = 'wait'").get();
			if (!pendenciasRestantes || pendenciasRestantes.total === 0) {
				global.io.emit('schedresume', 'true');
			}
		}

		return {
			Status: "Success",
			RStatus: Process,
			RCode: Code
		};
	} else {
		let Json = {
			"Mwsm": "/mwsm-message",
			"Main": "Mwsm",
			"Start": DateTime()
		};
		if (typeof Json === 'object') {
			Json = JSON.stringify(Json);
		}
		console.error(Print.bg.blue, Print.fg.white, Json, Print.reset);

		Process = "Fail";
		const storageCheck = Debug("STORANGE", "*", "DIRECT", Code);
		if (!storageCheck || storageCheck.title == undefined) {
			await link.prepare("INSERT INTO storange(title, user, client, contact, reward, status, push) VALUES(?, ?, ?, ?, ?, ?, ?)").run(Code, User, Authority, Contact, Reward, Process, Pulse);
		} else {
			await link.prepare("UPDATE storange SET push=?, status=? WHERE title=?").run(Pulse, Process, Code);
		}

		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
		if (global.io) {
			global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
			global.io.emit('schedresume', Code);
		}

		return {
			Status: "Fail",
			RStatus: Process,
			RCode: Code
		};
	}
}


// API Update
app.post('/update', async (req, res) => {
	const {
		uptodate: UP
	} = req.body;
	const currentUpdate = Debug('RELEASE').isupdate;

	if (currentUpdate === UP) {
		return res.json({
			Status: "Success",
			Return: UP
		});
	}

	const Update = await Dataset('RELEASE', 'ISUPDATE', UP, 'UPDATE');

	res.json({
		Status: Update ? "Success" : "Fail",
		Return: Update ? UP : currentUpdate
	});
});


// API Protect
app.post('/protected', (req, res) => {
	const {
		protect: Protect
	} = req.body;
	const currentProtect = Debug('OPTIONS').protect;

	if (currentProtect == Protect) {
		return res.json({
			Status: "Success",
			Return: Protect
		});
	}

	db.run("UPDATE options SET protect=?", [Protect], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentProtect
			});
		}
		res.json({
			Status: "Success",
			Return: Protect
		});
	});
});

// Tag
app.post('/tag', (req, res) => {
	const {
		tag: Tag
	} = req.body;
	const currentTag = Debug('OPTIONS').tag;

	if (currentTag == Tag) {
		return res.json({
			Status: "Success",
			Return: Tag
		});
	}

	db.run("UPDATE options SET tag=?", [Tag], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentTag
			});
		}
		res.json({
			Status: "Success",
			Return: Tag
		});
	});
});


// Backup
app.post('/backup', (req, res) => {
	const {
		backup: Backup
	} = req.body;
	const currentBackup = Debug('MKAUTH').backup;

	if (currentBackup == Backup) {
		return res.json({
			Status: "Success",
			Return: Backup
		});
	}

	db.run("UPDATE mkauth SET backup=?", [Backup], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentBackup
			});
		}
		res.json({
			Status: "Success",
			Return: Backup
		});
	});
});



// Owner
app.post('/owner', (req, res) => {
	const {
		owner: ShortName
	} = req.body;
	const currentOwner = Debug('MKAUTH').owner;

	if (currentOwner == ShortName) {
		return res.json({
			Status: "Success",
			Return: ShortName
		});
	}

	db.run("UPDATE mkauth SET owner=?", [ShortName], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentOwner
			});
		}
		res.json({
			Status: "Success",
			Return: ShortName
		});
	});
});



// OnReboot
app.post('/onreboot', (req, res) => {
	const {
		onreboot: OnReboot
	} = req.body;
	const currentOnReboot = Debug('OPTIONS').onreboot;

	if (currentOnReboot == OnReboot) {
		return res.json({
			Status: "Success",
			Return: OnReboot
		});
	}

	db.run("UPDATE options SET onreboot=?", [OnReboot], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentOnReboot
			});
		}
		res.json({
			Status: "Success",
			Return: OnReboot
		});
	});
});


// Prevent
app.post('/prevent', (req, res) => {
	const {
		prevent: Prevent
	} = req.body;
	const currentPrevent = Debug('MKAUTH').prevent;

	if (currentPrevent == Prevent) {
		return res.json({
			Status: "Success",
			Return: Prevent
		});
	}

	db.run("UPDATE mkauth SET prevent=?", [Prevent], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentPrevent
			});
		}
		res.json({
			Status: "Success",
			Return: Prevent
		});
	});
});


// RegEx
app.post('/regex', (req, res) => {
	const {
		regex: RegEx
	} = req.body;
	const currentRegex = Debug('OPTIONS').regex;

	if (currentRegex == RegEx) {
		return res.json({
			Status: "Success",
			Return: RegEx
		});
	}

	db.run("UPDATE options SET regex=?", [RegEx], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentRegex
			});
		}
		res.json({
			Status: "Success",
			Return: RegEx
		});
	});
});


const Emoticons = async (FIND, IN, OUT) => {
	return link.prepare(`SELECT ${OUT} FROM emotions WHERE ${IN} = ?`).get(FIND);
};

// Emoji
app.post('/emoji', async (req, res) => {
	const {
		find: FIND,
		in: IN,
		out: OUT
	} = req.body;

	let Emoji = IN === "emoji" ? emoji.unemojify(FIND) : await Emoticons(FIND, IN, OUT);

	if (Emoji) {
		if (IN !== "emoji" && IN !== "socket") {
			const mappings = {
				unicode: 'unicode',
				html: 'html',
				emoji: 'emoji',
				name: 'name',
				key: 'key'
			};
			if (mappings[OUT]) {
				Emoji = Emoji[mappings[OUT]];
			}
		}

		if (Emoji !== undefined) {
			return res.json({
				Status: "Success",
				Return: Emoji
			});
		}
	}

	res.json({
		Status: "Fail",
		Return: FIND
	});
});

app.post('/forceupdate', async (req, res) => {
	try {
		await Dataset('RELEASE', 'reload', 'true', 'UPDATE');

		const Register = await GetUpdate(WServer, true, true);

		return res.json({
			Status: Register?.Update === "true" ? "Success" : "Fail"
		});

	} catch (err) {
		return res.status(500).json({
			Status: "Fail",
			Error: err.message
		});

	} finally {
		try {
			await Dataset('RELEASE', 'reload', 'false', 'UPDATE');
		} catch (cleanupErr) {}
	}
});

// Force Backup
app.post('/forcebackup', async (req, res) => {
	const {
		backup: Backup
	} = req.body;

	if (!Boolean(Backup)) {
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').request
		});
	}

	await Dataset('RELEASE', 'reload', 'true', 'UPDATE');
	const Reload = await SetSchedule(true);
	await Dataset('RELEASE', 'reload', 'false', 'UPDATE');

	if (Reload) {
		return res.json({
			Status: "Success",
			Return: Debug('CONSOLE').schedule
		});
	}

	res.json({
		Status: "Fail",
		Return: Debug('CONSOLE').request
	});
});


// Spam
app.post('/spam', (req, res) => {
	const {
		level: Level
	} = req.body;
	const currentLevel = Debug('MKAUTH').level;

	if (currentLevel == Level) {
		return res.json({
			Status: "Success",
			Return: Level
		});
	}

	db.run("UPDATE mkauth SET level=?", [Level], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentLevel
			});
		}
		res.json({
			Status: "Success",
			Return: Level
		});
	});
});


// Shift
app.post('/shift', async (req, res) => {
	const {
		shift: Shift,
		min: Min,
		max: Max
	} = req.body;
	const hasShift = await Dataset('SCHEDULER', 'shift', Shift, 'UPDATE');

	if (!hasShift) {
		return res.json({
			Status: "Fail",
			Return: false
		});
	}

	if (Boolean(Debug('SCHEDULER').shift)) {
		const hasMin = await Dataset('SCHEDULER', 'min', Min, 'UPDATE');
		const hasMax = await Dataset('SCHEDULER', 'max', Max, 'UPDATE');

		return res.json({
			Status: (hasMin && hasMax) ? "Success" : "Fail",
			Return: (hasMin && hasMax) ? true : false
		});
	} else {
		const hasMin = await Dataset('SCHEDULER', 'min', '08', 'UPDATE');
		const hasMax = await Dataset('SCHEDULER', 'max', '22', 'UPDATE');

		return res.json({
			Status: (hasMin && hasMax) ? "Success" : "Fail",
			Return: false
		});
	}
});


// Aimbot
app.post('/aimbot', async (req, res) => {
	const {
		aimbot: Aimbot
	} = req.body;
	const Base = await Dataset('MKAUTH', 'AIMBOT', Aimbot, 'UPDATE');

	if (!Base) {
		return res.json({
			Status: "Fail",
			Return: false
		});
	}

	res.json({
		Status: "Success",
		Return: Boolean(Debug('MKAUTH').aimbot)
	});
});


async function SyncEngineModules(customToken = null) {
	const Token = customToken || Debug('OPTIONS')?.keygen;
	if (!Token) {
		return;
	}

	try {
		const response = await axios.get('https://openrouter.ai/api/v1/models', {
			headers: {
				'Authorization': `Bearer ${Token}`
			}
		});
		const openRouterModels = response.data?.data || [];
		const activeModels = openRouterModels.filter(m => !m.id.endsWith(':batch'));

		db.all("SELECT id, title, module FROM engine", [], (err, rows) => {
			if (err || !rows) return;

			rows.forEach(row => {
				const titleQuery = String(row.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
				const moduleQuery = String(row.module || '').toLowerCase().replace(/[^a-z0-9]/g, '');

				let matchedModel = null;

				if (titleQuery.includes('grok') || moduleQuery.includes('grok')) {
					matchedModel = activeModels.find(m => m.id.includes('grok-4.3')) ||
						activeModels.find(m => m.id.includes('grok-4.5')) ||
						activeModels.find(m => m.id.includes('grok-latest'));
				} else if (titleQuery.includes('haiku') || titleQuery.includes('claude') || moduleQuery.includes('haiku')) {
					matchedModel = activeModels.find(m => m.id.includes('claude-haiku-latest')) ||
						activeModels.find(m => m.id.includes('claude-haiku-4.5')) ||
						activeModels.find(m => m.id.includes('claude-haiku'));
				} else {
					matchedModel = activeModels.find(m => {
						const cleanApiId = m.id.toLowerCase().replace(/[^a-z0-9]/g, '');
						const cleanApiName = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');

						return (moduleQuery && cleanApiId.includes(moduleQuery)) ||
							(moduleQuery && moduleQuery.includes(cleanApiId)) ||
							cleanApiName.includes(titleQuery) ||
							cleanApiId.includes(titleQuery);
					});
				}

				if (!matchedModel && titleQuery) {
					const candidates = activeModels.filter(m => {
						const cleanId = m.id.toLowerCase().replace(/[^a-z0-9]/g, '');
						return cleanId.includes(titleQuery);
					});

					if (candidates.length > 0) {
						candidates.sort((a, b) => {
							const costA = parseFloat(a.pricing?.prompt || 0) + parseFloat(a.pricing?.completion || 0);
							const costB = parseFloat(b.pricing?.prompt || 0) + parseFloat(b.pricing?.completion || 0);
							return costA - costB;
						});
						matchedModel = candidates[0];
					}
				}

				if (matchedModel && matchedModel.id !== row.module) {
					db.run(
						"UPDATE engine SET module = ? WHERE id = ?",
						[matchedModel.id, row.id]
					);
				}
			});
		});
	} catch (error) {}
}

// Token
app.post('/token', async (req, res) => {
	const {
		token: Token
	} = req.body;

	if (![Password[0], Password[1]].includes(Token)) {
		// Se errar a senha/token, garante que o painel fica bloqueado
		isPanelAuthorized = false;
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
		});
	}

	const options = Debug('OPTIONS');
	const mkauth = Debug('MKAUTH');
	const scheduler = Debug('SCHEDULER');
	const dateParts = DateTime().split('-');
	const Engine = Debug('ENGINE', 'TITLE', 'MULTIPLE');
	const Zone = Debug('LOCALZONE', 'UF', 'MULTIPLE');
	if (options.keygen != null) {
		const OpenRouter = await Openrout(options.keygen);
		var Balance = '0,00';
		var Charge = null;

		if (OpenRouter && OpenRouter.financial) {
			Charge = OpenRouter?.models?.find(m => m.title === options.engine);
			Balance = OpenRouter.financial.balance_brl;
		}

	}


	const AskBrains = await new Promise((resolve) => {
		db.get("SELECT COUNT(*) AS total FROM intelligence", [], (err, row) => {
			resolve(row ? row.total : 0);
		});
	});

	const socketEvents = {
		interval: options.interval,
		sleep: options.sleep,
		sendwait: options.sendwait,
		response: options.response,
		call: options.call,
		access: options.access,
		port: options.access,
		pixfail: options.pixfail,
		replyes: options.replyes,
		alert: options.alert,
		count: options.count,
		onbot: options.onbot,
		reject: options.reject,
		limiter: options.limiter,
		domain: mkauth.domain,
		tunel: mkauth.tunel,
		username: mkauth.client_id,
		password: mkauth.client_secret,
		module: mkauth.module,
		bar: mkauth.bar,
		pix: mkauth.pix,
		qrpix: mkauth.qrpix,
		qrlink: mkauth.qrlink,
		pdf: mkauth.pdf,
		delay: mkauth.delay,
		iserver: mkauth.client_link,
		webhook: mkauth.webhook,
		whstatus: mkauth.whstatus,
		imode: mkauth.mode,
		debugger: options.debugger,
		Tag: options.tag,
		regex: options.regex,
		onreboot: options.onreboot,
		uptodate: Debug('RELEASE').isupdate,
		protected: options.protect,
		spam: mkauth.level,
		backup: mkauth.backup,
		aimbot: mkauth.aimbot,
		doublekill: mkauth.prevent,
		owner: mkauth.owner,
		ismonth: dateParts[1],
		isyear: dateParts[0],
		issearch: 'all',
		bfive: scheduler.bfive,
		inday: scheduler.inday,
		lfive: scheduler.lfive,
		lten: scheduler.lten,
		lfifteen: scheduler.lfifteen,
		ltwenty: scheduler.ltwenty,
		ltwentyfive: scheduler.ltwentyfive,
		lthirty: scheduler.lthirty,
		lthirtyfive: scheduler.lthirtyfive,
		lforty: scheduler.lforty,
		shift: scheduler.shift,
		min: AddZero(scheduler.min),
		max: scheduler.max,
		sunday: scheduler.sunday,
		monday: scheduler.monday,
		tuesday: scheduler.tuesday,
		wednesday: scheduler.wednesday,
		thursday: scheduler.thursday,
		friday: scheduler.friday,
		saturday: scheduler.saturday,
		morning: scheduler.morning,
		afternoon: scheduler.afternoon,
		night: scheduler.night,
		OnPay: scheduler.onpay,
		OnLock: scheduler.onlock,
		OnUnlock: scheduler.onunlock,
		OnMaintenance: scheduler.onmaintenance,
		OnUnistall: scheduler.onunistall,
		OnSpeed: scheduler.onspeed,
		OnBlock: scheduler.onspeed,
		OnSupport: scheduler.onsupport,
		Speed: scheduler.speed,
		Block: scheduler.block,
		Crontab: scheduler.cron,
		heartbeat: Boolean(options.heartdelay > 0),
		heartdelay: options.heartdelay || 0,
		engine: Engine,
		zone: Zone,
		AskToken: options.keygen,
		AskIP: options.mwsmhost,
		AskPort: options.mwsmport,
		AskMode: options.aimode,
		AskCLI: options.prompt,
		Threshold: options.threshold,
		AskTimeout: options.aitimeout,
		AskLedge: options.maxknowledge,
		AskEngine: options.engine || '00',
		AskZone: options.timezone || '00',
		AskBalance: Balance,
		AskInput: Charge?.input_cost_brl || '0,00',
		AskOutput: Charge?.output_cost_brl || '0,00',
		AskBrain: AskBrains,
		AskModule: Debug('ENGINE', 'ACTIVE', 'DIRECT', options.engine)?.active
	};

	for (const [event, value] of Object.entries(socketEvents)) {
		global.io.emit(event, value);
	}

	['1', '2', '3'].forEach((id, idx) => {
		const prefix = ['A', 'B', 'C'][idx];
		const msgData = Debug('MESSAGE', '*', 'ID', id);

		const keys = ['before', 'day', 'later', 'pay', 'lock', 'unlock', 'maintenance', 'unistall', 'speed', 'block', 'support'];
		keys.forEach((key, index) => {
			const code = `${prefix}${String(index + 1).padStart(3, '0')}`;
			global.io.emit(code, emoji.emojify(msgData[key]));
		});
	});

	const targetsList = Debug('TARGET', '*', 'ALL').sort((a, b) => b.id - a.id);

	if (!targetsList || targetsList.length === 0) {
		global.io.emit('getlog', false);
	} else {
		const isTARGET = targetsList.reduce((acc, TARGET) => {
			if (TARGET.status === 'pending') {
				Dataset('TARGET', '*', TARGET.id, 'DELETE');
				Dataset('SQLITE_SEQUENCE', 'SEQ', 'TARGET', 'FLUSH');
				return acc;
			}

			let targetFormatted = TARGET.target;
			if (targetFormatted === "900000000") {
				targetFormatted = "(00) 0 0000-0000";
			} else {
				let t = String(targetFormatted || '').replace(/\D/g, '');
				if (t.length === 11) {
					targetFormatted = `(${t.slice(0, 2)}) ${t.slice(2, 3)} ${t.slice(3, 7)}-${t.slice(7)}`;
				} else if (t.length === 10) {
					targetFormatted = `(${t.slice(0, 2)}) ${t.slice(2, 6)}-${t.slice(6)}`;
				}
			}

			acc.push({
				"ID": TARGET.id,
				"TITLE": TARGET.title,
				"NAME": TARGET.client,
				"START": TARGET.start,
				"END": TARGET.end,
				"TARGET": targetFormatted,
				"STATUS": TARGET.status,
			});

			return acc;
		}, []);

		if (Boolean(options.auth)) {
			global.io.emit('getlog', true);
			global.io.emit('setlog', isTARGET);
		}
	}

	// Login bem-sucedido: libera o acesso ao painel
	isPanelAuthorized = true;

	res.json({
		Status: "Success",
		Return: Debug('CONSOLE').right
	});
});

// Set Options Mkauth
app.post('/options_mkauth', (req, res) => {
	const {
		define,
		enable
	} = req.body;
	const currentValue = Debug('MKAUTH')[define];

	db.run(`UPDATE mkauth SET ${define} = ?`, [enable], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentValue
			});
		}
		res.json({
			Status: "Success",
			Return: enable
		});
	});
});

// Set Scheduler Mkauth
app.post('/scheduler', (req, res) => {
	const define = req.body.define.toLowerCase();
	const enable = req.body.enable;
	const schedulerData = Debug('SCHEDULER');

	db.run(`UPDATE scheduler SET ${define} = ?`, [enable], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: schedulerData[define]
			});
		}
		res.json({
			Status: "Success",
			Return: enable,
			Option: schedulerData.speed
		});
	});
});


// Intelligence Clean
app.post('/intelligence', async (req, res) => {
	try {
		await dbQuery.run(`DELETE FROM intelligence`);

		try {
			await broadcastPanelStats();
		} catch (e) {}

		return res.json({
			Status: "Success",
			Return: Debug('CONSOLE').cleanon
		});
	} catch (err) {
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').cleanoff
		});
	}
});

// Set Heartbeat Options
app.post('/heartbeat', (req, res) => {
	const heartdelay = parseInt(req.body.heartdelay, 10) || 0;
	const newHeartbeat = heartdelay > 0 ? 1 : 0;
	const oldHeartbeat = Boolean(Debug('OPTIONS').heartbeat);

	db.run(`UPDATE options SET heartbeat = ?, heartdelay = ?`, [newHeartbeat, heartdelay], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Message: err.message
			});
		}

		Debug('OPTIONS').heartbeat = newHeartbeat;
		Debug('OPTIONS').heartdelay = heartdelay;

		if (oldHeartbeat !== Boolean(newHeartbeat)) {
			const appName = Debug('OPTIONS').appname;
			const consoleMsg = newHeartbeat ? Debug('CONSOLE').hearton : Debug('CONSOLE').heartoff;

			if (consoleMsg) {
				const formatted = `> ${appName} : ${consoleMsg}`;
				console.log(formatted);
				io.emit('message', formatted);
			}
		}

		res.json({
			Status: "Success",
			heartbeat: Boolean(newHeartbeat),
			heartdelay: heartdelay
		});
	});
});

// Get Clients Mkauth
app.post('/clients_mkauth', async (req, res) => {
	const {
		year: Year,
		month: Month,
		payment: Payment
	} = req.body;
	const currentYear = DateTime().split(" ")[0].split("-")[0];
	const Findex = `${currentYear - Year}-${Month}`;

	const Master = await MkAuth(Findex, Payment, 'list');

	if (!Master || Master.Status === "Error") {
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').request
		});
	}

	const hasTARGET = Master.map((TARGET) => {
		const contact = TARGET.Contact ? String(TARGET.Contact).replace(/[^0-9.]+/g, '') : "00000000000";

		let status, push;
		try {
			const storageData = Debug("STORANGE", "*", "DIRECT", TARGET.Identifier);
			status = storageData?.status;
			push = storageData?.push;
		} catch (e) {
			status = undefined;
			push = undefined;
		}

		return {
			"ORDER": TARGET.Order,
			"TITLE": TARGET.Identifier,
			"USER": TARGET.Connect,
			"MAIN": TARGET.Authority,
			"CLIENT": TARGET.Client,
			"CONTACT": contact,
			"REWARD": TARGET.Reward,
			"PUSH": push,
			"PAYMENT": TARGET.Payment,
			"STATUS": status,
			"CASH": TARGET.Cash,
			"GATEWAY": TARGET.Gateway
		};
	});

	if (Boolean(Debug('OPTIONS').auth)) {
		global.io.emit('getclients', hasTARGET);
	}

	res.json({
		Status: "Success",
		Return: Debug('CONSOLE').successfully
	});
});


// Delay Mkauth
app.post('/delay_mkauth', (req, res) => {
	const {
		range
	} = req.body;
	const currentDelay = Debug('MKAUTH').delay;

	if (currentDelay == range) {
		return res.json({
			Status: "Success",
			Return: range
		});
	}

	db.run("UPDATE mkauth SET delay = ?", [range], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: currentDelay
			});
		}
		res.json({
			Status: "Success",
			Return: range
		});
	});
});


// Scheduler
app.post('/scheduler_mkauth', async (req, res) => {
	const exUpdate = await link.prepare('SELECT * FROM scheduling WHERE process = ?').all("wait");

	if (!exUpdate || exUpdate.length === 0) {
		return res.json({
			Status: "Fail"
		});
	}

	const isSHED = exUpdate.map((Send) => ({
		"TITLE": Send.title,
		"CLIENT": Send.authority || Send.client,
		"REWARD": Send.reward
	}));

	global.io.emit('shedullers', isSHED);

	res.json({
		Status: "Success"
	});
});


app.post('/spam_mkauth', async (req, res) => {
	const {
		clients,
		token
	} = req.body;

	if (!clients || !Array.isArray(clients) || clients.length === 0) {
		return res.status(400).json({
			Status: "Fail",
			Return: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error,
			RPush: DateTime(),
			RStatus: "Fail",
			RCode: null
		});
	}

	let totalSuccess = 0;
	let totalIgnored = 0;
	let totalFail = 0;
	let lastCode = clients[clients.length - 1]?.code || null;

	for (const clientData of clients) {
		try {
			const payload = {
				client: clientData.client,
				name: clientData.authority,
				user: clientData.user,
				code: clientData.code,
				status: clientData.status,
				payment: clientData.payment,
				reward: clientData.reward,
				contact: clientData.contact,
				push: clientData.push,
				cash: clientData.cash,
				gateway: clientData.gateway,
				token: token,
				priority: 1,
				headshot: true
			};

			const result = await ProcessMkAuthMessage(payload);

			let rPush = DateTime();

			if (result.Status === "Success") {
				totalSuccess++;
				let rStatus = result.RStatus || "Sent";

				if (global.io) {
					global.io.emit('spam_status', {
						code: clientData.code,
						RPush: rPush,
						RStatus: rStatus
					});
				}

			} else if (result.Status === "Ignored") {
				totalIgnored++;

				if (global.io) {
					global.io.emit('spam_status', {
						code: clientData.code,
						RPush: rPush,
						RStatus: "Fail"
					});
				}

			} else {
				totalFail++;

				if (global.io) {
					global.io.emit('spam_status', {
						code: clientData.code,
						RPush: rPush,
						RStatus: "Fail"
					});
				}
			}

		} catch (err) {
			totalFail++;

			if (global.io) {
				global.io.emit('spam_status', {
					code: clientData.code,
					RPush: DateTime(),
					RStatus: "Fail"
				});
			}
		}
	}

	if (totalIgnored === clients.length) {
		return res.json({
			Status: "Fail",
			Return: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').reason,
			RPush: DateTime(),
			RStatus: "Fail",
			RCode: lastCode
		});
	}

	if (totalSuccess > 0) {
		return res.json({
			Status: "Success",
			Return: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').queue,
			RPush: DateTime(),
			RStatus: "Sent",
			RCode: lastCode
		});
	}

	return res.json({
		Status: "Fail",
		Return: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error,
		RPush: DateTime(),
		RStatus: "Fail",
		RCode: lastCode
	});
});

// Save Mkauth Messages
app.post('/message_mkauth', (req, res) => {
	const {
		database: define,
		message,
		token,
		select
	} = req.body;

	if (![Password[0], Password[1]].includes(Token)) {
		return res.json({
			Status: "Fail"
		});
	}

	if (!server || !message) {
		return res.json({
			Status: "Fail"
		});
	}

	db.run(`UPDATE message SET ${define} = ? WHERE id = ?`, [message, select], (err) => {
		if (err) {
			return res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').datafail
			});
		}
		res.json({
			Status: "Success",
			Return: Debug('CONSOLE').datasave
		});
	});
});




app.post('/sqlite-options', (req, res) => {
	const Interval = req.body.interval;
	const Sleep = req.body.sleep;
	const Sendwait = req.body.sendwait;
	const Access = req.body.access;
	const Pixfail = req.body.pixfail;
	var Response = req.body.response;
	var Call = req.body.call;
	const Replyes = req.body.replyes;
	const Alert = req.body.alert;
	const Onbot = req.body.onbot;
	const Reject = req.body.reject;
	const Count = req.body.count;
	const Token = req.body.token;
	const Limiter = req.body.limiter;

	const Reboot = (Access != Debug('OPTIONS').access);

	if (Response == "") {
		Response = Debug('OPTIONS').response;
	}

	if (![Password[0], Password[1]].includes(Token)) {
		if (!res.headersSent) {
			return res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').wrong
			});
		}
		return;
	}

	if (Interval != "" && Sleep != "" && Sendwait != "" && Access != "" && Pixfail != "" && Count != "" && Limiter != "") {
		db.run(
			"UPDATE options SET interval=?, sendwait=?, access=?, pixfail=?, response=?, replyes=?, onbot=?, count=?, limiter=?, sleep=?, call=?, reject=?, alert=?",
			[Interval, Sendwait, Access, Pixfail, Response, Replyes, Onbot, Count, Limiter, Sleep, Call, Reject, Alert],
			(err) => {
				if (res.headersSent) return;

				if (err) {
					return res.json({
						Status: "Fail",
						Return: Debug('CONSOLE').failed
					});
				}

				global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').settings);

				res.json({
					Status: "Success",
					Return: Debug('CONSOLE').settings,
					Port: Access
				});

				session = false;

				if (Reboot) {
					global.io.emit('Reset', true);
					delay(0).then(async function() {
						await exec('npm run restart:mwsm');
					});
				}
			}
		);
	} else {
		if (!res.headersSent) {
			return res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').unnamed
			});
		}
	}
});

// Send From Mikrotik
app.get('/mikrotik/:pass/:to/:msg', async (req, res) => {
	const {
		to,
		msg,
		pass
	} = req.params;

	let isHid;
	if (Boolean(Debug('OPTIONS').protect)) {
		isHid = pass;
	} else {
		isHid = (!Debug('OPTIONS').token || Debug('OPTIONS').protect === undefined) ?
			Password[1] :
			Debug('OPTIONS').token;
	}

	const Json = JSON.stringify({
		"Mwsm": "/mikrotik",
		"Main": "Mikrotik",
		"Start": DateTime()
	});
	console.error(Print.bg.blue, Print.fg.white, Json, Print.reset);

	let Contact = DDISet(to);
	if (typeof Playground !== 'undefined' && validPhone(Playground)) {
		Contact = DDISet(Playground);
	}

	if (![Debug('OPTIONS').token, Password[1]].includes(isHid) || !validPhone(Contact)) {
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
		return res.status(500).json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
		});
	}

	try {
		const numberDetails = await client.getNumberId(Contact);
		if (!numberDetails) {
			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').numberfail);
			return res.status(400).json({
				Status: "Fail",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').numberfail
			});
		}
		const WhatsApp = numberDetails._serialized;

		const interval = Math.floor((Debug('OPTIONS').interval || 1000) + Math.random() * 1000);
		await new Promise(resolve => setTimeout(resolve, interval));

		await client.sendMessage(WhatsApp, msg);

		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success);
		return res.json({
			Status: "Success",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
		});

	} catch (err) {
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error, err);
		WwjsVersion(false);
		return res.status(500).json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
		});
	}
});


// Force Message
app.post('/force-message', [
	body('p').notEmpty(),
	body('to').notEmpty(),
	body('msg').notEmpty(),
], async (req, res) => {
	const errors = validationResult(req).formatWith(({
		msg
	}) => msg);

	if (!errors.isEmpty()) {
		return res.status(422).json({
			Status: "Fail",
			message: errors.mapped()
		});
	}

	let Json = {
		"Mwsm": "/force-message",
		"Main": "Mwsm",
		"Start": DateTime()
	};
	if (typeof Json === 'object') {
		Json = JSON.stringify(Json);
	}
	console.error(Print.bg.blue, Print.fg.white, Json, Print.reset);

	var isHid;
	if (Boolean(Debug('OPTIONS').protect)) {
		if (req.body.pass != undefined) {
			isHid = req.body.pass;
		} else if (req.body.p != undefined) {
			isHid = req.body.p;
		} else {
			isHid = '';
		}
	} else {
		if ((Debug('OPTIONS').token == "" || Debug('OPTIONS').protect == undefined)) {
			isHid = Password[1];
		} else {
			isHid = (Debug('OPTIONS').token);
		}
	}

	var Contact = DDISet(req.body.to);
	if (typeof Playground !== 'undefined' && validPhone(Playground)) {
		Contact = DDISet(Playground);
	}

	if (![Debug('OPTIONS').token, Password[1]].includes(isHid) || !validPhone(Contact)) {
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
		return res.status(401).json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
		});
	}

	try {
		const numberDetails = await client.getNumberId(Contact);
		if (!numberDetails) {
			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').numberfail);
			return res.status(400).json({
				Status: "Fail",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').numberfail
			});
		}
		var WhatsApp = numberDetails._serialized;

		const Mensagem = (req.body.msg).replaceAll("\\n", "\r\n").split("##");
		const Reconstructor = new Promise(async (resolve) => {
			const mediaItems = Mensagem.filter(Send =>
				Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))
			);

			if (mediaItems.length > 0) {
				var ArrayData = {};

				const Cloud = async (mediaUrl) => {
					let mimetype;
					const attachment = await axios.get(mediaUrl, {
						responseType: 'arraybuffer'
					}).then(response => {
						mimetype = response.headers['content-type'];
						return response.data.toString('base64');
					});
					return new MessageMedia(mimetype, attachment, 'Media');
				};

				await Promise.all(
					mediaItems.map(async (Send) => {
						try {
							ArrayData[Send] = await Cloud(Send);
						} catch (err) {
							console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').mediafail);
						}
					})
				);

				resolve(ArrayData);
			} else {
				resolve(undefined);
			}
		});

		const Retorno = await Reconstructor;
		var Assembly = [];

		Mensagem.forEach(function(Send) {
			if (Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))) {
				if (Retorno && Retorno.hasOwnProperty(Send)) {
					Assembly.push(Retorno[Send]);
				}
			} else {
				Assembly.push(Send);
			}
		});

		const interval = Debug('OPTIONS').interval || 1000;

		for (let i = 0; i < Assembly.length; i++) {
			const item = Assembly[i];
			var Preview = false;
			var Caption = "Media";

			await client.sendMessage(WhatsApp, isEmoji(item), {
				caption: Caption,
				linkPreview: Preview
			});

			if (i < Assembly.length - 1) {
				await new Promise(resolve => setTimeout(resolve, interval));
			}
		}

		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success);
		return res.json({
			Status: "Success",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
		});

	} catch (err) {
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error, err);
		return res.status(500).json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
		});
	}
});




// WebHook
app.post('/WebHook', async (req, res) => {
	const {
		secret: Secret,
		status: RawStatus,
		token: Token
	} = req.body;

	if (![Password[0], Password[1]].includes(Token)) {
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
		});
	}

	let isStatusActive = false;
	try {
		isStatusActive = Boolean(JSON.parse(RawStatus));
	} catch (e) {
		isStatusActive = Boolean(RawStatus) && RawStatus !== 'false' && RawStatus !== '0';
	}

	if (!isStatusActive) {
		try {
			await Dataset('MKAUTH', 'WEBHOOK', '', 'UPDATE');
			await Dataset('MKAUTH', 'WHSTATUS', 'false', 'UPDATE');

			return res.json({
				Status: "Success",
				Return: Debug('CONSOLE').settings
			});
		} catch (dataErr) {
			return res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').failed
			});
		}
	}

	if (!Secret || Secret.trim() === '') {
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
		});
	}

	const WebhookURL = `${req.protocol}://${req.get('host')}/webhook/mkauth`;

	let ConnAuth = false;
	let ResAuth = false;

	try {
		const testPayload = JSON.stringify({
			event: 'ping',
			test: true
		});
		const signature = crypto
			.createHmac('sha256', Secret)
			.update(testPayload)
			.digest('hex');

		const testResponse = await axios.post(WebhookURL, testPayload, {
			headers: {
				'Content-Type': 'application/json',
				'x-webhook-signature': signature
			},
			timeout: 5000
		}).catch((axiosErr) => {
			return null;
		});

		if (!testResponse || testResponse.status !== 200) {
			Terminal({
				WebHook: [{
					Authentication: "false",
					Communication: "false"
				}]
			});

			return res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').refused
			});
		}

		ConnAuth = true;

		if (testResponse.data && (testResponse.data.status === 'Success' || testResponse.data.status === 'ignored')) {
			ResAuth = true;
		}

		if (!ResAuth) {
			return res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').mkfail
			});
		}

		await Dataset('MKAUTH', 'WEBHOOK', Secret, 'UPDATE');
		await Dataset('MKAUTH', 'WHSTATUS', 'true', 'UPDATE');

		Terminal({
			WebHook: [{
				Authentication: String(ConnAuth),
				Communication: String(ResAuth)
			}]
		});

		return res.json({
			Status: "Success",
			Return: Debug('CONSOLE').mksuccess
		});

	} catch (err) {
		Terminal({
			WebHook: [{
				Authentication: String(ConnAuth),
				Communication: String(ResAuth)
			}]
		});

		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').failed
		});
	}
});


app.post('/engine', async (req, res) => {
	const Token = req.body?.token || req.headers?.authorization;

	if ([Password[0], Password[1]].includes(Token)) {
		try {
			const {
				keygen,
				engine
			} = req.body;

			if (!engine) {
				return res.json({
					Status: "Fail"
				});
			}
			const success = await broadcastPanelStats(engine, keygen || null);

			if (!success) {
				return res.json({
					Status: "Fail"
				});
			}

			return res.json({
				Status: "Success"
			});

		} catch (err) {
			return res.json({
				Status: "Fail"
			});
		}
	} else {
		return res.json({
			Status: "Fail"
		});
	}
});

// Endpoint Ask AI
app.post('/askai', async (req, res) => {
	const {
		keygen,
		mwsmhost,
		mwsmport,
		aimode,
		uf,
		prompt,
		threshold,
		aitimeout,
		maxknowledge,
		engine,
		active,
		token: Token
	} = req.body;

	if (![Password[0], Password[1]].includes(Token)) {
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
		});
	}

	const isActive = String(active) === 'true' || active === true || active === 1;

	if (!isActive) {
		db.run("UPDATE engine SET active = 0", [], (err) => {
			if (err) {
				return res.json({
					Status: "Fail",
					Return: Debug('CONSOLE').failed
				});
			}
			return res.json({
				Status: "Success",
				Return: Debug('CONSOLE').openrouter
			});
		});
		return;
	}

	try {
		const updateOptionsQuery = `
			UPDATE options 
			SET keygen = ?, mwsmhost = ?, mwsmport = ?, aimode = ?, timezone = ?, prompt = ?, threshold = ?, aitimeout = ?, maxknowledge = ?, engine = ?
		`;

		db.run(
			updateOptionsQuery,
			[keygen, mwsmhost, mwsmport, aimode, uf, prompt, threshold, aitimeout, maxknowledge, engine],
			function(err) {
				if (err) {
					return res.json({
						Status: "Fail",
						Return: Debug('CONSOLE').failed
					});
				}

				db.run("UPDATE engine SET active = 0", [], function(err) {
					if (err) {
						return res.json({
							Status: "Fail",
							Return: Debug('CONSOLE').failed
						});
					}

					db.run("UPDATE engine SET active = 1 WHERE title = ?", [engine], function(err) {
						if (err) {
							return res.json({
								Status: "Fail",
								Return: Debug('CONSOLE').failed
							});
						}

						return res.json({
							Status: "Success",
							Return: Debug('CONSOLE').openrouter
						});
					});
				});
			}
		);
	} catch (err) {
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').failed
		});
	}
});


// Link Mkauth
app.post('/link_mkauth', async (req, res) => {
	const {
		username: User,
		password: Pass,
		domain: Domain,
		tunel: Tunel,
		module: Module,
		token: Token,
		server: Server,
		mode: Mode
	} = req.body;

	if (![Password[0], Password[1]].includes(Token)) {
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
		});
	}

	const iServer = Server === "tunel" ? Tunel : Domain;

	let ConnAuth = false;
	let ResAuth = false;

	try {
		const authResponse = await axios.get(`https://${iServer}/api/`, {
			auth: {
				username: User,
				password: Pass
			}
		}).catch(() => null);

		const Authentication = authResponse?.data;

		if (!Authentication) {
			Terminal({
				MkAuth: [{
					Authentication: "false",
					Communication: "false"
				}]
			});
			return res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').mkfail
			});
		}

		ConnAuth = true;

		const syncResponse = await axios.get(`https://${iServer}/api/titulo/listar/limite=1&pagina=1`, {
			headers: {
				'Authorization': `Bearer ${Authentication}`
			}
		}).catch(() => null);

		const MkSync = syncResponse?.data;

		if (!MkSync || MkSync.error !== undefined) {
			Terminal({
				MkAuth: [{
					Authentication: String(ConnAuth),
					Communication: "false"
				}]
			});
			return res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').refused
			});
		}

		ResAuth = true;

		db.run(
			"UPDATE mkauth SET client_id=?, client_secret=?, domain=?, tunel=?, mode=?, module=?, client_link=?",
			[User, Pass, Domain, Tunel, Mode, Module, Server],
			(err) => {
				Terminal({
					MkAuth: [{
						Authentication: String(ConnAuth),
						Communication: String(ResAuth)
					}]
				});

				if (err) {
					return res.json({
						Status: "Fail",
						Return: Debug('CONSOLE').failed
					});
				}
				res.json({
					Status: "Success",
					Return: Debug('CONSOLE').mksuccess
				});
			}
		);

	} catch (err) {
		Terminal({
			MkAuth: [{
				Authentication: String(ConnAuth),
				Communication: String(ResAuth)
			}]
		});
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').failed
		});
	}
});


// Send Image
app.post('/send-image', [
	body('pass').notEmpty(),
	body('to').notEmpty(),
	body('image').notEmpty(),
], async (req, res) => {
	const errors = validationResult(req).formatWith(({
		msg
	}) => msg);

	if (!errors.isEmpty()) {
		return res.status(422).json({
			Status: "Fail",
			message: errors.mapped()
		});
	}

	const hasCaption = req.body.caption;
	const hasMimetype = req.body.mimetype;
	var isHid;

	let Json = {
		"Mwsm": "/send-image",
		"Main": "MkAuth",
		"Start": DateTime()
	};
	if (typeof Json === 'object') {
		Json = JSON.stringify(Json);
	}
	console.error(Print.bg.blue, Print.fg.white, Json, Print.reset);

	if (!Boolean(Debug('MKAUTH').aimbot)) {

		if (Boolean(Debug('OPTIONS').protect)) {
			if (req.body.pass != undefined) {
				isHid = req.body.pass;
			} else if (req.body.p != undefined) {
				isHid = req.body.p;
			} else {
				isHid = '';
			}
		} else {
			if ((Debug('OPTIONS').token == "" || Debug('OPTIONS').protect == undefined)) {
				isHid = Password[1];
			} else {
				isHid = (Debug('OPTIONS').token);
			}
		}

		var Contact = DDISet(req.body.to);
		if (typeof Playground !== 'undefined' && validPhone(Playground)) {
			Contact = DDISet(Playground);
		}

		if (![Debug('OPTIONS').token, Password[1]].includes(isHid) || !validPhone(Contact)) {
			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
			return res.status(401).json({
				Status: "Fail",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
			});
		}

		try {
			const numberDetails = await client.getNumberId(Contact);
			if (!numberDetails) {
				console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').numberfail);
				return res.status(400).json({
					Status: "Fail",
					message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').numberfail
				});
			}

			const WhatsApp = numberDetails._serialized;

			const Mensagem = new MessageMedia(hasMimetype, req.body.image, 'Media');

			await client.sendMessage(WhatsApp, Mensagem, {
				caption: hasCaption,
				linkPreview: false
			});

			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success);
			return res.json({
				Status: "Success",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
			});

		} catch (err) {
			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error, err);
			if (typeof WwjsVersion === 'function') WwjsVersion(false);

			return res.status(500).json({
				Status: "Fail",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
			});
		}

	} else {
		if (global.io) {
			global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger);
		}
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger);

		return res.status(500).json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger
		});
	}
});

// Send Document
app.post('/send-document', [
	body('pass').notEmpty(),
	body('to').notEmpty(),
	body('document').notEmpty(),
], async (req, res) => {
	const errors = validationResult(req).formatWith(({
		msg
	}) => msg);

	if (!errors.isEmpty()) {
		return res.status(422).json({
			Status: "Fail",
			message: errors.mapped()
		});
	}

	const hasCaption = req.body.caption;
	const hasMimetype = req.body.mimetype;
	const hasFileName = req.body.filename;
	var isHid;

	let Json = {
		"Mwsm": "/send-document",
		"Main": "MkAuth",
		"Start": DateTime()
	};
	if (typeof Json === 'object') {
		Json = JSON.stringify(Json);
	}
	console.error(Print.bg.blue, Print.fg.white, Json, Print.reset);

	if (!Boolean(Debug('MKAUTH').aimbot)) {

		if (Boolean(Debug('OPTIONS').protect)) {
			if (req.body.pass != undefined) {
				isHid = req.body.pass;
			} else if (req.body.p != undefined) {
				isHid = req.body.p;
			} else {
				isHid = '';
			}
		} else {
			if ((Debug('OPTIONS').token == "" || Debug('OPTIONS').protect == undefined)) {
				isHid = Password[1];
			} else {
				isHid = (Debug('OPTIONS').token);
			}
		}

		var Contact = DDISet(req.body.to);
		if (typeof Playground !== 'undefined' && validPhone(Playground)) {
			Contact = DDISet(Playground);
		}

		if (![Debug('OPTIONS').token, Password[1]].includes(isHid) || !validPhone(Contact)) {
			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
			return res.status(401).json({
				Status: "Fail",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
			});
		}

		try {
			const numberDetails = await client.getNumberId(Contact);
			if (!numberDetails) {
				console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').numberfail);
				return res.status(400).json({
					Status: "Fail",
					message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').numberfail
				});
			}

			const WhatsApp = numberDetails._serialized;

			const Mensagem = new MessageMedia(hasMimetype, req.body.document, hasFileName);

			await client.sendMessage(WhatsApp, Mensagem, {
				caption: hasCaption,
				linkPreview: false
			});

			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success);
			return res.json({
				Status: "Success",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
			});

		} catch (err) {
			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error, err);
			if (typeof WwjsVersion === 'function') WwjsVersion(false);

			return res.status(500).json({
				Status: "Fail",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
			});
		}

	} else {
		if (global.io) {
			global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger);
		}
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger);

		return res.status(500).json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger
		});
	}
});


// -------------------------------------------------------------
// HELPER 
// -------------------------------------------------------------
function getNextValidShiftMs() {
	const scheduler = Debug('SCHEDULER') || {};

	const minHour = Number(scheduler.min) || 8;
	const maxHour = Number(scheduler.max) || 22;

	let candidate = new Date();
	candidate.setMinutes(0, 0, 0);

	const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

	for (let i = 0; i < 24 * 14; i++) {
		const hour = candidate.getHours();

		if (candidate.getTime() > Date.now()) {

			const inRange = (hour >= minHour && hour < maxHour);

			const currentDay = weekDays[candidate.getDay()];
			const isDayAllowed = Boolean(scheduler[currentDay]);

			const isTurnoAllowed = isShift(hour);

			if (inRange && isDayAllowed && isTurnoAllowed) {
				console.log(`> [SCHEDULER OTIMIZADO] Próxima janela válida encontrada: ${candidate.toLocaleString('pt-BR')} (${currentDay.toUpperCase()})`);
				return candidate.getTime() - Date.now();
			}
		}

		candidate.setHours(candidate.getHours() + 1);
	}

	const fallback = new Date();
	fallback.setDate(fallback.getDate() + 1);
	fallback.setHours(minHour, 0, 0, 0);
	return fallback.getTime() - Date.now();
}

function getMsUntilMinShift() {
	const minHour = Number(Debug('SCHEDULER')?.min) || 8;

	const now = new Date();
	const target = new Date(now);

	target.setHours(minHour, 0, 0, 0);

	if (now >= target) {
		target.setDate(target.getDate() + 1);
	}

	return target.getTime() - now.getTime();
}

// -------------------------------------------------------------
// WORKER 
// -------------------------------------------------------------
const REGEX_PIX_EMV = /^000201.*br\.gov\.bcb\.pix/i;

function ensureMessageMedia(item) {
	if (!item) return item;
	if (typeof item === 'string') return item;

	if (item instanceof MessageMedia && item.mimetype && item.data) {
		item.isMedia = true;
		return item;
	}

	if (typeof item === 'object' && item.mimetype && item.data) {
		let cleanData = String(item.data);
		if (cleanData.includes(';base64,')) {
			cleanData = cleanData.split(';base64,')[1];
		}

		const filename = item.filename || 'Media';
		const media = new MessageMedia(item.mimetype, cleanData, filename);

		Object.setPrototypeOf(media, MessageMedia.prototype);
		media.isMedia = true;
		if (!media.filename) media.filename = filename;

		return media;
	}

	return item;
}

const worker = new Worker('Row', async (job) => {
	const jobData = job.data || {};
	const {
		to,
		msg,
		auth,
		user,
		send,
		simulator,
		pass,
		p,
		priority,
		code
	} = job.data;

	const isAimbotEnabled = Boolean(Debug('MKAUTH').aimbot);

	if (isAimbotEnabled) {
		const msgPriority = Number(priority) || 4;
		const dateTimeNow = DateTime(0);
		const currentHour = Number((dateTimeNow.split(" ")[1]).split(":")[0]);

		const minHour = Number(Debug('SCHEDULER')?.min) || 8;
		const maxHour = Number(Debug('SCHEDULER')?.max) || 22;
		const isShiftActive = Boolean(Debug('SCHEDULER')?.shift);

		let shouldWait = false;
		let waitReason = "";
		let customDelayMs = null;

		const isMadrugada = (currentHour >= 0 && currentHour < 3) && !(validPhone(Playground) && Initialize);

		if (isMadrugada) {
			shouldWait = true;
			waitReason = `Sistema em atualização / Madrugada (00:00 - 02:59).`;

			if (msgPriority < 4) {
				const target3AM = new Date();
				target3AM.setHours(3, 0, 5, 0);

				if (Date.now() >= target3AM.getTime()) {
					target3AM.setDate(target3AM.getDate() + 1);
				}

				customDelayMs = target3AM.getTime() - Date.now();
			}
		} else if (msgPriority === 4) {
			const isBusinessHours = isShiftActive ?
				(currentHour >= minHour && currentHour < maxHour) :
				(((isWeek(dateTimeNow)) && (isShift(currentHour))) || (validPhone(Playground) && Initialize));

			if (!isBusinessHours) {
				shouldWait = true;
				waitReason = `Cobrança (Prioridade ${msgPriority}) fora do horário permitido (${minHour}h às ${maxHour}h).`;
			}
		}

		if (shouldWait) {
			const delayMs = customDelayMs !== null ? customDelayMs : (
				typeof getNextValidShiftMs === 'function' ? getNextValidShiftMs() : getMsUntilMinShift()
			);

			delete job.data.pass;
			delete job.data.p;
			delete job.data.simulator;
			delete job.data.token;

			await job.updateData(job.data);

			const timestampAlvo = Date.now() + delayMs;
			await job.moveToDelayed(timestampAlvo, job.token);
			throw new DelayedError();
		}
	}

	const isFromDelayed = job.attemptsMade > 0;

	let isHid;
	if (!isFromDelayed && Boolean(Debug('OPTIONS').protect)) {
		if (pass !== undefined) {
			isHid = pass;
		} else if (p !== undefined) {
			isHid = p;
		} else {
			isHid = '';
		}
	} else {
		if (Debug('OPTIONS').token === "" || Debug('OPTIONS').protect === undefined) {
			isHid = Password[1];
		} else {
			isHid = Debug('OPTIONS').token;
		}
	}

	let isAuth = isFromDelayed ? true : auth;
	let inCall = to;
	if (typeof Playground !== 'undefined' && validPhone(Playground)) {
		inCall = DDISet(Playground);
	}

	const isUser = user;
	const isSend = send;
	const Simulator = simulator;

	const Contact = DDISet(inCall);
	const cleanTarget = Contact.replace(/\D/g, '').replace(/^55/, '');
	const Manager = (Boolean(Debug('MKAUTH').aimbot) === Boolean(isAuth)) ? "Mwsm" : "MkAuth";

	if (!Boolean(Debug('MKAUTH').aimbot)) {
		isAuth = true;
	}

	const cleanJobData = async () => {
		try {
			delete job.data.pass;
			delete job.data.p;
			delete job.data.auth;
			delete job.data.simulator;
			await job.updateData(job.data);
		} catch (e) {}
	};

	if (Boolean(isAuth) && validPhone(Contact)) {
		const Mensagem = msg.replaceAll("\\n", "\r\n").split("##");
		const FUNCTION = [Debug('MKAUTH').bar, Debug('MKAUTH').pix, Debug('MKAUTH').qrpix, Debug('MKAUTH').qrlink, Debug('MKAUTH').pdf];

		const startTime = DateTime();
		let uID = await Dataset('TARGET', 'START', startTime, 'INSERT');
		if (uID === false) {
			uID = Debug('TARGET').id;
		}

		const Constructor = new Promise(async (resolve) => {
			let ArrayData = [];
			let Radeon = {
				Title: 'xxx',
				Name: 'Mwsm'
			};
			let RETURNS = [];

			if (isUser !== undefined) Radeon.Name = isUser;
			if (isSend !== undefined) Radeon.Title = isSend;

			const hasJson = Mensagem.some(Row => testJSON(Row));
			const isFuncEnabled = FUNCTION.includes('true') || FUNCTION.includes('1');

			if (hasJson && isFuncEnabled && Boolean(Debug('MKAUTH').module)) {
				for (const Send of Mensagem) {
					if (testJSON(Send)) {
						let ParsedJson = Send.toString().replace('"', '').split(',');
						let isUid = ParsedJson[0].replace(/[{\}\\"]/g, '');
						if (isUid.split(':').length === 2) {
							isUid = isUid.split(':')[1];
						} else {
							isUid = isUid.replace(isUid.split(':')[0], '').replace(/^:+/, '');
						}
						let isFind = ParsedJson[1].replace(/[^0-9]/g, '');

						try {
							const Synchronization = await MkAuth(isUid, isFind);

							if (Boolean(Debug('MKAUTH').bar)) RETURNS.push('Bar');
							if (Boolean(Debug('MKAUTH').pix)) RETURNS.push('Pix');
							if (Boolean(Debug('MKAUTH').qrpix)) RETURNS.push('QRCode');
							if (Boolean(Debug('MKAUTH').qrlink)) RETURNS.push('Link');
							if (Boolean(Debug('MKAUTH').pdf)) RETURNS.push('Boleto');

							if (Synchronization.ID !== undefined) {
								Radeon.Title = Synchronization.ID;
								Radeon.Name = Synchronization.Authority;
								await link.prepare("UPDATE target SET title=? WHERE id=?").run(Synchronization.ID, uID);
							}

							if (!["pago", "paid", "Error", "Null"].includes(Synchronization.Status)) {
								if (Array.isArray(Synchronization.Payments)) {
									Synchronization.Payments.forEach((GET) => {
										if (RETURNS.includes(GET.caption)) {
											let SendData = GET.value;
											if (GET.caption === 'QRCode') {
												SendData = ensureMessageMedia(new MessageMedia('image/png', GET.value, GET.caption));
											}
											if (SendData !== '') ArrayData.push(SendData);
										}
									});
								}
								Radeon.Message = ArrayData;
							} else {
								Radeon.Message = Synchronization.Status === "Error" ? "Error" : (Synchronization.Status === "Null" ? "Null" : "Fail");
							}
						} catch (err) {
							Radeon.Message = false;
						}
						break;
					}
				}
				resolve(Radeon);
			} else {
				resolve(Radeon);
			}
		});

		const Reconstructor = new Promise(async (resolve) => {
			const mediaItems = Mensagem.filter(Send =>
				Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))
			);

			if (mediaItems.length > 0) {
				let isArray = {};
				const Cloud = async (mediaUrl) => {
					const response = await axios.get(mediaUrl, {
						responseType: 'arraybuffer'
					});
					const mimetype = response.headers['content-type'];
					const attachment = Buffer.from(response.data).toString('base64');
					return ensureMessageMedia(new MessageMedia(mimetype, attachment, 'Media'));
				};

				await Promise.all(mediaItems.map(async (Send) => {
					try {
						isArray[Send] = await Cloud(Send);
					} catch (err) {}
				}));
				resolve(isArray);
			} else {
				resolve(undefined);
			}
		});

		let WhatsApp;
		try {
			const numberDetails = await client.getNumberId(Contact);
			if (!numberDetails) {
				await cleanJobData();
				const failMsg = Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').numberfail;
				throw new Error(failMsg);
			}
			WhatsApp = numberDetails._serialized || `${Contact.replace(/\D/g, '')}@c.us`;
		} catch (err) {
			await cleanJobData();
			throw new Error(err.message || (Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error));
		}

		const Retorno = await Promise.all([Constructor, Reconstructor]);

		const invalidMessages = ["Fail", "False", "Fatal", false, "Error", "Null"];
		let Boleto, PDF2Base64;

		if (Retorno[0].Message !== undefined && !invalidMessages.includes(Retorno[0].Message)) {
			for (let i = 0; i < Retorno[0].Message.length; i++) {
				if (typeof Retorno[0].Message[i] === 'string') {
					if (Retorno[0].Message[i].indexOf("boleto.hhvm") > -1) {
						const UID = Retorno[0].Message[i].split("=")[1];
						Boleto = await Build(Retorno[0].Message[i]);

						PDF2Base64 = await new Promise((resolve) => {
							if (Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Boleto.includes(Row))) {
								const Cloud = async (Url) => {
									let mimetype;
									const attachment = await axios.get(Url, {
										responseType: 'arraybuffer'
									}).then(response => {
										mimetype = response.headers['content-type'];
										return response.data.toString('base64');
									});
									return new MessageMedia(mimetype, attachment, 'Fatura');
								};

								Cloud(Boleto).then(Return => {
									resolve(Return);
								}).catch(err => {
									resolve(undefined);
								});
							} else {
								resolve(undefined);
							}
						});

						if (await PDF2Base64) {
							Retorno[0].Message[i] = await PDF2Base64;
						}

						if (fs.existsSync(__dirname + "/" + UID + ".pdf")) {
							try {
								fs.unlinkSync(__dirname + "/" + UID + ".pdf");
							} catch (e) {}
						}
					}
				}
			}
		}

		let Assembly = [];
		Mensagem.forEach((Send) => {
			if (testJSON(Send)) {
				if (Retorno[0].Message !== undefined && !invalidMessages.includes(Retorno[0].Message)) {
					Retorno[0].Message.forEach(m => Assembly.push(m));
				}
			} else if (Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))) {
				if (Retorno[1] && Retorno[1][Send]) {
					Assembly.push(Retorno[1][Send]);
				} else if (typeof Send !== 'string') {
					Assembly.push(Send);
				}
			} else {
				Assembly.push(Send);
			}
		});

		let targetFormatted = cleanTarget;
		let tClean = String(targetFormatted || '').replace(/\D/g, '');
		if (tClean.length === 11) {
			targetFormatted = `(${tClean.slice(0, 2)}) ${tClean.slice(2, 3)} ${tClean.slice(3, 7)}-${tClean.slice(7)}`;
		} else if (tClean.length === 10) {
			targetFormatted = `(${tClean.slice(0, 2)}) ${tClean.slice(2, 6)}-${tClean.slice(6)}`;
		}

		if (Assembly.length >= 1 && !invalidMessages.includes(Retorno[0].Message)) {
			let SendWaitDelay = 300;
			if (typeof global.Wait !== 'undefined' && cleanTarget !== global.Wait) {
				SendWaitDelay = Debug('OPTIONS').sendwait !== undefined ? Number(Debug('OPTIONS').sendwait) : 30000;
			}

			const TotalSendWait = Math.floor(SendWaitDelay + Math.random() * 1000);
			await new Promise(r => setTimeout(r, TotalSendWait));

			const itemInterval = Debug('OPTIONS').interval !== undefined ? Number(Debug('OPTIONS').interval) : 1000;
			let DoubleKill;
			let sendFailed = false;
			let sendErrorMessage = "";

			const isTokenAuthorized = isFromDelayed || [Debug('OPTIONS').token, Password[1]].includes(isHid);

			if (!isTokenAuthorized) {
				await cleanJobData();
				throw new Error("Token de autenticação/segurança inválido ou não autorizado.");
			}

			for (let index = 0; index < Assembly.length; index++) {
				let Send = Assembly[index];
				let Caption = undefined;
				let Preview = false;

				Send = ensureMessageMedia(Send);

				if (typeof Send === 'string' && Send.includes("http")) {
					Preview = true;
				}

				let payloadToSend = (typeof Send === 'string') ? isEmoji(Send) : Send;
				const isPixCode = typeof payloadToSend === 'string' && REGEX_PIX_EMV.test(payloadToSend);

				if (isPixCode) {
					payloadToSend = payloadToSend.replace(/\./g, '.\u200B');
					Preview = false;
				}

				try {
					const sendOptions = {
						linkPreview: Preview
					};
					if (Caption) sendOptions.caption = Caption;

					if (Boolean(Debug('MKAUTH').prevent)) {
						if (DoubleKill !== Send) {
							await client.sendMessage(WhatsApp, payloadToSend, sendOptions);
							DoubleKill = Send;
						}
					} else {
						await client.sendMessage(WhatsApp, payloadToSend, sendOptions);
					}
				} catch (err) {
					sendFailed = true;
					sendErrorMessage = err.message || "Erro desconhecido na biblioteca do WhatsApp";
				}

				if (index < Assembly.length - 1) {
					await new Promise(r => setTimeout(r, itemInterval));
				}
			}

			global.Wait = cleanTarget;
			const finalTitle = Retorno[0].Title === "xxx" ? uID : Retorno[0].Title;
			const finalName = Retorno[0].Name;
			const endTime = DateTime();

			const finalStatus = sendFailed ? "Error" : "Sent";

			await link.prepare("UPDATE target SET end=?, status=?, target=?, title=?, client=? WHERE id=?")
				.run(endTime, finalStatus, cleanTarget, finalTitle, finalName, uID);

			if (global.io) {
				global.io.emit('setlog', [{
					"ID": uID,
					"TITLE": finalTitle,
					"NAME": finalName,
					"START": startTime,
					"END": endTime,
					"TARGET": targetFormatted,
					"STATUS": finalStatus
				}]);
				if (sendFailed) {
					global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
				}
			}

			await cleanJobData();

			if (sendFailed) {
				const errorReason = Debug('CONSOLE').error || sendErrorMessage || "Falha na entrega da mensagem pelo WhatsApp";
				throw new Error(errorReason);
			}

			return {
				Status: "Success",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
			};

		} else {
			let errorMessage = Debug('CONSOLE').refused;
			if (Retorno[0].Message === "Fail") errorMessage = Debug('CONSOLE').unavailable;
			if (Retorno[0].Message === "Error") errorMessage = Debug('CONSOLE').request;
			if (Retorno[0].Message === "Null") errorMessage = Debug('CONSOLE').missing;
			if (Retorno[0].Message === "Fatal") errorMessage = Debug('CONSOLE').mkfail;
			if (Retorno[0].Message === "False") errorMessage = Debug('CONSOLE').mkunselect;

			const failStatus = Retorno[0].Message || "Fail";
			const finalTitle = Retorno[0].Title === "xxx" ? uID : Retorno[0].Title;
			const finalName = Retorno[0].Name;
			const endTime = DateTime();

			await link.prepare("UPDATE target SET end=?, status=?, target=?, title=?, client=? WHERE id=?")
				.run(endTime, failStatus, cleanTarget, finalTitle, finalName, uID);

			if (global.io) {
				global.io.emit('setlog', [{
					"ID": uID,
					"TITLE": finalTitle,
					"NAME": finalName,
					"START": startTime,
					"END": endTime,
					"TARGET": targetFormatted,
					"STATUS": failStatus
				}]);
				global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
			}

			await cleanJobData();

			throw new Error(errorMessage || "Mensagem recusada ou dados indisponíveis.");
		}

	} else {
		if (global.io) {
			global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
		}

		await cleanJobData();

		const validationError = Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error;
		throw new Error(validationError);
	}
}, {
	connection,
	concurrency: 1,
	lockDuration: 120000,
	lockRenewTime: 30000,
	maxStalledCount: 2,
	skipVersionCheck: true
});

export {
	worker,
	messageQueue
};

const {
	createBullBoard
} = require('@bull-board/api');
const {
	BullMQAdapter
} = require('@bull-board/api/bullMQAdapter');
const {
	ExpressAdapter
} = require('@bull-board/express');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/panel');

// Send Message
app.post('/send-message', [
	body('to').notEmpty(),
	body('msg').notEmpty(),
	body().custom((value, {
		req
	}) => {
		const isProtectActive = Boolean(Debug('OPTIONS').protect);
		if (isProtectActive && !req.body.pass && !req.body.p) {
			throw new Error();
		}
		return true;
	})
], async (req, res) => {
	const startTime = Date.now();
	const clientIp = req.ip || req.connection?.remoteAddress;

	const sendLoggedResponse = (statusCode, responseData) => {
		const durationMs = Date.now() - startTime;
		return res.status(statusCode).json(responseData);
	};

	const errors = validationResult(req).formatWith(({
		msg
	}) => msg);

	if (!errors.isEmpty()) {
		return sendLoggedResponse(422, {
			Status: "Fail",
			message: errors.mapped()
		});
	}

	var isHid;
	if (Boolean(Debug('OPTIONS').protect)) {
		if (req.body.pass !== undefined) {
			isHid = req.body.pass;
		} else if (req.body.p !== undefined) {
			isHid = req.body.p;
		} else {
			isHid = '';
		}
	} else {
		if (Debug('OPTIONS').token === "" || Debug('OPTIONS').protect === undefined) {
			isHid = Password[1];
		} else {
			isHid = Debug('OPTIONS').token;
		}
	}

	var Contact = typeof DDISet === 'function' ? DDISet(req.body.to) : req.body.to;
	if (typeof Playground !== 'undefined' && typeof validPhone === 'function' && validPhone(Playground)) {
		Contact = typeof DDISet === 'function' ? DDISet(Playground) : Playground;
	}

	const isWid = String(Contact).replace(/[^0-9.]+/g, '');
	const isValidPhone = typeof validPhone === 'function' ? validPhone(isWid) : isWid.length >= 10;

	if (![Debug('OPTIONS').token, Password[1]].includes(isHid) || !isValidPhone) {
		return sendLoggedResponse(401, {
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
		});
	}

	let Json = {
		"Mwsm": "/send-message",
		"Main": "MkAuth",
		"Start": DateTime()
	};
	if (typeof Json === 'object') {
		Json = JSON.stringify(Json);
	}

	req.body.toFormatted = Contact;

	try {
		const job = await EnqueueWithPriority(req.body, 0, true);

		if (!job) {
			return sendLoggedResponse(200, {
				Status: "Success",
				message: `${Debug('OPTIONS').appname} : Mensagem/Cobrança para este título já enviada ou agendada hoje.`,
				duplicated: true
			});
		}

		return sendLoggedResponse(200, {
			Status: "Success",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').queue,
			jobId: job.id
		});

	} catch (err) {
		if (typeof WwjsVersion === 'function') WwjsVersion(false);

		return sendLoggedResponse(500, {
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').queuefail,
			error: err.message
		});
	}
});

// Html to PDF
app.get('/build', [
	body('uid').notEmpty()
], async (req, res) => {
	const errors = validationResult(req).formatWith(({
		uid
	}) => uid);

	if (!errors.isEmpty()) {
		return res.status(422).json({
			status: false,
			message: errors.mapped()
		});
	}

	const GET = req.body.uid;
	const parts = GET.split('=');
	const UID = parts[parts.length - 1];

	try {
		htmlPDF.setOptions({
			format: "A4",
			timeout: 5000
		});
		htmlPDF.setAutoCloseBrowser(false);

		const Buffer = await htmlPDF.create(GET);
		const Patch = `${__dirname}/${UID}.pdf`;
		await htmlPDF.writeFile(Buffer, Patch);

		res.json({
			Return: `http://${ip.address()}:${Debug('OPTIONS').access}/${UID}.pdf`
		});
	} catch (err) {
		res.status(500).json({
			status: false,
			message: Debug('CONSOLE').error || err.message
		});
	} finally {
		await htmlPDF.closeBrowser();
	}
});

const Build = async (SET) => {
	try {
		const response = await axios.get(`http://${ip.address()}:${Debug('OPTIONS').access}/build`, {
			data: {
				uid: SET
			}
		});
		return response.data?.Return || false;
	} catch (err) {
		return false;
	}
};



// ==================================================
// 🤖 WHATSAPP BOT — Atendimento Virtual (Jhow)
// ==================================================

const formatarDataBR = (strData) => {
	if (!strData) return "";
	const dataApenas = strData.split(" ")[0];
	if (dataApenas.includes("/")) return dataApenas;

	const partes = dataApenas.split("-");
	if (partes.length === 3) {
		const [ano, mes, dia] = partes;
		return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
	}
	return strData;
};

const ProcessarEMontarMensagemBot = async (boletoAlvo, dadosCliente, proximoBoleto = null, isVencido = false) => {
	try {
		const tituloId = boletoAlvo?.titulo || boletoAlvo?.id || boletoAlvo?.Identifier || "";
		if (!tituloId) return [];

		const respostaMkAuthList = await MkAuth('all', tituloId, 'list');

		let macCliente = "";
		if (Array.isArray(respostaMkAuthList) && respostaMkAuthList.length > 0) {
			macCliente = respostaMkAuthList[0].Connect || "";
		} else if (respostaMkAuthList?.Connect) {
			macCliente = respostaMkAuthList.Connect;
		}

		const nomeCompleto = dadosCliente?.Client ? dadosCliente.Client.trim().split(' ')[0] : "";
		const dataVenc = boletoAlvo?.vencimento ? formatarDataBR(boletoAlvo.vencimento) : "";
		const valorBoleto = boletoAlvo?.valor || boletoAlvo?.value || "0.00";

		const tituloStatus = isVencido ?
			"*1 Fatura Vencida*" :
			"*1 Fatura em Aberto*";

		let textoInicial = `Olá, *${nomeCompleto}*, encontramos ${tituloStatus} : \n• Vencimento: ${dataVenc}\n• Valor: R$ ${valorBoleto}\n*Seguem os dados para pagamento 👇*`;

		let templateMsg = `${textoInicial}##{"uid":"${macCliente}","find":"${tituloId}"}##`;

		if (proximoBoleto) {
			const dataProxVenc = formatarDataBR(proximoBoleto.vencimento);
			const valorProx = proximoBoleto.valor || proximoBoleto.value || "0.00";
			templateMsg += `📌 *Aviso:* Sua próxima fatura vence em *${dataProxVenc}* no valor de *R$ ${valorProx}*.`;
		}

		const MensagemParts = templateMsg.replaceAll("\\n", "\r\n").split("##");
		const FUNCTION = [Debug('MKAUTH').bar, Debug('MKAUTH').pix, Debug('MKAUTH').qrpix, Debug('MKAUTH').qrlink, Debug('MKAUTH').pdf];

		const Constructor = new Promise(async (resolve) => {
			let ArrayData = [];
			let Radeon = {
				Title: tituloId,
				Name: 'Mwsm',
				Message: []
			};
			let RETURNS = [];

			const hasJson = MensagemParts.some(Row => testJSON(Row));
			const isFuncEnabled = FUNCTION.includes('true') || FUNCTION.includes('1');

			if (hasJson && isFuncEnabled && Boolean(Debug('MKAUTH').module)) {
				for (const SendItem of MensagemParts) {
					if (testJSON(SendItem)) {
						let ParsedJson = SendItem.toString().replace('"', '').split(',');
						let isUid = ParsedJson[0].replace(/[{\}\\"]/g, '');
						if (isUid.split(':').length === 2) {
							isUid = isUid.split(':')[1];
						} else {
							isUid = isUid.replace(isUid.split(':')[0], '').replace(/^:+/, '');
						}
						let isFind = ParsedJson[1].replace(/[^0-9]/g, '');

						try {
							const Synchronization = await MkAuth(isUid, isFind);

							if (Boolean(Debug('MKAUTH').bar)) RETURNS.push('Bar');
							if (Boolean(Debug('MKAUTH').pix)) RETURNS.push('Pix');
							if (Boolean(Debug('MKAUTH').qrpix)) RETURNS.push('QRCode');
							if (Boolean(Debug('MKAUTH').qrlink)) RETURNS.push('Link');
							if (Boolean(Debug('MKAUTH').pdf)) RETURNS.push('Boleto');

							if (!["pago", "paid", "Error", "Null"].includes(Synchronization.Status)) {
								if (Array.isArray(Synchronization.Payments)) {
									Synchronization.Payments.forEach((GET) => {
										if (RETURNS.includes(GET.caption)) {
											let SendData = GET.value;
											if (GET.caption === 'QRCode') {
												SendData = ensureMessageMedia(new MessageMedia('image/png', GET.value, GET.caption));
											}
											if (SendData !== '') ArrayData.push(SendData);
										}
									});
								}
								Radeon.Message = ArrayData;
							} else {
								Radeon.Message = Synchronization.Status;
							}
						} catch (err) {
							Radeon.Message = false;
						}
						break;
					}
				}
				resolve(Radeon);
			} else {
				resolve(Radeon);
			}
		});

		const Reconstructor = new Promise(async (resolve) => {
			const mediaItems = MensagemParts.filter(Send =>
				Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))
			);

			if (mediaItems.length > 0) {
				let isArray = {};
				const Cloud = async (mediaUrl) => {
					const response = await axios.get(mediaUrl, {
						responseType: 'arraybuffer'
					});
					const mimetype = response.headers['content-type'];
					const attachment = Buffer.from(response.data).toString('base64');
					return ensureMessageMedia(new MessageMedia(mimetype, attachment, 'Media'));
				};

				await Promise.all(mediaItems.map(async (Send) => {
					try {
						isArray[Send] = await Cloud(Send);
					} catch (err) {}
				}));
				resolve(isArray);
			} else {
				resolve(undefined);
			}
		});

		const Retorno = await Promise.all([Constructor, Reconstructor]);

		const invalidMessages = ["Fail", "False", "Fatal", false, "Error", "Null"];
		let Boleto, PDF2Base64;

		if (Retorno[0].Message !== undefined && !invalidMessages.includes(Retorno[0].Message)) {
			for (let i = 0; i < Retorno[0].Message.length; i++) {
				if (typeof Retorno[0].Message[i] === 'string') {
					if (Retorno[0].Message[i].indexOf("boleto.hhvm") > -1) {
						const UID = Retorno[0].Message[i].split("=")[1];
						Boleto = await Build(Retorno[0].Message[i]);

						PDF2Base64 = await new Promise((resolve) => {
							if (Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Boleto.includes(Row))) {
								const Cloud = async (Url) => {
									let mimetype;
									const attachment = await axios.get(Url, {
										responseType: 'arraybuffer'
									}).then(response => {
										mimetype = response.headers['content-type'];
										return response.data.toString('base64');
									});
									return new MessageMedia(mimetype, attachment, 'Fatura');
								};

								Cloud(Boleto).then(Return => {
									resolve(Return);
								}).catch(err => {
									resolve(undefined);
								});
							} else {
								resolve(undefined);
							}
						});

						if (await PDF2Base64) {
							Retorno[0].Message[i] = await PDF2Base64;
						}

						if (fs.existsSync(__dirname + "/" + UID + ".pdf")) {
							try {
								fs.unlinkSync(__dirname + "/" + UID + ".pdf");
							} catch (e) {}
						}
					}
				}
			}
		}

		let Assembly = [];

		MensagemParts.forEach((Send) => {
			if (testJSON(Send)) {
				if (Retorno[0].Message !== undefined && !invalidMessages.includes(Retorno[0].Message)) {
					Retorno[0].Message.forEach(m => Assembly.push(m));
				}
			} else if (Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))) {
				if (Retorno[1] && Retorno[1][Send]) {
					Assembly.push(Retorno[1][Send]);
				} else if (typeof Send !== 'string') {
					Assembly.push(Send);
				}
			} else {
				if (Send && Send.trim() !== "") {
					Assembly.push(Send);
				}
			}
		});

		return Assembly;

	} catch (err) {
		return [];
	}
};

if (typeof activeSessions === 'undefined') global.activeSessions = new Map();
if (typeof activeSupportIA === 'undefined') global.activeSupportIA = new Map();

client.on('message', async msg => {
	try {
		if (msg.type.toLowerCase() === "e2e_notification") return null;
		if (!msg.body || msg.body.trim() === "") return null;
		if (msg.from.includes("@g.us")) return null;

		const userPhone = msg.from;
		const text = msg.body.trim();
		const lowerText = text.toLowerCase();

		const NULLED = [undefined, "XXX", null, ""];
		let isWid = msg.from.replace(/@.*/, '');
		const RegEx = new Set("!@#:$%^&*()_");
		for (let Return of isWid) {
			if (RegEx.has(Return)) {
				isWid = isWid.replace(Return, '%');
			}
		}
		isWid = isWid.split("%")[0];
		const WhatsApp = msg.from;
		const isWhatsApp = isWid;

		const isEngineActive = Boolean(Debug('ENGINE', 'ACTIVE', 'DIRECT', Debug('OPTIONS').engine)?.active);

		if (isEngineActive) {

			if (activeSupportIA.has(userPhone)) {
				const _iaExit = lowerText;

				if (["0", "sair", "tchau", "tchal", "encerrar", "cancelar"].includes(_iaExit)) {
					activeSupportIA.delete(userPhone);
					activeSessions.delete(userPhone);
					await client.sendMessage(userPhone, "✅ *Atendimento encerrado.* Obrigado pelo contato!");
					return;
				}

				if (_iaExit === "menu") {
					activeSupportIA.delete(userPhone);
					activeSessions.set(userPhone, {
						step: 'MENU'
					});
					const menuBoasVindas =
						`Olá! Sou o *Jhow*, seu atendente virtual. 🤖\n` +
						`Como posso te ajudar hoje?\n\n` +
						`1️⃣ Contratar um plano\n` +
						`2️⃣ Segunda via de fatura\n` +
						`3️⃣ Suporte técnico\n` +
						`0️⃣ Sair\n\n` +
						`👉 *Responda com o número da opção desejada:*`;

					await client.sendMessage(userPhone, menuBoasVindas);
					return;
				}

				try {
					const chat = await msg.getChat();
					const tLevel = parseInt(Debug('OPTIONS').typingspeed) || 3;
					const multiplier = 1 + (5 - tLevel) * 0.25;
					const baseTime = 800 * multiplier;
					const extraPerChar = 25 * multiplier;
					const maxTime = 4000 * multiplier;
					const estimatedDelay = Math.min(baseTime + msg.body.length * extraPerChar, maxTime);

					await chat.sendStateTyping();
					await new Promise(r => setTimeout(r, estimatedDelay));
					await chat.clearState();

					const reply = await askAI(msg.body);
					await client.sendMessage(userPhone, reply, {
						quotedMessageId: undefined
					});

				} catch (err) {
					try {
						const reply = await askAI(msg.body);
						await client.sendMessage(userPhone, reply, {
							quotedMessageId: undefined
						});
					} catch (e2) {}
				}
				return;
			}

			let session = activeSessions.get(userPhone);

			if (["0", "sair", "encerrar", "cancelar"].includes(lowerText)) {
				activeSessions.delete(userPhone);
				activeSupportIA.delete(userPhone);
				await client.sendMessage(userPhone, "✅ *Atendimento encerrado.* Obrigado pelo contato!");
				return;
			}

			if (!session) {
				activeSessions.set(userPhone, {
					step: 'MENU'
				});
				const menuBoasVindas =
					`Olá! Sou o *Jhow*, seu atendente virtual. 🤖\n` +
					`Como posso te ajudar hoje?\n\n` +
					`1️⃣ Contratar um plano\n` +
					`2️⃣ Segunda via de fatura\n` +
					`3️⃣ Suporte técnico\n` +
					`0️⃣ Sair\n\n` +
					`👉 *Responda com o nº da opção :*`;

				await client.sendMessage(userPhone, menuBoasVindas);
				return;
			}

			if (session.step === 'MENU') {
				if (text === '1') {
					await client.sendMessage(userPhone, "🛒 *Contratação de Planos*\n\nEm breve você poderá contratar diretamente por aqui.\n\n_Digite *0* para encerrar._");
					return;
				}

				if (text === '2') {
					session.step = 'AGUARDANDO_CPF';
					activeSessions.set(userPhone, session);
					await client.sendMessage(userPhone, "📄 *Segunda Via de Fatura*\n\nPor favor, digite o seu *CPF*:");
					return;
				}

				if (text === '3') {
					await client.sendMessage(userPhone, '🤖 Você está agora em atendimento de suporte com IA. Envie sua dúvida.');
					activeSupportIA.set(userPhone, true);
					return;
				}

				await client.sendMessage(userPhone, "⚠️ *Opção inválida.*\nResponda 1, 2, 3 ou 0.");
				return;
			}

			if (session.step === 'AGUARDANDO_CPF') {
				const cpfLimpo = text.replace(/\D/g, '');

				if (!/^\d{11}$/.test(cpfLimpo)) {
					await client.sendMessage(userPhone, "⚠️ *CPF inválido!* Digite os 11 números do seu CPF:");
					return;
				}

				await client.sendMessage(userPhone, "🔍 *Buscando faturas... Por favor, aguarde um instante.*");

				const chat = await msg.getChat();
				await chat.sendStateTyping();

				const resultado = await GetBoletosFiltrados(cpfLimpo);

				if (!resultado) {
					await chat.clearState();
					await client.sendMessage(userPhone, "❌ Nenhum cadastro encontrado para este CPF.\nPor favor, digite o CPF do titular\n\nEnvie *0* para sair.");
					return;
				}

				const temVencidos = resultado.Dados?.Due && resultado.Dados.Due.length > 0;
				const temAberto = !!resultado.Dados?.Open;

				const boletoAlvo = temVencidos ? resultado.Dados.Due[0] : (temAberto ? resultado.Dados.Open : null);
				const proximoBoleto = (temVencidos && temAberto) ? resultado.Dados.Open : null;

				if (!boletoAlvo) {
					await chat.clearState();
					await client.sendMessage(userPhone, `Olá *${resultado.Client}*, você não possui nenhuma fatura em aberto ou vencida! ✅`);
					session.step = 'MENU';
					activeSessions.set(userPhone, session);
					return;
				}

				const dadosCliente = {
					Client: resultado.Client,
					User: resultado.User || resultado.login || resultado.Login || ""
				};

				await chat.sendStateTyping();

				const itensParaEnviar = await ProcessarEMontarMensagemBot(boletoAlvo, dadosCliente, proximoBoleto, temVencidos);

				for (let i = 0; i < itensParaEnviar.length; i++) {
					await chat.sendStateTyping();

					let item = itensParaEnviar[i];
					const mediaItem = ensureMessageMedia(item);
					let payloadToSend = (typeof mediaItem === 'string') ? isEmoji(mediaItem) : mediaItem;

					const isPixCode = typeof payloadToSend === 'string' && REGEX_PIX_EMV.test(payloadToSend);

					if (isPixCode) {
						payloadToSend = payloadToSend.replace(/\./g, '.\u200B');
						await client.sendMessage(userPhone, payloadToSend, {
							linkPreview: false
						});
					} else {
						await client.sendMessage(userPhone, payloadToSend);
					}

					await new Promise(r => setTimeout(r, 1000));
				}

				await client.sendMessage(userPhone, "✅ *Atendimento encerrado.* Obrigado pelo contato!");
				await chat.clearState();
				activeSessions.delete(userPhone);
				return;
			}
		}

		if (msg.body.toUpperCase().includes("TOKEN") && NULLED.includes(Debug('OPTIONS').token)) {
			if (msg.body.includes(":") && (msg.body.split(":")[1].length === 7)) {
				db.run("UPDATE options SET token=?", [msg.body.split(":")[1]], (err) => {
					if (err) throw err;
					global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').saved);
					msg.reply(Debug('CONSOLE').saved);
					Password = [msg.body.split(":")[1], Password[1]];
				});
			} else {
				global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').wrong);
				msg.reply(Debug('CONSOLE').wrong);
			}
			return;
		}

		db.get("SELECT * FROM replies WHERE whats = ?", [isWhatsApp], (err, REPLIES) => {
			if (err) {
				return;
			}

			let MsgBox = false;
			const maxAllowed = parseInt(Debug('OPTIONS').count) || 0;

			if (!REPLIES) {
				db.run("INSERT INTO replies(whats, date, count) VALUES(?, ?, ?)", [isWhatsApp, register, 1], (err) => {
					global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').inserted);
				});
				MsgBox = true;
			} else {
				if (register.toString() > REPLIES.date) {
					db.run("UPDATE replies SET date=?, count=? WHERE whats=?", [register, 1, isWhatsApp], (err) => {
						global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').updated);
					});
					MsgBox = true;
				} else {
					if (maxAllowed > REPLIES.count) {
						const newCount = REPLIES.count + 1;
						db.run("UPDATE replies SET count=? WHERE whats=?", [newCount, isWhatsApp], (err) => {
							if (err) throw err;
							global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').updated);
						});
						MsgBox = true;
					} else {
						global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').found);
						MsgBox = false;
					}
				}
			}

			const isOnBot = Boolean(Debug('OPTIONS').onbot);
			const isReplyMode = Boolean(Debug('OPTIONS').replyes);
			const responseText = Debug('OPTIONS').response;

			if (MsgBox && isOnBot && responseText) {
				if (isReplyMode) {
					msg.reply(responseText);
				} else {
					sendChunkedMessage(client, WhatsApp, responseText);
				}
			}
		});

	} catch (globalErr) {}
});

client.on('call', async (call) => {
	var isWid = (call.from || '').split('@')[0];
	const RegEx = new Set("!@#:$%^&*()_");
	for (let Return of isWid) {
		if (RegEx.has(Return)) {
			isWid = isWid.replace(Return, '%');
		}
	}
	isWid = isWid.split("%")[0];
	var WhatsApp = call.from;

	const enviarAlertaCall = async () => {
		if (Boolean(Debug('OPTIONS').alert)) {
			const alertConfig = Debug('OPTIONS').call || "";
			const Mensagem = alertConfig.replaceAll("\\n", "\r\n").split("##");

			Mensagem.some(function(Send, index) {
				setTimeout(function() {
					client.sendMessage(WhatsApp, isEmoji(Send)).then().catch(err => {
						if (typeof WwjsVersion === 'function') WwjsVersion(false);
					});
				}, Math.floor((global.Delay || 2000) + Math.random() * 1000) * (index + 1));
			});
		}
	};

	if (Boolean(Debug('OPTIONS').reject)) {
		const sleepTime = Math.floor((Debug('OPTIONS').sleep || 1000) + Math.random() * 1000);

		setTimeout(async () => {
			try {
				await call.reject();
				await enviarAlertaCall();
			} catch (err) {
				try {
					await client.pupPage.evaluate(async (callDataId) => {
						if (window.WWebJS && typeof window.WWebJS.rejectCall === 'function') {
							return window.WWebJS.rejectCall(callDataId);
						}

						if (window.Store && window.Store.VoipInterop && typeof window.Store.VoipInterop.rejectCall === 'function') {
							return await window.Store.VoipInterop.rejectCall(callDataId);
						}

						if (window.Store && window.Store.CallCollection) {
							const activeCall = typeof window.Store.CallCollection.getActiveCall === 'function' ?
								window.Store.CallCollection.getActiveCall() :
								window.Store.CallCollection.get(callDataId);

							if (activeCall && typeof activeCall.reject === 'function') {
								return await activeCall.reject();
							}
						}
					}, call.id);

					await enviarAlertaCall();
				} catch (e) {
					console.error('> Call Reject Error:', e);
				}
			}
		}, sleepTime);
	}
});


const Port = process.env.PORT || Debug('OPTIONS').access;
const serverIp = ip.address();
serverAdapter.setBasePath('/panel');



createBullBoard({
	queues: [new BullMQAdapter(messageQueue)],
	serverAdapter: serverAdapter,
	options: {
		uiConfig: {
			boardTitle: Debug('OPTIONS').appname,
			boardLogo: {
				path: '/icon.png',
				width: '120px',
				height: '40px',
			},
			favIcon: {
				default: '/icon.png',
				alternative: '/icon.png',
			},
			miscLinks: [{
					text: 'Manager',
					url: "javascript:(function(){ " +
						"   var overlay = window.parent.$('#preload-overlay'); " +
						"   var apiClass = window.parent.$('.API'); " +
						"   var apiId = window.parent.$('#API'); " +
						"   overlay.css('display', 'flex').hide().fadeIn(150, function() { " +
						"       apiClass.hide(); " +
						"       setTimeout(function() { " +
						"           apiId.hide().css('opacity', '0').show().fadeTo(300, 1); " +
						"           overlay.fadeOut(300); " +
						"       }, 1500); " +
						"   }); " +
						"})();"
				},
				{
					text: 'Refresh',
					url: "javascript:(function(){ " +
						"   var pWin = window.parent || window; " +
						"   var overlay = pWin.$('#preload-overlay'); " +
						"   var frame = pWin.$('iframe'); " +
						"   if (overlay && overlay.length) { " +
						"       overlay.css('display', 'flex').hide().fadeIn(150, function() { " +
						"           if (frame && frame.length) { " +
						"               frame.one('load', function() { " +
						"                   overlay.fadeOut(300); " +
						"               }); " +
						"           } else { " +
						"               pWin.setTimeout(function(){ overlay.fadeOut(300); }, 2000); " +
						"           } " +
						"           window.location.reload(); " +
						"       }); " +
						"   } else { " +
						"       window.location.reload(); " +
						"   } " +
						"})();"
				}
			]
		}
	}
});


app.get('/panel', (req, res) => {
	res.redirect('/panel/queue/Row');
});


const protectPanel = (req, res, next) => {
	if (isPanelAuthorized) {
		next();
	} else {
		res.status(403).send(`
            <script>
                alert('Access denied! Please log in on the main page.');
                try {
                    window.close();
                } catch (e) {}
                setTimeout(function() {
                    window.location.href = '/';
                }, 100);
            </script>
        `);
	}
};

app.use('/panel', protectPanel, serverAdapter.getRouter());

client.initialize();
console.log("\nAPI is Ready!\n");

server.listen(Port, ip.address(), () => {
	console.log(`Server Running on *${ip.address()}:${Port}`);
});

// ----------------------------------------------------
// Reusable helpers
// ----------------------------------------------------
function showElement(sel) {
	if (typeof sel === "string") $(sel).fadeIn();
}

function hideElement(sel) {
	if (typeof sel === "string") $(sel).fadeOut();
}

function setText(sel, txt) {
	if (typeof sel === "string") $(sel).text(txt);
}
