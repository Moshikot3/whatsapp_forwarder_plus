async function isAdmin(msg) {

    let admin = ["972544911249@c.us","972539726337@c.us"];
    console.log("Admin check msg.from:")
    console.log(msg.from);
    const author =  msg.from
    console.log(author);
    if(admin.includes(author)){
        return true;
    }
    return false;
}


module.exports = {
    isAdmin,
};