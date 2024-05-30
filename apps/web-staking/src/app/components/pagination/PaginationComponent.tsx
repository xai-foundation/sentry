import { PoolInfo } from "@/types/Pool";
import { Pagination } from "@nextui-org/react";

interface PaginationComponentProps {
  pools: PoolInfo[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const PaginationComponent = ({
  page,
  setPage,
  totalPages,
}: PaginationComponentProps) => {
  return (
    <Pagination
      isCompact
      showControls
      initialPage={1}
      page={page}
      total={totalPages}
      variant="light"
      onChange={(page) => setPage(page)}
      classNames={{
        wrapper: "bg-transparent",
        item: "bg-transparent",
        cursor:
          "bg-crystalWhite font-medium text-graphiteGray border rounded-md",
      }}
    />
  );
};

export default PaginationComponent;
