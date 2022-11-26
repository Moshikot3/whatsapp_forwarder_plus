const execute = (client,msg) => msg.reply('pong');

module.exports = {
    name: 'Ping',
    description: 'responds with pong',
    command: '!ping',
    commandType: 'plugin',
    isDependent: false,
    help: "Not much more to add you type !ping you get the pong",
    execute};