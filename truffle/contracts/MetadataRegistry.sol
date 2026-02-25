// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MetadataRegistry is Ownable {
    mapping(uint256 => string) private _uris;

    event MetadataUpdated(uint256 indexed id, string uri);

    constructor() Ownable(msg.sender) {}

    function setURI(uint256 id, string calldata uri_) external onlyOwner {
        _uris[id] = uri_;
        emit MetadataUpdated(id, uri_);
    }

    function uri(uint256 id) external view returns (string memory) {
        return _uris[id];
    }
}
