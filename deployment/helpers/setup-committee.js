/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const { expect } = require('chai');
const { ethers } = require('hardhat');
require('dotenv').config();

const deployOutput = require('../../deploymentOutput/deploy_output.json');

async function main() {
    const dataCommitteeContractAddress = deployOutput.cdkDataCommitteeContract;
    if (!dataCommitteeContractAddress) {
        throw new Error(`Missing DataCommitteeContract: ${deployOutput}`);
    }

    // Load provider
    const { provider } = ethers;

    // Load signer
    const signer = (await ethers.getSigners())[0];

    const cdkDACFactory = await ethers.getContractFactory(
        'CDKDataCommittee',
        provider,
    );
    const cdkDACContract = cdkDACFactory.attach(
        dataCommitteeContractAddress,
    );
    const cdkDACContractWallet = cdkDACContract.connect(signer);

    const dataCommitteeUrl = process.env.DAC_URL;
    const dataCommitteeMemberAddress = process.env.DAC_MEMBER_ADDRESS;

    const requiredAmountOfSignatures = 1;
    const urls = [dataCommitteeUrl];
    const addrsBytes = dataCommitteeMemberAddress;

    const tx = await cdkDACContractWallet.setupCommittee(
        requiredAmountOfSignatures,
        urls,
        addrsBytes,
    );
    console.log(`Committee seted up with ${dataCommitteeMemberAddress}`);
    console.log('Transaction hash:', tx.hash);
    // Wait for receipt
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    const actualAmountOfmembers = await cdkDACContract.getAmountOfMembers();
    expect(actualAmountOfmembers.toNumber()).to.be.equal(urls.length);
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
