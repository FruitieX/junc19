import Phaser from 'phaser';

class SimpleGame {
  game: Phaser.Game;

  constructor() {
    this.game = new Phaser.Game({
      width: 1920,
      height: 1080
    });
  }
}

window.onload = () => {
  const game = new SimpleGame();
};