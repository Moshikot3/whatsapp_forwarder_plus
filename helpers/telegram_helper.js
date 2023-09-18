const TelegramBot = require('node-telegram-bot-api');
const database = require("./db_helper");
const fs = require("fs");

async function ForwardTelegram(msg, isConfig, telquotemsg) {

    //const regex = /\*([^\s*]+)\*/g;
    let modifiedText = msg.body
    //.replace(regex, '**$1**');
    let signaturetxt = "";
    const OPT_TelegramBotToken = isConfig.OPT_TelegramBotToken;
    const telegram = new TelegramBot(OPT_TelegramBotToken, { polling: false });
    const OPT_TelegramChannelChatID = isConfig.OPT_TelegramChannelChatID;
    process.env.NTBA_FIX_319 = 1;
    process.env.NTBA_FIX_350 = 0;
    let tlgrmsg;

    try {
        switch (msg.type) {
            case "chat":
                var options = {
                    parse_mode: 'Markdown',
                    reply_to_message_id: telquotemsg
                };
                tlgrmsg = await telegram.sendMessage(OPT_TelegramChannelChatID, modifiedText + signaturetxt, options);

                return tlgrmsg;
            case "image":


                var attachmentData = await msg.downloadMedia();
                var options = {
                    parse_mode: 'Markdown',
                    contentType: attachmentData.mimetype,
                    reply_to_message_id: telquotemsg
                };
                if (modifiedText == "" || modifiedText == " ") {
                    options.caption = modifiedText;
                } else {
                    options.caption = modifiedText + signaturetxt;
                }

                tlgrmsg = await telegram.sendPhoto(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data, 'base64'), options);
                return tlgrmsg;
            case "video":
                var attachmentData = await msg.downloadMedia();
                var options = {
                    //need to fix this
                    parse_mode: 'Markdown',
                    contentType: attachmentData.mimetype,
                    reply_to_message_id: telquotemsg
                };
                if (modifiedText == "" || modifiedText == " ") {
                    options.caption = modifiedText;
                } else {
                    options.caption = modifiedText + signaturetxt;
                }

                tlgrmsg = await telegram.sendVideo(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data, 'base64'), options);
                return tlgrmsg;

            case "sticker":
                var attachmentData = await msg.downloadMedia();
                var options = {
                    contentType: attachmentData.mimetype,
                    reply_to_message_id: telquotemsg
                };
                tlgrmsg = await telegram.sendSticker(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data, 'base64'), options);
                break;
            case "document":
                var attachmentData = await msg.downloadMedia();
                console.log(modifiedText);
                var options = {
                    parse_mode: 'Markdown',
                    filename: attachmentData.filename,
                    contentType: attachmentData.mimetype,
                    reply_to_message_id: telquotemsg
                };
                if (modifiedText == "" || modifiedText == " ") {
                    options.caption = modifiedText;
                } else {
                    options.caption = modifiedText + signaturetxt;
                }
                //console.log(attachmentData);
                tlgrmsg = await telegram.sendDocument(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data, 'base64'), { caption: msg }, options);

                break;
            default:
                break;



        }
        console.log("Message forwarded to Telegram");
    } catch {
        tlgrmsg = "";
        await msg.react("⚠️");
        await msg.reply("⚠️שים לב, ההודעה לא הועברה לטלגרם.⚠️\nעל מנת להפסיק הודעה זו יש לכבות העברה לטלגרם באמצעות הפורטל\n\nאם הנך מנסה להעביר הודעות לטלגרם, שים לב שהגדרת את כל ההגדרות כשורה.\nבמידה והבעיה עדיין נמשכת, יש לפנות למפתח.");
        console.log("MEssage did not forwarded to Telegram");
    }


};


async function delMessage(chatid, msgid) {
    const isConfig = await database.read("config");
    if (isConfig) {
        console.log("Entering DeleteMessage" + chatid + " " + msgid);
        const OPT_TelegramBotToken = isConfig.OPT_TelegramBotToken;
        const telegram = new TelegramBot(OPT_TelegramBotToken, { polling: false });


        try {
            await telegram.deleteMessage(chatid, msgid);
        } catch {
            await msg.react("⚠️");
            await msg.reply("⚠️בעיה במחיקת הודעה בטלגרם, יש לדווח למפתח⚠️");
        }

    }

};

async function SendWAFPStatus(botStatus) {

    const isConfig = await database.read("config");

    //I would like ot make sure that if there's no isConfig.OPT_TelegramBotToken the app will not crash

    if (isConfig) {

        const OPT_TelegramBotToken = isConfig.OPT_TelegramBotToken;
        const telegram = new TelegramBot(OPT_TelegramBotToken, { polling: false });
        const OPT_TelegramAdminChatID = isConfig.OPT_TelegramAdminChatID;
        // console.log(OPT_TelegramAdminChatID);
        if (OPT_TelegramAdminChatID) {
            process.env.NTBA_FIX_319 = 1;
            process.env.NTBA_FIX_350 = 0;

            var options = {
                parse_mode: 'Markdown'

            };
            await telegram.sendMessage(OPT_TelegramAdminChatID, botStatus, options);
        } else {
            return;
        }


    }




};

async function Sendqrcode(qrcode) {

    const isConfig = await database.read("config");

    //I would like ot make sure that if there's no isConfig.OPT_TelegramBotToken the app will not crash

    if (isConfig) {

        const OPT_TelegramBotToken = isConfig.OPT_TelegramBotToken;
        const telegram = new TelegramBot(OPT_TelegramBotToken, { polling: false });
        const OPT_TelegramAdminChatID = isConfig.OPT_TelegramAdminChatID;
        // const qr = Buffer.from(qrcode, 'base64');
        // fs.writeFileSync('temp_qr.png', qr);
        console.log(qrcode);
        const base64Image = qrcode; // Your base64 image string here

        // Extract the image data from the base64 string
        const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (matches.length !== 3) {
            console.error('Invalid base64 image string');
            process.exit(1);
        }

        const [, imageType, base64Data] = matches;

        // Create a buffer from the base64 data
        const buffer = Buffer.from(base64Data, 'base64');




        if (OPT_TelegramAdminChatID) {
            process.env.NTBA_FIX_319 = 1;
            process.env.NTBA_FIX_350 = 0;

            var options = {
                parse_mode: 'Markdown'

            };
            await telegram.sendPhoto(OPT_TelegramAdminChatID, buffer, options);
        } else {
            return;
        }


    }




};
module.exports = { ForwardTelegram, SendWAFPStatus, delMessage, Sendqrcode };
