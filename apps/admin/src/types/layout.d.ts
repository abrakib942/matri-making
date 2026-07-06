import { Dispatch, SetStateAction, HTMLAttributeAnchorTarget } from 'react';

/* Context Types */
export type LayoutState = {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  profileSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
};

export interface LayoutContextProps {
  layoutState: LayoutState;
  setLayoutState: Dispatch<SetStateAction<LayoutState>>;
  onMenuToggle: () => void;
  showProfileSidebar: () => void;
}

export interface MenuContextProps {
  activeMenu: string;
  setActiveMenu: Dispatch<SetStateAction<string>>;
}

/* AppMenu Types */
export interface MenuModel {
  label: string;
  icon?: string;
  items?: MenuModel[];
  to?: string;
  url?: string;
  target?: HTMLAttributeAnchorTarget;
  seperator?: boolean;
}

export interface AppMenuItem extends MenuModel {
  items?: AppMenuItem[];
  badge?: 'UPDATED' | 'NEW';
  badgeClass?: string;
  class?: string;
  preventExact?: boolean;
  visible?: boolean;
  disabled?: boolean;
  replaceUrl?: boolean;
}

export interface AppMenuItemProps {
  item?: AppMenuItem;
  parentKey?: string;
  index?: number;
  root?: boolean;
  className?: string;
}
