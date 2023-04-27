const KEYS = {
  left: 37,
  right: 39,
  space: 32,
};

const game = {
  runing: true,
  score: 0,
  width: 640,
  height: 300,
  cols: 8,
  rows: 4,
  blocks: [],
  sprites: {
    background: undefined,
    platform: undefined,
    ball: undefined,
    block: undefined,
  },

  init: function () {
    let canvas = document.getElementById('canvas');
    this.ctx = canvas.getContext('2d');
    this.ctx.font = '15px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    window.addEventListener('keydown', function (e) {
      if (e.keyCode === KEYS.left) {
        game.platform.dx = -game.platform.velocity;
      } else if (e.keyCode === KEYS.right) {
        game.platform.dx = game.platform.velocity;
      } else if (e.keyCode === KEYS.space) {
        game.platform.releaseBall();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.keyCode === KEYS.left || e.keyCode === KEYS.right) {
        game.platform.stop();
      }
    });
  },
  load: function () {
    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = './img/' + key + '.png';
    }
  },
  create: function () {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.blocks.push({
          x: 68 * col + 50,
          y: 38 * row + 35,
          width: 64,
          height: 32,
          isAlive: true,
        });
      }
    }
  },
  start: function () {
    this.init();
    this.load();
    this.create();
    this.run();
  },
  render: function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.sprites.background, 0, 0);
    this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.ctx.drawImage(
      this.sprites.ball,
      this.ball.width * this.ball.frame,
      0,
      this.ball.width,
      this.ball.height,
      this.ball.x,
      this.ball.y,
      this.ball.width,
      this.ball.height,
    );
    this.blocks.forEach((elem) => {
      if (elem.isAlive) {
        this.ctx.drawImage(this.sprites.block, elem.x, elem.y);
      }
    }, this);

    this.ctx.fillText('Счет: ' + this.score, 15, 15);
  },
  update: function () {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
    }
    if (this.platform.dx) {
      this.platform.move();
    }
    if (this.ball.dx || this.ball.dy) {
      this.ball.move();
    }
    this.blocks.forEach((elem) => {
      if (elem.isAlive) {
        if (this.ball.collide(elem)) {
          this.ball.bumpBlock(elem);
        }
      }
    });
    this.ball.checkBounds();
    this.ball.checkBounds();
  },
  run: function () {
    this.update();
    this.render();
    if (this.runing) {
      window.requestAnimationFrame(function () {
        game.run();
      });
    }
  },
  over: function (message) {
    window.alert(message);
    this.runing = false;
    window.location.reload();
  },
};
(game.ball = {
  width: 20,
  height: 20,
  frame: 0,
  x: 340,
  y: 265,
  dx: 0,
  dy: 0,
  velocity: 4,
  jump: function () {
    this.dx = -this.velocity;
    this.dy = -this.velocity;
  },
  move: function () {
    this.x += this.dx;
    this.y += this.dy;
  },
  collide: function (elem) {
    let x = this.x + this.dx;
    let y = this.y + this.dy;

    if (
      x + this.width > elem.x &&
      x < elem.x + elem.width &&
      y + this.height > elem.y &&
      y < elem.y + elem.height
    ) {
      return true;
    }
    return false;
  },
  bumpBlock: function (block) {
    this.dy *= -1;
    block.isAlive = false;
    game.score += 10;
    if (game.score >= game.blocks.length * 10) {
      game.over('Вы победили!');
    }
  },
  onTheLeftSide: function (platform) {
    return this.x + this.width / 2 < platform.x + platform.width / 2;
  },
  bumpPlatform: function (platform) {
    this.dy = -this.velocity;
    this.dx = this.onTheLeftSide(platform) ? -this.velocity : this.velocity;
  },
  checkBounds: function () {
    let x = this.x + this.dx;
    let y = this.y + this.dy;
    if (x < 0) {
      this.x = 0;
      this.dx = this.velocity;
    } else if (x + this.width > game.width) {
      this.x = game.width - this.width;
      this.dx = -this.velocity;
    } else if (y < 0) {
      this.y = 0;
      this.dy = this.velocity;
    } else if (y + this.height > game.height) {
      game.over('Вы проиграли!');
    }
  },
}),
  (game.platform = {
    x: 300,
    y: 285,
    velocity: 6,
    dx: 0,
    ball: game.ball,
    width: 100,
    height: 14,
    move: function () {
      if ((this.x <= 0 && this.dx <= 0) || (this.x + this.width >= game.width && this.dx >= 0)) {
        this.stop();
      }
      this.x += this.dx;

      if (this.ball) {
        this.ball.x += this.dx;
      }
    },
    stop: function () {
      this.dx = 0;
      if (this.ball) {
        this.ball.dx = 0;
      }
    },
    releaseBall: function () {
      if (this.ball) {
        this.ball.jump();
        this.ball = false;
      }
    },
  }),
  window.addEventListener('load', () => {
    game.start();
  });
