const database = require("./db_helper");


const listenGroups = [];
const sourceGroup = [];
const targetGroups = [];

function empty(array) {
    array.length = 0;
  }
  

async function sync(client){


    let chats = await client.getChats()


    console.log('started data pulling');

    empty(listenGroups)
    empty(sourceGroup)
    empty(targetGroups)
    
    for(const chat of chats){

        if(chat.isGroup && !chat.isReadOnly) {

            let chatid = chat.id._serialized
            let mongoid = { group_id: chatid }
            let dataListeners = await database.read("Listeners", mongoid);
            let dataSource = await database.read("Source", mongoid);
            let dataTargets = await database.read("Target", mongoid);
            if(!dataListeners && !dataSource && !dataTargets){
                continue
            }
            if(dataListeners){

                
                listenGroups.push(dataListeners.group_id);
            }
            if(dataSource){

                sourceGroup.push(dataSource.group_id);
            }
            if(dataTargets){


                targetGroups.push(dataTargets.group_id);
            }
        }

    }
console.log("Finish pulling data")
};


module.exports = {
listenGroups, sourceGroup, targetGroups ,sync};