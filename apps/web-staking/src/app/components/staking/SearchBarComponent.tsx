import MainTitle from "../titles/MainTitle";
import { Dispatch, SetStateAction } from "react";
import MainToggle from "../ui/toggles/MainToggle";
import Checkbox from "../ui/checkboxes/Checkbox";
import Input from "../ui/inputs/BaseInput";

interface SearchBarComponentProps {
  searchValue: string;
  showTableKeys: boolean;
  setSearchValue: Dispatch<SetStateAction<string>>;
  setShowKeyInfo: Dispatch<SetStateAction<boolean>>;
  setClickSearch: () => void;
  setFilterCheckbox: (checked: boolean) => void;
  onToggleShowKeys: (showKeys: boolean) => void;
  filterCheckbox: boolean;
  showedPools: number;
  hiddenPools: number;
  userPools: number;
}

const SearchBarComponent = ({
  searchValue,
  showTableKeys,
  setSearchValue,
  setClickSearch,
  setFilterCheckbox,
  filterCheckbox,
  onToggleShowKeys,
  showedPools,
  hiddenPools,
  userPools
}: SearchBarComponentProps) => {
  return (
    <div className="w-full bg-nulnOilBackground py-5 lg:px-6 sm:px-[17px]">
      <div className={`mb-5 ${userPools > 0 ? "sm:pt-0" : "sm:pt-[65px]"} lg:pt-0`}>
        <MainTitle
          title={"Available pools"}
          classNames="text-[30px] font-bold text-white !mb-0 normal-case"
        />
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex lg:flex-row sm:flex-col-reverse justify-between"
      >
        <div className="lg:w-2/5 text-[18px]">
          <Input placeholder="Search for pool" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} withIcon onClick={setClickSearch}/>
        <div className="mt-2">
          <span className="text-elementalGrey text-[18px]">{`Showing ${showedPools} pools ∙ ${hiddenPools} pools hidden`}</span>
        </div>
        </div>
        <div className="flex sm:flex-col-reverse lg:flex-row lg:items-center w-full justify-end">
          <div className="flex mr-5">
            <div className="flex lg:ml-2 sm:mb-[25px] lg:mb-0">
              <Checkbox isChecked={filterCheckbox} onChange={(e) => setFilterCheckbox(e.target.checked)}>
                <span className="text-elementalGrey text-[18px]">
                  Hide full capacity pools
                </span>
              </Checkbox>
            </div>
          </div>

          <div
            className="w-fit sm:mb-[25px] lg:mb-0">
            <MainToggle firstBtnText="esXAI staking" secondBtnText="Key staking" onToogleShowKeys={onToggleShowKeys} showTableKeys={showTableKeys}/>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBarComponent;
