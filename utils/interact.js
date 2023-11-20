const { createAlchemyWeb3 } = require('@alch/alchemy-web3')

const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
import { config } from '../dapp.config'

const Blockify = require('../contracts/abi/Blockify.json')
const BlockifyContract = new web3.eth.Contract(Blockify.abi, config.BlockifyContractAddress)

const redeemer = require('../contracts/abi/Redeemer.json')
const redeemerContract = new web3.eth.Contract(redeemer.abi, config.redeemerContractAddress)

export const isApprovedForAll = async () => {
  const isApproved = await BlockifyContract.methods.isApprovedForAll(window.ethereum.selectedAddress, config.redeemerContractAddress).call();
  return isApproved;
}

export const checkTokenlist = async (tokens) => {
  let validTokens = [];
  for(let i = 0; i < tokens.length; i++) {
    let isRedeemed = await redeemerContract.methods.isRedeemed(tokens[i]).call();
      if(!isRedeemed) {
        validTokens.push(tokens[i]);
        // if(validTokens.length >=3 ) {
        //   break;
        // }
      } 
  }

  return validTokens;
}

export const setApprove = async () => {

  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )
  
  let gasPrice = await web3.eth.getGasPrice();
  let estimatedGas = await BlockifyContract.methods.setApprovalForAll(config.redeemerContractAddress, true).estimateGas({from: window.ethereum.selectedAddress});

  const tx = {
    to: config.BlockifyContractAddress,
    from: window.ethereum.selectedAddress,
    gasPrice: web3.utils.toHex(gasPrice),
    gas: web3.utils.toHex(estimatedGas),
    data: BlockifyContract.methods
      .setApprovalForAll(config.redeemerContractAddress, true)
      .encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })
    
    const receipt = await waitForTransactionReceipt(txHash);

    if (receipt.status === true) {
      console.log('Approve succeeded');
      return {
        status: true,
        message: "Approval Succeeded"
      };
    } else {
      return {
        status: false,
        message: "Approval Failed"
      };
    }
  } catch (error) {
    return {
      status: false,
      message: "Error sending transaction"
    };
  }
}

export const redeem = async (tokenID, address, signer, signature) => {
  console.log("tokenID", tokenID)
  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )

  let gasPrice = await web3.eth.getGasPrice();
  let estimatedGas = await redeemerContract.methods.redeem(tokenID, address, signer, signature).estimateGas({from: window.ethereum.selectedAddress});

  // Set up our Ethereum transaction
  const tx = {
    to: config.redeemerContractAddress,
    from: window.ethereum.selectedAddress,
    gasPrice: web3.utils.toHex(gasPrice),
    gas: web3.utils.toHex(estimatedGas),
    data: redeemerContract.methods
      .redeem(tokenID, address, signer, signature)
      .encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    const receipt = await waitForTransactionReceipt(txHash);

    if (receipt.status === true) {
      return {
        status: true,
        message: "Redeem Succeeded"
      };
    } else {
      return {
        status: false,
        message: "Redeem Failed"
      };
    }
  } catch (error) {
    return {
      status: false,
      message: "Error sending transaction"
    };
  }
}

async function waitForTransactionReceipt(txHash) {
  while (true) {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    if (receipt != null) {
      return receipt;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a second before checking again
  }
}



// export const getTotalMinted = async () => {
//   const totalMinted = await nftContract.methods.totalSupply().call()
//   return totalMinted
// }

// export const getMaxSupply = async () => {
//   const maxSupply = await nftContract.methods.maxSupply().call()
//   return maxSupply
// }

// export const isPausedState = async () => {
//   const paused = await nftContract.methods.paused().call()
//   return paused
// }

// export const isPublicSaleState = async () => {
//   const publicSale = await nftContract.methods.publicM().call()
//   return publicSale
// }

// export const isPreSaleState = async () => {
//   const preSale = await nftContract.methods.presaleM().call()
//   return preSale
// }

// export const getPrice = async () => {
//   const price = await nftContract.methods.price().call()
//   return price
// }

// export const presaleMint = async (mintAmount) => {
//   if (!window.ethereum.selectedAddress) {
//     return {
//       success: false,
//       status: 'To be able to mint, you need to connect your wallet'
//     }
//   }

//   const leaf = keccak256(window.ethereum.selectedAddress)
//   const proof = merkleTree.getHexProof(leaf)

//   // Verify Merkle Proof
//   const isValid = merkleTree.verify(proof, leaf, root)

//   if (!isValid) {
//     return {
//       success: false,
//       status: 'Invalid Merkle Proof - You are not on the whitelist'
//     }
//   }

//   const nonce = await web3.eth.getTransactionCount(
//     window.ethereum.selectedAddress,
//     'latest'
//   )

//   // Set up our Ethereum transaction
//   const tx = {
//     to: config.contractAddress,
//     from: window.ethereum.selectedAddress,
//     value: parseInt(
//       web3.utils.toWei(String(config.price * mintAmount), 'ether')
//     ).toString(16), // hex
//     gas: '500000',
//     data: nftContract.methods
//       .presaleMint(window.ethereum.selectedAddress, mintAmount, proof)
//       .encodeABI(),
//     nonce: nonce.toString(16)
//   }

//   try {
//     const txHash = await window.ethereum.request({
//       method: 'eth_sendTransaction',
//       params: [tx]
//     })

//     return {
//       success: true,
//       status: (
//         <a href={`https://rinkeby.etherscan.io/tx/${txHash}`} target="_blank">
//           <p>✅ Check out your transaction on Etherscan:</p>
//           <p>{`https://rinkeby.etherscan.io/tx/${txHash}`}</p>
//         </a>
//       )
//     }
//   } catch (error) {
//     return {
//       success: false,
//       status: '😞 Smth went wrong:' + error.message
//     }
//   }
// }

// export const publicMint = async (mintAmount) => {
//   if (!window.ethereum.selectedAddress) {
//     return {
//       success: false,
//       status: 'To be able to mint, you need to connect your wallet'
//     }
//   }

//   const nonce = await web3.eth.getTransactionCount(
//     window.ethereum.selectedAddress,
//     'latest'
//   )

//   // Set up our Ethereum transaction
//   const tx = {
//     to: config.contractAddress,
//     from: window.ethereum.selectedAddress,
//     value: parseInt(
//       web3.utils.toWei(String(config.price * mintAmount), 'ether')
//     ).toString(16), // hex
//     gas: '500000',
//     data: nftContract.methods.publicSaleMint(mintAmount).encodeABI(),
//     nonce: nonce.toString(16)
//   }

//   try {
//     const txHash = await window.ethereum.request({
//       method: 'eth_sendTransaction',
//       params: [tx]
//     })

//     return {
//       success: true,
//       status: (
//         <a href={`https://rinkeby.etherscan.io/tx/${txHash}`} target="_blank">
//           <p>✅ Check out your transaction on Etherscan:</p>
//           <p>{`https://rinkeby.etherscan.io/tx/${txHash}`}</p>
//         </a>
//       )
//     }
//   } catch (error) {
//     return {
//       success: false,
//       status: '😞 Smth went wrong:' + error.message
//     }
//   }
// }
