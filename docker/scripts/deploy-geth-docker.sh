#!/bin/bash
rm -rf docker/gethData/geth_data
rm deployment/deploy_ongoing.json
rm -rf docker/deploymentOutput/
mkdir -p docker/deploymentOutput/

# Start local geth
export DEV_PERIOD=1
DOCKER_COMPOSE="docker-compose -f docker/docker-compose.geth.yml"
$DOCKER_COMPOSE up -d geth
# Check if containers are up and running before proceeding
while [[ $($DOCKER_COMPOSE ps -q | wc -l) -ne $($DOCKER_COMPOSE ps -q --filter "status=running" | wc -l) ]]; do
    echo "Waiting for containers to start..."
    sleep 2
done
sleep 3
echo "containers started!"

# Fund L1 accounts
node docker/scripts/fund-accounts.js

# Copy deploy params. Reference: https://github.com/0xPolygon/cdk-validium-contracts/tree/main/deployment#deploy-parametersjson
cp docker/scripts/deploy_parameters_docker.json deployment/deploy_parameters.json

# 1) Deploy MATIC contract and write into deploy_parameters.json
# 2) fund sequencer eth and MATIC
# 3) fund aggregator eth
npm run prepare:testnet:CDKValidium:localhost

# Deploy the deployer contract
npx hardhat run deployment/2_deployCDKValidiumDeployer.js --network localhost

# Copy genesis json and deploy the zkEVM contracts
cp docker/scripts/genesis_docker.json deployment/genesis.json
npx hardhat run deployment/3_deployContracts.js --network localhost
mv deployment/genesis.json docker/deploymentOutput/
mv deployment/deploy_output.json docker/deploymentOutput/

docker-compose -f docker/docker-compose.geth.yml down
docker build --platform=linux/amd64 -t snapchain/geth-cdk-validium-contracts:${TAG} -f docker/Dockerfile.geth .

# Let it readable for the multiplatform build coming later!
chmod -R go+rxw docker/gethData