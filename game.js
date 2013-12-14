/**
 * knock knock
 * who's there?
 * 100% pure swag.
 *
 *        .           .           .           .           .           .
 *       ...         ...         ...         ...         ...         ...
 *      .....       .....       .....       .....       .....       .....
 *       ...         ...         ...         ...         ...         ...
 *        .           .           .           .           .           .
 *
 *
 * -----------------------------  GILGORM AUTHORS ------------------------------
 *     A game originally concieved by Marko Mijalkovic and Lucas Tennen
 * Since creation, gilgorm has been expanded to a team of 7 people featuring:
 *  -Marko
 *  -Lucas
 *  -Jeremie
 *  -Luka
 *  -Daniel
 *  -Pratt
 *  -Alex
 * -----------------------------------------------------------------------------
 *
 *                               === Game.js ===
 *                      This file holds the main game code
 *
 *         All of the game code is currently stored in here, feel free to modify
 *    this file as needed. If you are commiting to the master branch, make sure to
 *    pace your commits and not create a patch holding all the changes you've made
 *    since December 31, 1948. Thanks for sharing and thanks for caring.
 *          -Marko
 */
var stageMaxX;      //A variable to store the maximum that a player can walk to the right
var stageMaxY;      //Like @stageMaxX, except for the height.
var screenX = 960;  //Default screen width on browser
var screenY = 640;  //Default screen height on browser

//Create a new quintus instance
var Q = window.Q = Quintus({ audioSupported: ['mp3'], development: true})
    .include("Sprites, Audio, Scenes, Input, 2D, Anim, Touch, UI") //Load modules
    .setup({
        width: screenX,      //Default screen width in browser
        height: screenY,     //Default screen height in browser
        resampleHeight: 800, //Resize the zoom level if screenY is greater than 800
        resampleFactor: 2.5, //    -> resize it by a factor of 2.5
        maximize: "touch"    //Disregard screenX and screenY if on mobile browser
    }).controls().touch().enableSound(); //Enable needed modules

var level = "level8.tmx"; //Very temporary placeholder for current level

/* TileLayerProperties
 * Wrote this class to help with loading meta data from the map
 * This will be replaced when we write our own level editor
 */
TileLayerProperties = Q.TileLayer.extend({
    //Get map zoom level, defaults to 1
    getSize: function()
    {
        var parser = new DOMParser(),                                         //Set up a new parser and load @level
            doc = parser.parseFromString(Q.asset(level), "application/xml");

        var properties = doc.getElementsByTagName("property");                //Get property tags (Remember this is XML)
        for(var i = 0; i < properties.length; i++)                            //Loop through properties
            if(properties[i].getAttribute("name") == "size")                  //If a property is called "size"
                return parseFloat(properties[i].getAttribute("value"));       //Return the value stored as a float
        return 1.0;    //Default to zoom 1
    },

    //Get starting player coordinates from level
    getPlayerPos: function(level)
    {
        for(var x = 0; x < level.p.cols; x++)          //Loop through columns
        {
            for(var y = 0; y < level.p.rows; y++)      //Loop through rows
            {
                if(level.p.tiles[y][x] != -1)          //If match is found, return that location
                {
                    return {y: y * level.p.tileH, x: x * level.p.tileW};
                }
            }
        }
        return { x:-1, y:-1}; //Return impossible values if player not found
    }
});

//Setup player animations currently implemented
Q.animations('player', {
    walk_right: { frames: [2,3], rate: 1/3},
    walk_left: { frames: [1,0], rate: 1/3},
    stand_left: { frames: [1], rate: 1/3},
    stand_right: { frames: [2], rate: 1/3}
});

//Player class to hold all player code
Q.Sprite.extend("Player",{
    init: function(p) {
        this._super(p, {
            sprite:"player",
            sheet: "player",
            jumpSpeed: -640     //Player y velocity upon jump
        });
        this.right = true;      //Facing right by default
        this.add('2d, platformerControls, animation');    //Add basic controls
    },

    //Runs on each game step
    step: function() {
        if(this.p.vx > 0)              //If velocity is over 0,
        {
            this.right = true;         // set player to be walking right
            this.play("walk_right");   // play walking right animation
        }
        if(this.p.vx < 0)              //If velocity is under 0,
        {
            this.right = false;        // set player to be walking left
            this.play("walk_left");    // play walking left animation
        }

        if(this.p.vx == 0 || this.p.vy != 0)    //If player has stopped moving or is jumping
        {
            if(this.right)                      //If facing right
                this.play("stand_right");       //Look right
            else                                //else
                this.play("stand_left");        //Look left
        }

        if(this.p.x < 0)               //If player's x position is too far left of map
            this.p.x = 0;              //   put him back on the map at 0
        if(this.p.x > stageMaxX)       //Likewise,
            this.p.x = stageMaxX;      //  except with right side

        if(this.p.y + 35 > stageMaxY)  //Same thing with map height, although I add 35 because the player
        {                              //   is 70px tall and 35 is half of 70.
            Q.clearStages();           //Remove stages (duh)
            Q.stageScene("level2");    //Reload same level
            Q.audio.play("death.mp3",  //Play death sound
                {loop:false});
        }

        if(this.p.vy > 1200)           //If player velocity is greater than 1200
            this.p.vy = 1200;          //  enforce terminal velocity
    }
});

//Enemy class for the shitty turd, this will be removed soon
Q.Sprite.extend("Enemy",{
    init: function(p) {
        this._super(p, { asset: 'turdman.png', vx: 100 });         //Set velocity to 100 [->]
        this.add('2d, aiBounce');                                  //Ai bounces when it hits a wall

        this.on("bump.left,bump.right,bump.bottom",function(collision) {    //If bumped from any side except top
            if(collision.obj.isA("Player")) {                               //If player
                Q.clearStages();                                            //Reset game
                Q.stageScene("level2");                                     //Load same level
                Q.audio.play("death.mp3", {loop: false});                   //Play death sound
            }
        });

        this.on("bump.top",function(collision) {      //If bumped from the top
            if(collision.obj.isA("Player")) {         //If player
                this.destroy();                       //Destroy this enemy instance
                collision.obj.p.vy = -300;            //This sets the player's y velocity to -300
            }
        });
    }
});

//Unused Pipe object for now, it used to be useful, is now not useable
//Q.Sprite.extend("Pipe",{
//    init: function(p){
//        this._super(p, {asset: "pipe.png", x: 3045, y: 280});
//        this.add("2d");
////        this.on("hit.sprite", function(collision)
////        {
////            if(collision.obj.isA("Pipe") && collision.obj.x == this.x - 70 && Q.inputs['down'])
////            {
////                Q.clearStages();
////                Q.stageScene("level2");
////            }
////        });
////        this._super(p, { asset: 'pipe.png', x: 3045, y: 280}) ;
//        this.on("bump.top", function(collision) {
//            if(collision.obj.isA("Player") && Q.inputs['down']) {
//                Q.clearStages();
//                Q.stageScene("level2");
//            }
//        });
//    }
//});


/* @pumpRate is the amount of milliseconds between pulses
 * It can be calculated based on the following:
 *   -The music tempo is 110bpm
 *   -The kick drum hits once every 4 beats
 *
 * With this knowledge, we can first create an equation of 60 / 110
 * for the number of seconds a beat lasts. We then multiply 60 by 4 to make
 * 240 which gives us the length of a pulse in seconds every 4 beats. The equation
 * is now 240 / 110. At last, you multiply 240 by 1000 to change from seconds
 * to milliseconds.
 *
 *      The final equation is 240000.0 / 110.0. The ".0" is to ensure a
 * floating-point calculation.
 */
var pumpRate = 240000.0 / 110.0;   //Explained above ^
var seconds = getTime();           //@seconds acts as a counter keeping the last recorded time
var targetScale;                   //Used in the pump equation to continually pulse towards this scale value
var pump = !Q.touchDevice;         //Only pump if not on a mobile device, otherwise it'll look pretty strange

//This function gets the current CMOS time in ms
function getTime()
{
    return new Date().getTime();
}

/* This defines the scene "level2".
 *
 *      "level2" does not actually load level2.tmx (I know, bad nomenclature).
 * Instead, level2 defines a generalized stage polymorphic to any level which can be loaded.
 * It defines basics such as stage objects, and redefines things such as the step method to do visual fx/ui
 */
Q.scene("level2", function(stage) {    //Stage is passed to this function as the object to use in loading.

    var background = new Q.Repeater({  //Background is the background pic to the stage
        asset: "clouds3.png",          //Use clouds3.png as the background (grey starry background)
        speedX: 0.5,                   //Set horizontal movement to half of main stage movement
        speedY: 0.5                    //Set vertical movement to half of main stage movement
    });
    stage.insert(background);          //Add this layer to the stage


    var midGround = new Q.TileLayer({  //Used as non-interactive layer in the level editor
        dataAsset: level,              //Load the @level variable's level, e.g. "level7.tmx"
        layerIndex: 0,                 //Use the first layer
        sheet: 'tiles',                //Use tile sheet 'tiles'
        tileW: 70,                     //Tile width is 70px
        tileH: 70,                     //Tile height is 70px
        type: Q.SPRITE_NONE
    });
    stage.insert(midGround);           //Add midground to stage

    var world = new TileLayerProperties({   //Used as the collision layer in the world
        dataAsset: level,                   //Load the @level variable's level, e.g. "level7.tmx"
        layerIndex:1,                       //Use the second layer (0-based index!)
        sheet: 'tiles',                     //Use tile sheet 'tiles'
        tileW: 70,                          //Tile width is 70px
        tileH: 70                           //Tile height is 70px
    });
    var scale = world.getSize();            //Get world scale specified by level creator
    stage.collisionLayer(world);            //Set as collision layer

    var x, y;
    try
    {
        var pos = world.getPlayerPos(new Q.TileLayer({ //       This loads up the player layer from the level file
            dataAsset: level,                          //   It uses the same info as the others, like
            layerIndex:2,                              //   tile width/tile height. Only difference is that the layer
            sheet: 'tiles',                            //   is set to '2', which is the 3rd layer, and also where the
            tileW: 70,                                 //   player is stored.
            tileH: 70                                  //
        }));
        x = 41 / 2 + pos.x;        //Add 41 / 2 due to the sprite being centered, and that the sprite is 41px
        y = pos.y;                 //y position is however at the bottom as it should be
    } catch(err)
    {                              //If the map fails to load the player's position,
        x = 110;                   //This will load a hardcoded position at 110x, 50y
        y = 50;
    }
    var player = stage.insert(new Q.Player({
        x: x,                                //Load the player in with these values
        y: y
    }));

    stage.insert(new Q.Enemy({ x: 700, y: 0 }));  //Add a turdman in at coords 700x0

    stageMaxX = midGround.p.w;               //Sets @stageMaxX according to the mid ground, which in
    stageMaxY = midGround.p.h;               //the editor is the same size as the whole map


    if(stageMaxX * scale < Q.width)          //If the stage with the scale multiplier
    {                                        //is less than the screen width,
        scale = Q.width / stageMaxX;         //this will resize the screen scale to fit the level
    }
    if(stageMaxY * scale < Q.height)         //Just like above^ except this compares the height
    {
        scale = Q.height / stageMaxY;
    }

    stage.add("viewport").follow(player,      //Set the view to follow the player
        {
            x:true,                           //Follow both on the x axis
            y: true                           //And the y axis
        },{
            minX: 0,                          //This section doesn't let the camera
            maxX: midGround.p.w * scale,      //go beyond the bounds of the level
            minY: 0,                          //This is calculated with the level size
            maxY: midGround.p.h * scale       //multiplied by the scale modifier
    });
    stage.viewport.scale = scale;             //Set the stage's scale to the scale modifier

    // This is used for the pulsing effect,
    // the pulse tries to conform to this scale
    // every time it pulses
    targetScale = scale;

    stage.temp = stage.step;      //Modifying the step function, so store the original in a temp
    stage.step = function(dt)     //Start of modded function
    {
        stage.temp(dt);           //Call original
        if(pump)                  //If screen pumping is enabled
        {
            if(pumpRate < (getTime() - seconds))    //   if the ms per pump is less than the difference
            {                                       //   between the current time and the last recorded time
                seconds = getTime();                //Re record the current time
            }

            //Math to generate scale value, some complicated math is involved, will document later
            this.viewport.scale = targetScale * (((getTime() - seconds) / pumpRate) * 0.03 + 1);
            this.viewport.boundingBox.maxX = midGround.p.w * this.viewport.scale;
            this.viewport.boundingBox.maxY = midGround.p.h* this.viewport.scale;
        }

        if(!document.hasFocus())                         //If page is in background
        {
            console.log("Not focused.");
            this.pause();                                //Pause game
//            Q.audio.pauseGame();                       //Perhaps this could be written?
            Q.audio.stop();                              //Crude stopping of sound.
            Q.stageScene("testUI", {prevStage: this});   //Show testUI stage
        }
    }
});

/* This defines the scene "testUI".
 *
 *      This stage is a placeholder for the pause menu. There is currently
 *  nothing here except a message saying "Pause menu swag" and a method checking
 *  if the window is back in focus.
 */
Q.scene("testUI", function(stage)
{
    var container = stage.insert(new Q.UI.Container({  //Create a new container for the text
        fill: "gray",                                  //
        border: 5,
        shadow: 10,
        shadowColor: "rgba(0,0,0,0.5)",
        y: 50,
        x: Q.width/2
    }));

    stage.insert(new Q.UI.Text({
        label: "Pause menu swag",
        color: "white",
        x: 0,
        y: 0
    }),container);

    container.fit(20,20);

    stage.temp = stage.step;
    stage.step = function(dt)
    {
        stage.temp(dt);
        if(document.hasFocus())
        {
            console.log("Unpausing with new scene and audio...");
            Q.stageScene("level2");
            Q.audio.play("industryloop.mp3", {loop: true}); //restarts audio
            seconds = getTime();                            //also restart pulsating
        }
    }
});

/*        This is where the game actually starts. The necessary assets are
 *   loaded and the game is started via the callback function. This function
 *   set everything up and loads the stage after the game is ready.
 */
Q.load("tiles_map.png, death.mp3, gilgorm.png, turdman.png, pipe.png, clouds3.png, " + level, function() {
    Q.sheet("tiles","tiles_map.png", { tilew: 70, tileh: 70});   //Load tile map as 'tiles'
    Q.sheet("player","gilgorm.png", { tilew: 41, tileh: 67});    //Load player sheet as 'player'
    Q.load("industryloop.mp3", function(){                       //Load the song
        console.log("Loaded?");
        Q.audio.play("industryloop.mp3", {loop: true});          //Play song as loop
        seconds = getTime();                                     //Get current time to start pump fx
    });
    var loadtext = document.getElementById("loading");           //Get loading text from page
    loadtext.parentNode.removeChild(loadtext);                   //Remove it
    Q.stageScene("level2");                                      //Load scene "level2"
});
