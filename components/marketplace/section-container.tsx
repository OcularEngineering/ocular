import classNames from 'classnames'
import { PropsWithChildren } from 'react'

interface SectionContainerProps {
  className?: string
}

const SectionContainer = ({ children, className }: PropsWithChildren<SectionContainerProps>) => (
  <div
    className={classNames(
      `container mx-auto px-6 lg:px-16 xl:px-20 relative py-16 sm:py-18 md:py-24 lg:py-24`,
      className
    )}
  >
    {children}
  </div>
)

export default SectionContainer
