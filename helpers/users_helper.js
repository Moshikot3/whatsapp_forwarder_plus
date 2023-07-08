async function isAdmin(msg) {
    const author = await msg.getContact();
    if(author.number == "972544911249" || author.number == "972539726337")
        return true;
    return false;
}


module.exports = {
    isAdmin,
};