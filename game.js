/**
 * Created with JetBrains WebStorm.
 * User: Marko
 * Date: 11/16/13
 * Time: 7:46 PM
 * To change this template use File | Settings | File Templates.
 */
var stageMaxX;
var stageMaxY;
var screenX = 960;
var screenY = 640;

var Q = window.Q = Quintus({ audioSupported: [ 'mp3' ], development: true})
    .include("Sprites, Audio, Scenes, Input, 2D, Anim, Touch, UI")
    .setup({
        width: screenX,
        height: screenY,
//        downsampleWidth: 1,
//        downsampleHeight: 1,
        maximize: "touch"
    }).controls().touch().enableSound();
//load assets

var level = "level7.tmx";

TileLayerProperties = Q.TileLayer.extend({
    getSize: function()
    {
        var parser = new DOMParser(),
            doc = parser.parseFromString(Q.asset(level), "application/xml");

        var properties = doc.getElementsByTagName("property");
//        console.log("Properties is " + properties.length);
//        console.log(this.dataAsset);
        for(var i = 0; i < properties.length; i++)
        {
            if(properties[i].getAttribute("name") == "size")
            {

                return parseFloat(properties[i].getAttribute("value"));
            }
        }
    },

    getPlayerX: function(w)
    {
        for(var x = 0; x < w.p.cols; x++)
        {
            for(var y = 0; y < w.p.rows; y++)
            {
                if(w.p.tiles[y][x] != -1)
                {
                    return x * w.p.tileW;
                }
            }
        }
    },

    getPlayerY: function(w)
    {
        for(var x = 0; x < w.p.cols; x++)
        {
            for(var y = 0; y < w.p.rows; y++)
            {
                if(w.p.tiles[y][x] != -1)
                {
                    return y * w.p.tileH;
                }
            }
        }
    }
});

Q.animations('player', {
    walk_right: { frames: [2,3], rate: 1/3},
    walk_left: { frames: [1,0], rate: 1/3},
    stand_left: { frames: [1], rate: 1/3},
    stand_right: { frames: [2], rate: 1/3}
//    run_right: { frames: [7,6,5,4,3,2,1], rate: 1/15},
//    run_left: { frames: [19,18,17,16,15], rate:1/15 },
//    fire_right: { frames: [9,10,10], next: 'stand_right', rate: 1/30, trigger: "fired" },
//    fire_left: { frames: [20,21,21], next: 'stand_left', rate: 1/30, trigger: "fired" },
//    stand_right: { frames: [8], rate: 1/5 },
//    stand_left: { frames: [20], rate: 1/5 },
//    fall_right: { frames: [2], loop: false },
//    fall_left: { frames: [14], loop: false }
});

Q.Sprite.extend("Player",{
    init: function(p) {
        this._super(p, {
//            asset: "autisticplayer.png",
            sprite:"player",
            sheet: "player",
            //jumpSpeed: -580
            jumpSpeed: -600
        });
        this.right = true;
        this.add('2d, platformerControls, animation');
    },
    step: function(dt) {
//        if(Q.inputs['left'] && this.p.direction == 'right') {
//            this.p.flip = 'x';
//        }
//        if(Q.inputs['right']  && this.p.direction == 'left') {
//            this.p.flip = false;
//        }
        if(this.p.vx > 0)
        {
            this.right = true;
            this.play("walk_right");
        }
        if(this.p.vx < 0)
        {
            this.right = false;
            this.play("walk_left");
        }
        if(this.p.vx == 0 || this.p.vy != 0)
        {
            if(this.right)
                this.play("stand_right");
            else
                this.play("stand_left");
        }
//        if(!Q.inputs['up'] && this.p.vy < 0){
//            this.p.vx += 150;
//        }
//        if(this.vy > 0)
//            this.vx = this.vx * 200;
//        console.log(this.vy);
        if(this.p.x < 0)
            this.p.x = 0;
        if(this.p.x > stageMaxX)
            this.p.x = stageMaxX;
        if(this.p.y + 35 > stageMaxY)
        {
            Q.clearStages();
            Q.stageScene("level2");
        }

        if(this.p.vy > 1500)
            this.p.vy = 1500;
    }
});

Q.Sprite.extend("Enemy",{
    init: function(p) {
        this._super(p, { asset: 'turdman.png', vx: 100 });
        this.add('2d, aiBounce');

        this.on("bump.left,bump.right,bump.bottom",function(collision) {
            if(collision.obj.isA("Player")) {
                Q.stageScene("endGame",1, { label: "You Died" });
                collision.obj.destroy();
                Q.clearStages();
                Q.stageScene("level2");
            }
        });

        this.on("bump.top",function(collision) {
            if(collision.obj.isA("Player")) {
                this.destroy();
                collision.obj.p.vy = -300;
            }
        });

    }
});

Q.Sprite.extend("Pipe",{
    init: function(p){
        this._super(p, {asset: "pipe.png", x: 3045, y: 280});
        this.add("2d");
//        this.on("hit.sprite", function(collision)
//        {
//            if(collision.obj.isA("Pipe") && collision.obj.x == this.x - 70 && Q.inputs['down'])
//            {
//                Q.clearStages();
//                Q.stageScene("level2");
//            }
//        });
//        this._super(p, { asset: 'pipe.png', x: 3045, y: 280}) ;
        this.on("bump.top", function(collision) {
            if(collision.obj.isA("Player") && Q.inputs['down']) {
                Q.clearStages();
                Q.stageScene("level2");
            }
        });
    }
});
var pumprate = 2181.818181818182;//1090.909090909;//545.45454545;//1.0 / (110.0 / 60.0);
var seconds = getTime();
var origscale;

function getTime()
{
    return new Date().getTime();
}

Q.scene("level2", function(stage)
{
    var rep = new Q.Repeater({asset: "clouds3.png", speedX: 0.5, speedY: 0.5 });
    stage.insert(rep);
    var background = new Q.TileLayer({ speedX: 0.7, speedY: 0.7, dataAsset: level, layerIndex: 0, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE });
    stage.insert(background);

    var world = new TileLayerProperties({ dataAsset: level, layerIndex:1,  sheet: 'tiles', tileW: 70, tileH: 70 });
    var scaleFactor = Q.screenY / screenY;
    var scale = world.getSize();
//    console.log(scale);
    if(scale == void 0)
        scale = 1;
    stage.collisionLayer(world);

    var x, y;
    try
    {
        x = 41 / 2 + world.getPlayerX(new Q.TileLayer({ dataAsset: level, layerIndex:2,  sheet: 'tiles', tileW: 70, tileH: 70 }));
        y = world.getPlayerY(new Q.TileLayer({ dataAsset: level, layerIndex:2,  sheet: 'tiles', tileW: 70, tileH: 70 }));
    } catch(err)
    {
        x = 110;
        y = 50;
    }
//    console.log("X is " + x + ", y is " + y);
    var player = stage.insert(new Q.Player({
//        x: 110,
//        y: 50
        x: x,
        y: y
    }));
    var enemy = stage.insert(new Q.Enemy({ x: 700, y: 0 }));
//    var pipe = stage.insert(new Q.Pipe());
    stageMaxX = background.p.w;
    stageMaxY = background.p.h;
    if(stageMaxX * scale < Q.width)
    {
//        Q.width = stageMaxX * scale;
        scale = Q.width / stageMaxX;
    }
    if(stageMaxY * scale < Q.height)
    {
//        Q.height = stageMaxY * scale;
        scale = Q.height / stageMaxY;
    }
    if(Q.touchDevice)
        scale *= scaleFactor;

    stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w * scale, minY: 0, maxY: background.p.h * scale});
    stage.viewport.scale = scale;
    origscale = scale;
    stage.step = function(dt)
    {
        if(this.paused) { return false; }

        this.trigger("prestep",dt);
        this.updateSprites(this.items,dt);
        this.trigger("step",dt);

        if(this.removeList.length > 0) {
            for(var i=0,len=this.removeList.length;i<len;i++) {
                this.forceRemove(this.removeList[i]);
            }
            this.removeList.length = 0;
        }

        this.trigger('poststep',dt);

        if(pumprate < (getTime() - seconds))
        {
//            console.log("Pump");
            seconds = getTime();
//            this.viewport.scale = origscale * 1.1;
        }
//        console.log("Currect scale: " + this.viewport.scale);
//        console.log(origscale * (((getTime() - seconds) / pumprate) * 0.01 + 1));
        this.viewport.scale = origscale * (((getTime() - seconds) / pumprate) * 0.03 + 1);
        this.viewport.boundingBox.maxX = background.p.w * this.viewport.scale;
        this.viewport.boundingBox.maxY = background.p.h* this.viewport.scale;
    }
});

Q.load("tiles_map.png, gilgorm.png, turdman.png, pipe.png, clouds3.png, industryintro.mp3, industryloop.mp3, " + level, function() {
    Q.sheet("tiles","tiles_map.png", { tilew: 70, tileh: 70});
    Q.sheet("player","gilgorm.png", { tilew: 41, tileh: 67});
    Q.load("industryloop.mp3", function(){
        console.log("Loaded?");
    });
    Q.audio.play("industryloop.mp3", { loop: true })
    seconds = getTime();
    var loadtext = document.getElementById("loading");
    loadtext.parentNode.removeChild(loadtext);
    Q.stageScene("level2");
});
