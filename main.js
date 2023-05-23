import Alpine from "alpinejs";
import {
  getMintedBits,
  getShortAddress,
  getSignerForSelectedAccount,
  getUnfolding,
  mintBits,
  readProvider,
  writeProvider,
} from "./chain";
import { Picture } from "./picture";
import "./style.css";

Alpine.data("app", () => ({
  zoom: 10,
  minZoom: 1,
  maxZoom: 40,
  unfolding: 13,
  picture: null,
  highlightQueued: false,

  // Chain-related
  web3Signer: null,

  async init() {
    await this.createPicture();
    this.$watch("unfolding", () => this.createPicture());
    this.$watch("zoom", () => this.picture.interactivity.setZoom(this.zoom));
  },

  handleClickOnQueuedBit($event, queuedIndex) {
    if ($event.shiftKey) {
      this.picture.interactivity.dequeue(queuedIndex);
      return;
    }

    this.openColorPicker($event);
  },

  openColorPicker($event) {
    const picker = $event.target.children[0];

    if (picker) picker.click();
  },

  bitColorChanged(index, $event) {
    this.picture.queued[index]["color"] = $event.target.value;
  },

  async createPicture() {
    this.unfolding = await getUnfolding(readProvider);
    this.picture = new Picture(this.$refs.canvas, this.unfolding);
    this.adjustCanvasSize();
    this.adjustZoomOutLevel();
    this.picture.draw(await getMintedBits());
    this.picture.interactUsing(this.$refs.highlight);
    this.picture.interactivity.setZoom(this.zoom);
  },

  adjustCanvasSize() {
    [this.$refs.canvas.width, this.$refs.canvas.height] =
      this.picture.getSize();
  },

  adjustZoomOutLevel() {
    // TODO: Maybe, picture can be automatically zoomed in when unfoldings are low
    this.minZoom = 1;
    this.zoom = this.minZoom;
  },

  toggleZoom() {
    this.zoom === this.minZoom
      ? (this.zoom = this.maxZoom)
      : (this.zoom = this.minZoom);
  },

  toggleHighlightQueued() {
    this.highlightQueued = !this.highlightQueued;
  },

  // Chain-related
  async connectWeb3() {
    try {
      this.web3Signer = await writeProvider.getSigner();
      this.web3SignerAddress = this.web3Signer.address;
    } catch (e) {
      console.log(e);
    }

    window.ethereum.on("accountsChanged", async () => {
      this.web3Signer = await getSignerForSelectedAccount(writeProvider);
    });
  },

  async mint() {
    const args = this.picture.queued.reduce(
      (args, bit) => {
        args.ids.push(bit.index);
        args.colors.push(bit.color.substring(1));
        return args;
      },
      { ids: [], colors: [] }
    );
    const txn = await mintBits(writeProvider, args.ids, args.colors);
    console.log(txn);
  },
  getShortAddress(address) {
    return getShortAddress(address);
  },
}));

Alpine.start();
