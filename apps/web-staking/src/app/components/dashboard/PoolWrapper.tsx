const PoolWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-w-full mt-5">
      <div className="inline-block min-w-full lg:pt-2 sm:pt-4 pb-8 sm:px-0">
        <div className="overflow-hidden shadow-default">{children}</div>
      </div>
    </div>
  );
};

export default PoolWrapper;
