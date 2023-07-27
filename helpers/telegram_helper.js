const TelegramBot = require('node-telegram-bot-api');
const database = require("./db_helper");

const OPT_TelegramToken = '6526545631:AAHdSvRL6FKzpP4jKBSs1tqZ3GXDF_Hhf4g';
const telegram = new TelegramBot(OPT_TelegramToken, { polling: false });
const OPT_TelegramChatID = '-1001971377857'
process.env.NTBA_FIX_319 = 1;
process.env.NTBA_FIX_350 = 0;





async function ForwardTelegram(msg) {


    //console.log(msg);

    switch (msg.type) {
        case "chat":
            await telegram.sendMessage(OPT_TelegramChatID, msg.body);
            break;
        case "image":
            var attachmentData = await msg.downloadMedia();
            var options = {
                contentType: attachmentData.mimetype,
                caption: msg.body
            };
            await telegram.sendPhoto(OPT_TelegramChatID, Buffer.from(attachmentData.data, 'base64'), options);
            break;
        case "video":
            var attachmentData = await msg.downloadMedia();
            var options = {
                //need to fix this
                contentType: attachmentData.mimetype,
                caption: msg.body,
            };
            await telegram.sendVideo(OPT_TelegramChatID, Buffer.from(attachmentData.data, 'base64'), options);
            break;
        case "sticker":
            var attachmentData = await msg.downloadMedia();
            var options = {
                contentType: attachmentData.mimetype,
            };
            await telegram.sendSticker(OPT_TelegramChatID, Buffer.from(attachmentData.data, 'base64'), options);
            break;
        case "document":
            var attachmentData = await msg.downloadMedia();
            console.log(msg.body);
            var options = {
                filename: attachmentData.filename,
                contentType: attachmentData.mimetype,
            };
            //console.log(attachmentData);
            await telegram.sendDocument(OPT_TelegramChatID, Buffer.from(attachmentData.data , 'base64'), {caption: msg}, options);
            break;
        default:
            break;



    }

    console.log("Message forwarded to Telegram");
};

module.exports = { ForwardTelegram };
