const ethers = require("ethers");
const fs = require('fs');

async function main() {
  const password = process.argv[2];
  
  if (!password) {
    console.error('Please provide a password as an argument.');
    process.exit(1);
  }

  const arrayNames = [
    "## Deployment Address",
    "\\n\\n## Trusted sequencer",
    "\\n\\n## Trusted aggregator",
    "\\n\\n## DAC member",
    "\\n\\n## Claim tx manager",
  ];

  let output = '';
  for (let i = 0; i < arrayNames.length; i++) {
    const wallet = ethers.Wallet.createRandom();
    output += `${arrayNames[i]}\n`;
    output += `Address: ${wallet.address}\n`;
    output += `PrvKey: ${wallet.privateKey}\n`;
    output += `mnemonic: "${wallet.mnemonic.phrase}"\n`;

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