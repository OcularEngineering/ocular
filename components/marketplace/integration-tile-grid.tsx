import Image from 'next/image'
import Link from 'next/link'
import { Integration } from '@/types/types'

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
          {!hideCategories && <h2 className="font-heading sm:text-2xl md:text-3xl lg:text-2xl">{category}</h2>}
          <div className="grid grid-cols-1 gap-5  lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
            {integrationsByCategory[category].map((p) => (
              <Link key={p.slug} href={`/integrations/${p.slug}`} legacyBehavior>
                <a className="">
                  <div
                    className="
                    group flex
                    size-full flex-col rounded-md border-0 bg-white p-6 shadow transition-all hover:bg-gray-100 hover:shadow-lg 
                    dark:border dark:bg-transparent 
                    dark:hover:border-white dark:hover:bg-transparent"
                  >
                    <div className="flex w-full space-x-6">
                      <div className="scale-100 transition-all group-hover:scale-110">
                        <Image
                          layout="fixed"
                          width={350}
                          height={350}
                          className=""
                          src={p.logo}
                          alt={p.name}
                        />
                      </div>
                      <div>
                        <h3 className="text-scale-1100 group-hover:text-scale-1200 font-heading mb-2 text-xl transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-scale-900 text-sm">{p.description}</p>
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
