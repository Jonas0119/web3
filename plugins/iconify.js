// Material Design Icons 配置
export const MDI_CONFIG = {
  prefix: 'mdi',
  icons: {
    // 原有图标
    'menu': '󰐕',
    'plus': '󰐕',
    'send': '󰏤',
    'arrow-down-circle': '󰛃',
    'arrow-left': '󰁍',
    'content-copy': '󰆏',
    'qr-code': '󰗡',
    'wallet': '󱕴',
    'alert-circle': '󰀦',
    'delete': '󰆴',
    'scan': '󰗡',
    'back': '󰁍',
    
    // TabBar 图标 - 修复后的正确Unicode值
    'home': '\uF02DC',
    'cart': '\uF0110',
    'forum': '\uF028C',
    'account': '\uF0004',

    // 用户/账户图标 - 新增更好看的选项
    'account-circle': '󰀪',
    'face-man-profile': '󰙀',
    
    // 其他常用图标
    'magnify': '󰍉',
    'construction': '󰏧',
    'check-circle': '✓',
    'shield-check': '󰏧',
    'cog': '󰒓',
    'information': '󰋚',
    'chevron-right': '󰅂',
    'chevron-down': '󰅂',
    'history': '󰋚',
    'swap-vertical': '󰅂',
    'close': '󰅂'
  }
}

// TabBar 图标配置 - 简化版，只使用一个图标，通过颜色区分状态
export const TABBAR_ICONS = {
  home: {
    icon: 'mdi:home',
    text: '首页'
  },
  market: {
    icon: 'mdi:cart',
    text: '市场'
  },
  community: {
    icon: 'mdi:forum',
    text: '社区'
  },
  profile: {
    icon: 'mdi:account',
    text: '我的'
  }
}

export const initializeIconify = () => {
  console.log('Icons initialized')
}
