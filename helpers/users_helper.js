async function isAdmin(msg) {
    const author = await msg.getContact();
    if(author.number == "972544911249")
        return true;
    return false;
}


module.exports = {
    isAdmin,
};