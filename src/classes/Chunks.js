import { tileSize, chunkSize } from '../components/configVars';

const chunkCanvas = document.createElement('canvas');
chunkCanvas.width = tileSize * chunkSize; // chunk size in px
chunkCanvas.height = tileSize * chunkSize;
const cctx = chunkCanvas.getContext('2d');

const tileSize2 = tileSize >> 1;

// get only id of the chunk that refers to data.chunks[id], basing of x y
export const getChunkId = (x, y) => `${Math.floor(x / chunkSize)},${Math.floor(y / chunkSize)}`;

class Chunks {
  constructor(getXY, tiles) {
    this.getXY = getXY;
    this.data = {
      chunks: {},
      gens: {},
    };
    this.tiles = tiles; // tiles used to prerender chunks
    this.init();
  }

  init() {
    // generate only first chunk.
    // Note that new chunk is generated when getBlock with g parameter as true is called
    this.genChunk(0, 0);
  }

  setChunk(x, y) {
    const c = { t: [], g: false, c: false };
    for (let i = 0; i < chunkSize; i++) {
      c.t[i] = [];
      for (let j = 0; j < chunkSize; j++) {
        c.t[i][j] = { i: 7 }; // unknown block
      }
    }
    this.data.chunks[`${x},${y}`] = c;
    console.log(`Chunk ${x} ${y} set`);
    return c;
  }

  prerenderChunk(c, x, y) { // prepare whole chunk image
    if (!c) return;
    const { t } = c;
    const deg90 = Math.PI / 2;
    for (let i = 0; i < chunkSize; i++) {
      for (let j = 0; j < chunkSize; j++) {
        const px = x * chunkSize + i; const
          py = y * chunkSize + j;
        const base = this.getXY(px, py) * tileSize;
        const directionMarker = Math.floor(base % 4);
        const scaleMarker = Math.floor((base % 1) * 4);
        const sx = scaleMarker % 2 === 0 ? 1 : -1; const
          sy = scaleMarker >> 1 === 0 ? 1 : -1;
        const block = t[i][j];
        cctx.save();
        cctx.translate(i * tileSize + tileSize2, j * tileSize + tileSize2);
        cctx.rotate(directionMarker * deg90);
        cctx.scale(sx, sy);
        cctx.drawImage(this.tiles[block.i] || this.tiles[2], -tileSize2, -tileSize2);
        cctx.restore();
      }
    }
    c.chunkImage = new Image();
    c.chunkImage.src = chunkCanvas.toDataURL('image/png');
    cctx.clearRect(0, 0, chunkCanvas.width, chunkCanvas.height);
  }

  genChunk(x, y) { // generating chunks (side depending on chunkSize)
    let c; let idx;
    if (!this.data.chunks[idx = `${x},${y}`]) {
      c = this.setChunk(x, y);
    } else {
      c = this.data.chunks[idx];
    }
    c.g = true;
    for (let i = 0; i < chunkSize; i++) {
      for (let j = 0; j < chunkSize; j++) {
        c.t[i][j] = {
          i: Math.abs(this.getXY(x * chunkSize + i, y * chunkSize + j) % 1) > 0.0625 ? 0 : 1,
        };
      }
    }
    c.g = true;
    this.prerenderChunk(c, x, y);
  }

  getBlock(x, y, g) { // getting pixels (g = true, - generate chunk while not found)
    let px; let py; let
      idx;
    if (!(this.data.chunks[idx = `${px = Math.floor(x / chunkSize)},${py = Math.floor(y / chunkSize)}`] && this.data.chunks[idx].g)) {
      if (g) {
        this.genChunk(px, py); // generate chunk if doesn't exist
      } else {
        return null;
      }
    }
    const rx = x % chunkSize; const
      ry = y % chunkSize;
    return this.data.chunks[idx].t[(rx < 0 ? rx + chunkSize : rx)][(ry < 0 ? ry + chunkSize : ry)];
  }

  setBlock(x, y, id) { // set pixels
    const b = this.data.chunks[`${Math.floor(x / chunkSize)},${Math.floor(y / chunkSize)}`];
    const rx = Math.floor(x % chunkSize);
    const ry = Math.floor(y % chunkSize);
    const bx = (rx < 0 ? rx + chunkSize : rx);
    const by = (ry < 0 ? ry + chunkSize : ry);
    try {
      b.t[bx][by] = { i: id };
    } catch (err) {
      console.log(err, `${bx}, ${by}`);
    }
  }

  setBlockU(x, y, data) { // assign unit to a specific pixel
    if (data) { if (!data.x || !data.y || data.x !== x || data.y !== y) throw new Error('Invalid map position assigment'); }
    const b = this.getBlock(x, y);
    if (b) b.u = data;
    return data;
  }

  exists(x, y) { // check for chunk existing in the data chunks
    return this.data.chunks[getChunkId(x, y)] !== undefined;
  }
}

export default Chunks;
