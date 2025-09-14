<template>
  <view id="app">
    <!-- 自定义TabBar -->
    <custom-tab-bar />
  </view>
</template>

<script>
import CustomTabBar from '@/components/TabBar/CustomTabBar.vue'
import { initializeIconify } from '@/plugins/iconify'

export default {
  components: {
    CustomTabBar
  },
  onLaunch: function() {
    console.log('App Launch')
    // 预加载字体
    this.loadFont()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    async loadFont() {
      try {
        await new Promise((resolve, reject) => {
          uni.loadFontFace({
            family: 'Material Design Icons',
            source: 'url(/static/materialdesignicons-webfont.woff2)',
            success() {
              console.log('App字体加载成功');
              resolve();
            },
            fail(error) {
              console.error('App字体加载失败:', error);
              reject(error);
            }
          });
        });
        
        // 初始化图标系统
        initializeIconify()
      } catch (error) {
        console.error('App字体加载出错:', error);
      }
    }
  }
}
</script>

<style>
/*每个页面公共css */
#app {
  height: 100vh;
}

/* 为TabBar预留底部空间 */
page {
  padding-bottom: 100rpx;
}

/* 在TabBar页面不需要底部padding */
.tab-page {
  padding-bottom: 0;
}
</style>
