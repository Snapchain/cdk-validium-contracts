/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/*
 *Usage: npm run deploy:approve:matic <network>
 */

const { ethers } = require('hardhat');
require('dotenv').config();

const deployOutput = require('../../deploymentOutput/deploy_output.json');

async function main() {
    // Load provider
    const { provider } = ethers;

    // Load signer - sequence sender
    const signer = (await ethers.getSigners())[1];

    const maticTokenFactory = await ethers.getContractFactory(
        'ERC20PermitMock',
        provider,
    );
    const maticTokenContract = maticTokenFactory.attach(
        deployOutput.maticTokenAddress,
    );
    const maticTokenContractWallet = maticTokenContract.connect(signer);
    const tx = await maticTokenContractWallet.approve(
        deployOutput.cdkValidiumAddress,
        ethers.utils.parseEther('100.0'),
    );
    console.log('Transaction hash:', tx.hash);
    // Wait for receipt
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
}

// to prevent execution by accident on import
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
