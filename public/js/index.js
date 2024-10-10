var socket = io({transports: ['websocket'], upgrade: false});
var username = '';

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function addMessage(message) {
  var messageClass;
  var content;
  if (message.username === username) {
    messageClass = "replies";
  }
  else messageClass = "sent";
  if (typeof message.body === 'object') {
    if (message.body.type.includes("image")) {
      content = `<a href="`+message.body.data+`">
                  <img class="sent-messages" rel="preload" src="`+message.body.data+`" alt="" />
                 </a>`;
    }
    else {
      content = `<i class="fa fa-file" style="margin-right:5px;"><a href="`+message.body.data+`" download="`+message.body.name+`"></i>`+message.body.name+`</a>`;
    }
  }
  else content = message.body;
  $('#messages').append($('<li class="'+messageClass+'">').html(`
    <img rel="preload"src="/images/default.png" alt="" />
    <p style="word-break: break-all;">
      <em style="font-size:15px;font-weight: bold;">`+message.username+`</em>
      <em style="font-size:15px;font-weight:lighter;margin-left:20px;float:right;">`+moment(message.createdAt).format('HH:mm')+`</em>
      <br>
      `+content+`
    </p>
  `));
}

function refreshChat(res)
{
  res.messages.forEach(function(message) {
    addMessage(message);
  });
  $(".messages").animate({ scrollTop: $(".messages")[0].scrollHeight }, "fast");
}

function sendMessage()
{
  if ($("#chatBar").val() !== '') {
    socket.emit('newMessage', {
      id: socket.id,
      body: $("#chatBar").val(),
      username,
    });
    $("#chatBar").val('');
  }
}

socket.on('refreshChat', function (res) {
  $('#messages').empty();
  refreshChat(res);
});

socket.on('newMessage', function(message) {
  addMessage(message);
  $(".messages").animate({ scrollTop: $(".messages")[0].scrollHeight }, "fast");
});

socket.on('connect', function () {
  console.log('Connected to server');
  username = getCookie('username').substring(0, 20);
  socket.emit('sendUsername', username);
  socket.emit('refreshChat');
});

socket.on('usersConnected', function (users) {
  $('#contacts-panel').empty();
  users.forEach(function(user) {
    $('#contacts-panel').append($('<li class="contact">').html(`
      <div class="wrap">
        <span class="contact-status online"></span>
        <img src="/images/default.png" alt="" />
        <div class="meta">
          <p class="name">`+user+`</p>
        </div>
      </div>
    `));
  });
});


$("#chatBar").keyup(function(event) {
    if (event.keyCode === 13) {
      sendMessage();
    }
});

$( "#sendBtn" ).click(function() {
  sendMessage();
});

$(".fa-paperclip").click(function() {
   var input = $(document.createElement("input"));
   input.attr("type", "file");
   input.trigger("click");
   $(input).on('change', function () {
       var fr = new FileReader();
       fr.readAsDataURL($(input).prop('files')[0]);
       fr.onload = () => {
         socket.emit('newMessage', {
           id: socket.id,
           body: {
             name: $(input).prop('files')[0].name,
             data: fr.result,
             type: $(input).prop('files')[0].type,
           },
           username,
         });
       };
  });
   return false;
});
