import { Skeleton } from "@/components/ui/skeleton"

export function SearchResultSkeleton() {
    return (
        <div
            className={`group mb-4 flex px-3 py-4`}
        >
            <Skeleton className={`relative overflow-hidden mr-4 w-16 h-12 bg-gray-200 rounded-full dark:bg-muted`} />
            <div className={`space-y-5 w-[743px]`}>
                <Skeleton className={`relative overflow-hidden dark:bg-muted bg-gray-200 h-5 rounded-xl`}/>
                <div className={`space-y-2`}>
                    <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-4 w-4/5`}/>
                    <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-4 w-3/5`}/>
                    <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-4 w-2/5`}/>
                </div>
                <div className="flex flex-row gap-3">
                    <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-3 w-[100px]`}/>
                    <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-3 w-[50px]`}/>
                </div>
            </div>
        </div>
    )
}
export function SearchResultsSkeleton() {
    return (
        <div className="flex flex-col max-w-5xl w-3/5">
            <SearchResultSkeleton />
            <SearchResultSkeleton />
            <SearchResultSkeleton />
        </div>
    )
}

export function SearchCopilotSkeleton() {
    return (
        <div
            className="flex flex-col rounded-3xl py-4 max-w-6xl space-y-3 justify-start items-start"
        >   
            <div className='flex flex-row mb-5'>
                <div className="flex items-center space-x-2">
                    <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted size-[50px] h-5 w-[80px] rounded-lg`}/>
                    <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted size-[50px] h-5 w-[80px] rounded-lg`}/>
                </div>
            </div>
            <div className={`space-y-3 w-full`}>
                <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-5 w-4/5`}/>
                <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-5 w-3/5`}/>
                <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted rounded-xl h-5 w-2/5`}/>
            </div>
            <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted size-[50px] h-8 w-[80px] rounded-2xl`}/>
            <div className="flex flex-row">
                <div className="flex items-center space-x-5">
                    <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted size-[50px] h-[80px] w-[200px] rounded-2xl`}/>
                    <Skeleton className={`relative overflow-hidden bg-gray-200 dark:bg-muted size-[50px] h-[80px] w-[200px] rounded-2xl`}/>
                </div>
            </div>

        </div>
    )
}

export function SearchByAppFilterSkeleton() {
    return (
        <div className="mt-3 flex w-full lg:justify-start">
            <div className="flex w-full flex-col justify-start space-y-2 sm:w-auto">
                <Skeleton className={`relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
                <Skeleton className={`relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
                <Skeleton className={`relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
                <Skeleton className={`relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
                <Skeleton className={`relative overflow-hidden dark:bg-muted bg-gray-200 box-border flex h-10 w-64 min-w-10 items-center justify-start rounded-full px-5`} />
            </div>
        </div>
    )
}
