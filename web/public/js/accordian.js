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
            if (tabsopen.indexOf(1)>=0){
                console.log(tabsopen)
                tabsopen.splice(tabsopen.indexOf(1),1);
            }
            else{
                tabsopen.push(1);
            }
        }
        if( this.nextElementSibling.id == "node"){
            if (tabsopen.indexOf(3)>=0){
                tabsopen.splice(tabsopen.indexOf(3),1);
            }
            else{
                tabsopen.push(3);
            }
        }
        if( this.nextElementSibling.id == "playlist"){
            if (tabsopen.indexOf(2)>=0){
                tabsopen.splice(tabsopen.indexOf(2),1);
            }
            else{
                tabsopen.push(2);
            }
            
        }
        console.log(tabsopen);
        openthegates(tabsopen);    
    }
}

function openthegates(array){
    one = 0;
    two = 0;
    three = 0;
    
        for(var i =0; i< array.length; i++){
            if (array.length == 1){
                if (array[i] == 1){
                    map.style.maxHeight= map.scrollHeight +"px";
                    one = 1;
                }
                if (array[i] == 2){
                    if (playlist.scrollheight < 630){
                        playlist.style.maxHeight= playlist.scrollHeight +"px"; 
                    }
                    else {
                        playlist.style.maxHeight = 630 + "px";
                    }
                    two = 1;
                }
                if (array[i] == 3){
                    if (node.scrollheight < 630){
                        node.style.maxHeight= node.scrollHeight +"px"; 
                    }
                    else {
                        node.style.maxHeight = 630 + "px";
                    }
                    three = 1;
                }
            }
            if (array.length == 2){
                if (array[i] == 1){
                    map.style.maxHeight= map.scrollHeight +"px";
                    one = 1;
                }
                if (array[i] == 2){
                    if (playlist.scrollheight < 315){
                        playlist.style.maxHeight= playlist.scrollHeight +"px"; 
                    }
                    else {
                        playlist.style.maxHeight = 315 + "px";
                    }
                    two = 1;
                }
                if (array[i] == 3){
                    if (node.scrollheight < 315){
                        node.style.maxHeight= node.scrollHeight +"px"; 
                    }
                    else {
                        node.style.maxHeight = 315 + "px";
                    }
                    three = 1;
                }
            }
            if (array.length == 3){
                if (array[i] == 1){
                    map.style.maxHeight= map.scrollHeight +"px";
                    one = 1;
                }
                if (array[i] == 2){
                    if (playlist.scrollheight < 175){
                        playlist.style.maxHeight= playlist.scrollHeight +"px"; 
                    }
                    else {
                        playlist.style.maxHeight = 175 + "px";
                    }
                    two = 1;
                }
                if (array[i] == 3){
                    if (node.scrollheight < 175){
                        node.style.maxHeight= node.scrollHeight +"px"; 
                    }
                    else {
                        node.style.maxHeight = 175 + "px";
                    }
                    three = 1;
                }
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

