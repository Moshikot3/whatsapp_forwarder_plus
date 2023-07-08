const statistics = require('../helpers/stats_helper');

const execute = async (sourceGroup, targetGroups, client, msg) => {
//console.log(statistics.showstats(client, targetGroups));
var msgformat = await statistics.showstats(client, targetGroups)
await msg.reply(`${msgformat}`);
};

module.exports = {
    name: 'חשיפה',
    description: 'נתוני חשיפה',
    command: '!חשיפה',
    commandType: 'plugin',
    isDependent: false,
    help: `נתוני חשיפה`,
    execute};

