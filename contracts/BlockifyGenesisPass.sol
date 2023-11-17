// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./erc721c/ERC721C.sol";

contract BlockifyGenesisPass is ERC721C {
    
    constructor() ERC721C("BlockifyGenesisPass", "BFGP") {
        setToDefaultSecurityPolicy();
    }

    // TODO: Implement/Override base uri
    // TODO: Implement public minting function(s)
    // TODO: Implement EIP-2981 Royalties
    // TODO: Your other contract features, if any
}
