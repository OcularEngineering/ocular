// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-800/60 before:to-transparent';

export function SearchResultSkeleton() {
    return (
        <div
            className={`group mb-4 flex px-3 py-4 text-xs sm:text-base mt-5 w-full max-w-5xl items-start justify-start`}
        >
            <div className={`${shimmer} relative overflow-hidden mr-4 w-12 h-12 bg-gray-200 rounded-full dark:bg-muted`} />
            <div className={`space-y-5 w-4/5`}>
                <div className={`${shimmer} relative overflow-hidden dark:bg-muted bg-gray-200 h-5 rounded-xl`}/>
                <div className={`space-y-3 w-full`}>
                    <div className={`${shimmer} relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-3 w-4/5`}/>
                    <div className={`${shimmer} relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-3 w-3/5`}/>
                    <div className={`${shimmer} relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-3 w-2/5`}/>
                </div>
            </div>
        </div>
    )
}
export function SearchResultsSkeleton() {
    return (
        <div className="flex flex-col w-full z-0">
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
        </div>
    )
}

export function SearchCopilotSkeleton() {
    return (
        <div
            className={`flex flex-col rounded-3xl px-6 py-4 space-y-5 max-w-4xl`}
        >   
            <div className='flex flex-row'>
                <div className="flex items-center space-x-2">
                    <div className={`${shimmer} relative overflow-hidden bg-gray-200 dark:bg-muted size-[50px] h-5 w-[80px] rounded-lg`}/>
                    <div className={`${shimmer} relative overflow-hidden bg-gray-200 dark:bg-muted size-[50px] h-5 w-[80px] rounded-lg`}/>
                </div>
            </div>
            <div className={`space-y-3 w-full`}>
                <div className={`${shimmer} relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-3 w-4/5`}/>
                <div className={`${shimmer} relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-3 w-3/5`}/>
                <div className={`${shimmer} relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-3 w-2/5`}/>
            </div>
        </div>
    )
}


export function SearchByAppFilterSkeleton() {
    return (
        <div className="mt-3 flex w-full lg:justify-start">
            <div className="flex w-full flex-col justify-start space-y-2 sm:w-auto">
                <div className={`${shimmer} relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
                <div className={`${shimmer} relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
                <div className={`${shimmer} relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
                <div className={`${shimmer} relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
                <div className={`${shimmer} relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
            </div>
        </div>
    )
}