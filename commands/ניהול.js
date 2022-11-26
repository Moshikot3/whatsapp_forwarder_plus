const configfile = require('../config.json');

const execute = async (client, msg, args) => {
        let newadminnum = args[0]
        console.log("setadmin called for "+newadminnum+"@c.us");

        for(var Group in configfile.ForwarToGroups){
        var targetedChat = client.getChatById(configfile.ForwarToGroups[Group]);
        
        (await targetedChat).promoteParticipants([newadminnum+'@c.us']);
        await sleep();

        }

};


module.exports = {
    name: 'ניהול',
    description: 'מתן הרשאות ניהול למשתמש שקיים בקבוצות המוגדרות במערכת.',
    command: '!ניהול',
    requiredArgs: 1,
    commandType: 'admin',
    isDependent: false,
    help: ' לדוגמה: !ניהול 972546728726',
    execute};