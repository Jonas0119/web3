<template>
  <view class="community-page tab-page">
    <!-- 顶部导航 -->
    <view class="community-header">
      <text class="page-title">社区</text>
    </view>

    <!-- 建设中状态 -->
    <view class="construction-content">
      <view class="construction-icon">
        <icon-wrapper name="mdi:construction" :size="120" color="#4a8eff" />
      </view>
      <text class="construction-title">功能开发中</text>
      <text class="construction-desc">社区功能正在紧张开发中，敬请期待！</text>
      
      <view class="coming-features">
        <text class="features-title">即将推出：</text>
        <view class="feature-item">
          <icon-wrapper name="mdi:check-circle" :size="30" color="#4cd964" />
          <text class="feature-text">用户交流论坛</text>
        </view>
        <view class="feature-item">
          <icon-wrapper name="mdi:check-circle" :size="30" color="#4cd964" />
          <text class="feature-text">项目讨论区</text>
        </view>
        <view class="feature-item">
          <icon-wrapper name="mdi:check-circle" :size="30" color="#4cd964" />
          <text class="feature-text">技术分享</text>
        </view>
        <view class="feature-item">
          <icon-wrapper name="mdi:check-circle" :size="30" color="#4cd964" />
          <text class="feature-text">活动公告</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { IconWrapper } from '@/components/icons'

export default {
  components: {
    'icon-wrapper': IconWrapper
  },
  data() {
    return {
      // 社区相关数据
    }
  },
  onLoad() {
    console.log('社区页面加载')
  }
}
</script>

<style>
.community-page {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.community-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e5;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.construction-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
}

.construction-icon {
  margin-bottom: 40rpx;
}

.construction-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.construction-desc {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 80rpx;
}

.coming-features {
  width: 100%;
}

.features-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 40rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #666666;
  margin-left: 20rpx;
}
</style>
