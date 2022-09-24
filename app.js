const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();
 
client.on('message', async (msg) => {
    console.log("New Message from: "+msg.from+" - "+ msg.body);

    if(msg.body === '!ping') {
		msg.reply('pong');
        client.sendMessage(msg.from, 'pong');
	}
    
});
 