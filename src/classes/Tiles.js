import LoadableImage from './LoadableImage';
import dirsbytype from '../utils/dirsByType';
import spec from '../utils/unitSpecification';

const bCols = ['',
  'rgb(255,0,0)',
  'rgb(224,32,0)',
  'rgb(192,64,0)',
  'rgb(160,96,0)',
  'rgb(128,128,0)',
  'rgb(96,160,32)',
  'rgb(64,192,64)',
  'rgb(32,224,96)',
];
const droidTypes = 14;
const tileSize = 32;

class Tiles {
  constructor() {
    this.dImages = [];
    this.imgArray = [];
    this.tiles = [];
    this.safeRadius = Infinity;
    this.dImagesData = [];

    this.cv2 = document.createElement('canvas'); // secondary canvas element for converting imageData to Image
    this.cv2.width = 100;
    this.cv2.height = 100;
    this.ctx2 = this.cv2.getContext('2d');

    for (let it = 1; it <= droidTypes; it++) { // import images
      this.dImages.push(new LoadableImage(`tiles/d${it}r.png`));
    }

    for (let i = 1; i < 6; i++) {
      this.tiles.push(new LoadableImage(`tiles/${i}.bmp`));
    }

    for (let i = 1; i < 8; i++) {
      this.imgArray.push(new LoadableImage(`tiles/explode${i}.png`));
    }

    for (let i = 1; i < 8; i++) {
      this.imgArray.push(new LoadableImage(`tiles/button${i}.png`));
    }

    this.imgArray.push(new LoadableImage('tiles/arrows.png'));
  }

  init() {
    this.pat1 = this.ctx.createPattern(this.tiles[0], 'repeat'); // background pattern 3x faster i hope
    this.pat2 = this.ctx.createPattern(this.tiles[4], 'repeat'); // border pattern
    this.dImages.forEach((img) => { // convert images to imageData objects
      this.ctx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);
      this.ctx.drawImage(img, 0, 0);
      this.dImagesData.push(this.ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight));
    });
  }

  async fetch() {
    await LoadableImage.fetch();
    this.init();
  }

  /* LoadableImage.fetch()
    .then(() => {
        init();
        preinit();
    }) */

  drawImg(i, x, y) {
    return this.ctx.drawImage(this.imgArray[i], x, y);
  }

  drawTile(i, x, y) {
    return this.ctx.drawImage(this.tiles[i], x, y);
  }

  drawLaser(x, y, tx, ty, cx, cy, l) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'pink';
    this.ctx.lineWidth = 5;
    let ex = 0; let
      ey = 0;
    const rx = tx - x; const
      ry = ty - y;
    const lp = (10 - l) * 40;
    const d = Math.hypot(rx, ry);
    if (l > 5) {
      this.ctx.moveTo(x - cx, y - cy);
      if (d > lp) {
        this.ctx.lineTo(x + (rx * lp) / d - cx, y + (ry * lp) / d - cy);
      } else {
        this.ctx.lineTo(tx - cx, ty - cy);
        for (let i = 0; i < 5; i++) {
          ex += Math.random() * 4 - 2;
          ey += Math.random() * 4 - 2;
          this.ctx.lineTo(tx + ex - cx, ty + ey - cy);
        }
      }
    } else {
      const sp = (5 - l) * 40;
      if (d > sp) {
        this.ctx.moveTo(x + (rx * sp) / d - cx, y + (ry * sp) / d - cy);
      } else {
        this.ctx.moveTo(tx - cx, ty - cy);
      }
      if (d > lp) {
        this.ctx.lineTo(x + (rx * lp) / d - cx, y + (ry * lp) / d - cy);
      } else {
        this.ctx.lineTo(tx - cx, ty - cy);
        for (let i = 0; i < 5; i++) {
          ex += Math.random() * 4 - 2;
          ey += Math.random() * 4 - 2;
          this.ctx.lineTo(tx + ex - cx, ty + ey - cy);
        }
      }
    }
    this.ctx.stroke();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  hpBar(p, x, y) { // not this
    const sx = x + 30;
    let sy = y + 29;
    const loops = Math.ceil(p * 8) + 1;
    for (let i = 1; i < loops; i++) {
      this.ctx.strokeStyle = bCols[i];
      this.ctx.beginPath();
      this.ctx.moveTo(sx - i, sy);
      this.ctx.lineTo(sx, sy);
      this.ctx.stroke();
      sy -= 2;
    }
  }

  // FIXME stop binding this
  drawEntity(now, cx, cy) {
    switch (this.id) {
      case 0:
        this.drawLaser(this.x + 16, this.y + 16, this.tx + 16, this.ty + 16, cx, cy, this.lifetime);
        break;
      case 1:
        this.ctx.drawImage(this.imgArray[Math.ceil(8 - this.lifetime)], this.x - cx, this.y - cy);
        break; // explode - max lifetime : 8
      case 2: {
        this.ctx.save();
        const s = this.lifetime / this.startLifetime;
        this.ctx.scale(s, s);
        this.ctx.drawImage(this.imgArray[14], (this.x - cx) / s - 48, (this.y - cy) / s - 48);
        this.ctx.restore();
      } break; // explode - max lifetime : 8
      default: { // 3
        const rem = this.options.deadLine - now;
        const rx = this.x - cx; const
          ry = this.y - cy;
        if (rem > 0) {
          this.ctx.save();
          this.ctx.fillStyle = '#FF111180';
          this.ctx.font = '16px Consolas';
          if (rx >= -32 && rx <= this.CW + 32 && ry >= -32 && ry <= CH + 32) {
            this.ctx.translate(rx + 16, ry + 16);
            this.ctx.rotate(rem / 1000);
            this.ctx.fillRect(-16, -16, 32, 32);
            this.ctx.restore();
            this.ctx.font = '16px Consolas';
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.fillText((rem / 1000).toPrecision(4), rx + 16, ry + 16);
          } else {
            const rot = Math.atan2(ry - this.CH / 2, rx - this.CW / 2);
            this.ctx.translate((this.CW >> 1), this.CH >> 1);
            this.ctx.rotate(rot);
            this.ctx.beginPath();
            this.ctx.moveTo(this.notifyRadius, -16);
            this.ctx.lineTo(this.notifyRadius + 32, 0);
            this.ctx.lineTo(this.notifyRadius, 16);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.fillStyle = 'white';
            this.ctx.translate(this.notifyRadius, 0);
            this.ctx.rotate(-rot);
            this.ctx.fillText((rem / 1000).toPrecision(4), 0, 16);
            this.ctx.fillText(
              (Math.hypot(rx - (this.CW >> 2), ry - (this.CH >> 2)) - this.notifyRadius).toPrecision(4),
              0,
              -16,
            );
          }
          this.ctx.restore();
        } else {
          this.ctx.save();
          this.ctx.lineWidth = this.options.power / -rem;
          this.ctx.strokeStyle = 'white';
          this.ctx.beginPath();
          this.ctx.arc(rx + 16, ry + 16, -(rem << 1), 0, 2 * Math.PI);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
    if (this.lifetime-- <= 0) { this.entities.splice(this.entities.indexOf(this), 1); }
  }

  prerenderTile(imgId, r, g, b) {
    const img = this.dImagesData[imgId];
    const imgData = this.ctx.createImageData(img.width, img.height);
    const dat = img.data;
    for (let i = 0; i < imgData.data.length; i += 4) {
      const base = (dat[i + 1] + dat[i + 2]) / 2;
      const m = dat[i] - base; // color strength xd
      imgData.data[i] = base + Math.round((m / 255) * r);
      imgData.data[i + 1] = base + Math.round((m / 255) * g);
      imgData.data[i + 2] = base + Math.round((m / 255) * b);
      imgData.data[i + 3] = Math.round(img.data[i + 3]);
    }
    this.ctx2.clearRect(0, 0, 100, 100);
    this.ctx2.putImageData(imgData, 0, 0);
    const img2 = new Image();
    img2.src = this.cv2.toDataURL('image/png');
    return img2;
  }

  prepareDroidTiles(r, g, b) {
    const arr = [];
    this.dImagesData.forEach((i, j) => {
      arr.push(this.prerenderTile(j, r, g, b));
    });
    return arr;
  }

  drawTileMap(map, x, y, generateIfNotExists) {
    const chunkSize = tileSize * 32;
    const coX = Math.zmod(x, chunkSize);
    const coY = Math.zmod(y, chunkSize);
    const csX = Math.floor(x / chunkSize);
    const csY = Math.floor(y / chunkSize);
    const ceX = csX + Math.ceil(this.CW / chunkSize);
    const ceY = csY + Math.ceil(this.CH / chunkSize);

    this.ctx.save(); // draw background pattern
    let moveX = -((this.camera.x) % this.tiles[0].naturalWidth);
    let moveY = -((this.camera.y) % this.tiles[0].naturalHeight);
    this.ctx.translate(moveX, moveY);
    this.ctx.fillStyle = this.pat1;
    this.ctx.fillRect(-32, -32, this.CW + 64, this.CH + 64);
    this.ctx.restore();

    for (let i = csX, px = -coX; i <= ceX; i++, px += chunkSize) { // first loop for backdrop tiles
      for (let j = csY, py = -coY; j <= ceY; j++, py += chunkSize) {
        const id = `${i},${j}`;
        const chunk = map.data.chunks[id]
                           && map.data.chunks[id].chunkImage;
        if (chunk) {
          this.ctx.drawImage(chunk, px, py);
        } else if (generateIfNotExists) {
          map.genChunk(i, j);
          this.ctx.drawImage(map.data.chunks[id].chunkImage, px, py);
        } else {
          this.ctx.fillStyle = '#0008';
          this.ctx.fillRect(px, py, 1025, 1025);
        }
      }
    }

    this.ctx.save(); // radiation border drawing
    const size = (this.safeRadius) * 32;
    moveX = -(((Date.now() >>> 6) - x) % this.tiles[4].naturalWidth);
    moveY = y % this.tiles[4].naturalHeight;
    this.ctx.translate(moveX, moveY);
    this.ctx.lineWidth = 8;
    this.ctx.strokeStyle = this.pat2;
    this.ctx.strokeRect(-size - x - moveX, -size - y - moveY, 2 * size + 32, 2 * size + 32);
    this.ctx.restore();
  }

  drawUnits(x, y) {
    const now = Date.now();
    this.droids.forEach((u) => { // second one for droids
      if (u == null) return;
      const px = u.x * tileSize - x;
      const py = u.y * tileSize - y;
      if (
        !(
          (px > -64)
                    && (px < (this.CW + 64))
                    && (py > -64)
                    && (py < (this.CH + 64))
        )
      ) return;
      let offsetX = 0;
      let offsetY = 0;
      if (u.isMoving) {
        const stamp = now < u.moveTime ? (u.moveTime - now) / 499 : 0;
        if (stamp) {
          offsetX += (u.lastX - u.x) * stamp * tileSize;
          offsetY += (u.lastY - u.y) * stamp * tileSize;
          u.maxOffset = stamp;
        }
      }
      if (u.dir) u.dir = dirsbytype[`${u.x - u.lastX},${u.y - u.lastY}`] || 0; // not NaN
      u.draw(this.ctx, px + offsetX, py + offsetY);
      u.dmg = false;
      if (this.selected.indexOf(u.id) > -1) this.hpBar((u.hp / spec[u.type].hp), px + offsetX, py + offsetY);
    });
  }

  setCanvas(canvas, ctx = false) {
    this.CW = canvas.width;
    this.CH = canvas.heigth;
    this.notifyRadius = Math.min(this.CW, this.CH) / 2;
    if (ctx) this.ctx = ctx;
  }

  setPlayers(val) {
    this.teams = val;
  }

  setEntities(val) {
    this.entities = val;
  }

  setCamera(val) {
    this.camera = val;
  }

  setSafeRadius(val) {
    this.safeRadius = val;
  }

  setDroidManager(manager) {
    this.selected = manager.getSelected();
    this.droids = manager.getDroids();
  }
}

export default Tiles;
