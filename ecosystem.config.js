module.exports = {
  apps : [{
    name   : "Whatsapp-Forwarder-Plus",
    script : "./app.js",
    watch: ["app.js"],
    // Delay between restart
    watch_delay: 1000,
    ignore_watch : ["node_modules"]
  }]
}
