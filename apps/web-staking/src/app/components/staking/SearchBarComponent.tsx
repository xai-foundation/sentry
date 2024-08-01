import MainTitle from "../titles/MainTitle";
import { Dispatch, SetStateAction } from "react";
import MainToggle from "../ui/toggles/MainToggle";
import Checkbox from "../ui/checkboxes/Checkbox";
import Input from "../ui/inputs/BaseInput";
import { HelpIcon } from "../icons/IconsComponent";
import TableTooltip from "../ui/tooltips/TableTooltip";

interface SearchBarComponentProps {
  searchValue: string;
  showTableKeys: boolean;
  minEsXaiStake: number;
  setSearchValue: Dispatch<SetStateAction<string>>;
  setMinStakeValue: Dispatch<SetStateAction<number>>;
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
  minEsXaiStake,
  setSearchValue,
  setMinStakeValue,
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
      <div className="flex flex-col md:flex-row items-center justify-between pt-2">
        {!showTableKeys && <div className="w-full md:w-auto order-1 md:order-2">
          <div className="flex flex-nowrap items-center justify-end pt-2">
            <div className="text-lg text-americanSilver font-medium text-start md:text-end pr-2 whitespace-nowrap">
              Filter by esXAI staked:
            </div>
            <div className="content-end">
              <Input    
                widthProperties={{inputWrapper: 128}}
                type="number"   
                placeholder="0" 
                value={minEsXaiStake.toString()} 
                onChange={(e) => setMinStakeValue(Number(e.target.value))} 
                onEnter={setClickSearch}
              />
            </div>
            <div className="text-elementalGrey text-[18px] text-end ml-2 whitespace-nowrap mr-2">esXAI </div>
              <TableTooltip
                    extraClasses={{ tooltipContainer: "lg:left-auto lg:!right-[-400px] xl:left-[-400px] !left-[-340px] pb-[10px] !text-left !py-[15px] !w-[356px] bg-color:white" }}
                    content={"All Pools with less esXAI staked than this amount will be hidden. If set to 0, all pools will be shown."}
                    delay={30000}
                >
                  <HelpIcon width={14} height={14} />
                </TableTooltip></div>
        </div>}
        <span className="w-full md:flex-1 text-elementalGrey text-[18px] text-start mt-2 md:mt-0 order-2 md:order-1">
          {`Showing ${showedPools} pools ∙ ${hiddenPools} pools hidden`}
        </span>
      </div>
      </div>
  );
};

export default SearchBarComponent;