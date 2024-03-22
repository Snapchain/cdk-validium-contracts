/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const ethers = require('ethers');
const fs = require('fs');

async function main() {
    const password = process.argv[2];

    if (!password) {
        console.error('Please provide a password as an argument.');
        process.exit(1);
    }

    const arrayNames = [
        '## Deployment Address',
        '## Trusted sequencer',
        '## Trusted aggregator',
        '## DAC member',
        '## Claim tx manager',
    ];

    // Generate a single mnemonic for all wallets
    const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;

    let output = `Mnemonic: ${mnemonic}\n\n`;
    for (let i = 0; i < arrayNames.length; i++) {
    // Use the same mnemonic for each wallet but derive a new path
        const path = `m/44'/60'/0'/0/${i}`;
        const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);

        output += `${arrayNames[i]}\n`;
        output += `Address: ${wallet.address}\n`;
        output += `PrvKey: ${wallet.privateKey}\n`;

        const keystoreJson = await wallet.encrypt(password);
        output += `keystore: ${keystoreJson}\n\n`;
    }

    fs.writeFileSync('wallets.txt', output);
    console.log('Output written to wallets.txt');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
