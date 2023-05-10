// Constantes
let NB_PLAYERS = 2;

// Make the enum immutable.
// Source: https://www.sohamkamani.com/javascript/enums/
const Action = Object.freeze({
	up: "up",
	down: "down",
	left: "left",
	right: "right",
    freeze_camera: "freeze_camera",
    build: "build",
    zoom: "zoom",
});

// var fake_building = new Building("village_house", 2, 0, 0, 4, 0);
// var fake_building = new Building("lack_of_taste", 2, 0, 0, 4, 0);
var fake_building = new Building("house_poly_by_google", 2, 0, 10, 4, 1);

const Command = [
	{keyId: "z", keyCode: 90, action:Action.up, playerId:1},
	{keyId: "s", keyCode: 83, action:Action.down, playerId:1},
	{keyId: "q", keyCode: 81, action:Action.left, playerId:1},
	{keyId: "d", keyCode: 68, action:Action.right, playerId:1},
	{keyId: "v", keyCode: 86, action:Action.freeze_camera, playerId:1},
	{keyId: "c", keyCode: 67, action:Action.build, playerId:1},
    {keyId: "w", keyCode: 87, action:Action.zoom, playerId:1},
    
	{keyId: "arrowup", keyCode: 38, action:Action.up, playerId:2},
	{keyId: "arrowdown", keyCode: 40, action:Action.down, playerId:2},
	{keyId: "arrowleft", keyCode: 37, action:Action.left, playerId:2},
	{keyId: "arrowright", keyCode: 39, action:Action.right, playerId:2},
	{keyId: "m", keyCode: 77, action:Action.freeze_camera, playerId:2},
	{keyId: "l", keyCode: 76, action:Action.build, playerId:2},
    {keyId: "o", keyCode: 79, action:Action.zoom, playerId:2}
];

function getCommandsByPlayerId(playerId) {
    return Command.filter(function(command) {
        return command.playerId == playerId;
    });
}

function cameraPosition(alpha, beta, radius){
    this.alpha = alpha;
    this.beta = beta;
    this.radius = radius;
}

let canvas;
let engine;
let scene;
let player1;
let player2;

let groundPlayer1;
let groundPlayer2;

// creation de deux positions de camera
let cameraPlayer1 = new cameraPosition(0,0,0);
let cameraPlayer2 = new cameraPosition(0,0,0);

var cameraSpeed = 0.01;
var maxSpeed = 0.09;


let boardSize = 20;
let paddingGround = 2;

let absolutePositionX =  (boardSize/2 + paddingGround);

let idSquarePlayer1 = 0;
let idSquarePlayer2 = 0;
// taille du plateau
let nbSquaresBoard = nbSquaresSide**2;

let blockWidth = boardSize/nbSquaresSide;

class PlayerView{
    makeWall(){
        // add the walls at the botoom of the board to make it look like a box
        // loop 4 times to make the 4 walls
        for(let i = 0; i < 4; i++){
            let wall = BABYLON.MeshBuilder.CreateBox("wall" + i + "P" + this.idPlayer, {height: 2, width: boardSize, depth: 0.5}, this.myScene);
            wall.position.y = -1;
            wall.visibility = 1;
            // position the walls
            switch(i){
                case 0:
                    wall.position.x = this.absolutePositionX + boardSize/2+0.25;
                    wall.position.z = 0;
                    wall.rotate(BABYLON.Axis.Y, Math.PI/2, BABYLON.Space.WORLD);
                    break;
                case 1:
                    wall.position.x = this.absolutePositionX - boardSize/2-0.25;
                    wall.position.z = 0;
                    wall.rotate(BABYLON.Axis.Y, Math.PI/2, BABYLON.Space.WORLD);
                    break;
                case 2:
                    wall.position.x = this.absolutePositionX;
                    wall.position.z = boardSize/2+0.25;
                    break;
                case 3:
                    wall.position.x = this.absolutePositionX;
                    wall.position.z = -(boardSize/2+0.25);
                    break;
            }
            // make the picture wall.png be the texture of the wall, repeat it nbSquaresSide times
            const wallTexture = new BABYLON.StandardMaterial("wallTexture");
            wallTexture.diffuseTexture = new BABYLON.Texture("img/wall.png");
            wallTexture.diffuseTexture.uScale = nbSquaresSide;
            wallTexture.diffuseTexture.vScale = 1;
            wall.material = wallTexture;
        }
    }

    constructor(idPlayer, myScene){
        if(idPlayer < 1 || idPlayer > NB_PLAYERS) {
            console.error("Wrong player ID in Player constructor.");
        }
        this.playerObj = idPlayer == 1?g.player1:g.player2;
        this.idSquare = 0;

        
        this.absolutePositionX = idPlayer==1?(boardSize/2 + paddingGround):-(boardSize/2 + paddingGround);
        this.blockPlayer = BABYLON.MeshBuilder.CreateBox("boxP" + idPlayer, {height: 0.5, width: blockWidth, depth: blockWidth}, myScene);
        this.blockPlayer.position.y = 0;
        this.blockPlayer.position.x = -(boardSize/2)+blockWidth/2+this.absolutePositionX;
        this.blockPlayer.position.z = -(boardSize/2)+blockWidth/2;
        this.blockPlayer.visibility = 0;
        
        // call the function to make the walls
        this.makeWall();

        var grid = {'h': nbSquaresSide, 'w': nbSquaresSide};
        // faire un ground
        this.ground = new BABYLON.MeshBuilder.CreateTiledGround("groundP" + idPlayer, {xmin: -Math.round(boardSize/2), zmin: -Math.round(boardSize/2), xmax: Math.round(boardSize/2), zmax: Math.round(boardSize/2), subdivisions: grid}, myScene);
        this.ground.position.x = this.absolutePositionX;

        // set material to tiled ground
        const dirt1 = new BABYLON.StandardMaterial("dirt1");
        dirt1.diffuseTexture = new BABYLON.Texture("img/dirt1.png");

        const dirt2 = new BABYLON.StandardMaterial("dirt2");
        dirt2.diffuseTexture = new BABYLON.Texture("img/dirt2.png");
    
        // Create Multi Material
        const multimat = new BABYLON.MultiMaterial("multi", scene);
        multimat.subMaterials.push(dirt1);
        multimat.subMaterials.push(dirt2);
    
        this.ground.material = multimat;
        // Needed variables to set subMeshes
        const verticesCount = this.ground.getTotalVertices();
        const tileIndicesLength = this.ground.getIndices().length / (grid.w * grid.h);
        
        // Set subMeshes of the tiled ground
        this.ground.subMeshes = [];
        let base = 0;
        for (let row = 0; row < grid.h; row++) {
            for (let col = 0; col < grid.w; col++) {
                this.ground.subMeshes.push(new BABYLON.SubMesh(row%2 ^ col%2, 0, verticesCount, base , tileIndicesLength, this.ground));
                base += tileIndicesLength;
            }
        }
        
        
        this.camera = new BABYLON.ArcRotateCamera("cameraP"+idPlayer, 0, 0, 10, new BABYLON.Vector3(0, 0, zoomCameras), myScene);
        // This targets the camera to scene origin
        this.camera.setTarget(new BABYLON.Vector3(this.absolutePositionX, 0, 0));
        //camera.rotation.y = 0.3;
        this.camera.attachControl(canvas, true);
        scene.activeCameras.push(this.camera);
        this.camera.viewport = idPlayer == 1?new BABYLON.Viewport(0, 0, 0.5, 1):new BABYLON.Viewport(0.5, 0, 0.5, 1);
        // limiter la camera pour ne pas voir le dessous de la map
        this.camera.upperBetaLimit = 1.5;
        this.camera.lowerBetaLimit = 0.3;

        // remove les commandes de la souris et du pointeur sur la camera
        this.camera.inputs.removeByType("ArcRotateCameraPointersInput");
        this.camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");

        // get all the Commands where playerId = idPlayer
        var commands = getCommandsByPlayerId(idPlayer);
        // find the command with the right action
        this.camera.inputs.attached.keyboard.keysUp = [commands.find(function(command){ return command.action == "up"; }).keyCode];
        this.camera.inputs.attached.keyboard.keysDown = [commands.find(function(command){ return command.action == "down"; }).keyCode];
        this.camera.inputs.attached.keyboard.keysLeft = [commands.find(function(command){ return command.action == "left"; }).keyCode];
        this.camera.inputs.attached.keyboard.keysRight = [commands.find(function(command){ return command.action == "right"; }).keyCode];
        this.viewMode = true;
        this.zoomValue = 0;

        // set mask for the camera, this will allow us to see the menu of each player when bying a building
        this.camera.layerMask = idPlayer==1?0xFFFF0000:0x0000FFFF;
    }
}

window.onload = startGame;

function updatePlayerPosition(eventPlayer){
    eventPlayer.blockPlayer.position.x = -(boardSize/2)+blockWidth/2+blockWidth*(eventPlayer.idSquare%nbSquaresSide)+eventPlayer.absolutePositionX;
    eventPlayer.blockPlayer.position.z = -(boardSize/2)+blockWidth/2+blockWidth*Math.floor(eventPlayer.idSquare/nbSquaresSide);
}

function addBuildingScene(building, myScene, eventPlayer, eventIdSquare){
    BABYLON.SceneLoader.ImportMeshAsync("", "models/", building.name+".glb", myScene).then((result) => {
        // faire une liste de mesh
        var listMesh = [];
        // pour chaque element de la liste
        for(let geo of result.geometries){
            // ajouter l'id à la liste
            listMesh.push(scene.getNodeById(geo.id));
        }
        // merges les mesh pour en faire une seule (ici, notre batiment)
        let build = BABYLON.Mesh.MergeMeshes(listMesh, true, true, undefined, false, true);
        // get la taille du batiment
        let bounds = build.getBoundingInfo();
        var size_x = Math.abs(bounds.minimum.x - bounds.maximum.x);
        var size_y = Math.abs(bounds.minimum.y - bounds.maximum.y);
        var size_z = Math.abs(bounds.minimum.z - bounds.maximum.z);
        // print all sizes
        // print la taille du batiment
        var scale_adapt = Math.max(size_x, size_z);
        var scale_factor = blockWidth/scale_adapt;
        // scale le batiment
        // peut etre rejouter une sorte de padding pour que le batiment soit plus petit que la case ? :)
        build.scaling = new BABYLON.Vector3(scale_factor, scale_factor, scale_factor);
        // maison.position.y = 1;
        build.position.x = eventPlayer.blockPlayer.position.x;
        build.position.z = eventPlayer.blockPlayer.position.z;
        // arrondir le resultat
        build.position.y = (size_y*scale_factor)/2;
        // ajouter le nom du batiment: nom + position x + position z en case (ex: maison0_10)
        build.name = building.name+eventIdSquare%nbSquaresSide+"_"+Math.trunc(eventIdSquare/nbSquaresSide);

        // create particules if the building have profits
        if(building.profits>0){
            let particleSystem = new BABYLON.ParticleSystem("particles", building.profits);
            particleSystem.particleTexture = new BABYLON.Texture("img/"+"coinGC"+".png");
            particleSystem.emitter = build;
            particleSystem.persistence = 20;
            particleSystem.brightness = 1;
            // on la met dans le tableau
            particleSystem.start();
        }
    });
}


function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);

    scene = createScene();

    BABYLON.ArcRotateCamera.prototype.spinTo = function (whichprop, targetval, speed) {
        var ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        BABYLON.Animation.CreateAndStartAnimation('at4', this, whichprop, speed, 120, this[whichprop], targetval, 0, ease);
    }

    // add listener for m keydown
    window.addEventListener("keydown", async (event) => {

        let actionEvent = Command.find(({ keyId }) => keyId === (event.key).toLowerCase());
        if(actionEvent){
            let eventPlayer = actionEvent.playerId == 1?player1:player2;
            let pCamera = eventPlayer.camera;
            let eventIdSquare = eventPlayer.idSquare;
            // verify if the key pressed is the freeze_camera key
            if (actionEvent.action === Action.zoom){
                // make the zoom for the player
                eventPlayer.zoomValue = (eventPlayer.zoomValue+1)%zoomRange.length;
                pCamera.spinTo("radius", zoomRange[eventPlayer.zoomValue], 100);
            }else if (actionEvent.action === Action.freeze_camera){ // verifier si le joueur a les commandes sur la camera
                if(eventPlayer.viewMode){
                    // lui enlever les commandes + faire un spin de la camera sur une certaine position
                    eventPlayer.viewMode = false;
                    // TODO: éviter que la caméra ne tourne trop longtemps si le joueur à fait plusieurs tours
                    // pause the camera inputs 
                    eventPlayer.alpha = pCamera.alpha % (2*Math.PI);
                    // eventPlayer.alpha = pCamera.alpha;
                    eventPlayer.beta = pCamera.beta;
                    pCamera.spinTo("alpha", 1, 100);
                    pCamera.spinTo("beta", 1, 100);
                    eventPlayer.blockPlayer.visibility = blockPlayerVisibility;
                    pCamera.inputs.attached.keyboard.detachControl(canvas);
                }else{
                    // lui remettre les commandes + faire un spin de la camera sur une certaine position
                    // resume the camera inputs
                    pCamera.spinTo("alpha", eventPlayer.alpha, 100);
                    pCamera.spinTo("beta", eventPlayer.beta, 100);
                    eventPlayer.viewMode = true;
                    eventPlayer.blockPlayer.visibility = 0;
                    pCamera.inputs.attached.keyboard.attachControl(canvas);
                }
            }else if(!eventPlayer.viewMode){
                if(actionEvent.action == Action.up){
                    let newIdSquare = eventIdSquare - nbSquaresSide;
                    if(newIdSquare >= 0){
                        eventPlayer.idSquare = newIdSquare;
                        updatePlayerPosition(eventPlayer);
                    }else{
                        // make a sound ?
                    }
                }else if(actionEvent.action == Action.down){
                    let newIdSquare = eventIdSquare + nbSquaresSide;
                    if(newIdSquare < nbSquaresBoard){
                        eventPlayer.idSquare = newIdSquare;
                        updatePlayerPosition(eventPlayer);
                    }else{
                        // make a sound ?
                    }
                }else if(actionEvent.action == Action.right){
                    if(eventIdSquare%nbSquaresSide != 0){
                        eventPlayer.idSquare -= 1;
                        updatePlayerPosition(eventPlayer);
                    }else{
                        // make a sound ?
                    }
                }else if(actionEvent.action == Action.left){
                    if(eventIdSquare%nbSquaresSide != nbSquaresSide-1){
                        eventPlayer.idSquare += 1;
                        updatePlayerPosition(eventPlayer);
                    }else{
                        // make a sound ?
                    }
                }else if(actionEvent.action == Action.build){

                    // get the GUI of the player
                    // ligne à modifier, peut etre mettre une variable dans le player
                    // let gui = actionEvent.playerId==1?"GUIP1":"GUIP2";
                    // get le GUI
                    // let guiPlayer = scene.getTextureByName(gui);
                    // set the GUI visible for the correct player
                    // guiPlayer.layer.layerMask = actionEvent.playerId==1?0x10000000:0x00000001;
                    // verify if we can build on this square
                    // TO DO: Replace the "fake_building" by the building selected by the player
                    // show the menu to choose the building
                    // if(eventPlayer.playerObj.placeBuilding(fake_building, eventIdSquare%nbSquaresSide, (Math.trunc(eventIdSquare/nbSquaresSide)))){
                        // ajouter un model glb à la position du joueur
                        // just commant the line below to disable the building because we want to make a menu before building
                        // so the player can choose the building he wants to build
                        // addBuildingScene(fake_building, scene, eventPlayer, eventIdSquare);
                    // }
                    var hudName = actionEvent.playerId==1?"player1HUD":"player2HUD";
                    var hudPlayer = document.getElementById(hudName);
                    hudPlayer.style.display = "block";
                    eventPlayer.viewMode = true;
                    eventPlayer.purshaseMode = true;
                    // add listener to keydown and keyup
                    window.addEventListener("keydown", async (event) => {
                        let actionEvent2 = Command.find(({ keyId }) => keyId === (event.key).toLowerCase());
                        let eventPlayer2 = actionEvent.playerId == 1?player1:player2;
                        let eventIdSquare2 = eventPlayer2.idSquare;

                        if(eventPlayer2.purshaseMode){
                            
                            // make view mode true
                            // if the key pressed is the down arrow
                            if(actionEvent2 && actionEvent2.action == Action.down){
                                eventPlayer2.selectedBuilding = eventPlayer2.selectedBuilding+1<hudPlayer.children.length?eventPlayer2.selectedBuilding+1:eventPlayer2.selectedBuilding;
                                // player1selectedBuilding = player1selectedBuilding<hudPlayer.children.length?player1selectedBuilding+1:player1selectedBuilding;
                            }else if(actionEvent2 && actionEvent2.action == Action.up){
                                // TO DO
                                // get le nombre de build de maniere dynamique
                                // player1selectedBuilding = player1selectedBuilding<=0?player1selectedBuilding-1:0;
                                eventPlayer2.selectedBuilding = eventPlayer2.selectedBuilding-1>0?eventPlayer2.selectedBuilding-1:0;
                            }
                            
                            if(actionEvent2 && actionEvent2.action == Action.build && eventPlayer2.purshaseMode){
                            // place the building and close the HUD
                            // get the building name from the HUD
                                let buildingName = hudPlayer.children[eventPlayer2.selectedBuilding].getAttribute("name");
                                var fake_building = new Building(buildingName, 2, 0, 10, 4, 1);
                                if(eventPlayer2.playerObj.placeBuilding(fake_building, eventIdSquare2%nbSquaresSide, (Math.trunc(eventIdSquare2/nbSquaresSide)))){
                                    // ajouter un model glb à la position du joueur
                                    // just commant the line below to disable the building because we want to make a menu before building
                                    // so the player can choose the building he wants to build
                                    addBuildingScene(fake_building, scene, eventPlayer2, eventIdSquare2);
                                    // close the HUD
                                }
                                eventPlayer2.viewMode = false;
                                hudPlayer.style.display = "none";
                                hudPlayer.children[0].style.backgroundColor = "green";
                                eventPlayer2.selectedBuilding = 0;
                                eventPlayer.purshaseMode = false;
                                
                            }else{
                                // update the HUD
                                // remove all the background color of the HUD
                                for(let i=0; i<hudPlayer.children.length; i++){
                                    if (i == eventPlayer2.selectedBuilding){
                                        hudPlayer.children[i].style.backgroundColor = "green";
                                    }else{
                                        hudPlayer.children[i].style.backgroundColor = "white";
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }
    });
    // main animation loop 60 times/s
    engine.runRenderLoop(() => {
        scene.render();
    });
}

function createScene() {
    resizeCanvas();

    scene = new BABYLON.Scene(engine);

    let light = new BABYLON.HemisphericLight("myLight", new BABYLON.Vector3(0, 1, 0), scene);
    light.specular = new BABYLON.Color3.Black() 
    light.intensity = gamma;
    
    player1 = new PlayerView(1, scene);
    player2 = new PlayerView(2, scene);

    createSkybox(scene);
    createHUD(scene);

    return scene;
}

function createSkybox(scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox("skybox", {size:300}, scene);

	const skyboxMaterial = new BABYLON.StandardMaterial("skybox", scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("img/skybox/skybox", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

	skybox.material = skyboxMaterial;
}

async function createHUD(scene){
    // create the GUI
    // voir https://gui.babylonjs.com/ pour la création de GUI facilement

    // make the GUI for the 2 players
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUIP1");
    // TODO: change the path to the json file of the GUI (that was just a test)
    let loadedGUI = await advancedTexture.parseFromURLAsync("textures/guiTextureP1.json");
    // the layer mask is used to hide the GUI of the player that is not concerned
    advancedTexture.layer.layerMask = 0x00000000;
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUIP2");
    loadedGUI = await advancedTexture.parseFromURLAsync("textures/guiTextureP2.json");
    advancedTexture.layer.layerMask = 0x00000000;
}

// function createHUD(scene) {
//     // Create a GUI
//     var gui = new BABYLON.GUI.AdvancedDynamicTexture("gui");

//     // Create a panel to hold the list of buildings
//     var panel = new BABYLON.GUI.StackPanel();
//     panel.width = "220px";
//     panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
//     panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
//     gui.addControl(panel);

//     // Add a header to the panel
//     var header = new BABYLON.GUI.TextBlock();
//     header.text = "Select a building:";
//     header.height = "30px";
//     header.color = "white";
//     header.fontSize = 18;
//     panel.addControl(header);

//     // Add a dropdown list to the panel
//     var dropdown = new BABYLON.GUI.DropDown();
//     dropdown.width = "200px";
//     dropdown.fontSize = 14;
//     dropdown.color = "white";
//     dropdown.options.push(new BABYLON.GUI.GUIListWrapper("Select a building...", null));
//     for (var i = 0; i < list_buildings.length; i++) {
//         dropdown.options.push(new BABYLON.GUI.GUIListWrapper(list_buildings[i], list_buildings[i]));
//     }
//     panel.addControl(dropdown);

//     // Create an event listener for when the user selects a building
//     dropdown.onValueChangedObservable.add(function(value) {
//         // Do something with the selected building
//         console.log("Selected building: " + value);
//     });
// }

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
    resizeCanvas();
    engine.resize();
});