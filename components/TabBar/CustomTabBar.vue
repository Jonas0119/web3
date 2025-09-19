<template>
  <view class="custom-tab-bar">
    <view 
      v-for="(item, index) in tabList" 
      :key="index"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @click="switchTab(index)"
    >
      <text class="tab-text" :class="{ active: currentIndex === index }">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabBar',
  data() {
    return {
      currentIndex: 0,
      tabList: [
        {
          pagePath: '/pages/index/index',
          text: '首页'
        },
        {
          pagePath: '/pages/market/market',
          text: '市场'
        },
        {
          pagePath: '/pages/community/community',
          text: '社区'
        },
        {
          pagePath: '/pages/profile/profile',
          text: '我的'
        }
      ]
    }
  },
  mounted() {
    console.log('CustomTabBar mounted, tabList:', this.tabList)
  },
  methods: {
    switchTab(index) {
      console.log('切换Tab:', index, this.tabList[index])
      if (this.currentIndex === index) {
        return
      }
      
      this.currentIndex = index
      const tabItem = this.tabList[index]
      
      uni.switchTab({
        url: tabItem.pagePath,
        success: () => {
          console.log('切换Tab成功:', tabItem.text)
        },
        fail: (err) => {
          console.error('切换Tab失败:', err)
          // 如果switchTab失败，尝试使用navigateTo
          uni.navigateTo({
            url: tabItem.pagePath,
            fail: (navErr) => {
              console.error('navigateTo也失败:', navErr)
            }
          })
        }
      })
    },
    
    // 设置当前激活的Tab
    setCurrentIndex(index) {
      this.currentIndex = index
    },
    
    // 根据页面路径获取Tab索引
    getIndexByPath(path) {
      return this.tabList.findIndex(item => item.pagePath === path)
    }
  },
  
  // 监听页面显示，更新当前Tab状态
  onShow() {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      const currentPath = '/' + currentPage.route
      const index = this.getIndexByPath(currentPath)
      if (index !== -1) {
        this.currentIndex = index
      }
    }
  }
}
</script>

<style scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #e5e5e5;
  display: flex;
  z-index: 1000;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 110rpx;
}

.tab-item.active {
  transform: scale(1.05);
  background-color: rgba(74, 142, 255, 0.05);
}

/* 已移除图标相关样式 */

.tab-text {
  font-size: 36rpx;
  color: #7A7E83;
  transition: color 0.3s ease;
  text-align: center;
  font-weight: 600;
}

.tab-text.active {
  color: #4a8eff;
  font-weight: bold;
}

/* 适配不同平台 */
/* #ifdef H5 */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
}
/* #endif */

/* #ifdef APP-PLUS */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  /* 适配安全区域 */
  padding-bottom: env(safe-area-inset-bottom);
}
/* #endif */
</style>
