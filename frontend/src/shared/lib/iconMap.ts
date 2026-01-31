/*
* Icon Library Configuration
- 此檔案負責註冊所有需要使用的 FontAwesome 圖標
- 只有在此處註冊的圖標才能在 Icon Component 中使用
*/

import { library, IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowLeft,
  faArrowRight,
  faBars,
  faChartLine,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircleNotch,
  faCog,
  faCompass,
  faCrown,
  faDiagramProject,
  faDungeon,
  faEdit,
  faEllipsisV,
  faExclamationCircle,
  faGhost,
  faGlobe,
  faHome,
  faInfoCircle,
  faLightbulb,
  faLocationCrosshairs,
  faLock,
  faMagnifyingGlass,
  faMinus,
  faMoon,
  faPalette,
  faPause,
  faPlay,
  faPlus,
  faQuestionCircle,
  faRedo,
  faSave,
  faScrewdriverWrench,
  faSearch,
  faSignal,
  faSignOutAlt,
  faSitemap,
  faSpinner,
  faStar,
  faStepBackward,
  faStepForward,
  faSun,
  faSync,
  faTimes,
  faTrash,
  faUpload,
  faUser,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";

import {
  faCircle as farCircle,
  faCheckCircle as farCheckCircle,
  faStar as farStar,
} from '@fortawesome/free-regular-svg-icons';

/**
 * 1. 集中管理映射表
 * 這樣做的好處是：名稱與對象一一對應，且 VS Code 能自動推斷類型
 */
export const iconMap = {
  "arrow-left": faArrowLeft,
  "arrow-right": faArrowRight,
  "bars": faBars,
  "chart-line": faChartLine,
  "check": faCheck,
  "check-circle": farCheckCircle,
  "chevron-down": faChevronDown,
  "chevron-left": faChevronLeft,
  "chevron-right": faChevronRight,
  "chevron-up": faChevronUp,
  "circle": farCircle,
  "circle-notch": faCircleNotch,
  "cog": faCog,
  "compass": faCompass,
  "crown": faCrown,
  "diagram-project": faDiagramProject,
  "dungeon": faDungeon,
  "edit": faEdit,
  "ellipsis-v": faEllipsisV,
  "exclamation-circle": faExclamationCircle,
  "ghost": faGhost,
  "globe": faGlobe,
  "home": faHome,
  "info-circle": faInfoCircle,
  "lightbulb": faLightbulb,
  "location-crosshairs": faLocationCrosshairs,
  "lock": faLock,
  "magnifying-glass": faMagnifyingGlass,
  "minus": faMinus,
  "moon": faMoon,
  "palette": faPalette,
  "pause": faPause,
  "play": faPlay,
  "plus": faPlus,
  "question-circle": faQuestionCircle,
  "redo": faRedo,
  "save": faSave,
  "screwdriver-wrench": faScrewdriverWrench,
  "search": faSearch,
  "signal": faSignal,
  "sign-out-alt": faSignOutAlt,
  "sitemap": faSitemap,
  "spinner": faSpinner,
  "star": faStar,
  "star-outline": farStar,
  "step-backward": faStepBackward,
  "step-forward": faStepForward,
  "sun": faSun,
  "sync": faSync,
  "times": faTimes,
  "trash": faTrash,
  "upload": faUpload,
  "user": faUser,
  "user-circle": faUserCircle,
} as const;

/**
 * 2. 自動執行註冊
 * Object.values 會抓出所有的 IconDefinition
 */
library.add(...(Object.values(iconMap) as IconDefinition[]));

/**
 * 3. 自動生成類型
 * 這行代碼會自動提取 iconMap 的所有 Key
 * 你以後不需要手動寫 | 'user' | 'cog' ...
 */
export type IconName = keyof typeof iconMap;
