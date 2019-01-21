
var state = 0;
var counter = 0;

function playAudio() { 
  bgm.play(); 
} 

var mutebutton = document.getElementById("mutebutton");
$('div i').click(function() {toggleAudio()});

function toggleAudio() { 
  console.log("no u");
  if (bgm.muted){
    bgm.muted = false;
    mutebutton.className = "fas fa-volume-up fa-2x";
  }
  else{
    bgm.muted = true;
    mutebutton.className = "fas fa-volume-mute fa-2x";
  }
}

$('.navbar-nav>li>a').on('click', function(){
  $('.navbar-collapse').collapse('hide');
});

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
  if (str === "Login"){
    console.log("clickedonabout");
    state = 3;
    updatescreen();
    return;
  }
  if (str === "Signup"){
    console.log("clickedonabout");
    state = 4;
    updatescreen();
    return;
  }
  
});

function updatescreen(){
  var hometextdiv = document.getElementById("hometextdiv");
  var abouttextdiv = document.getElementById("abouttextdiv");
  var logintextdiv = document.getElementById("logintextdiv");
  var registertextdiv = document.getElementById("registertextdiv");
  var login = document.getElementById("login");
  var home = document.getElementById("home");
  var about = document.getElementById("about");
  var register = document.getElementById("register");
  hometextdiv.className = "props";
  abouttextdiv.className = "propstwo";
  logintextdiv.className = "propsthree";
  registertextdiv.className = "propsthree";
  home.classList.remove("active");
  about.classList.remove("active");
  login.classList.remove("active");
  register.classList.remove("active");

  if (state==1){
    hometextdiv.className = "animated fadeInDown slower props appear";
    home.classList.add("active");
  } 
  if (state ==2){ 
    abouttextdiv.className = "animated fadeInDown slower propstwo appear";
    about.classList.add("active");
  }
  if (state ==3){ 
    logintextdiv.className = "animated fadeInDown slower propsthree appear";
    login.classList.add("active");
  }
  if (state ==4){
    registertextdiv.className = "animated fadeInDown slower propsthree appear";
    register.classList.add("active");
  }
}