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

var Q = window.Q = Quintus({development: true})
    .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
    .setup({
        width: screenX,
        height: screenY,
        downsampleWidth: 1,
        downsampleHeight: 1,
        maximize: "touch"
    }).controls().touch();
//load assets

var level = "level4.tmx";

TileLayerProperties = Q.TileLayer.extend({
    getSize: function()
    {
        var parser = new DOMParser(),
            doc = parser.parseFromString(Q.asset(level), "application/xml");

        var properties = doc.getElementsByTagName("property");
        console.log("Properties is " + properties.length);
        console.log(this.dataAsset);
        for(var i = 0; i < properties.length; i++)
        {
            if(properties[i].getAttribute("name") == "size")
            {
                return parseFloat(properties[i].getAttribute("value"));
            }
        }
    }
});

Q.animations('player', {
    walk_right: { frames: [0,1], rate: 1/3},
    walk_left: { frames: [2,3], rate: 1/3},
    stand_left: { frames: [2], rate: 1/3},
    stand_right: { frames: [1], rate: 1/3}
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
            x: 110,
            y: 50,
            jumpSpeed: -580});
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

Q.scene("level2", function(stage) {
    var background = new Q.TileLayer({ dataAsset: level, layerIndex: 0, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE });
//    stage.insert(background);
//    var midground = new Q.TileLayer({ dataAsset: level, layerIndex: 2, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE });
//    stage.insert(midground);
    var rep = new Q.Repeater({asset: "clouds2.png", speedX: 0.5, speedY: 0.5 });
    stage.insert(rep);


    var world = new TileLayerProperties({ dataAsset: level, layerIndex:1,  sheet: 'tiles', tileW: 70, tileH: 70 });
    var scale = world.getSize();
    if(scale == void 0)
        scale = 1;
    stage.collisionLayer(world);
    var player = stage.insert(new Q.Player());
    var enemy = stage.insert(new Q.Enemy({ x: 700, y: 0 }));
//    var pipe = stage.insert(new Q.Pipe());
    stageMaxX = background.p.w;
    stageMaxY = background.p.h;
    if(stageMaxX * scale < screenX)
    {
//        Q.width = stageMaxX * scale;
        scale = Q.width / stageMaxX;
    }
    else if(stageMaxY * scale < screenY)
    {
//        Q.height = stageMaxY * scale;
        scale = Q.height / stageMaxY;
    }
    stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w * scale, minY: 0, maxY: background.p.h * scale});
    stage.viewport.scale = scale;
});

Q.load("tiles_map.png, autisticplayer.png, turdman.png, pipe.png, clouds2.png, " + level, function() {
    Q.sheet("tiles","tiles_map.png", { tilew: 70, tileh: 70});
    Q.sheet("player","autisticplayer.png", { tilew: 51, tileh: 70});
    Q.stageScene("level2");
});
