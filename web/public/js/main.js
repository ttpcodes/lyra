// initialize stuff
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, (window.innerWidth) / window.innerHeight, 0.1, 30 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( (window.innerWidth) * 1, window.innerHeight*1 );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.soft = true;
document.getElementById( 'game' ).appendChild( renderer.domElement );
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
var tag = document.createElement('script');
tag.id = 'iframe-demo';
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('existing-iframe-example', {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onStateChange,
        }
    });
}
var clock = new THREE.Clock();
var moving = false;
var need_play = false;
var curr_node = 4;
var first_moved = false;

var ready = false;
var loaded = false;
var socket_connected = false;

var old_x = 0;
var old_y = 0;
var other_players = {};
var my_username = "None";

var other_players = [];
var current_playlist;
var video_time;
var video_name;
var video_id = "None";
var current_time;
var my_playlist = [];
var node_meshes = [];
var node_ring_meshes = [];
var keys = {
    "left": false,
    "right": false,
    "up": false,
    "down": false
}

var socket = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.hostname + '/ws/game')
socket.addEventListener('open', function (event) {
    socket_connected = true;
    $.get("/players/me", function( data ) {
        var msg = JSON.parse(data)
        console.log(msg)
        my_playlist = msg["Medias"]
        if(my_playlist == null) {
            my_playlist = [];
        }
        my_username = msg["Username"];
        refreshMyPlaylist();
    });

});
socket.addEventListener('close', () => {})
socket.addEventListener('error', () => {})
socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if(message["Command"] == "nodeUpdate") {
        console.log("nodeupdate");
        console.log(message["Node"])

        if(message["Node"]["ID"] != 4) {
            if(message["Node"]["Playlist"].length > 0) {
                node_meshes[message["Node"]["ID"]].material.color.setHex( 0xe74c3c );
            }
            else {
                node_meshes[message["Node"]["ID"]].material.color.setHex( 0x9ff7d5 );
            }
        }

        if(message["Node"]["ID"] == curr_node) {
            console.log(current_playlist);
            var new_vid = message["Node"]["ID"] != current_playlist[0]["ID"] || Math.abs(message["Node"]["CurrentTime"] - current_time) > 5;
            current_playlist = message["Node"]["Playlist"]
            current_time = message["Node"]["CurrentTime"]
            if(current_playlist.length == 0) {
                video_id = "None";
            }
            else if(new_vid) {
                console.log("it's a different song");
                video_id = current_playlist[0]["ID"];
                video_time = current_playlist[0]["Length"];
                video_name = current_playlist[0]["Title"];
                if(ready && video_id != "None") {
                    beginNewSong();
                    player.playVideo();
                }
            }
            else {
                player.playVideo();
            }
            refreshNodePlaylist();
        }
    }
    else if(message["Command"] == "playlist") {
        my_playlist = message["Medias"];
        refreshMyPlaylist();
    }
    else if(message["Command"] == "movePos") {
        // console.log(message);
        if(my_username != "None" && message["User"]["Username"] != my_username) {
            if(!(message["User"]["Username"] in other_players)) {
                var player_geometry_other = new THREE.DodecahedronGeometry(0.2);
                var player_material_other = new THREE.MeshBasicMaterial( { color: 0x9b59b6 } );
                var player_mesh_other = new THREE.Mesh(player_geometry_other, player_material_other);
                player_mesh_other.position.x = message["X"]
                player_mesh_other.position.y = message["Y"]
                player_mesh_other.position.z = 0.5
                player_mesh_other.castShadow = true;
                scene.add(player_mesh_other)
                other_players[message["User"]["Username"]] = player_mesh_other;
            }
            else {
                other_players[message["User"]["Username"]].position.x = message["X"]
                other_players[message["User"]["Username"]].position.y = message["Y"]
            }
        }
    }
    else if(message["Command"] == "leave") {
        console.log(message);
        if(my_username != "None" && message["User"]["Username"] != my_username) {
            if((message["User"]["Username"] in other_players)) {
                scene.remove(other_players[message["User"]["Username"]]);
                delete other_players[message["User"]["Username"]];
            }
        }
    }
    else if(message["Command"] == "nodeDone") {
        node_meshes[message["Node"]["ID"]].material.color.setHex( 0x9ff7d5 );
    }
})


function nothing() {}
function doneMoving() {
    moving = false;
}

console.log("?");

// animation engine
var animations = []
function Animation(anim_type, mesh, time, param, subparam, target, callback){
    this.anim_type = anim_type;
    this.mesh = mesh;
    this.time = time;
    this.param = param
    this.subparam = subparam
    this.current_time = 0;
    this.target = target;
    this.old_value = mesh[param][subparam];
    this.callback = callback;
}

// setup camera
var camera_rotation = -Math.PI/2;
camera.position.z = 5;
camera.position.y = -2;
camera.position.x = -0.5;
camera.rotation.x = degToRad(40)

var am_light = new THREE.AmbientLight(0xAAAAAA, 1); // soft white light
scene.add(am_light);

// main light
// var light = new THREE.DirectionalLight( 0xffffff, 0.2, 5000 );
// light.position.set(2, 2, 10); 			//default; light shining from top
// light.castShadow = true;            // default false
// light.shadow.mapSize.width = 2048;  // default
// light.shadow.mapSize.height = 2048; // default
// light.shadow.camera.near = 2;
// light.shadow.camera.far = 15;
// light.shadow.camera.left = -20;
// light.shadow.camera.right = 20;
// light.shadow.camera.top = 20;
// light.shadow.camera.bottom = -20;
// light.shadow.bias = 0.0001;
// scene.add(light);

var spin = 0;
var light = new THREE.PointLight( 0xf83bff, 0.9, 5000 );
// light.position.set(2, 2, 10); 			//default; light shining from top
light.castShadow = true;            // default false
light.shadow.mapSize.width = 2048;  // default
light.shadow.mapSize.height = 2048; // default
light.shadow.camera.near = 2;
light.shadow.camera.far = 15;
light.shadow.camera.left = -20;
light.shadow.camera.right = 20;
light.shadow.camera.top = 20;
light.shadow.camera.bottom = -20;
light.shadow.bias = 0.0001;
// scene.add(light);

var light2 = new THREE.PointLight( 0x3bdcff, 0.9, 5000 );
// light.position.set(2, 2, 10); 			//default; light shining from top
light2.castShadow = true;            // default false
light2.shadow.mapSize.width = 2048;  // default
light2.shadow.mapSize.height = 2048; // default
light2.shadow.camera.near = 2;
light2.shadow.camera.far = 15;
light2.shadow.camera.left = -20;
light2.shadow.camera.right = 20;
light2.shadow.camera.top = 20;
light2.shadow.camera.bottom = -20;
light2.shadow.bias = 0.0001;
// scene.add(light2);

var light3 = new THREE.PointLight( 0x2ecc71, 0.3, 5000 );
// light.position.set(2, 2, 10); 			//default; light shining from top
light3.castShadow = true;            // default false
light3.shadow.mapSize.width = 2048;  // default
light3.shadow.mapSize.height = 2048; // default
light3.shadow.camera.near = 2;
light3.shadow.camera.far = 15;
light3.shadow.camera.left = -20;
light3.shadow.camera.right = 20;
light3.shadow.camera.top = 20;
light3.shadow.camera.bottom = -20;
light3.shadow.bias = 0.0001;
// scene.add(light3);

var lightz = new THREE.HemisphereLight( 0x272056, 0xbf5cbe, 0.2 );
// scene.add( lightz );

// light = new THREE.DirectionalLight( 0xff0000, 0.9, 5000 );
// light.position.set(-10, 2, 10); 			//default; light shining from top
// light.castShadow = true;            // default false
// light.shadow.mapSize.width = 2048;  // default
// light.shadow.mapSize.height = 2048; // default
// light.shadow.camera.near = 2;
// light.shadow.camera.far = 15;
// light.shadow.camera.left = -20;
// light.shadow.camera.right = 20;
// light.shadow.camera.top = 20;
// light.shadow.camera.bottom = -20;
// light.shadow.bias = 0.0001;
// scene.add(light);

function light_off() {
    scene.remove(light)
    scene.remove(light2)
    scene.add(am_light)
}

function light_on() {
    scene.add(light)
    scene.add(light2)
    scene.remove(am_light)
}

// build the floor
var floor_geometry = new THREE.PlaneGeometry(230, 230);
var floor_material = new THREE.MeshToonMaterial( { color: 0x333333 } );
var floor_mesh = new THREE.Mesh(floor_geometry, floor_material);
floor_mesh.position.x = 7.5
floor_mesh.position.y = 7.5
floor_mesh.receiveShadow = true;
scene.add(floor_mesh)

// build the player
var player_geometry = new THREE.DodecahedronGeometry(0.2);
var player_material = new THREE.MeshToonMaterial( { color: 0xe6b0c2 } );
var player_mesh = new THREE.Mesh(player_geometry, player_material);
player_mesh.position.x = 1.5
player_mesh.position.y = 1.5
player_mesh.position.z = 0.5
player_mesh.castShadow = true;
scene.add(player_mesh)

var nodes = [];
nodes.push([0,0]);
nodes.push([3,1]);
nodes.push([1,5]);
nodes.push([4,6]);
nodes.push([6,8]);
nodes.push([5,0]);//5
nodes.push([8,6]);
nodes.push([6,13]);
nodes.push([8,11]);
nodes.push([7,16]);
nodes.push([3,15]); //10
nodes.push([8,17]);
nodes.push([12,14]);
nodes.push([11,9]); //other
nodes.push([8,3]);
nodes.push([11,5]); //15
nodes.push([11,1]);
nodes.push([12,3]);

var connections = [];
connections.push([0,1]);
connections.push([0,2]);
connections.push([1,3]);
connections.push([2,3]);
connections.push([3,4]);
connections.push([1,5]);
connections.push([4,6]);
connections.push([4,7]);
connections.push([6,8]);
connections.push([7,8]);
connections.push([7,9]);
connections.push([9,10]);
connections.push([9,11]);
connections.push([9,12]);
connections.push([12,13]);
connections.push([8,13]);
connections.push([6,13]);
connections.push([6,14]);
connections.push([14,15]);
connections.push([15,16]);
connections.push([16,17]);
connections.push([15,17]);
connections.push([14,16]);

var scaling = 3;
player_mesh.position.x = nodes[4][0]*scaling + 1.5;
player_mesh.position.y = nodes[4][1]*scaling + 1.5;
camera.position.x = nodes[4][0]*scaling + 1.5;
camera.position.y = nodes[4][1]*scaling + 1.5 - 3.5;

function Path(direction, other) {
    this.direction = direction;
    this.other = other;
}
var paths = [];

var canvas = document.getElementById('mycanvas');
var context = canvas.getContext('2d');

function redrawCanvas() {
    context.clearRect(0, 0, 300, 270);
    for(var i = 0; i < connections.length; i++) {
        var first = nodes[connections[i][0]];
        var second = nodes[connections[i][1]];
        context.lineWidth = 5;
        context.strokeStyle = 'gray';
        context.beginPath();
        context.moveTo(50 + first[0]*15, 250 - first[1]*14);
        context.lineTo(50 + second[0]*15, 250 - second[1]*14);
        context.stroke();
    }
    for(var i = 0; i < nodes.length; i++) {
        if(node_meshes.length > 0 && node_meshes[i].material.color.equals(new THREE.Color( 0xe74c3c ))) {
            context.fillStyle = 'red';
            context.strokeStyle = 'red';
        }
        else {
            context.fillStyle = 'gray';
            context.strokeStyle = 'gray';
        }
        context.beginPath();
        context.arc(50 + nodes[i][0]*15, 250 - nodes[i][1]*14, 2, 0, 2 * Math.PI, false);

        context.fill();
        context.lineWidth = 5;

        context.stroke();
    }
    for (var key in other_players) {
        context.beginPath();
        context.arc(50 + ((other_players[key].position.x-1.5)/3)*15, 255 - ((other_players[key].position.y-1.5)/3)*15, 2, 0, 2 * Math.PI, false);
        context.fillStyle = 'purple';
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = 'purple';
        context.stroke();
    }
    context.beginPath();
    context.arc(50 + ((player_mesh.position.x-1.5)/3)*15, 255 - ((player_mesh.position.y-1.5)/3)*15, 2, 0, 2 * Math.PI, false);
    context.fillStyle = 'blue';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = 'blue';
    context.stroke();

}
redrawCanvas();

// nodes
for(var i = 0; i < nodes.length; i++) {
    var x = nodes[i][0];
    var y = nodes[i][1];
    paths.push([]);



    // var node_geometry = new THREE.RingGeometry(0.5, 0.5, 32 )
    // var node_material = new THREE.MeshToonMaterial( { color: 0xc5ffff, side: THREE.DoubleSide } );
    // var node = new THREE.Mesh(node_geometry, node_material );

    var node_geometry = new THREE.RingGeometry( 0.4, 0.5, 32 );
    var node_material = new THREE.MeshToonMaterial( { color: 0xc5ffff, side: THREE.DoubleSide } );
    var node = new THREE.Mesh( node_geometry, node_material );

    node.position.x = x*scaling + 1.5;
    node.position.y = y*scaling + 1.5;
    node.position.z = 0.025;
    node.rotation.x = 0;
    scene.add(node);
    node_ring_meshes.push(node);

    var node_small_geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32 )
    var node_small_material = new THREE.MeshToonMaterial( { color: 0x9ff7d5 } );
    if(i == 4) {
        node_small_material = new THREE.MeshToonMaterial( { color: 0x434444 } );
    }
    var node_small = new THREE.Mesh(node_small_geometry, node_small_material );
    node_small.position.x = x*scaling + 1.5;
    node_small.position.y = y*scaling + 1.5;
    node_small.position.z = 0.03;
    node_small.rotation.x = Math.PI/2;
    node_small.castShadow = true; //default is false
    node_small.receiveShadow = true;
    scene.add(node_small);
    node_meshes.push(node_small);

    var node_radius_geometry = new THREE.RingGeometry(0, 1, 32 )
    var node_radius_material = new THREE.MeshToonMaterial( { color: 0x444343 } );
    var node_radius = new THREE.Mesh(node_radius_geometry, node_radius_material );
    node_radius.position.x = x*scaling + 1.5;
    node_radius.position.y = y*scaling + 1.5;
    node_radius.position.z = 0.001;
    scene.add(node_radius);
}

var connection_locs = [];

// connections
for(var i = 0; i < connections.length; i++) {
    var first = nodes[connections[i][0]];
    var second = nodes[connections[i][1]];
    var first_x = first[0]*scaling + 1.5;
    var first_y = first[1]*scaling + 1.5;
    var second_x = second[0]*scaling + 1.5;
    var second_y = second[1]*scaling + 1.5;

    var length = Math.sqrt(Math.pow(first_x - second_x, 2) + Math.pow(first_y - second_y, 2))
    var node_geometry = new THREE.BoxGeometry(0.25, length, 0.025, 32 )
    var node_material = new THREE.MeshToonMaterial( { color: 0xaddcb9 } );
    var node = new THREE.Mesh(node_geometry, node_material );
    node.position.x = (first_x + second_x)/2;
    node.position.y = (first_y + second_y)/2;
    node.position.z = 0.0125;
    node.rotation.z = Math.atan2(second_y - first_y, second_x - first_x) + Math.PI/2;
    paths[connections[i][0]].push(new Path(node.rotation.z % (Math.PI*2), connections[i][1]));
    paths[connections[i][1]].push(new Path((node.rotation.z + Math.PI) % (Math.PI*2), connections[i][0]));
    node.castShadow = true; //default is false
    node.receiveShadow = true;
    var deltax = (second_x - first_x) * 0.1;
    var deltay = (second_y - first_y) * 0.1;
    for(var x = 0; x < 10; x++) {
        connection_locs.push([first_x + deltax*x, first_y + deltay*x]);
    }
    scene.add(node);
}

for(var k = 0; k < connection_locs.length; k++) {
    // var building_geometry = new THREE.BoxGeometry(1, 1, 1);
    // var building_material = new THREE.MeshPhongMaterial( { color: 0x50c44a } );
    // var building = new THREE.Mesh(building_geometry, building_material );
    // building.position.x = connection_locs[k][0];
    // building.position.y = connection_locs[k][1];
    // building.position.z = 0.5;
    // scene.add(building);
}

function makeBuildings() {
    var buildings = []
    var rots = []
    // buildings
    for(var x = -5; x < 40; x++) {
        for(var y = -5; y < 30; y++) {
            var height = 1 + Math.random();
            var colors = [0x5b3568, 0x2d6152, 0x50c44a];
            for(var i = 0; i < 10; i++) {
                colors.push(0x5b3568)
                colors.push(0x5b3568)
                colors.push(0x5b3568)
                colors.push(0x2d6152)
                colors.push(0x50c44a)
            }
            for(var i = 0; i < x; i++) {
                colors.push(0x2d6152)
                colors.push(0x2d6152)
                colors.push(0x2d6152)
            }
            for(var i = 0; i < y; i++) {
                colors.push(0x50c44a)
                colors.push(0x50c44a)
                colors.push(0x50c44a)
            }
            var color = colors[Math.floor(Math.random() * colors.length)];
            var randx1 = 1.2 + (Math.random()-0.5)*0.4;
            var randy1 = 1.2 + (Math.random()-0.5)*0.4;

            if(Math.random() < 0.0) {
            }
            else {
                var building_geometry = new THREE.BoxGeometry(randx1, randy1, height);
                var building_material = new THREE.MeshToonMaterial( { color: color } );
                var building = new THREE.Mesh(building_geometry, building_material );
                building.position.x = x*2 + (Math.random()-0.5)*1;
                building.position.y = y*2 + (Math.random()-0.5)*1;
                building.position.z = height/2;
                building.rotation.z = Math.random()*Math.PI;
                // building.rotation.x = Math.random()*Math.PI
                building.castShadow = true; //default is false

                var ok = true;
                for(var k = 0; k < connection_locs.length; k++) {
                    if(Math.pow(connection_locs[k][0] - building.position.x, 2) + Math.pow(connection_locs[k][1] - building.position.y, 2) < 2) {
                        ok = false;
                    }
                }
                if(ok) {
                    scene.add(building);
                }
            }
        }
    }
}
makeBuildings()


function update() {
	requestAnimationFrame( update );
    redrawCanvas();
	renderer.render( scene, camera );
    if(socket.readyState === socket.OPEN) {
        if(old_x != player_mesh.position.x || old_y != player_mesh.position.y) {
            socket.send(JSON.stringify({"Command": "movePos", "x": player_mesh.position.x, "y": player_mesh.position.y}));
        }
        old_x = player_mesh.position.x;
        old_y = player_mesh.position.y;
    }

    // for(var i = 0; i < buildings.length; i++) {
    //     buildings[i].rotation.x += 0.01*rots[i][0]*rots[i][3];
    //     buildings[i].rotation.y += 0.01*rots[i][1]*rots[i][3];
    //     buildings[i].rotation.z += 0.01*rots[i][2]*rots[i][3];
    // }
    for(var i = 0; i < 18; i++) {
        if(node_meshes[i].material.color.equals(new THREE.Color( 0xe74c3c ))) {
            // console.log(i);
            node_ring_meshes[i].scale.x = node_ring_meshes[i].scale.x + 0.01;
            node_ring_meshes[i].scale.y = node_ring_meshes[i].scale.y + 0.01;
            if(node_ring_meshes[i].scale.x > 2) {
                node_ring_meshes[i].scale.x = 1;
                node_ring_meshes[i].scale.y = 1;
            }
        }
        else {
            node_ring_meshes[i].scale.x = 1;
            node_ring_meshes[i].scale.y = 1;
        }
    }


    for (var i = animations.length - 1; i >= 0; i--) {
        var anim = animations[i];
        anim.current_time += 1;
        // console.log(anim.current_time);
        if(anim.current_time >= anim.time/2) {
            anim.mesh[anim.param][anim.subparam] = anim.target;
            anim.callback();
            animations.splice(i, 1);
        }
        else {
            if(anim.anim_type == "linear") {
                var delta = (anim.target - anim.mesh[anim.param][anim.subparam])/(anim.time - anim.current_time);
                anim.mesh[anim.param][anim.subparam] += delta;
            }
            if(anim.anim_type == "gaussian") {
                var delta = (anim.target - anim.mesh[anim.param][anim.subparam]);
                var sampled_time = (anim.current_time/anim.time)*6 - 3;
                // console.log(sampled_time)
                const dividend = Math.E ** -(sampled_time ** 2 / (2));
                const divisor = Math.sqrt(2 * Math.PI);
                anim.mesh[anim.param][anim.subparam] += delta*(dividend / divisor);
            }
        }
    }
    if(video_id != "None") {
        $("#time").html(timeToString(current_time) + " / " + timeToString(video_time));
        $("#timeslider").val((current_time/video_time) * 1000)
    }
    var dist = 1;
    // light.position.set(player_mesh.position.x + Math.sin(spin)*dist, player_mesh.position.y + Math.cos(spin)*dist, player_mesh.position.z);
    // light2.position.set(player_mesh.position.x + Math.sin(spin + Math.PI*(2/3))*dist, player_mesh.position.y + Math.cos(spin + Math.PI*(2/3))*dist, player_mesh.position.z);
    // light3.position.set(player_mesh.position.x + Math.sin(spin + Math.PI*(4/3))*dist, player_mesh.position.y + Math.cos(spin + Math.PI*(4/3))*dist, player_mesh.position.z);
    // spin += 0.01;
    light2.position.set(player_mesh.position.x + 1, player_mesh.position.y, player_mesh.position.z);
    light.position.set(player_mesh.position.x - 1, player_mesh.position.y, player_mesh.position.z);

    if(keys["left"]) {
        move(Math.PI);
    }
    if(keys["right"]) {
        move(0);
    }
    if(keys["up"]) {
        move(Math.PI/2);
    }
    if(keys["down"]) {
        move(Math.PI * (3/2));
    }

}
update();

function pwd(x) {
    const dividend = Math.E ** -(x ** 2 / (2));
    const divisor = Math.sqrt(2 * Math.PI);
    return dividend/divisor;
}

Mousetrap.bind('left', function() {
    keys["left"] = true;
    moved();
});
Mousetrap.bind('right', function() {
    keys["right"] = true;
    moved();
});
Mousetrap.bind('up', function() {
    keys["up"] = true;
    moved();
});
Mousetrap.bind('down', function() {
    keys["down"] = true;
    moved();
});

Mousetrap.bind('left', function() {
    keys["left"] = false;
    moved();
}, 'keyup');
Mousetrap.bind('right', function() {
    keys["right"] = false;
    moved();
}, 'keyup');
Mousetrap.bind('up', function() {
    keys["up"] = false;
    moved();
}, 'keyup');
Mousetrap.bind('down', function() {
    keys["down"] = false;
    moved();
}, 'keyup');

function moved() {
    if(video_id != "None") {
        player.playVideo();
    }
    else {
        if(!first_moved) {
            first_moved = true;
            player.loadVideoById("g4mHPeMGTJM", 0);
            player.playVideo();
        }
    }
}

function move(direction_input) {
    if(!ready) {
        return;
    }
    if(!moving) {
        player_mesh.position.x += Math.cos(direction_input)*0.05;
        player_mesh.position.y += Math.sin(direction_input)*0.05;
        if(Math.sqrt(Math.pow(nodes[curr_node][0]*scaling + 1.5 - player_mesh.position.x, 2) + Math.pow(nodes[curr_node][1]*scaling + 1.5 - player_mesh.position.y, 2)) >= 1) {
            player_mesh.position.x -= Math.cos(direction_input)*0.05;
            player_mesh.position.y -= Math.sin(direction_input)*0.05;
            direction = Math.atan2(player_mesh.position.y - nodes[curr_node][1]*scaling - 1.5, player_mesh.position.x - nodes[curr_node][0]*scaling - 1.5)
            direction = ((direction % (Math.PI*2)) + (Math.PI*2)) % (Math.PI*2);
            direction = (direction + Math.PI/2) % (Math.PI*2);

            var minimum = -1;
            var path = null;
            for(var i = 0; i < paths[curr_node].length; i++) {
                var min1 = Math.abs(paths[curr_node][i].direction + Math.PI*2 - direction);
                var min2 = Math.abs(paths[curr_node][i].direction - direction);
                var min3 = Math.abs(paths[curr_node][i].direction - Math.PI*2 - direction);
                var true_min = Math.min(min1, Math.min(min2, min3))
                if(minimum == -1 || true_min < minimum) {
                    minimum = true_min;
                    path = paths[curr_node][i];
                }
            }

            if(minimum != -1 && minimum < Math.PI/2) {
                if(!moving) {
                    moving = true;
                    curr_node = path.other;
                    player.unMute()
                    socket.send(JSON.stringify({"Command": "move", "Node" :curr_node}))
                    animations.push(new Animation("gaussian", player_mesh, 40, "position", "x", nodes[path.other][0]*scaling + 1.5, nothing));
                    animations.push(new Animation("gaussian", player_mesh, 40, "position", "y", nodes[path.other][1]*scaling + 1.5, nothing));
                    animations.push(new Animation("gaussian", camera, 80, "position", "x", nodes[path.other][0]*scaling + 1.5, doneMoving));
                    animations.push(new Animation("gaussian", camera, 80, "position", "y", nodes[path.other][1]*scaling + 1.5 - 4.5, doneMoving));
                    updateNodeData(true)
                }
            }
        }
    }
}

// PLACEHOLDER SERVER CALLS
function songAtNode() {
    if(curr_node == 4) {
        return {name: "None",
        id: "None",
        time: 10000}
    }
    return {name: "Silence",
    // id: "g4mHPeMGTJM",
    id: "OCmmr0hCvWU",
    time: 514}
}
function timeAtNode() {
    return 150;
}
function timeToString(time) {
    return Math.floor(time/60) + ":" + Math.floor(time%60);
}
function nodePlaylist() {
    return [
        {name: "【東方ボーカル】 「301」 【凋叶棕】【Subbed】",
        id: "lg0p-XQByog",
        time: 380},
        {name: "【東方ボーカル】 「星を廻せ月より速く」 【TUMENECO】",
        id: "vkFpo4ExHYc",
        time: 316}
    ];
}
function myPlaylist() {
    return [
        {name: "September-san",
        id: "wUSrmIkR-EE",
        time: 380}
    ];
}

// make this async
function updateNodeData(force_update) {
    current_playlist = []
    $.get("/nodes/"+curr_node, function( data ) {
        var msg = JSON.parse(data)
        current_playlist = msg["Playlist"]
        current_time = msg["CurrentTime"]
        if(current_playlist.length == 0) {
            video_id = "None";
            player.pauseVideo();
            $("#nowplaying").html("");
        }
        else if(force_update || video_id != current_playlist[0]["ID"]){
            video_id = current_playlist[0]["ID"];
            video_time = current_playlist[0]["Length"];
            video_name = current_playlist[0]["Title"];
            if(ready && video_id != "None") {
                beginNewSong();
            }
            else {
                player.pauseVideo();
                $("#nowplaying").html("");
            }
        }
        refreshNodePlaylist();
    });
}


function onPlayerReady(event) {
    console.log("ready");
    ready = true;
    updateNodeData(false);
    $("#loading").css('display', 'none')
    for(var i = 0; i < 18; i++) {
        $.get("/nodes/"+i, function( data ) {
            var msg = JSON.parse(data)
            current_playlist = msg["Playlist"]
            if(msg["ID"] != 4) {
                if(msg["Playlist"].length > 0) {
                    node_meshes[msg["ID"]].material.color.setHex( 0xe74c3c );
                }
                else {
                    node_meshes[msg["ID"]].material.color.setHex( 0x9ff7d5 );
                }
            }
        });
    }
}

function onStateChange(event) {
    console.log(event.data);
    if(event.data == 1) {
        $("#nowplaying").html(video_name);
        var time = player.getDuration();
        video_time = time;
        $("#time").html(timeToString(current_time) + " / " + timeToString(video_time));
        $("#timeslider").val((current_time/video_time) * 1000)
    }
    if(event.data == -1) {
        player.playVideo();
    }
}

setInterval(function(){
    current_time += 1;
    if(ready && video_id != "None") {
        if(current_time > video_time) {
            console.log(current_playlist.length);
            for(var i = 0; i < current_playlist.length; i++) {
                console.log(current_playlist[i]);
            }
            current_time = 0;
            if(current_playlist.length <= 1) {
                video_time = 10000;
                video_id = "None";
                video_name = "None";
                beginNewSong();
            }
            else {
                video_time = current_playlist[1]["Length"];
                video_name = current_playlist[1]["Title"];
                video_id = current_playlist[1]["ID"];
                console.log("transition song");
                console.log(current_playlist[1]);
                beginNewSong();
            }
            current_playlist.shift();
            console.log(current_playlist.length);
            for(var i = 0; i < current_playlist.length; i++) {
                console.log(current_playlist[i]);
            }
            refreshNodePlaylist();
        }
    }
}, 1000);




function beginNewSong() {
    $("#nowplaying").html("Now loading: " + video_name);
    player.loadVideoById(video_id, current_time);
}

function refreshNodePlaylist() {
    if(curr_node == 4) {
        $("#nodetable").html("<tr class = 'nodesongrow'><td class = 'nodesong'>Nothing here! Move to a music node with arrow keys to hear some music.</tr></td>")
    }
    else {
        var new_html = "";
        var playlist = current_playlist;
        for(var i = 0; i < playlist.length; i++) {
            var titlestr = "" + playlist[i]["Title"]
            // new_html += "<tr class = 'songrow'><td class = 'trash'><i onclick='deleteMySong("+i+")' class='fas fa-trash-alt' style = 'position:relative;'></i></td><td class = 'button'><i onclick='queueMySong("+i+") class='fas fa-plus' style = 'position:relative;'></i></td><td class ='song' onclick='queueMySong("+i+")>"+playlist[i]["Title"]+"</td></tr>"
            var new_part = "<tr class = 'nodesongrow'>" +
                "<td class ='nodesong' onclick=saveSong("+i+")>";
            var final_part = new_part + titlestr + "</td>" + "</tr>";
            if(i == 0) {
                final_part = new_part + "[NOW] " + titlestr + "</td>" + "</tr>";
            }
            new_html += final_part;
        }
        if(playlist.length <= 0) {
            $("#nodetable").html("<tr class = 'nodesongrow'><td class = 'nodesong'>Nothing in the queue! Add a song to play it.</tr></td>");
        }
        else {
            $("#nodetable").html(new_html);
        }
    }
}

function refreshMyPlaylist() {
    var new_html = "";
    var playlist = my_playlist;
    console.log(playlist);
    for(var i = 0; i < playlist.length; i++) {
        var titlestr = "" + playlist[i]["Title"]
        // new_html += "<tr class = 'songrow'><td class = 'trash'><i onclick='deleteMySong("+i+")' class='fas fa-trash-alt' style = 'position:relative;'></i></td><td class = 'button'><i onclick='queueMySong("+i+") class='fas fa-plus' style = 'position:relative;'></i></td><td class ='song' onclick='queueMySong("+i+")>"+playlist[i]["Title"]+"</td></tr>"
        var new_part = "<tr class = 'songrow'>" +
            "<td class = 'trash' onclick=deleteMySong("+i+")>" +
                "<i class='fas fa-trash-alt' style = 'position:relative;'></i>" +
            "</td>" +
            "<td class = 'button' onclick=queueMySong("+i+")>" +
                "<i class='fas fa-plus' style = 'position:relative;'></i>" +
            "</td>" +
            "<td class ='song' onclick=queueMySong("+i+")>";
        var final_part = new_part + titlestr + "</td>" + "</tr>";
        new_html += final_part;
    }
    $("#playlisttable").html(new_html);
}


$("#queue_input").keypress(function (e) {
  if (e.which == 13) {
    queueMusicNode();
    return false;    //<---- Add this line
  }
});
function queueMusicNode() {
    if(curr_node == 4) {
        document.getElementById('myModal2').style.display = "block";
    }
    else {
        var vid_id = $("#queue_input").val().split('v=')[1];
        var ampersandPosition = vid_id.indexOf('&');
        if(ampersandPosition != -1) {
            vid_id = vid_id.substring(0, ampersandPosition);
        }
        socket.send(JSON.stringify({"Command": "queue", "ID" :vid_id}))
        current_playlist.push({name: "(Retrieving name...)",
        id: vid_id,
        time: 300})
        $("#queue_input").val("");
        console.log("lmao")
        refreshNodePlaylist();
    }
}

$("#queue_input_mine").keypress(function (e) {
  if (e.which == 13) {
    queueMyPlaylist();
    return false;    //<---- Add this line
  }
});
function queueMyPlaylist() {
    var vid_id = $("#queue_input_mine").val().split('v=')[1];
    var ampersandPosition = vid_id.indexOf('&');
    if(ampersandPosition != -1) {
        vid_id = vid_id.substring(0, ampersandPosition);
    }
    my_playlist.push({"Title": "(Retrieving name...)",
    "ID": vid_id,
    "Length": 300})
    socket.send(JSON.stringify({"Command": "add", "URL" :$("#queue_input_mine").val()}))
    $("#queue_input_mine").val("");
    refreshMyPlaylist();
}

function skip() {
    console.log("skip");
    $("#nowplaying").html("");
    player.pauseVideo();
    socket.send(JSON.stringify({"Command": "skip"}))
}
function deleteMySong(index) {
    console.log("delete");
    socket.send(JSON.stringify({"Command": "remove", "ID": my_playlist[index]["ID"]}))
    my_playlist.splice(index, 1);
    refreshMyPlaylist();

}
function queueMySong(index) {
    if(curr_node == 4) {
        document.getElementById('myModal2').style.display = "block";
    }
    else {
        current_playlist.push({name: my_playlist[index]["Title"],
        id: my_playlist[index]["ID"],
        time: my_playlist[index]["Length"]})
        socket.send(JSON.stringify({"Command": "queue", "ID" :my_playlist[index]["ID"]}))
        refreshNodePlaylist();
    }
}

function saveSong(index) {

    my_playlist.push({"Title": current_playlist[index]["Title"],
    "ID": current_playlist[index]["ID"],
    "Length": current_playlist[index]["Length"]})
    socket.send(JSON.stringify({"Command": "add", "URL" :"https://www.youtube.com/watch?v="+current_playlist[index]["ID"]}))
}
