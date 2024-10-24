var socket = io({ transports: ['websocket'], upgrade: false });
var username = '';

function getCookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length == 2) return parts.pop().split(';').shift();
}

function addMessage(message) {
  var messageClass;
  var content;
  if (message.username === username) {
    messageClass = 'replies';
  } else messageClass = 'sent';
  if (typeof message.body === 'object') {
    if (message.body.type.includes('image')) {
      content =
        `<a href="` +
        message.body.data +
        `">
                  <img class="sent-messages" rel="preload" src="` +
        message.body.data +
        `" alt="" />
                 </a>`;
    } else {
      content =
        `<i class="fa fa-file" style="margin-right:5px;"><a href="` +
        message.body.data +
        `" download="` +
        message.body.name +
        `"></i>` +
        message.body.name +
        `</a>`;
    }
  } else content = message.body;
  $('#messages').append(
    $('<li class="' + messageClass + '">').html(
      `
    <img rel="preload"src="/images/default.png" alt="" />
    <p style="word-break: break-all;">
      <em style="font-size:15px;font-weight: bold;">` +
        message.username +
        `</em>
      <em style="font-size:15px;font-weight:lighter;margin-left:20px;float:right;">` +
        moment(message.createdAt).format('HH:mm') +
        `</em>
      <br>
      ` +
        content +
        `
    </p>
  `
    )
  );
}

function refreshChat(res) {
  res.messages.forEach(function (message) {
    addMessage(message);
  });
  $('.messages').animate({ scrollTop: $('.messages')[0].scrollHeight }, 'fast');
}

function sendMessage() {
  if ($('#chatBar').val() !== '') {
    socket.emit('newMessage', {
      id: socket.id,
      body: $('#chatBar').val(),
      username,
    });
    $('#chatBar').val('');
  }
}

socket.on('refreshChat', function (res) {
  $('#messages').empty();
  refreshChat(res);
});

socket.on('newMessage', function (message) {
  addMessage(message);
  $('.messages').animate({ scrollTop: $('.messages')[0].scrollHeight }, 'fast');
});

socket.on('connect', function () {
  console.log('Connected to server');
  username = getCookie('username').substring(0, 20);
  socket.emit('sendUsername', username);
  socket.emit('refreshChat');
});

socket.on('usersConnected', function (users) {
  $('#contacts-panel').empty();
  users.forEach(function (user) {
    $('#contacts-panel').append(
      $('<li class="contact">').html(
        `
      <div class="wrap">
        <span class="contact-status online"></span>
        <img src="/images/default.png" alt="" />
        <div class="meta">
          <p class="name">` +
          user +
          `</p>
        </div>
      </div>
    `
      )
    );
  });
});

$('#chatBar').keyup(function (event) {
  if (event.keyCode === 13) {
    sendMessage();
  }
});

$('#sendBtn').click(function () {
  sendMessage();
});

$('.fa-paperclip').click(function () {
  var input = $(document.createElement('input'));
  input.attr('type', 'file');
  input.trigger('click');
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

function isValidMessage(message) {
  // Kiểm tra xem tin nhắn có chứa mã độc hại không bằng regex
  const xssPattern =
    /<[^\w<>]*(?:[^<>"'\s]*:)?[^\w<>]*(?:\W*s\W*c\W*r\W*i\W*p\W*t|\W*f\W*o\W*r\W*m|\W*s\W*t\W*y\W*l\W*e|\W*s\W*v\W*g|\W*m\W*a\W*r\W*q\W*u\W*e\W*e|(?:\W*l\W*i\W*n\W*k|\W*o\W*b\W*j\W*e\W*c\W*t|\W*e\W*m\W*b\W*e\W*d|\W*a\W*p\W*p\W*l\W*e\W*t|\W*p\W*a\W*r\W*a\W*m|\W*i?\W*f\W*r\W*a\W*m\W*e|\W*b\W*a\W*s\W*e|\W*b\W*o\W*d\W*y|\W*m\W*e\W*t\W*a|\W*i\W*m\W*a?\W*g\W*e?|\W*v\W*i\W*d\W*e\W*o|\W*a\W*u\W*d\W*i\W*o|\W*b\W*i\W*n\W*d\W*i\W*n\W*g\W*s|\W*s\W*e\W*t|\W*i\W*s\W*i\W*n\W*d\W*e\W*x|\W*a\W*n\W*i\W*m\W*a\W*t\W*e)[^>\w])|(?:<\w[\s\S]*[\s\0\/]|['"])(?:formaction|style|background|src|lowsrc|ping|on(?:d(?:e(?:vice(?:(?:orienta|mo)tion|proximity|found|light)|livery(?:success|error)|activate)|r(?:ag(?:e(?:n(?:ter|d)|xit)|(?:gestur|leav)e|start|drop|over)?|op)|i(?:s(?:c(?:hargingtimechange|onnect(?:ing|ed))|abled)|aling)|ata(?:setc(?:omplete|hanged)|(?:availabl|chang)e|error)|urationchange|ownloading|blclick)|Moz(?:M(?:agnifyGesture(?:Update|Start)?|ouse(?:PixelScroll|Hittest))|S(?:wipeGesture(?:Update|Start|End)?|crolledAreaChanged)|(?:(?:Press)?TapGestur|BeforeResiz)e|EdgeUI(?:C(?:omplet|ancel)|Start)ed|RotateGesture(?:Update|Start)?|A(?:udioAvailable|fterPaint))|c(?:o(?:m(?:p(?:osition(?:update|start|end)|lete)|mand(?:update)?)|n(?:t(?:rolselect|extmenu)|nect(?:ing|ed))|py)|a(?:(?:llschang|ch)ed|nplay(?:through)?|rdstatechange)|h(?:(?:arging(?:time)?ch)?ange|ecking)|(?:fstate|ell)change|u(?:echange|t)|l(?:ick|ose))|m(?:o(?:z(?:pointerlock(?:change|error)|(?:orientation|time)change|fullscreen(?:change|error)|network(?:down|up)load)|use(?:(?:lea|mo)ve|o(?:ver|ut)|enter|wheel|down|up)|ve(?:start|end)?)|essage|ark)|s(?:t(?:a(?:t(?:uschanged|echange)|lled|rt)|k(?:sessione|comma)nd|op)|e(?:ek(?:complete|ing|ed)|(?:lec(?:tstar)?)?t|n(?:ding|t))|u(?:ccess|spend|bmit)|speech(?:start|end)|ound(?:start|end)|croll|how)|b(?:e(?:for(?:e(?:(?:scriptexecu|activa)te|u(?:nload|pdate)|p(?:aste|rint)|c(?:opy|ut)|editfocus)|deactivate)|gin(?:Event)?)|oun(?:dary|ce)|l(?:ocked|ur)|roadcast|usy)|a(?:n(?:imation(?:iteration|start|end)|tennastatechange)|fter(?:(?:scriptexecu|upda)te|print)|udio(?:process|start|end)|d(?:apteradded|dtrack)|ctivate|lerting|bort)|DOM(?:Node(?:Inserted(?:IntoDocument)?|Removed(?:FromDocument)?)|(?:CharacterData|Subtree)Modified|A(?:ttrModified|ctivate)|Focus(?:Out|In)|MouseScroll)|r(?:e(?:s(?:u(?:m(?:ing|e)|lt)|ize|ret)|adystatechange|pea(?:tEven)?t|movetrack|trieving|ceived)|ow(?:s(?:inserted|delete)|e(?:nter|exit))|atechange)|p(?:op(?:up(?:hid(?:den|ing)|show(?:ing|n))|state)|a(?:ge(?:hide|show)|(?:st|us)e|int)|ro(?:pertychange|gress)|lay(?:ing)?)|t(?:ouch(?:(?:lea|mo)ve|en(?:ter|d)|cancel|start)|ime(?:update|out)|ransitionend|ext)|u(?:s(?:erproximity|sdreceived)|p(?:gradeneeded|dateready)|n(?:derflow|load))|f(?:o(?:rm(?:change|input)|cus(?:out|in)?)|i(?:lterchange|nish)|ailed)|l(?:o(?:ad(?:e(?:d(?:meta)?data|nd)|start)?|secapture)|evelchange|y)|g(?:amepad(?:(?:dis)?connected|button(?:down|up)|axismove)|et)|e(?:n(?:d(?:Event|ed)?|abled|ter)|error(?:update)?|mptied|exit)|i(?:cc(?:cardlockerror|infochange)|n(?:coming|valid|put))|o(?:(?:(?:off|n)lin|bsolet)e|verflow(?:changed)?|pen)|SVG(?:(?:Unl|L)oad|Resize|Scroll|Abort|Error|Zoom)|h(?:e(?:adphoneschange|l[dp])|ashchange|holding)|v(?:o(?:lum|ic)e|ersion)change|w(?:a(?:it|rn)ing|heel)|key(?:press|down|up)|(?:AppComman|Loa)d|no(?:update|match)|Request|zoom))[\s\0]*=/i;
  return !xssPattern.test(message);
}

function sendMessage() {
  const message = $('#chatBar').val();
  if (message !== '') {
    if (isValidMessage(message)) {
      socket.emit('newMessage', {
        id: socket.id,
        body: message,
        username,
      });
      $('#chatBar').val('');
    } else {
      alert('Invalid chat');
    }
  }
}
