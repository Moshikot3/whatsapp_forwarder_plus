const TelegramBot = require('node-telegram-bot-api');
const database = require("./db_helper");


async function ForwardTelegram(msg, signaturetxt, isConfig) {


    const OPT_TelegramBotToken = isConfig.OPT_TelegramBotToken;
    const telegram = new TelegramBot(OPT_TelegramBotToken, { polling: false });
    const OPT_TelegramChannelChatID = isConfig.OPT_TelegramChannelChatID
    console.log(isConfig.OPT_TelegramChannelChatID);
    process.env.NTBA_FIX_319 = 1;
    process.env.NTBA_FIX_350 = 0;
    //console.log(msg);

    try{
        switch (msg.type) {
            case "chat":
                await telegram.sendMessage(OPT_TelegramChannelChatID, msg.body + signaturetxt);
                break;
            case "image":


                var attachmentData = await msg.downloadMedia();
                var options = {
                    contentType: attachmentData.mimetype
                };
                if (msg.body == "" || msg.body == " ") {
                    options.caption = msg.body;
                } else {
                    options.caption = msg.body + signaturetxt;
                }

                await telegram.sendPhoto(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data, 'base64'), options);
                break;
            case "video":
                var attachmentData = await msg.downloadMedia();
                var options = {
                    //need to fix this
                    contentType: attachmentData.mimetype
                };
                if (msg.body == "" || msg.body == " ") {
                    options.caption = msg.body;
                } else {
                    options.caption = msg.body + signaturetxt;
                }

                await telegram.sendVideo(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data, 'base64'), options);
                break;
            case "sticker":
                var attachmentData = await msg.downloadMedia();
                var options = {
                    contentType: attachmentData.mimetype,
                };
                await telegram.sendSticker(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data, 'base64'), options);
                break;
            case "document":
                var attachmentData = await msg.downloadMedia();
                console.log(msg.body);
                var options = {
                    filename: attachmentData.filename,
                    contentType: attachmentData.mimetype,
                };
                if (msg.body == "" || msg.body == " ") {
                    options.caption = msg.body;
                } else {
                    options.caption = msg.body + signaturetxt;
                }
                //console.log(attachmentData);
                await telegram.sendDocument(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data , 'base64'), {caption: msg}, options);
                break;
            default:
                break;



        }
    }catch{
        await msg.react("⚠️");
        await msg.reply("⚠️שים לב, ההודעה לא הועברה לטלגרם.⚠️\nעל מנת להפסיק הודעה זו יש לכבות העברה לטלגרם באמצעות הפורטל\n\nאם הנך מנסה להעביר הודעות לטלגרם, שים לב שהגדרת את כל ההגדרות כשורה.\nבמידה והבעיה עדיין נמשכת, יש לפנות למפתח.");
    }

    console.log("Message forwarded to Telegram");
};

module.exports = { ForwardTelegram };
