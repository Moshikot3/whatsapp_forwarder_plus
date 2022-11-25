require('dotenv').config();

var config = {};

config.mongodb_url = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/'; // Your mongodb url for example 'mongodb://127.0.0.1:27017/'.
config.github_key = process.env.GITHUB_KEY || ''; // Github Personal Key.


module.exports = config;