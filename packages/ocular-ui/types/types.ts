// SEARCH TYPES
export interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
}

// SETTINGS TYPES
export interface SettingsLayoutProps {
  children: React.ReactNode
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
  }[]
}

// ICON TYPES
export type IconKeys = 'Search' | 'Bot' | 'Chat' | 'Settings' | 'LayoutGrid' | 'HelpCircle' | 'BarChart2' | 'Users'; 
export type VariantKeys = "ghost" | "link" | "default" | "destructive" | "outline" | "secondary" | null | undefined;

// LINK TYPES
export interface LinkProps {
  title: string
  label?: string
  icon: IconKeys
  variant: VariantKeys
  link: string
}

// NAVIGATION TYPES
export interface NavProps {
  links: LinkProps[]
}

export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
}

export interface MainNavProps {
    items?: NavItem[]
}

// ROOT TYPES
export interface RootLayoutProps {
  children: React.ReactNode
}

export interface Integration {
  id: string
  slug: string
  category: string
  developer: string
  name: string
  description: string
  logo: string
  images: string[]
  overview: string
  website: string
  docs: string
  oauth_url: string
  install_url: string
}

// USER PROFILE TYPES
export interface userProfileInfo {
  id?: string
  first_name: string
  last_name: string
  email: string
  avatar?: string
  role: string
  created_at?: string
  updated_at?: string
  organisation_id?: string
}