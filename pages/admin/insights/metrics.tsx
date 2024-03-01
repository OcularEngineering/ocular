function Metrics() {
  return (
    <div>
        <div className="flex flex-row flex-grow gap-5 justify-between">
            <div className="card flex flex-col gap-5 border p-5 rounded-xl items-center hover:shadow-lg flex-grow">
                <h1 className="card-title font-semibold text-5xl">113</h1>
                <div className="flex flex-col gap-2 items-center">
                    <h1 className="card-title font-semibold text-md">Members</h1>
                    <p className="text-sm text-gray-500">+30% over last month</p>
                </div>
            </div>
            <div className="card flex flex-col gap-5 border p-5 rounded-xl items-center hover:shadow-lg flex-grow">
                <h1 className="card-title font-semibold text-5xl">35</h1>
                <div className="flex flex-col gap-2 items-center">
                    <h1 className="card-title font-semibold text-md">Teams</h1>
                    <p className="text-sm text-gray-500">+45% over last month</p>
                </div>
            </div>
            <div className="card flex flex-col gap-5 border p-5 rounded-xl items-center hover:shadow-lg flex-grow">
                <h1 className="card-title font-semibold text-5xl">73.9K</h1>
                <div className="flex flex-col gap-2 items-center">
                    <h1 className="card-title font-semibold text-md">Searches</h1>
                    <p className="text-sm text-gray-500">+81% over last month</p>
                </div>
            </div>
            <div className="card flex flex-col gap-5 border p-5 rounded-xl items-center hover:shadow-lg flex-grow">
                <h1 className="card-title font-semibold text-5xl">7</h1>
                <div className="flex flex-col gap-2 items-center">
                    <h1 className="card-title font-semibold text-md">Integrations</h1>
                    <p className="text-sm text-gray-500">+20% over last month</p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Metrics;