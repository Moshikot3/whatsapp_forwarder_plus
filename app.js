const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const basicAuth = require('express-basic-auth');
const rateLimit = require('express-rate-limit')
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
const wafpMessage = require("./handlers/message_handler");
const statistics = require("./helpers/stats_helper");
const guest = require("./helpers/guest_helper");
const setupScheduler = require('./handlers/scheduler');


//const listResponse = require("./helpers/response_helper");
const telegram = require("./helpers/telegram_helper");


const path = require('path');
const listenGroups = datasync.listenGroups
const sourceGroup = datasync.sourceGroup
const targetGroups = datasync.targetGroups
//const signaturetxt = datasync.signaturetxt

//Crapbot mitigation
const fs = require('fs');
const users = require('./helpers/users_helper');
const worker = `.wwebjs_auth/session/Default/Service Worker`;


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: false
}));

app.use(basicAuth({
  users: { root: 'bazak' },
  challenge: true // <--- needed to actually show the login dialog!
}));

app.engine('html', require('ejs').renderFile);

// Define the path to your CSS file
const cssFilePath = path.join(__dirname, 'public/styles.css');

// Serve static files from the public folder
app.use(express.static('public'));

// Create a route to serve the CSS file
app.get('/styles.css', (req, res) => {
  res.sendFile(cssFilePath);
});


//Executable path:
let executablePath = '';
if (process.platform === 'linux') {
  executablePath = '/usr/bin/google-chrome';
} else if (process.platform === 'win32') {
  executablePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
} else if (process.platform === 'darwin') {
  executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}


const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-wafp' }),
  puppeteer: {
    executablePath,
    headless: true,
    args: [
      '--no-sandbox', // Add this option to fix sandbox-related issues in some environments
      '--disable-setuid-sandbox', // Add this option to fix sandbox-related issues in some environments

    ],
    defaultViewport: null, // Set this to null to have full page screenshots
    font: 'Arial, "Noto Sans Hebrew", "Noto Sans", sans-serif', // Add Hebrew fonts to the list
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
  socket.emit('message', 'Backend Online');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    //telegram.SendWAFPStatus("BOT WEB PANEL - QR RECEIVED");
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      telegram.Sendqrcode(url);
      socket.emit('message', 'QRCode התקבל, ניתן לסרוק כעת.');
    });
  });
  // setInterval(async () => {
  //   if (client.pupPage) { // Check if the Puppeteer page is available in the client object
  //     const screenshot = await client.pupPage.screenshot({ encoding: 'base64' });
  //     socket.emit('screenshot', screenshot);
  //   }
  // }, 2000);

});


client.on('ready', async () => {
  await datasync.sync(client);
  const listenGroups = datasync.listenGroups
  const sourceGroup = datasync.sourceGroup
  const targetGroups = datasync.targetGroups
  const signaturetxt = datasync.signaturetxt

  console.log("Listen Group - " + listenGroups);
  console.log("Source Group - " + sourceGroup);
  console.log("Target Group - " + targetGroups);
  console.log("Signature - " + signaturetxt);
  console.log('client is ready!');

  statistics.showstats(client, targetGroups);

  await client.getChats().then(chats => {
    const groups = chats.filter(chat => !chat.isReadOnly && chat.isGroup);
    if (groups.length == 0) {
      console.log("no groups yet");
    } else {
      const allgrouplists = [];
      groups.forEach((group, i) => {
        const groupData = {
          id: group.id._serialized,
          name: group.name
        };
        allgrouplists.push(groupData);
      });
      console.log(allgrouplists);
      app.get('/groups', (req, res) => {
        res.json(allgrouplists);
      });
    }
  });

  telegram.SendWAFPStatus("בוט עלה בהצלחה.");
  console.log('BOT ready!');

});

client.on('dialog', async dialog => {
  console.log("Refresh popup just dismissed")
  await dialog.dismiss()
});

client.on('error', (event) => {
  client.destroy();
  client.initialize();
  telegram.SendWAFPStatus("pupage error... Client is ready again!");
  console.log('pupage error... Client is ready again!');
});


client.on('authenticated', () => {
  telegram.SendWAFPStatus("הזדהות מול ווצאפ בוצעה בהצלחה.");
  console.log('WAFP Authenticated');
});

client.on('auth_failure', function () {
  telegram.SendWAFPStatus("שגיאה: לא ניתן להזדהות מול ווצאפ");
  console.error('Erorr: Authentication failed.');
});

client.on('change_state', state => {

  if(state == "CONNECTED"){
  client.destroy();
  client.initialize();
  telegram.SendWAFPStatus('STATE = CONNECTED, An attempt was made to reconnect.');
}

  telegram.SendWAFPStatus('מצב חיבור: '+ state);
  console.log('מצב חיבור: ', state);
});

client.on('disconnected', (reason) => {
  telegram.SendWAFPStatus("התנתקות בוצעה בהצלחה");
  console.log('Client Disconnected', reason);
  client.initialize();
});

// Set up the scheduler with arguments
const scheduledTask = setupScheduler(client);


client.on('message', async (msg) => {
  console.log("Listen Group - " + listenGroups);
  console.log("Source Group - " + sourceGroup);
  console.log("Target Group - " + targetGroups);

  let chat = await msg.getChat();

  if (!chat.isGroup && !msg.body.startsWith("!") && msg.body != "") {
    await guest.SendGuestMessage(client, msg);
  }


  if (msg.body.startsWith("!")) {

    let args = msg.body.slice(1).trim().split(/ +/g);
    let command = args.shift().toLowerCase();

    console.log({ command, args });

    if (client.commands.has(command)) {
      try {
        if (client.commands.get(command).commandType === 'admin' && !await users.isAdmin(msg)) {
          msg.reply("Big no no");
          return false;
        }
        if (client.commands.get(command).isGroupOnly && !chat.isGroup) {
          msg.reply("פקודה זו עובדת רק בקבוצות.");
          return false;
        }
        if (!chat.isGroup && client.commands.get(command).requiredArgs > args.length) {
          msg.reply(`You need at least ${client.commands.get(command).requiredArgs} argument${client.commands.get(command).requiredArgs > 1 && 's' || ''} for this command`);
          chat.sendMessage(client.commands.get(command).help);
          return false;
        }

        if (client.commands.get(command).isGroupOnly || !chat.isGroup) {
          client.commands.get(command).execute(sourceGroup, targetGroups, client, msg, args);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (!chat.isGroup) {
      msg.reply("No such command found. Type !help to get the list of available commands");
    }
  }

  console.log('Message from: ', msg.from, " - ", msg.body);

  await wafpMessage.handleMessage(targetGroups, sourceGroup, client, msg);

});

app.get('/', async (req, res) => {
  let sourceGroupNaming = 'לא נבחרה קבוצת שיגור'; // Initialize sourceGroupNaming variable
  let signature = ''; // Initialize signature variable
  let GuestMessage;
  let OPT_GuestMSGToAdmin;
  let OPT_forwardTelegram;
  let OPT_TelegramBotToken;
  let OPT_TelegramChannelChatID;
  let OPT_TelegramAdminChatID;
  let SEC_AdminList;

  // Check if the database query condition is true
  const isSourceGroup = await database.read("Source", { status: "SourceGroup" });
  const isSignature = await database.read("Signature", { status: "Signature" });
  const isConfig = await database.read("config");



  if (isSourceGroup) {
    sourceGroupNaming = isSourceGroup.name;
  }

  if (isSignature) {
    signature = isSignature.text;
  }

  if (isConfig) {

    GuestMessage = isConfig.guestmsg;
    OPT_GuestMSGToAdmin = isConfig.OPT_GuestMSGToAdmin
    OPT_forwardTelegram = isConfig.OPT_forwardTelegram;
    OPT_TelegramBotToken = isConfig.OPT_TelegramBotToken;
    OPT_TelegramChannelChatID = isConfig.OPT_TelegramChannelChatID;
    OPT_TelegramAdminChatID = isConfig.OPT_TelegramAdminChatID;
    SEC_AdminList = isConfig.SEC_AdminList
  }

  res.render(__dirname + "/index.html", { sourceGroupNaming, signature, GuestMessage, OPT_GuestMSGToAdmin, OPT_forwardTelegram, OPT_TelegramBotToken, OPT_TelegramChannelChatID, OPT_TelegramAdminChatID, SEC_AdminList });
});


app.get('/all-target-group-ids', async (req, res) => {
  try {
    const groupIDs = await database.read("Target", { status: "TargetGroup" });
    res.json(groupIDs.trgroups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/button-click', async (req, res) => {

  let selectedGroup = req.body.groupId;
  let selectedGroupName = req.body.groupName;
  console.log(selectedGroupName);
  console.log('Selected Group ID:', selectedGroup);
  if (await database.read("Source", { status: "SourceGroup" })) {
    await console.log("קבוצת שיגור כבר הוגדרה, ניתן להגדיר קבוצה אחת בלבד, מעדכן את קבוצת השיגור לקבוצה שבחרת.");
    if (!database.del("Source", { status: "SourceGroup" })) {
      await console.log("קיימת תקלה במונגו, נא לפנות למפתח.");
    }

  }
  await database.insert("Source", { group_id: selectedGroup }, { status: "SourceGroup" });
  await database.insert("Source", { group_id: selectedGroup }, { name: selectedGroupName });
  await datasync.sync(client);
  await console.log("בוצע");
  console.log(sourceGroup);
  res.sendStatus(200);
});

//Stream function
// app.get('/stream', async (req, res) => {

//   res.render(__dirname + "/stream.html");
// });



app.post('/send-tr-group', async (req, res) => {
  const groupIds = req.body.groups;

  try {
    if (database.read("Target", { status: "TargetGroup" })) {
      database.del("Target", { status: "TargetGroup" });
    }

    await database.insert("Target", { status: "TargetGroup" }, { trgroups: groupIds });


    await datasync.sync(client);
    res.sendStatus(200);
  } catch (error) {
    console.error("An error occurred:", error);
    res.sendStatus(500);
  }
});



app.post('/signature-click', async (req, res) => {

  let signaturetext = req.body.signature;

  console.log(signaturetext);
  if (await database.read("Signature", { status: "Signature" })) {
    await console.log("חתימה כבר הוגדרה, מעדכן לחתימה חדשה.");
    if (!database.del("Signature", { status: "Signature" })) {
      await console.log("קיימת תקלה במונגו, נא לפנות למפתח.");
    }

  }
  await database.insert("Signature", { text: signaturetext }, { status: "Signature" });

  await datasync.sync(client);
  await console.log("בוצע");
  res.sendStatus(200);
});

app.post('/guestmsg-click', async (req, res) => {
  let configvalues = await database.read("config");
  let guestmsgtext = req.body.guestmsg;

  if (!(await database.removeFields("config", { status: "config" }, 'guestmsg'))) {
    await database.addToDocument("config", {}, { guestmsg: guestmsgtext, status: "config" });
  } else {
    await database.addToDocument("config", {}, { guestmsg: guestmsgtext });
  }

  await console.log("בוצע");
  res.sendStatus(200);
});


app.post('/UpdateConfig', async (req, res) => {
  let OPT_GuestMSGToAdmin = req.body.OPT_GuestMSGToAdmin;
  let OPT_forwardTelegram = req.body.OPT_forwardTelegram;
  let OPT_TelegramBotToken = req.body.OPT_TelegramBotToken;
  let OPT_TelegramChannelChatID = req.body.OPT_TelegramChannelChatID;
  let OPT_TelegramAdminChatID = req.body.OPT_TelegramAdminChatID;

  if (!(await database.removeFields("config", { status: "config" }, 'OPT_GuestMSGToAdmin'))) {
    await database.addToDocument("config", {}, { 
      OPT_GuestMSGToAdmin: OPT_GuestMSGToAdmin,
      OPT_forwardTelegram: OPT_forwardTelegram,
      OPT_TelegramBotToken: OPT_TelegramBotToken,
      OPT_TelegramChannelChatID: OPT_TelegramChannelChatID,
      OPT_TelegramAdminChatID: OPT_TelegramAdminChatID,
      status: "config" 
    });
  } else {
    await database.addToDocument("config", {}, {
       OPT_GuestMSGToAdmin: OPT_GuestMSGToAdmin,
       OPT_forwardTelegram: OPT_forwardTelegram,
       OPT_TelegramBotToken: OPT_TelegramBotToken,
       OPT_TelegramChannelChatID: OPT_TelegramChannelChatID,
       OPT_TelegramAdminChatID: OPT_TelegramAdminChatID
    });
  }

  await console.log("בוצע");
  res.sendStatus(200);
});


app.post('/UpdateAdmins', async (req, res) => {
  let SEC_AdminList = req.body.SEC_AdminList;

  if (!(await database.removeFields("config", { status: "config" }, 'SEC_AdminList'))) {
    await database.addToDocument("config", {}, { SEC_AdminList: SEC_AdminList, status: "config" });
  } else {
    await database.addToDocument("config", {}, { SEC_AdminList: SEC_AdminList });
  }

  await console.log("בוצע");
  res.sendStatus(200);
});


server.listen(port, function () {
  console.log('App running on *: ' + port);
});


client.initialize();
