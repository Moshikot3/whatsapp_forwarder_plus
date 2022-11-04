exports.allAccess = (req, res) => {
  res.status(200).send("Welcome to whatsapp forwarder plus homepage.");
};

exports.userBoard = (req, res) => {
  res.status(200).sendFile('./web/user.html', {
    root: __dirname
  });
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
