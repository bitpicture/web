import { Bit } from "./bit";
export class Interactivity {
  zoom = 1;
  picture = null;
  $el = null;

  queuedMap = {};

  constructor(picture, $el) {
    this.picture = picture;
    this.$el = $el;
    this.start();
  }

  start() {
    this.picture.$canvas.onmousemove = (e) => {
      const [x, y] = this.calculateCoordinates(e);
      if (this.picture.hasBitAtCoordinates(x, y)) return;

      this.$el.style.top = `${y}px`;
      this.$el.style.left = `${x}px`;
    };

    this.$el.onclick = (e) => {
      const [x, y] = this.calculateCoordinates(e);

      if (this.picture.hasBitAtCoordinates(x, y)) return;

      const index = this.picture.indexAtCoordinates(x, y);
      this.enqueue(new Bit(x, y, index, "#ffffff"));
    };
  }

  isQueued(index) {
    return this.queuedMap[index] !== undefined;
  }

  enqueue(bit) {
    if (this.isQueued(bit.index)) return;

    const queuedIndex = this.picture.queued.push(bit);
    // this.queuedMap[bit.index] = queuedIndex;
  }

  dequeue(queuedIndex) {
    this.picture.queued.splice(queuedIndex, 1);
    // delete this.queuedMap[index];
  }

  setZoom(zoom) {
    this.zoom = zoom;
  }

  calculateCoordinates(e) {
    const bounding = this.picture.$canvas.getBoundingClientRect();

    const x = Math.floor((e.x - bounding.x) / this.zoom);
    const y = Math.floor((e.y - bounding.y) / this.zoom);

    return [x, y];
  }
}
