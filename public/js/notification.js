const socket = io();

// const $messages = document.querySelector('#messages');
//Templates
// const messageTemplate = document.querySelector('#message-template').innerHTML;

socket.on('message', (message) => {
   // console.log(message);
   // const html = Mustache.render(messageTemplate, { 
   //    message: message
   // });
   // console.log(html);
   console.log("FromMessage", message);
   document.getElementById("messages").innerHTML += message;
   // $messages.insertAdjacentHTML('beforeend', html)
   // autoscroll()
})