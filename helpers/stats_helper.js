var msgformat = "";

async function showstats(client, targetGroups) {
    msgformat = "";
    var gcount = "*קבוצה - מס׳ משתמשים*\n";
    let gtotalcount = 0;
    let chat = null;

    for (var group in targetGroups[0]) {

        chat = await client.getChatById(targetGroups[0][group]);
        var txtgcount = `${chat.groupMetadata.subject} - ${chat.groupMetadata.participants.length}\n`;
        gcount += txtgcount;
        gtotalcount += chat.groupMetadata.participants.length
    }


    msgformat += gcount
    msgformat += "*סה״כ משתמשים:* " + gtotalcount
    

    return msgformat;


};


module.exports = { msgformat, showstats };