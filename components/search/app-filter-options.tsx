import AppFilterOption from "./app-filter-option";

const iconsArray = ['Jira.svg', 'Github.png', 'Confluence.svg', 'Linear.png', 'Gong.png', 'Zendesk.svg', 'GoogleDrive.png', 'HubSpot.png' ];

type AppFilterOptionsProps = {
    results: any; 
};

export default function AppFilterOptions({results}: AppFilterOptionsProps) {
    return (
        <div className="mt-3 flex w-full text-sm text-gray-700 lg:justify-start lg:text-base dark:text-gray-400">
            <div className="flex w-full flex-col justify-start space-y-2 sm:w-auto">
                <AppFilterOption src="/All.svg"  title="All" key="All" results={results}/>
                {iconsArray.map((iconName) => (
                    <AppFilterOption src={`/${iconName}`}  title={iconName} key={iconName} />
                ))}
            </div>
        </div>
    );
}