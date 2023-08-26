const TelegramBot = require('node-telegram-bot-api');
const database = require("./db_helper");


async function ForwardTelegram(msg, isConfig) {

    //const regex = /\*([^\s*]+)\*/g;
    let modifiedText = msg.body
    //.replace(regex, '**$1**');
    let signaturetxt = "";
    const OPT_TelegramBotToken = isConfig.OPT_TelegramBotToken;
    const telegram = new TelegramBot(OPT_TelegramBotToken, { polling: false });
    const OPT_TelegramChannelChatID = isConfig.OPT_TelegramChannelChatID;
    process.env.NTBA_FIX_319 = 1;
    process.env.NTBA_FIX_350 = 0;
    //console.log(msg);

    try{
        switch (msg.type) {
            case "chat":
                var options = {
                    parse_mode: 'Markdown'
                };
                await telegram.sendMessage(OPT_TelegramChannelChatID, modifiedText + signaturetxt, options);
                break;
            case "image":


                var attachmentData = await msg.downloadMedia();
                var options = {
                    parse_mode: 'Markdown',
                    contentType: attachmentData.mimetype
                };
                if (modifiedText == "" || modifiedText == " ") {
                    options.caption = modifiedText;
                } else {
                    options.caption = modifiedText + signaturetxt;
                }

                await telegram.sendPhoto(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data, 'base64'), options);
                break;
            case "video":
                var attachmentData = await msg.downloadMedia();
                var options = {
                    //need to fix this
                    parse_mode: 'Markdown',
                    contentType: attachmentData.mimetype
                };
                if (modifiedText == "" || modifiedText == " ") {
                    options.caption = modifiedText;
                } else {
                    options.caption = modifiedText + signaturetxt;
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
                console.log(modifiedText);
                var options = {
                    parse_mode: 'Markdown',
                    filename: attachmentData.filename,
                    contentType: attachmentData.mimetype,
                };
                if (modifiedText == "" || modifiedText == " ") {
                    options.caption = modifiedText;
                } else {
                    options.caption = modifiedText + signaturetxt;
                }
                //console.log(attachmentData);
                await telegram.sendDocument(OPT_TelegramChannelChatID, Buffer.from(attachmentData.data , 'base64'), {caption: msg}, options);
                break;
            default:
                break;



        }
        console.log("Message forwarded to Telegram");
    }catch{
        await msg.react("⚠️");
        await msg.reply("⚠️שים לב, ההודעה לא הועברה לטלגרם.⚠️\nעל מנת להפסיק הודעה זו יש לכבות העברה לטלגרם באמצעות הפורטל\n\nאם הנך מנסה להעביר הודעות לטלגרם, שים לב שהגדרת את כל ההגדרות כשורה.\nבמידה והבעיה עדיין נמשכת, יש לפנות למפתח.");
        console.log("MEssage did not forwarded to Telegram");
    }


};


async function SendWAFPStatus (botStatus)
{

        const isConfig = await database.read("config");
        
        const OPT_TelegramBotToken = isConfig.OPT_TelegramBotToken;
        const telegram = new TelegramBot(OPT_TelegramBotToken, { polling: false });
        const OPT_TelegramAdminChatID = isConfig.OPT_TelegramAdminChatID;
        if(!OPT_TelegramAdminChatID){
            return;
        }
        process.env.NTBA_FIX_319 = 1;
        process.env.NTBA_FIX_350 = 0;


        var options = {
            parse_mode: 'Markdown'
        };
        await telegram.sendMessage(OPT_TelegramAdminChatID, botStatus, options);



};

module.exports = { ForwardTelegram, SendWAFPStatus };
