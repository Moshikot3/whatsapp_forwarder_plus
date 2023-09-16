const sleep = require('../helpers/sleep_helper.js');
const database = require("../helpers/db_helper");
const telegram = require("../helpers/telegram_helper");



const execute = async (sourceGroup, targetGroups, client, msg) => {
    const isConfig = await database.read("config");
    let delmsgid = undefined;
    let delmsginfo = undefined;
    let telquotemsg;


    if (msg.from == sourceGroup && msg.body == '!מחק') {
        await msg.react("🔄");
        if (msg.hasQuotedMsg == false) {
            msg.reply("יש לצטט את ההודעה אשר ברצונך למחוק");
            return;
        }
        delmsgid = msg._data.quotedStanzaID;


        try {
            delmsginfo = await database.read("messages", { messageid: delmsgid })

            msg.reply("אני על זה, נא להעזר בסבלנות");

        } catch {
            msg.reply("הודעה לא קיימת במאגר / אין חיבור למסד נתונים מונגו.");
            msg.react("❌");
            return;

        };


        //console.log(msg);
        if (isConfig.OPT_TelegramBotToken && isConfig.OPT_TelegramChannelChatID && isConfig.OPT_forwardTelegram)
            if (delmsginfo.tlgrmsg) {
                telquotemsg = delmsginfo.tlgrmsg;

                console.log(isConfig.OPT_TelegramChannelChatID + " " + telquotemsg);
                await telegram.delMessage(isConfig.OPT_TelegramChannelChatID, telquotemsg);
            }else{
                console.log("Could");
            }

        try {
            for (let i = 0; i < delmsginfo.trgroup.length; i++) {
                const trGroup = delmsginfo.trgroup[i];
                const trMessageID = delmsginfo.trgtmsgID[i];
                console.log(`The selected group is ${trGroup} with ID ${trMessageID}`);
                console.log(trMessageID);

                let chat = await client.getChatById(trGroup);
                let chatHistory = (await chat.fetchMessages({ limit: 100 }));
                for (const message of chatHistory) {
                    if (message._data.id.id == trMessageID) {

                        await message.delete(true);
                    }
                }

                await sleep.sleep();


            }
        } catch(error) {
            console.log(error);
            msg.reply("תקלה במחיקת הודעה - וודא כי הפצת ההודעה הסתיימה לפני מחיקה וכי אתה מצטט את *ההודעה הנכונה*, במידה והתקלה נמשכת יש לפנות למפתח.");
            await msg.react("❌");
            return;
        }

        msg.reply("סיימתי");
        await msg.react("✅");

    }
};

module.exports = {
    name: 'מחק',
    description: 'מוחק הודעה מצוטטת',
    command: '!מחק',
    commandType: 'plugin',
    isGroupOnly: true,
    isDependent: false,
    help: `*מחק*\n\nמוחק את התגובה האחרונה.\n`,
    execute
};


