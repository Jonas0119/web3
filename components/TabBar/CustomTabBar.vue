<template>
  <view class="custom-tab-bar">
    <view 
      v-for="(item, index) in tabList" 
      :key="index"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @click="switchTab(index)"
    >
      <view class="icon-container">
        <image 
          :src="currentIndex === index ? item.activeIcon : item.icon"
          class="tab-icon"
          :class="{ active: currentIndex === index }"
          mode="aspectFit"
        />
      </view>
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
          icon: require('@/static/icons/home.svg'),
          activeIcon: require('@/static/icons/home-active.svg'),
          text: '首页'
        },
        {
          pagePath: '/pages/market/market',
          icon: require('@/static/icons/market.svg'),
          activeIcon: require('@/static/icons/market-active.svg'),
          text: '市场'
        },
        {
          pagePath: '/pages/community/community',
          icon: require('@/static/icons/community.svg'),
          activeIcon: require('@/static/icons/community-active.svg'),
          text: '社区'
        },
        {
          pagePath: '/pages/profile/profile',
          icon: require('@/static/icons/profile.svg'),
          activeIcon: require('@/static/icons/profile-active.svg'),
          text: '我的'
        }
      ]
    }
  },
  mounted() {
    console.log('CustomTabBar mounted, tabList:', this.tabList)
    // 调试图标路径
    this.tabList.forEach((item, index) => {
      console.log(`Tab ${index}:`, {
        text: item.text,
        icon: item.icon,
        activeIcon: item.activeIcon,
        iconType: typeof item.icon,
        activeIconType: typeof item.activeIcon
      })
    })
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
  height: 120rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #e5e5e5;
  display: flex;
  z-index: 1000;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15rpx 0;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 120rpx;
}

.tab-item.active {
  transform: scale(1.05);
  background-color: rgba(74, 142, 255, 0.05);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: transparent;
}

.tab-icon {
  transition: all 0.3s ease;
  display: block;
  width: 48rpx;
  height: 48rpx;
}

.tab-icon.active {
  transform: scale(1.1);
}

.tab-text {
  font-size: 28rpx;
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
