import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/react";
import MainTitle from "../titles/MainTitle";

const rows = [
  {
    key: "1",
    name: "0xAbie675hg…",
    role: "1,232 esXAI",
    status: "1 key",
    stake: "Jan 1 2024",
  },
  {
    key: "2",
    name: "0xAbie675hg…",
    role: "1,232 esXAI",
    status: "1 key",
    stake: "Jan 1 2024",
  },
  {
    key: "3",
    name: "0xAbie675hg…",
    role: "1,232 esXAI",
    status: "1 key",
    stake: "Jan 1 2024",
  },
  {
    key: "4",
    name: "0xAbie675hg…",
    role: "1,232 esXAI",
    status: "1 key",
    stake: "Jan 1 2024",
  },
];

const columns = [
  {
    key: "name",
    label: "Wallet ID",
  },
  {
    key: "role",
    label: "esXAI staked",
  },
  {
    key: "status",
    label: "Keys staked",
  },
  {
    key: "stake",
    label: "Most recent stake",
  },
];

const TableWallets = () => {
  return (
    <>
      <div className="w-full py-10">
        <div className="flex items-center mb-8">
          <MainTitle
            title="Connected wallets"
            classNames="sm:text-lg lg:text-xl font-bold !mb-0 mr-2"
          />
          <span className="text-graphiteGray">{`${rows.length > 0 ? rows.length : 0} wallets`}</span>
        </div>
        {rows.length > 0 ? (
          <Table removeWrapper aria-label="Example table with dynamic content">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  className="text-lightBlackDarkWhite sm:text-xs lg:text-base sm:px-1 lg:px-3 bg-[#F9F9F9]"
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={rows}>
              {(item) => (
                <TableRow className="border-b-1" key={item.key}>
                  {(columnKey) => (
                    <TableCell className="sm:text-xs lg:text-base sm:px-1.5 lg:px-3 sm:text-center lg:text-left">
                      {getKeyValue(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-center w-full">
            <span className="block w-[280px] text-base text-[#BBBBBB] text-center">
              No wallets connected. Wallets will appear once users stake to your
              pool.
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default TableWallets;
