/*
* Icon Library Configuration
- 此檔案負責註冊所有需要使用的 FontAwesome 圖標
- 只有在此處註冊的圖標才能在 Icon Component 中使用
*/

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  // 使用者相關
  faUser,
  faUserCircle,

  // 系統操作
  faCog,
  faSignOutAlt,
  faTimes,
  faCheck,
  faQuestionCircle,
  faExclamationCircle,
  faInfoCircle,

  // 導航
  faArrowLeft,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,

  // 外觀與主題
  faPalette,
  faMoon,
  faSun,

  // 狀態與反饋
  faSpinner,
  faCircleNotch,

  // 編輯與操作
  faEdit,
  faTrash,
  faSave,
  faUpload,

  // 播放控制
  faPlay,
  faPause,
  faStepBackward,
  faStepForward,
  faSync,
  faRedo,

  // 其他常用
  faSearch,
  faBars,
  faEllipsisV,
  faHome,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';

import {
  faCircle as farCircle,
  faCheckCircle as farCheckCircle,
} from '@fortawesome/free-regular-svg-icons';

// 註冊所有圖標到 FontAwesome 庫
library.add(
  // Solid icons
  faUser,
  faUserCircle,
  faCog,
  faSignOutAlt,
  faTimes,
  faCheck,
  faQuestionCircle,
  faExclamationCircle,
  faInfoCircle,
  faArrowLeft,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faPalette,
  faMoon,
  faSun,
  faSpinner,
  faCircleNotch,
  faEdit,
  faTrash,
  faSave,
  faUpload,
  faPlay,
  faPause,
  faStepBackward,
  faStepForward,
  faSync,
  faRedo,
  faSearch,
  faBars,
  faEllipsisV,
  faHome,
  faPlus,
  faMinus,

  // Regular icons
  farCircle,
  farCheckCircle,
);

/**
 * 圖標名稱類型定義
 * 使用聯合類型確保類型安全
 */
export type IconName =
  // 使用者相關
  | 'user'
  | 'user-circle'

  // 系統操作
  | 'cog'
  | 'sign-out-alt'
  | 'times'
  | 'check'
  | 'question-circle'
  | 'exclamation-circle'
  | 'info-circle'

  // 導航
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'

  // 外觀與主題
  | 'palette'
  | 'moon'
  | 'sun'

  // 狀態與反饋
  | 'spinner'
  | 'circle-notch'

  // 編輯與操作
  | 'edit'
  | 'trash'
  | 'save'
  | 'upload'

  // 播放控制
  | 'play'
  | 'pause'
  | 'step-backward'
  | 'step-forward'
  | 'sync'
  | 'redo'

  // 其他常用
  | 'search'
  | 'bars'
  | 'ellipsis-v'
  | 'home'
  | 'plus'
  | 'minus'

  // Regular icons (需要加上 'far:' 前綴使用)
  | 'circle'
  | 'check-circle';
