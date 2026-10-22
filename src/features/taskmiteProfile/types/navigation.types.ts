import type { ComponentType, SVGProps } from 'react'

export interface NavItem {
  id: string
  path: string
  iconLabel: string
  navLabel: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}
