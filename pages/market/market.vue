<template>
  <view class="market-page tab-page">
    <!-- 顶部搜索和筛选栏 -->
    <view class="market-header">
      <view class="search-bar">
        <input v-model="searchKeyword" placeholder="搜索币种" />
        <icon-wrapper name="mdi:magnify" />
      </view>
      <view class="filter-tabs">
        <view 
          v-for="tab in filterTabs" 
          :key="tab.key"
          class="filter-tab"
          :class="{ active: currentFilter === tab.key }"
          @click="switchFilter(tab.key)"
        >
          {{ tab.label }}
        </view>
      </view>
    </view>

    <!-- 市场概览卡片 -->
    <view class="market-overview">
      <view class="overview-item">
        <text class="overview-label">总市值</text>
        <text class="overview-value">$2.1T</text>
        <text class="overview-change positive">+2.5%</text>
      </view>
      <view class="overview-item">
        <text class="overview-label">24h交易量</text>
        <text class="overview-value">$89.2B</text>
        <text class="overview-change positive">+15.3%</text>
      </view>
      <view class="overview-item">
        <text class="overview-label">BTC占比</text>
        <text class="overview-value">42.8%</text>
        <text class="overview-change negative">-1.2%</text>
      </view>
    </view>

    <!-- 币种列表 -->
    <view class="coin-list">
      <view class="list-header">
        <text class="header-item">币种</text>
        <text class="header-item">价格</text>
        <text class="header-item">24h涨跌</text>
        <text class="header-item">操作</text>
      </view>
      
      <view 
        v-for="coin in filteredCoins" 
        :key="coin.symbol"
        class="coin-item"
        @click="selectCoin(coin)"
      >
        <view class="coin-info">
          <crypto-icon :symbol="coin.symbol.toLowerCase()" :size="50" />
          <view class="coin-details">
            <text class="coin-name">{{ coin.name }}</text>
            <text class="coin-symbol">{{ coin.symbol }}</text>
          </view>
        </view>
        
        <view class="price-info">
          <text class="price">${{ formatPrice(coin.price) }}</text>
          <text class="market-cap">市值: ${{ formatMarketCap(coin.marketCap) }}</text>
        </view>
        
        <view class="change-info">
          <text 
            class="change" 
            :class="coin.change24h >= 0 ? 'positive' : 'negative'"
          >
            {{ coin.change24h >= 0 ? '+' : '' }}{{ coin.change24h.toFixed(2) }}%
          </text>
          <text class="volume">24h: ${{ formatVolume(coin.volume24h) }}</text>
        </view>
        
        <view class="action-buttons">
          <button class="action-btn buy" @click.stop="handleBuy(coin)">买入</button>
          <button class="action-btn exchange" @click.stop="handleExchange(coin)">兑换</button>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore" @click="loadMore">
      <text>加载更多</text>
    </view>
  </view>
</template>

<script>
import { getMarketData, getCoinDetails } from '@/utils/marketApi.js'
import { IconWrapper, CryptoIcon } from '@/components/icons'

export default {
  components: {
    'icon-wrapper': IconWrapper,
    'crypto-icon': CryptoIcon
  },
  data() {
    return {
      searchKeyword: '',
      currentFilter: 'all',
      filterTabs: [
        { key: 'all', label: '全部' },
        { key: 'gainers', label: '涨幅榜' },
        { key: 'losers', label: '跌幅榜' },
        { key: 'favorites', label: '自选' }
      ],
      coins: [],
      filteredCoins: [],
      favorites: [],
      hasMore: true,
      currentPage: 1,
      pageSize: 20,
      refreshInterval: null
    }
  },
  
  computed: {
    searchResults() {
      if (!this.searchKeyword) return this.coins
      return this.coins.filter(coin => 
        coin.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(this.searchKeyword.toLowerCase())
      )
    }
  },
  
  methods: {
    async loadMarketData() {
      try {
        uni.showLoading({ title: '加载中...' })
        
        const data = await getMarketData({
          page: this.currentPage,
          limit: this.pageSize,
          sort: this.getSortByFilter()
        })
        
        if (this.currentPage === 1) {
          this.coins = data.coins
        } else {
          this.coins = [...this.coins, ...data.coins]
        }
        
        this.hasMore = data.hasMore
        this.applyFilter()
        
      } catch (error) {
        console.error('加载市场数据失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    getSortByFilter() {
      switch (this.currentFilter) {
        case 'gainers':
          return { field: 'change24h', order: 'desc' }
        case 'losers':
          return { field: 'change24h', order: 'asc' }
        case 'favorites':
          return { field: 'marketCap', order: 'desc' }
        default:
          return { field: 'marketCap', order: 'desc' }
      }
    },
    
    applyFilter() {
      let filtered = [...this.searchResults]
      
      if (this.currentFilter === 'favorites') {
        filtered = filtered.filter(coin => this.favorites.includes(coin.symbol))
      }
      
      this.filteredCoins = filtered
    },
    
    switchFilter(filter) {
      this.currentFilter = filter
      this.currentPage = 1
      this.loadMarketData()
    },
    
    selectCoin(coin) {
      uni.navigateTo({
        url: `/pages/market/coin-detail?symbol=${coin.symbol}`
      })
    },
    
    handleBuy(coin) {
      uni.navigateTo({
        url: `/pages/market/buy?symbol=${coin.symbol}&price=${coin.price}`
      })
    },
    
    handleExchange(coin) {
      uni.navigateTo({
        url: `/pages/market/exchange?fromSymbol=${coin.symbol}`
      })
    },
    
    formatPrice(price) {
      if (price >= 1) {
        return price.toFixed(2)
      } else if (price >= 0.01) {
        return price.toFixed(4)
      } else {
        return price.toFixed(8)
      }
    },
    
    formatMarketCap(marketCap) {
      if (marketCap >= 1e12) {
        return (marketCap / 1e12).toFixed(2) + 'T'
      } else if (marketCap >= 1e9) {
        return (marketCap / 1e9).toFixed(2) + 'B'
      } else if (marketCap >= 1e6) {
        return (marketCap / 1e6).toFixed(2) + 'M'
      } else {
        return marketCap.toFixed(0)
      }
    },
    
    formatVolume(volume) {
      if (volume >= 1e9) {
        return (volume / 1e9).toFixed(2) + 'B'
      } else if (volume >= 1e6) {
        return (volume / 1e6).toFixed(2) + 'M'
      } else {
        return volume.toFixed(0)
      }
    },
    
    loadMore() {
      this.currentPage++
      this.loadMarketData()
    },
    
    onPullDownRefresh() {
      this.currentPage = 1
      this.loadMarketData().then(() => {
        uni.stopPullDownRefresh()
      })
    }
  },
  
  onLoad() {
    this.loadMarketData()
    this.refreshInterval = setInterval(() => {
      this.loadMarketData()
    }, 30000)
  },
  
  onUnload() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  }
}
</script>

<style>
.market-page {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.market-header {
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 25rpx;
  padding: 15rpx 20rpx;
  margin-bottom: 20rpx;
}

.search-bar input {
  flex: 1;
  font-size: 28rpx;
  border: none;
  background: transparent;
}

.filter-tabs {
  display: flex;
  gap: 20rpx;
}

.filter-tab {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f5f5f5;
}

.filter-tab.active {
  background-color: #4a8eff;
  color: #ffffff;
}

.market-overview {
  display: flex;
  background-color: #ffffff;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.overview-item {
  flex: 1;
  text-align: center;
}

.overview-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.overview-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.overview-change {
  font-size: 22rpx;
}

.overview-change.positive {
  color: #4cd964;
}

.overview-change.negative {
  color: #ff3b30;
}

.coin-list {
  background-color: #ffffff;
  margin: 0 30rpx 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.list-header {
  display: flex;
  padding: 20rpx;
  background-color: #f8f8f8;
  font-size: 24rpx;
  color: #666;
  font-weight: bold;
}

.header-item {
  flex: 1;
  text-align: center;
}

.coin-item {
  display: flex;
  align-items: center;
  padding: 25rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.coin-item:last-child {
  border-bottom: none;
}

.coin-info {
  flex: 2;
  display: flex;
  align-items: center;
}

.coin-details {
  margin-left: 15rpx;
}

.coin-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.coin-symbol {
  font-size: 22rpx;
  color: #999;
}

.price-info {
  flex: 1.5;
  text-align: center;
}

.price {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.market-cap {
  font-size: 20rpx;
  color: #999;
}

.change-info {
  flex: 1.5;
  text-align: center;
}

.change {
  display: block;
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.change.positive {
  color: #4cd964;
}

.change.negative {
  color: #ff3b30;
}

.volume {
  font-size: 20rpx;
  color: #999;
}

.action-buttons {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.action-btn {
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
  border: none;
}

.action-btn.buy {
  background-color: #4cd964;
  color: #ffffff;
}

.action-btn.exchange {
  background-color: #4a8eff;
  color: #ffffff;
}

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #4a8eff;
  font-size: 28rpx;
}
</style>
