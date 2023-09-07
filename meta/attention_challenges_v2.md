# Attention challenges v2 (External)

Actors in the protocol:

- an Arbitrum chain,
- a parent chain, where the Arbitrum chain’s assertion/rollup protocol is running,
- a trusted Challenger (which will be described as centralized, but could in principle be a committee)
- a set of watchtower validators for the Arbitrum chain
- a Referee contract (described here as running on the parent chain, but could be implemented on the Arbitrum chain in principle)

### Challenger

A trusted party called the Challenger creates a BLS key-pair, and registers the public key with the Referee.

When an assertion $A$ is made by some validator in the Arbitrum rollup protocol, the Challenger signs (assertion ID, predecessor assertion ID, state root, timestamp of assertion) with its private key, using a deterministic signature scheme such as BLS, and submits the signature to the Referee. The Referee verifies the signature, and records the signature as the challenge $C_A$ associated with assertion $A$.

### Watchtowers

A watchtower can register its address with the Referee, and deposit a stake. The watchtower will be eligible to post claims with respect to an assertion, if the assertion’s predecessor was created after the watchtower registered.

When a registered watchtower sees a correct assertion $A$ posted, it retrieves the associated challenge $C_A$. The watchtower locally computes $S$, the state root of the correct assertion that will be $A$’s successor.

Next, the watchtower $W$ computes $X_{A,W} = \mathrm{Hash}(\mathrm{addr}_W || \mathrm{ID}_A||C_A||S)$.  If $X_{A,W} < T$, for a public threshold value $T$, then the watchtower posts a claim on assertion A by calling the Referee. The Referee remembers $(\mathrm{addr}_W, \mathrm{ID}_A, C_A, t)$ where $t$ is the time when the claim was made.

Later, if a successor assertion $A'$ is created at time $t'$, and $A'$ is eventually confirmed, then if the watchtower posted a correct claim, the watchtower contacts the Referee to post a redeem transaction giving the Referee $(\mathrm{addr}_W, \mathrm{ID}_A, C_A, t)$ and $A'$.  

Anyone is allowed to post the redeem transaction.

To execute the redeem transaction on $A'$ and the tuple $(\mathrm{addr}_W, \mathrm{ID}_A, C_A, t)$, the Referee verifies that:

- the tuple is a claim that was previously made,
- $A$ is the predecessor of $A'$,
- $A'$ has been confirmed,
- $t < t'$
- $\mathrm{Hash}(\mathrm{addr}_W || \mathrm{ID}_A||C_A||S) < T$, where $S$ is the state root in $A'$

If all of these things are true, the Referee pays a reward to $W$ and deletes the claim. If all of these except the last one are true, the Referee concludes that the initial claim was wrong, so it slashes $W$, removes $W$ from the set of registered watchtowers, and makes a small payment to the claim transaction’s sender as a reward for reporting the false claim. 

### Why it works

Under challenge protocol v2, each assertion must consume exactly the inbox messages that existed when its predecessor assertion was created. This means that as soon as an assertion is created, the state root of its correct successor assertion is fully determined, and can be calculated by any node.

The concept behind this protocol is that during the time period when the state root of the next correct assertion has been fully determined but has not yet been asserted, each watchtower validator has a small probability to collect a reward, but in order to know if it is eligible for this, the watchtower must know the correct next state root. This incents each watchtower to determine the correct next state root.

A watchtower’s reward result depends on the watchtower’s address, the successor state root, and a challenge value that does not become known until after the successor state root is fully determined. (The challenge value prevents a watchtower from manipulating the successor state root in order to improve its chances of reward.)

### Economics

The system as described so far pays a fixed reward per time (in expectation) to each participating watchtower. So there needs to be some structure to control the overall cost, otherwise we might have a huge number of participants with a corresponding huge cost.

One approach is to use invited watchtowers.  The chain’s owner would invite a specific set of known parties to participate, and participation would be limited to that set. If the chain wants to pay rewards to its invited validators, those could be paid out through this mechanism, so that payment is contingent on the validators doing their jobs.

Alternatively, a chain could use an approach where parties stake or pay for the privilege of participating in the protocol, through some kind of auction or lottery type functionality. Such a mechanism might be used to choose a fixed number of participants, thereby ensuring that in equilibrium the payments received in the initial auction equal the net present value of the expected cost of operating the system.

[https://www.notion.so/arbitrum/Attention-challenges-v2-External-391b9dc80a2b4c8490e042a7baf63606?pvs=4](https://www.notion.so/Attention-challenges-v2-External-391b9dc80a2b4c8490e042a7baf63606?pvs=21)