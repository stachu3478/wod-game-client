import isPointInBox from '../../utils/isPointInBox';

class CanvasButton {
  constructor() {
    this.width = 64;
    this.height = 16;
    this.x = 0;
    this.y = 0;
    this.text = 'I\'m a button! ;d';
    this.color = 'black';
    this.textColor = 'white';
    this.font = '16px Consolas';
    this.tip = '';
    this.onclick = () => {};
    this.wasPressed = false;
    this.followed = false;
    this.hidden = false;
    this.options = {};
  }

  draw() {
    if (!this.hidden) {
      const xPos = this.options.stickRight ? this.CW - this.x - this.width : this.x;
      this.ctx.font = this.font;
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(xPos, this.y, this.width, this.height);
      this.ctx.fillStyle = this.textColor;
      this.ctx.strokeRect(xPos, this.y, this.width, this.height);
      this.ctx.textAlign = 'center';
      if (typeof this.text === 'string') { this.ctx.fillText(this.text, xPos + this.width / 2, this.y + this.height / 2); } else { this.ctx.drawImgage(this.text, xPos, this.y); }
      if (this.wasPressed) {
        this.ctx.fillStyle = '#0004';
        this.ctx.fillRect(xPos, this.y, this.width, this.height);
      } else if (this.followed) {
        this.ctx.fillStyle = '#FFF4';
        this.ctx.fillRect(xPos, this.y, this.width, this.height);
      }
    }
  }

  process(mouseX, mouseY, active) {
    if (this.hidden) return;
    if (isPointInBox(this.x, this.y, this.width, this.height, mouseX, mouseY)) {
      if (active) {
        if (!this.wasPressed) {
          this.onclick();
          this.wasPressed = true;
        }
      } else {
        this.wasPressed = false;
      }
      this.followed = true;
    } else {
      this.followed = false;
      this.wasPressed = false;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setSize(x, y) {
    this.width = x;
    this.height = y;
  }

  setColors(color, textColor) {
    this.color = color;
    this.textColor = textColor;
  }

  setText(text, font = false) {
    this.text = text;
    if (font) this.font = font;
  }

  setCanvas(canvas, context) {
    this.CW = canvas.width;
    this.ctx = context;
  }
}

export default CanvasButton;
