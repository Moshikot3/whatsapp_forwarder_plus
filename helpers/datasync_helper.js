const database = require("./db_helper");

const listenGroups = []
const sourceGroup = []
const targetGroups = []

async function sync(client){
    let chats = await client.getChats()


    console.log('started data pulling');
    for(const chat of chats){

        if(chat.isGroup && !chat.isReadOnly) {

            let chatid = chat.id._serialized
            let mongoid = { group_id: chatid }
            let dataListeners = await database.read("Listeners", mongoid);
            let dataSource = await database.read("Source", mongoid);
            let dataTargets = await database.read("Targets", mongoid);
            if(!dataListeners && !dataSource && !dataTargets){
                continue
            }
            if(dataListeners){
                console.log("OK");
                listenGroups.push(dataListeners.group_id)
            }
            if(dataSource){
                sourceGroup.push(dataSource.group_id)
            }
            if(dataTargets){
                targetGroups.push(dataTargets.group_id)
            }
        }

    }

};


module.exports = {
listenGroups: listenGroups, sourceGroup, targetGroups ,sync};