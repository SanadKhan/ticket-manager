function loadFile(e)  {
    for(let i=0; i < e.target.files.length; i++){ 
       var urls = URL.createObjectURL(e.target.files[i])
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