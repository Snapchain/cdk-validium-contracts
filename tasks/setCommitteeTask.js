/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/*
 *Usage: npx hardhat setCommitteeTask --network <network> <url> <memberAddress>
 */
const { expect } = require('chai');
const { task } = require("hardhat/config");

const deployOutput = require('../deploymentOutput/deploy_output.json');

async function setCommitteeTask(taskArgs, hre) {
  const dataCommitteeContractAddress = deployOutput.cdkDataCommitteeContract;
  if (!dataCommitteeContractAddress) {
    throw new Error(`Missing DataCommitteeContract: ${deployOutput}`);
  }

  // Load provider
  const ethers = hre.ethers;
  const { provider } = ethers;

  // Load signer
  const signer = (await ethers.getSigners())[0];

  const cdkDACFactory = await ethers.getContractFactory(
    "CDKDataCommittee",
    provider
  );
  const cdkDACContract = cdkDACFactory.attach(dataCommitteeContractAddress);
  const cdkDACContractWallet = cdkDACContract.connect(signer);

  const requiredAmountOfSignatures = 1;
  const urls = [taskArgs.url];
  const addrsBytes = taskArgs.memberAddress;

  const daMember = await cdkDACContract.members(0);
  console.log("current DA member: ", daMember);

  const tx = await cdkDACContractWallet.setupCommittee(
    requiredAmountOfSignatures,
    urls,
    addrsBytes
  );
  console.log("Transaction hash:", tx.hash);
  // Wait for receipt
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  const actualAmountOfmembers = await cdkDACContract.getAmountOfMembers();
  const newDaMember = await cdkDACContract.members(0);
  console.log("new DA member: ", newDaMember);
  expect(actualAmountOfmembers.toNumber()).to.be.equal(urls.length);
}


task("setCommitteeTask", "set DA committee")
  .addPositionalParam("url")
  .addPositionalParam("memberAddress")
  .setAction(setCommitteeTask);