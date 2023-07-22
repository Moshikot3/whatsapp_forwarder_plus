const database = require("./db_helper");

async function isAdmin(msg) {
  const isConfig = await database.read("config");
  console.log(isConfig.SEC_AdminList);

  // Parse the SEC_AdminList string and convert it into an array of admin numbers
  let adminList = isConfig.SEC_AdminList.split(",");

  // Update each admin number to the WhatsApp format and remove leading zeros
  adminList = adminList.map((admin) => {
    const adminNumber = Number(admin).toString(); // Convert to number and back to string to remove leading zeros
    return `972${adminNumber}@c.us`;
  });

  console.log("Admin check msg.from:");
  console.log(msg.from);
  const author = msg.from;
  console.log(adminList);
  
  // Check if the message sender's number is in the adminList
  if (adminList.includes(author)) {
    console.log("Is Admin");
    return true;
  }
  console.log("Is Not Admin");
  return false;
}

module.exports = {
  isAdmin,
};
