const { List } = require('whatsapp-web.js');


const execute = async (sourceGroup, targetGroups, client, msg) => {
    client.getChats().then( async chats => {
        const groups = chats.filter(chat => !chat.isReadOnly && chat.isGroup);
        if (groups.length == 0) {
          msg.reply('You have no group yet.');
        } else {
          //let groupsMsg = '*All active groups listed below:*\n\n';
          var listgroups = [];
          groups.forEach((group, i) => {
            listgroups.push({id: 'DELLIS-'+group.id._serialized, title: group.name});
            //console.log(listgroups);
            //let sections = [{title:'Select groups to listen',rows:[{id:'te1st1', title:'GROUP 1'},{id:'testtyutyut1yutyu', title:'GROUP 2'}]}];
            //groupsMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
          });
          let sections = [{title:'בחר קבוצה',rows:listgroups}];
          let list = new List('יש לבחור קבוצת האזנה להסרה מהרשימה מטה','פתח רשימה',sections,'הסרת קבוצות האזנה','footer');
            await client.sendMessage(msg.from, list);   
        }
    });
};

module.exports = {
    name: 'הסר-האזנה',
    description: 'הסרת קבוצת להאזנה',
    command: '!הסר-האזנה',
    commandType: 'admin',
    isDependent: false,
    help: `יש לרשום !הסר-האזנה ולבחור קבוצה מהתפריט`,
    execute};