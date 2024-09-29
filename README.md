
# GARV-BI 1.0: Global Academic Record and Verification Framework

**GARV-BI (Global Academic Record and Verification)** is an open-source framework designed to securely manage and verify academic records using blockchain technology. It leverages zkEVM for privacy-preserving smart contracts, Decentralized Identifiers (DIDs) for global student identification, and IPFS for decentralized file storage.

## Features

- **zkEVM Integration**: Uses Zero-Knowledge Ethereum Virtual Machine (zkEVM) to ensure privacy while verifying academic credentials.
- **Decentralized Identifiers (DIDs)**: Provides global mobility for students by utilizing DIDs, ensuring interoperability without relying on centralized systems.
- **IPFS Integration**: Stores academic-related documents in a decentralized, secure manner.
- **Dual Blockchain**: Splits data between public and private blockchain networks to optimize transaction efficiency and privacy.
- **Open Source**: Fully open and customizable for integration with existing educational systems.

## Prerequisites

Before installing the GARV-BI framework, ensure that the following are installed on your system:

- [Node.js](https://nodejs.org/) (v18.3.1 or higher)
- [Ganache CLI](https://www.trufflesuite.com/ganache) (v6.12.2) for running local blockchain networks
- [Truffle](https://www.trufflesuite.com/truffle) (v5.11.5) for compiling, testing, and deploying smart contracts
- [IPFS](https://ipfs.io/) (v0.12.0 or higher) for decentralized file storage

## Folder Structure

```
GARV-BI/
│
├── API/                  # API server to handle requests and communicate with the blockchain
├── Private-zkEVM/        # Smart contracts for the private zkEVM network
├── Public-zkEVM/         # Smart contracts for the public zkEVM network
└── WebApp/               # Simple WebApp for prototype testing
```

## Installation and Setup

### Step 1: Clone the Repository

Clone the GARV-BI repository from GitHub:

```bash
git clone https://github.com/portfoliojuanberrios/GARV-BI.git
cd GARV-BI
```

### Step 2: Install Dependencies

Each component (API, Private-zkEVM, Public-zkEVM, WebApp) has its own set of dependencies. Navigate to each directory and install the necessary Node.js packages:

1. **API**:
    ```bash
    cd API
    npm install
    ```

2. **Private-zkEVM**:
    ```bash
    cd ../Private-zkEVM
    npm install
    ```

3. **Public-zkEVM**:
    ```bash
    cd ../Public-zkEVM
    npm install
    ```

4. **WebApp** (Optional for testing):
    ```bash
    cd ../WebApp
    npm install
    ```

### Step 3: Configure the Local Blockchain (Ganache)

To test the system locally, you will need to set up two instances of Ganache to simulate public and private blockchain networks.

1. **Start Private zkEVM Network**:
    ```bash
    ganache-cli --port 8545
    ```

2. **Start Public zkEVM Network**:
    ```bash
    ganache-cli --port 8546
    ```

### Step 4: Deploy Smart Contracts

Use Truffle to compile and deploy the smart contracts on both networks.

1. **Deploy to Private zkEVM Network**:
    ```bash
    cd Private-zkEVM
    truffle migrate --network development
    ```

2. **Deploy to Public zkEVM Network**:
    ```bash
    cd ../Public-zkEVM
    truffle migrate --network development
    ```

### Step 5: Run the API Server

After deploying the smart contracts, you can start the API server. Ensure you have the environment variables set up in a `.env` file (see the `API/.env.example` for reference).

```bash
cd ../API
npm start
```

The API server will start on `http://localhost:3001`.

### Step 6: Run the WebApp (Optional)

If you want to test the front-end WebApp that interacts with the API:

```bash
cd ../WebApp
npm start
```

The WebApp will start on `http://localhost:3000`.

## Network Configuration

The local development setup is configured as follows:

- **Private Network (Ganache)**: `http://localhost:8545`
- **Public Network (Ganache)**: `http://localhost:8546`
- **IPFS Node**: `http://localhost:5000`
- **API Server**: `http://localhost:3001`
- **WebApp (Testing)**: `http://localhost:3000`

The system architecture is based on a dual blockchain network to divide public credential verification and private data management between public and private zkEVM chains. The API serves as the mediator between the WebApp, smart contracts, and IPFS storage.

For more details on the network architecture, refer to the provided figures in the thesis report.

## Tests

### Smart Contract Testing

You can run unit tests for the smart contracts using Truffle:

```bash
cd Private-zkEVM
truffle test

cd ../Public-zkEVM
truffle test
```

### API Testing

You can also test the API endpoints using [Postman](https://www.postman.com/). A collection of pre-configured requests is included in the `API/PostmanCollection.json`.

## License

This project is open-source under the MIT License.

## Contributors

- **Juan Alamiro Berrios Moya** - [Portfolio](https://github.com/portfoliojuanberrios)

