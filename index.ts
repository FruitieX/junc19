import Phaser from "phaser";

class SimpleGame {
  game: Phaser.Game;

  constructor() {
    this.game = new Phaser.Game({
      width: 1280,
      height: 720
    });
  }
}

window.onload = () => {
  const game = new SimpleGame();
};
