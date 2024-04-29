import { de } from "date-fns/locale";

// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export default function SearchResultSkeleton(){
    return (
        <div
            className={`${shimmer} rounded-xl bg-gray-100 p-2 shadow-sm`}
        >
            <p>Let go!</p>

        </div>
    )
}