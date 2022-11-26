const sleep = require('../helpers/sleep_helper.js');

const execute = async (sourceGroup, targetGroups, client, msg) => {
    if(msg.from == sourceGroup && msg.body == '!מחק'){

        for(var Group in targetGroups){
    
          let chat = await client.getChatById(targetGroups[Group]);
          let [lastMessage] = await chat.fetchMessages({limit: 1});
          await lastMessage.delete(true);
          await sleep.sleep()
       }
    
    
    }
};

module.exports = {
    name: 'מחק',
    description: 'מוחק את הפרסום האחרון',
    command: '!מחק',
    commandType: 'admin',
    isGroupOnly:true,
    isDependent: false,
    help: `*מחק*\n\nמוחק את התגובה האחרונה.\n`,
    execute};


