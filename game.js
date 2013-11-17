/**
 * Created with JetBrains WebStorm.
 * User: Marko
 * Date: 11/16/13
 * Time: 7:46 PM
 * To change this template use File | Settings | File Templates.
 */

var stageMaxX;
var stageMaxY;

var Q = Quintus()
    .include("Sprites, Scenes, Input, 2D, Touch, UI")
    .setup({
        width: 960,
        height: 640,
        downsampleWidth: 1,
        downsampleHeight: 1
//        maximize: true
    }).controls().touch();
//load assets

var level = "level3.tmx";


Q.Sprite.extend("Player",{
    init: function(p) {
        this._super(p, { asset: "player.png", x: 110, y: 50, jumpSpeed: -580});
        this.add('2d, platformerControls');
    },
    step: function(dt) {
        if(Q.inputs['left'] && this.p.direction == 'right') {
            this.p.flip = 'x';
        }
        if(Q.inputs['right']  && this.p.direction == 'left') {
            this.p.flip = false;
        }
//        if(this.vy > 0)
//            this.vx = this.vx * 2;
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
//        console.log(stageMaxY);
//        console.log(this.minX);
    }
});

Q.Sprite.extend("Enemy",{
    init: function(p) {
        this._super(p, { asset: 'enemy.png', vx: 100 });
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
        this._super(p, { asset: 'pipe.png', x: 3045, y: 280}) ;
        this.add('2d');
        this.on("bump.top", function(collision) {
            console.log(Q.inputs['down']);
            console.log(collision.obj.isA("Player"));
            if(collision.obj.isA("Player") && Q.inputs['down']) {
                Q.clearStages();
                Q.stageScene("level2");
            }
        });
    }
});

Q.scene("level2", function(stage) {
    var background = new Q.TileLayer({ dataAsset: level, layerIndex: 0, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE });
    stage.insert(background);
    stage.collisionLayer(new Q.TileLayer({ dataAsset: level, layerIndex:1,  sheet: 'tiles', tileW: 70, tileH: 70 }));
    var player = stage.insert(new Q.Player());
    var enemy = stage.insert(new Q.Enemy({ x: 700, y: 0 }));
    var pipe = stage.insert(new Q.Pipe());
    stageMaxX = background.p.w;
    stageMaxY = background.p.h;
    stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w, minY: 0, maxY: background.p.h});
});

Q.load("tiles_map.png, player.png, enemy.png, pipe.png, " + level, function() {
    Q.sheet("tiles","tiles_map.png", { tilew: 70, tileh: 70});
    Q.stageScene("level2");
//    console.log(new Q.TileLayer({ dataAsset: level, layerIndex: 2, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE }).blocks[0]);
});
