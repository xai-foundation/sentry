import { Card, Skeleton } from "@nextui-org/react";

const SkeletonComponents = () => {
  return (
    <Card className="w-[340px] space-y-5 p-4 mr-5 mb-5" radius="lg">
      <Skeleton className="rounded-lg">
        <div className="h-[250px] rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="space-y-3">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg">
          <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    </Card>
  );
};

export default SkeletonComponents;
