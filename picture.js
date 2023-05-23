import { hex2dec } from "./colors";
import { Interactivity } from "./interactivity";

export class Picture {
  $canvas = null;
  unfolding = 0;
  width = 1;
  height = 1;
  data = null;
  coordinatesToIndex = {};
  interactivity = null;
  queued = [];

  constructor($canvas, unfolding) {
    this.$canvas = $canvas;
    this.unfolding = unfolding;
  }

  draw(bits) {
    this.fillWithBlanks();
    this.bitsToData(bits);

    this.$canvas
      .getContext("2d")
      .putImageData(
        new ImageData(
          new Uint8ClampedArray(this.data.buffer),
          this.width,
          this.height
        ),
        0,
        0
      );
  }

  interactUsing(element) {
    this.interactivity = new Interactivity(this, element);
  }

  bitsToData(bits) {
    this.fillWithBlanks();
    bits.forEach((bit) => {
      //   index in flat array from (x, y) coordinate
      let i = this.width * bit.y + bit.x;

      this.data[i] = hex2dec(bit.color);
    });
  }

  hasBitAtCoordinates(x, y) {
    //   index in flat array from (x, y) coordinate
    let i = this.width * y + x;

    // USING BIGNUMBER.
    // let i = this.width.mul(y).add(x);

    return this.data[i] > 0;
  }

  identifySize() {
    [this.width, this.height] = this.getSize();
  }

  fillWithBlanks() {
    this.identifySize();
    this.data = new Uint32Array(this.width * this.height);
  }

  getSize() {
    // const exponentW = (this.unfolding + (this.unfolding % 2)) / 2;
    // const exponentH = (this.unfolding - (this.unfolding % 2)) / 2;

    // USE BIGNUMBER
    const exponentW = this.unfolding.add(this.unfolding.mod(2)).div(2);
    const exponentH = this.unfolding.sub(this.unfolding.mod(2)).div(2);

    return [2 ** exponentW, 2 ** exponentH];
  }

  // NOT IN USE. Should be removed.
  coordinatesAtIndex(index) {
    const unfolding = index > 0 ? Math.ceil(Math.log2(index + 1)) : 0;

    let xStart = 0;
    let xEnd = 2 ** Math.floor((unfolding + 1) / 2);

    let yStart = 0;
    let yEnd = 2 ** Math.floor(unfolding / 2);

    let bitsInPreviousUnfoldings = Math.floor((xEnd * yEnd) / 2);
    let relativeIndexInThisUnfolding = index - bitsInPreviousUnfoldings;

    if (unfolding % 2 > 0) {
      // Odd. Expanded on the x-axis in this unfolding.
      xStart = Math.floor(xEnd / 2);
    } else {
      // Even. Expanded on the y-axis in this unfolding.
      yStart = Math.floor(yEnd / 2);
    }

    const xLength = xEnd - xStart;

    // Modulus will give us the x position
    // Logic: x-coordinate = remaining cells to fill after filling all previous rows
    const xRelative = Math.floor(relativeIndexInThisUnfolding % xLength);

    // Division will give us the y position
    // Logic: y-coordinate = number of rows completely filled
    const yRelative = Math.floor(relativeIndexInThisUnfolding / xLength);

    // Padding the relative coordinates with the starting coordinates to get the absolute coordinates
    const x = xRelative + xStart;
    const y = yRelative + yStart;

    return [x, y];
  }

  indexAtCoordinates(x, y) {
    if (x === 0 && y === 0) return 0;

    let xStart = 0;
    let yStart = 0;

    let xEnd = 2 ** Math.ceil(Math.log2((x > y ? x : y) + 1)) - 1;
    let yEnd = Math.floor(xEnd / 2);
    if (y > yEnd) {
      yEnd = xEnd;
    }

    if (xEnd === yEnd) {
      // SQUARE; unfolded vertically below
      yStart = Math.floor((yEnd + 1) / 2);
    } else {
      // RECTANGLE; unfolded horizontally on the right
      xStart = yEnd + 1;
    }

    let xRelative = x - xStart;
    let yRelative = y - yStart;
    let indexRelative = (yEnd + 1) * yRelative + xRelative;

    const bitsInThisUnfolding = (xEnd - xStart + 1) * (yEnd - yStart + 1);
    return bitsInThisUnfolding + indexRelative;
  }
}
