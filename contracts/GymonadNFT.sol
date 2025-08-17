// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GymonadNFT is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    IERC20 public gymToken;
    
    uint256 public mintPrice = 5 * 10**18; // 5 GYM tokens
    uint256 public maxSupply = 10000;
    string private _baseTokenURI;
    
    // NFT metadata
    mapping(uint256 => string) private _tokenURIs;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 price);
    
    constructor(address _gymToken, string memory baseURI) ERC721("Heraklion Gym Membership", "HGM") {
        gymToken = IERC20(_gymToken);
        _baseTokenURI = baseURI;
    }
    
    function mint() external nonReentrant {
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        require(gymToken.balanceOf(msg.sender) >= mintPrice, "Insufficient GYM tokens");
        
        // Transfer GYM tokens from user to contract
        require(gymToken.transferFrom(msg.sender, address(this), mintPrice), "Token transfer failed");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        
        emit NFTMinted(msg.sender, newTokenId, mintPrice);
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json"))
            : "";
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Admin functions
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }
    
    function withdrawGymTokens() external onlyOwner {
        uint256 balance = gymToken.balanceOf(address(this));
        require(gymToken.transfer(owner(), balance), "Transfer failed");
    }
}
