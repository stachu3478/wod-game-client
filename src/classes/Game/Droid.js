import spec from '../../utils/unitSpecification';

class Droid {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.hp = 50;
    this.r = 0;
    this.path = [];
    this.tm = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastTime = 0;
    this.isMoving = false;
    this.targetX = x;
    this.targetY = y;
    this.target = false;
    this.tol = 0;
    this.maxOffset = 0;
    this.team = team;
    this.dmg = false;
    this.dir = 0;
    this.type = 0;
  }

  draw(ctx, x, y) {
    let tp1;
    switch (this.type) {
      case 0: tp1 = this.dir || 0; break;
      case 1: tp1 = 4; break;
      case 2: tp1 = 5; break;
      case 3: tp1 = 6; break;
      case 4: tp1 = 7; break;
      case 5: tp1 = 9; break;
      default: tp1 = 10 + this.dir || 0; // 6
    }
    this.ctx.drawImage(this.teamObj.img[tp1], x, y);
    if (this.type === 4) {
      this.ctx.fillStyle = '#2D2A';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 16, y + 16);
      this.ctx.lineTo(x + 16, y - 4);
      this.ctx.arc(
        x + 16,
        y + 16,
        20,
        -Math.PI / 2,
        (
          1 - ((this.tol + (this.moveTime - Date.now()) / 500) / spec[this.metaMorph].transformTime)
        ) * Math.PI * 2 - Math.PI / 2,
        false,
      );
      this.ctx.fill();
    } else if (this.type === 2) {
      ctx.save();
      ctx.translate(x + 16, y + 16);
      ctx.rotate(this.angle);
      ctx.drawImage(this.teams[this.team].img[8], -24, -24);
      ctx.restore();
    }
  }

  getState() {
    if (this.isMoving) {
      return (typeof this.target !== 'number' ? 'Moving' : 'Attacking');
    }
    return 'Idle';
  }

  setTeam(team) {
    this.teamObj = team;
  }

  getTeam() {
    return this.teamObj;
  }
}

export default Droid;
