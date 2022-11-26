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
  users: { admin: 'bazak' },
  challenge: true // <--- needed to actually show the login dialog!
}));

app.get('/', async (req, res) => {

  
  res.sendFile('index.html', {
    root: __dirname
  });
});


const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-wafp' }),
  puppeteer: {
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


  client.on('ready', async () => {
    await datasync.sync(client);
    console.log("Listen Group - "+listenGroups);
    console.log("Source Group - "+sourceGroup);
    console.log("Target Group - "+targetGroups);
    socket.emit('ready', 'סטאטוס - זמין');
    socket.emit('message', 'סטאטוס - זמין');
    console.log('client is ready!');
    client.pupPage.on('dialog', async dialog => {
      console.log("Refresh popup just dismissed")
      await dialog.dismiss()});
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
    socket.emit('message', 'הודעה חדשה מאת: ' + msg.from +" - "+ msg.body);

  });
});



client.on('message', async (msg) => {

  let author = msg.author || msg.from
  let chat = await msg.getChat();

  if (msg.body.startsWith("!")) {

    let args = msg.body.slice(1).trim().split(/ +/g);
    let command = args.shift().toLowerCase();

    console.log({ command, args });

    if (client.commands.has(command)) {
      try {
        if(client.commands.get(command).commandType === 'admin' && !await users.isAdmin(msg))
        {
          msg.reply("Big no no");
          return false;
        }
        if(client.commands.get(command).isGroupOnly && !chat.isGroup)
        {
          msg.reply("This command can only be done in groups.");
          return false;
        }
        if(client.commands.get(command).requiredArgs > args.length)
        {
          msg.reply(`You need at least ${client.commands.get(command).requiredArgs} argument${client.commands.get(command).requiredArgs>1&&'s'||''} for this command`);
          chat.sendMessage(client.commands.get(command).help);
          return false;
        }
        client.commands.get(command).execute(client, msg, args);
      } catch (error) {
        console.log(error);
      }
      } else {
      msg.reply("No such command found. Type !help to get the list of available commands");
    }
  }


    console.log('Message from: ', msg.from, " - ", msg.body);
    console.log(msg.type);

    if(listenGroups.includes(msg.from) || msg.from == configfile.SourceGroup && msg.body != '!מחק'){

        console.log(msg.type);
        for (var Group in configfile.ForwarToGroups){
          
            if (msg.type == 'chat') {
                console.log("Send message")
                await client.sendMessage(configfile.ForwarToGroups[Group], msg.body);
            } else if (msg.type == 'ptt') {
                console.log("Send audio")
                let audio = await msg.downloadMedia();
                await client.sendMessage(configfile.ForwarToGroups[Group], audio, {sendAudioAsVoice: true});
            } else if (msg.type == 'image' || msg.type == 'video' || msg.type == 'document') {
                console.log("Send image/video")
                let attachmentData = await msg.downloadMedia();
                // Error mostly comes from sending video

                await client.sendMessage(configfile.ForwarToGroups[Group], attachmentData, {caption: msg.body});
            } else if (msg.type == 'sticker') {
              let attachmentData = await msg.downloadMedia();
              let buffer = Buffer.from(attachmentData.data);
              if(buffer.length / 1e+6 > 5) {
                console.log("אאאאיפה אחי כבד");
                return;
              }
              await client.sendMessage(configfile.ForwarToGroups[Group], attachmentData, {extra: {},   
                sendMediaAsSticker: true,
                stickerName: "Made by: ",
                stickerAuthor: "✡︎",
              })

            }
            await sleep()
            
           /* msg.forward(configfile.ForwarToGroups[Group])*/
            console.log(`forward message to ${configfile.ForwarToGroups[Group]}`)


        }
      }

        if(msg.type == 'list_response'){

          let rowid = msg.selectedRowId
          console.log(rowid);
          switch(rowid){
            //Listening groups list answer
            case rowid.match(/^LIS-/)?.input:

              console.log("receieved response from list.");
              //selgroupName = listgroups.find(group => group.id === msg.selectedRowId)
              if(await database.read("Listeners", {group_id: rowid.replace("LIS-", "")})){
                await msg.reply("קבוצת ההאזנה שבחרת כבר קיימת במאגר.");
                break;

              }

              await database.insert("Listeners", { group_id: rowid.replace("LIS-", "") }, { status: "Listening" });
              await datasync.sync(client);
              await msg.reply("בוצע")


            break;

            //SourceGroup list answer
            case rowid.match(/^SRC-/)?.input:

              console.log("receieved response from list.");
              //selgroupName = listgroups.find(group => group.id === msg.selectedRowId)

              if(await database.read("Source", {status: "SourceGroup"})){
                await msg.reply("קבוצת שיגור כבר הוגדרה, ניתן להגדיר קבוצה אחת בלבד, מעדכן את קבוצת השיגור לקבוצה שבחרת.");
                if(!database.del("Source", { status: "SourceGroup" })) {
                  await msg.reply("קיימת תקלה במונגו, נא לפנות למפתח.");
                  break;
               }

              }
              await database.insert("Source", { group_id: rowid.replace("SRC-", "") }, { status: "SourceGroup" });
              await datasync.sync(client);
              await msg.reply("בוצע");
            break;

            //Target Groups list answer
            //Add
            case rowid.match(/^TRG-/)?.input:

              if(await database.read("Target", {group_id: rowid.replace("TRG-", "")})){
                await msg.reply("קבוצת היעד שבחרת כבר קיימת במאגר.");
                break;


              }
              await database.insert("Target", { group_id: rowid.replace("TRG-", "") }, { status: "Active" });
              await datasync.sync(client);
              await msg.reply("בוצע");
            break;

            //Delete
            case rowid.match(/^DELTRG-/)?.input:
              if(!await database.read("Target", {group_id: rowid.replace("DELTRG-", "")})){
                await msg.reply("הקבוצה שבחרת להסיר לא קיימת במאגר כך שאין מה להסיר.");
                break;
              }

              if(!database.del("Target", {group_id: rowid.replace("DELTRG-", "")})) {
                await msg.reply("קיימת תקלה במונגו, נא לפנות למפתח.")
                break;
              }

              await datasync.sync(client);
              await msg.reply("בוצע");
            break;
          }





      }

  });

server.listen(port, function () {
  console.log('App running on *: ' + port);
});
client.initialize();