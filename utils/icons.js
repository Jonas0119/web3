// 图标映射表
export const ICON_MAP = {
  // 导航图标
  back: 'mdi:arrow-left',
  menu: 'mdi:menu',
  plus: 'mdi:plus',
  
  // 功能图标
  copy: 'mdi:content-copy',
  qrcode: 'mdi:qr-code',
  wallet: 'mdi:wallet',
  send: 'mdi:send',
  receive: 'mdi:arrow-down-circle',
  alert: 'mdi:alert-circle',
  
  // 加密货币图标前缀
  crypto: 'crypto'
}

// 获取图标名称
export const getIconName = (key) => {
  return ICON_MAP[key] || key
}

// 检查是否为加密货币图标
export const isCryptoIcon = (name) => {
  return name.startsWith(ICON_MAP.crypto)
}

// 从加密货币图标名称中获取符号
export const getCryptoSymbol = (name) => {
  if (!isCryptoIcon(name)) return ''
  return name.replace(`${ICON_MAP.crypto}:`, '')
} 