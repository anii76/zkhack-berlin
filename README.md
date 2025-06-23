<!--
Hey, thanks for using the awesome-readme-template template.  
If you have any enhancements, then fork this project and create a pull request 
or just open an issue with the label "enhancement".

Don't forget to give this project a star for additional support ;)
Maybe you can mention me or this repo in the acknowledgements too
-->
<div align="center">

  <h1>ZFace Cash</h1>
  
  <p>
    <strong>Zero-Knowledge Face Verification for Secure Fund Claiming</strong>
  </p>
  
  
   
<h4>
    <a href="https://www.youtube.com/watch?v=QlWIbjhhyFk&t=1s/">View Demo</a>
  <span> · </span>
    <a href="https://github.com/anii76/zkhack-berlin">Documentation</a>
  <span> · </span>
    <a href="http://devfolio.co/projects/zfacecash-7589">DevFolio</a>
  </h4>
</div>

<br />


## About the Project

ZFace Cash is a revolutionary zero-knowledge proof system that enables secure fund claiming through biometric face verification. The platform allows users to deposit funds into a one time address smart contract that can only be withdrawn by proving identity through a zero-knowledge face verification process.

### Key Features

- **🔐 Zero-Knowledge Face Verification**: Users can claim funds by proving their identity through face verification without revealing their actual biometric data
- **💰 Secure Fund Management**: Smart contracts hold funds until proper face verification is completed
- **🌐 Privacy-Preserving**: No biometric data is stored on-chain, only cryptographic proofs
- **⚡ Efficient Verification**: Fast on-chain verification using Noir zero-knowledge circuits
- **🔒 Trustless Architecture**: No central authority required for identity verification

### How It Works

1. **Deposit**: Users deposit funds into a ZFace smart contract with their face encoding stored as public inputs
2. **Face Registration**: A 128-dimensional face encoding is generated and stored in the contract
3. **Claim Process**: To withdraw funds, users must provide a zero-knowledge proof that their current face matches the registered encoding
4. **Verification**: The smart contract verifies the proof on-chain using the Noir verifier
5. **Fund Release**: If verification succeeds, funds are automatically transferred to the claimant

This system ensures that only the rightful owner with the correct face can claim the funds, while maintaining complete privacy of biometric data through zero-knowledge proofs.

<!-- TechStack -->
### Tech Stack

<details>
  <summary>Frontend</summary>
  <ul>
    <li><a href="https://www.typescriptlang.org/">Typescript/Javascript</a></li>
    <li><a href="https://reactjs.org/">React.js</a></li>
    <li><a href="https://tailwindcss.com/">TailwindCSS</a></li>
  </ul>
</details>

<details>
  <summary>Smart Contracts</summary>
  <ul>
    <li><a href="https://www.typescriptlang.org/">Solidity</a></li>
    <li><a href="https://expressjs.com/">Hardhat</a></li>
    <li><a href="https://go.dev/">Typescript</a></li>
  </ul>
</details>

<details>
  <summary>Zero Knowledge</summary>
  <ul>
    <li><a href="https://www.typescriptlang.org/">Noir</a></li>
    <li><a href="https://www.typescriptlang.org/">Relayer Network</a></li>
  </ul>
</details>

<!-- Features -->
### Core Components

ZFace Cash is built with cutting-edge zero-knowledge technology:

- **Noir Circuits**: Custom zero-knowledge circuits for face verification using the Noir programming language
- **Barretenberg Backend**: High-performance proof generation and verification using the Barretenberg proving system
- **Smart Contract Integration**: Solidity contracts that verify proofs on-chain and manage fund distribution
- **Face Encoding**: 128-dimensional face embeddings for robust biometric verification
- **Threshold Verification**: Configurable similarity thresholds for face matching accuracy

The system leverages advanced cryptographic techniques to ensure that users can prove their identity without compromising their privacy or security.

### How does it work
#### 📲 On the Sender’s Phone:

1. Take a photo
2. Run a facial recognition model (e.g. [FaceAPI](http://justadudewhohacks.github.io/face-api.js/docs/index.html)) → get embedding
3. Derive one-time address (e.g. via hash of `(embedding + salt)`)
5. Send funds to that one-time address

#### 👤 On the Receiver’s App:

1. App runs the same model on selfie
2. Embedding matches → Calculates a proof of identity compared to the sender picture
3. Claims funds from one-time wallet → forwards to their real wallet
4. The one-time wallet is “emptied” and marked as burned

## ✨ Real Use Cases

- **Events**: Send POAPs/tokens by scanning people, even if they don’t have wallets
- **Street artists / musicians**: Let people tip others without needing contact
- **Allow and onboard more people onchain**

<!-- Getting Started -->
## Getting Started

<!-- Prerequisites -->
### Prerequisites

This project uses Pnpm as package manager & hardhat for smart contracts

```bash
 npm install -g pnpm
 npm install --save-dev hardhat 
```

<!-- Installation -->
### Installation

Install my-project with pnpm

```bash
  pnpm install 
```
   
<!-- Running Tests -->
### Running Tests

To run tests, run the following command

```bash
  npx hardhat compile
  npx hardhat test
```

<!-- Run Locally -->
### Run Locally

Clone the project

```bash
  git clone https://github.com/anii76/zkhack-berlin.git
```

Setup the network to deploy into in `hardhat.config.ts`.

```bash
  npx hardhat ignition deploy ignition/modules/Deployer.ts --network arbitrumSepolia --verify --deployment-id testnet-deployment-1

  npx hardhat ignition deploy ignition/modules/ZFace.ts --network arbitrumSepolia --verify --deployment-id testnet-deployment-2
```


<!-- Roadmap -->
## Roadmap

* [x] Zero-knowledge face verification circuit
* [x] Smart contract integration
* [x] Basic frontend interface
* [ ] Multi-chain deployment
* [ ] Advanced face recognition algorithms
* [ ] Mobile app integration
* [ ] Batch verification support


<!-- Contributing -->
## Contributing

<a href="https://github.com/Louis3797/awesome-readme-template/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Louis3797/awesome-readme-template" />
</a>


Contributions are always welcome!

<!-- License -->
## License

Distributed under the no License. See <a href="/LICENCE.txt">LICENSE.txt</a> for more information.


<!-- Acknowledgments -->
## Acknowledgements

