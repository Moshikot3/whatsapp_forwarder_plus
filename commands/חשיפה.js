const statistics = require('../helpers/stats_helper');

const execute = async (sourceGroup, targetGroups, client, msg) => {
    var msgformat = await statistics.showstats(client, targetGroups)
    await msg.reply(`${msgformat}`);
};

module.exports = {
    name: 'חשיפה',
    description: 'נתוני חשיפה',
    command: '!חשיפה',
    commandType: 'admin',
    isDependent: false,
    help: `נתוני חשיפה`,
    execute
};

