const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const configfile = require('./config.json');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);


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
  debug: true
}));

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'bot-wafp' }),
  puppeteer: {
    headless: true,
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

client.initialize();

io.on('connection', function (socket) {
  socket.emit('message', 'מתחבר...');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QRCode התקבל, ניתן לסרוק כעת.');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', 'סטאטוס - זמין');
    socket.emit('message', 'סטאטוס - זמין');
    console.log('client is ready!');
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
});

// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
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

  const number = req.body.number + '@c.us';
  const message = req.body.message;


  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

client.on('message', async (msg) => {


  console.log('Message from: ', msg.from, " - ", msg.body);


    if(msg.from == configfile.SourceGroup && msg.body != '!מחק'){

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
    }else if(msg.from == configfile.SourceGroup && msg.body == '!מחק'){

        for(var Group in configfile.ForwarToGroups){

          let chat = await client.getChatById(configfile.ForwarToGroups[Group]);
          let [lastMessage] = await chat.fetchMessages({limit: 1});
          await lastMessage.delete(true);
          await sleep()
       }


    }


      if (msg.body == '!joingroups' && configfile.Owner.includes(msg.from.split('@c.us')[0])){
        let chat = await msg.getChat();
          if (chat.isGroup){
            return;
          }

        for(var inviteLink in configfile.GroupInvites){
            try {
              let inviteCode = configfile.GroupInvites[inviteLink].split('/')[3];
              console.log(inviteCode)
              await client.acceptInvite(inviteCode);
              console.log("Joined Group")
            } catch (e) {
              console.log(e)
              msg.reply(e);
          }

          await sleep()
        }}
      

        switch (msg.body) {
          case "test":
          console.log('test')

        break;
          case msg.body.match(/^!setadmin/)?.input:
            let newadminnum = msg.body.split("!setadmin ")[1]
            console.log("setadmin called for "+newadminnum+"@c.us")
            if(!configfile.Owner.includes(msg.from.split('@c.us')[0])) {
              await msg.reply("לא יקרה")
              break;
            }
            for(var Group in configfile.ForwarToGroups){
            var targetedChat = client.getChatById(configfile.ForwarToGroups[Group]);
            
            (await targetedChat).promoteParticipants([newadminnum+'@c.us'])
            await sleep()

            }
            break;
          default:
            break;
        }


      if (msg.body == '!ping') {
        msg.reply('pong')
        } else if (msg.body == '!groupids') {
        client.getChats().then(chats => {
          const groups = chats.filter(chat => !chat.isReadOnly && chat.isGroup);
          if (groups.length == 0) {
            msg.reply('You have no group yet.');
          } else {
            let groupsMsg = '*All active groups listed below:*\n\n';
            groups.forEach((group, i) => {
              groupsMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
            });
            msg.reply(groupsMsg)
          }
        });
      }

  });


server.listen(port, function () {
  console.log('App running on *: ' + port);
});
