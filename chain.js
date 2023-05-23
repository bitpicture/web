import { Alchemy, BigNumber, Network } from "alchemy-sdk";
import { ethers } from "ethers";
import abi from "./abi";
import {
  ALCHEMY_API_KEY,
  ALCHEMY_NETWORK,
  CONTRACT_ADDRESS,
} from "./constants";

// Providers
let readProvider = new ethers.AlchemyProvider(ALCHEMY_NETWORK, ALCHEMY_API_KEY);

let writeProvider = null;
if (window.ethereum == null) {
  console.log("MetaMask not installed; cannot make transactions.");
} else {
  writeProvider = new ethers.BrowserProvider(window.ethereum);
}

export { writeProvider, readProvider };

export async function getSignerForSelectedAccount(provider) {
  return (await provider.listAccounts())[0];
}

export function getShortAddress(address) {
  return address.slice(0, 6) + ".." + address.slice(-4);
}

export async function mintBits(provider, ids = [], colors = []) {
  if (ids.length !== colors.length) {
    return false;
  }
  const signer = await getSignerForSelectedAccount(provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  return await contract.mint(ids, colors, {
    value: ids.length * 50_000,
  });
}

export async function getUnfolding(provider) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  return BigNumber.from(await contract.UNFOLDING_N());
}

const settings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

export async function getMintedBits() {
  const nfts = await alchemy.nft.getNftsForContract(CONTRACT_ADDRESS);

  return nfts.nfts.map((nft) => {
    const bit = { x: 0, y: 0, color: "ffffff" };

    nft.rawMetadata.attributes.forEach(({ value, trait_type }) => {
      if (trait_type === "Color") {
        bit.color = value.substring(1);
      } else if (trait_type === "X") {
        bit.x = parseInt(value);
      } else if (trait_type === "Y") {
        bit.y = parseInt(value);
      }
    });

    return bit;
  });
}
