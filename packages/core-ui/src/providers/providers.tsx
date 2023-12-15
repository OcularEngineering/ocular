import { ReactNode } from "react"
import { HelmetProvider } from "react-helmet-async"

/**
 * This component wraps all providers into a single component.
 */


export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  )
}
