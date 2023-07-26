const TelegramBot = require('node-telegram-bot-api');
const token = '6526545631:AAHdSvRL6FKzpP4jKBSs1tqZ3GXDF_Hhf4g';
const telegram = new TelegramBot(token, {polling: false});
const chatid = '-1001971377857'
process.env.NTBA_FIX_319 = 1;
process.env.NTBA_FIX_350 = 0;
async function ForwardTelegram(msg) {


//console.log(msg);

switch (msg.type){
    case "chat":
        await telegram.sendMessage(chatid, msg.body);

    case "image":
        var attachmentData = await msg.downloadMedia();
        const options = {
            contentType: 'image/jpg',
            caption: msg.body
           };
          await telegram.sendPhoto(chatid, Buffer.from(attachmentData.data, 'base64'), options);
    case "video":
        var attachmentData = await msg.downloadMedia();
        console.log();
    default:
    break;



}
  
  console.log("Message forwarded to whatsapp");
};

module.exports = { ForwardTelegram };
