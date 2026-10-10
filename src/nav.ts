/**
 * Navigation Config
 *
 * Add one entry per nav item. Routes are handled by generouted
 * (file-based routing in src/pages/), this just controls what
 * appears in the navigation bar.
 */

export interface NavItem {
  path: string
  label: string
  devOnly?: boolean
}

export const nav: NavItem[] = [
  { path: '/home', label: 'Dashboard' },
  { path: '/new', label: 'New analysis' },
  { path: '/library', label: 'Library' },
  { path: '/settings', label: 'Settings' },
]
