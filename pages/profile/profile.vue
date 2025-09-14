<template>
  <view class="profile-page tab-page">
    <!-- 顶部导航 -->
    <view class="profile-header">
      <text class="page-title">我的</text>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-avatar">
        <icon-wrapper name="mdi:face-man-profile" :size="120" color="#4a8eff" />
      </view>
      <view class="user-info">
        <text class="user-name">{{ userName }}</text>
        <text class="user-id">ID: {{ userId }}</text>
      </view>
      <view class="user-balance">
        <text class="balance-label">总资产</text>
        <text class="balance-value">${{ totalBalance }}</text>
      </view>
    </view>

    <!-- 资产概览 -->
    <view class="assets-section">
      <view class="section-title">
        <text class="title-text">我的资产</text>
        <text class="title-desc">共持有 {{ assetCount }} 种币</text>
      </view>
      
      <view class="assets-list">
        <view 
          v-for="asset in assets" 
          :key="asset.symbol"
          class="asset-item"
        >
          <view class="asset-icon">
            <crypto-icon :symbol="asset.symbol" :size="60" />
          </view>
          <view class="asset-info">
            <text class="asset-name">{{ asset.name }}</text>
            <text class="asset-symbol">{{ asset.symbol }}</text>
          </view>
          <view class="asset-balance">
            <text class="amount-value">{{ asset.balance }}</text>
            <text class="amount-usd">${{ asset.value }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="handleWalletManage">
        <icon-wrapper name="mdi:wallet" :size="40" color="#4a8eff" />
        <text class="menu-text">钱包管理</text>
        <icon-wrapper name="mdi:chevron-right" :size="24" color="#cccccc" />
      </view>
      
      <view class="menu-item" @click="handleSecurity">
        <icon-wrapper name="mdi:shield-check" :size="40" color="#4a8eff" />
        <text class="menu-text">安全设置</text>
        <icon-wrapper name="mdi:chevron-right" :size="24" color="#cccccc" />
      </view>
      
      <view class="menu-item" @click="handleSettings">
        <icon-wrapper name="mdi:cog" :size="40" color="#4a8eff" />
        <text class="menu-text">应用设置</text>
        <icon-wrapper name="mdi:chevron-right" :size="24" color="#cccccc" />
      </view>
      
      <view class="menu-item" @click="handleAbout">
        <icon-wrapper name="mdi:information" :size="40" color="#4a8eff" />
        <text class="menu-text">关于我们</text>
        <icon-wrapper name="mdi:chevron-right" :size="24" color="#cccccc" />
      </view>
    </view>
  </view>
</template>

<script>
import { IconWrapper, CryptoIcon } from '@/components/icons'
import { loadWalletFromStorage } from '@/utils/web3Utils.js'

export default {
  components: {
    'icon-wrapper': IconWrapper,
    'crypto-icon': CryptoIcon
  },
  data() {
    return {
      userName: '用户',
      userId: 'CCB001',
      totalBalance: '0.00',
      assetCount: 0,
      assets: []
    }
  },
  onLoad() {
    this.loadUserData()
  },
  methods: {
    async loadUserData() {
      try {
        // 加载钱包数据
        const wallet = await loadWalletFromStorage()
        if (wallet) {
          this.userName = wallet.name || '用户'
          this.userId = wallet.address ? wallet.address.slice(0, 8) + '...' : 'CCB001'
        }
        
        // 模拟资产数据
        this.assets = [
          {
            symbol: 'ETH',
            name: 'Ethereum',
            balance: '0.00',
            value: '0.00'
          }
        ]
        this.assetCount = this.assets.length
        this.totalBalance = '0.00'
      } catch (error) {
        console.error('加载用户数据失败:', error)
      }
    },
    
    handleWalletManage() {
      uni.navigateTo({
        url: '/pages/wallet/manage'
      })
    },
    
    handleSecurity() {
      uni.showToast({
        title: '安全设置功能开发中',
        icon: 'none'
      })
    },
    
    handleSettings() {
      uni.showToast({
        title: '应用设置功能开发中',
        icon: 'none'
      })
    },
    
    handleAbout() {
      uni.showModal({
        title: '关于跨链桥CCB',
        content: '跨链桥Cross Chain Bridge（CCB）为用户提供一个安全、高效、一站式的多链资产管理体验。',
        showCancel: false
      })
    }
  }
}
</script>

<style>
.profile-page {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.profile-header {
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

.user-card {
  background-color: #ffffff;
  margin: 30rpx;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.user-avatar {
  margin-right: 30rpx;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.user-id {
  font-size: 24rpx;
  color: #666666;
}

.user-balance {
  text-align: right;
}

.balance-label {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 10rpx;
}

.balance-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #4a8eff;
}

.assets-section {
  margin: 0 30rpx 30rpx;
}

.section-title {
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.title-desc {
  font-size: 24rpx;
  color: #666666;
}

.assets-list {
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.asset-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.asset-item:last-child {
  border-bottom: none;
}

.asset-icon {
  margin-right: 30rpx;
}

.asset-info {
  flex: 1;
}

.asset-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.asset-symbol {
  font-size: 24rpx;
  color: #666666;
}

.asset-balance {
  text-align: right;
}

.amount-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.amount-usd {
  font-size: 24rpx;
  color: #666666;
}

.menu-section {
  background-color: #ffffff;
  margin: 0 30rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  margin-left: 20rpx;
}
</style>
