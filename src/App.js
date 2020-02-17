import ElementSwitcher from './classes/ElementSwitcher';

import Logger from './classes/Logger';
import Game from './classes/Game/Game';

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

  Math.zmod = (a, b) => a - (Math.floor(a / b) * b);

  // CVGInterface.js

  // main.js
  const overlay = document.getElementById('overlay');
  const can = document.getElementById('main-game-canvas');

  const lpanel = document.getElementById('login');
  const rpanel = document.getElementById('register');
  const userPanel = document.getElementById('user');
  const menuInterface = new ElementSwitcher([
    lpanel,
    rpanel,
    userPanel,
  ]);

  window.requestAnimationFrame = window.requestAnimationFrame
                              || window.webkitRequestAnimationFrame
                              || window.mozRequestAnimationFrame;

  document.onselectstart = (e) => e.preventDefault(); // prevent selection of content in document;

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

  tiles.fetch().then(() => {
    // preinit();
  });

  const menu = document.getElementById('overlay');

  const game = new Game();

  window.onresize = () => { // TODO remove style read
    game.setCanvasSize(window.innerWidth, window.innerHeight, menu.style.display === 'none');
  };
};

export default App;
