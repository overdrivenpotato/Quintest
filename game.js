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
        this._super(p, { asset: "player.png", x: 110, y: 50, jumpSpeed: -680});
        this.add('2d, platformerControls');
    },
    step: function(dt) {
        if(Q.inputs['left'] && this.p.direction == 'right') {
            this.p.flip = 'x';
        }
        if(Q.inputs['right']  && this.p.direction == 'left') {
            this.p.flip = false;
        }

    }
});

Q.Sprite.extend("Pipe", {
    init: function(p)
    {

    }
})

Q.scene("level1",function(stage) {
    var background = new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE });
    stage.insert(background);
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex:1,  sheet: 'tiles', tileW: 70, tileH: 70 }));
    var player = stage.insert(new Q.Player());
    stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w, minY: 0, maxY: background.p.h});
});

Q.load("tiles_map.png, player.png, level1.tmx", function() {
    Q.sheet("tiles","tiles_map.png", { tilew: 70, tileh: 70});
    Q.stageScene("level1");
});
