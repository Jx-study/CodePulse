/**
 * Navigation Component Types
 * 導航類組件的類型定義 (Breadcrumb, Dropdown, Tabs 等)
 */

// ==================== Breadcrumb Component ====================
export interface BreadcrumbItem {
  label: string;
  path?: string | null;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showBackButton?: boolean;
}

// ==================== Dropdown Component ====================
export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  closeOnSelect?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
  className?: string;
  menuClassName?: string;
  triggerClassName?: string;
  onSelect?: (key: string) => void;
  'aria-label'?: string;
  [key: string]: any;
}

// ==================== Tabs Component ====================
export interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
  onChange?: (key: string) => void;
  'aria-label'?: string;
  [key: string]: any;
}
