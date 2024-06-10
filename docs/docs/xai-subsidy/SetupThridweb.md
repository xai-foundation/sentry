# How to add a project to Thirdweb

## Step 1 - Select Engine

Go to the [Engine Dashboard](https://thirdweb.com/dashboard/engine) and Select the Engine to be used for this project. You will need Admin access for all steps.

## Step 2 - Add Backend Wallet

Go to `Overview` and click `Create`. Each Project should have their own wallet. Add a label to identify the wallet easier. This wallet needs to be funded as it will pay for the transaction fees.

## Step 3 - Create Relayer

Now you can create the Relayer. Go to the tab `Relayers`. Click `Add Relayer` and fill out all fields. All values can be changed at a later point:

1. **Chain**: Search for and select `Xai`
2. **Backend Wallet**: The backend wallet you created in step 2.
3. **Label**: Project Name.
4. **Allowed Contracts**: The project´s contract addresses for sponsored transactions (should be provided by the project).
5. **Allowed Forwarders**: the allowed forwarder contract addresses to be used by this project. Default will be the XAI Forwarder (`0xADDRESS`). 

## Step 4 - Relayer ID

Once the Relayer is created you can copy the URL, which looks like this: `https://engineId.thirdweb.com/relayer/relayerId`. Copy the URL. It will be needed to add the project to the XAI Relayer API.