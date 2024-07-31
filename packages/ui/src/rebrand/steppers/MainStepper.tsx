import { ChangeEvent } from "react";
import { MinusIcon, PlusIcon } from "../icons/IconsComponents";

interface MainStepperProps {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxSupply: number;
  wrapperClassName?: string;
  containerClassName?: string;
  btnClassName?: string;
  inputClassName?: string;
}

const MainStepper = ({
  onChange,
  quantity,
  setQuantity,
  maxSupply,
  wrapperClassName = "",
  containerClassName = "",
  btnClassName = "",
  inputClassName = "",

}: MainStepperProps) => {
  return (
    <div className={`hover:bg-hornetSting global-cta-clip-path p-[1px] duration-200 ease-in ${wrapperClassName}`}>
      <div className={`flex justify-between items-center bg-nulnOil global-cta-clip-path ${containerClassName}`}>
        <button
          className={`bg-nulnOil px-[20px] py-[25px] global-cta-clip-path hover:bg-velvetBlack duration-200 ease-in ${btnClassName}`}
          type="button"
          title={`Decrease`}
          onClick={() => (quantity > 1 ? setQuantity(quantity - 1) : 1)}
        >
          <MinusIcon />
        </button>
        <input
          type="number"
          value={quantity}
          min={1}
          max={99}
          onChange={onChange}
          className={`font-bold text-3xl text-center indent-3 min-w-[30%] text-white bg-nulnOil py-[7px] focus:outline-none ${inputClassName}`}
        />
        <button
          className={`bg-nulnOil p-[20px] global-cta-clip-path hover:bg-velvetBlack duration-200 ease-in ${btnClassName}`}
          type="button"
          title={`Increase`}
          onClick={() =>
            setQuantity(quantity < maxSupply ? quantity + 1 : maxSupply)
          }
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

export default MainStepper;
