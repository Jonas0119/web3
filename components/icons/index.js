import IconWrapper from './IconWrapper.vue'
import CryptoIcon from './CryptoIcon.vue'
import { getIconName, isCryptoIcon, getCryptoSymbol } from '../../utils/icons'

// 导出组件
export {
  IconWrapper,
  CryptoIcon
}

// 导出工具函数
export {
  getIconName,
  isCryptoIcon,
  getCryptoSymbol
}

// 默认导出
export default {
  install(Vue) {
    Vue.component('icon-wrapper', IconWrapper)
    Vue.component('crypto-icon', CryptoIcon)
  }
} 