const database = require("../db");

async function insert(colllection, id, args) {
    try {
      var { conn, coll } = await database(colllection);
      const query = id;
      const update = { $set: args};
      const options = { upsert: true };
      await coll.updateOne(query, update, options);
      return true;
    } catch (error) {
      console.log(error)
      return false;
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }
  

async function read(collection, id) {
  try {
    var { conn, coll } = await database(collection);
    var data = await coll.findOne(id);
    return data;
  } catch (error) {
    return false;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

  
async function del(collection, id) {
  try {
    var { conn, coll } = await database(collection);
    await coll.deleteOne(id);
    return true;
  } catch (error) {
    return false;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

async function add(colllection, id, addition) {
  try {
    var { conn, coll } = await database(colllection);
    const query = id;
    const update = { $push: addition};
    const options = { upsert: true };
    await coll.updateOne(query, update, options);
    return true;
  } catch (error) {
    console.log(error)
    return false;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}


async function increment(colllection, id, addition) {
  try {
    var { conn, coll } = await database(colllection);
    const query = id;
    const update = {$inc: addition };
    const options = { upsert: true };
    await coll.updateOne(query, update, options);
    return true;
  } catch (error) {
    console.log(error)
    return false;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}


async function remove(colllection, id, removal) {
  try {
    var { conn, coll } = await database(colllection);
    const query = id;
    const update = { $pull: removal};
    const options = { upsert: true };
    await coll.updateOne(query, update, options);
    return true;
  } catch (error) {
    console.log(error)
    return false;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

module.exports = {
  insert,
  read,
  del,
  add,
  remove,
  increment
};