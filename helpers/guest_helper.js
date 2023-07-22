const users = require('./users_helper');
const database = require("./db_helper");

async function SendGuestMessage(client, msg) {
  if (!await users.isAdmin(msg)) {
    const isConfig = await database.read("config");

    let guestmsg = "";

    if (!isConfig) {
      guestmsg = "";
    } else {
      guestmsg = isConfig.guestmsg;
    }

    if (guestmsg && guestmsg != "") {
      console.log("Guest Message: " + guestmsg);
      await msg.reply(guestmsg);
    } else {
      console.log("guest message set");
    }

    // OPT_GuestMSGToAdmin
    console.log(isConfig.OPT_GuestMSGToAdmin);
    if (isConfig.OPT_GuestMSGToAdmin && isConfig.SEC_AdminList != "") {
      let guestContact = await msg.getContact();
      const adminList = isConfig.SEC_AdminList.split(","); // Parse the admin numbers into an array
      for (const admin of adminList) {
        const adminNumber = `972${Number(admin).toString()}@c.us`; // Convert admin number to WhatsApp format
        await msg.forward(adminNumber); // Forward the guest message to each admin
        await client.sendMessage(adminNumber, guestContact); // Send the contact info to each admin
      }
    }
  }
};

module.exports = { SendGuestMessage };
