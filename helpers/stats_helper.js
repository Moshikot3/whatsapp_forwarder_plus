const database = require("./db_helper");
var msgformat = "";

async function showstats(client, targetGroups) {
    msgformat = "";
    var gcount = "*קבוצה - מס׳ משתמשים*\n";
    let gtotalcount = 0;
    let chat = null;
    let allmessagesnum = await database.countDocuments("messages");
    let alltargetgroups = (await database.read("Target", { status: "TargetGroup" })).trgroups;
    console.log(alltargetgroups.length);
    console.log(allmessagesnum);
    // const result = await database.countTrgtmsgID("messages");
    // console.log(result);

    for (var group in targetGroups[0]) {

        chat = await client.getChatById(targetGroups[0][group]);
        var txtgcount = `${chat.groupMetadata.subject} - ${chat.groupMetadata.participants.length}\n`;
        gcount += txtgcount;
        gtotalcount += chat.groupMetadata.participants.length

    }


    msgformat += gcount;
    msgformat += "*סה״כ משתמשים:* " + gtotalcount;
    msgformat += "\n\n";
    msgformat += `סה"כ הודעות שטיפלתי מקבוצות השיגור:  *${allmessagesnum}*.`;
    msgformat += "\n";
    msgformat += `כמות משוערת של הודעות שנשלחו דרכי: ${allmessagesnum*alltargetgroups.length} (כמות הודעות שיגור X מספר קבוצות)`;

    

    return msgformat;


};


module.exports = { msgformat, showstats };