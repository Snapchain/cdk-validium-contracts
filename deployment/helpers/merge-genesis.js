/* eslint-disable no-console */
/*
 * Create the genesis json file to be used in the node configs
 * Usage: npm run deploy:merge:genesis <network>
 */

const fs = require('fs');

// Assuming the second JSON is stored as config.json and genesis.json respectively
const genesisFilePath = 'deploymentOutput/genesis.json';
const deployOutFilePath = 'deploymentOutput/deploy_output.json';
const outputFilePath = 'deploymentOutput/genesis.config.json';

function main() {
    // Get the network argument from the command line
    const network = process.argv[2];
    let chainId;

    // Determine the chainId based on the network
    switch (network) {
    case 'sepolia':
        chainId = 11155111;
        break;
    // Add more cases for different networks here
    default:
        console.error('chain not supported');
        return; // Exit the function if the chain is not supported
    }

    // Read and parse the genesis.json file
    const genesisData = JSON.parse(fs.readFileSync(genesisFilePath, 'utf8'));

    // Read and parse the config.json file
    const configData = JSON.parse(fs.readFileSync(deployOutFilePath, 'utf8'));

    // Construct the new JSON structure
    const newData = {
        l1Config: {
            chainId,
            polygonZkEVMAddress: configData.cdkValidiumAddress,
            maticTokenAddress: configData.maticTokenAddress,
            polygonZkEVMGlobalExitRootAddress:
        configData.polygonZkEVMGlobalExitRootAddress,
            cdkDataCommitteeContract: configData.cdkDataCommitteeContract,
        },
        genesisBlockNumber: configData.deploymentBlockNumber,
        root: genesisData.root,
        genesis: genesisData.genesis,
    };

    // Write the new JSON to a file
    fs.writeFileSync(outputFilePath, JSON.stringify(newData, null, 2), 'utf8');

    console.log(
        `New JSON file has been created at ${outputFilePath} for the ${network} network.`,
    );
}

if (require.main === module) {
    main();
}
