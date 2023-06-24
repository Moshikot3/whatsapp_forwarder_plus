const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const express = require('express');
const basicAuth = require('express-basic-auth');
const rateLimit = require('express-rate-limit')
const configfile = require('./config.json');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const database = require("./helpers/db_helper");
const datasync = require("./helpers/datasync_helper");
const listResponse = require("./helpers/response_helper");

const listenGroups = datasync.listenGroups
const sourceGroup = datasync.sourceGroup
const targetGroups = datasync.targetGroups


//Crapbot mitigation
const fs = require('fs');
const users = require('./helpers/users_helper');
//const groups = require('./helpers/groups_helper.js');
//const msgcount = require('./commands/msgcount');
const worker = `.wwebjs_auth/session/Default/Service Worker`;

if (fs.existsSync(worker)) {
  fs.rmSync(worker, { recursive: true });
}

function sleep() {
  return new Promise((resolve) => {
    let timeInMs = (Math.random() * (3000 - 1000 + 1)) + 2200;
    setTimeout(resolve, timeInMs);

    console.log(timeInMs)
  });
}


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: false
}));

app.use(basicAuth({
  users: { admin: 'giveaway' },
  challenge: true // <--- needed to actually show the login dialog!
}));

app.get('/', async (req, res) => {


  res.sendFile('index.html', {
    root: __dirname
  });
});


const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-giveaway' }),
  puppeteer: {
    //executablePath: configfile.PathToChrome,
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ]
  }
});

client.commands = new Map();

fs.readdir("./commands", (err, files) => {
  if (err) return console.error(e);
  files.forEach((commandFile) => {
    if (commandFile.endsWith(".js")) {
      let commandName = commandFile.replace(".js", "");
      const command = require(`./commands/${commandName}`);
      client.commands.set(commandName, command);
    }
  });
});


io.on('connection', function (socket) {
  socket.emit('message', 'מתחבר...');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QRCode התקבל, ניתן לסרוק כעת.');
    });
  });

  const listenGroups = datasync.listenGroups
  const sourceGroup = datasync.sourceGroup
  const targetGroups = datasync.targetGroups

  client.on('ready', async () => {
    await datasync.sync(client);
    console.log("Listen Group - " + listenGroups);
    console.log("Source Group - " + sourceGroup);
    console.log("Target Group - " + targetGroups);
    socket.emit('ready', 'סטאטוס - זמין');
    socket.emit('message', 'סטאטוס - זמין');
    console.log('client is ready!');
    client.pupPage.on('dialog', async dialog => {
      console.log("Refresh popup just dismissed")
      await dialog.dismiss()
    });
    client.pupPage.on('error', (event) => {
      client.destroy();
      client.initialize();
      console.log('Client is ready again!');
    });
  });


  client.on('authenticated', () => {
    socket.emit('authenticated', 'סטאטוס - מאומת');
    socket.emit('message', 'סטאטוס מאומת');
    console.log('WAFP Authenticated');
  });

  client.on('auth_failure', function () {
    socket.emit('message', 'אימות נכשל, מפעיל מחדש.');
    console.error('Erorr: Authentication failed.');
  });

  client.on('change_state', state => {
    console.log('מצב חיבור: ', state);
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'סטאטוס - מנותק, יש לפנות למנהל המערכת');
    console.log('Client Disconnected', reason);
    client.initialize();
  });

  client.on('message', async (msg) => {
    socket.emit('message', 'הודעה חדשה מאת: ' + msg.from + " - " + msg.body);

  });
});



client.on('message', async (msg) => {



  let author = msg.author || msg.from
  let chat = await msg.getChat();

  if(!chat.isGroup) {


    

    console.log("Listen Group - " + listenGroups);
    console.log("Source Group - " + sourceGroup);
    console.log("Target Group - " + targetGroups);
    console.log("is not group");
    console.log('Message from: ', msg.from, " - ", msg.body);
    database.insert("Users", { group_id: msg.from }, { status: "Welcome" });
    console.log("Database write");

    if (msg.body.toLowerCase() === "#start") {
      client.pupPage.addScriptTag({ path: require.resolve("@wppconnect/wa-js") });
      await client.pupPage.waitForFunction(() => window.WPP?.isReady);

      const isAuthenticated = await client.pupPage.evaluate(() => WPP.conn.isAuthenticated());
      if (isAuthenticated) {
        let optionsButtonMessage = {
          useTemplateButtons: true,
          buttons: [
            {
              url: "https://google.com/",
              text: "Google Site"
            },
            {
              phoneNumber: "+628888888888",
              text: "Call me"
            },
            {
              id: "your custom id 1",
              text: "XXXXX"
            },
            {
              id: "another id 2",
              text: "YYYYYY"
            }
          ],
          title: "test",
          footer: "Footer text"
        };
        const sendButton = await client.pupPage.evaluate(
          (to, options) => WPP.chat.sendTextMessage(to, "Hello it's button message", options),
          msg.from,
          optionsButtonMessage
        );
      }
    }
    else if (msg.selectedRowId) {
      // Pesan dikirim melalui daftar atau tombol
      console.log("YO YO"+msg.selectedRowId);
    } else {
      // Pesan dikirim melalui input teks biasa
      console.log("Pesan dikirim melalui input teks biasa");
    }


  }else{

    console.log("is group");


  }


});

server.listen(port, function () {
  console.log('App running on *: ' + port);
});
client.initialize();