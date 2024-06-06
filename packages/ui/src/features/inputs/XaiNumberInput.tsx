import MainStepper from "../../rebrand/steppers/MainStepper";
import { ChangeEvent } from "react";

interface XaiNumberInput {
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxSupply?: number;
}

export function XaiNumberInput({quantity, setQuantity, maxSupply = 50000}: XaiNumberInput) {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const numericInput = event.target.value.replace(/[^0-9]/g, "");
    let newAmount = parseInt(numericInput);

    if (isNaN(newAmount)) {
      newAmount = 1;
    } else if (newAmount < 1) {
      newAmount = 1;
    } else if (newAmount > maxSupply) {
      newAmount = maxSupply;
    }

    setQuantity(newAmount);
  };

  return (
    <div className="relative sm:w-full lg:w-auto">
      <MainStepper onChange={handleInputChange} quantity={quantity} setQuantity={setQuantity} maxSupply={maxSupply} />
    </div>
  );
}
