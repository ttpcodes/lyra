// initialize stuff
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth * 1, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.soft = true;
document.getElementById( 'game' ).appendChild( renderer.domElement );
var clock = new THREE.Clock();
var moving = false;
var curr_node = 0;

function nothing() {}
function doneMoving() {
    moving = false;
}

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
camera.position.z = 4;
camera.position.y = -2;
camera.position.x = 1.5;
camera.rotation.x = degToRad(40)
var camera_target_x = 1.5;
var camera_target_y = -2;
var camera_target_z = 4;

var am_light = new THREE.AmbientLight(0xAAAAAA, 0.8); // soft white light
scene.add(am_light);

// main light
var light = new THREE.DirectionalLight( 0xffffff, 0.4, 5000 );
light.position.set(2, 2, 10); 			//default; light shining from top
light.castShadow = true;            // default false
light.shadow.mapSize.width = 2048;  // default
light.shadow.mapSize.height = 2048; // default
// light.shadow.camera.near = 0.01;    // default
// light.shadow.camera.far = 5;     // default
light.shadow.camera.near = 2;
light.shadow.camera.far = 15;
light.shadow.camera.left = -20;
light.shadow.camera.right = 20;
light.shadow.camera.top = 20;
light.shadow.camera.bottom = -20;
light.shadow.bias = 0.0001;
scene.add(light);
// var helper = new THREE.CameraHelper( light.shadow.camera );
// scene.add( helper );

// build the floor
var floor_geometry = new THREE.PlaneGeometry(17, 17);
var floor_material = new THREE.MeshToonMaterial( { color: 0x070826 } );
var floor_mesh = new THREE.Mesh(floor_geometry, floor_material);
floor_mesh.position.x = 7.5
floor_mesh.position.y = 7.5
floor_mesh.receiveShadow = true;
// scene.add(floor_mesh)

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

var connections = [];
connections.push([0,1]);
connections.push([0,2]);
connections.push([1,3]);
connections.push([2,3]);
connections.push([3,4]);

player_mesh.position.x = nodes[0][0]*2 + 1.5;
player_mesh.position.y = nodes[0][1]*2 + 1.5;
camera.position.x = nodes[0][0]*2 + 1.5;
camera.position.y = nodes[0][1]*2 + 1.5 - 3.5;

function Path(direction, other) {
    this.direction = direction;
    this.other = other;
}
var paths = [];

// nodes
for(var i = 0; i < nodes.length; i++) {
    var x = nodes[i][0]/3;
    var y = nodes[i][1]/3;
    paths.push([]);
    var node_geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32 )
    var node_material = new THREE.MeshToonMaterial( { color: 0x85519c } );
    var node = new THREE.Mesh(node_geometry, node_material );
    node.position.x = x*6 + 1.5;
    node.position.y = y*6 + 1.5;
    node.position.z = 0.025;
    node.rotation.x = Math.PI/2;
    node.castShadow = true; //default is false
    node.receiveShadow = true;
    scene.add(node);

    var node_small_geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32 )
    var node_small_material = new THREE.MeshToonMaterial( { color: 0x9e87d5 } );
    var node_small = new THREE.Mesh(node_small_geometry, node_small_material );
    node_small.position.x = x*6 + 1.5;
    node_small.position.y = y*6 + 1.5;
    node_small.position.z = 0.03;
    node_small.rotation.x = Math.PI/2;
    node_small.castShadow = true; //default is false
    node_small.receiveShadow = true;
    scene.add(node_small);
}

// connections
for(var i = 0; i < connections.length; i++) {
    var first = nodes[connections[i][0]];
    var second = nodes[connections[i][1]];
    var first_x = first[0]*2 + 1.5;
    var first_y = first[1]*2 + 1.5;
    var second_x = second[0]*2 + 1.5;
    var second_y = second[1]*2 + 1.5;
    var length = Math.sqrt(Math.pow(first_x - second_x, 2) + Math.pow(first_y - second_y, 2))
    var node_geometry = new THREE.BoxGeometry(0.25, length, 0.025, 32 )
    var node_material = new THREE.MeshToonMaterial( { color: 0x423040 } );
    var node = new THREE.Mesh(node_geometry, node_material );
    node.position.x = (first_x + second_x)/2;
    node.position.y = (first_y + second_y)/2;
    node.position.z = 0.0125;
    node.rotation.z = Math.atan2(second_y - first_y, second_x - first_x) + Math.PI/2;
    paths[connections[i][0]].push(new Path(node.rotation.z % (Math.PI*2), connections[i][1]));
    paths[connections[i][1]].push(new Path((node.rotation.z + Math.PI) % (Math.PI*2), connections[i][0]));
    node.castShadow = true; //default is false
    node.receiveShadow = true;
    scene.add(node);
}

// buildings
// for(var x = 0; x < 5; x++) {
//     for(var y = 0; y < 5; y++) {
//         var height = 1 + Math.random();
//         var building_geometry = new THREE.BoxGeometry(0.5, 0.5, height);
//         var colors = [0x272056, 0x272056, 0x272056, 0x272056, 0x9e87d5, 0x272056, 0x85519c]
//         var building_material = new THREE.MeshToonMaterial( { color: colors[Math.floor(Math.random() * colors.length)] } );
//         var building = new THREE.Mesh(building_geometry, building_material );
//         building.position.x = x*3 + (Math.random()-0.5)*1;
//         building.position.y = y*3 + (Math.random()-0.5)*1;
//         building.position.z = height/2;
//         building.castShadow = true; //default is false
//         scene.add(building);
//     }
// }


function update() {
	requestAnimationFrame( update );
	renderer.render( scene, camera );
    // camera_rotation += 0.01;
    // camera.position.x -= (camera.position.x - camera_target_x) * 0.1;
    // camera.position.y -= (camera.position.y - camera_target_y) * 0.1;
    // camera.position.x = camera_target_x;
    // camera.position.y = camera_target_y;
    // camera.position.x = 2*Math.cos(camera_rotation);
    // camera.position.y = 2*Math.sin(camera_rotation);
    // camera.rotateOnWorldAxis(new THREE.Vector3(0,0,1), 0.01);
    // light.position.set(camera.position.x + 2, camera.position.y + 2, camera.position.z + 10);
    // console.log(moving);

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
}
update();


function pwd(x) {
    const dividend = Math.E ** -(x ** 2 / (2));
    const divisor = Math.sqrt(2 * Math.PI);
    return dividend/divisor;
}


Mousetrap.bind('left', function() {
    move(Math.PI);
});
Mousetrap.bind('right', function() {
    move(0);
});
Mousetrap.bind('up', function() {
    move(Math.PI/2);
});
Mousetrap.bind('down', function() {
    move(Math.PI * (3/2));
});

function move(direction) {
    direction = (direction + Math.PI/2) % (Math.PI*2);
    var minimum = -1;
    var path = null;
    // console.log(paths[curr_node]);
    // console.log(direction)
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
    // console.log(minimum);
    // console.log(path);
    if(minimum != -1 && minimum < Math.PI/2) {
        if(!moving) {
            moving = true;
            curr_node = path.other;
            animations.push(new Animation("gaussian", player_mesh, 40, "position", "x", nodes[path.other][0]*2 + 1.5, nothing));
            animations.push(new Animation("gaussian", player_mesh, 40, "position", "y", nodes[path.other][1]*2 + 1.5, nothing));
            animations.push(new Animation("gaussian", camera, 60, "position", "x", nodes[path.other][0]*2 + 1.5, doneMoving));
            animations.push(new Animation("gaussian", camera, 60, "position", "y", nodes[path.other][1]*2 + 1.5 - 3.5, doneMoving));
            // beginNewSong();
            beginNewSong2();
        }
    }
}

function songAtNode() {
    return "aalpzhIkmnA";
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
function onPlayerReady(event) {
    console.log("ready")
}
function onStateChange(event) {
    if(event.data == 1) {
        $("#name").html("Now playing: " + songAtNode());
    }
}
function beginNewSong2() {
    $("#name").html("Now loading: " + songAtNode());
    player.loadVideoById(songAtNode());
    player.playVideo();
}
