async function isAdmin(msg) {
    const author =  msg.from
    console.log(author);
    if(author == "972544911249@c.us" || author == "972539726337@c.us"){
        return true;
    }
    return false;
}


module.exports = {
    isAdmin,
};