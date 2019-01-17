
var state = 0;
var counter = 0;

function playAudio() { 
  bgm.play(); 
} 

function pauseAudio() { 
  bgm.pause(); 
}

onkeypress = function(){
  if (counter == 0){ 
    var bgm = document.getElementById("bgm"); 
    bgm.play();
    console.log("hi!");
    var background = document.getElementById("background");
    background.classList.add("picture-flicker");
    var covertext = document.getElementById("cover_text");
    covertext.classList.remove("flicker");
    var fadeout = document.getElementById("textfadeout")
    fadeout.classList.add("fadeout");
    var blackscreen =document.getElementById("blackscreen");
    blackscreen.classList.add("fadein");
    var navbardiv = document.getElementById("abc");
    navbardiv.classList.add("navappear");
    var hometextdiv = document.getElementById("hometextdiv");
    hometextdiv.className= "appear animated fadeInDown delay-3s slower props";
    counter+=1;
  }
    //call a function     
       //element.classList.add("run-animation");
}

$('#navbar li a').click(function() {
  const str = $(this).text();
  console.log(str);
  if (str === "Home"){
    console.log("clickedonhome");
    state = 1;
    updatescreen();
    return;
  }
  if (str === "About"){
    console.log("clickedonabout");
    state = 2;
    updatescreen();
    return;
  }
  
});

function updatescreen(){
  if (state==1){
    var hometextdiv = document.getElementById("hometextdiv");
    hometextdiv.className = "props";
    hometextdiv.className = "animated fadeInDown slower props appear";
    var abouttextdiv = document.getElementById("abouttextdiv");
    abouttextdiv.className = "propstwo"
  } 
  if (state ==2){
    var hometextdiv = document.getElementById("hometextdiv");
    hometextdiv.className = "props";
    var abouttextdiv = document.getElementById("abouttextdiv");
    abouttextdiv.className = "propstwo";
    abouttextdiv.className = "animated fadeInDown slower propstwo appear";
  }
}