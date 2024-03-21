/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/*
 *Usage: npx hardhat setSequencerUrlTask --network <network> <url>
 */
const { task } = require("hardhat/config");
const deployOutput = require("../deploymentOutput/deploy_output.json");

async function setSequencerUrlTask(taskArgs, hre) {
  const cdkContractAddress = deployOutput.cdkValidiumAddress;
  if (!cdkContractAddress) {
    throw new Error(`Missing cdkContractAddress: ${deployOutput}`);
  }

  // Load provider
  const ethers = hre.ethers;
  const { provider } = ethers;

  // Load signer
  const signer = (await ethers.getSigners())[0];

  const cdkValidiumFactory = await ethers.getContractFactory(
    "CDKValidium",
    provider
  );
  const cdkValidiumContract = cdkValidiumFactory.attach(cdkContractAddress);
  const cdkValidiumContractWallet = cdkValidiumContract.connect(signer);

  const currentUrl = await cdkValidiumContract.trustedSequencerURL();
  console.log(`current trustedSequencerUrl: ${currentUrl}\n`);

  const tx = await cdkValidiumContractWallet.setTrustedSequencerURL(taskArgs.url);
  console.log("Transaction hash:", tx.hash);
  // Wait for receipt
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  const newUrl = await cdkValidiumContract.trustedSequencerURL();
  console.log(`new trustedSequencerUrl: ${newUrl}`);
}

task("setSequencerUrlTask", "set trusted sequencer url")
  .addPositionalParam("url")
  .setAction(setSequencerUrlTask);