function TopSearches() {
  return (
    <div className="card flex flex-col gap-5 border p-5 rounded-xl hover:shadow-lg flex-grow">
        <div className='flex flex-col gap-2 items-start'>
            <h1 className="card-title font-semibold text-xl">Top Searches</h1>
            <p className="text-sm text-gray-500">Most frequent queries</p>
        </div>
        <div className='flex flex-row justify-between items-center'>
            <h1 className="card-title font-regular text-md">Annual Revenue Reports</h1>
            <p className="text-md font-semibold text-gray-500">452</p>
        </div>
        <div className='flex flex-row justify-between items-center'>
            <h1 className="card-title font-regular text-md">Employee Engagement Surveys</h1>
            <p className="text-md font-semibold text-gray-500">317</p>
        </div>
        <div className='flex flex-row justify-between items-center'>
            <h1 className="card-title font-regular text-md">Cybersecurity Updates</h1>
            <p className="text-md font-semibold text-gray-500">289</p>
        </div>
        <div className='flex flex-row justify-between items-center'>
            <h1 className="card-title font-regular text-md">Security & Compliance Training</h1>
            <p className="text-md font-semibold text-gray-500">256</p>
        </div>
        <div className='flex flex-row justify-between items-center'>
            <h1 className="card-title font-regular text-md">Sustainability Initiatives</h1>
            <p className="text-md font-semibold text-gray-500">198</p>
        </div>
    </div>
  );
}

export default TopSearches;