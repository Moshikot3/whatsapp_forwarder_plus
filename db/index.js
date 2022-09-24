const { MongoClient } = require("mongodb");
const config = require("../config");

module.exports = async (collection) => {
  if(!config.mongodb_url)
    return false;
  var conn = await MongoClient.connect(config.mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return {
    conn,
    coll: conn.db("WAFP").collection(collection),
  };
};