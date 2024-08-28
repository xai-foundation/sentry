---
id: operator-runtime-mermaid
title: Operator Runtime Flow
sidebar_label: Operator Runtime Flow
sidebar_position: 3
---

# Operator Runtime Flow Diagram

This diagram illustrates the flow and interactions within the `operatorRuntime` function and its related functions in the Sentry Core package.

```mermaid
graph TD;
    operatorRuntime --> getSubgraphHealthStatus
    operatorRuntime <--> fetchBlockNumber
    operatorRuntime <--> stop
    loadOperatorKeysFromGraph <--> getSentryWalletsForOperator
    loadOperatorKeysFromGraph <--> getSentryKeysFromGraph
    loadOperatorKeysFromGraph <--> getPoolInfosFromGraph

    getSubgraphHealthStatus <--> |Subqraph is healthy| loadOperatorKeysFromGraph

    getSubgraphHealthStatus --> listenForChallengesCallback
    getSubgraphHealthStatus --> processNewChallenge
    getSubgraphHealthStatus --> processPastChallenges

        listenForChallengesCallback <--> compareWithCDN
        listenForChallengesCallback --> processNewChallenge
        listenForChallengesCallback --> processClosedChallenges

            compareWithCDN <--> getPublicNodeFromBucket

            processClosedChallenges --> processClaimForChallenge

                processClaimForChallenge --> claimRewardsBulk


        processNewChallenge <--> createAssertionHashAndCheckPayout
        processNewChallenge --> submitMultipleAssertions

        processPastChallenges --> processClosedChallenges
```

<br/><br/>

```mermaid
graph TD;
    operatorRuntime --> getSubgraphHealthStatus
    operatorRuntime <--> fetchBlockNumber
    operatorRuntime <--> stop
    loadOperatorKeysFromRPC <--> listOwnersForOperator
    loadOperatorKeysFromRPC <--> reloadPoolKeysForRPC
    loadOperatorKeysFromRPC <--> syncOwnerStakedKeysForRPC


    getSubgraphHealthStatus <--> |Subqraph is not healthy| loadOperatorKeysFromRPC
    listOwnersForOperator --> getOwnerCountForOperator & getOwnerForOperatorAtIndex
    reloadPoolKeysForRPC --> getOwnerOrDelegatePools & getKeysOfPool
    syncOwnerStakedKeysForRPC --> getUserInteractedPools & getUserStakedKeysOfPool

    getSubgraphHealthStatus --> listenForChallengesCallback
    getSubgraphHealthStatus --> processNewChallenge
    getSubgraphHealthStatus --> processPastChallenges

        listenForChallengesCallback <--> compareWithCDN
        listenForChallengesCallback --> processNewChallenge
        listenForChallengesCallback --> processClosedChallenges

            compareWithCDN <--> getPublicNodeFromBucket

            processClosedChallenges --> processClaimForChallenge
            
                processClaimForChallenge --> claimRewardsBulk
    

        processNewChallenge <--> createAssertionHashAndCheckPayout
        processNewChallenge --> submitMultipleAssertions

        processPastChallenges --> processClosedChallenges
```
<br/><br/>

```mermaid
sequenceDiagram
    title Subqraph is healthy
    participant operatorRuntime
    participant getSubgraphHealthStatus
        
        participant loadOperatorKeysFromGraph 

            participant getPoolInfosFromGraph
            participant listenForChallengesCallback
                participant compareWithCDN

            participant processPastChallenges

                participant processNewChallenge
                participant processClosedChallenges
            

    participant fetchBlockNumber
    participant stop

    operatorRuntime->>getSubgraphHealthStatus: Gets the health status for the subgraph
    getSubgraphHealthStatus-->>operatorRuntime: Returns true
    getSubgraphHealthStatus->>listenForChallengesCallback: Listens for new challenges
        listenForChallengesCallback->>compareWithCDN: Compare the challenge confirm data with the CDN from public node
        compareWithCDN-->>listenForChallengesCallback: Return boolean
            listenForChallengesCallback->>processNewChallenge: After comparison process the new challenge
                processNewChallenge->>submitMultipleAssertions: Submit winning keys from challenge
    getSubgraphHealthStatus->>loadOperatorKeysFromGraph: On healthy subgraph gets the operator keys from subgraph
    loadOperatorKeysFromGraph-->>getSubgraphHealthStatus: Returns sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig
        loadOperatorKeysFromGraph->>getPoolInfosFromGraph: Gets the PoolInfos from the subgraph
        getPoolInfosFromGraph-->>loadOperatorKeysFromGraph: Returns poolInfo
    
    getSubgraphHealthStatus->>processNewChallenge: Get last claimable challenge from subgraph
        processNewChallenge->>submitMultipleAssertions: Submit winning keys from last claimable challenge

    getSubgraphHealthStatus->>processClosedChallenges: Check for unclaimed closed challenges
        processClosedChallenges->>claimRewardsBulk: Process claimable past challenge and claim rewards

    operatorRuntime->>fetchBlockNumber: Fetches block number periodically
    operatorRuntime->>stop: Stops the operator runtime
    stop-->>operatorRuntime: Returns stop confirmation
```

<br/><br/>

```mermaid
sequenceDiagram
    title Subqraph is not healthy
    participant operatorRuntime
    participant getSubgraphHealthStatus

        participant loadOperatorKeysFromRPC

            participant listenForChallengesCallback
                participant compareWithCDN

            participant processPastChallenges

                participant processNewChallenge
                participant processClosedChallenges


    participant fetchBlockNumber
    participant stop

    operatorRuntime->>getSubgraphHealthStatus: Gets the health status for the subgraph
    getSubgraphHealthStatus-->>operatorRuntime: Returns false
    getSubgraphHealthStatus->>listenForChallengesCallback: Listens for new challenges
        listenForChallengesCallback->>compareWithCDN: Compare the challenge confirm data with the CDN from public node
        compareWithCDN-->>listenForChallengesCallback: Return boolean
            listenForChallengesCallback->>processNewChallenge: After comparison process the new challenge
                processNewChallenge->>submitMultipleAssertions: Submit winning keys from challenge
    getSubgraphHealthStatus->>loadOperatorKeysFromRPC: When subgraph is not healthy gets the operator keys from RPC
    loadOperatorKeysFromRPC-->>getSubgraphHealthStatus: Returns sentryKeysMap, nodeLicenseIds
    
        loadOperatorKeysFromRPC->>reloadPoolKeysForRPC: Get the keys from pools operator should operate
        reloadPoolKeysForRPC-->>syncOwnerStakedKeysForRPC: Returns sentryKeysMap
    
        loadOperatorKeysFromRPC->>syncOwnerStakedKeysForRPC: Get all the assigned pools from keys of owners
        syncOwnerStakedKeysForRPC-->>loadOperatorKeysFromRPC: Returns sentryKeysMap

    getSubgraphHealthStatus->>processNewChallenge: Get last claimable challenge from RPC
        processNewChallenge->>submitMultipleAssertions: Submit winning keys from last claimable challenge

    getSubgraphHealthStatus->>processClosedChallenges: Check for unclaimed closed challenges
        processClosedChallenges->>claimRewardsBulk: Process claimable past challenge and claim rewards

    operatorRuntime->>fetchBlockNumber: Fetches block number periodically
    operatorRuntime->>stop: Stops the operator runtime
    stop-->>operatorRuntime: Returns stop confirmation
```
