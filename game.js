/**
 * Created with JetBrains WebStorm.
 * User: Marko
 * Date: 11/16/13
 * Time: 7:46 PM
 * To change this template use File | Settings | File Templates.
 */
var Q = Quintus()
    .include("Sprites, Scenes, Input, 2D, Touch, UI")
    .setup({
        width: 960,
        height: 640
    }).controls().touch();
//load assets


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
        if(this.p.x < this.stage.minX)
            this.p.x = this.stage.minX;
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

Q.scene("level2",function(stage) {
    var background = new Q.TileLayer({ dataAsset: 'level3.tmx', layerIndex: 0, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE });
    stage.insert(background);
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level3.tmx', layerIndex:1,  sheet: 'tiles', tileW: 70, tileH: 70 }));
    var player = stage.insert(new Q.Player());
    var enemy = stage.insert(new Q.Enemy({ x: 700, y: 0 }));
    stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w, minY: 0, maxY: background.p.h});
});

Q.load("tiles_map.png, player.png, enemy.png, level3.tmx", function() {
    Q.sheet("tiles","tiles_map.png", { tilew: 70, tileh: 70});
    Q.stageScene("level2");
});
