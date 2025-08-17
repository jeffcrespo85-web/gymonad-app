const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying Gymonad contracts to Monad Testnet...")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Deploy GYM Token
  console.log("\n1. Deploying GYM Token...")
  const GymToken = await ethers.getContractFactory("GymToken")
  const gymToken = await GymToken.deploy()
  await gymToken.deployed()
  console.log("GYM Token deployed to:", gymToken.address)

  // Deploy Gymonad NFT
  console.log("\n2. Deploying Gymonad NFT...")
  const baseURI = "https://api.gymonad.xyz/metadata/"
  const GymonadNFT = await ethers.getContractFactory("GymonadNFT")
  const gymonadNFT = await GymonadNFT.deploy(gymToken.address, baseURI)
  await gymonadNFT.deployed()
  console.log("Gymonad NFT deployed to:", gymonadNFT.address)

  // Verify deployment
  console.log("\n3. Verifying deployment...")
  const gymTokenName = await gymToken.name()
  const gymTokenSymbol = await gymToken.symbol()
  const nftName = await gymonadNFT.name()
  const nftSymbol = await gymonadNFT.symbol()

  console.log("GYM Token Name:", gymTokenName)
  console.log("GYM Token Symbol:", gymTokenSymbol)
  console.log("NFT Name:", nftName)
  console.log("NFT Symbol:", nftSymbol)

  // Save deployment info
  const deploymentInfo = {
    network: "monadTestnet",
    chainId: 41454,
    contracts: {
      GymToken: {
        address: gymToken.address,
        name: gymTokenName,
        symbol: gymTokenSymbol,
      },
      GymonadNFT: {
        address: gymonadNFT.address,
        name: nftName,
        symbol: nftSymbol,
        mintPrice: "5000000000000000000", // 5 GYM tokens
      },
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  }

  console.log("\n4. Deployment Summary:")
  console.log(JSON.stringify(deploymentInfo, null, 2))

  // Write to file for frontend integration
  const fs = require("fs")
  fs.writeFileSync("./deployment.json", JSON.stringify(deploymentInfo, null, 2))
  console.log("\nDeployment info saved to deployment.json")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
