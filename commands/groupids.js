const execute = async (sourceGroup, targetGroups, client, msg) => {

        client.getChats().then(async chats => {
          const groups = chats.filter(chat => !chat.isReadOnly && chat.isGroup);
          if (groups.length == 0) {
           await msg.reply('You have no group yet.');
          } else {
            let groupsMsg = '*All active groups listed below:*\n\n';
            groups.forEach((group, i) => {
              groupsMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
            });
            await msg.reply(groupsMsg)
          }
        });

};

module.exports = {
    name: 'groupids',
    description: 'רשימת קבוצות',
    command: '!groupids',
    commandType: 'plugin',
    isDependent: false,
    help: `הצג רשימת קבוצות`,
    execute};





