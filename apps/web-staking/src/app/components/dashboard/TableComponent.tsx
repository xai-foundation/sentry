import { useGetTiers } from "@/app/hooks/useGetTiers";
import { formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";
import Image from "next/image";

const POOL_DATA_COLUMNS = [
  "TIER",
  "esXAI STAKING REQUIREMENT",
  "REWARD PROBABILITY MULTIPLIER"
];

const POOL_MOBILE_DATA_COLUMNS = [
  "TIER",
  "esXAI STAKING REQUIREMENT",
  "REWARD PROBABILITY"
];

const TableComponent = () => {
  const { tiers } = useGetTiers();

  return (
    <table className="min-w-full text-base ">
      <thead>
      <tr className="hidden md:table-row">
        {POOL_DATA_COLUMNS.map((data, index) => {
          return (
            <th
              scope="col"
              className={`text-wrap py-[15px] bg-dynamicBlack/75 border-y-1 border-chromaphobicBlack text-elementalGrey font-semibold lg:text-base sm:text-sm
						${index === 0 ? "text-left !pl-[23px] md:w-auto md:align-baseline align-bottom" : "text-right"} 
						${index === 1 ? "px-[20px] pl-[30px] md:px-0" : ""} 
						${index === 2 ? "lg:px-4 !pr-[23px] md:w-[300px] w-[90px]" : "lg:px-6"}
                        `}
              key={data}
            >
              {data}
            </th>
          );
        })}
      </tr>
      <tr className="md:hidden table-row">
        {POOL_MOBILE_DATA_COLUMNS.map((data, index) => {
          return (
            <th
              scope="col"
              className={`text-wrap py-[10px] bg-dynamicBlack/75 border-y-1 border-chromaphobicBlack text-elementalGrey font-semibold lg:text-base sm:text-sm
						${index === 0 ? "text-left mr-[300px] pl-[17px] md:w-auto w-[133px] md:align-baseline align-bottom" : "text-right"} 
						${index === 1 ? "px-[20px] pl-[30px] md:px-0" : ""} 
						${index === 2 ? "lg:pl-4 !pr-[17px] max-w-[90px]" : "lg:px-6"}
                        `}
              key={data}
            >
              {data}
            </th>
          );
        })}
      </tr>
      </thead>
      <tbody>
      {tiers.map((data, index) => {
        const formattedRequirements = formatCurrencyNoDecimals.format(data.minValue);
        return <tr
          key={data.index}
          className={`${index !== tiers.length - 1 ? "border-b-1" : "border-b-0"} border-chromaphobicBlack text-right bg-nulnOil/75`}
        >
          <td
            className="whitespace-nowrap lg:pr-6 lg:py-4 lg:text-base text-graphiteGray text-left font-medium
              sm:text-xs pl-[23px]"
          >
            <Image src={data.label!} alt="" />
          </td>
          <td
            className="lg:whitespace-nowrap text-americanSilver lg:px-6 lg:py-4 font-medium text-lg w-max md:pr-0 pr-[20px]">
            <span>{formattedRequirements} <span className="hidden md:inline">staked</span> esXAI</span>
            </td>
          <td
            className="whitespace-nowrap lg:px-4 py-4 text-americanSilver font-medium text-lg lg:!pr-[23px] !pr-[17px]">
            {data.reward} <span className="hidden md:inline">Reward Probability</span>
            </td>
          </tr>
      })}
      </tbody>
    </table>
  );
};

export default TableComponent;
