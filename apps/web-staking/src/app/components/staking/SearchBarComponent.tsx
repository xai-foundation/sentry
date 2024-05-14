import MainTitle from "../titles/MainTitle";
import { Dispatch, SetStateAction } from "react";
import { SearchIcon } from "../icons/IconsComponent";
import { PoolInput } from "../input/InputComponent";
import { Button } from "@nextui-org/react";

interface SearchBarComponentProps {
  searchValue: string;
  showTableKeys: boolean;
  setSearchValue: Dispatch<SetStateAction<string>>;
  setShowKeyInfo: Dispatch<SetStateAction<boolean>>;
  setClickSearch: () => void;
  setFilterCheckbox: (checked: boolean) => void;
  onToggleShowKeys: (showKeys: boolean) => void;
  filterCheckbox: boolean;
}

const SearchBarComponent = ({
  searchValue,
  showTableKeys,
  setSearchValue,
  setClickSearch,
  setFilterCheckbox,
  filterCheckbox,
  onToggleShowKeys
}: SearchBarComponentProps) => {
  return (
    <div className="w-full mb-5">
      <div className="mb-5">
        <MainTitle
          title={"Available pools"}
          classNames="text-xl font-bold !mb-0"
        />
      </div>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex lg:flex-row sm:flex-col-reverse justify-between"
      >
        <div className="lg:w-2/5">
          <PoolInput
            value={searchValue}
            placeholder="Search for pool"
            label=""
            startContent={
              <button onClick={setClickSearch}>
                <SearchIcon />
              </button>
            }
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className="flex sm:flex-col lg:flex-row lg:items-center">
          <div className="flex mr-5 w-full">
            <div className="flex ml-2">
              <div className="py-[2px] mr-[10px]">
                <input
                  checked={filterCheckbox}
                  className="accent-red w-4 h-3.5 border-0 rounded-md focus:ring-0"
                  type="checkbox"
                  onChange={(e) => setFilterCheckbox(e.target.checked)}
                />
              </div>
              <div>
                <span className="text-graphiteGray sm:text-sm lg:text-base">
                  Hide full capacity pools
                </span>
              </div>
            </div>
          </div>

          <div
            className="flex justify-between w-full max-w-[280px] items-center rounded-3xl bg-crystalWhite h-[45px] sm:mb-3 lg:mb-0">
            <Button
              onClick={() => onToggleShowKeys(false)}
              className={`font-medium border border-crystalWhite py-3 px-7 bg-crystalWhite rounded-3xl ${!showTableKeys && "bg-lightWhiteDarkBlack border-[#DDDDDD]"
              }`}
            >
              esXAI staking
            </Button>
            <Button
              onClick={() => onToggleShowKeys(true)}
              className={`font-medium border border-crystalWhite py-3 px-7 bg-crystalWhite rounded-3xl ${showTableKeys && "bg-lightWhiteDarkBlack border-[#DDDDDD]"
              }`}
            >
              Key staking
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBarComponent;
