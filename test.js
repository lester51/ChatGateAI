const axios = require('axios');
const cheerio = require('cheerio');
const {decode} = require('html-entities');
const express = require('express');
//const path = require('path');
const app = express();
const port = 10000;

let isEmpty = (obj) => {
	for (var prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) return false;
	}
	return true
}

let removeObjIfNoProp = (obj) => {
	let keys = Object.keys(obj);
	let result = {};
	for (let key of keys) {
		if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') result[key] = obj[key];
	}
	return result;
}

let tempMail = async () => {
	try {
		let res = await axios.get('https:/\/www.emailnator.com/')
		let cookies = res.headers['set-cookie'].map(r => r.split(';')[0])
		let xsrf = cookies[0];
		let res2 = await axios.post('https:/\/www.emailnator.com/generate-email', {
			'email': [
				//'plusGmail',
				//'dotGmail',
				'googleMail'
			]
		}, {
			headers: {
				'cookie': cookies.join(';'),
				'x-xsrf-token': decodeURIComponent(xsrf.split('=')[1])
			}
		})
		return {
			email: res2.data.email[0],
			cookies: cookies
		};
	} catch (e) {
		throw e;
	}
}

let checkMail = async (email, cookies, messageId) => {
	try {
		let params = removeObjIfNoProp({
			email: email,
			messageID: messageId
		})
		let xsrf = cookies[0];
		let res = await axios.post('https:/\/www.emailnator.com/message-list', params, {
			headers: {
				'cookie': cookies.join(';'),
				'x-xsrf-token': decodeURIComponent(xsrf.split('=')[1])
			}
		})
		return res.data;
	} catch (e) {
		throw e;
	}
}

let getObjByKeyword = (el, bool, array) => {
	let similar = []
	array.filter(obj => {
		if (bool) {
			if (obj.mode.toLowerCase() === el.toLowerCase()) similar.push(obj);
		} else {	 
			if (obj.name.toLowerCase().includes(el.toLowerCase())) similar.push(obj);
		}
	});
	
	return similar;
}

let getCurrentDateTime = () => {
	let currentDate = new Date();
	let year = currentDate.getFullYear();
	let month = String(currentDate.getMonth() + 1).padStart(2, '0');
	let day = String(currentDate.getDate()).padStart(2, '0');
	let hours = String(currentDate.getHours()).padStart(2, '0');
	let minutes = String(currentDate.getMinutes()).padStart(2, '0');
	let seconds = String(currentDate.getSeconds()).padStart(2, '0');
	let formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	return formattedDateTime;
}

let findObject = (data, value) => {
	let messageData = data.messageData;
	for (let i = 0; i < messageData.length; i++) {
		let message = messageData[i];
		if (message.from === value) {
			return message;
		}
	}
	return null;
}

let genChars = (length) => {
	let randomChars = '';
	const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charactersLength);
		randomChars += characters.charAt(randomIndex);
	}
	return randomChars;
}

app.get('/', (req, res) => {
    res.send("This API was made by HackMeSenpai.")
    res.status(200)
})

app.get('/Chat', async function(req, res) {
    let msg = req.query.msg;
	let chatBot = req.query.chatBot;
	let mode = req.query.mode;
	let cookie = req.query.token;
		let chatBotList = [{
			"name": "gpt-4",
			"mode": "chat",
			"botId": "chatbot-z3fedi"
		}, {
			"name": "Web Browsing",
			"mode": "chat",
			"botId": "chatbot-x0npa7"
		}, {
			"name": "gpt-4o",
			"mode": "chat",
			"botId": "chatbot-3siv3p"
		}, {
			"name": "gpt-4 vision",
			"mode": "Image",
			"botId": "chatbot-kvic0w"
		}, {
			"name": "dall.e 3",
			"mode": "Image",
			"botId": "chatbot-5rwkvr"
		}, {
			"name": "chat pdf",
			"mode": "pdf",
			"botId": "chatbot-naohv4"
		}, {
			"name": "gemini pro 1.5",
			"mode": "chat",
			"botId": "chatbot-qkxchq"
		}, {
			"name": "gemini pro vision",
			"mode": "Image",
			"botId": "chatbot-zn1po5"
		}, {
			"name": "palm 2 code chat",
			"mode": "chat",
			"botId": "default",
			"customId": "8c9721b86593cb28fbdfd9496b4366c4"
		}, {
			"name": "claude 3 opus",
			"mode": "chat",
			"botId": "chatbot-zdmvyq"
		}, {
			"name": "claude 3 sonnet",
			"mode": "chat",
			"botId": "chatbot-iwyjrk"
		}, {
			"name": "claude 3 vision",
			"mode": "Image",
			"botId": "chatbot-12oenm"
		}, {
			"name": "sonar-8x7b-online",
			"mode": "chat",
			"botId": "default",
			"customId": "92fad6c4ad1e58a53fb61a84d29ed75f"
		}, {
			"name": "pplx-70b-online",
			"mode": "chat",
			"botId": "default",
			"customId": "cfd01ebd5d73ad22210a0a1eae32e11c"
		}, {
			"name": "llama 3 70b instruct",
			"mode": "chat",
			"botId": "default",
			"customId": "37732a3e6793260a1d6fb7aa201bcc4a"
		}, {
			"name": "llama 3 8b instruct",
			"mode": "chat",
			"botId": "default",
			"customId": "4218476a30bddce69ff07ea810018d77"
		}, {
			"name": "code llama 70b instruct",
			"mode": "chat",
			"botId": "default",
			"customId": "ddf0df7c99abae4aaada540fbb051eed"
		}, {
			"name": "fun gpt",
			"mode": "chat",
			"botId": "default",
			"customId": "c2061b0b83f5a9b5202d2d4d04649b65"
		}]
		if (typeof cookie === 'undefined') throw new Error('Invalid request, No session token provided!');
		if (typeof msg === 'undefined') throw new Error('Invalid request, Empty query/message!');
		if (isEmpty(req.query) == true) {
			req.query = {
				//DEFAULT GPT-4
				chatBot: 'gpt-4',
				botId: 'chatbot-x0npa7',
				customId: '',
				newMessage: msg
			};
		} else {
			let listByMode = getObjByKeyword(req.query.mode, true, chatBotList)
			let currentChatBot = getObjByKeyword(req.query.chatbotname, false, listByMode)
			if (currentChatBot.length > 1) req.query = currentChatBot[Math.floor(Math.random() * currentChatBot.length)];
			else if (currentChatBot.length < 1) {
				console.log('[ INFO ] > Model Not Found!')
				console.log('[ INFO ] > Using Default Model (GPT-4)')
				req.query = {
					//DEFAULT GPT-4
					botId: 'chatbot-x0npa7',
					fileId: req.query.fileId || null
				};
			} else {
				req.query = currentChatBot[0];
				req.query = Object.assign({
					newFileId: req.query.fileId
				}, currentChatBot[0])
			}
		}
		let params = removeObjIfNoProp({
			botId: req.query.botId,
			customId: req.query.customId,
			newMessage: msg,
			newFileId: req.query.fileId,
			stream: false
		})
		try {
			let {
				data: body
			} = await axios.get('https:/\/chatgate.ai/', {
				headers: {
					'cookie': atob(cookie),
					'origin': 'https://chatgate.ai'
				}
			})
			let restNonce = decode(body).match(/"restNonce":"(.*?)"/g)[0].split(':')[1].replace(/"/g, '')
			let r8 = await axios.post('https:/\/chatgate.ai/wp-json/mwai-ui/v1/chats/submit', params, {
				headers: {
					'cookie': atob(cookie),
					'origin': 'https://chatgate.ai',
					'x-wp-nonce': restNonce
				}
			});
			res.send(r8.data);
		} catch (e) {
			if (!e.response) {
				res.send({
					error: e.message
				});
			} else {
				res.send({
					error: `${e.response.status} ${e.response.statusText}`,
					data: e.response.data.message
				});
			}
		}
})

app.get('/getToken', async function(req, res) {
	try {
		let {
			email,
			cookies
		} = await tempMail()
console.log("EMAIL: ",email,"\nCOOKIES: ",cookies)
		let r1 = await axios.get('https:/\/chatgate.ai/wp-login.php?redirect_to=https://chatgate.ai/')
		var html = cheerio.load(r1.data)
		var json = html('script[id="firebase-js-extra"]').text()
		let apiKey = JSON.parse(json.match(/\{(.*?)\}/g)[0]).apiKey
		let r2 = await axios.post('https:/\/identitytoolkit.googleapis.com/v1/accounts:sendOobCode', {
			'requestType': 'EMAIL_SIGNIN',
			'email': email,
			'continueUrl': 'https:/\/chatgate.ai/login?redirect_to=https%3A%2F%2Fchatgate.ai%2F&ui_sd=0',
			'canHandleCodeInApp': true
		}, {
			params: {
				'key': apiKey
			},
			headers: {
				'origin': 'https:/\/chatgate.ai'
			}
		})
		while (true) {
			let tmail = await checkMail(email, cookies)
			mailMsgs = findObject(tmail, 'noreply@auth.chatgate.ai')
			if (mailMsgs != null) break;
			await new Promise(resolve => setTimeout(resolve, 3000));
		}
		mailMsgs = await checkMail(email, cookies, mailMsgs.messageID)
		let $ = cheerio.load(mailMsgs)
		let authUrl = $('a').attr('href')
		let urlParts = new URLSearchParams(authUrl);
		for (const [name, value] of urlParts) {
			if (name == 'oobCode') oobCode = value;
		}
		let r4 = await axios.get(`https:/\/chatgate.ai/login?redirect_to=https://chatgate.ai/&ui_sd=0&apiKey=${apiKey}&oobCode=${oobCode}&mode=signIn&lang=en`, {
			headers: {
				'origin': 'https://chatgate.ai'
			}
		})
		var html = cheerio.load(r4.data)
		var json = html('script[id="firebase-js-extra"]').text()
		let firebaseLoginKey = JSON.parse(json.match(/\{(.*?)\}/g)[3]).firebaseLoginKey
		let datetime = getCurrentDateTime()
		let fullCookie = r4.headers['set-cookie'][0].split(';')[0] + `;sbjs_migrations=1418474375998=1;sbjs_current_add=fd=${datetime}|||ep=https://chatgate.ai/login?redirect_to=https://chatgate.ai/&ui_sd=0&apiKey=${apiKey}&oobCode=${oobCode}&mode=signIn&lang=en|||rf=https://auth.chatgate.ai/; sbjs_first_add=fd=${datetime}|||ep=https://chatgate.ai/login?redirect_to=https://chatgate.ai/&ui_sd=0&apiKey=${apiKey}&oobCode=${oobCode}&mode=signIn&lang=en|||rf=https://auth.chatgate.ai/; sbjs_current=typ=typein|||src=(direct)|||mdm=(none)|||cmp=(none)|||cnt=(none)|||trm=(none)|||id=(none); sbjs_first=typ=typein|||src=(direct)|||mdm=(none)|||cmp=(none)|||cnt=(none)|||trm=(none)|||id=(none); sbjs_udata=vst=1|||uip=(none)|||uag=Mozilla/5.0 (Linux; Android 8.1.0; vivo 1811) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.40 Mobile Safari/537.36; sbjs_session=pgs=1|||cpg=https://chatgate.ai/login?redirect_to=https://chatgate.ai/&ui_sd=0&apiKey=${apiKey}&oobCode=${oobCode}&mode=signIn&lang=en;`
		let r5 = await axios.post('https:/\/identitytoolkit.googleapis.com/v1/accounts:signInWithEmailLink', {
			'email': email,
			'oobCode': oobCode
		}, {
			params: {
				'key': apiKey
			},
			headers: {
				'origin': 'https://chatgate.ai'
			}
		});
		let r6 = await axios.post('https:/\/identitytoolkit.googleapis.com/v1/accounts:lookup', {
			'idToken': r5.data.idToken
		}, {
			params: {
				'key': apiKey
			},
			headers: {
				'origin': 'https://chatgate.ai'
			}
		});
		let r7 = await axios.post('https:/\/chatgate.ai/wp-json/firebase/v2/users/register-autologin', {
			'user': {
				'userId': r6.data.users[0].localId,
				'password': genChars(10),
				'email': r6.data.users[0].email,
				'providers': [
					r6.data.users[0].providerUserInfo[0].providerId
				]
			}
		}, {
			headers: {
				'auth-source': 'wordpress',
				'cookie': fullCookie,
				'firebase-login-key': firebaseLoginKey,
				'origin': 'https://chatgate.ai',
				'referer': 'https://chatgate.ai/login?redirect_to=https%3A%2F%2Fchatgate.ai%2F&lang=en',
				'user-agent': 'Mozilla/5.0 (Linux; Android 8.1.0; vivo 1811) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.40 Mobile Safari/537.36',
			}
		});
		let wp_login_cookie = r7.headers['set-cookie'][r7.headers['set-cookie'].length - 1].split(';')[0] + ';sbjs_session=pgs=1|||cpg=https://chatgate.ai/'
		res.send({
			session_token: btoa(fullCookie + wp_login_cookie)
		})
	} catch (e) {
		if (!e.response)
			res.send({
				error: e.message
			});
		else {
			res.send({
				error: `${e.response.status} ${e.response.statusText}`,
				data: e.response.data.message
			})
		}
	}
});

app.listen(port, function (){
  console.log(`Server is listening on port ${port}`)
})

module.exports = app;
