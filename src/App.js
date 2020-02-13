import socket from './components/client';

import ElementSwitcher from './classes/ElementSwitcher';
import Chunks, { getChunkId } from './classes/Chunks';
import Tiles from './classes/Tiles';
import CVGInterface from './classes/CVGInterface/CVGInterface';

import { getXY, binToGr } from './components/miscs';
import { tileSize } from './components/configVars';
import Chat from './classes/Chat';
import Camera from './classes/Camera';
import Highscores from './classes/Highscores';
import dirsbytype from './utils/dirsByType';
import spec from './utils/unitSpecification';
import DroidManager from './classes/Game/DroidManager';
import Droid from './classes/Game/Droid';

import Logger from './classes/Logger';

const App = () => {
  new Logger({
    playButton: document.getElementsByClassName('left-thick')[0],
    loginButton: document.getElementsByClassName('login-button')[0],
    registerButton: document.getElementById('regbtn'),
    loginNotice: document.getElementById('noticeArea'),
    registerNotice: document.getElementById('rnoticeArea'),
    loginInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    regLoginInput: document.getElementById('username_reg'),
    regPasswordInput: document.getElementById('password_reg1'),
    emailInput: document.getElementById('email'),
  });

  // misc.js
  const rowMan = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];

  const patterns = [
    [
      0, 0, 0,
      0, 0, 0,
      0, 0, 0,
    ],
    [
      0, 1, 0,
      1, 1, 1,
      0, 1, 0,
    ],
    [
      1, 0, 1,
      0, 1, 0,
      1, 0, 1,
    ],
    [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0,
    ],
  ];
  const canForm = (x, y, type) => {
    for (let i = 0; i < 9; i++) {
      const bi = map.getBlock(x + rowMan[i][0], y + rowMan[i][1]).i;
      if (bi && patterns[type][i]) return false;
    }
    return true;
  };

  Math.zmod = function (a, b) { return a - (Math.floor(a / b) * b); };

  const can = document.getElementsByTagName('canvas')[0];
  const ctx = can.getContext('2d');
  // CVGInterface.js

  // main.js
  const overlay = document.getElementById('overlay');

  const lpanel = document.getElementById('login');
  const rpanel = document.getElementById('register');
  const userPanel = document.getElementById('user');
  const menuInterface = new ElementSwitcher([
    lpanel,
    rpanel,
    userPanel,
  ]);

  const sidePanel = document.getElementsByClassName('side')[0];
  const radiationIndicator = document.getElementsByClassName('warning')[0];
  can.width = window.innerWidth;
  can.height = window.innerHeight;
  let CW = can.width;
  let CH = can.height;

  const camera = new Camera(
    can,
    tileSize * 50 - CW >> 1,
    tileSize * 50 - CH >> 1,
    32 * -100,
    32 * 100,
    32 * -100,
    32 * 100,
  );

  window.requestAnimationFrame = window.requestAnimationFrame
                              || window.webkitRequestAnimationFrame
                              || window.mozRequestAnimationFrame;

  document.onselectstart = (e) => e.preventDefault(); // prevent selection of content in document;

  const sfx = [
    'sfx/laser1.mp3',
    'sfx/explode1.mp3',
    'sfx/factory.mp3',
    'sfx/beep.mp3',
  ];
  let radiationAlarm = new Audio('sfx/radiationAlarm.mp3');
  radiationAlarm.loop = true;

  function playSFX(n, v) {
    const audio = new Audio(sfx[n]);
    audio.volume = v;
    audio.play().then();
  }

  const pressed = {
    a: false,
    s: false,
    d: false,
    w: false,
  };

  let serverConfig = {
    radiation: 0,
    safeRadius: Infinity,
  };

  function selectAll() {
    droids.forEach((u) => {
      if (u && u.team === myTeam && u.type !== 3) {
        if (selected.indexOf(u.id) === -1)selected.push(u.id);
      }
    });
  }

  document.body.onkeydown = function (evt) {
    pressed[evt.key] = true;
    if (menu.style.display !== 'none' || chat.chatting) return;
    switch (evt.key) {
      case ' ': case 'Spacebar':
        if (marking) {
          marking = false;
        } else if (selected.length > 0) {
          selected = [];
          if (!chat.chatting) evt.preventDefault();
        } else {
          selectAll();
        }
        break;
      case 'm':
        mapEnabled = !mapEnabled;
        cvgInterface.setMapEnabled(mapEnabled);
        break;
      case 'c': {
        const chatOn = document.getElementById('chat-on');
        chatOn.checked = !chatOn.checked;
        chat.setOn(chatOn.checked);
      } break;
      case 'x':
        if (selected.length <= 10 || confirm(`Are you sure to remove ${selected.length} units?`)) socket.emit('delete', selected);
        break;
      case 't':
        if (!chat.chatting) chat.input.focus();
        evt.preventDefault();
        break;
      case 'Up': pressed.ArrowUp = true; break;
      case 'Down': pressed.ArrowDown = true; break;
      case 'Left': pressed.ArrowLeft = true; break;
      case 'Right': pressed.ArrowRight = true; break;
      default: pressed.other = true;
    }
  };

  document.body.onkeyup = function (evt) {
    pressed[evt.key] = false;
    if (menu.style.display !== 'none' || chat.chatting) return;
    switch (evt.key) {
      case 'Spacebar': pressed[' '] = false; break;
      case 'Up': pressed.ArrowUp = false; break;
      case 'Down': pressed.ArrowDown = false; break;
      case 'Left': pressed.ArrowLeft = false; break;
      case 'Right': pressed.ArrowRight = false; break;
      default: pressed.other = false; break;
    }
  };

  function checkp() {
    if ((document.getElementById('password_reg1').value === document.getElementById('password_reg2').value) && (document.getElementById('agree').checked)) {
      document.getElementById('regbtn').disabled = false;
    } else {
      document.getElementById('regbtn').disabled = true;
    }
  }
  document.getElementById('password_reg1').addEventListener('input', checkp);
  document.getElementById('password_reg2').addEventListener('input', checkp);
  document.getElementById('agree').addEventListener('input', checkp);

  function backReg() {
    menuInterface.switchTo(0);
    overlay.style.display = 'none';
  }
  document.getElementById('backregbtn').addEventListener('click', backReg);

  let mx = 0; let
    my = 0;
  let smx = 0; let
    smy = 0;
  let tmx = 0; let
    tmy = 0;
  let marking = false;
  let mapDragging = false;
  let myTeam = -1;
  const moving = [];
  const droidManager = new DroidManager();
  const droids = droidManager.getDroids();
  const selected = droidManager.getSelected();
  const bigs = [];
  let onDroid = false;
  let iStart = Date.now();
  const teams = [];
  const entities = [];

  const tiles = new Tiles();
  tiles.setCanvas(can, ctx);
  tiles.setPlayers(teams);
  tiles.setEntities(entities);
  tiles.setDroidManager(droidManager);
  tiles.setCamera(camera);

  function Entity(x, y, id, lifetime, tx, ty, options) {
    this.x = x;
    this.y = y;
    this.id = id || 0;
    this.tx = tx || 0;
    this.ty = ty || 0;
    this.v = 40;
    this.lifetime = lifetime || 10;
    this.startLifetime = lifetime || 10;
    this.options = options;
  }
  Entity.prototype.draw = tiles.drawEntity;

  function clearSelect() {
    selected.splice(0);
  }
  const mapScrollX = 0;
  const mapScrollY = 0;

  function scrollToDroid(droidId) {
    const d = droids[droidId];
    if (d) camera.scrollTo(d.x * tileSize, d.y * tileSize, true);
  }

  function scrollToMyDroids() {
    droids.forEach((d, i) => {
      if (d && d.team === myTeam) {
        scrollToDroid(i);
        scrolledToMyDroids = true;
        entities.push(new Entity(d.x * 32 + 16, d.y * 32 + 16, 2, 30, 0, 0));
      }
    });
  }

  let mapEnabled = true;
  const cvgInterface = new CVGInterface();
  cvgInterface.setDroidManager(droidManager);
  cvgInterface.setCanvas(can, ctx);
  cvgInterface.setLoad(0, 0);
  cvgInterface.setNotifier(bigs);
  cvgInterface.setTiles(tiles);
  cvgInterface.setPlayers(teams);
  cvgInterface.setMarkingStatus(marking, smx, smy, mx, my);
  cvgInterface.setMapDragging(mapDragging);
  cvgInterface.setMapEnabled(mapEnabled);
  cvgInterface.setMapScroll(mapScrollX, mapScrollY);
  cvgInterface.setOnDroid(onDroid);
  cvgInterface.setCamera(camera);
  let drawFinished = true;
  function render(map, x, y, g) {
    if (drawFinished) {
      drawFinished = false;
      requestAnimationFrame(() => {
        drawFinished = true;
        const then = Date.now();

        ctx.clearRect(0, 0, CW, CH);

        tiles.drawTileMap(map, x, y, g);
        tiles.drawUnits(x, y);

        for (let i = 0; i < entities.length; i++) {
          entities[i].draw(then, x, y);
        }

        cvgInterface.draw();
        clientLoad += Math.round((Date.now() - then) / 0.3);
        cvgInterface.setLoad(serverLoad, clientLoad);
      });
    }
  }

  let map;

  function getXYV2(x, y) {
    return getXY(
      binToGr(x, y < 0 ? -y >> 2 : y),
      binToGr(y, x < 0 ? -x >> 2 : x),
    );
  }
  function preinit() {
    can.width--; // somehow this functions make rendering on canvas few times faster
    can.width++;
    map = new Chunks(getXY, tiles.tiles);
    for (let i = 0; i < 10; i++) {
      let done = false;
      do {
        const x = 45 + Math.round(Math.random() * 10);
        const y = 45 + Math.round(Math.random() * 10);
        const block = map.getBlock(x, y, true);
        if ((block.i === 0) && (block.u == null)) {
          done = true;
          droids.push(new Droid(x, y, 0));
        }
      } while (!done);
    }
    myTeam = 0;
    teams.splice(0);
    teams.push([{
      img: tiles.prepareDroidTiles(Math.random() * 255, Math.random() * 255, Math.random() * 255),
      temp: false,
    }]);
    render(map, camera.x, camera.y, true); // draw that background
  }

  tiles.fetch().then(() => {
    preinit();
  });

  function red(str) { // just span with red color
    return `<span style='color: red'>${str}</span>`;
  }

  const chat = new Chat(
    document.getElementById('chat'),
    document.getElementById('chat_input'),
    document.getElementsByClassName('msgs')[0],
  );

  const menu = document.getElementById('overlay');

  window.onresize = () => {
    can.width = window.innerWidth;
    can.height = window.innerHeight;
    CW = can.width;
    CH = can.height;
    tiles.setCanvas(can);
    render(map, camera.x, camera.y, menu.style.display === 'none');
  };

  // io stuff
  let firstLogin = true;
  let serverLoad = 0;
  let clientLoad = 0;
  const pe = document.getElementById('password');
  const out = document.getElementById('noticeArea');
  const out2 = document.getElementById('rnoticeArea');
  let scrolledToMyDroids = false;
  socket.on('err', (err) => {
    switch (err.msg) {
      case 'Temporary account created': out.innerText = 'Logging in...'; break;
      case 'Password needed': pe.classList.remove('hidden'); out.innerText = 'Type password'; break;
      case 'Wrong password': out.innerHTML = red('Wrong password or login.'); break;
      case 'Your army was destroyed!': menu.style.display = 'flex'; deinit(); out.innerText = 'Your army has been destroyed!'; break;
      case 'Kicked': menu.style.display = 'flex'; deinit(); out.innerHTML = red('You were kicked from the server.'); break;
      case 'Invalid email': out2.innerText = 'Invalid e-mail'; break;
      case 'Same email or nickname exists': out2.innerText = 'Same email or nickname exists'; break;
      case 'Register_done': out2.innerText = 'You have been registered.'; backReg(); break;
      default: out2.innerText = 'An unknown error has been occured.'; break;
    }
  });
  socket.on('disconnect', () => {
    menu.style.display = 'flex';
    out.innerText = 'Connection lost.';
    deinit();
  });


  function deleteDroid() {
    const px = this.x * 32; const
      py = this.y * 32;
    const distance = Math.hypot(px - camera.x, py - camera.y);
    map.setBlockU(this.x, this.y, null);
    droids[this.i] = null;
    entities.push(new Entity(px, py, 1, 7));
    playSFX(1, distance < 640 ? 1 : 640 / distance);
  }
  socket.on('map', (evt) => {
    camera.clearClip();
    map.data.chunks = evt.m.c;
    for (const xy in map.data.chunks) {
      const cordsNormal = xy.split(',');
      const cords = cordsNormal.map((a) => a << 10);
      map.prerenderChunk(evt.m.c[xy], cordsNormal[0], cordsNormal[1]);
      camera.clip(cords[0], cords[1]);
      camera.clip(cords[0] + 1024, cords[1] + 1024);
    }

    teams.splice(0);
    evt.t.forEach((t) => {
      if (!t || typeof t !== 'object') return;
      t.cs = t.r + t.g + t.b;
      t.img = tiles.prepareDroidTiles(t.r, t.g, t.b);
      teams.push(t);
    });
    serverConfig = evt.config;
    tiles.setSafeRadius(serverConfig.safeRadius);
    droids = [];
    for (var i = 0; i < evt.m.d.length; i++) {
      const d = evt.m.d[i];
      if (d) {
        droids[d.id] = d;
        map.setBlockU(d.x, d.y, d);
      }
    }
    chat.clear();
    for (var i = 0; i < evt.c.length; i++) {
      chat.receive(evt.c[i]);
    }
    myTeam = evt.i;
    if (firstLogin) {
      socket.on('d', (evt) => {
        const dl = evt.d;
        for (let i = 0; i < dl.length; i++) {
          if (dl[i].o) setTimeout(deleteDroid.bind(dl[i]), dl[i].o);
          else deleteDroid.apply(dl[i]);
        }
        if (!scrolledToMyDroids) scrollToMyDroids();
        // moving = evt.m;
        if (Math.abs((Date.now() - iStart) % 500) > 50) { // sets tick time offset relative to server one
          iStart = Date.now();
        }
        if (dl.length > 0) selected.forEach((id, index) => { if (!droids[id]) selected.splice(index, 1); });
        serverLoad = Math.round(evt.load);
      });
      socket.on('u', (evt) => {
        for (const i in evt) {
          const c = evt[i];
          const d = droids[c.id];
          if (d) {
            if (c.x || c.y) {
              map.setBlockU(d.x, d.y, null);
              d.lastX = d.x;
              d.lastY = d.y;
            }
            for (const k in c) {
              d[k] = c[k];
            }
            if (c.x || c.y) {
              map.setBlockU(d.x, d.y, d);
              d.maxOffset = 1;
              d.moveTime = Date.now() + 499;
              d.dir = dirsbytype[`${d.x - d.lastX},${d.y - d.lastY}`] || 2;
            } else if (c.tol) {
              d.maxOffset = 1;
              d.moveTime = Date.now() + 499;
            }
          }
        }
        // console.log("why" + JSON.stringify(evt[0]));
      });
      socket.on('nd', (evt) => {
        for (const i in evt) {
          const d = evt[i];
          droids[d.id] = d;
          map.setBlockU(d.x, d.y, d);
        }
      });
      socket.on('teams', (evt) => {
        teams.splice(0);
        evt.forEach((t) => {
          if (!t || typeof t !== 'object') return;
          t.cs = t.r + t.g + t.b;
          t.img = tiles.prepareDroidTiles(t.r, t.g, t.b);
          teams.push(t);
        });
      });
      firstLogin = false;
      socket.on('big_msg', (evt) => {
        bigs.push({ m: evt, t: 0 });
      });
      socket.on('register_done', () => {
        backReg();
      });

      socket.on('chunks', (evt) => {
        for (const id in evt.c) {
          const xy = id.split(',');
          map.data.chunks[id] = evt.c[id];
          map.prerenderChunk(map.data.chunks[id], xy[0], xy[1]);
          console.log(`got chunk ${id}`);

          const cords = id.split(',').map((a) => a << 10);
          camera.clip(cords[0], cords[1]);
          camera.clip(cords[0] + 1024, cords[1] + 1024);
        }
        for (let i = 0; i < evt.d.length; i++) {
          const d = evt.d[i];
          if (d) {
            droids[d.id] = d;
            map.setBlockU(d.x, d.y, d);
          }
        }
      });

      socket.on('attacks', (attacks) => {
        attacks.forEach((a, i) => {
          const d1 = droids[a[0]]; const
            d2 = droids[a[1]];
          if (d1 && d2) {
            setTimeout(() => {
              const px = d1.x * 32; const
                py = d1.y * 32;
              if (d1.type === 2) {
                d1.angle = Math.atan2(d2.y - d1.y, d2.x - d1.x);
                entities.push(new Entity(px - Math.sin(d1.angle) * 4, py - Math.cos(d1.angle) * 4, 0, 10, d2.x * 32, d2.y * 32));
                entities.push(new Entity(px + Math.sin(d1.angle) * 4, py + Math.cos(d1.angle) * 4, 0, 10, d2.x * 32, d2.y * 32));
              } else entities.push(new Entity(px, py, 0, 10, d2.x * 32, d2.y * 32));
              d2.hp -= a[2];
              const distance = Math.hypot(px - camera.x, py - camera.y);
              playSFX(0, distance < 640 ? 1 : 640 / distance);
            }, (d1.id << 8) / droids.length);
          }
        });
      });
      socket.on('factorized', (evt) => {
        for (let i = 0; i < evt.length; i++) {
          const d = evt[i];
          droids[d.id] = d;
          map.setBlockU(d.x, d.y, d);
          const distance = Math.hypot(d.x * 32 - camera.x, d.y * 32 - camera.y);
          playSFX(2, distance < 640 ? 1 : 640 / distance);
        }
      });
      socket.on('blocks', (evt) => {
        evt.forEach((b) => {
          const xy = getChunkId(b.x, b.y);
          const xys = xy.split(',').map((p) => p << 0);
          // if (map.exists(xys[0], xys[1])) return false;
          map.setBlock(b.x, b.y, b.id);
          map.prerenderChunk(map.data.chunks[xy], xys[0], xys[1]);
        });
      });
      socket.on('explosions', (evt) => {
        evt.forEach((e) => {
          const offset = e.timeout * 500 + e.offset;
          entities.push(new Entity(e.x * 32, e.y * 32, 3, offset + e.power, 0, 0, { power: e.power, deadLine: Date.now() + offset }));
          setTimeout(() => {
            entities.push(new Entity(e.x * 32, e.y * 32, 1, 7));
          }, offset);
          if (e.timeout) playSFX(3, 0.5);
        });
      });
      socket.on('radiation-on', () => {
        radiationIndicator.hidden = false;
        sidePanel.style.backgroundImage = 'radial-gradient(rgba(0, 0, 0, 0) 75%, red 100%)';
        radiationAlarm = new Audio('sfx/radiationAlarm.mp3');
        radiationAlarm.loop = true;
        radiationAlarm.play();
      });
      socket.on('radiation-off', () => {
        radiationIndicator.hidden = true;
        sidePanel.style.backgroundImage = 'none';
        radiationAlarm.pause();
      });
    }
    init();
    menu.style.display = 'none';
  });

  let prevClientLoad = 0;
  const loopFunc = function () {
    const then = Date.now();
    prevClientLoad = clientLoad;
    clientLoad = 0;

    if (!chat.chatting) {
      const { x, y } = camera.processScroll(pressed);
      mx += x;
      my += y;
    }

    render(map, camera.x, camera.y);

    clientLoad += Math.round((Date.now() - then) / 0.3);
  };
  let loop = 0;
  let menuOn = true;
  let gameOn = false;
  const highscores = new Highscores(document.getElementsByClassName('highscores')[0]);
  function init() {
    if (gameOn) return;
    gameOn = true;
    can.onmousedown = (evt) => {
      if (evt.altKey && evt.button !== 0) return;
      if (cvgInterface.processButtons(evt.pageX, evt.pageY, true)) return;
      if ((evt.pageX > CW - 300) && (evt.pageY > CH - 300)) { // clicks on map
        camera.scrollTo(
          (evt.pageX - CW + 300 + mapScrollX * 3) * (tileSize / 3),
          (evt.pageY - CH + 300 + mapScrollY * 3) * (tileSize / 3),
          true,
        );
        mapDragging = true;
        cvgInterface.setMapDragging(mapDragging);
      } else if ((evt.pageX > 40) || (evt.pageY > 352)) { // out of CVGInterface
        smx = evt.pageX + camera.x;
        smy = evt.pageY + camera.y;
        tmx = Math.floor(smx / tileSize);
        tmy = Math.floor(smy / tileSize);
        marking = true;
        cvgInterface.setMarkingStatus(marking, smx, smy, mx, my);
      } else { // in CVGInterface
        const id = Math.ceil((320 - evt.pageY) / 32);
        if (evt.ctrlKey) { // select only the clicked one
          selected = [selected[id]];
        } else if (evt.shiftKey) { // deselect clicked one
          selected[id] = null;
          selected = selected.filter((a) => { if (a !== null) return a; });
        } else {
          const tmp = selected[id];
          if (typeof selected[id] === 'number') {
            selected[id] = selected[0];
            selected[0] = tmp;
            scrollToDroid(selected[0]);
          }
        }
      }
    };
    can.onmouseup = function (evt) {
      if (marking) {
        const emx = evt.pageX + camera.x;
        const emy = evt.pageY + camera.y;
        const tex = Math.floor(emx / tileSize);
        const tey = Math.floor(emy / tileSize);
        let block = map.getBlock(tex, tey);
        if (block) {
          if (tmx === tex && tmy === tey) {
            const action = cvgInterface.getAction();
            switch (action) {
              case 0: {
                const { u } = block;
                if (u && (u.team === myTeam)) {
                  if (evt.ctrlKey && selected.indexOf(u.id) !== -1) {
                    const id = selected.indexOf(u.id);
                    selected[id] = null;
                    selected = selected.filter((a) => {
                      if (a !== null) return a;
                    });
                  } else {
                    if (!evt.ctrlKey) clearSelect();
                    if (selected.indexOf(u.id) === -1) selected.push(u.id);
                  }
                } else {
                  const arr = [];
                  const attack = u && (u.id !== undefined);
                  let dir = 0;
                  let w1 = 0;
                  let w2 = 0.5;
                  const dArrx = [0, 1, 0, -1];
                  const dArry = [-1, 0, 1, 0];
                  const mine = map.getBlock(tmx, tmy).i === 1;
                  for (let i = 0; i < selected.length; i++) {
                    const d = droids[selected[i]];
                    if (!d || !spec[d.type].canTarget) continue;
                    if (d && (d.team === myTeam)) {
                      if (!d.isMoving) {
                        moving.push(d);
                        d.isMoving = true;
                      }
                      d.targetX = tmx;
                      d.targetY = tmy;
                      if (attack) d.target = u.id;

                      if (!mine) {
                        do {
                          w1++;
                          tmx += dArrx[dir];
                          tmy += dArry[dir];
                          if (w1 >= w2) {
                            w1 = 0;
                            w2 += 0.5;
                            dir = (dir + 1) % 4;
                          }
                          block = map.getBlock(tmx, tmy);
                        } while (!block || (block.i === 1) || (block.u));
                      }
                      arr.push({ i: d.id, x: d.targetX, y: d.targetY });
                    }
                  }
                  if (selected.length > 0) {
                    socket.emit('action', { d: arr, i: attack ? u.id : false });
                    entities.push(new Entity(tex * tileSize + 16, tey * tileSize + 16, 2, 30, 0, 0));
                  }
                  console.log(arr);
                }
              } break;
              default: {
                if (canForm(tex, tey, action)) {
                  const actionBind = [0, 5, 5, 1];
                  const nearest = selected.slice(0).sort((a, b) => {
                    const d1 = droids[a];
                    const d2 = droids[b];
                    return Math.hypot(d1.x - tex, d1.y - tey) - Math.hypot(tex - d2.x, tey - d2.y);
                  });
                  const drs = findActorDroids(nearest, 5);
                  const data = {
                    x: tex,
                    y: tey,
                    d: drs[0],
                    type: action,
                    preferredDroids: drs.slice(1),
                  };
                  const toFilter = drs.slice(0, actionBind[action]);
                  selected = selected.filter((dr) => toFilter.indexOf(dr) === -1); // TODO make choice selected loss in options
                  socket.emit('transform', data);
                  console.log(data);
                  cvgInterface.setAction(0);
                }
              }
            }
          } else {
            const ex = Math.max(tmx, tex);
            const ey = Math.max(tmy, tey);
            const sx = Math.min(tmx, tex);
            const sy = Math.min(tmy, tey);
            if (!evt.ctrlKey)clearSelect();
            for (let i = sx; i <= ex; i++) {
              for (let j = sy; j <= ey; j++) {
                const { u } = map.getBlock(i, j);
                if (u && u.team === myTeam) {
                  if (selected.indexOf(u.id) === -1 && u.type !== 3)selected.push(u.id);
                }
              }
            }
          }
        }
        marking = false;
      }
      mapDragging = false;
      cvgInterface.setMapDragging(mapDragging);
    };
    can.onmousemove = function (evt) {
      const actionAllowed = false;
      if (!evt) return false;
      if ((evt.pageX > 40) || (evt.pageY > 352)) { // out of CVGInterface
        mx = evt.pageX + camera.x;
        my = evt.pageY + camera.y;
        const action = cvgInterface.getAction();
        const tex = Math.floor(mx / tileSize);
        const tey = Math.floor(my / tileSize);
        if (action > 0) {
          cvgInterface.lockAction(canForm(tex, tey, action), tex, tey);
        }
        const block = map.getBlock(tex, tey);
        const u = block && block.u;
        if (u) {
          onDroid = u.id;
        } else if (droids[selected[0]] && (droids[selected[0]].target !== false)) {
          onDroid = droids[selected[0]].target;
        } else onDroid = undefined;
      } else { // in CVGInterface
        const id = Math.ceil((352 - evt.pageY) / 32) - 1;
        if (selected[id]) {
          onDroid = selected[id];
        } else {
          onDroid = droids[selected[0]] ? droids[selected[0]].target : undefined;
        }
      }
      cvgInterface.setOnDroid(onDroid);

      if (mapDragging) {
        camera.scrollTo(
          (evt.pageX - CW + 300 + mapScrollX * 3) * (tileSize / 3) - CW / 2,
          (evt.pageY - CH + 300 + mapScrollY * 3) * (tileSize / 3) - CH / 2,
        );
      }

      cvgInterface.processButtons(evt.pageX, evt.pageY, false);
    };

    if (teams[myTeam].t) {
      const registerButton = cvgInterface.createCanvasButton(0, 0, 75, 20, 'Register');
      registerButton.onclick = function () {
        menuInterface.switchTo(1);
        overlay.style.display = 'flex';
        document.getElementById('username_reg').value = teams[myTeam].u;
      };
    }

    loop = setInterval(loopFunc, 30);
    menuOn = false;
    chat.setOn(document.getElementById('chat-on').checked);
    highscores.setOn(document.getElementById('hi-scores-on').checked);
    can.style.filter = 'none';


    sidePanel.onmousedown = can.onmousedown;
    sidePanel.onmouseup = can.onmouseup;
    sidePanel.onmousemove = can.onmousemove;
  }
  function deinit() {
    gameOn = false;

    scrolledToMyDroids = false;
    can.onmousedown = null;
    can.onmouseup = null;
    can.onmousemove = null;
    sidePanel.onmousedown = null;
    sidePanel.onmouseup = null;
    sidePanel.onmousemove = null;
    clearInterval(loop);
    menuOn = true;
    cvgInterface.removeButton('Register');
    clearSelect();
    can.style.filter = 'blur(2px)';
    chat.off();
    highscores.off();
  }
};

export default App;
