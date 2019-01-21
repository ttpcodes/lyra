var map = document.getElementById("map");
var playlist = document.getElementById("playlist");
var node = document.getElementById("node");
var mapbutton = document.getElementById("mapbutton");
var playlistbutton = document.getElementById("playlistbutton");
var nodebutton = document.getElementById("nodebutton");
var tabsopen = [];
var one;
var two;
var three;

var accordians = document.getElementsByClassName("accordian");
for (i = 0; i < 3; i++){
    accordians[i].onclick = function(){
        if( this.nextElementSibling.id == "map"){
            
            if(checkrepeats(tabsopen, 1)>=0)
            {
                tabsopen.splice(checkrepeats(tabsopen, 1), 1);
            }
            else{
                tabsopen.push(1);
            }
        }
        if( this.nextElementSibling.id == "node"){
            if(checkrepeats(tabsopen, 3)>=0)
            {
                tabsopen.splice(checkrepeats(tabsopen, 3), 1);
            }
            else{
                tabsopen.push(3);
            }
        }
        if( this.nextElementSibling.id == "playlist"){
            if(checkrepeats(tabsopen, 2)>=0)
            {
                tabsopen.splice(checkrepeats(tabsopen, 2), 1);
            }
            else{
                tabsopen.push(2);
            }
        }
        if(tabsopen.length > 2){
            tabsopen.splice(0, 1);
        }
        openthegates(tabsopen);    
    }
}

function openthegates(array){
    one = 0;
    two = 0;
    three = 0;
    for(var i =0; i< array.length; i++){
        if (array[i] == 1){
            map.style.maxHeight= map.scrollHeight +"px";
            one = 1;
        }
        if (array[i] == 2){
            playlist.style.maxHeight= playlist.scrollHeight +"px";  
            two = 1; 
        }
        if (array[i] == 3){
            node.style.maxHeight= node.scrollHeight +"px";   
            three = 1;
        }
    }
    if( one==0){
        map.style.maxHeight =0;
    }
    if( two==0){
        playlist.style.maxHeight =0;
    }
    if( three==0){
        node.style.maxHeight =0;
    }
}

function checkrepeats(array, num){
    value = -1;
    for(var i =0; i< array.length;i++){
        if (array[i] == num){
        value = i;
        }
    }
    return value;
}
