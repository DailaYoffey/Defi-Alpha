'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from '../styles';
import { navVariants } from '../utils/motion';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'

import { mainnet, arbitrum } from '@wagmi/core/chains'

// 1. Define constants
const projectId = '10dd96df3c1b27c7c028d125071be835'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
const modal = createWeb3Modal({ wagmiConfig, projectId, chains })

const Navbar = () => (
  <motion.nav
    variants={navVariants}
    initial="hidden"
    whileInView="show"
    className={`${styles.xPaddings} py-8 relative`}
  >
    <div className="absolute w-[50%] inset-0 gradient-01 z-10" />
    <div
      className={`${styles.innerWidth} mx-auto flex justify-between gap-8`}
    >
      <img
        src="/search.svg"
        alt="search"
        className="w-[24px] h-[24px] object-contain"
      />
      <h2 className="font-extrabold text-[32px] leading-[30.24px] text-white header_title">
        Blockify
      </h2> 
      <h3 className='font-extrabold text-[20px] text-white pt-1 hover:text-red-400 hover:cursor-pointer z-20'><Link href="/Marketplace">Marketplace</Link></h3>
      <h3 className='font-extrabold text-[20px] text-white pt-1 hover:text-red-400 hover:cursor-pointer z-20'>Decentralize</h3>
      <h3 className='font-extrabold text-[20px] text-white pt-1 hover:text-red-400 hover:cursor-pointer z-20'><Link href="/GenesisPass">Genesis Pass</Link></h3>
      <h3 className='font-extrabold text-[20px] text-white pt-1 hover:text-red-400 hover:cursor-pointer z-20'><Link href="https://blockify-beta.notion.site/Blockify-Project-Modules-00dfc960175946f4bb1424d9e52324f6?pvs=4" target='_blank'>FAQ</Link></h3>
      <w3m-button />
    <script type="module" src="main.js"></script>
      <img
        src="/menu.svg"
        alt="menu"
        className="w-[24px] h-[24px] object-contain"
      />
    </div>
  </motion.nav>
);

export default Navbar;
