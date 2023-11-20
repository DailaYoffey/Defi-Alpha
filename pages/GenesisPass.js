import React, { useState, useEffect } from 'react';
import { initOnboard } from '../utils/onboard';
import { redeem, setApprove, isApprovedForAll, checkTokenlist } from '../utils/interact';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TitleText } from '../components';

const SIGNING_SERVER_URL = 'https://redeemer.upstreet.ai/';

export default function Mint() {
  const [onboard, setOnboard] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedGenesis, setSelectedGenesis] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    const onboardData = initOnboard({
      address: (address) => setWalletAddress(address ? address : ''),
      wallet: (wallet) => { }, // removed localstorage part for brevity
    });
    setOnboard(onboardData);
    setSelectedGenesis(null)
    setTokenData(null)
  }, []);

  const handleConnectWallet = async () => {
    const walletSelected = await onboard.walletSelect()
    if (walletSelected) {
      try {
        await onboard.walletCheck();
        const provider = await detectEthereumProvider();
        if (provider) {
          const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = ethersProvider.getSigner();
          const address = await signer.getAddress();
          const signature = await signer.signMessage(address);
          setWalletAddress(address);
          setSignature(signature);
          const verifiedMessage = ethers.utils.verifyMessage(address, signature);
          if (verifiedMessage !== address) {
            console.log('Signature verification failed');
            return;
          }
          await setValidTokens(address, signature)
        } else {
          console.log('Please install Metamask.');
        }
      } catch (err) {
        console.log("eeror", err)
        toast.error("Message sign failed", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    }
  };

  const setValidTokens = async (address, signature) => {
    fetch(SIGNING_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, signature }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        const { tokens } = data
        const validTokens = await checkTokenlist(tokens)
        setTokenData(validTokens)
      });
  }

  const redeemPass = async () => {
    if (!selectedGenesis && selectedGenesis !== 0) {
      alert('Please select a token to redeem');
      return;
    }
    console.log("before", walletAddress, signature, selectedGenesis)
    fetch(SIGNING_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: walletAddress, signature, tokenId: selectedGenesis }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        console.log('mintToken data', data);
        const { signature, signer } = data
        if (!await isApprovedForAll()) {
          const approveStatus = await setApprove();
          if (approveStatus.status) {
            toast.info(approveStatus.message, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
          } else {
            toast.error(approveStatus.message, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
            return;
          }
        }

        console.log("etner redeem")
        const redeemStatus = await redeem(selectedGenesis, walletAddress, signer, signature);
        if (redeemStatus.status) {
          toast.info(redeemStatus.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        } else {
          toast.error(redeemStatus.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          return;
        }
        console.log("After redeem")
        await setValidTokens(walletAddress, signature)
      });
  };

  const disconnectWallet = async () => {
    onboard.walletReset();
    setSelectedGenesis(null);
  };

  const eligibleForClaim = tokenData && tokenData.length > 0;

  console.log('tokenData', tokenData)

  return (
    <>
      <div className="min-h-screen h-full w-full overflow-hidden flex flex-col items-center justify-center bg-brand-background ">
        {walletAddress && (
          <button
            className="absolute top-4 right-2 w-60 bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm px-1 py-1 rounded-md text-white hover:shadow-pink-400/50 tracking-wide"
            onClick={disconnectWallet}
          >
            {walletAddress.slice(0, 10) + '...' + walletAddress.slice(-6)}
          </button>
        )}
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center h-full w-full px-2 md:px-10">
            {walletAddress ? (
              <>
                <div className="z-1 md:max-w-3xl w-full glass filter backdrop-blur-sm py-4 rounded-md px-20 md:px-20 flex flex-col items-center">
                  {eligibleForClaim ? (
                    <>
                      <h1 className="uppercase font-bold text-white text-xl md:text-xl bg-gradient-to-br bg-clip-text mt-3 top_title_withAddress">
                        Select a token to redeem
                      </h1>
                      

                      {
                        tokenData.length >=3 ? 
                          <div className="grid grid-cols-3 gap-4 mt-6">
                            {tokenData?.map((token, i) => (
                              <div key={i}>
                                <img
                                  key={token}
                                  src="./images/webaverse genesis pass.png"
                                  alt=""
                                  className={`w-16 h-16 genesis_img ${token === selectedGenesis && `selected_img`}`}
                                  onClick={() => setSelectedGenesis(token)}
                                />
                                <p className='text-white text-center token_ID'>{`#${token}`}</p>
                              </div>
                            ))}
                          </div>
                          : <div className="grid grid-flow-col auto-cols-max gap-4 mt-6">
                              {tokenData?.map((token, i) => (
                                <div key={i}>
                                  <img
                                    key={token}
                                    src="./images/webaverse genesis pass.png"
                                    alt=""
                                    className={`w-16 h-16 genesis_img ${token === selectedGenesis && `selected_img`}`}
                                    onClick={() => setSelectedGenesis(token)}
                                  />
                                  <p className='text-white text-center token_ID'>{`#${token}`}</p>
                                </div>
                              ))}
                            </div>
                      }
                      {
                        selectedGenesis !== null && <>
                          <h1 className="uppercase font-bold text-white text-xl md:text-xl bg-gradient-to-br bg-clip-text mt-8 top_title_withAddress">
                            You Receive
                          </h1>
                          <div className='grid grid-cols-2 gap-4 mt-6'>
                            <img src="./images/land.png" alt="" className={`genesis_img`} key={1} />
                          </div>
                          <h1 className="uppercase text-white text-xl md:text-xl bg-gradient-to-br bg-clip-text mt-8 gas_price">
                            Price: 0 ETH + Gas
                          </h1>
                        </>
                      }
                      <button
                        className="bg-[#000000] text-[#ffffff] mt-6 mb-2 border-2 border-[#5F2EEA] px-8 py-4 text-xl font-bold hover:bg-[#5F2EEA] hover:text-[#ffffff]"
                        onClick={redeemPass}
                      >
                        Redeem
                      </button>
                    </>
                  ) : (
                    <div className='checking_pass_div'>
                      <h1 className="uppercase font-bold text-white text-xl md:text-xl bg-gradient-to-br bg-clip-text mt-3 top_title_withoutAddress">
                        Checking your genesis Pass Tokens
                      </h1>
                      <TitleText title={<>Pass Token for Blockify <span className='coming_title'>(Coming Soon..)</span></>} textStyles="text-center" />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="md:max-w-3xl glass filter backdrop-blur-sm py-4 rounded-md px-20 md:px-20 flex flex-col items-center redeem_div">
                  <h1 className="uppercase font-bold text-white text-xl md:text-xl bg-gradient-to-br bg-clip-text mt-3 top_title_withoutAddress">
                    Claim your genesis pass
                  </h1>
                  <TitleText title={<>Pass Token for Blockify</>} textStyles="text-center" />
                  <img src="./Genesis Pass.png" alt="" className="genesis_img" />
                  <button
                    className="bg-[#000000] text-[#ffffff] mt-6 mb-2 border-2 border-[#5F2EEA] px-8 py-4 text-xl font-bold hover:bg-[#5F2EEA] hover:text-[#ffffff] genesis_pass_connect_btn"
                    onClick={handleConnectWallet}
                  >
                    Connect Wallet
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="gradient-03 background-genesis_div" />
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}
