import { useRouter, useSearchParams } from 'next/navigation'; // Import from next/navigation
import Link from "next/link";

export default function PaginationButtons() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Assuming the new router provides searchParams

  // Ensure that the 'start' and 'term' parameters are accessed correctly
  const startIndex = Number(searchParams.get('start')) || 0;
  const term = searchParams.get('term');

  return (
    <div className="mt-8 flex max-w-lg items-center justify-around pb-10 text-blue-700 dark:text-blue-400">
      {startIndex >= 30 && (
        <Link
          passHref={true}
          href={`/dashboard/search/results?term=${term}&start=${startIndex - 30}`}
        >
          <div className="dark:hover:bg-secondary-dark flex max-w-[100px] grow cursor-pointer flex-row items-center justify-center rounded-full p-3 hover:bg-gray-100">
            <p>Previous</p>
          </div>
        </Link>
      )}

      <Link
        passHref={true}
        href={`/dashboard/search/results?term=${term}&start=${startIndex + 30}`}
      >
        <div className="dark:hover:bg-secondary-dark flex max-w-[100px] grow cursor-pointer flex-row items-center justify-center rounded-full p-3 hover:bg-gray-100">
          <p>Next</p>
        </div>
      </Link>
    </div>
  );
}
