const socket = io();

// console.log(ticketAddBtn)
socket.on('message', (message) => {
   // console.log(message);
   // const html = Mustache.render(messageTemplate, { 
   //    message: message
   // });
   // console.log(html);
   const msgs = document.getElementById("messages");
   console.log("FromMessage", message);
   msgs.innerHTML += message;
    // Add the "show" class to DIV
    msgs.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ msgs.className = msgs.className.replace("show", ""); }, 3000);
   // $messages.insertAdjacentHTML('beforeend', html)
   // autoscroll()
})


function loadFile(e)  {
    for(let i=0; i < e.target.files.length; i++){ 
       var urls = URL.createObjectURL(e.target.files[i]);
       console.log("Form urls ",urls);
       document.getElementById("image_preview").innerHTML += '<img src="'+urls+'">';
    }
}

document.querySelectorAll('.table img').forEach(image => {
    image.onclick = () => {
        document.querySelector('.modal').style.display = "block";
        document.querySelector('.modal img').src = image.getAttribute('src')
    }    
})

document.querySelector('.modal span').onclick = () => {
    document.querySelector('.modal').style.display = "none";
}





