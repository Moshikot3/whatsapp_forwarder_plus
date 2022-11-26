const database = require("./db_helper");
const datasync = require("./datasync_helper");

async function respond(client, msg, rowid){

    switch(rowid){
        //Listening groups list answer
        //Add - Listening
        case rowid.match(/^LIS-/)?.input:

          console.log("receieved response from list.");
          //selgroupName = listgroups.find(group => group.id === msg.selectedRowId)
          if(await database.read("Listeners", {group_id: rowid.replace("LIS-", "")})){
            await msg.reply("קבוצת ההאזנה שבחרת כבר קיימת במאגר.");
            break;

          }

          await database.insert("Listeners", { group_id: rowid.replace("LIS-", "") }, { status: "Listening" });
          await datasync.sync(client);
          await msg.reply("בוצע")


        break;

        //Delete - Listening
        case rowid.match(/^DELLIS-/)?.input:
          if(!await database.read("Listeners", {group_id: rowid.replace("DELLIS-", "")})){
            await msg.reply("קבוצת ההאזנה שבחרת להסיר לא קיימת במאגר כך שאין מה להסיר.");
            break;
          }

          if(!database.del("Listeners", {group_id: rowid.replace("DELLIS-", "")})) {
            await msg.reply("קיימת תקלה במונגו, נא לפנות למפתח.")
            break;
          }

          await datasync.sync(client);
          await msg.reply("בוצע");
        break;

        //SourceGroup list answer
        //Add - Sourcegroup
        case rowid.match(/^SRC-/)?.input:

          console.log("receieved response from list.");
          //selgroupName = listgroups.find(group => group.id === msg.selectedRowId)

          if(await database.read("Source", {status: "SourceGroup"})){
            await msg.reply("קבוצת שיגור כבר הוגדרה, ניתן להגדיר קבוצה אחת בלבד, מעדכן את קבוצת השיגור לקבוצה שבחרת.");
            if(!database.del("Source", { status: "SourceGroup" })) {
              await msg.reply("קיימת תקלה במונגו, נא לפנות למפתח.");
              break;
           }

          }
          await database.insert("Source", { group_id: rowid.replace("SRC-", "") }, { status: "SourceGroup" });
          await datasync.sync(client);
          await msg.reply("בוצע");
        break;

        //Delete - Sourcegroup - No need

        //Target Groups list answer
        //Add - Target
        case rowid.match(/^TRG-/)?.input:

          if(await database.read("Target", {group_id: rowid.replace("TRG-", "")})){
            await msg.reply("קבוצת היעד שבחרת כבר קיימת במאגר.");
            break;


          }
          await database.insert("Target", { group_id: rowid.replace("TRG-", "") }, { status: "Active" });
          await datasync.sync(client);
          await msg.reply("בוצע");
        break;

        //Delete - Target
        case rowid.match(/^DELTRG-/)?.input:
          if(!await database.read("Target", {group_id: rowid.replace("DELTRG-", "")})){
            await msg.reply("הקבוצה שבחרת להסיר לא קיימת במאגר כך שאין מה להסיר.");
            break;
          }

          if(!database.del("Target", {group_id: rowid.replace("DELTRG-", "")})) {
            await msg.reply("קיימת תקלה במונגו, נא לפנות למפתח.")
            break;
          }

          await datasync.sync(client);
          await msg.reply("בוצע");
        break;
    }

};


module.exports = {respond};