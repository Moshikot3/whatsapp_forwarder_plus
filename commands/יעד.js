const { List } = require('whatsapp-web.js');


const execute = async (client, msg) => {
    client.getChats().then( async chats => {
        const groups = chats.filter(chat => !chat.isReadOnly && chat.isGroup);
        if (groups.length == 0) {
          msg.reply('You have no group yet.');
        } else {
          //let groupsMsg = '*All active groups listed below:*\n\n';
          var listgroups = [];
          groups.forEach((group, i) => {
            listgroups.push({id: 'TRG-'+group.id._serialized, title: group.name});
            //console.log(listgroups);
            //let sections = [{title:'Select groups to listen',rows:[{id:'te1st1', title:'GROUP 1'},{id:'testtyutyut1yutyu', title:'GROUP 2'}]}];
            //groupsMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
          });
          let sections = [{title:'בחר קבוצה',rows:listgroups}];
          let list = new List('יש לבחור קבוצת יעד מהרשימה מטה','פתח רשימה',sections,'הוספת קבוצות יעד','footer');
            await client.sendMessage(msg.from, list);   
        }
    });
};

module.exports = {
    name: 'יעד',
    description: 'הוספת קבוצת יעד',
    command: '!יעד',
    commandType: 'admin',
    isDependent: false,
    help: `יש לרשום !יעד ולבחור קבוצה מהתפריט`,
    execute};