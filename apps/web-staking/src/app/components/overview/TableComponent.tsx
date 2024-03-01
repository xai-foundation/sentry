import { POOL_DATA_COLUMS, POOL_DATA_ROWS } from "./constants/constants";

const TableComponent = () => {
  return (
    <table className="min-w-full text-base font-light">
      <thead className="border-b">
        <tr>
          {POOL_DATA_COLUMS.map((data, index) => {
            return (
              <th
                scope="col"
                className={`py-4 bg-crystalWhite font-medium lg:text-base sm:text-sm
						${index === 0 ? "text-left mr-[300px]" : "text-right"} 
						${index === 2 ? "lg:px-4" : "lg:px-6"}
                        }`}
                key={data}
              >
                {data}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {POOL_DATA_ROWS.map((data, index) => {
          return (
            <tr key={index} className={`border-b text-right`}>
              <td
                className="whitespace-nowrap lg:px-6 lg:py-4 lg:text-base text-graphiteGray text-left font-medium
              sm:text-xs"
              >
                <div className="flex items-center">
                  <span className="relative pr-3 pl-9 py-1 rounded-2xl border">
                    <span className="absolute lg:top-2 left-3 sm:top-1">
                      {data.icon && data.icon({ width: 16, height: 13.5 })}
                    </span>
                    {data.iconText}
                  </span>
                </div>
              </td>
              <td className="lg:whitespace-nowrap text-graphiteGray lg:px-6 lg:py-4">
                {data.requirement}
              </td>
              <td className="whitespace-nowrap text-graphiteGray lg:px-4 py-4">
                {data.reward}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TableComponent;
