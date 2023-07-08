const database = require("./db_helper");


const listenGroups = [];
const sourceGroup = [];
const targetGroups = [];
const signaturetxt = [];

function empty(array) {
    array.length = 0;
}
  


async function sync(client){


    let chats = await client.getChats()


    console.log('started data pulling');

    empty(listenGroups)
    empty(sourceGroup)
    empty(targetGroups)
    empty(signaturetxt)
    let dataTargets = [];
    let dataSignature = await database.read("Signature", { status: "Signature" });
    if((!await database.read("Target", { status: "TargetGroup" })).trgroups){
        dataTargets = [];
    }else{
         dataTargets = (await database.read("Target", { status: "TargetGroup" })).trgroups;
    }

    for(const chat of chats){s
        

        if(chat.isGroup && !chat.isReadOnly) {

            let chatid = chat.id._serialized
            let mongoid = { group_id: chatid }
            let dataListeners = await database.read("Listeners", mongoid);
            let dataSource = await database.read("Source", mongoid);

            if(!dataListeners && !dataSource && !dataTargets){
                continue
            }
            if(dataListeners){

                
                listenGroups.push(dataListeners.group_id);
            }
            if(dataSource){

                sourceGroup.push(dataSource.group_id);
            }
        }

    }

    if(dataTargets){


        targetGroups.push(dataTargets);
    }
    if(dataSignature){

        signaturetxt.push(dataSignature.text);
        
    }

console.log("Finish pulling data")
};


module.exports = {
listenGroups, sourceGroup, targetGroups, signaturetxt ,sync};