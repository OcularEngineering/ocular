import Image from 'next/image'
import Link from 'next/link'
import { Integration } from '@/types/types'
import { Badge } from "@/components/ui/badge"
import { formatLabel } from '@/lib/utils';

export default function IntegrationTileGrid({
  integrationsByCategory,
  hideCategories = false,
}: {
  integrationsByCategory: { [category: string]: Integration[] }
  hideCategories?: boolean
}) {
  return (
    <>
      {Object.keys(integrationsByCategory).map((category) => (
        <div key={category} id={category.toLowerCase()} className="space-y-8">
          {!hideCategories && <h2 className="font-semibold sm:text-lg md:text-lg lg:text-lg">{category}</h2>}
          <div className="grid grid-cols-1 gap-5  lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
            {integrationsByCategory[category].map((p) => (
              <Link key={p.slug} href={`/dashboard/marketplace/${p.slug}`} legacyBehavior>
                <a className="">
                  <div
                    className="
                    group flex
                    size-full flex-col rounded-xl bg-custom-gray p-6 transition-all hover:shadow-lg 
                    dark:border dark:bg-transparent 
                    dark:hover:border-white dark:hover:bg-transparent"
                  >
                    <div className="flex flex-col w-full space-x-6 items-center justify-center gap-8">
                      <div className="transition-all group-hover:scale-110">
                        <Image
                          layout="fixed"
                          width={80}
                          height={80}
                          className=""
                          src={p.logo}
                          alt={formatLabel(p.name)}
                        />
                      </div>
                      <div>
                        <h3 className="text-scale-1100 group-hover:text-scale-1200 font-semibold mb-2 text-lg transition-colors items-center justify-center">
                            {formatLabel(p.name)}
                        </h3>
                        <p className="text-scale-900 text-sm" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: '3', overflow: 'hidden' }}>
                          {p.description}
                        </p>
                        
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
