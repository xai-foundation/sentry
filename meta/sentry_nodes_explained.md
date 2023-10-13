# How do Sentry Nodes Work
The Attention challenges v2 protocol involves several actors including the Xai chain, a parent chain (Arbitrum One), a trusted Challenger, the Xai Sentries and their license, and a Referee contract. The Challenger creates a BLS key-pair, registers the public key with the Referee, and signs assertions made by validators in the Xai rollup protocol on Arbitrum One. These signatures are verified by the Referee and recorded as challenges associated with the assertions.

Xai Sentries can register with the Referee by purchasing a Node License to be eligible to post claims with respect to an assertion. They get the state root of the correct assertion that will be the successor of a posted assertion, and if a certain condition is met, they post a claim on the assertion by calling the Referee. If a successor assertion is created and confirmed, and the watchtower posted a correct claim, the watchtower contacts the Referee to post a redeem transaction. The Referee verifies several conditions before paying a reward to the watchtower.

The protocol ensures that each assertion must consume exactly the inbox messages that existed when its predecessor assertion was created. This means that as soon as an assertion is created, the state root of its correct successor assertion is fully determined, and can be calculated by any node. This incentivizes each Sentry to determine the correct next state root. The reward for a Sentry depends on the Sentry's state license ID, the successor state root, and a challenge value that does not become known until after the successor state root is fully determined.


## Who Can Operate A Node
Anyone can operate a node by downloading the software. However, to submit claims and receive rewards, a Node License must be purchased. The process of purchasing a Node License is handled by a specific contract. This contract allows a user to mint a new Node License token by sending the correct amount of Ether. The price for minting a Node License token is determined by an increasing threshold system, where at certain sale amounts, the price of licenses increases.

Once a user has a Node License, they can register with the Referee by calling a specific function in another contract. This function checks that the Node License is valid and that the user is either the owner of the Node License or an approved operator. If these conditions are met, the user's assertion is submitted to the challenge.

The contract also includes a function that allows a user to claim a reward for a successful assertion. This function checks that the challenge is closed for submissions and that the owner of the Node License is KYC'd. If these conditions are met and the assertion is valid for a payout, a reward is sent to the user.

## Referee Smart Contract
The Referee Smart Contract is a crucial component in the Xai ecosystem. It is responsible for managing and validating assertions made by the Sentry Nodes in the network. The contract has several key functionalities:

- **Submission of Assertions**: The contract allows Sentry Nodes to submit assertions to a challenge. This function can only be called by the owner of a NodeLicense or addresses they have approved on this contract. The function checks if the challenge is open for submissions and if the NodeLicense hasn't already been submitted for this challenge.

- **Claiming Rewards**: The contract includes a function that allows a user to claim a reward for a successful assertion. This function checks if the challenge is closed for submissions and if the owner of the NodeLicense is KYC'd. If these conditions are met and the assertion is valid for a payout, a reward is sent to the user.

- **Creating Assertion Hash and Checking Payout**: The contract has a function that creates a hash of the NodeLicense ID, challenge ID, challengerSignedHash from the challenge, and the successor state root. It then checks if the hash is below a certain threshold, which is calculated based on the total number of NodeLicenses that have been minted. If the hash is below the threshold, the assertion is valid for a payout.

The Referee contract ensures the integrity of the Xai network by validating assertions and rewarding successful ones, thereby incentivizing Sentry Nodes to monitor the network accurately and diligently.

## Challenger Component
The Challenger is a trusted entity in the Xai ecosystem. It creates a BLS key-pair and registers the public key with the Referee. When an assertion is made by a validator in the Xai rollup protocol, the Challenger signs the assertion with its private key and submits the signature to the Referee. The Referee verifies the signature and records it as a challenge associated with the assertion. This process ensures the integrity of the assertions made in the Xai rollup protocol.

## Key (NFT based)
The Node License is a unique, non-fungible token (NFT) that is required to operate a Sentry Node in the Xai network. The Node License serves as a proof of eligibility for a node to submit claims and receive rewards. It is minted by sending the correct amount of Ether, and the price for minting is determined by an increasing threshold system.

The Node License plays a crucial role in the Referee contract. When a node wants to submit an assertion to a challenge, it must provide its Node License ID. The Referee contract checks if the Node License is valid and if the node is either the owner of the Node License or an approved operator. If these conditions are met, the node's assertion is submitted to the challenge.

The Node License also plays a role when claiming a reward for a successful assertion. The Referee contract checks if the owner of the Node License is KYC'd and if the assertion is valid for a payout. If these conditions are met, a reward is sent to the owner of the Node License.

In summary, the Node License is a key component in the Xai network that regulates the operation of Sentry Nodes, the submission of assertions, and the distribution of rewards.

## Node Download and Operation
To operate a node, users need to download and use a Core library. This library is utilized in both a Command Line Interface (CLI) application and a desktop application. These applications serve as wrappers for the Node software supplied by the Core library. 

The Core library is designed to automate all the necessary steps to run a node/Sentry. It simplifies the process of setting up and running a node, making it accessible for users with varying levels of technical expertise.

The Core library handles tasks such as setting up the node environment, managing node operations, and interacting with the Referre. It also provides a user-friendly interface for monitoring node status and managing node settings. By using the Core library, users can focus on the strategic aspects of operating a node, such as optimizing their node's performance and maximizing their rewards.

The primary method for running the Core library is through the Desktop client or the CLI. Both of these are designed to be user-friendly and provide a seamless experience for operating a node.

## Operator Functionality
In the Xai ecosystem, an Operator plays a crucial role in the interaction between the Sentry Nodes and the Referee Smart Contract. The Operator acts as an intermediary agent responsible for submitting assertions to the Referee on behalf of the associated node. This is facilitated through specific functions in the Referee contract that can only be called by the owner of a Node License or addresses they have approved on this contract.

The Operator can submit an assertion to a challenge by calling the `submitAssertionToChallenge` function in the Referee contract. This function checks if the challenge is open for submissions and if the Node License hasn't already been submitted for this challenge. If these conditions are met, the node's assertion is submitted to the challenge.

The Operator can also claim a reward for a successful assertion by calling the `claimReward` function in the Referee contract. This function checks if the challenge is closed for submissions and if the owner of the Node License is KYC'd. If these conditions are met and the assertion is valid for a payout, a reward is sent to the Operator.

In summary, the Operator serves as a messenger facilitating the interaction between the node and the Referee, thereby ensuring the smooth operation of the Xai network.

## Licensing Impact
A node/Sentry is able to operate multiple licenses on a single machine. However, putting more licenses on a singular node does increase the amount of throughput that your computer will need for the license, including the hashing of submissions and submitting claims to the chain.
