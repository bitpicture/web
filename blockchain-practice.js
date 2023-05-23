import { ethers } from "ethers";
import abi from "./abi";

let signer = null;
let provider;
if (window.ethereum == null) {
  // If MetaMask is not installed, we use the default provider,
  // which is backed by a variety of third-party services (such
  // as INFURA). They do not have private keys installed so are
  // only have read-only access
  console.log("MetaMask not installed; using read-only defaults");
  provider = ethers.getDefaultProvider();
} else {
  // Connect to the MetaMask EIP-1193 object. This is a standard
  // protocol that allows Ethers access to make all read-only
  // requests through MetaMask.
  provider = new ethers.BrowserProvider(window.ethereum);

  // It also provides an opportunity to request access to write
  // operations, which will be performed by the private key
  // that MetaMask manages for the user.
  signer = await provider.getSigner();
}

console.log(provider, signer);

// console.log(await provider.getBlockNumber());
// // 17093688

// // Get the current balance of an account (by address or ENS name)
// let balance = await provider.getBalance(signer);
// console.log(balance);
// // 182334002436162568n

// // Since the balance is in wei, you may wish to display it
// // in ether instead.
// console.log(ethers.formatEther(balance));
// // '0.182334002436162568'

// // Get the next nonce required to send a transaction
// console.log(await provider.getTransactionCount(signer));
// // 3

/**
 * Interacting with contract
 */
// console.log(abi);
const contract = new ethers.Contract(
  "0x941117395bB3E2B58b74f5E4704E7E6AE1290aDB",
  abi
).connect(signer);

console.log(contract);

console.log(await contract.symbol());

// Query all time for any transfer to ethers.eth
// const filter = contract.filters.Transfer;
// const events = await contract.queryFilter(filter, -1000);
// console.log(events);
// console.log(JSON.stringify(events[0]));

// const txn = await contract.mint([5], ["000002"], {
//   value: 50000,
// });
// console.log(txn);
