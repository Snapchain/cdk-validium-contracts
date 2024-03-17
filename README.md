## Prerequisites

- Node.js version: 16.x
- npm version: 7.x

## Setup

```bash
npm i
cp .env.example .env
```

## Build the mock L1 image with deployed CDK contracts

Run

```bash
sudo TAG=<tag> npm run docker:build:mock-l1
```

This will create a new Docker image named `snapchain/geth-cdk-validium-contracts:<tag>`, which includes a Geth node with the deployed contracts. The deployment output can be found at `docker/deploymentOutput/deploy_output.json`.

To run the Docker container, use:

```bash
docker run -p 8545:8545 snapchain/geth-cdk-validium-contracts:<tag>
```

Note: if the new image will be used in https://github.com/Snapchain/zkValidium-quickstart/blob/main/docker-compose.yml, we also need to:
- get the genesis block number in `docker/deploymentOutput/deploy_output.json`
- update [the genesis file](https://github.com/Snapchain/zkValidium-quickstart/blob/main/config/node/genesis.config.json)
    - use `deployment/genesis.json` to update the `root` and `genesis` fields
    - use the genesis block number to update the `genesisBlockNumber` field
    - use `docker/deploymentOutput/deploy_output.json` to update the `l1Config` field
        - `maticTokenAddress` likely needs to be updated
- update [the bridge config file](https://github.com/Snapchain/zkValidium-quickstart/blob/main/config/bridge/config.toml)
    - `GenBlockNumber`: the updated genesis block number
    - `L2PolygonBridgeAddresses`: "PolygonZkEVMBridge implementation" contract in [the genesis file](https://github.com/Snapchain/zkValidium-quickstart/blob/main/config/node/genesis.config.json)
- update `POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS` in the [compose file](https://github.com/Snapchain/zkValidium-quickstart/blob/main/docker-compose.yml) and a few other contract addresses if needed

## Build the cdk-validium-contracts image

Run

```bash
sudo TAG=<tag> npm run docker:build
```

This will create a new Docker image named `snapchain/cdk-validium-contracts:local`, which contains this entire repo. This is useful to run one-off operational commands.

## Publish Images
First login with your Docker ID on Docker Hub using using access token:

```bash
docker login -u snapchain
```

If you don't have the access token, create one at: https://hub.docker.com/settings/security.

Then you can push the images built from previous step:

```bash
TAG=<tag> npm run docker:push:mock-l1
TAG=<tag> npm run docker:push
```

## Test
On a linux machine with amd64 architecture, copy docker/docker-compose.dac-setup.yml to docker-compose.yml, run

```bash
sudo docker compose up -d
sudo docker compose logs dac-setup-committee
```

You should see sth like:
```
dac-setup-committee           | 
dac-setup-committee           | > cdk-validium-contracts@0.0.1 setup:committee
dac-setup-committee           | > node docker/scripts/setup-committee.js
dac-setup-committee           | 
dac-setup-committee           | DAC_URL: http://zkevm-data-availability:8444
dac-setup-committee           | DAC_ADDRESS: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
dac-setup-committee           | JSONRPC_HTTP_URL: http://zkevm-mock-l1-network:8545
dac-setup-committee           | Using pvtKey deployer with address:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
dac-setup-committee           | Committee seted up with 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
dac-setup-committee           | Transaction hash: 0x5d6d090ff6cd632802aa8456acc3f34804fefa8fd87d41ad09e2015b5c661695
dac-setup-committee           | Transaction confirmed in block: 98
```

Then run the following command to clean up:

```bash
sudo docker compose down
```

## Trouble Shooting
1. when building images, you might see error
    ```
    => ERROR [internal] load metadata for docker.io/library/node:18-bullseye                0.4s
    ------
    > [internal] load metadata for docker.io/library/node:18-bullseye:
    ------
    failed to solve with frontend dockerfile.v0: failed to create LLB definition: rpc error: code = Unknown desc = error getting credentials - err: exit status 1, out: ``.
    ```
    You can run `rm  ~/.docker/config.json` to fix it ([reference](https://stackoverflow.com/questions/66912085/why-is-docker-compose-failing-with-error-internal-load-metadata-suddenly))

2. if `docker login` doesn't work with the password, you need to create and use an access token.
