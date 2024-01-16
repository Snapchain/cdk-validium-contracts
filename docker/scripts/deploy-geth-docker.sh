#!/bin/bash
sudo rm -rf docker/gethData/geth_data
rm deployment/deploy_ongoing.json

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

node docker/scripts/fund-accounts.js
cp docker/scripts/deploy_parameters_docker.json deployment/deploy_parameters.json
cp docker/scripts/genesis_docker.json deployment/genesis.json
npx hardhat run deployment/testnet/prepareTestnet.js --network localhost
npx hardhat run deployment/2_deployCDKValidiumDeployer.js --network localhost
npx hardhat run deployment/3_deployContracts.js --network localhost
mkdir docker/deploymentOutput
mv deployment/deploy_output.json docker/deploymentOutput
docker-compose -f docker/docker-compose.geth.yml down
sudo docker build --platform=linux/amd64 -t snapchain/geth-cdk-validium-contracts:local -f docker/Dockerfile.geth .
# Let it readable for the multiplatform build coming later!
sudo chmod -R go+rxw docker/gethData