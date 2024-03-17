#!/bin/bash
sudo docker build --platform=linux/amd64 -t snapchain/cdk-validium-contracts:{TAG} -f docker/Dockerfile .