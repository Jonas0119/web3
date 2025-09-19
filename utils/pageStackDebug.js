/**
 * 页面栈调试工具
 * 用于分析和调试 uni-app 页面栈管理问题
 */

/**
 * 获取当前页面栈信息
 */
export function getPageStackInfo() {
  const pages = getCurrentPages()
  const stackInfo = {
    length: pages.length,
    pages: pages.map((page, index) => ({
      index,
      route: page.route,
      fullPath: '/' + page.route,
      isTabBar: isTabBarPage(page.route),
      options: page.options || {}
    }))
  }
  
  console.log('=== 页面栈信息 ===')
  console.log(`页面栈长度: ${stackInfo.length}`)
  stackInfo.pages.forEach((page, index) => {
    console.log(`${index}: ${page.fullPath} ${page.isTabBar ? '(TabBar)' : '(普通页面)'}`)
  })
  console.log('==================')
  
  return stackInfo
}

/**
 * 判断是否为 TabBar 页面
 */
export function isTabBarPage(route) {
  const tabBarPages = [
    'pages/index/index',
    'pages/market/market', 
    'pages/community/community',
    'pages/profile/profile'
  ]
  return tabBarPages.includes(route)
}

/**
 * 智能返回处理
 * 根据页面栈情况选择合适的返回方式
 */
export function smartNavigateBack() {
  const stackInfo = getPageStackInfo()
  
  if (stackInfo.length <= 1) {
    // 页面栈只有一个页面，可能是从 TabBar 直接进入的
    console.log('页面栈只有一个页面，跳转到社区页面')
    return uni.switchTab({
      url: '/pages/community/community'
    })
  }
  
  // 检查上一个页面是否为 TabBar 页面
  const previousPage = stackInfo.pages[stackInfo.length - 2]
  if (previousPage && previousPage.isTabBar) {
    console.log('上一个页面是 TabBar 页面，使用 switchTab 返回')
    return uni.switchTab({
      url: previousPage.fullPath
    })
  }
  
  // 正常情况，使用 navigateBack
  console.log('使用 navigateBack 返回')
  return uni.navigateBack()
}

/**
 * 安全的页面跳转
 * 从 TabBar 页面跳转到非 TabBar 页面时的安全处理
 */
export function safeNavigateTo(url, options = {}) {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  
  // 如果当前页面是 TabBar 页面，需要特殊处理
  if (isTabBarPage(currentPage.route)) {
    console.log('从 TabBar 页面跳转，使用 navigateTo')
    return uni.navigateTo({
      url,
      ...options
    })
  }
  
  // 普通页面跳转
  return uni.navigateTo({
    url,
    ...options
  })
}

/**
 * 检查页面栈是否健康
 */
export function checkPageStackHealth() {
  const stackInfo = getPageStackInfo()
  const issues = []
  
  // 检查是否有重复的 TabBar 页面
  const tabBarPages = stackInfo.pages.filter(page => page.isTabBar)
  if (tabBarPages.length > 1) {
    issues.push('页面栈中存在多个 TabBar 页面')
  }
  
  // 检查页面栈是否过长
  if (stackInfo.length > 10) {
    issues.push('页面栈过长，可能存在内存泄漏')
  }
  
  if (issues.length > 0) {
    console.warn('页面栈健康检查发现问题:', issues)
  } else {
    console.log('页面栈健康检查通过')
  }
  
  return {
    healthy: issues.length === 0,
    issues
  }
}
