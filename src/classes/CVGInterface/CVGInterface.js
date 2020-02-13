import CanvasButton from './CanvasButton';
import spec from '../../utils/unitSpecification';

const deadValues = { undefined: 0, null: 0 };
const cardColor = 'rgba(0, 0, 0, 176)';
const tileSize = 32;
const fakeTeam = {
  r: Math.floor(Math.random() * 255),
  g: Math.floor(Math.random() * 255),
  b: Math.floor(Math.random() * 255),
};

class CVGInterface {
  constructor() {
    this.action = 0;
    this.actionAllowed = false;
    this.navsHidden = false;
    this.buttons = [];
    this.navs = [
      this.createCanvasButton(128, 0, 32, 32, 7, '#111C', '#FFF'), // game action buttons
      this.createCanvasButton(160, 0, 32, 32, 8, '#111C', '#FFF'),
      this.createCanvasButton(192, 0, 32, 32, 9, '#111C', '#FFF'),
      this.createCanvasButton(224, 0, 32, 32, 10, '#111C', '#FFF'),
    ];

    this.tip = '';

    this.navs[0].tip = 'Move units';
    this.navs[1].tip = 'Build droid factory';
    this.navs[2].tip = 'Build turret';
    this.navs[3].tip = 'Build wall';

    this.navs[0].onclick = () => { this.action = 0; };
    this.navs[1].onclick = () => { if (this.countActors() >= 5) this.action = 1; else this.bigs.push({ t: 90, m: 'You need at least 5 selected droids' }); };
    this.navs[2].onclick = () => { if (this.countActors() >= 5) this.action = 2; else this.bigs.push({ t: 90, m: 'You need at least 5 selected droids' }); };
    this.navs[3].onclick = () => { if (this.droidManager.findActorDroids(this.selected, 1)[0] !== undefined) this.action = 3; else this.bigs.push({ t: 90, m: 'You need at least 1 basic droid' }); };
  }

  countActors() {
    let n = 0;
    this.selected.forEach((s) => {
      const d = this.droids[s];
      if (d.type === 0)n++;
    });
    return n;
  }

  drawDroidCard() { // private
    if (this.onDroid && !(this.droids[this.onDroid] in deadValues)) {
      const u = this.droids[this.onDroid];
      const usernameLength = this.ctx.measureText(this.teams[u.team].u).width;
      const windowWidth = (usernameLength > 92 ? usernameLength + 40 : 128);
      const xp = this.CW - windowWidth;
      const yp = 0;
      const maxHp = spec[u.type].hp;
      this.ctx.strokeRect(xp, yp, windowWidth, 64);
      this.ctx.fillStyle = cardColor;
      this.ctx.fillRect(xp, yp, windowWidth, 64);
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(xp + 44, yp + 4, 80, 24);
      this.ctx.fillStyle = 'lime';
      this.ctx.fillRect(xp + 45, yp + 5, 78 * (u.hp / maxHp), 22);
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = 'white';
      this.ctx.font = '14px Consolas';
      this.ctx.strokeStyle = 'black';
      this.ctx.strokeText(`${u.hp} / ${maxHp}`, xp + 84, yp + 21);
      this.ctx.fillText(`${u.hp} / ${maxHp}`, xp + 84, yp + 21);
      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(u.getState(), xp + 36, yp + 46);
      this.ctx.fillText(this.teams[u.team].u, xp + 36, yp + 60);

      u.draw(this.ctx, xp, yp);

      this.ctx.strokeStyle = 'white';// square of droid selected
      this.ctx.strokeRect(u.x * tileSize - this.camera.x, u.y * tileSize - this.camera.y, 32, 32);
    }
  }

  drawSelectedDroidCard(x, y) { // private
    if (this.droids[this.selected[0]] !== undefined) {
      const xp = x || 0;
      const yp = y || 320;
      const u = this.droids[this.selected[0]];
      const maxHp = spec[u ? u.type : 0].hp;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(xp, yp, 128, 64);
      this.ctx.fillStyle = cardColor;
      this.ctx.fillRect(xp, yp, 128, 64);
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(xp + 44, yp + 4, 80, 24);
      this.ctx.fillStyle = 'lime';
      this.ctx.fillRect(xp + 45, yp + 5, 78 * (u.hp / maxHp), 22);
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = 'white';
      this.ctx.font = '14px Consolas';
      this.ctx.strokeStyle = 'black';
      this.ctx.strokeText(`${u.hp} / ${maxHp}`, xp + 84, yp + 21);
      this.ctx.fillText(`${u.hp} / ${maxHp}`, xp + 84, yp + 21);
      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(u.getState(), xp + 36, yp + 58);
    } else {
      this.ctx.strokeRect(0, 324, 40, 1);
    }
  }

  drawSelectedDroids() { // private
    if (this.selected[1]) {
      this.ctx.strokeStyle = 'lightGrey';
      this.ctx.strokeRect(0, 0, 41, 320);
      this.ctx.fillStyle = cardColor;
      this.ctx.fillRect(0, 0, 40, 325);
      this.drawSelectedDroidCard();
      this.ctx.fillStyle = 'grey';
      this.ctx.strokeStyle = 'lightGrey';
      this.ctx.fillStyle = 'green';
      for (let i = 0; i < this.selected.length; i++) {
        const u = this.droids[this.selected[i]];
        if (u !== null && u !== undefined) {
          const ypos = 320 - i * 32;
          u.draw(this.ctx, 0, ypos);
          u.dmg = false;
          const maxHp = spec[u.type].hp;
          this.ctx.fillRect(32, ypos + 32 - (u.hp * 32) / maxHp, 8, (u.hp * 32) / maxHp);
        }
      }
      const CVGInterfacePos = this.selected.indexOf(this.onDroid);
      if (CVGInterfacePos !== -1) { // CVGInterface droid frame
        this.ctx.strokeRect(0, 320 - CVGInterfacePos * 32, 32, 32);
      }
      if (this.navsHidden) this.lookNavs(false);
    } else if (this.selected[0]) {
      this.drawSelectedDroidCard(0, 1);
      const u = this.droids[this.selected[0]];
      if (u !== null && u !== undefined) {
        const ypos = 0;
        u.draw(this.ctx, 0, ypos);
        u.dmg = false;
      }
      if (this.navsHidden) this.lookNavs(false);
    } else if (!this.navsHidden) this.lookNavs(true);
  }

  drawMap() { // private
    if (this.mapEnabled) { // map drawing
      let x = this.CW - 300;
      let y = this.CH - 300;
      const tx = this.camera.x / tileSize;
      const ty = this.camera.y / tileSize;
      if (!this.mapDragging) {
        if (this.mapScrollX + 50 < tx + (this.CW / tileSize) / 2) this.mapScrollX++;
        if (this.mapScrollY + 50 < ty + (this.CH / tileSize) / 2) this.mapScrollY++;
        if (this.mapScrollX + 50 > tx + (this.CW / tileSize) / 2) this.mapScrollX--;
        if (this.mapScrollY + 50 > ty + (this.CH / tileSize) / 2) this.mapScrollY--;
      }

      this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
      this.ctx.fillRect(x, y, 300, 300);

      const px = x - this.mapScrollX * 3;
      const py = y - this.mapScrollY * 3;

      // safe zone border
      this.ctx.strokeStyle = 'yellow';
      let sx = px - this.safeRadius * 3;
      if (sx < x) sx = x;
      let sy = py - this.safeRadius * 3;
      if (sy < y) sy = y;
      const ex = px + this.safeRadius * 3;
      const ey = py + this.safeRadius * 3;
      this.ctx.strokeRect(sx, sy, ex - sx, ey - sy);

      this.ctx.strokeStyle = 'white';
      this.ctx.strokeRect(x, y, 300, 300);
      this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
      x -= this.mapScrollX * 3;
      y -= this.mapScrollY * 3;
      this.ctx.strokeRect(
        x + 3 * tx,
        y + 3 * ty,
        (3 * this.CW) / tileSize,
        (3 * this.CH) / tileSize,
      );
      this.ctx.fillRect(x + 3 * tx, y + 3 * ty, (3 * this.CW) / tileSize, (3 * this.CH) / tileSize);
      this.droids.forEach((u) => {
        if (u !== null && u.x > this.mapScrollX && u.y > this.mapScrollY) {
          const t = this.teams[u.team] || fakeTeam;
          this.ctx.fillStyle = t.dcdec || 'grey';
          this.ctx.fillRect(x + u.x * 3, y + u.y * 3, 3, 3);
        }
      });
    }
  }

  drawMarkingArea() { // private
    let txt = '';
    const tex = Math.floor(this.mx / tileSize);
    const tey = Math.floor(this.my / tileSize);
    const tmx = Math.floor(this.smx / tileSize);
    const tmy = Math.floor(this.smy / tileSize);
    if (this.marking) {
      txt = `X: ${tmx} - ${tex}, Y: ${tmy} - ${tey}`;
      this.ctx.strokeStyle = 'lime';
      this.ctx.fillStyle = 'rgba(0,128,0,0.3)';
      const sx = Math.min(this.smx, this.mx) - this.camera.x;
      const sy = Math.min(this.smy, this.my) - this.camera.y;
      const width = Math.abs(this.smx - this.mx);
      const height = Math.abs(this.smy - this.my);
      this.ctx.fillRect(sx, sy, width, height);
      this.ctx.strokeRect(sx, sy, width, height);
    } else {
      txt = `X: ${tex}, Y: ${tey}`;
    }

    txt += ` ${this.serverLoad} % / ${this.clientLoad} %`; // right down bar
    this.ctx.fillStyle = 'black';
    this.ctx.font = '12px Consolas';
    const len = this.ctx.measureText(txt).width + 2;
    this.ctx.textAlign = 'right';
    this.ctx.fillRect(this.CW - len, this.CH - 14, len, 14);
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(txt, this.CW - 1, this.CH - 1);
  }

  leftDownBar() { // private
    let txt = '';
    if (this.selected.length > 0) {
      if (this.action) {
        const arr = [
          'Droid',
          'Droid factory',
          'Turret',
          'Wall',
        ];
        txt = `${arr[this.action]} - Placement`;
      } else if (this.onDroid !== undefined) {
        if (this.droids[this.onDroid] && this.droids[this.onDroid].team === this.myTeam) {
          if (this.selected.indexOf(this.onDroid) === -1) {
            txt = 'Ctrl + click to select.';
          } else {
            txt = 'Shift + click to deselect.';
          }
        } else {
          txt = 'Click to attack.';
        }
      } else if (this.marking) {
        txt = 'Press space to cancel.';
      } else {
        txt = 'Control + click and drag to mark an another area of droid selection. Spacebar - (de)select all. Click to move units.';
      }
    } else if (this.droids[this.onDroid] && this.droids[this.onDroid].team === this.myTeam) {
      txt = 'Click to select.';
    } else if (this.marking) {
      txt = 'Press space to cancel.';
    } else {
      txt = 'Click and drag to mark an area of droid selection.';
    }
    this.ctx.fillStyle = 'black';
    const len = this.ctx.measureText(txt).width + 2;
    this.ctx.textAlign = 'left';
    this.ctx.fillRect(0, this.CH - 14, len, 14);
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(txt, 1, this.CH - 1);
  }

  drawBigNotification() { // private
    const big = this.bigs[0];
    if (big) { // render big notification
      this.ctx.globalAlpha = 0;
      if (big.t < 30) {
        this.ctx.globalAlpha = big.t / 30;
      } else if (big.t < 150) {
        this.ctx.globalAlpha = 1;
      } else if (big.t < 180) {
        this.ctx.globalAlpha = (30 - big.t) / 30;
      } else {
        this.bigs.shift();
      }
      big.t++;
      this.ctx.textAlign = 'center';
      this.ctx.font = '20px Consolas';
      this.ctx.fillText(big.m, this.CW / 2, this.CH / 4);
      this.ctx.strokeText(big.m, this.CW / 2, this.CH / 4);
      this.ctx.globalAlpha = 1;
    }
  }

  draw() {
    this.drawDroidCard();
    this.drawSelectedDroids();
    this.drawMap();
    this.drawMarkingArea();
    this.leftDownBar();
    this.drawBigNotification();
    this.drawButtons();
  }

  createCanvasButton(x, y, width, height, text, color, textColor, font, options) {
    const button = new CanvasButton();
    button.setPosition(x, y);
    button.setSize(width, height);
    button.setText(text, font);
    button.setColors(color, textColor);
    button.options = options;
    this.buttons.push(button);
    return button;
  }

  removeButton(str) { // remove button by its text or image
    this.buttons.filter((btn) => btn.text !== str);
  }

  processButtons(mouseX, mouseY, active) {
    let anyPressed = false;
    let anyFollowed = false;
    this.buttons.forEach((btn) => {
      btn.process(mouseX, mouseY, active);
      if (btn.followed) anyFollowed = true;
      if (btn.wasPressed) anyPressed = true;
      this.lastX = mouseX;
      this.lastY = mouseY;
      this.tip = btn.tip;
    });
    if (!anyFollowed) this.tip = '';

    return anyPressed;
  }

  getBtn(idx) {
    return this.buttons[idx];
  }

  drawButtons() {
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw();
    }
    if (!this.navsHidden) {
      this.ctx.fillStyle = '#08F4';
      this.ctx.fillRect(this.action * 32 + 128, 0, 32, 32);
    }

    this.ctx.fillStyle = '#222E'; // draw tip
    this.ctx.fillRect(this.lastX, this.lastY - 18, this.ctx.measureText(this.tip).width, 18);
    this.ctx.fillStyle = '#FFF';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(this.tip, this.lastX, this.lastY - 1);

    if (this.action > 0) {
      if (this.actionAllowed) {
        this.ctx.fillStyle = '#2D28';
      } else {
        this.ctx.fillStyle = '#D228';
      }
      this.ctx.fillRect(this.tileX * 32 - this.camera.x, this.tileY * 32 - this.camera.y, 32, 32);
    }
  }

  lookNavs(bool) { // private
    for (let i = 0; i < 4; i++) {
      this.navs[i].hidden = bool;
    }
    this.navsHidden = bool;
    if (!bool) this.action = 0;
  }

  lockAction(bool, tx, ty) { // private
    this.actionAllowed = bool;
    this.tileX = tx;
    this.tileY = ty;
  }

  getAction() {
    return this.action;
  }

  setTiles(val) {
    this.tiles = val;
  }

  setCanvas(canvas, context) {
    this.CW = canvas.width;
    this.CH = canvas.height;
    this.ctx = context;
  }

  setCamera(val) {
    this.camera = val;
  }

  setOnDroid(val) {
    this.onDroid = val;
  }

  setPlayers(val, me) {
    this.teams = val;
    this.myTeam = me;
  }

  setDroidManager(val) {
    this.droidManager = val;
    this.droids = val.getDroids();
    this.selected = val.getSelected();
  }

  // da big notification on the center of screen
  setNotifier(val) {
    this.bigs = val;
  }

  setMapDragging(val) {
    this.mapDragging = val;
  }

  setMapEnabled(val) {
    this.mapEnabled = val;
  }

  setMarkingStatus(val, x1, y1, x2, y2) {
    this.marking = val;
    this.sx = x1;
    this.sy = y1;
    this.smx = x2;
    this.smy = y2;
  }

  setMapScroll(x, y) {
    this.mapScrollX = x;
    this.mapScrollY = y;
  }

  setLoad(server, client) {
    this.serverLoad = server;
    this.clientLoad = client;
  }
}

export default CVGInterface;
