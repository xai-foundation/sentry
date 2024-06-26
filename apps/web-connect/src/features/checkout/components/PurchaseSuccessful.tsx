

interface IPurchaseSuccessful {
    returnToClient: () => void;
}

const PurchaseSuccessful: React.FC<IPurchaseSuccessful> = ({ returnToClient }) => {
    // Implement your component logic here
    return (
        <div>
            <p>Transaction Successful</p>
            <button onClick={returnToClient}>Return to Client</button>
        </div>
    );
};

export default PurchaseSuccessful;
