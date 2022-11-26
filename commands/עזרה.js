const users = require('../helpers/users_helper');

const execute = async (sourceGroup, targetGroups, client, msg, args) => {
    let commands =  client.commands;
    if(!args.length){
        let adminHelp = "";
        if(await users.isAdmin(msg)) {
            adminHelp += '🧑‍💼 *פקודות מנהל:*\n\n';
        }
        
        let infoHelp = '🎓 *מידע*\n\n';
        let pluginHelp = '🔧 *תוספים*\n\n';
        for(const [key, command] of commands){
            if(!command.isDependent){
                if(command.commandType === 'admin' && await users.isAdmin(msg))
                    adminHelp += `⭐ *${command.name} (${command.command})*  - ${command.description}\n`;
                if(command.commandType === 'info')
                    infoHelp += `⭐ *${command.name} (${command.command})*  - ${command.description}\n`;
                if(command.commandType === 'plugin')
                    pluginHelp += `⭐ *${command.name} (${command.command})*  - ${command.description}\n`;
            }
                
        };
        let help = `${adminHelp}\n${infoHelp}\n${pluginHelp}\n${commands.get('עזרה').help}`;
        await msg.reply(help);
    }

    else if(commands.has(args[0])){
        let command = commands.get(args[0]);
        if(command.commandType === 'admin' && !await users.isAdmin(msg)) {
            return false;
        }
        await msg.reply(command.help);
    }

    else {
        await msg.reply(`אין פקודה כזו *${args[0]}*...`);
    }
    
};

module.exports = {
    name: 'עזרה',
    description: 'מתן עזרה בנושאי פקודות',
    command: '!עזרה',
    commandType: 'info',
    isDependent: false,
    help: 'ניתן להשתמש בצורה הבאה ```!עזרה [פקודה]```. לדוגמה:: ```!עזרה שיגור```',
    execute};