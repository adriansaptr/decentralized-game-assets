// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMetadataRegistry {
    function uri(uint256 id) external view returns (string memory);
}

contract GameAsset1155 is ERC1155, Ownable {
    address public metadataRegistry;

    constructor(address registry) ERC1155("") Ownable(msg.sender) {
        metadataRegistry = registry;
    }

    function setRegistry(address registry) external onlyOwner {
        metadataRegistry = registry;
    }

    function mint(address to, uint256 id, uint256 amount, bytes memory data) external onlyOwner {
        _mint(to, id, amount, data);
    }

    function uri(uint256 id) public view override returns (string memory) {
        return IMetadataRegistry(metadataRegistry).uri(id);
    }
}
