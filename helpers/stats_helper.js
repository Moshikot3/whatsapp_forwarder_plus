const database = require("./db_helper");
var msgformat = "";

async function showstats(client, targetGroups) {
    msgformat = "";
    var gcount = "*קבוצה - מס׳ משתמשים*\n";
    let gtotalcount = 0;
    let chat = null;

    try {
        let allmessagesnum = await database.countDocuments("messages");
        let targetGroupData = await database.read("Target", { status: "TargetGroup" });
        
        if (targetGroupData === null || !Array.isArray(targetGroupData.trgroups)) {
            console.error("Target group data not found in the database or trgroups is not an array");
            // Handle the case where the data is null or not in the expected format
            // You can choose to return a default value or throw an error here
            // Example: return [];
        } else {
            let alltargetgroups = targetGroupData.trgroups;
            console.log(alltargetgroups.length);
            console.log(allmessagesnum);

            for (var group in targetGroups[0]) {
                chat = await client.getChatById(targetGroups[0][group]);
                var txtgcount = `${chat.groupMetadata.subject} - ${chat.groupMetadata.participants.length}\n`;
                gcount += txtgcount;
                gtotalcount += chat.groupMetadata.participants.length;
            }

            msgformat += gcount;
            msgformat += "*סה״כ משתמשים:* " + gtotalcount;
            msgformat += "\n\n";
            msgformat += `סה"כ הודעות שטיפלתי מקבוצות השיגור:  *${allmessagesnum}*.`;
            msgformat += "\n";
            msgformat += `כמות משוערת של הודעות שנשלחו דרכי: ${allmessagesnum * alltargetgroups.length} (כמות הודעות שיגור X מספר קבוצות)`;
        }
    } catch (error) {
        // Handle any other errors that might occur during the database operation
        console.error("An error occurred:", error);
        // You can choose to return a default value or throw an error here
        // Example: return [];
    }

    return msgformat;
}

module.exports = { msgformat, showstats };
