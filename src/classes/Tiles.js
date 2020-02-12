
const bCols = ["",
"rgb(255,0,0)",
"rgb(224,32,0)",
"rgb(192,64,0)",
"rgb(160,96,0)",
"rgb(128,128,0)",
"rgb(96,160,32)",
"rgb(64,192,64)",
"rgb(32,224,96)",
];
const droidTypes = 14;
let dImagesData = [];

class Tiles {

    constructor() {
        this.dImages = []
        this.imgArray = []
        this.tiles = []

        for (let it = 1; it <= droidTypes; it++) { // import images
            dImages.push(new LoadableImage("tiles/d" + it + "r.png"));
        }

        for (let i = 1; i < 6; i++) {
            tiles.push(new LoadableImage("tiles/" + i + ".bmp"));
        }

        for (let i = 1; i < 8; i++) {
            imgArray.push(new LoadableImage("tiles/explode" + i + ".png"));
        }

        for (let i = 1; i < 8; i++) {
            imgArray.push(new LoadableImage("tiles/button" + i + ".png"));
        }

        imgArray.push(new LoadableImage("tiles/arrows.png"));
    }

    init() {
        this.pat1 = this.ctx.createPattern(tiles[0], 'repeat'); // background pattern 3x faster i hope
        this.pat2 = ctx.createPattern(tiles[4], 'repeat'); // border pattern
        this.dImages.forEach((img) => { // convert images to imageData objects
            ctx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);
            ctx.drawImage(img, 0, 0);
            dImagesData.push(ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight));
        })
    }

    fetch() {
        return LoadableImage.fetch().then(() => {
            this.init()
        })
    }

    /*LoadableImage.fetch()
    .then(() => {
        init();
        preinit();
    })*/

    drawImg(i, x, y) {
        return this.ctx.drawImage(imgArray[i], x, y);
    }

    drawTile(i, x, y) {
        return this.ctx.drawImage(tiles[i], x, y);
    }

    drawLaser(x, y, tx, ty, cx, cy, l) {
        ctx.beginPath();
        ctx.strokeStyle = 'pink';
        ctx.lineWidth = 5;
        let ex = 0, ey = 0;
        const rx = tx - x, ry = ty - y;
        const lp = (10 - l) * 40;
        const d = Math.hypot(rx, ry);
        if (l > 5) {
            ctx.moveTo(x - cx, y - cy);
            if (d > lp) {
                ctx.lineTo(x + rx * lp / d - cx, y + ry * lp / d - cy);
            } else {
                ctx.lineTo(tx - cx, ty - cy);
                for (var i = 0; i < 5; i++) {
                    ex += Math.random() * 4 - 2;
                    ey += Math.random() * 4 - 2;
                    ctx.lineTo(tx + ex - cx, ty + ey - cy);
                }
            }
        } else {
            const sp = (5 - l) * 40;
            if (d > sp) {
                ctx.moveTo(x + rx * sp / d - cx, y + ry * sp / d - cy);
            } else {
                ctx.moveTo(tx - cx, ty - cy);
            }
            if (d > lp) {
                ctx.lineTo(x + rx * lp / d - cx, y + ry * lp / d - cy);
            } else {
                ctx.lineTo(tx - cx, ty - cy);
                for (let i = 0; i < 5; i++) {
                    ex += Math.random() * 4 - 2;
                    ey += Math.random() * 4 - 2;
                    ctx.lineTo(tx + ex - cx, ty + ey - cy);
                }
            }
        }
        ctx.stroke();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    dDroid(x, y, t, u) {
        let tp1;
        switch(u.type) {
            case 0: tp1 = u.dir || 0;break;
            case 1: tp1 = 4;break;
            case 2: tp1 = 5;break;
            case 3: tp1 = 6;break;
            case 4: tp1 = 7;break;
            case 5: tp1 = 9;break;
            case 6: tp1 = 10 + u.dir || 0;
        }
        ctx.drawImage(teams[u.team].img[tp1], x, y);
        if (u.type === 4) {
            ctx.fillStyle = '#2D2A';
            ctx.beginPath();
            ctx.moveTo(x + 16, y + 16);
            ctx.lineTo(x + 16, y - 4);
            ctx.arc(x + 16, y + 16, 20, -Math.PI / 2, (1 - ((u.tol + (u.moveTime - Date.now()) / 500) / spec[u.metaMorph].transformTime)) * Math.PI * 2 - Math.PI / 2, false);
            ctx.fill();
        } else if(u.type === 2) {
            ctx.save();
            ctx.translate(x + 16, y + 16);
            ctx.rotate(u.angle);
            ctx.drawImage(teams[u.team].img[8], -24, -24);
            ctx.restore();
        }
    }

    hpBar(p, x, y) { // not this
        var sx = x + 30;
        var sy = y + 29;
        var loops = Math.ceil(p * 8) + 1;
        for (var i = 1; i < loops; i++) {
            ctx.strokeStyle = bCols[i];
            ctx.beginPath();
            ctx.moveTo(sx - i,sy);
            ctx.lineTo(sx,sy);
            ctx.stroke();
            sy -= 2;
        }
    }

    drawEntity(now, cx, cy) {
        switch (this.id) {
            case 0:
                drawLaser(this.x + 16, this.y + 16, this.tx + 16, this.ty + 16, cx, cy, this.lifetime);
                break;
            case 1:
                ctx.drawImage(imgArray[Math.ceil(8 - this.lifetime)], this.x - cx, this.y - cy);
                break; // explode - max lifetime : 8
            case 2: {
                ctx.save();
                const s = this.lifetime / this.startLifetime;
                ctx.scale(s, s);
                ctx.drawImage(imgArray[14], (this.x - cx) / s - 48, (this.y - cy) / s - 48);
                ctx.restore();
            }break; // explode - max lifetime : 8
            case 3 : {
                const rem = this.options.deadLine - now;
                const rx = this.x - cx, ry = this.y - cy;
                if (rem > 0) {
                    ctx.save();
                    ctx.fillStyle = '#FF111180';
                    ctx.font = '16px Consolas';
                    if (rx >= -32 && rx <= CW + 32 && ry >= -32 && ry <= CH + 32) {
                        ctx.translate(rx + 16, ry + 16);
                        ctx.rotate(rem / 1000);
                        ctx.fillRect(-16, -16, 32, 32);
                        ctx.restore();
                        ctx.font = '16px Consolas';
                        ctx.fillStyle = 'white';
                        ctx.textAlign = 'center';
                        ctx.fillText((rem / 1000).toPrecision(4), rx + 16, ry + 16);
                    } else {
                        const rot = Math.atan2(ry - (CH >>> 1), rx - (CW >>> 1))
                        ctx.translate((CW >>> 1), CH >>> 1);
                        ctx.rotate(rot);
                        ctx.beginPath();
                        ctx.moveTo(notifyRadius, -16);
                        ctx.lineTo(notifyRadius + 32, 0);
                        ctx.lineTo(notifyRadius, 16);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillStyle = 'white';
                        ctx.translate(notifyRadius, 0);
                        ctx.rotate(-rot);
                        ctx.fillText((rem / 1000).toPrecision(4), 0, 16);
                        ctx.fillText((Math.hypot(rx - (CW >>> 2), ry - (CH >>> 2)) - notifyRadius).toPrecision(4), 0, -16);
                    }
                    ctx.restore();
                } else {
                    ctx.save();
                    ctx.lineWidth = this.options.power / -rem;
                    ctx.strokeStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(rx + 16, ry + 16, -(rem << 1), 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        if (this.lifetime-- <= 0) {
            delete entities[entities.indexOf(this)];
            entities = entities.filter(f);
        }
    };

    prerenderTile(imgId, r, g, b) {
        var img = dImagesData[imgId];
        var imgData = ctx.createImageData(img.width,img.height);
        var dat = img.data;
        for(var i = 0;i < imgData.data.length;i += 4){
            var base = (dat[i + 1] + dat[i + 2]) / 2;
            var m = dat[i] - base; //color strength xd
            imgData.data[i] = base + Math.round((m / 255) * r);
            imgData.data[i + 1] = base + Math.round((m / 255) * g);
            imgData.data[i + 2] = base + Math.round((m / 255) * b);
            imgData.data[i + 3] = Math.round(img.data[i + 3]);
        }
        ctx2.clearRect(0,0,100,100);
        ctx2.putImageData(imgData, 0, 0);
        var img2 = new Image();
        img2.src = cv2.toDataURL("image/png");
        return img2;
    }

    prepareDroidTiles(r, g, b) {
        var arr = [];
        for(var j = 0;j < dImagesData.length;j++){
            arr.push(prerenderTile(j,r,g,b));
        }
        return arr;
    };

    drawTileMap(map, x, y, generateIfNotExists) {
        /*var oX = Math.zmod(x, tileSize);
        var oY = Math.zmod(y, tileSize);
        var sX = Math.floor(x / tileSize);
        var sY = Math.floor(y / tileSize);
        var eX = sX + Math.ceil(CW / tileSize);
        var eY = sY + Math.ceil(CH / tileSize);*/

        const chunkSize = tileSize * 32;
        const coX = Math.zmod(x, chunkSize);
        const coY = Math.zmod(y, chunkSize);
        const csX = Math.floor(x / chunkSize);
        const csY = Math.floor(y / chunkSize);
        const ceX = csX + Math.ceil(CW / chunkSize);
        const ceY = csY + Math.ceil(CH / chunkSize);
        // console.log(coX, coY, csX, csY, ceX, ceY);

        ctx.save(); // draw background pattern
        let moveX = -((camera.x) % tiles[0].naturalWidth);
        let moveY = -((camera.y) % tiles[0].naturalHeight);
        ctx.translate(moveX, moveY);
        ctx.fillStyle = pat1;
        ctx.fillRect(-32, -32, CW + 64, CH + 64);
        ctx.restore();

        for (let i = csX, px = -coX; i <= ceX; i++, px += chunkSize) { // first loop for backdrop tiles
            for (let j = csY, py = -coY; j <= ceY; j++ , py += chunkSize) {
                const id = i + ',' + j;
                const chunk = map.data.chunks[id]
                           && map.data.chunks[id].chunkImage;
                if (chunk) {
                    ctx.drawImage(chunk, px, py);
                } else if (generateIfNotExists) {
                    map.genChunk(i, j);
                    ctx.drawImage(map.data.chunks[id].chunkImage, px, py);
                } else {
                    ctx.fillStyle = '#0008';
                    ctx.fillRect(px, py, 1025, 1025);
                }
            }
        }

        ctx.save(); // radiation border drawing
        const size = (serverConfig.safeRadius) * 32;
        moveX = -(((Date.now() >>> 6) - x) % tiles[4].naturalWidth);
        moveY = y % tiles[4].naturalHeight;
        ctx.translate(moveX, moveY);
        ctx.lineWidth = 8;
        ctx.strokeStyle = pat2;
        ctx.strokeRect(-size - x - moveX, -size - y - moveY, 2 * size + 32, 2 * size + 32);
        ctx.restore();
    };

    drawUnits(x, y) {
        const now = Date.now();
        this.droids.forEach((u) => { // second one for droids
            if (u == null) return
            const px = u.x * tileSize - x;
            const py = u.y * tileSize - y;
            if ((px > -64) && (px < (CW + 64)) && (py > -64) && (py < (CH + 64))) {
                const t = teams[u.team] || {r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)};
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
                if (isNaN(u.dir)) u.dir = dirsbytype[(u.x - u.lastX) + "," + (u.y - u.lastY)] || 0;
                dDroid(px + offsetX, py + offsetY, t, u);
                u.dmg = false;
                if (selected.indexOf(u.id) > -1) hpBar((u.hp / spec[u.type].hp), px + offsetX, py + offsetY);
            }
        })
    }

    setDroids(val) {
        this.droids = val
    }

    setCtx(val) {
        this.ctx = val
    }
}

export default Tiles