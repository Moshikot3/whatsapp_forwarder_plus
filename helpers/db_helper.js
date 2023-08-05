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

async function drop(collection) {
  try {
    var { conn, coll } = await database(collection);
    await coll.drop();
    return true;
  } catch (error) {
    console.error('Error deleting collection:', error);
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

async function getAllGroupIDs(collection) {
  try {
    var { conn, coll } = await database(collection);
    const targetDocuments = await coll.find({ status: 'TargetGroup' }).toArray();
    const groupIDs = targetDocuments.map(doc => doc.group_id);
    return groupIDs;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to retrieve group IDs');
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


async function removeFields(collection, query, fieldsToRemove) {
  try {
    var { conn, coll } = await database(collection);
    
    // Fetch the document based on the provided query
    const document = await coll.findOne(query);
    
    if (!document) {
      console.log("Document not found");
      return false;
    }

    let update = { $unset: {} };

    // If fieldsToRemove is an array, remove all the fields mentioned in the array.
    if (Array.isArray(fieldsToRemove)) {
      fieldsToRemove.forEach((field) => {
        update.$unset[field] = 1;
      });
    } else {
      // If fieldsToRemove is a single field, remove only that field.
      update.$unset[fieldsToRemove] = 1;
    }

    const options = { upsert: true };
    await coll.updateOne(query, update, options);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

async function countDocuments(collection) {
  try {
    var { conn, coll } = await database(collection);
    const count = await coll.countDocuments();
    return count;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to count documents');
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

// async function countTrgtmsgID(collection) {
  
//   try {
//     var { conn, coll } = await database(collection);

//     // Fetch the first few documents to check the structure
//     const documents = await coll.find().limit(5).toArray();
//     console.log("Sample documents:", documents);

//     // Aggregate pipeline to count the number of elements in the trgtmsgID array for each document
//     const pipeline = [
//       {
//         $project: {
//           _id: 1,
//           trgtmsgIDCount: { $size: { $ifNull: ["$trgtmsgID", []] } }
//         }
//       }
//     ];

//     const result = await coll.aggregate(pipeline).toArray();

//     return result;
//   } catch (error) {
//     console.error('Error:', error);
//     throw new Error('Failed to count trgtmsgID array for each document');
//   } finally {
//     if (conn) {
//       await conn.close();
//     }
//   }
// }

async function addToDocument(collection, query, dataToAdd) {
  try {
    var { conn, coll } = await database(collection);

    // Check if the document exists
    const existingDocument = await coll.findOne(query);

    // If the document exists, update it with the new data
    if (existingDocument) {
      const update = { $set: dataToAdd };
      await coll.updateOne(query, update);
    } else {
      // If the document doesn't exist, insert a new one with the data
      await coll.insertOne({ ...query, ...dataToAdd });
    }

    return true;
  } catch (error) {
    console.log(error);
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
  drop,
  increment,
  getAllGroupIDs,
  removeFields,
  addToDocument,
  countDocuments
  
};