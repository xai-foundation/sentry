import React from "react";
import { useCrossmintEvents } from "@crossmint/client-sdk-react-ui";

interface MintingProps {
  orderIdentifier: string;
}

const Minting: React.FC<MintingProps> = ({ orderIdentifier }) => {
  const [status, setStatus] = React.useState<string>("pending"); // ["pending", "success", "failure"]
  const [result, setResult] = React.useState<any>(null);
  const environment = "staging";
  const { listenToMintingEvents } = useCrossmintEvents({
    environment: environment,
  });

  if (status === "pending") {
    listenToMintingEvents({ orderIdentifier }, (event) => {
      switch (event.type) {
        case "transaction:fulfillment.succeeded":
          setStatus("success");
          setResult(event.payload);
          break;
        case "transaction:fulfillment.failed":
          setStatus("failure");
          break;
        default:
          break;
      }
      console.log(event.type, ":", event);
    });
  }

  return (
    <>
      <div className="text-white font-mono p-5 text-center">
        {status === "pending" && (
          <>
            <h3 className="text-white">Minting your NFT...</h3>
            <div className="text-white">This may take up to a few minutes</div>
          </>
        )}
        {status === "success" && (
          <>
            <h3 className="text-white">NFT Minted Successfully!</h3>
            <div className="mt-10">
              <a
                target="_blank"
                className="block bg-[#663399] rounded-lg mt-3 p-3 text-white"
                href={`https://sepolia.arbiscan.io/tx/${result?.txId}`}
              >
                View on Arbiscan
              </a>
              <a
                target="_blank"
                className="block bg-[#81feab] rounded-lg mt-3 p-3 text-black"
                href={`https://staging.crossmint.com/user/collection/polygon-amoy:${result?.contractAddress}:${result?.tokenIds[0]}`}
              >
                View in Crossmint
              </a>
            </div>
          </>
        )}
        {status === "failure" && (
          <>
            <h3 className="text-white">Failed to Mint NFT</h3>
            <p className="text-white">
              Something went wrong. You will be refunded if the mint cannot be
              fulfilled successfully.
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default Minting;