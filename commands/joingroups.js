const configfile = require('../config.json');
const sleep = require('../helpers/sleep_helper');

const execute = async (sourceGroup, targetGroups, client, msg) => {
    if (configfile.Owner.includes(msg.from.split('@c.us')[0])){
          if (chat.isGroup){
            return;
          }
    
        for(var inviteLink in configfile.GroupInvites){
            try {
              let inviteCode = configfile.GroupInvites[inviteLink].split('/')[3];
              console.log(inviteCode)
              await client.acceptInvite(inviteCode);
              console.log("Joined Group")
            } catch (e) {
              console.log(e)
              msg.reply(e);
          }
    
          await sleep.sleep()
        }}   
        msg.reply("done joining groups"); 
};

module.exports = {
    name: 'joingroups',
    description: 'מצרף את החשבון לכל ההזמנות המוגדרות במערכת.',
    command: '!joingroups',
    commandType: 'admin',
    isDependent: false,
    help: `*מחק*\n\nמוחק את התגובה האחרונה.\n`,
    execute};





