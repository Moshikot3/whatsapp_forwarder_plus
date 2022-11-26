const database = require("./helpers/db_helper");

let chatid = "120363043631874819@g.us"

let mongoid = { group_id: chatid }
async function datasync(){


    let dataListeners = await database.read("Listeners", { status: "Listening" });
    console.log(dataListeners);
}



datasync()