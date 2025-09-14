<template>
  <view class="exchange-page">
    <!-- 顶部导航 -->
    <view class="exchange-header">
      <view class="back-btn" @click="goBack">
        <icon-wrapper name="mdi:arrow-left" />
      </view>
      <text class="page-title">币币兑换</text>
      <view class="history-btn" @click="showHistory">
        <icon-wrapper name="mdi:history" />
      </view>
    </view>

    <!-- 兑换表单 -->
    <view class="exchange-form">
      <!-- 从币种选择 -->
      <view class="exchange-section from-section">
        <view class="section-header">
          <text class="section-title">从</text>
          <text class="balance-text">余额: {{ fromCoin.balance }} {{ fromCoin.symbol }}</text>
        </view>
        
        <view class="coin-selector" @click="showFromCoinSelector">
          <view class="selected-coin">
            <crypto-icon :symbol="fromCoin.symbol.toLowerCase()" :size="50" />
            <view class="coin-info">
              <text class="coin-name">{{ fromCoin.name }}</text>
              <text class="coin-symbol">{{ fromCoin.symbol }}</text>
            </view>
          </view>
          <icon-wrapper name="mdi:chevron-down" />
        </view>
        
        <view class="amount-input">
          <input 
            v-model="fromAmount" 
            type="number"
            placeholder="0.00"
            @input="calculateToAmount"
          />
          <view class="max-btn" @click="setMaxAmount">MAX</view>
        </view>
        
        <view class="amount-usd">
          约 ${{ fromAmountUSD }}
        </view>
      </view>

      <!-- 兑换箭头 -->
      <view class="exchange-arrow" @click="swapCoins">
        <icon-wrapper name="mdi:swap-vertical" :size="30" />
      </view>

      <!-- 到币种选择 -->
      <view class="exchange-section to-section">
        <view class="section-header">
          <text class="section-title">到</text>
          <text class="balance-text">余额: {{ toCoin.balance }} {{ toCoin.symbol }}</text>
        </view>
        
        <view class="coin-selector" @click="showToCoinSelector">
          <view class="selected-coin">
            <crypto-icon :symbol="toCoin.symbol.toLowerCase()" :size="50" />
            <view class="coin-info">
              <text class="coin-name">{{ toCoin.name }}</text>
              <text class="coin-symbol">{{ toCoin.symbol }}</text>
            </view>
          </view>
          <icon-wrapper name="mdi:chevron-down" />
        </view>
        
        <view class="amount-input">
          <input 
            v-model="toAmount" 
            type="number"
            placeholder="0.00"
            readonly
          />
        </view>
        
        <view class="amount-usd">
          约 ${{ toAmountUSD }}
        </view>
      </view>
    </view>

    <!-- 兑换信息 -->
    <view class="exchange-info">
      <view class="info-item">
        <text class="info-label">汇率</text>
        <text class="info-value">1 {{ fromCoin.symbol }} = {{ exchangeRate }} {{ toCoin.symbol }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">手续费</text>
        <text class="info-value">{{ feeRate }}% ({{ feeAmount }} {{ fromCoin.symbol }})</text>
      </view>
      <view class="info-item">
        <text class="info-label">预计到账</text>
        <text class="info-value">{{ finalAmount }} {{ toCoin.symbol }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">预计时间</text>
        <text class="info-value">2-5分钟</text>
      </view>
    </view>

    <!-- 兑换按钮 -->
    <view class="exchange-actions">
      <button 
        class="exchange-btn" 
        :class="{ disabled: !canExchange }"
        @click="executeExchange"
      >
        {{ exchangeBtnText }}
      </button>
    </view>

    <!-- 币种选择弹窗 -->
    <view class="coin-selector-modal" v-if="showCoinSelector">
      <view class="modal-mask" @click="hideCoinSelector"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">选择币种</text>
          <view class="close-btn" @click="hideCoinSelector">
            <icon-wrapper name="mdi:close" />
          </view>
        </view>
        
        <view class="search-bar">
          <input v-model="searchKeyword" placeholder="搜索币种" />
        </view>
        
        <view class="coin-list">
          <view 
            v-for="coin in filteredCoins" 
            :key="coin.symbol"
            class="coin-item"
            @click="selectCoin(coin)"
          >
            <crypto-icon :symbol="coin.symbol.toLowerCase()" :size="40" />
            <view class="coin-details">
              <text class="coin-name">{{ coin.name }}</text>
              <text class="coin-symbol">{{ coin.symbol }}</text>
            </view>
            <text class="coin-balance">{{ coin.balance }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getExchangeRate, 
  executeExchange, 
  getSupportedCoins,
  calculateFee 
} from '@/utils/exchangeApi.js'
import { IconWrapper, CryptoIcon } from '@/components/icons'

export default {
  components: {
    'icon-wrapper': IconWrapper,
    'crypto-icon': CryptoIcon
  },
  data() {
    return {
      fromCoin: {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '0.0000',
        price: 0
      },
      toCoin: {
        symbol: 'USDT',
        name: 'Tether',
        balance: '0.0000',
        price: 0
      },
      fromAmount: '',
      toAmount: '',
      exchangeRate: '0.0000',
      feeRate: '0.25',
      feeAmount: '0.0000',
      finalAmount: '0.0000',
      supportedCoins: [],
      showCoinSelector: false,
      selectorType: 'from',
      searchKeyword: '',
      isExchanging: false
    }
  },
  
  computed: {
    fromAmountUSD() {
      return (parseFloat(this.fromAmount) * this.fromCoin.price).toFixed(2)
    },
    
    toAmountUSD() {
      return (parseFloat(this.toAmount) * this.toCoin.price).toFixed(2)
    },
    
    canExchange() {
      return this.fromAmount && 
             parseFloat(this.fromAmount) > 0 && 
             parseFloat(this.fromAmount) <= parseFloat(this.fromCoin.balance) &&
             !this.isExchanging
    },
    
    exchangeBtnText() {
      if (this.isExchanging) return '兑换中...'
      if (!this.fromAmount) return '输入兑换数量'
      if (parseFloat(this.fromAmount) > parseFloat(this.fromCoin.balance)) {
        return '余额不足'
      }
      return '立即兑换'
    },
    
    filteredCoins() {
      if (!this.searchKeyword) return this.supportedCoins
      return this.supportedCoins.filter(coin => 
        coin.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(this.searchKeyword.toLowerCase())
      )
    }
  },
  
  methods: {
    async calculateToAmount() {
      if (!this.fromAmount || parseFloat(this.fromAmount) <= 0) {
        this.toAmount = ''
        return
      }
      
      try {
        const rate = await getExchangeRate(this.fromCoin.symbol, this.toCoin.symbol)
        this.exchangeRate = rate.toFixed(6)
        
        const amount = parseFloat(this.fromAmount) * rate
        this.toAmount = amount.toFixed(6)
        
        this.feeAmount = calculateFee(this.fromAmount, this.feeRate)
        this.finalAmount = (amount - parseFloat(this.feeAmount)).toFixed(6)
        
      } catch (error) {
        console.error('计算兑换数量失败:', error)
        uni.showToast({
          title: '计算失败',
          icon: 'none'
        })
      }
    },
    
    setMaxAmount() {
      this.fromAmount = this.fromCoin.balance
      this.calculateToAmount()
    },
    
    swapCoins() {
      const temp = { ...this.fromCoin }
      this.fromCoin = { ...this.toCoin }
      this.toCoin = temp
      
      const tempAmount = this.fromAmount
      this.fromAmount = this.toAmount
      this.toAmount = tempAmount
      
      this.calculateToAmount()
    },
    
    showFromCoinSelector() {
      this.selectorType = 'from'
      this.showCoinSelector = true
    },
    
    showToCoinSelector() {
      this.selectorType = 'to'
      this.showCoinSelector = true
    },
    
    hideCoinSelector() {
      this.showCoinSelector = false
      this.searchKeyword = ''
    },
    
    selectCoin(coin) {
      if (this.selectorType === 'from') {
        this.fromCoin = coin
      } else {
        this.toCoin = coin
      }
      
      this.hideCoinSelector()
      this.calculateToAmount()
    },
    
    async executeExchange() {
      if (!this.canExchange) return
      
      try {
        this.isExchanging = true
        
        const confirmResult = await this.showConfirmDialog()
        if (!confirmResult) {
          this.isExchanging = false
          return
        }
        
        uni.showLoading({ title: '兑换中...' })
        
        const result = await executeExchange({
          fromCoin: this.fromCoin.symbol,
          toCoin: this.toCoin.symbol,
          fromAmount: this.fromAmount,
          toAmount: this.finalAmount,
          exchangeRate: this.exchangeRate,
          fee: this.feeAmount
        })
        
        if (result.success) {
          uni.showToast({
            title: '兑换成功',
            icon: 'success'
          })
          
          await this.updateBalances()
          
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/market/exchange-history?id=${result.transactionId}`
            })
          }, 1500)
          
        } else {
          throw new Error(result.error)
        }
        
      } catch (error) {
        console.error('兑换失败:', error)
        uni.showToast({
          title: error.message || '兑换失败',
          icon: 'none'
        })
      } finally {
        this.isExchanging = false
        uni.hideLoading()
      }
    },
    
    showConfirmDialog() {
      return new Promise((resolve) => {
        uni.showModal({
          title: '确认兑换',
          content: `确定要用 ${this.fromAmount} ${this.fromCoin.symbol} 兑换 ${this.finalAmount} ${this.toCoin.symbol} 吗？`,
          success: (res) => {
            resolve(res.confirm)
          }
        })
      })
    },
    
    async updateBalances() {
      try {
        const balances = await this.getUserBalances()
        this.fromCoin.balance = balances[this.fromCoin.symbol] || '0.0000'
        this.toCoin.balance = balances[this.toCoin.symbol] || '0.0000'
      } catch (error) {
        console.error('更新余额失败:', error)
      }
    },
    
    async getUserBalances() {
      return {
        'ETH': '1.2345',
        'USDT': '1000.00',
        'BTC': '0.0012'
      }
    },
    
    showHistory() {
      uni.navigateTo({
        url: '/pages/market/exchange-history'
      })
    },
    
    goBack() {
      uni.navigateBack()
    }
  },
  
  async onLoad(options) {
    this.supportedCoins = await getSupportedCoins()
    
    if (options.fromSymbol) {
      const fromCoin = this.supportedCoins.find(coin => coin.symbol === options.fromSymbol)
      if (fromCoin) {
        this.fromCoin = fromCoin
      }
    }
    
    await this.updateBalances()
  }
}
</script>

<style>
.exchange-page {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.exchange-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e5;
}

.back-btn, .history-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.exchange-form {
  margin: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.exchange-section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.balance-text {
  font-size: 24rpx;
  color: #999;
}

.coin-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
}

.selected-coin {
  display: flex;
  align-items: center;
}

.coin-info {
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

.amount-input {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}

.amount-input input {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  background: transparent;
}

.max-btn {
  padding: 10rpx 20rpx;
  background-color: #4a8eff;
  color: #ffffff;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.amount-usd {
  font-size: 24rpx;
  color: #999;
  text-align: right;
}

.exchange-arrow {
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}

.exchange-info {
  margin: 0 30rpx 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: #666;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.exchange-actions {
  margin: 0 30rpx 30rpx;
}

.exchange-btn {
  width: 100%;
  height: 90rpx;
  background-color: #4a8eff;
  color: #ffffff;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.exchange-btn.disabled {
  background-color: #ccc;
  color: #999;
}

.coin-selector-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-bar {
  padding: 20rpx 30rpx;
}

.search-bar input {
  width: 100%;
  height: 70rpx;
  background-color: #f8f8f8;
  border-radius: 35rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  border: none;
}

.coin-list {
  max-height: 50vh;
  overflow-y: auto;
}

.coin-item {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.coin-item:last-child {
  border-bottom: none;
}

.coin-details {
  flex: 1;
  margin-left: 20rpx;
}

.coin-balance {
  font-size: 24rpx;
  color: #999;
}
</style>
