/* eslint-disable no-await-in-loop */
const { expect } = require("chai");
const ethers = require("ethers");
require("dotenv").config();

const deployOutput = require("./deploymentOutput/deploy_output.json");
const dataCommitteeContractJson = require("./compiled-contracts/CDKDataCommittee.json");

async function main() {
  const dataCommitteeContractAddress = deployOutput["cdkDataCommitteeContract"];
  if (!dataCommitteeContractAddress) {
    throw new Error(`Missing DataCommitteeContract: ${deployOutput}`);
  }
  const dataCommitteeUrl = process.env.DAC_URL;
  console.log("DAC_URL:", dataCommitteeUrl);
  const dataCommitteeAddress = process.env.DAC_ADDRESS;
  console.log("DAC_ADDRESS:", dataCommitteeAddress);
  const JSONRPC_HTTP_URL = process.env.JSONRPC_HTTP_URL;
  console.log("JSONRPC_HTTP_URL:", JSONRPC_HTTP_URL);
  const currentProvider = new ethers.providers.JsonRpcProvider(
    JSONRPC_HTTP_URL
  );
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  // Load deployer
  const deployer = new ethers.Wallet(privateKey, currentProvider);
  console.log("Using pvtKey deployer with address: ", deployer.address);

  const requiredAmountOfSignatures = 1;
  const urls = [dataCommitteeUrl];
  const addrsBytes = dataCommitteeAddress;
  const dataCommitteeContract = new ethers.Contract(
    dataCommitteeContractAddress,
    dataCommitteeContractJson.abi,
    deployer
  );
  const tx = await dataCommitteeContract.setupCommittee(
    requiredAmountOfSignatures,
    urls,
    addrsBytes
  );
  console.log(`Committee seted up with ${dataCommitteeAddress}`);
  console.log("Transaction hash:", tx.hash);
  // Wait for receipt
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  const actualAmountOfmembers =
    await dataCommitteeContract.getAmountOfMembers();
  expect(actualAmountOfmembers.toNumber()).to.be.equal(urls.length);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
