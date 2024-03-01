function TrendingSearches() {
  return (
    <div className="card flex flex-col gap-5 border p-5 rounded-xl hover:shadow-lg flex-grow">
        <div className='flex flex-col gap-2 items-start'>
            <h1 className="card-title font-semibold text-xl">Trending Searches</h1>
            <p className="text-sm text-gray-500">Most popular queries</p>
        </div>
        <div className='flex flex-row justify-between items-center bg-background'>
            <h1 className="card-title font-regular text-md">Remote Work Policies</h1>
            <p className="text-md font-semibold text-gray-500">356</p>
        </div>
        <div className='flex flex-row justify-between items-center bg-background'>
            <h1 className="card-title font-regular text-md">AI in Business Processes</h1>
            <p className="text-md font-semibold text-gray-500">322</p>
        </div>
        <div className='flex flex-row justify-between items-center bg-background'>
            <h1 className="card-title font-regular text-md">5G Adoption Strategies</h1>
            <p className="text-md font-semibold text-gray-500">298</p>
        </div>
        <div className='flex flex-row justify-between items-center bg-background'>
            <h1 className="card-title font-regular text-md">Blockchain for Security</h1>
            <p className="text-md font-semibold text-gray-500">275</p>
        </div>
        <div className='flex flex-row justify-between items-center bg-background'>
            <h1 className="card-title font-regular text-md">Sustainable Tech Solutions</h1>
            <p className="text-md font-semibold text-gray-500">249</p>
        </div>
    </div>
  );
}

export default TrendingSearches;