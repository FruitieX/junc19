import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Sprite {
  game = this.scene.game;
  keys = this.scene.input.keyboard.createCursorKeys();
  body: Phaser.Physics.Arcade.Body = this.body;

  constructor(scene: Phaser.Scene) {
    super(scene, 100, 100, 'player');
    this.scene.add.existing(this);
  }

  public create() {
    //this.scene.physics.add.sprite(100, 100, 'player');
    //this.scene.add.sprite(100, 100, 'player');
    //this.body.
  }

  public update() {
    if (this.keys.up.isDown) {
      this.body.velocity.y = 100;
    }
    if (this.keys.down.isDown) {
      this.body.velocity.y = -100;
    }
    if (this.keys.left.isDown) {
      this.body.velocity.x = -100;
    }
    if (this.keys.right.isDown) {
      this.body.velocity.x = 100;
    }
  }
}
