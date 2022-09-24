module.exports = {
  apps : [{
    name   : "whatsapp_forwarder_plus",
    script : "./app.js",
    watch: ["app.js"],
    // Delay between restart
    watch_delay: 1000,
    ignore_watch : ["node_modules"]
  }]
}
