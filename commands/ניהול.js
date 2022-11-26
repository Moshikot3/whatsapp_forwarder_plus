const sleep = require('../helpers/sleep_helper.js');

const execute = async (sourceGroup, targetGroups, client, msg, args) => {
        let newadminnum = args[0]
        console.log("setadmin called for "+newadminnum+"@c.us");

        for(var Group in targetGroups){
        var targetedChat = client.getChatById(targetGroups[Group]);
        
        (await targetedChat).promoteParticipants([newadminnum+'@c.us']);
        await sleep.sleep();

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