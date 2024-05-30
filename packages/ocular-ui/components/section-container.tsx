import classNames from 'classnames'
import { PropsWithChildren } from 'react'

interface SectionContainerProps {
  className?: string
}

const SectionContainer = ({ children, className }: PropsWithChildren<SectionContainerProps>) => (
  <div
    className={classNames(
      `container relative justify-center items-center`,
      className
    )}
  >
    {children}
  </div>
)

export default SectionContainer