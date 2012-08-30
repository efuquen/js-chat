var express = require('express');
var app = express.createServer();
var sio = require('socket.io').listen(3001);
var  _ = require('underscore');

app.use(express.bodyParser());

var channels = {};

function channelJoinHandler(data, socket) {
  var channelName = data.channel, nick = data.nick;
  if(channels.hasOwnProperty(channelName)) {
    var channel = channels[channelName];
    if (!channel.hasOwnProperty(nick)) {
      channel[nick] = socket;
      console.log("INFO: %s joined channel '%s'", nick, channelName);
    } else {
      //TODO: handle disconnect better so this doesn't happen
      channel[nick] = socket;
      console.log("WARN: Duplicate join attempted by nick %s on channel %s", 
        nick, channel
      );
    }
  } else {
    channels[channelName] = {};
    channels[channelName][nick] = socket;
    console.log("INFO: Channel '%s' created by %s", channelName, nick);
  }
}

sio.sockets.on('connection', function (socket) {
  socket.on('join', function (data) { channelJoinHandler(data, socket) });
});

app.post('/channel/:name', function (req, res) {
  var channelName = req.params.name, fromNick = req.body.nick, msg = req.body.msg;

  if (channels.hasOwnProperty(channelName)) {
    var channel = channels[channelName];
    _.each(channel, function (socket, toNick) {
      socket.emit('received', { msg: msg, nick: fromNick, channel: channelName });
    });
    console.log("INFO: %s sent message '%s' to channel %s", fromNick, msg, channelName);
    res.send(200);
  } else {
    var errMessage = "ERROR: Channel " + channelName + " DNE";
    console.log(errMessage);
    res.send(500, errMessage);
  }
});

app.listen(3000);
