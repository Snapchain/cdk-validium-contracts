FROM node:18-bullseye

# Set the working directory
WORKDIR /cdk-validium-contracts

# Copy package.json to the container
# Note: package-lock.json should not be copied b/c it can vary on different architecure machines (e.g. Apple M1 chip)
COPY package.json ./

# Install cdk-validium-contracts dependencies
RUN npm install

# Copy the entire cdk-validium-contracts
COPY . .

CMD ["/bin/sh"]