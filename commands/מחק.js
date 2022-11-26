const configfile = require('../config.json');
const sleep = require('../helpers/sleep_helper.js');

const execute = async (client, msg) => {
    if(msg.from == configfile.SourceGroup && msg.body == '!מחק'){

        for(var Group in configfile.ForwarToGroups){
    
          let chat = await client.getChatById(configfile.ForwarToGroups[Group]);
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
    isDependent: false,
    help: `*מחק*\n\nמוחק את התגובה האחרונה.\n`,
    execute};


