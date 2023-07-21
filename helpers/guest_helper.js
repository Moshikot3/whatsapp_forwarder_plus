const users = require('./users_helper');
const database = require("./db_helper");

async function SendGuestMessage(client, msg) {
    let guestmsg = ""

    if(!(await database.read("config"))){
        guestmsg = ""
    }else{
        guestmsg = (await database.read("config")).guestmsg;
    }
        if(guestmsg && guestmsg != ""){



        console.log("Guest Message: "+guestmsg);
        await msg.reply(guestmsg);
        }else{
            console.log("guest message set");
        }

        let guestContact = await msg.getContact();
        await msg.forward("972544911249@c.us");
        //await client.sendMessage("@c.us", "*הודעה מהמשתמש "+abacontact.pushname+":*\n\n"+AbaMessage_String);
        await client.sendMessage("972544911249@c.us", guestContact);

};



module.exports = { SendGuestMessage };