import socket from './components/client'

import ElementSwitcher from './classes/ElementSwitcher'
import Chunks from './classes/Chunks'

import LoadableImage from './classes/LoadableImage'

import { getXY, binToGr } from './components/miscs'
import { tileSize } from './components/configVars'
import Chat from './classes/Chat'
import Camera from './classes/Camera'
import Highscores from './classes/Highscores'

import Logger from './classes/Logger'

const App = () => {

const logger = new Logger ( {
    playButton: document.getElementsByClassName('left-thick')[0],
    loginButton: document.getElementsByClassName('login-button')[0],
    registerButton: document.getElementById('regbtn'),
    loginNotice: document.getElementById('noticeArea'),
    registerNotice: document.getElementById('rnoticeArea'),
    loginInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    regLoginInput: document.getElementById("username_reg"),
    regPasswordInput: document.getElementById("password_reg1"),
    emailInput: document.getElementById("email")
})

// misc.js
function isPointInBox(bx, by, width, height, x, y){
    return x > bx && x < bx + width && y > by && y < by + height;
}

const spec = [
    {
        canMove: true,
        canShot: true,
        canTarget: true,
        canMakeDroids: false,
        hp: 50,
        transformTime: 0,
    },
    {
        canMove: false,
        canShot: false,
        canTarget: false,
        canMakeDroids: true,
        hp: 200,
        transformTime: 8,
    },
    {
        canMove: false,
        canShot: true,
        canTarget: true,
        canMakeDroids: false,
        hp: 250,
        transformTime: 12,
    },
    {
        canMove: false,
        canShot: false,
        canTarget: false,
        canMakeDroids: false,
        hp: 200,
        transformTime: 16,
    },
    {
        canMove: false,
        canShot: false,
        canTarget: false,
        canMakeDroids: false,
        hp: 200,
    },
    {
        canMove: false,
        canShot: false,
        canTarget: false,
        canMakeDroids: false,
        canMine: false,
        hp: 5000,
    },
    {
        canMove: true,
        canShot: true,
        canTarget: true,
        canMakeDroids: false,
        canMine: true,
        hp: 1000,
    },
];
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
const canForm = function(x, y, type) {
    for (let i = 0; i < 9; i++) {
        const bi = map.getBlock(x + rowMan[i][0], y + rowMan[i][1]).i;
        if (bi && patterns[type][i]) return false
    }
    return true
};

// tiles.js
const can = document.getElementsByTagName("canvas")[0];
const ctx = can.getContext("2d");
const camera = new Camera(
    can,
    tileSize * 50 - CW >> 1,
    tileSize * 50 - CH >> 1,
    32 * -100,
    32 * 100,
    32 * -100,
    32 * 100
)

Math.zmod = function (a, b) { return a - (Math.floor(a / b) * b)};

// TODO import tiles and init

// CVGInterface.js
window.CVGInterface = new function(){

    var dDroid = tiles.dDroid;
    var action = 0;
    var actionAllowed = false;
    var deadValues = {undefined: 0, null: 0};

    const cardColor = "rgba(0, 0, 0, 176)"

    function drawDroidCard(){
        if (onDroid && !(droids[onDroid] in deadValues)){
            var u = droids[onDroid];
            var usernameLength = ctx.measureText(teams[u.team].u).width;
            var windowWidth = (usernameLength > 92 ? usernameLength + 40 : 128)
            var xp = CW - windowWidth;
            var yp = 0;
            var maxHp = spec[u.type].hp;
            ctx.strokeRect(xp,yp,windowWidth,64);
            ctx.fillStyle = cardColor;
            ctx.fillRect(xp,yp,windowWidth,64);
            ctx.fillStyle = "black";
            ctx.fillRect(xp + 44,yp + 4,80,24);
            ctx.fillStyle = "lime";
            ctx.fillRect(xp + 45,yp + 5,78 * (u.hp / maxHp),22);
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.font = '14px Consolas';
            ctx.strokeStyle = "black";
            ctx.strokeText(u.hp + " / " + maxHp,xp + 84,yp + 21);
            ctx.fillText(u.hp + " / " + maxHp,xp + 84,yp + 21);
            ctx.textAlign = "left";
            ctx.fillStyle = "white";
            ctx.fillText((u.isMoving ? (typeof u.target !== 'number' ? "Moving" : "Attacking") : "Idle"), xp + 36, yp + 46);
            ctx.fillText(teams[u.team].u,xp + 36,yp + 60);

            var t = teams[u.team] || {r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)};
            dDroid(xp,yp,t,u);

            ctx.strokeStyle = "white";//square of droid selected
            ctx.strokeRect(u.x * tileSize - camera.x, u.y * tileSize - camera.y, 32, 32);
        }
    }

    var navsHidden = false;
    function drawSelectedDroidCard(x, y){
        if(droids[selected[0]] !== undefined){
            var xp = x || 0;
            var yp = y || 320;
            var u = droids[selected[0]];
            var maxHp = spec[u ? u.type : 0].hp;
            ctx.lineWidth = 2;
            ctx.strokeRect(xp,yp,128,64);
            ctx.fillStyle = cardColor;
            ctx.fillRect(xp,yp,128,64);
            ctx.fillStyle = "black";
            ctx.fillRect(xp + 44,yp + 4,80,24);
            ctx.fillStyle = "lime";
            ctx.fillRect(xp + 45,yp + 5,78 * (u.hp / maxHp),22);
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.font = '14px Consolas';
            ctx.strokeStyle = "black";
            ctx.strokeText(u.hp + " / " + maxHp,xp + 84,yp + 21);
            ctx.fillText(u.hp + " / " + maxHp,xp + 84,yp + 21);
            ctx.textAlign = "left";
            ctx.fillStyle = "white";
            ctx.fillText((u.isMoving ? (typeof u.target !== 'number' ? "Moving" : "Attacking") : "Idle"),xp + 36,yp + 58);
        }else{
            ctx.strokeRect(0,324,40,1);
        }
    }

    function drawSelectedDroids(){
        if (selected[1]) {
            ctx.strokeStyle = "lightGrey";
            ctx.strokeRect(0,0,41,320);
            ctx.fillStyle = cardColor;
            ctx.fillRect(0,0,40,325);
            drawSelectedDroidCard();
            ctx.fillStyle = "grey";
            ctx.strokeStyle = "lightGrey";
            ctx.fillStyle = "green";
            for (var i = 0;i < selected.length;i++) {
                var u = droids[selected[i]];
                if(u !== null && u !== undefined){
                    var ypos = 320 - i * 32;
                    var t = teams[u.team] || {r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)};
                    dDroid(0,ypos,t,u);
                    u.dmg = false;
                    var maxHp = spec[u.type].hp;
                    ctx.fillRect(32, ypos + 32 - u.hp * 32 / maxHp,8,u.hp * 32 / maxHp);
                }
            }
            var CVGInterfacePos = selected.indexOf(onDroid);
            if (CVGInterfacePos !== -1) {//CVGInterface droid frame
                ctx.strokeRect(0, 320 - CVGInterfacePos * 32, 32, 32);
            }
            if(navsHidden)lookNavs(false);
        } else if (selected[0]) {
            drawSelectedDroidCard(0, 1);
            var u = droids[selected[0]];
            if (u !== null && u !== undefined) {
                var ypos = 0;
                var t = teams[u.team] || {r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)};
                dDroid(0,ypos,t,u);
                u.dmg = false;
            }
            if(navsHidden)lookNavs(false);
        } else {
            if(!navsHidden)lookNavs(true);
        }
    }

    function drawMap() {
        if (mapEnabled) { //map drawing
            let x = CW - 300;
            let y = CH - 300;
            const tx = camera.x / tileSize;
            const ty = camera.y / tileSize;
            if (!mapDragging) {
                if (mapScrollX + 50 < tx + (CW / tileSize) / 2) mapScrollX++;
                if (mapScrollY + 50 < ty + (CH / tileSize) / 2) mapScrollY++;
                if (mapScrollX + 50 > tx + (CW / tileSize) / 2) mapScrollX--;
                if (mapScrollY + 50 > ty + (CH / tileSize) / 2) mapScrollY--;
            }

            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(x, y, 300, 300);

            const px = x - mapScrollX * 3;
            const py = y - mapScrollY * 3;

            // safe zone border
            ctx.strokeStyle = 'yellow';
            let sx = px - serverConfig.safeRadius * 3;
            if (sx < x) sx = x;
            let sy = py - serverConfig.safeRadius * 3;
            if (sy < y) sy = y;
            let ex = px + serverConfig.safeRadius * 3;
            let ey = py + serverConfig.safeRadius * 3;
            ctx.strokeRect(sx, sy, ex - sx, ey - sy);

            ctx.strokeStyle = "white";
            ctx.strokeRect(x, y, 300, 300);
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            x -= mapScrollX * 3;
            y -= mapScrollY * 3;
            ctx.strokeRect(x + 3 * tx, y + 3 * ty, 3 * CW / tileSize, 3 * CH / tileSize);
            ctx.fillRect(x + 3 * tx, y + 3 * ty, 3 * CW / tileSize, 3 * CH / tileSize);
            for(var i in droids){
                var u = droids[i];
                if(u !== null && u.x > mapScrollX && u.y > mapScrollY){
                    var t = teams[u.team] || {r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)};
                    ctx.fillStyle = t.dcdec || "grey";
                    ctx.fillRect(x + u.x * 3,y + u.y * 3,3,3);
                }
            }
        }
    }

    function drawMarkingArea() {
        var txt = "";
        var tex = Math.floor(mx / tileSize);
        var tey = Math.floor(my / tileSize);
        if (marking) {
            txt = "X: " + tmx + " - " + tex + ", Y: " + tmy + " - " + tey;
            ctx.strokeStyle = "lime";
            ctx.fillStyle = "rgba(0,128,0,0.3)";
            var sx = Math.min(smx, mx) - camera.x;
            var sy = Math.min(smy, my) - camera.y;
            var width = Math.abs(smx - mx);
            var height = Math.abs(smy - my);
            ctx.fillRect(sx, sy, width, height);
            ctx.strokeRect(sx, sy, width, height);
        } else {
            txt = "X: " + tex + ", Y: " + tey;
        }

        txt += " " + serverLoad + " % / " + prevClientLoad + " %"; // right down bar
        ctx.fillStyle = "black";
        ctx.font = "12px Consolas";
        var len = ctx.measureText(txt).width + 2;
        ctx.textAlign = "right";
        ctx.fillRect(CW - len, CH - 14, len, 14);
        ctx.fillStyle = "white";
        ctx.fillText(txt, CW - 1, CH - 1);
    }

    function leftDownBar(){
        var txt = "";
        if(selected.length > 0){
            if(action){
                let arr = [
                    'Droid',
                    'Droid factory',
                    'Turret',
                    'Wall',
                ];
                txt = arr[action] + " - Placement";
            }else if(onDroid !== undefined){
                if(droids[onDroid] && droids[onDroid].team === myTeam){
                    if(selected.indexOf(onDroid) === -1){
                        txt = "Ctrl + click to select.";
                    }else{
                        txt = "Shift + click to deselect.";
                    }
                }else{
                    txt = "Click to attack.";
                }
            }else{
                if(marking){
                    txt = "Press space to cancel.";
                }else{
                    txt = "Control + click and drag to mark an another area of droid selection. Spacebar - (de)select all. Click to move units.";
                }
            }
        }else{
            if(droids[onDroid] && droids[onDroid].team === myTeam){
                txt = "Click to select.";
            }else{
                if(marking){
                    txt = "Press space to cancel.";
                }else{
                    txt = "Click and drag to mark an area of droid selection.";
                }
            }
        }
        ctx.fillStyle = "black";
        var len = ctx.measureText(txt).width + 2;
        ctx.textAlign = "left";
        ctx.fillRect(0,CH - 14,len,14);
        ctx.fillStyle = "white";
        ctx.fillText(txt,1,CH - 1);
    }

    function drawBigNotification(){
        var big = bigs[0];
        if(big){//render big notification
            ctx.globalAlpha = 0;
            if(big.t < 30){
                ctx.globalAlpha = big.t / 30;
            }else if(big.t < 150){
                ctx.globalAlpha = 1;
            }else if(big.t < 180){
                ctx.globalAlpha = (30 - big.t) / 30;
            }else{
                bigs.shift();
            }
            big.t++;
            ctx.textAlign = "center";
            ctx.font = '20px Consolas';
            ctx.fillText(big.m,CW / 2,CH / 4);
            ctx.strokeText(big.m,CW / 2,CH / 4);
            ctx.globalAlpha = 1;
        }
    }

    this.draw = function(){
        drawDroidCard();
        drawSelectedDroids();
        drawMap();
        drawMarkingArea();
        leftDownBar();
        drawBigNotification();
        drawButtons();
    };

    var buttons = [];
    this.createCanvasButton = function(x, y, width, height, text, color, textColor, font, options){
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.text = text || 'I\'m a button! ;d';
        this.color = color || 'black';
        this.textColor = textColor || 'white';
        this.font = font || '16px Consolas';
        this.tip = '';
        this.onclick = function(){};
        this.wasPressed = false;
        this.followed = false;
        this.hidden = false;
        this.options = Object(options);
        buttons.push(this);
    };

    this.createCanvasButton.prototype.draw = function(){
        if(!this.hidden) {
            const xPos = this.options.stickRight ? CW - this.x - this.width : this.x;
            ctx.font = this.font;
            ctx.fillStyle = this.color;
            ctx.fillRect(xPos, this.y ,this.width, this.height);
            ctx.fillStyle = this.textColor;
            ctx.strokeRect(xPos, this.y ,this.width, this.height);
            ctx.textAlign = 'center';
            if (typeof this.text === 'string')
                ctx.fillText(this.text, xPos + this.width / 2, this.y + this.height / 2);
            else
                tiles.drawImg(this.text, xPos, this.y);
            if (this.wasPressed) {
                ctx.fillStyle = '#0004';
                ctx.fillRect(xPos, this.y, this.width, this.height);
            } else if (this.followed) {
                ctx.fillStyle = '#FFF4';
                ctx.fillRect(xPos, this.y, this.width, this.height);
            }
        }
    };

    this.createCanvasButton.prototype.tip = "";

    this.removeButton = function(str){
        buttons.filter(function(btn){return btn.text !== str});
    };

    this.processButtons = function(mouseX, mouseY, active){
        var anyPressed = false;
        var anyFollowed = false;
        for(var i = 0; i < buttons.length; i++){
            var btn = buttons[i];
            if(btn.hidden)continue;
            if(isPointInBox(btn.x, btn.y, btn.width, btn.height, mouseX, mouseY)) {
                if(active) {
                    if (!btn.wasPressed) {
                        btn.onclick();
                        btn.wasPressed = true;
                        anyPressed = true;
                    }
                }else{
                    btn.wasPressed = false;
                }
                btn.followed = true;
                anyFollowed = true;
                lastX = mouseX;
                lastY = mouseY;
                tip = btn.tip;
            }else{
                btn.followed = false;
                btn.wasPressed = false;
            }
        }
        if(!anyFollowed)tip = '';

        return anyPressed;
    };

    this.getBtn = function(idx){
        return buttons[idx];
    };

    let tip = '';
    let lastX, lastY;
    let tileX, tileY;
    function drawButtons(){
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].draw();
        }
        if (!navsHidden) {
            ctx.fillStyle = '#08F4';
            ctx.fillRect(action * 32 + 128, 0, 32, 32);
        }

        ctx.fillStyle = '#222E'; // draw tip
        ctx.fillRect(lastX, lastY - 18, ctx.measureText(tip).width, 18);
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'left';
        ctx.fillText(tip, lastX, lastY - 1);

        if (action > 0) {
            if (actionAllowed) {
                ctx.fillStyle = '#2D28'
            } else {
                ctx.fillStyle = '#D228'
            }
            ctx.fillRect(tileX * 32 - camera.x, tileY * 32 - camera.y, 32, 32);
        }
    }

    let navs = [
        new this.createCanvasButton(128, 0, 32, 32, 7, '#111C', '#FFF'), // game action buttons
        new this.createCanvasButton(160, 0, 32, 32, 8, '#111C', '#FFF'),
        new this.createCanvasButton(192, 0, 32, 32, 9, '#111C', '#FFF'),
        new this.createCanvasButton(224, 0, 32, 32, 10, '#111C', '#FFF'),
    ];

    /*let options = [
        new this.createCanvasButton(0, 224, 32, 32, 11, '#111C', '#FFF', '', {stickRight: true}),
        new this.createCanvasButton(0, 256, 32, 32, 12, '#111C', '#FFF', '', {stickRight: true}),
        new this.createCanvasButton(0, 288, 32, 32, 13, '#111C', '#FFF', '', {stickRight: true}),
    ];*/

    navs[0].tip = 'Move units';
    navs[1].tip = 'Build droid factory';
    navs[2].tip = 'Build turret';
    navs[3].tip = 'Build wall';

    navs[0].onclick = () => {action = 0};
    navs[1].onclick = () => {if(countActors() >= 5)action = 1; else bigs.push({t: 90, m: 'You need at least 5 selected droids'})};
    navs[2].onclick = () => {if(countActors() >= 5)action = 2; else bigs.push({t: 90, m: 'You need at least 5 selected droids'})};
    navs[3].onclick = () => {if(findActorDroids(selected, 1)[0] !== undefined)action = 3; else bigs.push({t: 90, m: 'You need at least 1 basic droid'})};

    function lookNavs(bool){
        for(var i = 0; i < 4; i++){
            navs[i].hidden = bool;
        }
        navsHidden = bool;
        if(!bool)action = 0;
    }

    this.lockAction = function(bool, tx, ty){
        actionAllowed = bool;
        tileX = tx;
        tileY = ty;
    };

    this.getAction = function(){
        return action;
    };
    this.setAction = function(a){
        action = a;
    }
}();

// main.js
const overlay = document.getElementById("overlay");

const lpanel = document.getElementById("login");
const rpanel = document.getElementById("register");
const userPanel = document.getElementById("user");
const menuInterface = new ElementSwitcher([
    lpanel,
    rpanel,
    userPanel
])

const sidePanel = document.getElementsByClassName('side')[0];
const radiationIndicator = document.getElementsByClassName('warning')[0];
can.width = window.innerWidth;
can.height = window.innerHeight;
var CW = can.width;
var CH = can.height;
let notifyRadius = Math.min(CW, CH) >>> 2;

var cv2 = document.createElement("canvas"); // secondary canvas element for converting imageData to Image
cv2.width = 100;
cv2.height = 100;
var ctx2 = cv2.getContext("2d");

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

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

window.onresize = function() {
	can.width = window.innerWidth;
	can.height = window.innerHeight;
	CW = can.width;
	CH = can.height;
	notifyRadius = Math.min(CW, CH) >>> 2;
	render(map, camera.x, camera.y, menu.style.display === 'none');
};

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

function f(v) { // internet explorer why
	return v
}

function selectAll() {
	for(var i in droids){
		var u = droids[i];
		if(u && u.team === myTeam && u.type !== 3){
			if(selected.indexOf(u.id) === -1)selected.push(u.id);
		}
	}
}

function countActors() {
	var n = 0;
	for(var i in selected){
		var d = droids[selected[i]];
		if(d.type === 0)n++
	}
	return n;
}

function findActorDroids(selected, quantity) {
	var n = 0;
	var ds = [];
	for(var i in selected){
		var d = droids[selected[i]];
		if(d.type === 0){
			ds.push(d.id);
			if(++n >= quantity)return ds;
		}
	}
	return ds;
}

document.body.onkeydown = function(evt) {
	pressed[evt.key] = true;
	if (menu.style.display !== 'none' || chat.chatting) return;
	switch(evt.key){
	case " ": case "Spacebar": {
		if (marking) {
			marking = false;
		}else if (selected.length > 0) {
			selected = [];
			if (!chat.chatting) evt.preventDefault();
		}else{
			selectAll();
		}
	}break;
	case "m": {
		mapEnabled = !mapEnabled;
	}break;
		case "c" : {
			const chatOn = document.getElementById("chat-on");
			chatOn.checked = !chatOn.checked;
            chat.setOn(chatOn.checked)
		}break;
		case "x" : {
			if (selected.length <= 10 || confirm(`Are you sure to remove ${selected.length} units?`)) socket.emit('delete', selected);
		}break;
        case 't': {
            if (!chat.chatting) chat.input.focus();
            evt.preventDefault()
        }break;
		case 'Up': {
			pressed.ArrowUp = true;
		}break;
		case 'Down': {
			pressed.ArrowDown = true;
		}break;
		case 'Left': {
			pressed.ArrowLeft = true;
		}break;
		case 'Right': {
			pressed.ArrowRight = true;
		}break;
	}
};

document.body.onkeyup = function(evt){
	pressed[evt.key] = false;
	if(menu.style.display !== 'none' || chat.chatting)return;
	switch(evt.key){
		case "Spacebar":{
			pressed[' '] = false;
		}break;
		case "Up":{
			pressed.ArrowUp = false;
		}break;
		case "Down":{
			pressed.ArrowDown = false;
		}break;
		case 'Left':{
			pressed.ArrowLeft = false;
		}break;
		case 'Right':{
			pressed.ArrowRight = false;
		}break;
	}
};

function checkp() {
	if ((document.getElementById("password_reg1").value === document.getElementById("password_reg2").value) && (document.getElementById("agree").checked)) {
		document.getElementById("regbtn").disabled = false;
	} else {
		document.getElementById("regbtn").disabled = true;
	}
}
document.getElementById('password_reg1').addEventListener('input', checkp);
document.getElementById('password_reg2').addEventListener('input', checkp);
document.getElementById('agree').addEventListener('input', checkp);

function backReg() {
	menuInterface.switchTo(0);
    overlay.style.display = "none";
}
document.getElementById('backregbtn').addEventListener('click', backReg);

const dirsbytype = {
	
	"0,-1": 0,
	"0,1": 2,
	"1,0": 1,
	"-1,0": 3,
	"NaN,NaN": 0,
};

let mx = 0, my = 0;
let smx = 0, smy = 0;
let tmx = 0, tmy = 0;
let marking = false;
let mapDragging = false;
let myTeam = -1;
let selected = [];
let oSelected = {};
let moving = [];
let droids = [];
let onDroid = false;
const bigs = [];
let iStart = Date.now();
let teams = [];

function Entity(x, y, id, lifetime, tx, ty, options){
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
let entities = [];

function clearSelect(){
	oSelected = {};
	selected = [];
}
let mapScrollX = 0;
let mapScrollY = 0;

function scrollToDroid (droidId) {
	const d = droids[droidId];
	if (d) camera.scrollTo(d.x * tileSize, d.y * tileSize, true)
}

function scrollToMyDroids () {
	for (let i in droids) {//scrolls to your army
		const d = droids[i];
		if (d && d.team === myTeam) {
			scrollToDroid(i);
			scrolledToMyDroids = true;
			entities.push(new Entity(d.x * 32 + 16, d.y * 32 + 16, 2, 30, 0, 0));
		}
	}
}

let mapEnabled = true;
let drawFinished = true;
function render(map, x, y, g){
    if (drawFinished) {
        drawFinished = false;
        requestAnimationFrame(() => {
            drawFinished = true;
            const then = Date.now();

            ctx.clearRect(0,0, CW, CH);

            tiles.drawTileMap(map, x, y, g);
            tiles.drawUnits(x, y);

            for (let i = 0; i < entities.length; i++) {
                entities[i].draw(then, x, y);
            }

            CVGInterface.draw();
            clientLoad += Math.round((Date.now() - then) / 0.3);
        })
    }
}
function Droid(x, y, team, type = 0) {
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

let map;
function getXYV2 (x, y) {
    return getXY (
        binToGr(x, y < 0 ? -y >> 2 : y),
        binToGr(y, x < 0 ? -x >> 2 : x)
    )
}
function preinit() {
	can.width--; // somehow this functions make rendering on canvas few times faster
	can.width++;
	map = new Chunks(getXY, tiles.tiles)
	for (let i = 0;i < 10;i++) {
        let done = false
		do {
			const x = 45 + Math.round(Math.random() * 10);
			const y = 45 + Math.round(Math.random() * 10);
			const block = map.getBlock(x, y, true);
			if ((block.i === 0) && (block.u == null)) {
				done = true;
				droids.push(new Droid(x, y,0));
			}
		} while (!done);
	}
	myTeam = 0;
	teams = [{img: tiles.prepareDroidTiles(Math.random() * 255, Math.random() * 255,Math.random() * 255), temp: false}];
	render(map, camera.x, camera.y, true); // draw that background
}
function red(str) { // just span with red color
	return "<span style='color: red'>" + str +  "</span>";
}

const chat = new Chat(
    document.getElementById('chat'),
    document.getElementById('chat_input'),
    document.getElementsByClassName('msgs')[0]
)

//io stuff
var firstLogin = true;
var serverLoad = 0;
var clientLoad = 0;
var ue = document.getElementById("username");
var pe = document.getElementById("password");
var out = document.getElementById('noticeArea');
var out2 = document.getElementById('rnoticeArea');
var menu = document.getElementById('overlay');
var scrolledToMyDroids = false;
socket.on("err",function(err) {
	switch(err.msg){
		case "Temporary account created": {out.innerText = "Logging in..."};break;
		case "Password needed": {pe.classList.remove('hidden');out.innerText = "Type password"};break;
		case "Wrong password": {out.innerHTML = red("Wrong password or login.")};break;
		case "Your army was destroyed!": {menu.style.display = 'flex';deinit();out.innerText = "Your army has been destroyed!"};break;
		case "Kicked": {menu.style.display = 'flex';deinit();out.innerHTML = red("You were kicked from the server.")};break;
		case "Invalid email": {out2.innerText = "Invalid e-mail"};break;
		case "Same email or nickname exists": {out2.innerText = "Same email or nickname exists"};break;
		case "Register_done": {out2.innerText = "You have been registered.";backReg()};break;
	}
});
socket.on("disconnect",function(evt){
	menu.style.display = 'flex';
	out.innerText = "Connection lost.";
	deinit();
});


function deleteDroid() {
	const px = this.x * 32, py = this.y * 32;
	const distance = Math.hypot(px - camera.x, py - camera.y);
	map.setBlockU(this.x, this.y, null);
	droids[this.i] = null;
	entities.push(new Entity(px, py, 1, 7));
	playSFX(1, distance < 640 ? 1 : 640 / distance);
}
socket.on("map", function (evt) {

	camera.clearClip();
	map.data.chunks = evt.m.c;
	for (let xy in map.data.chunks) {
		let cordsNormal = xy.split(',');
		const cords = cordsNormal.map((a) => a << 10);
		map.prerenderChunk(evt.m.c[xy], cordsNormal[0], cordsNormal[1]);
		camera.clip(cords[0], cords[1])
		camera.clip(cords[0] + 1024, cords[1] + 1024)
	}

	teams = evt.t;
	serverConfig = evt.config;
	droids = [];
	for (var i = 0; i < evt.m.d.length; i++) {
		var d = evt.m.d[i];
		if (d) {
			droids[d.id] = d;
			map.setBlockU(d.x, d.y, d);
		}
	}
	for (let t of teams) {
		if (!t || typeof t !== 'object') continue;
		t.cs = t.r + t.g + t.b;
		t.img = tiles.prepareDroidTiles(t.r, t.g, t.b);
	}
	chat.clear();
	for (var i = 0;i < evt.c.length;i++) {
		chat.receive(evt.c[i]);
	}
	myTeam = evt.i;
	if (firstLogin) {
		socket.on("d",function(evt) {
			var dl = evt.d;
			for (var i = 0;i < dl.length;i++) {
				if (dl[i].o) setTimeout(deleteDroid.bind(dl[i]), dl[i].o)
				else deleteDroid.apply(dl[i]);
			}
			if (!scrolledToMyDroids) scrollToMyDroids();
			//moving = evt.m;
			if (Math.abs((Date.now() - iStart) % 500) > 50) { // sets tick time offset relative to server one
				iStart = Date.now();
			}
			if (dl.length > 0)selected = selected.filter((id) => droids[id]);
			serverLoad = Math.round(evt.load);
		});
		socket.on("u", function (evt) {
			for (let i in evt) {
				const c = evt[i];
				const d = droids[c.id];
				if (d) {
					if (c.x || c.y) {
						map.setBlockU(d.x, d.y, null);
						d.lastX = d.x;
						d.lastY = d.y;
					}
					for (let k in c) {
						d[k] = c[k];
					}
					if (c.x || c.y) {
						map.setBlockU(d.x, d.y, d);
						d.maxOffset = 1;
						d.moveTime = Date.now() + 499;
						d.dir = dirsbytype[(d.x - d.lastX) + "," + (d.y - d.lastY)] || 2;
					} else if (c.tol) {
						d.maxOffset = 1;
						d.moveTime = Date.now() + 499;
					}
				}
			}
			//console.log("why" + JSON.stringify(evt[0]));
		});
		socket.on("nd", function(evt) {
			for (var i in evt) {
				var d = evt[i];
				droids[d.id] = d;
				map.setBlockU(d.x, d.y, d);
			}
		});
		socket.on("teams",function(evt) {
			
			teams = evt;
			for (let t of teams) {
				if (!t || typeof t !== 'object') continue;
				t.cs = t.r + t.g + t.b;
				t.img = tiles.prepareDroidTiles(t.r, t.g, t.b);
			}
		});
		firstLogin = false;
		socket.on('big_msg',function(evt) {
			bigs.push({m: evt, t: 0});
		});
		socket.on('register_done',function() {
			backReg();
		});

		socket.on('chunks',function(evt) {
            for (var id in evt.c) {
            	const xy = id.split(',');
                map.data.chunks[id] = evt.c[id];
                map.prerenderChunk(map.data.chunks[id], xy[0], xy[1]);
                console.log('got chunk ' + id);

				let cords = id.split(',').map((a) => a << 10);
				camera.clip(cords[0], cords[1])
				camera.clip(cords[0] + 1024, cords[1] + 1024)
            }
			for (var i = 0; i < evt.d.length; i++) {
				var d = evt.d[i];
				if(d){
					droids[d.id] = d;
					map.setBlockU(d.x, d.y, d);
				}
			}
		});

		socket.on('attacks', (attacks) => {
            attacks.forEach((a, i) => {
                var d1 = droids[a[0]], d2 = droids[a[1]];
				if (d1 && d2) {
                    setTimeout(() => {
                        const px = d1.x * 32, py = d1.y * 32;
                        if (d1.type === 2) {
                            d1.angle = Math.atan2(d2.y - d1.y, d2.x - d1.x);
                            entities.push(new Entity(px - Math.sin(d1.angle) * 4, py - Math.cos(d1.angle) * 4, 0, 10, d2.x * 32, d2.y * 32));
                            entities.push(new Entity(px + Math.sin(d1.angle) * 4, py + Math.cos(d1.angle) * 4, 0, 10, d2.x * 32, d2.y * 32));
                        } else entities.push(new Entity(px, py, 0, 10, d2.x * 32, d2.y * 32));
                        d2.hp -= a[2];
                        const distance = Math.hypot(px - camera.x, py - camera.y);
                        playSFX(0, distance < 640 ? 1 : 640 / distance);
                    }, (d1.id << 8) / droids.length)
				}
            })
		});
		socket.on('factorized', function(evt) {
			for (var i = 0; i < evt.length; i++) {
				var d = evt[i];
				droids[d.id] = d;
				map.setBlockU(d.x, d.y, d);
				const distance = Math.hypot(d.x * 32 - camera.x, d.y * 32 - camera.y);
				playSFX(2, distance < 640 ? 1 : 640 / distance);
			}
		});
		socket.on('blocks', function(evt) {
			evt.forEach(function(b) {
				const xy = map.getChunk(b.x, b.y);
				const xys = xy.split(',').map(p => p << 0);
				// if (map.exists(xys[0], xys[1])) return false;
				map.setBlock(b.x, b.y, b.id);
				map.prerenderChunk(map.data.chunks[xy], xys[0], xys[1])
			})
		});
		socket.on('explosions', function(evt) {
			evt.forEach((e) => {
				const offset = e.timeout * 500 + e.offset;
				entities.push(new Entity(e.x * 32, e.y * 32, 3, offset + e.power, 0, 0, {power: e.power, deadLine: Date.now() + offset}));
				setTimeout(() => {
					entities.push(new Entity(e.x * 32, e.y * 32, 1, 7));
				}, offset);
				if (e.timeout) playSFX(3, 0.5);
			})
		});
		socket.on('radiation-on', function() {
		    radiationIndicator.hidden = false;
		    sidePanel.style.backgroundImage = 'radial-gradient(rgba(0, 0, 0, 0) 75%, red 100%)';
			radiationAlarm = new Audio('sfx/radiationAlarm.mp3');
			radiationAlarm.loop = true;
			radiationAlarm.play();
        });
        socket.on('radiation-off', function() {
            radiationIndicator.hidden = true;
			sidePanel.style.backgroundImage = 'none';
            radiationAlarm.pause();
        })
	}
	init();
	menu.style.display = 'none';
});

let prevClientLoad = 0;
const loopFunc = function() {

	const then = Date.now();
	prevClientLoad = clientLoad;
	clientLoad = 0;

	if (!chat.chatting) {
        const {x, y} = camera.processScroll(pressed);
        mx += x
        my += y
    }
    
    render(map, camera.x, camera.y)

	clientLoad += Math.round((Date.now() - then) / 0.3);
};
let loop = 0;
let menuOn = true;
let gameOn = false;
const highscores = new Highscores(document.getElementsByClassName('highscores')[0])
function init() {
    if (gameOn) return;
    gameOn = true;
	can.onmousedown = function(evt) {
		if (evt.altKey && evt.button !== 0) return false;
		if (CVGInterface.processButtons(evt.pageX, evt.pageY, true)) return;
        if ((evt.pageX > CW - 300) && (evt.pageY > CH - 300)){ // clicks on map
            camera.scrollTo (
                (evt.pageX - CW + 300 + mapScrollX * 3) * tileSize / 3,
                (evt.pageY - CH + 300 + mapScrollY * 3) * tileSize / 3,
                true
            )
			mapDragging = true;
		} else if((evt.pageX > 40) || (evt.pageY > 352 )){//out of CVGInterface
			smx = evt.pageX + camera.x;
			smy = evt.pageY + camera.y;
			tmx = Math.floor(smx / tileSize);
			tmy = Math.floor(smy / tileSize);
			marking = true;
		} else {//in CVGInterface
			var id = Math.ceil((320 - evt.pageY) / 32);
			if (evt.ctrlKey) { // select only the clicked one
				selected = [selected[id]];
			} else if(evt.shiftKey){ // deselect clicked one
				selected[id] = null;
				selected = selected.filter(function(a) {if(a !== null)return a});
			} else {
				var tmp = selected[id];
				if (typeof selected[id] == 'number' ) {
					selected[id] = selected[0];
					selected[0] = tmp;
					scrollToDroid(selected[0]);
				}
			}
		}
	};
	can.onmouseup = function(evt) {
		if (marking) {
			var emx = evt.pageX + camera.x;
			var emy = evt.pageY + camera.y;
			var tex = Math.floor(emx / tileSize);
			var tey = Math.floor(emy / tileSize);
			var block = map.getBlock(tex, tey);
			if(block)
			if(tmx === tex && tmy === tey){
				var action = CVGInterface.getAction();
				switch(action) {
					case 0: {
						var u = block.u;
						if (u && (u.team === myTeam)) {
							if (evt.ctrlKey && selected.indexOf(u.id) !== -1) {
								var id = selected.indexOf(u.id);
								selected[id] = null;
								selected = selected.filter(function (a) {
									if (a !== null) return a
								});
							} else {
								if (!evt.ctrlKey) clearSelect();
								if (selected.indexOf(u.id) === -1) selected.push(u.id);
							}
						} else {
							var arr = [];
							var attack = u && (u.id !== undefined);
							var dir = 0;
							var w1 = 0;
							var w2 = 0.5;
							var dArrx = [0, 1, 0, -1];
							var dArry = [-1, 0, 1, 0];
							var mine = map.getBlock(tmx, tmy).i === 1;
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

									if (!mine) do {
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
									arr.push({i: d.id, x: d.targetX, y: d.targetY});
								}
							}
							if (selected.length > 0) {
								socket.emit("action", {d: arr, i: attack ? u.id : false});
								entities.push(new Entity(tex * tileSize + 16, tey * tileSize + 16, 2, 30, 0, 0));
							}
							console.log(arr);
						}
					}break;
					default: {
						if (canForm(tex, tey, action)) {
							const actionBind = [0, 5, 5, 1];
							var nearest = selected.slice(0).sort(function(a, b) {
								var d1 = droids[a];
								var d2 = droids[b];
								return Math.hypot(d1.x - tex, d1.y - tey) - Math.hypot(tex - d2.x, tey - d2.y)
							});
							var drs = findActorDroids(nearest, 5);
							var data = {
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
							CVGInterface.setAction(0);
						}
					}
				}
			}else{
				var ex = Math.max(tmx,tex);
				var ey = Math.max(tmy,tey);
				var sx = Math.min(tmx,tex);
				var sy = Math.min(tmy,tey);
				if(!evt.ctrlKey)clearSelect();
				for(var i = sx;i <= ex;i++){
					for(var j = sy;j <= ey;j++){
						var u = map.getBlock(i, j).u;
						if(u && u.team === myTeam){
							if(selected.indexOf(u.id) === -1 && u.type !== 3)selected.push(u.id);
						}
					}
				}
			}
		marking = false;
		}
		mapDragging = false;
	};
	can.onmousemove = function(evt) {

		var actionAllowed = false;
		if (!evt)return false;
		if ((evt.pageX > 40) || (evt.pageY > 352 )) { // out of CVGInterface
			mx = evt.pageX + camera.x;
			my = evt.pageY + camera.y;
			var action = CVGInterface.getAction();
			var tex = Math.floor(mx / tileSize);
			var tey = Math.floor(my / tileSize);
			if(action > 0){
				CVGInterface.lockAction(canForm(tex, tey, action), tex, tey);
			}
			var block = map.getBlock(tex, tey);
			var u = block && block.u;
			if(u){
				onDroid = u.id;
			}else if(droids[selected[0]] && (droids[selected[0]].target !== false)){
				onDroid = droids[selected[0]].target;
			}else onDroid = undefined;
			
		}else{//in CVGInterface
			var id = Math.ceil((352 - evt.pageY) / 32) - 1;
			if(selected[id]){
				onDroid = selected[id];
			}else{
				onDroid = droids[selected[0]] && droids[selected[0]].target || undefined;
			}
		}
		
		if (mapDragging) camera.scrollTo(
            (evt.pageX - CW + 300 + mapScrollX * 3) * tileSize / 3 - CW / 2,
            (evt.pageY - CH + 300 + mapScrollY * 3) * tileSize / 3 - CH / 2
        )

		CVGInterface.processButtons(evt.pageX, evt.pageY, false);
	};

	if (teams[myTeam].t) {
		const registerButton = new CVGInterface.createCanvasButton(0, 0, 75, 20, 'Register');
		registerButton.onclick = function() {
			menuInterface.switchTo(1);
			overlay.style.display = 'flex';
			document.getElementById("username_reg").value = teams[myTeam].u;
		}
	}

	loop = setInterval(loopFunc, 30);
	menuOn = false;
    chat.setOn(document.getElementById("chat-on").checked)
    highscores.setOn(document.getElementById('hi-scores-on').checked)
	can.style.filter = 'none';


	sidePanel.onmousedown = can.onmousedown;
	sidePanel.onmouseup = can.onmouseup;
	sidePanel.onmousemove = can.onmousemove;
}
function deinit(){
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
	CVGInterface.removeButton('Register');
	selected = [];
	can.style.filter = 'blur(2px)';
    chat.off()
    highscores.off()
}

}

export default App