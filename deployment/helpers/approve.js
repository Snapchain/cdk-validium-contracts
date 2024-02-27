/*
Usage: npm run deploy:approve:matic <network>
*/


const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  // Load provider
  let provider = ethers.provider;

  // Load signer
  let signer = (await ethers.getSigners())[0];

  const maticTokenFactory = await ethers.getContractFactory(
    "ERC20PermitMock",
    provider
  );
  maticTokenContract = maticTokenFactory.attach(
    // From deployments/.../deploy_output.json maticTokenAddress
    process.env.MATIC_TOKEN_ADDRESS
  );
  maticTokenContractWallet = maticTokenContract.connect(signer);
  const res = await maticTokenContractWallet.approve(
  // From deployments/.../deploy_output.json cdkValidiumAddress
    process.env.CDK_VALIDIUM_ADDRESS,
    ethers.utils.parseEther("100.0")
  );
  console.log(res);
}

// to prevent execution by accident on import
if (require.main === module) {
    main();
}
