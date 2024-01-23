/** @format */

import React, { useState, useEffect } from "react";
import {
  redeem,
  setApprove,
  isApprovedForAll,
  checkTokenlist,
} from "../utils/interact";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar, TitleText } from "../components";

const SIGNING_SERVER_URL = "https://redeemer.upstreet.ai/";

export default function Mint() {
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedGenesis, setSelectedGenesis] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [signature, setSignature] = useState(null);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const ethersProvider = new ethers.providers.Web3Provider(
          window.ethereum
        );
        const signer = ethersProvider.getSigner();
        const address = await signer.getAddress();
        if (address) {
          setWalletAddress(address);
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
        // Handle the error or display a message to the user.
      }
    } else {
      console.log("MetaMask not found. Please install MetaMask.");
      // You can display a message to the user to install MetaMask.
    }
  }

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    handleConnectWallet();
    setSelectedGenesis(null);
    setTokenData(null);

    return () => {};
  }, [walletAddress]);

  const handleConnectWallet = async () => {
    if (walletAddress) {
      try {
        const provider = await detectEthereumProvider();
        if (provider) {
          const ethersProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          const signer = ethersProvider.getSigner();
          const address = await signer.getAddress();
          const signature = await signer.signMessage(address);
          setWalletAddress(address);
          setSignature(signature);
          const verifiedMessage = ethers.utils.verifyMessage(
            address,
            signature
          );
          if (verifiedMessage !== address) {
            console.log("Signature verification failed");
            return;
          }
          await setValidTokens(address, signature);
        } else {
          console.log("Please install Metamask.");
        }
      } catch (err) {
        console.log("eeror", err);
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, signature }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        const { tokens } = data;
        const validTokens = await checkTokenlist(tokens);
        setTokenData(validTokens);
      });
  };

  const redeemPass = async () => {
    if (!selectedGenesis && selectedGenesis !== 0) {
      alert("Please select a token to redeem");
      return;
    }
    console.log("before", walletAddress, signature, selectedGenesis);
    fetch(SIGNING_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: walletAddress,
        signature,
        tokenId: selectedGenesis,
      }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        console.log("mintToken data", data);
        const { signature, signer } = data;
        if (!(await isApprovedForAll())) {
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

        console.log("etner redeem");
        const redeemStatus = await redeem(
          selectedGenesis,
          walletAddress,
          signer,
          signature
        );
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
        console.log("After redeem");
        await setValidTokens(walletAddress, signature);
      });
  };

  const eligibleForClaim = tokenData && tokenData.length > 0;

  console.log("tokenData", tokenData);

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full min-h-screen overflow-hidden bg-brand-background ">
        <Navbar />
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center w-full h-full px-2 md:px-10">
            {walletAddress ? (
              <div className="flex flex-col items-center w-full px-20 py-4 rounded-md z-1 md:max-w-3xl glass filter backdrop-blur-sm md:px-20">
                {eligibleForClaim ? (
                  <>
                    <h1 className="mt-3 text-xl font-bold text-white uppercase md:text-xl bg-gradient-to-br bg-clip-text top_title_withAddress">
                      Select a token to redeem
                    </h1>

                    {tokenData.length >= 3 ? (
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        {tokenData?.map((token, i) => (
                          <div key={i}>
                            <img
                              key={token}
                              src="./images/webaverse genesis pass.png"
                              alt=""
                              className={`w-16 h-16 genesis_img ${
                                token === selectedGenesis && `selected_img`
                              }`}
                              onClick={() => setSelectedGenesis(token)}
                            />
                            <p className="text-center text-white token_ID">{`#${token}`}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-flow-col gap-4 mt-6 auto-cols-max">
                        {tokenData?.map((token, i) => (
                          <div key={i}>
                            <img
                              key={token}
                              src="./images/webaverse genesis pass.png"
                              alt=""
                              className={`w-16 h-16 genesis_img ${
                                token === selectedGenesis && `selected_img`
                              }`}
                              onClick={() => setSelectedGenesis(token)}
                            />
                            <p className="text-center text-white token_ID">{`#${token}`}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedGenesis !== null && (
                      <>
                        <h1 className="mt-8 text-xl font-bold text-white uppercase md:text-xl bg-gradient-to-br bg-clip-text top_title_withAddress">
                          You Receive
                        </h1>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <img
                            src="./images/land.png"
                            alt=""
                            className={`genesis_img`}
                            key={1}
                          />
                        </div>
                        <h1 className="mt-8 text-xl text-white uppercase md:text-xl bg-gradient-to-br bg-clip-text gas_price">
                          Price: 0 ETH + Gas
                        </h1>
                      </>
                    )}
                    <button
                      className="bg-[#000000] text-[#ffffff] mt-6 mb-2 border-2 border-[#5F2EEA] px-8 py-4 text-xl font-bold hover:bg-[#5F2EEA] hover:text-[#ffffff]"
                      onClick={redeemPass}
                    >
                      Redeem
                    </button>
                  </>
                ) : (
                  <div className="checking_pass_div">
                    <h1 className="mt-3 text-xl font-bold text-white uppercase md:text-xl bg-gradient-to-br bg-clip-text top_title_withoutAddress">
                      Checking your genesis Pass Tokens
                    </h1>
                    <TitleText
                      title={
                        <>
                          Pass Token for BVerse{" "}
                          <span className="coming_title">(Coming Soon..)</span>
                        </>
                      }
                      textStyles="text-center"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center px-20 py-4 rounded-md md:max-w-3xl glass filter backdrop-blur-sm md:px-20 redeem_div">
                <h1 className="mt-3 text-xl font-bold text-white uppercase md:text-xl bg-gradient-to-br bg-clip-text top_title_withoutAddress">
                  Claim your genesis pass
                </h1>
                <TitleText
                  title={<>Pass Token for BVerse</>}
                  textStyles="text-center"
                />
                <img src="./Genesis Pass.png" alt="" className="genesis_img" />
              </div>
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
