var nick = "ed";
var channelName = "test";
var socket = io.connect("http://localhost:3001");
socket.on('received', function(data) {
  var nickFrom = data['nick'];
  var channelFrom = data['channel'];
  var msg = data['msg'];
  $('textarea#chat_window').val($('textarea#chat_window').val() + nickFrom + ": " + msg + "\n");
  console.log("INFO: Channel: '%s' Message from %s: %s", channelFrom, nickFrom, msg);
});

$('input#chat_submit').click(sendMessageHandler)

//function joinChannel {
  socket.emit('join', {nick: nick, channel: channelName});
//}

function sendMessageHandler() {
  var msg = $('input#chat_message').val();
  $.post("channel/" + channelName, {nick: nick, msg: msg});
}
