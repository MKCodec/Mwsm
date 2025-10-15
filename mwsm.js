//******************************************************************
// MkAuth WhatsApp Send Message
//******************************************************************
const Playground = "00000000000";
const Initialize = false;
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
MsgBox = false,
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
const fs = require("fs");
const ip = require('ip');
const Url2PDF = require("Url2PDF");
const cron = require('node-cron');
const htmlPDF = new Url2PDF();
const exec = require('child_process').exec;
const {
	execSync
} = require("child_process");
const link = require('better-sqlite3')('mwsm.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mwsm.db');
const register = new Date().getDate();
const Package = require('./package.json');
require('events').EventEmitter.defaultMaxListeners = Infinity;
const WServer = "https://raw.githubusercontent.com/MKCodec/Mwsm/main/version.json";
const crypto = require('crypto');
const Keygen = (length = 7, characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') => Array.from(crypto.randomFillSync(new Uint32Array(length))).map((x) => characters[x % characters.length]).join('');
var Password = [Debug('OPTIONS').token, Keygen()];
process.env.LANG = "pt-BR.utf8";
global.io = io;
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
		crimson: "\x1b[38m" // Scarlet
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

//Delay
function delay(t, v) {
	return new Promise(function(resolve) {
		setTimeout(resolve.bind(null, v), t)
	});
}

//Capitalize
function toCapitalize(str) {
	return str
		.toLowerCase()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.substr(1))
		.join(' ');
}

//Search DataBase
function Debug(Select, Search = '*', Mode = 'single', Find = undefined) {
	switch (Mode.toLowerCase()) {
		case "single":
			Select = link.prepare('SELECT ' + Search.toLowerCase() + ' FROM ' + Select.toLowerCase() + ' ORDER BY ID DESC').get();
			if (!Select) {
				Select = false;
			}
			break;
		case "multiple":
			Select = link.prepare('SELECT ' + Search.toLowerCase() + ' FROM ' + Select.toLowerCase()).pluck().all();
			if (!Select) {
				Select = false;
			}
			break;
		case "all":
			Select = link.prepare('SELECT ' + Search.toLowerCase() + ' FROM ' + Select.toLowerCase() + ' ORDER BY ID DESC').all();
			if (!Select) {
				Select = false;
			}
			break;
		case "direct":
			Select = link.prepare('SELECT ' + Search.toLowerCase() + ' FROM ' + Select.toLowerCase() + ' WHERE title = ?').get(Find);
			if (!Select) {
				Select = false;
			}
			break;
		case "id":
			Select = link.prepare('SELECT ' + Search.toLowerCase() + ' FROM ' + Select.toLowerCase() + ' WHERE id = ?').get(Find);
			if (!Select) {
				Select = false;
			}
			break;
	}
	return Select;
}

function DebugMsg(Selector) {
	var Last = Debug('MKAUTH').count,
		Return, Mode = Debug('MKAUTH').level,
		Message;
	switch (Mode.toLowerCase()) {
		case "direct":
			Return = 1;
			break;
		case "random":
			Return = Math.floor(Math.random() * (3 - 1 + 1) + 1);
			break;
		case "order":
			switch (Last) {
				case 1:
					Return = 2;
					break;
				case 2:
					Return = 3;
					break;
				case 3:
					Return = 1;
					break;
			}
			break;
	}
	switch (Selector.toLowerCase()) {
		case "before":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').before;
			break;

		case "day":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').day;
			break;

		case "later":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').later;
			break;

		case "pay":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').pay;
			break;

		case "lock":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').lock;
			break;

		case "unlock":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').unlock;
			break;

		case "maintenance":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').maintenance;
			break;

		case "unistall":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').unistall;
			break;

		case "speed":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').speed;
			break;

		case "block":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').block;
			break;

		case "support":
			Message = Debug('MESSAGE', '*', 'ID', '' + Return + '').support;
			break;
	}
	Dataset('MKAUTH', 'COUNT', Return, 'UPDATE');
	return Message;
}

//RegEx
function validPhone(phone) {
	var regex = new RegExp('^((1[1-9])|([2-9][0-9]))((3[0-9]{3}[0-9]{4})|(9[0-9]{3}[0-9]{5}))$');
	if (Boolean(Debug('OPTIONS').regex)) {
		return regex.test(phone.replace('55', ''));
	} else {
		return true;
	}
}

function PromiseTimeout(delayms) {
	return new Promise(function(resolve, reject) {
		setTimeout(resolve, delayms);
	});
}

//Manipulation DataBase
const Dataset = async (Table, Column, Value, Mode) => {
	switch (Mode.toLowerCase()) {
		case "update":
			Select = await link.prepare('UPDATE ' + Table.toLowerCase() + ' SET ' + Column.toLowerCase() + ' = ? WHERE id = ?').run(Value, '1');
			if (Select) {
				Select = true;
			} else {
				Select = false;
			}
			break;
		case "insert":
			Select = await link.prepare('INSERT INTO ' + Table.toLowerCase() + ' (' + Column.toLowerCase() + ') VALUES (?)').run(Value);
			if (Select) {
				Select = link.prepare('SELECT * FROM ' + Table.toLowerCase() + ' ORDER BY ID DESC').get().id;
			} else {
				Select = false
			}
			break;
		case "delete":
			Select = await link.prepare('DELETE FROM ' + Table.toLowerCase() + ' WHERE id = ?').run(Value);
			if (Select) {
				Select = true;
			} else {
				Select = false;
			}
			break;
		case "flush":
			const Flush = (link.prepare('SELECT * FROM ' + Value.toLowerCase()).all()).length;
			Select = await link.prepare('UPDATE ' + Table.toLowerCase() + ' SET ' + Column.toLowerCase() + ' = ? WHERE NAME = ?').run(Flush.toString(), Value.toLowerCase());
			if (Select) {
				Select = true;
			} else {
				Select = false;
			}
			break;
	}
	return await Select;
}


const isEmoji = (Value) => {
	if (true) {
		if (typeof Value === 'string') {
			return emoji.emojify(Value);
		} else {
			return Value;
		}
	} else {
		return Value;
	}
}

//Boolean Validation
const Boolean = function(str) {
	if (str == null) {
		return undefined;
	}
	if (typeof str === 'boolean') {
		if (str === true) {
			return true;
		}
		return false;
	}
	if (typeof str === 'string') {
		if (str == "") {
			return undefined;
		}
		str = str.replace(/^\s+|\s+$/g, '');
		if (str.toLowerCase() == 'true' || str.toLowerCase() == 'yes') {
			return true;
		} else if (str.toLowerCase() == 'false' || str.toLowerCase() == 'not') {
			return false;
		} else {
			return undefined;
		}
		str = str.replace(/,/g, '.');
		str = str.replace(/^\s*\-\s*/g, '-');
	}
	if (!isNaN(str)) {
		if (parseFloat(str)) {
			return true;
		}
		return false;
	}
	return undefined;
}

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
	var Status, Conclusion = true,
		Updated, Response,
		isDateTime = Debug('RELEASE').mwsm;
	const Upgrade = async (GET) => {
		const Update = await fetch(GET).then(response => {
			return response.json();
		}).catch(err => {
			return {
				version: [{
					release: '0.0.0',
					patch: '0000-00-00 00:00:00'
				}]
			}
		});
		return Update;
	};
	const isUpdate = await Upgrade(GET);
	const Nowdate = await Upgrade("http://" + ip.address() + ":" + Debug('OPTIONS').access + "/version.json");
	if (isDateTime == "undefined" || isDateTime == null) {
		isDateTime = "0000-00-00 00:00:00";
	}
	if ((isUpdate['version'][0].patch == Nowdate['version'][0].patch) && !SET) {
		Status = false;
		if (Conclusion) {
			Conclusion = false;
			if ((Debug('RELEASE').mwsm != Nowdate['version'][0].patch)) {
				const Register = await Dataset('RELEASE', 'MWSM', (Nowdate['version'][0].patch), 'UPDATE');
				if (Register) {
					await global.io.emit('Patched', Release(Debug('RELEASE').mwsm));
					await global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isalready);
					console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isalready);
					await global.io.emit('update', true);
				}
			} else {
				await global.io.emit('Patched', Release(Debug('RELEASE').mwsm));
				await global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isalready);
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isalready);
			}
		}
		Updated = "false";
		await global.io.emit('upgrade', true);
		await WwjsVersion(false);
	} else {
		if ((isUpdate['version'][0].release > Package.version)) {
			if (!SET) {
				await global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isneeds);
				await console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isneeds);
				WwjsVersion(false);
			}
			Updated = "false";
			await global.io.emit('upgrade', false);
		} else {
			if ((isUpdate['version'][0].patch > isDateTime)) {
				await global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isfound);
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isfound);
				await global.io.emit('upgrade', false);
				if (SET && (Boolean(Debug('RELEASE').isupdate) || Boolean(GUPForce))) {
					const Register = await Dataset('RELEASE', 'MWSM', (isUpdate['version'][0].patch), 'UPDATE');
					if (Register) {
						await global.io.emit('Patched', Release(Debug('RELEASE').mwsm));
						await global.io.emit('upgrade', true);
						console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isupfiles);
						console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isupdated);
						await global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isupdated);
						await wget("https://raw.githubusercontent.com/MKCodec/Mwsm/main/script.js", "/var/api/Mwsm/script.js");
						await wget("https://raw.githubusercontent.com/MKCodec/Mwsm/main/style.css", "/var/api/Mwsm/style.css");
						await wget("https://raw.githubusercontent.com/MKCodec/Mwsm/main/index.html", "/var/api/Mwsm/index.html");
						await wget("https://raw.githubusercontent.com/MKCodec/Mwsm/main/mwsm.js", "/var/api/Mwsm/mwsm.js");
						await global.io.emit('update', true);
						await exec('npm run restart:mwsm');
						WwjsVersion(true);
						Updated = "true";
					} else {
						Updated = "false";
						await global.io.emit('upgrade', false);
					}
					Status = true;
				} else if (Conclusion) {
					Conclusion = false;
					Status = true;
					if (!SET) {
						await global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isneeds);
						await console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isneeds);
					}
					await global.io.emit('upgrade', false);
					Updated = "false";
				}
			} else if (Conclusion) {
				Conclusion = false;
				Status = false;
				if (!SET) {
					await global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isalready);
					console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').isalready);
				}
				await global.io.emit('upgrade', true);
				Updated = "false";
			}
		}
	}
	Response = {
		"Status": Status,
		"Update": Updated
	};

	return Response;
}

//Set Debugger
function Terminal(Value) {
	if (Boolean(Debug('OPTIONS').debugger)) {
		console.error(Value);
	}
}

//Get Release
function Release(Value) {
	return (new Date(Value).toLocaleString("pt-br").split(",")[0]) + " " + ((Value).split(" ")[1]).split(":")[0] + ":" + ((Value).split(" ")[1]).split(":")[1]
}


const SetSchedule = async (ShedForce = false) => {
	if (Boolean(Debug('MKAUTH').module) && (Boolean(Debug('MKAUTH').aimbot) || Boolean(ShedForce))) {
		var Register, Insert, hasDays = [],
			Option, Index = 0,
			Count = 0,
			hasReady = [],
			isSHED = [],
			ShedReload = true;
		const Month = ((DateTime()).split(" ")[0]).split("-")[1];
		const Windows = await MkAuth(Month, "all", 'list');
		if (Boolean(Debug('SCHEDULER').bfive)) {
			Option = undefined;
			GetDays = {
				"Mode": "Later",
				"Set": 5,
				"Option": Option
			};
			hasDays.push(GetDays);
		}
		if (Boolean(Debug('SCHEDULER').inday)) {
			Option = undefined;
			GetDays = {
				"Mode": "Now",
				"Set": 0,
				"Option": Option
			};
			hasDays.push(GetDays);
		}
		if (Boolean(Debug('SCHEDULER').lfive) || (Debug('SCHEDULER').speed == 5)) {
			Option = undefined;
			if (Boolean(Debug('SCHEDULER').onspeed) && (Debug('SCHEDULER').speed == 5)) {
				Option = "speed";
			}
			GetDays = {
				"Mode": "Before",
				"Set": 5,
				"Option": Option
			};
			hasDays.push(GetDays);
		}
		if (Boolean(Debug('SCHEDULER').lten) || (Debug('SCHEDULER').speed == 10)) {
			Option = undefined;
			if (Boolean(Debug('SCHEDULER').onspeed) && (Debug('SCHEDULER').speed == 10)) {
				Option = "speed";
			}
			GetDays = {
				"Mode": "Before",
				"Set": 10,
				"Option": Option
			};
			hasDays.push(GetDays);
		}
		if (Boolean(Debug('SCHEDULER').lfifteen) || (Debug('SCHEDULER').speed == 15)) {
			Option = undefined;
			if (Boolean(Debug('SCHEDULER').onspeed) && (Debug('SCHEDULER').speed == 15)) {
				Option = "speed";
			}
			GetDays = {
				"Mode": "Before",
				"Set": 15,
				"Option": Option
			};
			hasDays.push(GetDays);
		}
		if (Boolean(Debug('SCHEDULER').ltwenty) || (Debug('SCHEDULER').speed == 20)) {
			Option = undefined;
			if (Boolean(Debug('SCHEDULER').onspeed) && (Debug('SCHEDULER').speed == 20)) {
				Option = "speed";
			}
			GetDays = {
				"Mode": "Before",
				"Set": 20,
				"Option": Option
			};
			hasDays.push(GetDays);
		}
		if (Boolean(Debug('SCHEDULER').ltwentyfive) || (Debug('SCHEDULER').speed == 25)) {
			Option = undefined;
			if (Boolean(Debug('SCHEDULER').onspeed) && (Debug('SCHEDULER').speed == 25)) {
				Option = "speed";
			}
			GetDays = {
				"Mode": "Before",
				"Set": 25,
				"Option": Option
			};
			hasDays.push(GetDays);

		}
		if (Boolean(Debug('SCHEDULER').lthirty) || (Debug('SCHEDULER').speed == 30)) {
			Option = undefined;
			if (Boolean(Debug('SCHEDULER').onspeed) && (Debug('SCHEDULER').speed == 30)) {
				Option = "speed";
			}
			GetDays = {
				"Mode": "Before",
				"Set": 30,
				"Option": Option
			};
			hasDays.push(GetDays);
		}
		if (Boolean(Debug('SCHEDULER').lthirtyfive) || (Debug('SCHEDULER').speed == 35)) {
			Option = undefined;
			if (Boolean(Debug('SCHEDULER').onspeed) && (Debug('SCHEDULER').speed == 35)) {
				Option = "speed";
			}
			GetDays = {
				"Mode": "Before",
				"Set": 35,
				"Option": Option
			};
			hasDays.push(GetDays);
		}
		if (Boolean(Debug('SCHEDULER').lforty) || (Debug('SCHEDULER').speed == 40)) {
			Option = undefined;
			if (Boolean(Debug('SCHEDULER').onspeed) && (Debug('SCHEDULER').speed == 40)) {
				Option = "speed";
			}
			GetDays = {
				"Mode": "Before",
				"Set": 40,
				"Option": Option
			};
			hasDays.push(GetDays);
		}
		if (Boolean(Debug('SCHEDULER').onblock)) {
			GetDays = {
				"Mode": "Before",
				"Set": Debug('SCHEDULER').block,
				"Option": "Block"
			};
			hasDays.push(GetDays);
		}
		(hasDays).someAsync(async (Days) => {
			const Master = await Scheduller(Days.Set, Days.Mode);
			if (await Master) {
				if (Master != undefined) {
					(Master).someAsync(async (Send) => {
						MsgSET = false;
						if (Send.celular != undefined) {
							Send.celular = (Send.celular).replace(/[^0-9\\.]+/g, '');
						} else {
							Send.celular = "00000000000";
						}
						if (Boolean(Debug('OPTIONS').regex)) {
							switch (Boolean(validPhone(Send.celular))) {
								case true:
									WhatsApp = 'true';
									break;
								case false:
									WhatsApp = 'false';
									break;
							}
						} else {
							WhatsApp = 'true';
						}
						switch (Send.status) {
							case 'aberto':
								Send.status = 'open';
								break;
							case 'pago':
								Send.status = 'paid';
								break;
							case 'vencido':
								Send.status = 'due';
								break;
							case 'cancelado':
								Send.status = 'cancel';
								break;
						}
						switch (Send.bloqueado) {
							case 'sim':
								Send.bloqueado = 'false';
								break;
							case 'nao':
								Send.bloqueado = 'true';
								break;
						}

						switch (Send.cli_ativado) {
							case 's':
								Send.cli_ativado = 'true';
								break;
							case 'n':
								Send.cli_ativado = 'false';
								break;
						}

						switch (Send.zap) {
							case 'sim':
								Send.zap = 'true';
								break;
							case 'nao':
								Send.zap = 'false';
								break;
						}
						if (((Send.datavenc).split(" ")[0]) == (DateTime()).split(" ")[0] && (Send.status) != 'paid' && (Send.status) != 'cancel') {
							Send.status = 'open';
						}
						if (Boolean(Send.cli_ativado) && Send.status != 'paid' && Send.status != 'cancel' && Boolean(WhatsApp) && Boolean(Send.zap)) {
							Index = Index + 1;
							const Replies = await link.prepare('SELECT * FROM scheduling WHERE title=?').get(Send.titulo);
							if (!Boolean(ShedForce)) {
								GetSHED = {
									"TITLE": Send.titulo,
									"CLIENT": Send.nome,
									"REWARD": Send.datavenc
								};
								isSHED.push(GetSHED);
								await global.io.emit('shedullers', isSHED);
							}
							if (Replies == undefined) {
								const ShedInsert = await link.prepare("INSERT INTO scheduling(title, user, client, contact, reward, status, range, control, option, unlock) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(Send.titulo, Send.login, Send.nome, Send.celular, Send.datavenc, Send.status, Days.Mode, Days.Set, Days.Option, Send.cli_ativado);
								if (ShedInsert) {
									MsgSET = true;
									Hwid = {
										"ID": Send.login
									};
									hasReady.push(Hwid);
								}
							} else {
								const exUpdate = await link.prepare('SELECT * FROM scheduling WHERE title=? AND process=?').get(Send.titulo, "wait");
								if (exUpdate == undefined || Option != exUpdate.option) {
									const ShedUpdate = await link.prepare('UPDATE scheduling SET process=?, contact=?, option=?, control=?, unlock=? WHERE title=?').run("wait", Send.celular, Days.Option, Days.Set, Send.cli_ativado, Send.titulo);
									if (ShedUpdate) {
										MsgSET = true;
										Hwid = {
											"ID": Send.login
										};
										hasReady.push(Hwid);
									}
								}
							}
						} else {
							//Client Disable
						}
						if ((hasReady.length == Index) && MsgSET) {
							global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').schedule);
							console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').schedule);
							MsgSET = false;
						}

					});
				}
			}
		});
		if (await Windows) {
			Register = (Windows).filter(function(Send) {
				return Send.Payment != 'paid';
			}).length;
			if (!Boolean(ShedForce)) {
				ShedReload = Debug('MKAUTH').backup;
			}
			if (Boolean(ShedReload) && Register >= 1) {
				if (Windows != undefined) {
					(Windows).someAsync(async (Bank) => {
						if (Bank.Payment != "paid" && Boolean(Bank.Ready)) {
							if (Bank.Contact == undefined) {
								Bank.Contact = "00000000000";
							}
							if (Debug('SCHEDULING', 'TITLE', 'MULTIPLE').some(Row => (Bank.Identifier).includes(Row))) {
								await link.prepare('UPDATE scheduling SET cash=?, gateway=?, unlock=?  WHERE title=?').run(Bank.Cash, Bank.Gateway, Bank.unLock, Bank.Identifier);
							} else {
								await link.prepare('INSERT INTO scheduling(title,user,client,contact,reward,status,process,cash,gateway,unlock) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(Bank.Identifier, Bank.Connect, Bank.Client, Bank.Contact, Bank.Reward, Bank.Payment, 'load', Bank.Cash, Bank.Gateway, Bank.unLock);
							}
						} else {
							(Debug('SCHEDULING', '*', 'ALL')).someAsync(async (Del) => {
								if (Del.process == "success" && Del.status == "paid") {
									await link.prepare('DELETE FROM scheduling WHERE title=?').run(Del.title);
								}
							});
						}
					});
				}
			}
		}
		return true;
	}
}

const GetSchedule = async () => {
	if (Boolean(Debug('MKAUTH').module) && Boolean(Debug('MKAUTH').aimbot)) {
		var Check = 0,
			IsPaid = 0,
			isLock = 0,
			isUnLock = 0,
			isDue = 0;
		const DataBase = await Debug('SCHEDULING', 'TITLE', 'MULTIPLE');
		if (await DataBase.length >= 1) {
			if (DataBase != undefined) {
				(await DataBase).someAsync(async (Target) => {
					var Check = 0,
						IsPaid = 0;
					const Local = await link.prepare('SELECT * FROM scheduling WHERE title=?').get(Target);
					const Rebase = await MkAuth('all', Target, 'list');
					if (Rebase != undefined && Rebase.Status == undefined) {
						const Bank = await Object.assign({}, Rebase)[0];

						Check = await (Object.values(Rebase)).filter(function(Send) {
							if (Send.unLock != Local.unlock && Boolean(Send.Ready)) {
								return true;
							}
						}).length;

						IsPaid = await (Object.values(Rebase)).filter(function(Send) {
							if (Send.Payment != Local.status && Boolean(Send.Ready)) {
								return true;
							}
						}).length;

						if (IsPaid >= 1 && Local.process != "success" && Bank.Payment == "paid") {
							await link.prepare('UPDATE scheduling SET status=?, cash=?, gateway=?, unlock=? WHERE title=?').run(Bank.Payment, Bank.Cash, Bank.Gateway, Bank.unLock, Target);
						} else if (Check >= 1 && Local.process != "wait" && Local.process != "success") {
							if (Bank.unLock == 'false' && Local.process != "unlock") {
								await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('lock', 'false', Target);
							} else if (Bank.unLock == 'true') {
								await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('unlock', 'true', Target);
							}
						}
					} else {
						await link.prepare('DELETE FROM scheduling WHERE title=?').run(Target);
					}
				});
			}
			const Search = await link.prepare('SELECT * FROM scheduling').all();
			if (await Search) {
				if (Search != undefined) {
					isPaid = await (Object.values(Search)).filter(function(Send) {
						if (Send.process != "success" && Send.status == "paid") {
							return true;
						}
					}).length;

					isLock = await (Object.values(Search)).filter(function(Send) {
						if (Send.process == "lock" && Send.unlock == "false" && Send.status == "due") {
							return true;
						}
					}).length;

					isUnLock = await (Object.values(Search)).filter(function(Send) {
						if (Send.process == "unlock" && Send.unlock == "true" && Send.status == "due") {
							return true;
						}
					}).length;

					isDue = await (Object.values(Search)).filter(function(Send) {
						if (Send.process == "wait" && Send.status != "paid") {
							return true;
						}
					}).length;
				}
				isLoad = {
					"Paid": isPaid,
					"Lock": isLock,
					"unLock": isUnLock,
					"Due": isDue
				};
				isReturn = await Object.assign({}, isLoad);
				if (typeof isLoad === 'object') {
					isReturn = JSON.stringify(isReturn, null, 4);
				}
				if (Boolean(Debug('OPTIONS').tag) && Boolean(Debug('MKAUTH').aimbot)) {
					FrontEnd = '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').shedstatus;
					console.log(Print.bg.red, Print.fg.white, FrontEnd, Print.reset);
					console.log(Print.reset, Print.fg.white, isReturn, Print.reset);
				}
			}

			if (Boolean(Debug('SCHEDULER').onpay) && isPaid >= 1) {
				const Paid = await link.prepare('SELECT * FROM scheduling WHERE status=? AND NOT process=?').get('paid', 'success');
				if (await Paid != undefined) {
					const Resolve = await MkAuth('all', Paid.title, 'list');
					const isBank = await Object.assign({}, Resolve)[0];
					if (await Resolve != undefined) {
						if (Paid.status == "paid" && Boolean(isBank.Ready)) {
							Data = {
								client: Paid.client,
								user: Paid.user,
								code: Paid.title,
								status: "pending",
								contact: Paid.contact,
								reward: Paid.reward,
								push: '00/00/0000 00:00:00',
								option: Paid.option,
								unlock: Paid.unlock,
								process: Paid.process,
								token: Debug('OPTIONS').token,
								cash: Paid.cash,
								gateway: Paid.gateway,
								payment: Paid.status
							};
							const isReady = await axios.post("http://" + ip.address() + ":" + Debug('OPTIONS').access + "/send-mkauth", Data);
							if (await isReady) {
								await global.io.emit('schedresume', Paid.title);
								await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('success', 'true', Paid.title);
							}
						} else {
							await global.io.emit('schedresume', Paid.title);
							await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('success', 'true', Paid.title);
						}
					}
				}
			} else if (Boolean(Debug('SCHEDULER').onlock) && isLock >= 1) {
				const Lock = await link.prepare('SELECT * FROM scheduling WHERE process=? AND unlock=?').get('lock', 'false');
				if (await Lock != undefined) {
					const Resolve = await MkAuth('all', Lock.title, 'list');
					const isBank = await Object.assign({}, Resolve)[0];
					if (await Resolve != undefined) {
						if (Lock.status != "paid" && Boolean(isBank.Ready)) {
							Data = {
								client: Lock.client,
								user: Lock.user,
								code: Lock.title,
								status: "pending",
								contact: Lock.contact,
								reward: Lock.reward,
								push: '00/00/0000 00:00:00',
								option: Lock.option,
								unlock: Lock.unlock,
								process: Lock.process,
								token: Debug('OPTIONS').token,
								payment: Lock.status
							};
							const isReady = await axios.post("http://" + ip.address() + ":" + Debug('OPTIONS').access + "/send-mkauth", Data);
							if (await isReady) {
								await global.io.emit('schedresume', Lock.title);
								await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('unlock', 'false', Lock.title);
							}
						} else {
							await global.io.emit('schedresume', Lock.title);
							await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('unlock', 'false', Lock.title);
						}
					}
				}
			} else if (Boolean(Debug('SCHEDULER').onunlock) && isUnLock >= 1) {
				const UnLock = await link.prepare('SELECT * FROM scheduling WHERE process=? AND unlock=?').get('unlock', 'true');
				if (await UnLock != undefined) {
					const Resolve = await MkAuth('all', UnLock.title, 'list');
					const isBank = await Object.assign({}, Resolve)[0];
					if (await Resolve != undefined) {
						if (UnLock.status != "paid" && Boolean(isBank.Ready)) {
							Data = {
								client: UnLock.client,
								user: UnLock.user,
								code: UnLock.title,
								status: "pending",
								contact: UnLock.contact,
								reward: UnLock.reward,
								push: '00/00/0000 00:00:00',
								option: UnLock.option,
								unlock: UnLock.unlock,
								process: UnLock.process,
								token: Debug('OPTIONS').token,
								payment: UnLock.status
							};
							const isReady = await axios.post("http://" + ip.address() + ":" + Debug('OPTIONS').access + "/send-mkauth", Data);
							if (await isReady) {
								await global.io.emit('schedresume', UnLock.title);
								await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('load', UnLock.unlock, UnLock.title);
							}
						} else {
							await global.io.emit('schedresume', UnLock.title);
							await link.prepare('UPDATE scheduling SET process=?, unlock=? WHERE title=?').run('load', UnLock.unlock, UnLock.title);
						}
					}
				}
			} else if ((isWeek(DateTime(0))) && (isShift((DateTime(0).split(" ")[1]).split(":")[0])) || (validPhone(Playground) && Initialize)) {
				const Due = await link.prepare('SELECT * FROM scheduling WHERE NOT status=? AND process=?').get('paid', 'wait');
				if (await Due != undefined) {
					const Resolve = await MkAuth('all', Due.title, 'list');
					const isBank = await Object.assign({}, Resolve)[0];
					if (await Resolve != undefined) {
						if (isDue >= 1) {
							if (Due.process != "load" && Boolean(isBank.Ready)) {
								Data = {
									client: Due.client,
									user: Due.user,
									code: Due.title,
									status: "pending",
									contact: Due.contact,
									reward: Due.reward,
									push: '00/00/0000 00:00:00',
									option: Due.option,
									unlock: undefined,
									process: Due.process,
									token: Debug('OPTIONS').token,
									payment: Due.status
								};
								const isReady = await axios.post("http://" + ip.address() + ":" + Debug('OPTIONS').access + "/send-mkauth", Data);
								if (await isReady) {
									await global.io.emit('schedresume', Due.title);
									if (isBank.unLock == 'false' && Boolean(Debug('SCHEDULER').onlock)) {
										await link.prepare('UPDATE scheduling SET process=?, unlock=?  WHERE title=?').run("lock", isBank.unLock, Due.title);
									} else {
										await link.prepare('UPDATE scheduling SET process=?, unlock=?  WHERE title=?').run("load", isBank.unLock, Due.title);
									}
								}
							} else {
								await global.io.emit('schedresume', Due.title);
								await link.prepare('UPDATE scheduling SET process=?, unlock=?  WHERE title=?').run("load", isBank.unLock, Due.title);
							}
						} else {
							await global.io.emit('schedresume', 'true');
						}

					}
				}
			}

		}
	}
}

//Scheduller
cron.schedule('*/2 1-2 * * *', async () => {
	await GetUpdate(WServer, true);
	await WwjsVersion(false);
}, {
	scheduled: true,
	timezone: "America/Sao_Paulo"
});

cron.schedule('0 0 * * *', async () => {
	await SetSchedule();
}, {
	scheduled: true,
	timezone: "America/Sao_Paulo"
});

cron.schedule('*/' + Debug('SCHEDULER').cron + ' 3-23 * * *', async () => {
	if (!Boolean(Debug('RELEASE').reload)) {
		await GetSchedule();
	}
}, {
	scheduled: true,
	timezone: "America/Sao_Paulo"
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
	res.sendFile('index.html', {
		root: __dirname
	});
});


//Get Date
function AddZero(num) {
	return (num >= 0 && num < 10) ? "0" + num : num + "";
}

function DateTime(Days = 0, Mode) {
	isDate = new Date();
	switch (Mode) {
		case 'some':
			isDate.setDate(isDate.getDate() + Days);
			break;
		case 'subtract':
			isDate.setDate(isDate.getDate() - Days);
			break;
	}
	UTC = isDate.getTime() + (isDate.getTimezoneOffset() * 60000);
	now = new Date(UTC + (3600000 * -3));
	var strDateTime = [
		[now.getFullYear(), AddZero(now.getMonth() + 1), AddZero(now.getDate())].join("-"), [AddZero(now.getHours()), AddZero(now.getMinutes()), AddZero(now.getSeconds())].join(":")
	].join(" ");
	return strDateTime;
};

const MkList = async (FIND, REFINE = "titulos") => {
	var Server = Debug('MKAUTH').client_link;
	if (Server == "tunel") {
		Server = Debug('MKAUTH').tunel;
	} else if (Server == "domain") {
		Server = Debug('MKAUTH').domain;
	}
	const Authentication = await axios.get('https://' + Server + '/api/', {
		auth: {
			username: Debug('MKAUTH').client_id,
			password: Debug('MKAUTH').client_secret
		}
	}).then(response => {
		return response.data;
	}).catch(err => {
		return false;
	});
	if (Authentication) {
		const MkSync = await axios.get('https://' + Server + '/api/titulo/' + REFINE + '/' + FIND, {
			headers: {
				'Authorization': 'Bearer ' + Authentication
			}
		}).then(response => {
			if ((typeof response.data !== "object") && ((response.data).slice(-1) != '}')) {
				return JSON.parse((response.data).substring(0, (response.data).length - 1));
			} else {
				return response.data;
			}
		}).catch(err => {
			return false;
		});

		if (await MkSync.mensagem == undefined && await MkSync.error == undefined) {
			const Keys = Object.keys(await MkSync).length;
			if (Keys == 0) {
				return false
			} else if (Keys <= 2) {
				return await MkSync.titulos;
			} else if (Keys >= 3) {
				return await MkSync;
			}
		} else {
			return false;
		}
	}
};

function isWeek(Sysdate) {
	var CountDown = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date(Sysdate).getDay()]
	switch (CountDown) {
		case 'sunday':
			inDay = Debug('SCHEDULER').sunday;
			break;
		case 'monday':
			inDay = Debug('SCHEDULER').monday;
			break;
		case 'tuesday':
			inDay = Debug('SCHEDULER').tuesday;
			break;
		case 'wednesday':
			inDay = Debug('SCHEDULER').wednesday;
			break;
		case 'thursday':
			inDay = Debug('SCHEDULER').thursday;
			break;
		case 'friday':
			inDay = Debug('SCHEDULER').friday;
			break;
		case 'saturday':
			inDay = Debug('SCHEDULER').saturday;
			break;
	}
	if (Boolean(inDay)) {
		return true;
	} else {
		return false;
	}
}

const Scheduller = async (DAYS, MODE) => {
	var Date;
	if (MODE.toLowerCase() == "now" && DAYS == 0) {
		Date = [(DateTime(0)).split(" ")[0],
			[AddZero(0), AddZero(0), AddZero(0)].join(":")
		].join(" ");
	} else if (MODE.toLowerCase() == "before") {
		Date = [(DateTime(DAYS, "subtract")).split(" ")[0],
			[AddZero(0), AddZero(0), AddZero(0)].join(":")
		].join(" ");
	} else if (MODE.toLowerCase() == "later") {
		Date = [(DateTime(DAYS, "some")).split(" ")[0],
			[AddZero(0), AddZero(0), AddZero(0)].join(":")
		].join(" ");
	}
	return await MkList(Date);
};

function inRange(x, min, max) {
	return ((x - min) * (x - max) <= 0);
}

function isShift(Turno) {
	var Return = false;
	if (inRange(Turno, AddZero(Debug('SCHEDULER').min), 11)) {
		if (Boolean(Debug('SCHEDULER').morning)) {
			Return = true;
		}
	} else if (inRange(Turno, 12, 17)) {
		if (Boolean(Debug('SCHEDULER').afternoon)) {
			Return = true;
		}
	} else if (inRange(Turno, 18, Debug('SCHEDULER').max)) {
		if (Boolean(Debug('SCHEDULER').night)) {
			Return = true;
		}
	} else {
		Return = false;
	}
	return Return;
}

async function WwjsVersion(GET) {
	try {
		const installed = require("whatsapp-web.js/package.json").version;
		const latest = execSync("npm view whatsapp-web.js version", {
			encoding: "utf8"
		}).trim();

		if (installed === latest) {
			await global.io.emit('Wwjs', true);
			if (GET) {
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').wwjsupdate);
				global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').wwjsupdate);
			}
		} else {
			await global.io.emit('Wwjs', false);
			if (GET) {
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').wwjsfail);
				global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').wwjsfail);
			}
		}
	} catch (err) {
		await global.io.emit('Wwjs', false);
		if (GET) {
			console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').wwjsfail);
			global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').wwjsfail);
		}
	}
}



// ==================================================
// 🧠 Inteligência Artificial
// ==================================================

async function getEmbedding(text) {
    try {
        if (!text) return null;
        const mwsmHost = Debug('OPTIONS').mwsmhost;
        const mwsmPort = Debug('OPTIONS').mwsmport;

        const localResp = await axios.post(
            `http://${mwsmHost}:${mwsmPort}/embed`,
            { text },
            { timeout: 10000 }
        );

        if (localResp.data?.embedding) return localResp.data.embedding;
        throw new Error('No embedding returned');
    } catch {
        // 🔹 fallback determinístico (garante vetor estável)
        return Array.from(text)
            .map((ch, i) => ((ch.charCodeAt(0) + i * 13) % 255) / 255)
            .slice(0, 256);
    }
}

// ==================================================
// 🕒 Timezone e Cumprimentos Dinâmicos
// ==================================================
async function getTimezoneByUF(uf) {
    return new Promise((resolve) => {
        db.get("SELECT timezone FROM localzone WHERE uf = ?", [uf], (err, row) => {
            if (err || !row) return resolve("America/Sao_Paulo"); // padrão SP
            resolve(row.timezone);
        });
    });
}

function getGreetingPeriod(timezone) {
    try {
        const now = new Date();
        const localTime = new Date(now.toLocaleString("pt-BR", { timeZone: timezone }));
        const hour = localTime.getHours();

        if (hour >= 5 && hour < 12) return "bom dia";
        if (hour >= 12 && hour < 18) return "boa tarde";
        return "boa noite";
    } catch {
        return "";
    }
}

// ==================================================
// 🔒 Filtro Temático (Palavras-chave no BD)
// ==================================================
async function isRelevantQuestion(text) {
    return new Promise((resolve) => {
        db.all("SELECT filter FROM keywords", [], (err, rows) => {
            if (err) {
                console.error("Keyword filter error:", err.message);
                return resolve(true); // não bloqueia em erro
            }
            if (!rows || rows.length === 0) return resolve(true);

            const keywords = rows.map(r => (r.filter || "").toLowerCase().trim());
            text = (text || "").toLowerCase().trim();
            const found = keywords.some(k => text.includes(k));
            resolve(found);
        });
    });
}

// ==================================================
// 🎯 Lógica Principal da IA
// ==================================================
async function askAI(question) {
    return new Promise(async (resolve) => {
        try {
            const text = (question || "").toLowerCase().trim();

            // 🔹 1️⃣ Verifica se é um cumprimento antes do filtro
            const isGreeting = await new Promise((resolveGreet) => {
                db.all("SELECT word FROM greetings", [], (err, rows) => {
                    if (err || !rows?.length) return resolveGreet(false);
                    const greetings = rows.map(r => (r.word || "").toLowerCase());
                    resolveGreet(greetings.some(g => text.includes(g)));
                });
            });

            if (isGreeting) {
                const uf = Debug('OPTIONS').timezone || 'SP';
                const tz = await getTimezoneByUF(uf);
                const turno = getGreetingPeriod(tz);

                if (turno) {
                    return resolve(`👋 Olá, ${turno}! Como posso te ajudar com sua conexão de internet?`);
                } else {
                    return resolve(`👋 Olá! Como posso te ajudar com sua conexão de internet?`);
                }
            }

            // 🔹 2️⃣ Se não for cumprimento, aplica o filtro temático
            const isRelevant = await isRelevantQuestion(text);
            if (!isRelevant) {
                console.log(`> ${Debug('OPTIONS').appname} : Brain: Filter → Ignored.`);
                return resolve("⚠️ Posso ajudar apenas com dúvidas sobre sua conexão de internet e suporte técnico.");
            }

            // 🔹 3️⃣ A partir daqui segue o fluxo normal da IA
            const aiMode = parseInt(Debug('OPTIONS').aimode);
            const apiKey = Debug('OPTIONS').keygen;
            const Engine = Debug('OPTIONS').engine;
            const threshold = parseFloat(Debug('OPTIONS').threshold);
            const systemPrompt = Debug('OPTIONS').prompt;
            const aiTimeout = parseInt(Debug('OPTIONS').aitimeout);
            const appName = Debug('OPTIONS').appname;

            if (!apiKey) return resolve("⚠️ IA não configurada.");

            const engineRow = await Debug("ENGINE", "*", "DIRECT", Engine);
            const Module = engineRow?.module || null;
            const Level = parseInt(engineRow?.level || 0);

            if (!Module) return resolve("⚠️ Indisponível no momento.");

            const qEmbedding = await getEmbedding(question);
            let bestMatch = null;
            let bestScore = 0;

            if (aiMode === 0) {
                console.log(`> ${appName} : Brain: Cloud | Relevance: 0.00`);
                const aiAnswer = await fetchCloudAnswer(question, apiKey, Engine, Module, systemPrompt, aiTimeout, Level);
                return resolve(aiAnswer);
            }

            // 🔸 Busca local
            const rows = await Debug('INTELIGENCE', '*', 'ALL');
            for (const r of rows) {
                if (!r.embedding) continue;
                try {
                    const emb = JSON.parse(r.embedding);
                    const score = cosineSimilarity(emb, qEmbedding);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = r;
                    }
                } catch {}
            }

            // 🔹 Resposta local encontrada
            if (bestMatch && bestScore >= threshold) {
                console.log(`> ${appName} : Brain: Local | Relevance: ${bestScore.toFixed(2)}`);
                db.run("UPDATE inteligence SET usage_count = usage_count + 1 WHERE id = ?", [bestMatch.id]);
                return resolve(bestMatch.answer);
            }

            // 🔹 Caso não tenha resposta local — vai para nuvem
            console.log(`> ${appName} : Brain: Cloud | Relevance: ${bestScore.toFixed(2)}`);
            const aiAnswer = await fetchCloudAnswer(question, apiKey, Engine, Module, systemPrompt, aiTimeout, Level);

            // 🔸 Aprendizado local (modo 2)
            if (aiMode === 2 && aiAnswer && !aiAnswer.startsWith("⚠")) {
                try {
                    await enforceKnowledgeLimit();
                    const _embedding = await getEmbedding(question);
                    const embeddingStr = _embedding ? JSON.stringify(_embedding) : null;

                    db.serialize(() => {
                        db.get("SELECT id FROM inteligence WHERE question = ?", [question], (err, row) => {
                            if (err) return console.error("DB check error:", err.message);

                            const sql = row
                                ? "UPDATE inteligence SET answer=?, embedding=?, source=?, usage_count=usage_count+1 WHERE id=?"
                                : "INSERT INTO inteligence (question, answer, embedding, source, usage_count) VALUES (?, ?, ?, ?, 1)";

                            const params = row
                                ? [aiAnswer, embeddingStr, "local", row.id]
                                : [question, aiAnswer, embeddingStr, "local"];

                            db.run(sql, params, (e) => e && console.error("DB write error:", e.message));
                        });
                    });
                } catch (e) {
                    console.error("Embedding generation failed:", e?.message || e);
                }
            }

            return resolve(aiAnswer);
        } catch (err) {
            console.error("IA error:", err.message || err);
            return resolve("⚠️ Não consegui acessar a inteligência artificial no momento.");
        }
    });
}

// ==================================================
// 🌐 Comunicação com API (OpenRouter) + Limite de Tentativas
// ==================================================
async function fetchCloudAnswer(question, apiKey, Engine, Module, systemPrompt, aiTimeout, Level = 0) {
    const tried = [];
    try {
        let variants = [];

        if (Engine.toLowerCase() === "freerouter") {
            variants = await new Promise((resolve) => {
                db.all("SELECT * FROM engine WHERE level = 0 ORDER BY active DESC, id ASC", [], (err, rows) => {
                    if (err) return resolve([]);
                    resolve(rows);
                });
            });
        } else {
            variants = await new Promise((resolve) => {
                db.all("SELECT * FROM engine WHERE title = ? AND level = ? ORDER BY active DESC, id ASC", [Engine, Level], (err, rows) => {
                    if (err) return resolve([]);
                    resolve(rows);
                });
            });
        }

        if (!variants.length) throw new Error("⚠️ Erro ao buscar resposta da IA online.");

        const activeVariant = variants.find(v => v.active === 1);
        const orderedVariants = activeVariant
            ? [activeVariant, ...variants.filter(v => v.id !== activeVariant.id)]
            : variants;

        const maxAttempts = parseInt(Debug('OPTIONS').aimaxattempts) || 0;
        let attempts = 0;

        for (const variant of orderedVariants) {
            if (maxAttempts && attempts >= maxAttempts) {
                console.log(`> ${Debug('OPTIONS').appname} : Brain: Max Attempts (${maxAttempts}) reached.`);
                break;
            }
            attempts++;

            tried.push(variant.module);
            try {
                const response = await axios.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        model: variant.module,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: question }
                        ]
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            "Content-Type": "application/json"
                        },
                        timeout: aiTimeout
                    }
                );

                const aiAnswer =
                    response.data?.choices?.[0]?.message?.content?.trim() ||
                    "Desculpe, não consegui entender sua solicitação.";

                db.run("UPDATE engine SET active = 0 WHERE title = ?", [variant.title]);
                db.run("UPDATE engine SET active = 1 WHERE id = ?", [variant.id]);

                console.log(`> ${Debug('OPTIONS').appname} : AskAI: ${variant.title} ${variant.variant} → ATIVA`);
                return aiAnswer.replace(/\s+/g, " ").trim();
            } catch (err) {
                console.log(`> ${Debug('OPTIONS').appname} : AskAI: ${variant.title} ${variant.variant} → INATIVA`);
                db.run("UPDATE engine SET active = 0 WHERE id = ?", [variant.id]);
                continue;
            }
        }

        return "⚠️ Erro ao buscar resposta da IA online.";
    } catch {
        return "⚠️ Erro ao buscar resposta da IA online.";
    }
}

// ==================================================
// 📊 Similaridade Vetorial
// ==================================================
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

// ==================================================
// 🧹 Limpeza Dinâmica e Inteligente do Conhecimento
// ==================================================
async function enforceKnowledgeLimit() {
    try {
        const maxKnowledge = parseInt(Debug("OPTIONS").maxknowledge) || 1000;
        if (!maxKnowledge || maxKnowledge < 100) return;

        db.all("SELECT COUNT(*) as total FROM inteligence", async (err, rows) => {
            if (err) return console.error("DB count error:", err.message);
            const total = rows[0]?.total || 0;
            if (total <= maxKnowledge) return;

            const excess = total - maxKnowledge;
            db.run(
                `DELETE FROM inteligence
                 WHERE id IN (
                     SELECT id FROM inteligence
                     ORDER BY usage_count ASC, id ASC
                     LIMIT ?
                 )`,
                [excess],
                function (delErr) {
                    if (delErr) console.error("Cleanup error:", delErr.message);
                    else console.log(`✅ ${this.changes} registros antigos removidos.`);
                }
            );
        });
    } catch (err) {
        console.error("Erro no enforceKnowledgeLimit:", err.message);
    }
}

// ==================================================
// 🔹 Embedding Local (Backup Seguro)
// ==================================================
async function getLocalEmbedding(text) {
    return Array.from(text).map((c, i) => ((c.charCodeAt(0) + i * 7) % 255) / 255);
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

delay(0).then(async function() {

});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Search MkAUth API
const MkAuth = async (UID, FIND, EXT = 'titulos', TYPE = 'titulo', MODE = true) => {
	var SEARCH, LIST, STATUS, PUSH = [],
		JSON = [],
		Json = undefined,
		JDebug = undefined,
		Jump;
	var Server = Debug('MKAUTH').client_link;

	if (Server == "tunel") {
		Server = Debug('MKAUTH').tunel;
	} else if (Server == "domain") {
		Server = Debug('MKAUTH').domain;
	}
	switch (FIND) {
		case 'open':
			FIND = 'aberto';
			break;
		case 'paid':
			FIND = 'pago';
			break;
		case 'due':
			FIND = 'vencido';
			break;
		case 'cancel':
			FIND = 'cancelado';
			break;
	}
	if (EXT == "list") {
		EXT = "listagem";
	}
	const Authentication = await axios.get('https://' + Server + '/api/', {
		auth: {
			username: Debug('MKAUTH').client_id,
			password: Debug('MKAUTH').client_secret
		}
	}).then(response => {
		return response.data;
	}).catch(err => {
		return false;
	});
	if (Authentication) {
		const MkSync = await axios.get('https://' + Server + '/api/' + TYPE + '/' + EXT + '/' + UID, {
			headers: {
				'Authorization': 'Bearer ' + Authentication
			}
		}).then(response => {
			if ((typeof response.data !== "object") && ((response.data).slice(-1) != '}')) {
				return JSON.parse((response.data).substring(0, (response.data).length - 1));
			} else {
				return response.data;
			}
		}).catch(err => {
			return false;
		});
		if (await MkSync.mensagem == undefined && await MkSync.error == undefined) {
			const SEARCH = await MkSync;
			const Keys = Object.keys(SEARCH).length;
			if (Keys == 0) {
				Syncron = undefined
			} else if (Keys <= 2) {
				Syncron = await SEARCH.titulos;
			} else if (Keys >= 3) {
				Syncron = await SEARCH;
			}
			if (Syncron != undefined) {
				(Syncron).someAsync(async (Send) => {
					if (EXT == 'titulos') {
						if ((Send.titulo == FIND.replace(/^0+/, '') || parseInt(Send.titulo) == parseInt(FIND)) || Send.linhadig == FIND) {
							var Bolix = '';
							if (Send.linhadig == undefined || Send.linhadig == null || Send.linhadig == "") {
								Send.linhadig = '';
								Json_Bar = "false";
							} else {
								switch (Debug('MKAUTH').mode) {
									case 'v1':
										Bolix = "http://" + Debug('MKAUTH').domain + "/boleto/boleto.hhvm?titulo=" + Send.uuid;
										break;
									case 'v2':
										Bolix = "http://" + Debug('MKAUTH').domain + "/boleto/boleto.hhvm?titulo=" + Send.titulo + "&contrato=" + Send.login;
										break;
								}

								Json_Bar = "true";
							}

							if (Send.pix == undefined || Send.pix == null || Send.pix == "") {
								Send.pix = '';
								Json_Pix = "false";
							} else {

								Json_Pix = "true";
							}
							if (Send.pix_qr == undefined || Send.pix_qr == null || Send.pix_qr == "") {
								Send.pix_qr = 'base64,';
								Json_QR = "false";
							} else {

								Json_QR = "true";
							}

							if (Send.pix_link == undefined || Send.pix_link == null || Send.pix_link == "") {
								Send.pix_link = '';
								Json_Link = "false";
							} else {
								Json_Link = "true";
							}
							var SEND = [];
							if (Boolean(Debug('MKAUTH').bar)) {
								SEND.push(Send.linhadig);
							}

							if (Boolean(Debug('MKAUTH').pix)) {
								SEND.push(Send.pix);
							}

							if (Boolean(Debug('MKAUTH').qrpix)) {
								SEND.push(Send.pix_qr);
							}

							if (Boolean(Debug('MKAUTH').qrlink)) {
								SEND.push(Send.pix_link);
							}

							if (Boolean(Debug('MKAUTH').pdf)) {
								SEND.push(Send.uuid);
							}
							if (SEND.length >= 1) {
								if (SEND.some(Row => Row == '')) {
									STATUS = "Null";
								} else {
									STATUS = Send.status;
								}
								Json = {
									"Status": STATUS,
									"ID": Send.titulo,
									"Name": Send.nome,
									"Payments": [{
											"value": Send.linhadig,
											"caption": "Bar",
											"status": Json_Bar
										},
										{
											"value": Send.pix,
											"caption": "Pix",
											"status": Json_Pix
										},
										{
											"value": Send.pix_qr.split("base64,")[1],
											"caption": "QRCode",
											"status": Json_QR
										},
										{
											"value": Send.pix_link,
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
							}
						}
					}

					if (EXT == 'listagem' || EXT == 'list') {
						LIST = [FIND];
						if (FIND == 'all') {
							LIST = [Send.status];
						}

						if (UID == "all") {
							Jump = true;
						} else {
							if (parseInt(UID) <= 9 && parseInt(UID.length) == 1) {
								UID = "0" + UID;
							}

							Jump = (Send.datavenc).includes(((DateTime()).split(" ")[0]).split("-")[0] + "-" + UID + "-");
							if ((UID).replace(/[^0-9\\.]+/g, '').length > 4) {
								Jump = (Send.datavenc).includes(UID + "-");
							}
						}
						if (Jump && LIST.some(Row => (Send.status.includes(Row) || Send.login.includes(Row) || Send.titulo.includes(Row))) && Send.cli_ativado == 's' && Send.status != 'cancelado') {
							switch (Send.status) {
								case 'aberto':
									Send.status = 'open';
									break;
								case 'pago':
									Send.status = 'paid';
									break;
								case 'vencido':
									Send.status = 'due';
									break;
								case 'cancelado':
									Send.status = 'cancel';
									break;
							}
							switch (Send.bloqueado) {
								case 'sim':
									Send.bloqueado = 'false';
									break;
								case 'nao':
									Send.bloqueado = 'true';
									break;
							}

							switch (Send.cli_ativado) {
								case 's':
									Send.cli_ativado = 'true';
									break;
								case 'n':
									Send.cli_ativado = 'false';
									break;
							}

							switch (Send.zap) {
								case 'sim':
									Send.zap = 'true';
									break;
								case 'nao':
									Send.zap = 'false';
									break;
							}

							if (Send.formapag != "dinheiro" && Send.formapag != undefined) {
								Send.formapag = "banco"
							}
							if (((Send.datavenc).split(" ")[0]) == (DateTime()).split(" ")[0] && (Send.status) != 'paid') {
								Send.status = 'open'
							}
							if (Send.celular != undefined) {
								Send.celular = (Send.celular).replace(/[^0-9\\.]+/g, '');
							}
							Json = {
								"Order": (new Date(Send.datavenc)).getDate(),
								"Identifier": Send.titulo,
								"Client": Send.nome,
								"Reward": Send.datavenc,
								"Payment": Send.status,
								"Connect": Send.login,
								"Contact": Send.celular,
								"Working": Send.cli_ativado,
								"unLock": Send.bloqueado,
								"LowSpeed": Send.dias_corte,
								"Ready": Send.zap,
								"Cash": Send.valorpag,
								"Gateway": Send.formapag
							};
							PUSH.push(Json);
							Json = (PUSH).sort(function(a, b) {
								var Nome = a.Client.localeCompare(b.Client);
								var Ordem = parseFloat(a.Order) - parseFloat(b.Order);
								return Ordem || Nome;
							});

						}
					}
				});
			}
			if (EXT == 'titulos') {
				if (Json == undefined) {
					Json = {
						"Status": "Error"
					};
					JDebug = {
						"MkAuth": "Cannot Find the Data > find"
					};

					Terminal(JDebug);
				} else {
					switch (Json.Status) {
						case 'aberto':
							Json.Status = 'open';
							break;
						case 'pago':
							Json.Status = 'paid';
							break;
						case 'vencido':
							Json.Status = 'due';
							break;
						case 'cancelado':
							Json.Status = 'cancel';
							break;
					}
					JDebug = {
						"Payment": Json.Status,
						"Client": Json.Name,
						"MkAuth": [{
								"Module": "Bar",
								"Available": Json["Payments"][0].status,
								"Allowed": "" + Debug('MKAUTH').bar + ""

							},
							{
								"Module": "Pix",
								"Available": Json["Payments"][1].status,
								"Allowed": "" + Debug('MKAUTH').pix + ""
							},
							{
								"Module": "QRC",
								"Available": Json["Payments"][2].status,
								"Allowed": "" + Debug('MKAUTH').qrpix + ""
							},
							{
								"Module": "QRL",
								"Available": Json["Payments"][3].status,
								"Allowed": "" + Debug('MKAUTH').qrlink + ""
							},
							{
								"Module": "PDF",
								"Available": Json["Payments"][4].status,
								"Allowed": "" + Debug('MKAUTH').pdf + ""
							}
						]
					}
					Terminal(JDebug);
				}
				return Json;
			}
			if (EXT == 'listagem' || EXT == 'list') {
				if (Json == undefined) {
					Json = {
						"Status": "Error"
					};
				} else {
					(Json).some(function(Send, index) {
						isJson = {
							"Order": (index + 1),
							"Identifier": Send.Identifier,
							"Client": Send.Client,
							"Reward": Send.Reward,
							"Payment": Send.Payment,
							"Connect": Send.Connect,
							"Contact": Send.Contact,
							"unLock": Send.unLock,
							"Working": Send.Working,
							"LowSpeed": Send.LowSpeed,
							"Ready": Send.Ready,
							"Cash": Send.Cash,
							"Gateway": Send.Gateway
						};
						JSON.push(isJson);
						Json = JSON;
					});
					Terminal(Json);
				}
				if (Json.Status == "Error") {
					return false;
				}
				return Json;
			}
		} else {
			if (await MkSync.mensagem != undefined || await MkSync.error != undefined) {
				if (EXT == 'titulos') {
					JDebug = {
						"MkAuth": "Cannot Find the Data > uid",
					};
					Terminal(JDebug);
					return false;
				}

				if (EXT == 'listagem' || EXT == 'list') {
					JDebug = {
						'MkAuth': 'Cannot Find the Data',
						'Request': UID,
						'Find': FIND
					};
					Terminal(JDebug);
					return false;
				}
			}
		}
	} else {
		return false;
	}
};
//Check is Json
function testJSON(text) {
	text = text.toString().replace(/"/g, "").replace(/'/g, "");
	text = text.toString().replace('uid:', '"uid":"').replace(',find:', '","find":"').replace('}', '"}');
	if (typeof text !== "string") {
		return false;
	}
	try {
		var json = JSON.parse(text);
		return (typeof json === 'object');
	} catch (error) {
		return false;
	}
}

// WhatsApp-web.js Functions
const client = new Client({
	authStrategy: new LocalAuth({
		clientId: Debug('OPTIONS').appname
	}),

	puppeteer: {
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-extensions',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
			'--no-zygote',
			'--single-process',
			'--disable-gpu'
		]
	},
});
io.on('connection', function(socket) {
	socket.emit('Version', Package.version);
	socket.emit('Manager', Debug('MKAUTH').aimbot);
	socket.emit('Patched', Release(Debug('RELEASE').mwsm));
	socket.emit('Reset', true);
	if (Session || Boolean(Debug('OPTIONS').auth)) {
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').authenticated);
		socket.emit('qr', Debug('RESOURCES').authenticated);
		socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').ready);
		socket.emit('qr', Debug('RESOURCES').ready);
		Session = false;
	} else {
		socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').connection);
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').connection);
		socket.emit('qr', Debug('RESOURCES').connection);
	}

	client.on('qr', (qr) => {
		if (!Session) {
			qrcode.toDataURL(qr, (err, url) => {
				socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').connection);
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').connection);
				socket.emit('qr', Debug('RESOURCES').connection);
				socket.emit('Reset', true);
				delay(1000).then(async function() {
					try {
						socket.emit('qr', url);
					} catch (err) {
						console.log('> ' + Debug('OPTIONS').appname + ' : ' + err);
						socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + err);
					} finally {
						socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').received);
						console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').received);
					}

				});
			});
		}
	});

	client.on('ready', async () => {
		if (!Boolean(Debug('OPTIONS').auth)) {
			await link.prepare('UPDATE options SET auth=?').run(1);
		}
		socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').ready);
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').ready);
		socket.emit('qr', Debug('RESOURCES').ready);
		await socket.emit('Reset', false);
		Session = true;
		if (!Permission) {
			Permission = true;
			await client.sendMessage(client.info.wid["_serialized"], "*Mwsm Token:*\n" + Password[1]);
			await GetUpdate(WServer, false);
			await WwjsVersion(false);
		}
	});

	client.on('authenticated', (data) => {
		socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').authenticated);
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').authenticated);
		socket.emit('qr', Debug('RESOURCES').authenticated);
		Session = true;
	});


	client.on('auth_failure', async () => {
		socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').auth_failure);
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').auth_failure);
		socket.emit('qr', Debug('RESOURCES').auth_failure);
		const unLoad = await link.prepare('UPDATE options SET auth=?').run(0);
		if (await unLoad) {
			socket.emit('Reset', true);
			Session = false;
			wwjsRun = true;
		}
	});


	client.on('disconnected', (reason) => {
		socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').disconnected);
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').disconnected);
		socket.emit('qr', Debug('RESOURCES').disconnected);
		db.run("UPDATE options SET auth=?, token=?", [false, null], (err) => {
			if (err) {
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + err)
			}
			Session = false;
			wwjsRun = true;
		});
		socket.emit('Reset', true);
	});


	client.on('loading_screen', (percent, message) => {
		Session = false;
		console.log('> ' + Debug('OPTIONS').appname + ' : Loading application', percent + '%');
		socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : Connecting Application ' + percent + '%');
		if (percent >= "100") {
			socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').authenticated);
			console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').authenticated);
			socket.emit('qr', Debug('RESOURCES').authenticated);
		} else {
			socket.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').connection);
			console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').connection);
			socket.emit('qr', Debug('RESOURCES').connection);
			socket.emit('Reset', true);
		}
		delay(1000).then(async function() {
			if (wwjsRun) {
				wwjsRun = false;
				WwjsVersion(true);
			}
		});
	});
	socket.emit('background', Debug('RESOURCES').background);
	socket.emit('donation', Debug('RESOURCES').about);
	socket.emit('developer', Debug('RESOURCES').developer);
	delay(2000).then(async function() {
		if (Permission) {
			await GetUpdate(WServer, false);
			await WwjsVersion(false);
		}
	});

});

// Reset
app.post('/reset', async (req, res) => {
	const Reset = req.body.reset;
	const Clear = req.body.erase;
	const unLoad = await link.prepare('UPDATE options SET auth=?').run(0);
	if (await unLoad) {
		global.io.emit('qr', Debug('RESOURCES').connection);
		global.io.emit('getlog', true);
		if (Clear == 'true') {
			const Eraser = await link.prepare('DELETE FROM target').run();
			if (await Eraser) {
				const FLUSH = await Dataset('SQLITE_SEQUENCE', 'SEQ', 'TARGET', 'FLUSH');
				res.json({
					Status: "Success"
				});
				global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').cleanon);
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').cleanon);
				if (await FLUSH) {
					delay(2000).then(async function() {
						await exec('npm run restart:mwsm');
					});
				}
			} else {
				res.json({
					Status: "Fail"
				});
				global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').cleanoff);
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').cleanoff);
				delay(2000).then(async function() {
					await exec('npm run restart:mwsm');
				});
			}
		} else {
			if (Reset == "true") {
				res.json({
					Status: undefined
				});
				global.io.emit('getlog', true);
				delay(0).then(async function() {
					await exec('npm run restart:mwsm');
				});
			}
		}
	}
});

// Shutdown
app.post('/shutdown', async (req, res) => {
	const Shutdown = req.body.shutdown;
	const Token = req.body.token;
	if (Shutdown == "true" && [Debug('OPTIONS').token, Password[1]].includes(Token)) {
		res.json({
			Status: "Success"
		});
		global.io.emit('getlog', true);
		global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').disconnected);
		console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').disconnected);
		global.io.emit('qr', Debug('RESOURCES').disconnected);
		const Logout = await client.logout();
		if (Logout) {
			db.run("UPDATE options SET auth=?, token=?", [false, null], (err) => {
				if (err) {
					console.log('> ' + Debug('OPTIONS').appname + ' : ' + err)
				}
				global.io.emit('Reset', true);
				Session = false;
			});
			const Destroy = await client.destroy();
			if (Destroy) {
				delay(0).then(async function() {
					await exec('npm run restart:mwsm');
				});
			}
		}
	} else {
		res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
		});
	}
});


// Authenticated
app.post('/authenticated', (req, res) => {
	if (Boolean(Debug('OPTIONS').auth)) {
		res.json({
			Status: "Success"
		});

	} else {
		res.json({
			Status: "Fail"
		});
	}
});

// Debug
app.post('/debug', (req, res) => {
	const debug = req.body.debug;
	if (Debug('OPTIONS').debugger != debug) {
		db.run("UPDATE options SET debugger=?", [debug], (err) => {
			if (err) {
				res.json({
					Status: "Fail",
					Return: Debug('OPTIONS').debugger
				});
			}
			res.json({
				Status: "Success",
				Return: debug
			});
		});
	}
});

// MkAuth Set Message
app.post('/send-mkauth', async (req, res) => {
	const User = req.body.user;
	const Client = req.body.client;
	const Code = req.body.code;
	const Status = req.body.status;
	const Reward = req.body.reward;
	const Push = req.body.push;
	const Token = req.body.token;
	const Cash = req.body.cash;
	const Gateway = req.body.gateway;
	const UnLock = req.body.unlock;
	const Option = req.body.option;
	const Speed = Debug('SCHEDULER').speed;
	const Block = Debug('SCHEDULER').block;
	const Factor = req.body.process
	var Contact = req.body.contact;
	var Process, Direct, Storange;
	var Pulse = DateTime();
	var Payment = req.body.payment;
	if (validPhone(Playground)) {
		Contact = '55' + Playground;
	}
	if (Option == "support") {
		Payment = "support";
	} else if ((Reward.split(" ")[0]) == (DateTime()).split(" ")[0] && Payment != "paid") {
		Payment = "open";
	}
	switch (await Payment) {
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
			if (Status.toLowerCase() != "finished") {
				Process = "Finished";
			}
			Direct = "Pay";
			break;
		case 'due':
			if ((Reward.split(" ")[0]) == (DateTime()).split(" ")[0]) {
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
					}
				} else {
					Message = DebugMsg("LATER");
				}
			} else {
				Message = DebugMsg("LATER");
			}
			if (Status.toLowerCase() == "pending" || Status.toLowerCase() == "fail") {
				Process = "Sent";
			} else if (Status.toLowerCase() == "sent" || Status.toLowerCase() == "resend") {
				Process = "Resend";
			}
			break;
		case 'open':
			if ((Reward.split(" ")[0]) == (DateTime()).split(" ")[0]) {
				Message = DebugMsg("DAY");
			} else {
				Message = DebugMsg("BEFORE");
			}
			if (Status.toLowerCase() == "pending" || Status.toLowerCase() == "fail") {
				Process = "Sent";
			} else if (Status.toLowerCase() == "sent" || Status.toLowerCase() == "resend") {
				Process = "Resend";
			}
			break;
		case 'support':
			Message = DebugMsg("SUPPORT");
			break;

	}
	Mensagem = Message.replaceAll('%nomeresumido%', toCapitalize(Client.split(" ")[0])).replaceAll('%vencimento%', new Date(Reward).toLocaleString("pt-br").split(",")[0]).replaceAll('%logincliente%', User).replaceAll('%valorpago%', Cash).replaceAll('%bloqatrazo%', Block).replaceAll('%metodo%', Gateway).replaceAll('%reduzatrazo%', Speed).replaceAll('%numerotitulo%', Code).replaceAll('%pagamento%', new Date(Pulse).toLocaleString("pt-br").split(",")[0] + " as " + (Pulse.split(" ")[1]).split(":")[0] + ":" + (Pulse.split(" ")[1]).split(":")[1]);
	if ([Debug('OPTIONS').token, Password[1]].includes(Token) && validPhone(Contact)) {
		const data = {
			to: '55' + Contact,
			msg: Mensagem,
			pass: Token,
			send: Direct,
			user: Client,
			auth: Debug('MKAUTH').aimbot
		};
		Start = false;
		const PostMessage = await axios.post("http://" + ip.address() + ":" + Debug('OPTIONS').access + "/send-message", data);
		if (await PostMessage) {
			if (PostMessage.data.Status == "Fail") {
				Process = "Fail";
			}
			if (Debug("STORANGE", "*", "DIRECT", Code).title == undefined) {
				Storange = await link.prepare("INSERT INTO storange(title, user, client, contact, reward, status, push) VALUES(?, ?, ?, ?, ?, ?, ?)").run(Code, User, Client, Contact, Reward, Process, Pulse);
			} else {
				Storange = db.run("UPDATE storange SET push=?, status=? WHERE title=?", [Pulse, Process, Code], (err) => {
					if (err) {
						return false;
					}
					return true;
				});
			}
			return res.json({
				Status: PostMessage.data.Status,
				Return: PostMessage.data.message,
				RPush: Pulse,
				RStatus: Process,
				RCode: Code
			});
		} else {
			res.json({
				Status: "Fail",
				Return: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error,
				RPush: Pulse,
				RStatus: Process,
				RCode: Code
			});
		}
	} else {
		Json = {
			"Mwsm": "/mwsm-message",
			"Main": "Mwsm",
			"Start": DateTime()
		};
		if (typeof Json === 'object') {
			Json = JSON.stringify(Json);
		}
		console.error(Print.bg.blue, Print.fg.white, Json, Print.reset);
		Process = "Fail";
		if (Debug("STORANGE", "*", "DIRECT", Code).title == undefined) {
			Storange = await link.prepare("INSERT INTO storange(title, user, client, contact, reward, status, push) VALUES(?, ?, ?, ?, ?, ?, ?)").run(Code, User, Client, Contact, Reward, Process, Pulse);
		} else {
			Storange = db.run("UPDATE storange SET push=?, status=? WHERE title=?", [Pulse, Process, Code], (err) => {
				if (err) {
					return false;
				}
				return true;
			});
		}


		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
		global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
		res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').missing,
			RPush: Pulse,
			RStatus: Process,
			RCode: Code

		});
	}
});


// API Update
app.post('/update', async (req, res) => {
	const UP = req.body.uptodate;
	if (Debug('RELEASE').isupdate != UP) {
		const Update = await Dataset('RELEASE', 'ISUPDATE', UP, 'UPDATE');
		if (Update) {
			res.json({
				Status: "Success",
				Return: UP
			});
		} else {
			res.json({
				Status: "Fail",
				Return: Debug('RELEASE').isupdate
			});

		}
	}
});


// API Protect
app.post('/protected', (req, res) => {
	const Protect = req.body.protect;
	if (Debug('OPTIONS').protect != Protect) {
		db.run("UPDATE options SET protect=?", [Protect], (err) => {
			if (err) {
				res.json({
					Status: "Fail",
					Return: Debug('OPTIONS').protect
				});
			}
			res.json({
				Status: "Success",
				Return: Protect
			});
		});
	}
});

// Tag
app.post('/tag', (req, res) => {
	const Tag = req.body.tag;
	if (Debug('OPTIONS').tag != Tag) {
		db.run("UPDATE options SET tag=?", [Tag], (err) => {
			if (err) {
				res.json({
					Status: "Fail",
					Return: Debug('OPTIONS').tag
				});
			}
			res.json({
				Status: "Success",
				Return: Tag
			});
		});
	}
});


// Backup
app.post('/backup', (req, res) => {
	const Backup = req.body.backup;
	if (Debug('MKAUTH').backup != Backup) {
		db.run("UPDATE mkauth SET backup=?", [Backup], (err) => {
			if (err) {
				res.json({
					Status: "Fail",
					Return: Debug('MKAUTH').backup
				});
			}
			res.json({
				Status: "Success",
				Return: Backup
			});
		});
	}
});

// Prevent
app.post('/prevent', (req, res) => {
	const Prevent = req.body.prevent;
	if (Debug('MKAUTH').prevent != Prevent) {
		db.run("UPDATE mkauth SET prevent=?", [Prevent], (err) => {
			if (err) {
				res.json({
					Status: "Fail",
					Return: Debug('MKAUTH').prevent
				});
			}
			res.json({
				Status: "Success",
				Return: Prevent
			});
		});
	}
});

// RegEx
app.post('/regex', (req, res) => {
	const RegEx = req.body.regex;
	if (Debug('OPTIONS').regex != RegEx) {
		db.run("UPDATE options SET regex=?", [RegEx], (err) => {
			if (err) {
				res.json({
					Status: "Fail",
					Return: Debug('OPTIONS').regex
				});
			}
			res.json({
				Status: "Success",
				Return: RegEx
			});
		});
	}
});

const Emoticons = async (FIND, IN, OUT) => {
	return link.prepare('SELECT ' + OUT + ' FROM emotions WHERE ' + IN + '= ?').get(FIND);
}
app.post('/emoji', async (req, res) => {
	const FIND = req.body.find;
	const IN = req.body.in;
	const OUT = req.body.out;
	if (IN == "emoji") {
		var Emoji = emoji.unemojify(FIND);
	} else {
		var Emoji = await Emoticons(FIND, IN, OUT);
	}
	if (await Emoji) {
		if (IN != "emoji" && IN != "socket") {
			switch (OUT) {
				case 'unicode':
					Emoji = Emoji.unicode;
					break;
				case 'html':
					Emoji = Emoji.html;
					break;
				case 'emoji':
					Emoji = Emoji.emoji;
					break;
				case 'name':
					Emoji = Emoji.name;
					break;
				case 'key':
					Emoji = Emoji.key;
					break;
			}

		}
		if (Emoji != undefined) {
			res.json({
				Status: "Success",
				Return: Emoji
			});
		} else {
			res.json({
				Status: "Fail",
				Return: FIND
			});
		}
	}
});

// Force Update
app.post('/forceupdate', async (req, res) => {
	const Update = req.body.update;
	if (Debug('RELEASE').isupdate != Update) {
		await Dataset('RELEASE', 'reload', 'true', 'UPDATE');
		const Register = await GetUpdate(WServer, true, true);
		await Dataset('RELEASE', 'reload', 'false', 'UPDATE');
		if (Register.Update == "true") {
			res.json({
				Status: "Success"
			});
		} else {
			res.json({
				Status: "Fail"
			});
		}
	} else {
		res.json({
			Status: "Fail"
		});
	}
});


// Force Bakcup
app.post('/forcebackup', async (req, res) => {
	await Dataset('RELEASE', 'reload', 'true', 'UPDATE');
	const Backup = req.body.backup;
	if (Boolean(Backup)) {
		const Reload = await SetSchedule(true);
		if (await Reload) {
			await Dataset('RELEASE', 'reload', 'false', 'UPDATE');
			return res.json({
				Status: "Success",
				Return: Debug('CONSOLE').schedule
			});
		} else {
			await Dataset('RELEASE', 'reload', 'false', 'UPDATE');
			return res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').request
			});
		}
	}
});



// Spam
app.post('/spam', (req, res) => {
	const Level = req.body.level;
	if (Debug('MKAUTH').level != Level) {
		db.run("UPDATE mkauth SET level=?", [Level], (err) => {
			if (err) {
				res.json({
					Status: "Fail",
					Return: Debug('MKAUTH').level
				});
			}
			res.json({
				Status: "Success",
				Return: Level
			});
		});
	}
});


// Shift
app.post('/shift', async (req, res) => {
	const Shift = req.body.shift;
	const Min = req.body.min;
	const Max = req.body.max;
	const hasShift = await Dataset('SCHEDULER', 'shift', Shift, 'UPDATE');
	if (await hasShift) {
		if (Boolean(Debug('SCHEDULER').shift)) {
			const hasMin = await Dataset('SCHEDULER', 'min', Min, 'UPDATE');
			const hasMax = await Dataset('SCHEDULER', 'max', Max, 'UPDATE');
			if (await hasMin && await hasMax) {
				res.json({
					Status: "Success",
					Return: true
				});
			} else {
				res.json({
					Status: "Fail",
					Return: false
				});

			}
		} else {
			const hasMin = await Dataset('SCHEDULER', 'min', '08', 'UPDATE');
			const hasMax = await Dataset('SCHEDULER', 'max', '22', 'UPDATE');
			if (await hasMin && await hasMax) {
				res.json({
					Status: "Success",
					Return: false
				});
			} else {
				res.json({
					Status: "Fail",
					Return: false
				});

			}
		}
	}
});

// Aimbot
app.post('/aimbot', async (req, res) => {
	const Aimbot = req.body.aimbot;
	const Base = await Dataset('MKAUTH', 'AIMBOT', Aimbot, 'UPDATE');
	if (await Base) {
		if (Boolean(Debug('MKAUTH').aimbot)) {
			res.json({
				Status: "Success",
				Return: true
			});

		} else {
			res.json({
				Status: "Success",
				Return: false
			});
		}
	} else {
		res.json({
			Status: "Fail",
			Return: false
		});
	}
});


// Token
app.post('/token', async (req, res) => {
	const Token = req.body.token;
	if ([Debug('OPTIONS').token, Password[1]].includes(Token)) {
		global.io.emit('interval', Debug('OPTIONS').interval);
		global.io.emit('sleep', Debug('OPTIONS').sleep);
		global.io.emit('sendwait', Debug('OPTIONS').sendwait);
		global.io.emit('response', Debug('OPTIONS').response);
		global.io.emit('call', Debug('OPTIONS').call);
		global.io.emit('access', Debug('OPTIONS').access);
		global.io.emit('port', Debug('OPTIONS').access);
		global.io.emit('pixfail', Debug('OPTIONS').pixfail);
		global.io.emit('replyes', Debug('OPTIONS').replyes);
		global.io.emit('alert', Debug('OPTIONS').alert);
		global.io.emit('count', Debug('OPTIONS').count);
		global.io.emit('onbot', Debug('OPTIONS').onbot);
		global.io.emit('reject', Debug('OPTIONS').reject);
		global.io.emit('limiter', Debug('OPTIONS').limiter);
		global.io.emit('domain', Debug('MKAUTH').domain);
		global.io.emit('tunel', Debug('MKAUTH').tunel);
		global.io.emit('username', Debug('MKAUTH').client_id);
		global.io.emit('password', Debug('MKAUTH').client_secret);
		global.io.emit('module', Debug('MKAUTH').module);
		global.io.emit('bar', Debug('MKAUTH').bar);
		global.io.emit('pix', Debug('MKAUTH').pix);
		global.io.emit('qrpix', Debug('MKAUTH').qrpix);
		global.io.emit('qrlink', Debug('MKAUTH').qrlink);
		global.io.emit('pdf', Debug('MKAUTH').pdf);
		global.io.emit('delay', Debug('MKAUTH').delay);
		global.io.emit('iserver', Debug('MKAUTH').client_link);
		global.io.emit('imode', Debug('MKAUTH').mode);

		global.io.emit('debugger', Debug('OPTIONS').debugger);
		global.io.emit('Tag', Debug('OPTIONS').tag);
		global.io.emit('regex', Debug('OPTIONS').regex);
		global.io.emit('uptodate', Debug('RELEASE').isupdate);
		global.io.emit('protected', Debug('OPTIONS').protect);
		global.io.emit('spam', Debug('MKAUTH').level);
		global.io.emit('backup', Debug('MKAUTH').backup);
		global.io.emit('aimbot', Debug('MKAUTH').aimbot);
		global.io.emit('doublekill', Debug('MKAUTH').prevent);
		global.io.emit('ismonth', (DateTime().split('-')[1]));
		global.io.emit('isyear', (DateTime().split('-')[0]));
		global.io.emit('issearch', 'all');

		global.io.emit('bfive', Debug('SCHEDULER').bfive);
		global.io.emit('inday', Debug('SCHEDULER').inday);
		global.io.emit('lfive', Debug('SCHEDULER').lfive);
		global.io.emit('lten', Debug('SCHEDULER').lten);
		global.io.emit('lfifteen', Debug('SCHEDULER').lfifteen);
		global.io.emit('ltwenty', Debug('SCHEDULER').ltwenty);
		global.io.emit('ltwentyfive', Debug('SCHEDULER').ltwentyfive);
		global.io.emit('lthirty', Debug('SCHEDULER').lthirty);
		global.io.emit('lthirtyfive', Debug('SCHEDULER').lthirtyfive);
		global.io.emit('lforty', Debug('SCHEDULER').lforty);
		global.io.emit('shift', Debug('SCHEDULER').shift);
		global.io.emit('min', AddZero(Debug('SCHEDULER').min));
		global.io.emit('max', Debug('SCHEDULER').max);


		global.io.emit('sunday', Debug('SCHEDULER').sunday);
		global.io.emit('monday', Debug('SCHEDULER').monday);
		global.io.emit('tuesday', Debug('SCHEDULER').tuesday);
		global.io.emit('wednesday', Debug('SCHEDULER').wednesday);
		global.io.emit('thursday', Debug('SCHEDULER').thursday);
		global.io.emit('friday', Debug('SCHEDULER').friday);
		global.io.emit('saturday', Debug('SCHEDULER').saturday);
		global.io.emit('morning', Debug('SCHEDULER').morning);
		global.io.emit('afternoon', Debug('SCHEDULER').afternoon);
		global.io.emit('night', Debug('SCHEDULER').night);

		global.io.emit('OnPay', Debug('SCHEDULER').onpay);
		global.io.emit('OnLock', Debug('SCHEDULER').onlock);
		global.io.emit('OnUnlock', Debug('SCHEDULER').onunlock);
		global.io.emit('OnMaintenance', Debug('SCHEDULER').onmaintenance);
		global.io.emit('OnUnistall', Debug('SCHEDULER').onunistall);

		global.io.emit('OnSpeed', Debug('SCHEDULER').onspeed);
		global.io.emit('OnBlock', Debug('SCHEDULER').onblock);
		global.io.emit('OnSupport', Debug('SCHEDULER').onsupport);
		global.io.emit('Speed', Debug('SCHEDULER').speed);
		global.io.emit('Block', Debug('SCHEDULER').block);
		global.io.emit('Crontab', Debug('SCHEDULER').cron);


		global.io.emit('A001', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').before));
		global.io.emit('A002', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').day));
		global.io.emit('A003', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').later));
		global.io.emit('A004', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').pay));
		global.io.emit('A005', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').lock));
		global.io.emit('A006', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').unlock));
		global.io.emit('A007', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').maintenance));
		global.io.emit('A008', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').unistall));

		global.io.emit('A009', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').speed));
		global.io.emit('A010', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').block));
		global.io.emit('A011', emoji.emojify(Debug('MESSAGE', '*', 'ID', '1').support));

		global.io.emit('B001', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').before));
		global.io.emit('B002', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').day));
		global.io.emit('B003', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').later));
		global.io.emit('B004', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').pay));
		global.io.emit('B005', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').lock));
		global.io.emit('B006', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').unlock));
		global.io.emit('B007', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').maintenance));
		global.io.emit('B008', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').unistall));

		global.io.emit('B009', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').speed));
		global.io.emit('B010', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').block));
		global.io.emit('B011', emoji.emojify(Debug('MESSAGE', '*', 'ID', '2').support));

		global.io.emit('C001', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').before));
		global.io.emit('C002', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').day));
		global.io.emit('C003', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').later));
		global.io.emit('C004', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').pay));
		global.io.emit('C005', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').lock));
		global.io.emit('C006', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').unlock));
		global.io.emit('C007', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').maintenance));
		global.io.emit('C008', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').unistall));

		global.io.emit('C009', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').speed));
		global.io.emit('C010', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').block));
		global.io.emit('C011', emoji.emojify(Debug('MESSAGE', '*', 'ID', '3').support));
		//
		//		if ((Debug('EMOTIONS', '*', 'ALL')).length >= 1) {
		//			var isEMOJI = [];
		//			Debug('EMOTIONS', '*', 'ALL').some(function(TARGET, index) {
		//				GetEmoji = {
		//					"ID": TARGET.id,
		//					"EMOJI": TARGET.emoji,
		//					"KEY": TARGET.key,
		//					"UNICODE": TARGET.unicode,
		//					"HTML": TARGET.html,
		//					"NAME": TARGET.name
		//				};
		//
		//				isEMOJI.push(GetEmoji);
		//				if (Debug('EMOTIONS', '*', 'ALL').length == (index + 1)) {
		//					global.io.emit('Emoji', isEMOJI);
		//				}
		//			});
		//		}
		//
		//
		if ((Debug('TARGET', '*', 'ALL')).length >= 1) {
			var isTARGET = [];
			Debug('TARGET', '*', 'ALL').some(function(TARGET, index) {
				if (TARGET.status == 'pending') {
					Dataset('TARGET', '*', TARGET.id, 'DELETE');
					Dataset('SQLITE_SEQUENCE', 'SEQ', 'TARGET', 'FLUSH');
				} else {
					if (TARGET.target == "900000000") {
						TARGET.target = "(00) 0 0000-0000";
					}

					GetLog = {
						"ID": TARGET.id,
						"TITLE": TARGET.title,
						"NAME": TARGET.client,
						"START": TARGET.start,
						"END": TARGET.end,
						"TARGET": TARGET.target,
						"STATUS": TARGET.status,
					};
					isTARGET.push(GetLog);
					if (Debug('TARGET', '*', 'ALL').length <= (index + 1)) {
						if (Boolean(Debug('OPTIONS').auth)) {
							global.io.emit('getlog', true);
							global.io.emit('setlog', isTARGET);

						}
					}
				}
			});

		} else {
			global.io.emit('getlog', false);
		}

		res.json({
			Status: "Success",
			Return: Debug('CONSOLE').right
		});


	} else {
		res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
		});
	}
});

// Set Options Mkauth
app.post('/options_mkauth', (req, res) => {
	const define = req.body.define;
	const enable = req.body.enable;
	db.run("UPDATE mkauth SET " + define + "=?", [enable], (err) => {
		if (err) {
			res.json({
				Status: "Fail",
				Return: Debug('MKAUTH').define
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
	const define = (req.body.define).toLowerCase();
	const enable = req.body.enable;
	db.run("UPDATE scheduler SET " + define + "=?", [enable], (err) => {
		if (err) {
			res.json({
				Status: "Fail",
				Return: Debug('SCHEDULER').define
			});
		}
		res.json({
			Status: "Success",
			Return: enable,
			Option: Debug('SCHEDULER').speed
		});
	});
});



// Get Clients Mkauth
app.post('/clients_mkauth', async (req, res) => {
	const Year = req.body.year;
	const Month = req.body.month;
	const Payment = req.body.payment;
	const Findex = (((DateTime()).split(" ")[0]).split("-")[0] - Year) + '-' + Month;
	const Master = await MkAuth(Findex, Payment, 'list');
	var hasTARGET = [];
	var PUSH, STATUS;
	if (await Master.Status == "Error" || !Master) {
		return res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').request
		});
	} else {
		(await Master).someAsync(async (TARGET) => {
			if (TARGET.Contact != undefined) {
				TARGET.Contact = (TARGET.Contact).replace(/[^0-9\\.]+/g, '');
			} else {
				TARGET.Contact = "00000000000";
			}
			try {
				TARGET.status = Debug("STORANGE", "*", "DIRECT", TARGET.Identifier).status;
			} catch (e) {
				TARGET.status = undefined;
			}

			try {
				TARGET.push = Debug("STORANGE", "*", "DIRECT", TARGET.Identifier).push;
			} catch (e) {
				TARGET.push = undefined;
			}
			GetClients = {
				"ORDER": TARGET.Order,
				"TITLE": TARGET.Identifier,
				"USER": TARGET.Connect,
				"CLIENT": TARGET.Client,
				"CONTACT": TARGET.Contact,
				"REWARD": TARGET.Reward,
				"PUSH": TARGET.push,
				"PAYMENT": TARGET.Payment,
				"STATUS": TARGET.status,
				"CASH": TARGET.Cash,
				"GATEWAY": TARGET.Gateway
			};
			hasTARGET.push(GetClients);
			if (Master.length == hasTARGET.length) {
				if (Boolean(Debug('OPTIONS').auth)) {
					global.io.emit('getclients', hasTARGET);
					return res.json({
						Status: "Success",
						Return: Debug('CONSOLE').successfully
					});

				}
			}

		});

	}
});


// Delay Mkauth
app.post('/delay_mkauth', (req, res) => {
	const range = req.body.range;
	if (Debug('MKAUTH').delay != range) {
		db.run("UPDATE mkauth SET delay=?", [range], (err) => {
			if (err) {
				res.json({
					Status: "Fail",
					Return: Debug('MKAUTH').delay
				});
			}
			res.json({
				Status: "Success",
				Return: range
			});
		});
	}
});



// Scheduler
app.post('/scheduler_mkauth', async (req, res) => {
	var isSHED = [];
	const exUpdate = await link.prepare('SELECT * FROM scheduling WHERE process=?').all("wait");
	if (exUpdate.length >= 1) {
		exUpdate.some(function(Send, index) {
			GetSHED = {
				"TITLE": Send.title,
				"CLIENT": Send.client,
				"REWARD": Send.reward
			};
			isSHED.push(GetSHED);
			if (exUpdate.length == (index + 1)) {
				global.io.emit('shedullers', isSHED);
				res.json({
					Status: "Success"
				});
			}
		});
	} else {
		res.json({
			Status: "Fail"
		});
	}
});




// Save Mkauth Messages
app.post('/message_mkauth', (req, res) => {
	const define = req.body.database
	const message = req.body.message
	const token = req.body.token
	const select = req.body.select
	if ([Debug('OPTIONS').token, Password[1]].includes(token)) {
		if (server != "" && message != "") {
			db.run("UPDATE message SET " + define + "=? WHERE id=?", [message, select], (err) => {
				if (err) {
					res.json({
						Status: "Fail",
						Return: Debug('CONSOLE').datafail
					});
				}
				res.json({
					Status: "Success",
					Return: Debug('CONSOLE').datasave
				});
			});
		} else {
			res.json({
				Status: "Fail"
			});

		}
	} else {
		res.json({
			Status: "Fail"
		});
	}

});



// Update SQLite
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
	if (Access != Debug('OPTIONS').access) {
		Reboot = true;
	} else {
		Reboot = false;
	}
	if (Response == "") {
		Response = Debug('OPTIONS').response;
	}
	if ([Debug('OPTIONS').token, Password[1]].includes(Token)) {
		if (Interval != "" && Sleep != "" && Sendwait != "" && Access != "" && Pixfail != "" && Count != "" && Limiter != "") {
			db.run("UPDATE options SET interval=?, sendwait=?, access=?, pixfail=?, response=?, replyes=?, onbot=?, count=?, limiter=?, sleep=?,  call=?,  reject=?,  alert=?", [Interval, Sendwait, Access, Pixfail, Response, Replyes, Onbot, Count, Limiter, Sleep, Call, Reject, Alert], (err) => {
				if (err) {
					res.json({
						Status: "Fail",
						Return: Debug('CONSOLE').failed
					});
				}
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').settings);
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
			});

		} else {
			res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').unnamed
			});
		}

	} else {
		res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
		});
	}
});

// Send From Mikrotik
app.get('/mikrotik/:pass/:to/:msg', async (req, res) => {
	const {
		to,
		msg,
		pass
	} = req.params;

	var isHid;
	if (Boolean(Debug('OPTIONS').protect)) {
		isHid = (pass);
	} else {
		if ((Debug('OPTIONS').token == "" || Debug('OPTIONS').protect == undefined)) {
			isHid = Password[1];
		} else {
			isHid = (Debug('OPTIONS').token);
		}
	}

	Json = {
		"Mwsm": "/mikrotik",
		"Main": "Mikrotik",
		"Start": DateTime()
	};
	if (typeof Json === 'object') {
		Json = JSON.stringify(Json);
	}
	console.error(Print.bg.blue, Print.fg.white, Json, Print.reset);


	var isWid = (to);
	if (validPhone(Playground)) {
		isWid = '55' + Playground;
	}
	const isDDI = isWid.substr(0, 2);
	const isDDD = isWid.substr(2, 2);
	const isCall = isWid.slice(-8);
	var WhatsApp = isWid + '@c.us';
	if ((isDDI == '55') && (parseInt(isDDD) <= 30)) {
		WhatsApp = isWid.substr(0, 4) + '9' + isCall + '@c.us';
	} else if ((isDDI == '55') && (parseInt(isDDD) > 30)) {
		WhatsApp = isWid.substr(0, 4) + isCall + '@c.us';
	}
	const Mensagem = (msg);

	if ([Debug('OPTIONS').token, Password[1]].includes(isHid) && validPhone(isWid)) {
		setTimeout(function() {
			client.sendMessage(WhatsApp, Mensagem).then(response => {
				console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success);
				return res.json({
					Status: "Success",
					message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
				});
			}).catch(err => {
				console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
				return res.status(500).json({
					Status: "Fail",
					message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
				});
				WwjsVersion(false);
			});

		}, Math.floor(Debug('OPTIONS').interval + Math.random() * 1000));
	} else {
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
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
	}) => {
		return msg;
	});

	if (!errors.isEmpty()) {
		return res.status(422).json({
			Status: "Fail",
			message: errors.mapped()
		});
	}

	Json = {
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

	var Contact = req.body.to;
	if (validPhone(Playground)) {
		Contact = '55' + Playground;
	}
	const isWid = (Contact).replace(/[^0-9\\.]+/g, '');
	const isDDI = isWid.substr(0, 2);
	const isDDD = isWid.substr(2, 2);
	const isCall = isWid.slice(-8);
	var WhatsApp = isWid + '@c.us';
	if ((isDDI == '55') && (parseInt(isDDD) <= 30)) {
		WhatsApp = isWid.substr(0, 4) + '9' + isCall + '@c.us';
	} else if ((isDDI == '55') && (parseInt(isDDD) > 30)) {
		WhatsApp = isWid.substr(0, 4) + isCall + '@c.us';
	}
	const Mensagem = (req.body.msg).replaceAll("\\n", "\r\n").split("##");

	const Reconstructor = new Promise((resolve, reject) => {
		if (Mensagem.some(Rows => Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Rows.includes(Row)))) {
			var Array = {};
			Mensagem.some(function(Send, index) {
				if (Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))) {
					const Cloud = async () => {
						let mimetype;
						const attachment = await axios.get(Url, {
							responseType: 'arraybuffer'
						}).then(response => {
							mimetype = response.headers['content-type'];
							return response.data.toString('base64');
						});
						return new MessageMedia(mimetype, attachment, 'Media');
					};


					console.log(WhatsApp + " - " + Mensagem);

					Cloud(Send).then(Return => {
						Array[Send] = Return;
						resolve(Array);
					}).catch(err => {
						resolve(undefined);
					});
				}
			});
		} else {
			resolve(undefined);
		}
	});

	delay(0).then(async function() {
		const Retorno = await Promise.all([Reconstructor]);
		var Assembly = [];
		var Sending = 1;
		Mensagem.some(function(Send, index) {
			if (Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))) {
				if (Retorno[0].hasOwnProperty(Send)) {
					Assembly.push(Retorno[0][Send]);
				}
			} else {
				Assembly.push(Send);
			}
		});
		Assembly.some(function(Send, index) {
			setTimeout(function() {

				var Preview = false;
				var Caption = "Media";

				if ([Debug('OPTIONS').token, Password[1]].includes(isHid) && validPhone(isWid)) {
					client.sendMessage(WhatsApp, isEmoji(Send), {
						caption: Caption,
						linkPreview: Preview
					}).then(response => {
						Wait = WhatsApp;
						Sending = (Sending + 1);
					}).catch(err => {
						console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
						return res.json({
							Status: "Fail",
							message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
						});
						WwjsVersion(false);
					});
				} else {
					console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
					return res.json({
						Status: "Fail",
						message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
					});
				}

				if (Sending >= Assembly.length) {
					console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success);
					return res.json({
						Status: "Success",
						message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
					});
				}
			}, index * Debug('OPTIONS').interval);
		});
	});
});

// Link Mkauth
app.post('/link_mkauth', async (req, res) => {
	const User = req.body.username;
	const Pass = req.body.password;
	const Domain = req.body.domain;
	const Tunel = req.body.tunel;
	const Module = req.body.module;
	const Token = req.body.token;
	const Server = req.body.server;
	const Mode = req.body.mode;
	var iServer;

	if (Server == "tunel") {
		iServer = Tunel;
	} else if (Server == "domain") {
		iServer = Domain;
	}

	var ConnAuth, ResAuth;
	if ([Debug('OPTIONS').token, Password[1]].includes(Token)) {
		const Authentication = await axios.get('https://' + iServer + '/api/', {
			auth: {
				username: User,
				password: Pass
			}
		}).then(response => {
			return response.data;
		}).catch(err => {
			return false;
		});
		ConnAuth = false;
		ResAuth = false;
		if (Authentication) {
			ConnAuth = true;
			const MkSync = await axios.get('https://' + iServer + '/api/titulo/listar/limite=1&pagina=1', {
				headers: {
					'Authorization': 'Bearer ' + Authentication
				}
			}).then(response => {
				return response.data;
			}).catch(err => {
				return false;
			});

			if ((MkSync.error == undefined)) {
				ResAuth = true;
				db.run("UPDATE mkauth SET client_id=?, client_secret=?, domain=?, tunel=?, mode=?, module=?, client_link=?", [User, Pass, Domain, Tunel, Mode, Module, Server], (err) => {
					if (err) {
						res.json({
							Status: "Fail",
							Return: Debug('CONSOLE').failed
						});
					}
					res.json({
						Status: "Success",
						Return: Debug('CONSOLE').mksuccess
					});
				});
			} else {
				res.json({
					Status: "Fail",
					Return: Debug('CONSOLE').refused
				});
			}
		} else {
			res.json({
				Status: "Fail",
				Return: Debug('CONSOLE').mkfail
			});
		}
		JDebug = {
			"MkAuth": [{
				"Authentication": "" + ConnAuth + "",
				"Communication": "" + ResAuth + ""
			}]
		};
		Terminal(JDebug);
	} else {
		res.json({
			Status: "Fail",
			Return: Debug('CONSOLE').wrong
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
	}) => {
		return msg;
	});

	if (!errors.isEmpty()) {
		return res.status(422).json({
			Status: "Fail",
			message: errors.mapped()
		});
	}

	const hasCaption = req.body.caption;
	const hasMimetype = req.body.mimetype;
	var isHid;

	Json = {
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
		var Contact = req.body.to;
		if (validPhone(Playground)) {
			Contact = '55' + Playground;
		}
		const isWid = (Contact).replace(/[^0-9\\.]+/g, '');
		const isDDI = isWid.substr(0, 2);
		const isDDD = isWid.substr(2, 2);
		const isCall = isWid.slice(-8);
		var WhatsApp = isWid + '@c.us';
		if ((isDDI == '55') && (parseInt(isDDD) <= 30)) {
			WhatsApp = isWid.substr(0, 4) + '9' + isCall + '@c.us';
		} else if ((isDDI == '55') && (parseInt(isDDD) > 30)) {
			WhatsApp = isWid.substr(0, 4) + isCall + '@c.us';
		}
		const Mensagem = new MessageMedia(hasMimetype, (req.body.image), 'Media');

		if ([Debug('OPTIONS').token, Password[1]].includes(isHid) && validPhone(isWid)) {
			client.sendMessage(WhatsApp, Mensagem, {
				caption: hasCaption,
				linkPreview: false
			}).then(response => {
				console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success);
				return res.status(200).json({
					Status: "Success",
					message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
				});
			}).catch(err => {
				console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
				return res.status(500).json({
					Status: "Fail",
					message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
				});
				WwjsVersion(false);
			});
		} else {
			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
			return res.status(500).json({
				Status: "Fail",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
			});
		}

	} else {
		global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger);
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
	}) => {
		return msg;
	});

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
	Json = {
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
		var Contact = req.body.to;
		if (validPhone(Playground)) {
			Contact = '55' + Playground;
		}
		const isWid = (Contact).replace(/[^0-9\\.]+/g, '');
		const isDDI = isWid.substr(0, 2);
		const isDDD = isWid.substr(2, 2);
		const isCall = isWid.slice(-8);
		var WhatsApp = isWid + '@c.us';
		if ((isDDI == '55') && (parseInt(isDDD) <= 30)) {
			WhatsApp = isWid.substr(0, 4) + '9' + isCall + '@c.us';
		} else if ((isDDI == '55') && (parseInt(isDDD) > 30)) {
			WhatsApp = isWid.substr(0, 4) + isCall + '@c.us';
		}
		const Mensagem = new MessageMedia(hasMimetype, (req.body.document), hasFileName);

		if ([Debug('OPTIONS').token, Password[1]].includes(isHid) && validPhone(isWid)) {
			client.sendMessage(WhatsApp, Mensagem, {
				caption: hasCaption,
				linkPreview: false
			}).then(response => {
				console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success);
				return res.status(200).json({
					Status: "Success",
					message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
				});
			}).catch(err => {
				console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
				return res.status(500).json({
					Status: "Fail",
					message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
				});
				WwjsVersion(false);
			});
		} else {
			console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
			return res.status(500).json({
				Status: "Fail",
				message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
			});
		}

	} else {
		global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger);
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger);

		return res.status(500).json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger
		});

	}
});


// Send Message
app.post('/send-message', [
	body('to').notEmpty(),
	body('msg').notEmpty(),
], async (req, res) => {
	const errors = validationResult(req).formatWith(({
		msg
	}) => {
		return msg;
	});

	if (!errors.isEmpty()) {
		return res.status(422).json({
			status: false,
			message: errors.mapped()
		});
	}
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

	var isAuth = req.body.auth,
		Manager, inCall = req.body.to;
	if (validPhone(Playground)) {
		inCall = '55' + Playground;
	}
	const isUser = req.body.user;
	const isSend = req.body.send;
	const Simulator = req.body.simulator;
	const isWid = (inCall).replace(/[^0-9\\.]+/g, '');
	const isDDI = isWid.substr(0, 2);
	const isDDD = isWid.substr(2, 2);
	const isCall = isWid.slice(-8);
	var WhatsApp = isWid + '@c.us';
	if ((isDDI == '55') && (parseInt(isDDD) <= 30)) {
		WhatsApp = isWid.substr(0, 4) + '9' + isCall + '@c.us';
	} else if ((isDDI == '55') && (parseInt(isDDD) > 30)) {
		WhatsApp = isWid.substr(0, 4) + isCall + '@c.us';
	}
	switch ((Boolean(Debug('MKAUTH').aimbot) == Boolean(isAuth))) {
		case true:
			Manager = "Mwsm";
			break;
		case false:
			Manager = "MkAuth";
			break;
	}
	Json = {
		"Mwsm": "/send-message",
		"Main": Manager,
		"Start": DateTime()
	};
	if (typeof Json === 'object') {
		Json = JSON.stringify(Json);
	}
	console.error(Print.bg.blue, Print.fg.white, Json, Print.reset);


	if (!Boolean(Debug('MKAUTH').aimbot)) {
		isAuth = true;
	}

	if (Boolean(isAuth) && validPhone(isWid)) {
		const Mensagem = (req.body.msg).replaceAll("\\n", "\r\n").split("##");
		if (Debug('OPTIONS').schedule <= Debug('OPTIONS').limiter) {
			var FUNCTION = [Debug('MKAUTH').bar, Debug('MKAUTH').pix, Debug('MKAUTH').qrpix, Debug('MKAUTH').qrlink, Debug('MKAUTH').pdf];
			const uID = await Dataset('TARGET', 'START', DateTime(), 'INSERT');
			if (uID == false) {
				uID = Debug('TARGET').id;
			}
			const Constructor = new Promise((resolve, reject) => {
				var Array = [];
				var Radeon = {};
				var Preview = false;
				var Caption, Send, Register, Renner;
				var RETURNS = [];
				Radeon['Title'] = 'xxx';
				Radeon['Name'] = 'Mwsm';
				if (isUser != undefined) {
					Radeon['Name'] = isUser;
				}
				if (isSend != undefined) {
					Radeon['Title'] = isSend;
				}

				if (Mensagem.some(Row => testJSON(Row)) && (FUNCTION.includes('true') || FUNCTION.includes('1')) && Boolean(Debug('MKAUTH').module)) {
					Mensagem.some(function(Send, index) {
						if (testJSON(Send) && (FUNCTION.includes('true') || FUNCTION.includes('1'))) {
							var Json = Send.toString().replace('"', '').split(',');
							isUid = Json[0].replace(/[{\}\\"]/g, '');
							if (isUid.split(':').length == 2) {
								isUid = isUid.split(':')[1];
							} else {
								isUid = (isUid).replace(isUid.split(':')[0], '');
								isUid = isUid.replace(/^:+/, '');
							}
							isFind = Json[1].replace(/[^0-9]/g, '');
							Json = {
								uid: isUid,
								find: isFind
							};
							Terminal(JSON.stringify(Json));
							MkAuth(Json.uid, Json.find).then(Synchronization => {
								if (Boolean(Debug('MKAUTH').bar)) {
									RETURNS.push('Bar');
								}
								if (Boolean(Debug('MKAUTH').pix)) {
									RETURNS.push('Pix');
								}

								if (Boolean(Debug('MKAUTH').qrpix)) {
									RETURNS.push('QRCode');
								}

								if (Boolean(Debug('MKAUTH').qrlink)) {
									RETURNS.push('Link');
								}

								if (Boolean(Debug('MKAUTH').pdf)) {
									RETURNS.push('Boleto');
								}
								if (Synchronization.ID != undefined) {
									Radeon['Title'] = Synchronization.ID;
									Radeon['Name'] = Synchronization.Name;
									db.run("UPDATE target SET title=? WHERE id=?", [Synchronization.ID, uID], (err) => {
										if (err) throw err;
									});
								}
								if (Synchronization.Status != "pago" && Synchronization.Status != "paid" && Synchronization.Status != "Error" && Synchronization.Status != "Null") {
									(Synchronization.Payments).forEach(function(GET, index) {
										if (RETURNS.includes(GET.caption)) {
											switch (GET.caption) {
												case 'Bar':
													Send = GET.value;
													Caption = GET.caption;
													break;
												case 'Pix':
													Send = GET.value;
													Caption = GET.caption;
													break;
												case 'QRCode':
													Send = new MessageMedia('image/png', GET.value, GET.caption);
													Caption = GET.caption;
													break;
												case 'Link':
													Send = GET.value;
													Caption = GET.caption;
													break;
												case 'Boleto':
													Send = GET.value;
													Caption = GET.caption;
													break;
											}
											if (Send != '') {
												Array.push(Send);
											}
										}
										if (((Synchronization.Payments).length == (index + 1))) {
											Radeon['Message'] = Array;
											resolve(Radeon);
										}
									});
								} else {
									if (Synchronization.Status == "Error") {
										Radeon['Message'] = "Error";
										resolve(Radeon);

									} else {
										if (Synchronization.Status == "Null") {
											Radeon['Message'] = "Null";
											resolve(Radeon);

										} else {
											Radeon['Message'] = "Fail";
											resolve(Radeon);

										}
									}
								}
							}).catch(err => {
								Radeon['Message'] = false;
								resolve(Radeon);

							});


						}
					});
				} else {

					if (Mensagem.some(Row => testJSON(Row))) {
						Mensagem.some(function(Send, index) {
							if (testJSON(Send)) {
								var Json = Send.toString().replace('"', '').split(',');
								isUid = Json[0].replace(/[{\}\\"]/g, '');
								if (isUid.split(':').length == 2) {
									isUid = isUid.split(':')[1];
								} else {
									isUid = (isUid).replace(isUid.split(':')[0], '');
									isUid = isUid.replace(/^:+/, '');
								}
								isFind = Json[1].replace(/[^0-9]/g, '');
								Json = {
									uid: isUid,
									find: isFind
								};
								Terminal(JSON.stringify(Json));
							}
						});

						if (Boolean(Debug('MKAUTH').module)) {
							if ((FUNCTION.includes('true') || FUNCTION.includes('1'))) {
								Radeon['Message'] = undefined;
							} else {
								Radeon['Message'] = "False";
							}
						} else {
							Radeon['Message'] = "Fatal";
							JDebug = {
								"MkAuth": "Connect was Failed",
							};
							Terminal(JDebug);
						}
						resolve(Radeon);
					} else {
						Radeon['Message'] = undefined;
						resolve(Radeon);
					}
				}
			});

			const Reconstructor = new Promise((resolve, reject) => {
				if (Mensagem.some(Row => Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Rows => Row.includes(Rows)))) {
					var isArray = {};
					(Mensagem).someAsync(async (Send) => {
						if (Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))) {
							const isCloud = async (Url) => {
								let isMimetype;
								const isAttachment = await axios.get(Url, {
									responseType: 'arraybuffer'
								}).then(response => {
									isMimetype = response.headers['content-type'];
									return response.data.toString('base64');
								});
								return await new MessageMedia(isMimetype, isAttachment, 'Media');
							};

							await isCloud(Send).then(Return => {
								isArray[Send] = Return;
								resolve(isArray);
							}).catch(err => {
								resolve(undefined);
							});

						}
					});
				} else {
					resolve(undefined);
				}
			});

			delay(0).then(async function() {
				const Retorno = await Promise.all([Constructor, Reconstructor]);
				var Boleto, PDF2Base64, Sleep = 0;
				if (Debug('MKAUTH').delay >= 3) {
					Sleep = (Sleep + (Debug('MKAUTH').delay * 1000));
				}
				if ((Retorno[0].Message != undefined) && (Retorno[0].Message != "Fail") && (Retorno[0].Message != "False") && (Retorno[0].Message != "Fatal") && (Retorno[0].Message != false) && (Retorno[0].Message != "Error") && (Retorno[0].Message != "Null")) {

					for (let i = 0; i < Retorno[0].Message.length; i++) {
						if (typeof Retorno[0].Message[i] === 'string') {
							if ((Retorno[0].Message[i].indexOf("boleto.hhvm") > -1)) {
								const UID = Retorno[0].Message[i].split("=")[1];
								Boleto = await Build(Retorno[0].Message[i]);
								PDF2Base64 = await new Promise((resolve, reject) => {
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
									}
								});
								Boleto = await PDF2Base64;
								if (fs.existsSync(__dirname + "/" + UID + ".pdf")) {
									fs.unlinkSync(__dirname + "/" + UID + ".pdf");
								}
							}
						}
					}
				}
				delay(Sleep).then(async function() {
					var Assembly = [];
					var Sending = 1;
					var Ryzen = 0;
					var PrevERROR = false;
					Mensagem.someAsync(async (Send) => {
						if (testJSON(Send)) {
							if ((Retorno[0].Message != undefined) && (Retorno[0].Message != "Fail") && (Retorno[0].Message != false) && (Retorno[0].Message != "Error") && (Retorno[0].Message != "Null") && (Retorno[0].Message != "Fatal") && (Retorno[0].Message != "False")) {
								for (let i = 0; i < Retorno[0].Message.length; i++) {
									Assembly.push(Retorno[0].Message[i]);
								}
							}
						} else {
							if (Debug('ATTACHMENTS', 'SUFFIXES', 'MULTIPLE').some(Row => Send.includes(Row))) {
								if (typeof Send === 'string') {
									if ((Send.indexOf("http") > -1)) {
										if (Retorno[1][Send] != undefined) {
											if (Retorno[1].hasOwnProperty(Send)) {
												Assembly.push(Retorno[1][Send]);
											}

										}
									} else {
										Assembly.push(Send);
									}
								} else {
									if (Retorno[1][Send] != undefined) {
										if (Retorno[1].hasOwnProperty(Send)) {
											Assembly.push(Retorno[1][Send]);
										}
									}
								}
							} else {
								Assembly.push(Send);
							}
						}
					});

					if (WhatsApp == Wait || Wait == undefined) {
						Delay = 300;
					} else {
						Delay = Debug('OPTIONS').sendwait;
					}
					if (Assembly.length >= 1) {
						if ((Retorno[0].Message == "Fail") || (Retorno[0].Message == false) || (Retorno[0].Message == "Error") || (Retorno[0].Message == "Null") || (Retorno[0].Message == "Fatal") || (Retorno[0].Message == "False")) {
							global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
							console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
							if (Retorno[0].Message == "Fail") {
								res.json({
									Status: "Fail",
									message: Debug('CONSOLE').unavailable
								});
							}
							if (Retorno[0].Message == "Error") {
								res.json({
									Status: "Fail",
									message: Debug('CONSOLE').request
								});
							}
							if (Retorno[0].Message == "Null") {
								res.json({
									Status: "Fail",
									message: Debug('CONSOLE').missing
								});
							}

							if (Retorno[0].Message == "Fatal") {
								res.json({
									Status: "Fail",
									message: Debug('CONSOLE').mkfail
								});
							}

							if (Retorno[0].Message == "False") {
								res.json({
									Status: "Fail",
									message: Debug('CONSOLE').mkunselect
								});
							}

							if (Retorno[0].Message == false) {
								var SELECTOR = false;
								if (Boolean(Debug('MKAUTH').bar)) {
									SELECTOR = true;
								}

								if (Boolean(Debug('MKAUTH').pix)) {
									SELECTOR = true;
								}

								if (Boolean(Debug('MKAUTH').qrpix)) {
									SELECTOR = true;
								}

								if (Boolean(Debug('MKAUTH').qrlink)) {
									SELECTOR = true;
								}

								if (Boolean(Debug('MKAUTH').pdf)) {
									SELECTOR = true;
								}
								Retorno[0].Message = "Fail";
								if (SELECTOR) {
									return res.json({
										Status: "Fail",
										message: Debug('CONSOLE').refused
									});
								} else {
									return res.json({
										Status: "Fail",
										message: Debug('CONSOLE').mkunselect
									});
								}
							}
							db.get("SELECT * FROM target WHERE id='" + uID + "'", (err, TARGET) => {
								if (TARGET != undefined) {
									if (Retorno[0].Title == "xxx") {
										Retorno[0].Title = uID;
									}
									if (Retorno[0].Message == undefined) {
										Retorno[0].Message = "Null";
									}
									if (Retorno[0].Message == "False") {
										Retorno[0].Message = "Fail";
									}

									db.serialize(() => {
										db.run("UPDATE target SET end=?, status=?, target=?, title=?, client=? WHERE id=?", [DateTime(), Retorno[0].Message, WhatsApp.replace(/^55+/, '').replace(/\D/g, ''), Retorno[0].Title, Retorno[0].Name, uID], (err) => {
											if (err) throw err;
										});
										db.get("SELECT * FROM target WHERE id='" + uID + "'", (err, TARGET) => {
											isTARGET = [];
											if (TARGET != undefined) {
												Debug('TARGET', '*', 'ALL').some(function(TARGET, index) {
													if (TARGET.status == 'pending') {
														Dataset('TARGET', '*', TARGET.id, 'DELETE');
														Dataset('SQLITE_SEQUENCE', 'SEQ', 'TARGET', 'FLUSH');
													} else {
														if (TARGET.target == "900000000") {
															TARGET.target = "(00) 0 0000-0000";
														}
														GetLog = {
															"ID": TARGET.id,
															"TITLE": TARGET.title,
															"NAME": TARGET.client,
															"START": TARGET.start,
															"END": TARGET.end,
															"TARGET": TARGET.target,
															"STATUS": TARGET.status,
														};
														isTARGET.push(GetLog);
														if (Debug('TARGET', '*', 'ALL').length <= (index + 1)) {
															if (Boolean(Debug('OPTIONS').auth)) {
																global.io.emit('setlog', isTARGET);
															}
														}
													}

												});
											}
										});
									});
								}
							});
						} else {
							Terminal(Assembly);
							setTimeout(function() {
								var DoubleKill;
								Assembly.some(function(Send, index) {
									const PIXFAIL = [undefined, "XXX", null, ""];
									if (!PIXFAIL.includes(Debug('OPTIONS').pixfail) && Send == "CodigoIndisponivel") {
										Send = Send.replace("CodigoIndisponivel", Debug('OPTIONS').pixfail);
									}
									setTimeout(function() {
										setTimeout(function() {
											if (typeof Send === 'string') {
												if ((Send.indexOf("boleto.hhvm") > -1)) {
													if (Boleto != undefined) {
														if (typeof Boleto !== 'string') {
															Send = Boleto;
														}
													}
													Caption = "Boleto";
													Preview = true;
													Ryzen = 1000;
												} else {
													if ((Send.indexOf("http") > -1)) {
														Caption = undefined;
														Preview = true;
													} else {
														Caption = undefined;
														Preview = false;
													}
												}
											} else {
												if (JSON.parse(JSON.stringify(Send)).filename != "Media") {
													Caption = JSON.parse(JSON.stringify(Send)).filename;
													Preview = false;
												} else {
													Caption = undefined;
													Preview = false;
												}
												Ryzen = 1000;
											}


											if ([Debug('OPTIONS').token, Password[1]].includes(isHid)) {
												(async () => {
													if (Boolean(Debug('MKAUTH').prevent)) {
														if (DoubleKill != Send) {
															try {
																await client.sendMessage(WhatsApp, isEmoji(Send), {
																	caption: Caption,
																	linkPreview: Preview
																});
															} catch (err) {
																return res.status(500).json({
																	Status: "Fail",
																	message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
																});
																await WwjsVersion(false);
															} finally {
																DoubleKill = Send;
																Wait = WhatsApp;
																Sending = (Sending + 1);
															}
														}
													} else {
														try {
															await client.sendMessage(WhatsApp, isEmoji(Send), {
																caption: Caption,
																linkPreview: Preview
															});
														} catch (err) {
															return res.status(500).json({
																Status: "Fail",
																message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
															});
															await WwjsVersion(false);
														} finally {
															Wait = WhatsApp;
															Sending = (Sending + 1);
														}
													}
												})();
											} else {

												return res.status(500).json({
													Status: "Fail",
													message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
												});

											}

											if ((Sending == Assembly.length) || (Assembly.length == (index + 1))) {

												db.get("SELECT * FROM target WHERE id='" + uID + "'", (err, TARGET) => {
													if (TARGET != undefined) {

														if (Retorno[0].Title == "xxx") {
															Retorno[0].Title = Debug('TARGET').id;
														}
														if (Retorno[0].Message == undefined) {
															Retorno[0].Message = "Null";
														}
														if (Retorno[0].Message == "False") {
															Retorno[0].Message = "Fail";
														}


														db.serialize(() => {
															db.run("UPDATE target SET end=?, status=?, target=?, title=?, client=? WHERE id=?", [DateTime(), 'Sent', WhatsApp.replace(/^55+/, '').replace(/\D/g, ''), Retorno[0].Title, Retorno[0].Name, uID], (err) => {

																if (err) throw err;
															});
															db.get("SELECT * FROM target WHERE id='" + uID + "'", (err, TARGET) => {
																isTARGET = [];
																if (TARGET != undefined) {
																	Debug('TARGET', '*', 'ALL').some(function(TARGET, index) {
																		if (TARGET.status == 'pending') {
																			Dataset('TARGET', '*', TARGET.id, 'DELETE');
																			Dataset('SQLITE_SEQUENCE', 'SEQ', 'TARGET', 'FLUSH');
																		} else {
																			if (TARGET.target == "900000000") {
																				TARGET.target = "(00) 0 0000-0000";
																			}
																			GetLog = {
																				"ID": TARGET.id,
																				"TITLE": TARGET.title,
																				"NAME": TARGET.client,
																				"START": TARGET.start,
																				"END": TARGET.end,
																				"TARGET": TARGET.target,
																				"STATUS": TARGET.status,
																			};
																			isTARGET.push(GetLog);
																			if (Debug('TARGET', '*', 'ALL').length <= (index + 1)) {
																				if (Boolean(Debug('OPTIONS').auth)) {
																					global.io.emit('setlog', isTARGET);
																				}
																			}
																		}

																	});
																}
															});
														});
													}
												});

												console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success);
												return res.json({
													Status: "Success",
													message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').success
												});

											}
										}, ((Debug('MKAUTH').delay + index) * Ryzen));
									}, (index) * Debug('OPTIONS').interval);
								});
							}, Math.floor(Delay + Math.random() * 1000));
						}
					} else {
						if (Boolean(Debug('MKAUTH').module)) {
							if (Retorno[0].Message == "Fail" || Retorno[0].Message == false || (Retorno[0].Message == "Error") || (Retorno[0].Message == "Null") || (Retorno[0].Message == "Fatal") || (Retorno[0].Message == "False")) {
								global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
								console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);

								if (Retorno[0].Message == "Fail") {
									res.json({
										Status: "Fail",
										message: Debug('CONSOLE').unavailable
									});
								}
								if (Retorno[0].Message == "Error") {
									res.json({
										Status: "Fail",
										message: Debug('CONSOLE').request
									});
								}
								if (Retorno[0].Message == "Null") {
									res.json({
										Status: "Fail",
										message: Debug('CONSOLE').missing
									});
								}

								if (Retorno[0].Message == "Fatal") {
									res.json({
										Status: "Fail",
										message: Debug('CONSOLE').mkfail
									});
								}

								if (Retorno[0].Message == "False") {
									res.json({
										Status: "Fail",
										message: Debug('CONSOLE').mkunselect
									});
								}
								if (Retorno[0].Message == false) {
									var SELECTOR = false;
									if (Boolean(Debug('MKAUTH').bar)) {
										SELECTOR = true;
									}

									if (Boolean(Debug('MKAUTH').pix)) {
										SELECTOR = true;
									}

									if (Boolean(Debug('MKAUTH').qrpix)) {
										SELECTOR = true;
									}

									if (Boolean(Debug('MKAUTH').qrlink)) {
										SELECTOR = true;
									}

									if (Boolean(Debug('MKAUTH').pdf)) {
										SELECTOR = true;
									}
									Retorno[0].Message = "Fail";
									if (SELECTOR) {

										return res.json({
											Status: "Fail",
											message: Debug('CONSOLE').refused
										});
									} else {
										return res.json({
											Status: "Fail",
											message: Debug('CONSOLE').mkunselect
										});
									}
								}

								db.get("SELECT * FROM target WHERE id='" + Debug('TARGET').id + "'", (err, TARGET) => {
									if (TARGET != undefined) {

										if (Retorno[0].Title == "xxx") {
											Retorno[0].Title = Debug('TARGET').id;
										}
										if (Retorno[0].Message == undefined) {
											Retorno[0].Message = "Null";
										}
										if (Retorno[0].Message == "False") {
											Retorno[0].Message = "Fail";
										}


										db.serialize(() => {
											db.run("UPDATE target SET end=?, status=?, target=?, title=? WHERE id=?", [DateTime(), Retorno[0].Message, WhatsApp.replace(/^55+/, '').replace(/\D/g, ''), Retorno[0].Title, uID], (err) => {

												if (err) throw err;
											});
											db.get("SELECT * FROM target WHERE id='" + uID + "'", (err, TARGET) => {
												isTARGET = [];
												if (TARGET != undefined) {
													Debug('TARGET', '*', 'ALL').some(function(TARGET, index) {
														if (TARGET.status == 'pending') {
															Dataset('TARGET', '*', TARGET.id, 'DELETE');
															Dataset('SQLITE_SEQUENCE', 'SEQ', 'TARGET', 'FLUSH');
														} else {
															if (TARGET.target == "900000000") {
																TARGET.target = "(00) 0 0000-0000";
															}
															GetLog = {
																"ID": TARGET.id,
																"TITLE": TARGET.title,
																"NAME": TARGET.client,
																"START": TARGET.start,
																"END": TARGET.end,
																"TARGET": TARGET.target,
																"STATUS": TARGET.status,
															};
															isTARGET.push(GetLog);
															if (Debug('TARGET', '*', 'ALL').length <= (index + 1)) {
																if (Boolean(Debug('OPTIONS').auth)) {
																	global.io.emit('setlog', isTARGET);
																}
															}
														}

													});
												}
											});
										});
									}
								});
							} else {
								if ((Debug('TARGET', '*', 'ALL')).length >= 1) {

									db.get("SELECT * FROM target WHERE id='" + uID + "'", (err, TARGET) => {
										if (TARGET != undefined) {

											if (Retorno[0].Title == "xxx") {
												Retorno[0].Title = uID;
											}
											if (Retorno[0].Message == undefined) {
												Retorno[0].Message = "Null";
											}
											if (Retorno[0].Message == "False") {
												Retorno[0].Message = "Fail";
											}

											db.serialize(() => {
												db.run("UPDATE target SET end=?, status=?, target=?, title=? WHERE id=?", [DateTime(), Retorno[0].Message, WhatsApp.replace(/^55+/, '').replace(/\D/g, ''), Retorno[0].Title, uID], (err) => {

													if (err) throw err;
												});
												db.get("SELECT * FROM target WHERE id='" + uID + "'", (err, TARGET) => {
													isTARGET = [];
													if (TARGET != undefined) {
														Debug('TARGET', '*', 'ALL').some(function(TARGET, index) {
															if (TARGET.status == 'pending') {
																Dataset('TARGET', '*', TARGET.id, 'DELETE');
																Dataset('SQLITE_SEQUENCE', 'SEQ', 'TARGET', 'FLUSH');
															} else {
																if (TARGET.target == "900000000") {
																	TARGET.target = "(00) 0 0000-0000";
																}
																GetLog = {
																	"ID": TARGET.id,
																	"TITLE": TARGET.title,
																	"NAME": TARGET.client,
																	"START": TARGET.start,
																	"END": TARGET.end,
																	"TARGET": TARGET.target,
																	"STATUS": TARGET.status,
																};
																isTARGET.push(GetLog);
																if (Debug('TARGET', '*', 'ALL').length <= (index + 1)) {
																	if (Boolean(Debug('OPTIONS').auth)) {
																		global.io.emit('setlog', isTARGET);
																	}
																}
															}

														});
													}
												});
											});
										}
									});

								} else {
									global.io.emit('getlog', true);

								}

								return res.json({
									Status: "Fail",
									message: Debug('CONSOLE').mkunselect
								});
							}
						} else {

							if (!Boolean(Debug('MKAUTH').module)) {
								Retorno[0].Message = "Fail";
								return res.json({
									Status: "Fail",
									message: Debug('CONSOLE').mkfail
								});

							} else {
								return res.json({
									Status: "Fail",
									message: Debug('CONSOLE').unnamed
								});
							}

							if ((Debug('TARGET', '*', 'ALL')).length >= 1) {
								db.get("SELECT * FROM target WHERE id='" + uID + "'", (err, TARGET) => {
									if (TARGET != undefined) {

										if (Retorno[0].Title == "xxx") {
											Retorno[0].Title = Debug('TARGET').id;
										}

										if (Retorno[0].Message == undefined) {
											Retorno[0].Message = "Null";
										}

										if (Retorno[0].Message == "False") {
											Retorno[0].Message = "Fail";
										}

										db.serialize(() => {
											db.run("UPDATE target SET end=?, status=?, target=?, title=? WHERE id=?", [DateTime(), Retorno[0].Message, WhatsApp.replace(/^55+/, '').replace(/\D/g, ''), Retorno[0].Title, uID], (err) => {

												if (err) throw err;
											});
											db.get("SELECT * FROM target WHERE id='" + uID + "'", (err, TARGET) => {
												isTARGET = [];
												if (TARGET != undefined) {
													Debug('TARGET', '*', 'ALL').some(function(TARGET, index) {
														if (TARGET.status == 'pending') {
															Dataset('TARGET', '*', TARGET.id, 'DELETE');
															Dataset('SQLITE_SEQUENCE', 'SEQ', 'TARGET', 'FLUSH');
														} else {
															if (TARGET.target == "900000000") {
																TARGET.target = "(00) 0 0000-0000";
															}
															GetLog = {
																"ID": TARGET.id,
																"TITLE": TARGET.title,
																"NAME": TARGET.client,
																"START": TARGET.start,
																"END": TARGET.end,
																"TARGET": TARGET.target,
																"STATUS": TARGET.status,
															};
															isTARGET.push(GetLog);
															if (Debug('TARGET', '*', 'ALL').length <= (index + 1)) {
																if (Boolean(Debug('OPTIONS').auth)) {
																	global.io.emit('setlog', isTARGET);
																}
															}
														}

													});
												}
											});
										});
									}
								});

							} else {
								global.io.emit('getlog', true);

							}

						}
					}
				});
			});
		} else {
			console.log("Mensagem Agendada");
		}
	} else if (Boolean(Simulator)) {
		global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);

		return res.json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
		});

	} else if (Boolean(Debug('MKAUTH').aimbot)) {
		global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger);
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger);

		return res.status(500).json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').trigger
		});
	} else {
		global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);
		console.error('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error);

		return res.status(500).json({
			Status: "Fail",
			message: Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').error
		});
	}
});

// Html to PDF
app.get('/build', [
	body('uid').notEmpty()
], async (req, res) => {
	const errors = validationResult(req).formatWith(({
		uid
	}) => {
		return uid;
	});
	if (!errors.isEmpty()) {
		return res.status(422).json({
			status: false,
			message: errors.mapped()
		});
	}
	const GET = req.body.uid;
	const UID = GET.split('=')[1];
	const URL = ([GET]);
	URL.someAsync(async (Send) => {
		htmlPDF.setOptions({
			format: "A4",
			timeout: 5000
		});
		htmlPDF.setAutoCloseBrowser(false);
		const Buffer = await htmlPDF.create(Send);
		const Patch = `${__dirname}/${UID}.pdf`;
		await htmlPDF.writeFile(Buffer, Patch);
		return res.json({
			Return: "http://" + ip.address() + ":" + Debug('OPTIONS').access + "/" + UID + ".pdf"
		});
		await htmlPDF.closeBrowser();
	});
});

const Build = async (SET) => {
	const PDFGet = await axios.get("http://" + ip.address() + ":" + Debug('OPTIONS').access + "/build", {
		data: {
			uid: SET,
		}
	}).then(response => {
		return response.data;
	}).catch(err => {
		return false;
	});
	return await PDFGet['Return'];
};


// WhatsApp Bot
client.on('message', async msg => {

// ==================================================
// 🤖 Bot Menu e Controle Inteligente de IA
// ==================================================
const lastRequestTimes = new Map();
let lastGlobalRequest = 0;
let globalQueue = Promise.resolve();

if (activeMenus.has(msg.from)) {
    if (activeSupportIA.has(msg.from)) {
        try {
            const _iaExit = (msg.body || '').toString().trim().toLowerCase();

            // 🔹 Encerrar atendimento
            if (["0", "sair", "tchau", "tchal"].includes(_iaExit)) {
                activeSupportIA.delete(msg.from);
                activeMenus.delete(msg.from);
                await client.sendMessage(msg.from, "✅ Atendimento encerrado. Obrigado pelo contato!");
                return;
            }

            // 🔹 Voltar ao menu principal
            if (_iaExit === "menu") {
                activeSupportIA.delete(msg.from);
                activeMenus.set(msg.from, true);
                await client.sendMessage(
                    msg.from,
                    '📋 *Menu Principal*\n\n' +
                    '1️⃣ Boleto\n' +
                    '2️⃣ Suporte\n' +
                    '0️⃣ Encerrar\n\n' +
                    '👉 Responda com o número da opção desejada.'
                );
                return;
            }
        } catch (e) {
            console.error('IA exit handler error:', e?.message || e);
        }

        try {
            const chat = await msg.getChat();
            const Engine = Debug('OPTIONS').engine;
            const Level = parseInt(Debug("ENGINE", "*", "DIRECT", Engine).level || 0);
            const perUserDelay = parseInt(Debug('OPTIONS').airequestdelay) || 3000;
            const globalDelay = parseInt(Debug('OPTIONS').aiglobaldelay) || 1000;

            const now = Date.now();
            const lastUser = lastRequestTimes.get(msg.from) || 0;
            const sinceUser = now - lastUser;
            const sinceGlobal = now - lastGlobalRequest;
            const waitUser = Math.max(0, perUserDelay - sinceUser);
            const waitGlobal = Math.max(0, globalDelay - sinceGlobal);
            const totalWait = Math.max(waitUser, waitGlobal);

            // ==================================================
            // 🔹 Modo Free — com fila e controle global
            // ==================================================
            if (Level === 0) {
                globalQueue = globalQueue.then(async () => {
                    try {
                        if (totalWait > 0) {
                            const typingInterval = setInterval(async () => {
                                try { await chat.sendStateTyping(); } catch {}
                            }, 4000);

                            await new Promise(r => setTimeout(r, totalWait));
                            clearInterval(typingInterval);
                            try { await chat.clearState(); } catch {}
                        }

                        lastRequestTimes.set(msg.from, Date.now());
                        lastGlobalRequest = Date.now();

                        const tLevel = parseInt(Debug('OPTIONS').typingspeed);
                        const multiplier = 1 + (5 - tLevel) * 0.25;
                        const baseTime = 800 * multiplier;
                        const extraPerChar = 25 * multiplier;
                        const maxTime = 4000 * multiplier;
                        const estimatedDelay = Math.min(baseTime + msg.body.length * extraPerChar, maxTime);

                        await chat.sendStateTyping();
                        await new Promise(resolve => setTimeout(resolve, estimatedDelay));
                        await chat.clearState();

                        const reply = await askAI(msg.body);
                        await client.sendMessage(msg.from, reply);
                    } catch (err) {
                        console.error("Erro ao processar IA (free):", err.message);
                        try {
                            const reply = await askAI(msg.body);
                            await client.sendMessage(msg.from, reply);
                        } catch (e2) {
                            console.error("Erro secundário:", e2.message);
                        }
                    }
                }).catch(e => console.error("Erro na fila global:", e.message));
            } 
            
            // ==================================================
            // 🔹 Modo Premium — Resposta direta (sem fila)
            // ==================================================
            else {
                const tLevel = parseInt(Debug('OPTIONS').typingspeed);
                const multiplier = 1 + (5 - tLevel) * 0.25;
                const baseTime = 800 * multiplier;
                const extraPerChar = 25 * multiplier;
                const maxTime = 4000 * multiplier;
                const estimatedDelay = Math.min(baseTime + msg.body.length * extraPerChar, maxTime);

                await chat.sendStateTyping();
                await new Promise(r => setTimeout(r, estimatedDelay));
                await chat.clearState();

                const reply = await askAI(msg.body);
                await client.sendMessage(msg.from, reply);
            }

        } catch (err) {
            console.error("Erro ao simular digitando:", err.message);
            try {
                const reply = await askAI(msg.body);
                await client.sendMessage(msg.from, reply);
            } catch (e2) {
                console.error("Erro no fallback de IA:", e2.message);
            }
        }
        return;
    }

    // ==================================================
    // 📋 Menu principal
    // ==================================================
    if (msg.body.startsWith('1')) {
        await client.sendMessage(msg.from, '🔗 Aqui está o link do seu boleto: https://seudominio.com/boleto');
        return;
    }

    if (msg.body.startsWith('2')) {
        await client.sendMessage(msg.from, '🤖 Você está agora em atendimento de suporte com IA. Envie sua dúvida.');
        activeSupportIA.set(msg.from, true);
        return;
    }

    if (msg.body.startsWith('0')) {
        await client.sendMessage(msg.from, '✅ Atendimento encerrado. Obrigado pelo contato!');
        activeMenus.delete(msg.from);
        return;
    }
}

	if (msg.body.toLowerCase() === 'menu') {
		activeMenus.set(msg.from, true);
		await client.sendMessage(msg.from,
			'📋 *Menu Principal*\n\n' +
			'1️⃣ Boleto\n' +
			'2️⃣ Suporte\n' +
			'0️⃣ Encerrar\n\n' +
			'👉 Responda com o número da opção desejada.'
		);
		return;
	}

	const nomeContato = msg._data.notifyName;
	let groupChat = await msg.getChat();

	if (msg.type.toLowerCase() == "e2e_notification") return null;
	if (msg.body == "") return null;
	if (msg.from.includes("@g.us")) return null;
	const NULLED = [undefined, "XXX", null, ""];
	var isWid = msg.from;
	const RegEx = new Set("!@#:$%^&*()_");
	for (let Return of isWid) {
		if (RegEx.has(Return)) {
			isWid = isWid.replace(Return, '%');
		}
	}
	isWid = isWid.split("%")[0];
	const isDDI = isWid.substr(0, 2);
	const isDDD = isWid.substr(2, 2);
	const isCall = isWid.slice(-8);
	var WhatsApp = isWid + '@c.us';
	if ((isDDI == '55') && (parseInt(isDDD) <= 30)) {
		WhatsApp = isWid.substr(0, 4) + '9' + isCall + '@c.us';
	} else if ((isDDI == '55') && (parseInt(isDDD) > 30)) {
		WhatsApp = isWid.substr(0, 4) + isCall + '@c.us';
	}
	const isWhatsApp = WhatsApp.split("@")[0];
	if (msg.body.toUpperCase().includes("TOKEN") && NULLED.includes(Debug('OPTIONS').token)) {
		if (msg.body.includes(":") && (msg.body.split(":")[1].length == 7)) {
			db.run("UPDATE options SET token=?", [msg.body.split(":")[1]], (err) => {
				if (err) throw err;
				console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').saved);
				global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').saved);
				msg.reply(Debug('CONSOLE').saved);
			});
		} else {
			console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').wrong);
			global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').wrong);
			msg.reply(Debug('CONSOLE').wrong);
		}
	} else {
		db.serialize(() => {
			db.get("SELECT * FROM replies WHERE whats='" + isWhatsApp + "'", (err, REPLIES) => {
				if (REPLIES == undefined) {
					db.run("INSERT INTO replies(whats,date,count) VALUES(?, ?, ?)", [isWhatsApp, register, 1], (err) => {
						if (err) {
							console.log('> ' + Debug('OPTIONS').appname + ' : ' + err)
						}
						console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').inserted);
						global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').inserted);
						MsgBox = true;
					});

				} else {

					if (register.toString() > REPLIES.date) {
						db.run("UPDATE replies SET date=?, count=? WHERE whats=?", [register, 1, isWhatsApp], (err) => {
							if (err) {
								console.log('> ' + Debug('OPTIONS').appname + ' : ' + err)
							}
							console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').updated);
							global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').updated);
							MsgBox = true;
						});
					} else {
						if (Debug('OPTIONS').count > REPLIES.count) {
							COUNT = REPLIES.count + 1;
							db.run("UPDATE replies SET count=? WHERE whats=?", [COUNT, isWhatsApp], (err) => {
								if (err) throw err;
								console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').updated);
								global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').updated);
								MsgBox = true;
							});
						} else {
							console.log('> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').found);
							global.io.emit('message', '> ' + Debug('OPTIONS').appname + ' : ' + Debug('CONSOLE').found);
							MsgBox = false;

						}
					}
				}
			});

			db.get("SELECT * FROM replies WHERE whats='" + msg.from.replaceAll('@c.us', '') + "'", (err, REPLIES) => {
				if (err) {
					console.log('> ' + Debug('OPTIONS').appname + ' : ' + err)
				}
				if (REPLIES != undefined) {
					if (MsgBox && Boolean(Debug('OPTIONS').onbot) && (msg.body != null || msg.body == "0" || msg.type == 'ptt' || msg.hasMedia)) {
						if (Boolean(Debug('OPTIONS').replyes)) {
							msg.reply(Debug('OPTIONS').response);
						} else {
							const Mensagem = (Debug('OPTIONS').response).replaceAll("\\n", "\r\n").split("##");
							Mensagem.some(function(Send, index) {
								setTimeout(function() {
									client.sendMessage(WhatsApp, isEmoji(Send)).then().catch(err => {
										console.log(err);
										WwjsVersion(false);
									});

								}, Math.floor(Delay + Math.random() * 1000));

							});

						}
					}
				}
			});

		});
	}
});

client.on('call', async (call) => {
	var isWid = call.from;
	const RegEx = new Set("!@#:$%^&*()_");
	for (let Return of isWid) {
		if (RegEx.has(Return)) {
			isWid = isWid.replace(Return, '%');
		}
	}
	isWid = isWid.split("%")[0];
	const isDDI = isWid.substr(0, 2);
	const isDDD = isWid.substr(2, 2);
	const isCall = isWid.slice(-8);
	var WhatsApp = isWid + '@c.us';
	if ((isDDI == '55') && (parseInt(isDDD) <= 30)) {
		WhatsApp = isWid.substr(0, 4) + '9' + isCall + '@c.us';
	} else if ((isDDI == '55') && (parseInt(isDDD) > 30)) {
		WhatsApp = isWid.substr(0, 4) + isCall + '@c.us';
	}
	const Mensagem = (Debug('OPTIONS').call).replaceAll("\\n", "\r\n").split("##");

	if (Boolean(Debug('OPTIONS').reject)) {
		setTimeout(function() {
			call.reject().then(() => {
				if (Boolean(Debug('OPTIONS').alert)) {
					Mensagem.some(function(Send, index) {
						setTimeout(function() {
							client.sendMessage(WhatsApp, isEmoji(Send)).then().catch(err => {
								console.log(err);
								WwjsVersion(false);
							});

						}, Math.floor(Delay + Math.random() * 1000));
					});
				}
			}).catch(err => {
				console.log(err);
			});
		}, Math.floor(Debug('OPTIONS').sleep + Math.random() * 1000));
	}
});

client.initialize();
console.log("\nAPI is Ready!\n");
const Port = process.env.PORT || Debug('OPTIONS').access;
server.listen(Port, ip.address(), function() {
	console.log('Server Running on *' + ip.address() + ':' + Port);
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