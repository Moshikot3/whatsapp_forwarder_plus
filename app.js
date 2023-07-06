const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
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
const listResponse = require("./helpers/response_helper");
const path = require('path');

const listenGroups = datasync.listenGroups
const sourceGroup = datasync.sourceGroup
const targetGroups = datasync.targetGroups
const signaturetxt = datasync.signaturetxt


//Crapbot mitigation
const fs = require('fs');
const users = require('./helpers/users_helper');
const { sign } = require('crypto');
//const groups = require('./helpers/groups_helper.js');
//const msgcount = require('./commands/msgcount');
const worker = `.wwebjs_auth/session/Default/Service Worker`;

// if (fs.existsSync(worker)) {
//   fs.rmSync(worker, { recursive: true });
// }

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
  users: { root: 'bazak' },
  challenge: true // <--- needed to actually show the login dialog!
}));

app.engine('html', require('ejs').renderFile);


const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-wafp' }),
  puppeteer: {
    //Linux
    executablePath: '/usr/bin/google-chrome',
    //Windows
    //executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    //Mac
    //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',


    headless: true
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
  socket.emit('message', 'חדשות הבזק, גרסת בדיקה.');


  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QRCode התקבל, ניתן לסרוק כעת.');
    });
  });

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
  console.log('WAFP Authenticated');
});

client.on('auth_failure', function () {
  console.error('Erorr: Authentication failed.');
});

client.on('change_state', state => {
  console.log('מצב חיבור: ', state);
});

client.on('disconnected', (reason) => {
  console.log('Client Disconnected', reason);
  client.initialize();
});






client.on('message', async (msg) => {


  console.log("Listen Group - " + listenGroups);
  console.log("Source Group - " + sourceGroup);
  console.log("Target Group - " + targetGroups);

  let author = msg.author || msg.from
  let chat = await msg.getChat();

  if (msg.body.startsWith("!")) {

    let args = msg.body.slice(1).trim().split(/ +/g);
    let command = args.shift().toLowerCase();

    console.log({ command, args });

    if (client.commands.has(command)) {
      try {
        if (client.commands.get(command).commandType === 'admin' && !await users.isAdmin(msg) && !chat.isGroup) {
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




  if (listenGroups.includes(msg.from) || (msg.from == sourceGroup && msg.body != '!מחק')) {
    await msg.react("🔄");

    const clientInfo = client.info
    let qutmsginfo = undefined;
    let quotemsg = undefined;



    if (msg.hasQuotedMsg) {
      let qutmsgid = msg._data.quotedStanzaID;




      //console.log(qutmsgid);
      try {
        qutmsginfo = await database.read("messages", { messageid: qutmsgid })
        quotemsg = await msg.getQuotedMessage();

        //console.log(quotemsg);
        if (!qutmsginfo || qutmsginfo == "" || !qutmsginfo.trgroup) {
          msg.reply("ההודעה המצוטטת לא קיימת במאגר.");
          return;
        }

      } catch {
        await msg.react("❌");
        msg.reply("האין חיבור למסד נתונים מונגו.");
        return;
      }
    }

    //Implating save messages
    try {
      await database.insert("messages", { messageid: msg.id.id }, { srcgroup: msg.from, msgtext: msg.body });
      console.log("srcgroup wrote in db");
    }
    catch { console.log("Error saving srcmsgid to MongoDB"); }


    // if(await database.add("Messages", { srcmsgid: msg.id }, { msgid: msg.id._serialized })){
    //   console.log("New message writted to MongoDB");
    // }

    // Remove signature symbol "~" from msg.body
    if (msg.body.endsWith("~")) {
      msg.body = msg.body.slice(0, -1); // Remove last character (~)
      var signaturetxt = ""; // Set signaturetxt to empty string
    } else {
      try {
        var signaturetxt = "\n\n" + (await database.read("Signature", { status: "Signature" })).text
      }
      catch {
        await msg.react("❌");
        console.log("Error pulling signature from MongoDB");
        var signaturetxt = ""
      }
    }
    let trgroupsmsgid = [];
    let trgroupsid = [];
    for (var Group in targetGroups) {
      let trmsg = undefined;
      let extras = null;

      //quote messages handeling
      if (msg.hasQuotedMsg && qutmsginfo.trgroup) {

        for (let i = 0; i < qutmsginfo.trgroup.length; i++) {
          const trGroup = qutmsginfo.trgroup[i];
          const trMessageID = qutmsginfo.trgtmsgID[i];
          console.log("Trgroup: " + trGroup + ", GROUP: " + Group);
          if (trGroup == targetGroups[Group]) {
            extras = {
              extra: {
                quotedMsg: {
                  caption: quotemsg.body,
                  body: quotemsg.body,
                  type: quotemsg.type
                },
                quotedStanzaID: trMessageID,
                quotedParticipant: clientInfo.wid._serialized
              }
            }
            console.log("EXTRAS BELOW");
            console.log(extras);
            break;

          }
        }

      } else {
        extras = {}
      }

      if (msg.type == 'chat') {
        console.log("Send message");
        console.log(signaturetxt);
        trmsg = await client.sendMessage(targetGroups[Group], msg.body + signaturetxt, extras);
      } else if (msg.type == 'ptt') {
        console.log("Send audio");
        let audio = await msg.downloadMedia();
        trmsg = await client.sendMessage(targetGroups[Group], audio, { sendAudioAsVoice: true }, extras);
      } else if (msg.type == 'image' || msg.type == 'video' || msg.type == 'document') {
        console.log("Send image/video");
        let attachmentData = await msg.downloadMedia();
        if (msg.body == "" || msg.body == " ") {
          trmsg = await client.sendMessage(targetGroups[Group], attachmentData, { extra: extras.extra, caption: msg.body });
        } else {
          trmsg = await client.sendMessage(targetGroups[Group], attachmentData, { extra: extras.extra, caption: msg.body + signaturetxt });
        }
      } else if (msg.type == 'sticker') {
        let attachmentData = await msg.downloadMedia();
        let buffer = Buffer.from(attachmentData.data);
        if (buffer.length / 1e+6 > 5) {
          console.log("אאאאיפה אחי כבד");
          return;
        }
        trmsg = await client.sendMessage(targetGroups[Group], attachmentData, {
          extra: extras.extra,
          sendMediaAsSticker: true,
          stickerName: "חדשות הבזק",
          stickerAuthor: "חדשות הבזק",
        });
      }
      await sleep();
      console.log(`forward message to ${targetGroups[Group]}`);

      trgroupsmsgid.push(trmsg._data.id.id);
      trgroupsid.push(targetGroups[Group]);


    }

    //saving messages targetgroups
    try {
      await database.insert("messages", { messageid: msg.id.id }, { trgroup: trgroupsid, trgtmsgID: trgroupsmsgid });
    }
    catch { console.log("Error saving srcmsgid to MongoDB"); }

    //msg.reply("הפצת ההודעה הסתיימה.");
    msg.react("✅");

  }

  if (msg.type == 'list_response') {
    let rowid = msg.selectedRowId
    console.log(rowid);
    listResponse.respond(client, msg, rowid);
  }

});



app.get('/', async (req, res) => {
  let sourceGroupNaming = 'לא נבחרה קבוצת שיגור'; // Initialize sourceGroupNaming variable
  let signature = '' // Initialize signature variable

  // Check if the database query condition is true
  const isSourceGroup = await database.read("Source", { status: "SourceGroup" });
  const isSignature = await database.read("Signature", { status: "Signature" });

  if (isSourceGroup) {
    sourceGroupNaming = isSourceGroup.name
  }

  if (isSignature) {
    signature = isSignature.text
  }




  res.render(__dirname + "/index.html", { sourceGroupNaming, signature });
});


app.get('/all-target-group-ids', async (req, res) => {
  try {
    const groupIDs = await database.getAllGroupIDs("Target");
    res.json(groupIDs);
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






// Define an endpoint for handling the button click from block 2 - Target Group
app.post('/send-to-group', async (req, res) => {
  const groupIds = req.body.groups;
  // Loop through each group ID
  if (!database.drop("Target")) {
    console.log("קיימת תקלה במונגו, נא לפנות למפתח.");
  }
  groupIds.forEach(async groupId => {

    if (database.read("Target", { group_id: groupId })) {
      console.log("קבוצת יעד כבר הוגדרה, ניתן להגדיר קבוצה אחת בלבד, מעדכן את קבוצת השיגור לקבוצה שבחרת.");
      if (!database.del("Target", { group_id: groupId })) {
        console.log("קיימת תקלה במונגו, נא לפנות למפתח.");
      }

    }
    database.insert("Target", { group_id: groupId }, { status: "TargetGroup" });

    console.log(`Added target group, group ID: ${groupId}`);
  }
  );
  datasync.sync(client);
  res.sendStatus(200);
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
  console.log(sourceGroup);
  res.sendStatus(200);
});

server.listen(port, function () {
  console.log('App running on *: ' + port);
});



client.initialize();
