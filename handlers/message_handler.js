const database = require("../helpers/db_helper");
const sleep = require("../helpers/sleep_helper");



function addRandomExtraSpace(text) {
    if (!text || text.trim() === '') {
      // If the input text is empty or contains no words, return the original input
      return text;
    }
  
    const words = text.split(' ');
    if (words.length <= 1) {
      // If the input text has only one word, return the original input
      return text;
    }
  
    const randomIndex = Math.floor(Math.random() * (words.length - 1)) + 1; // Choose a random word index, excluding the first word
    words[randomIndex] += ' '; // Add a space to the chosen word
    return words.join(' ');
}

async function handleMessage(targetGroups,sourceGroup, client, msg){

if (msg.from == sourceGroup && msg.body != '!מחק') {
    
    let author = msg.author;
    //console.log(msg);
    let options = {};
    await msg.react("🔄");


    const clientInfo = client.info;

    console.log(clientInfo.wid._serialized);
    let qutmsginfo = undefined;
    let quotemsg = undefined;



    if (msg.hasQuotedMsg) {
      let qutmsgid = msg._data.quotedStanzaID;

      try {
        qutmsginfo = await database.read("messages", { messageid: qutmsgid })
        quotemsg = await msg.getQuotedMessage();

        if (!qutmsginfo || qutmsginfo == "" || !qutmsginfo.trgroup) {
          msg.reply("ההודעה המצוטטת לא קיימת במאגר.");
          await msg.react("❌");
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
      await database.insert("messages", { messageid: msg.id.id }, { srcgroup: msg.from, msgtext: msg.body, botsender: clientInfo.wid._serialized });
      console.log("srcgroup wrote in db");
    }
    catch { console.log("Error saving srcmsgid to MongoDB"); }
    // Remove signature symbol "~" from msg.body
    if (msg.body.endsWith("~")) {
      msg.body = msg.body.slice(0, -1); // Remove last character (~)
      var signaturetxt = ""; // Set signaturetxt to empty string
    } else {
      try {
        var signaturetxt = "\n\n" + (await database.read("Signature", { status: "Signature" })).text;
      }
      catch {
        console.log("Error pulling signature from MongoDB");
        var signaturetxt = ""
      }
    }
    let trgroupsmsgid = [];
    let trgroupsid = [];

    for (const Group in targetGroups[0]) {
      
      const modifiedText = addRandomExtraSpace(msg.body);
      let trmsg = undefined;
      const targetchat = await client.getChatById(targetGroups[0][Group]);
      //console.log(targetchat);
      await sleep.sleep(400);
      targetchat.sendSeen();
      targetchat.sendStateTyping();
      await sleep.sleep();
      let extras = null;

      //quote messages handeling
      if (msg.hasQuotedMsg && qutmsginfo.trgroup) {


        for (let i = 0; i < qutmsginfo.trgroup.length; i++) {
          const trGroup = qutmsginfo.trgroup[i];
          const trMessageID = qutmsginfo.trgtmsgID[i];
          console.log("Trgroup: " + trGroup + ", GROUP: " + Group);
          if (trGroup == targetGroups[0][Group]) {
            options.quotedMessageId = "true_" + trGroup + "_" + trMessageID + "_" + clientInfo.wid._serialized;
            console.log("EXTRAS BELOW");
            console.log(options);
            break;

          }
        }

      } else {
        options = {};
      }


      if (msg.type == 'chat') {
        console.log("Send message");
        trmsg = await client.sendMessage(targetGroups[0][Group], modifiedText + signaturetxt, options);
      } else if (msg.type == 'ptt') {
        console.log("Send audio");
        let audio = await msg.downloadMedia();
        options.sendAudioAsVoice = true;
        trmsg = await client.sendMessage(targetGroups[0][Group], audio, options);
      } else if (msg.type == 'image' || msg.type == 'video' || msg.type == 'document') {
        console.log("Send image/video/document");
        let attachmentData = await msg.downloadMedia();
        if (modifiedText == "" || modifiedText == " ") {
          options.caption = modifiedText;
        } else {
          options.caption = modifiedText + signaturetxt;
        }

        try{
        trmsg = await client.sendMessage(targetGroups[0][Group], attachmentData, options);
        }catch{
          msg.react("❌");
          console.log("Error sending video, - Not supported");
          return;
        }
      } else if (msg.type == 'sticker') {
        let attachmentData = await msg.downloadMedia();
        let buffer = Buffer.from(attachmentData.data);
        if (buffer.length / 1e+6 > 5) {
          console.log("אאאאיפה אחי כבד");
          return;
        }
        options.sendMediaAsSticker = true;
        options.stickerAuthor = "חדשות הבזק";
        options.stickerName = "חדשות הבזק";
        trmsg = await client.sendMessage(targetGroups[0][Group], attachmentData, options);
      }
      console.log(`forward message to ${targetGroups[0][Group]}`);

      trgroupsmsgid.push(trmsg._data.id.id);
      trgroupsid.push(targetGroups[0][Group]);

      targetchat.clearState();

    }

    //telegram.ForwardTelegram(msg);


    //saving messages targetgroups
    try {
      await database.insert("messages", { messageid: msg.id.id }, { trgroup: trgroupsid, trgtmsgID: trgroupsmsgid });
    }
    catch { console.log("Error saving srcmsgid to MongoDB"); }

    //msg.reply("הפצת ההודעה הסתיימה.");
    msg.react("✅");

  }

}

module.exports = {handleMessage};