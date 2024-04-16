const PoolWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-w-full">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full lg:py-2 sm:py-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PoolWrapper;
