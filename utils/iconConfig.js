// 统一图标配置管理
import { TABBAR_ICONS, MDI_CONFIG } from '@/plugins/iconify'

// 图标类型枚举
export const ICON_TYPES = {
  TABBAR: 'tabbar',
  FUNCTION: 'function',
  CRYPTO: 'crypto'
}

// TabBar图标配置
export const getTabBarIcon = (type, isActive = false) => {
  const iconConfig = TABBAR_ICONS[type]
  if (!iconConfig) {
    console.warn(`TabBar图标配置不存在: ${type}`)
    return 'mdi:help-circle'
  }
  return isActive ? iconConfig.active : iconConfig.normal
}

// 功能图标配置
export const getFunctionIcon = (name) => {
  return MDI_CONFIG.icons[name] ? `mdi:${name}` : 'mdi:help-circle'
}

// 图标预加载配置
export const PRELOAD_ICONS = [
  // TabBar图标
  'mdi:home',
  'mdi:home-outline',
  'mdi:chart-line',
  'mdi:chart-line-variant',
  'mdi:forum',
  'mdi:forum-outline',
  'mdi:account',
  'mdi:account-outline',
  
  // 常用功能图标
  'mdi:menu',
  'mdi:plus',
  'mdi:send',
  'mdi:arrow-left',
  'mdi:content-copy',
  'mdi:qr-code',
  'mdi:wallet',
  'mdi:alert-circle',
  'mdi:delete',
  'mdi:scan',
  'mdi:back'
]

// 图标主题配置
export const ICON_THEMES = {
  light: {
    primary: '#4a8eff',
    secondary: '#7A7E83',
    success: '#4cd964',
    warning: '#ff9500',
    error: '#ff3b30'
  },
  dark: {
    primary: '#5ac8fa',
    secondary: '#8e8e93',
    success: '#34c759',
    warning: '#ff9f0a',
    error: '#ff453a'
  }
}

// 获取主题颜色
export const getThemeColor = (colorName, theme = 'light') => {
  return (ICON_THEMES[theme] && ICON_THEMES[theme][colorName]) || ICON_THEMES.light[colorName] || '#4a8eff'
}

// 图标尺寸配置
export const ICON_SIZES = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
  xxl: 80
}

// 获取图标尺寸
export const getIconSize = (size) => {
  return typeof size === 'number' ? size : ICON_SIZES[size] || ICON_SIZES.md
}
