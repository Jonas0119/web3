<template>
  <view class="buy-page">
    <!-- 顶部导航 -->
    <view class="buy-header">
      <view class="back-btn" @click="goBack">
        <icon-wrapper name="mdi:arrow-left" />
      </view>
      <text class="page-title">买入{{ coinInfo.symbol }}</text>
      <view class="placeholder"></view>
    </view>

    <!-- 币种信息卡片 -->
    <view class="coin-card">
      <view class="coin-info">
        <crypto-icon :symbol="coinInfo.symbol.toLowerCase()" :size="60" />
        <view class="coin-details">
          <text class="coin-name">{{ coinInfo.name }}</text>
          <text class="coin-symbol">{{ coinInfo.symbol }}</text>
        </view>
      </view>
      <view class="price-info">
        <text class="current-price">${{ formatPrice(coinInfo.price) }}</text>
        <text 
          class="price-change" 
          :class="coinInfo.change24h >= 0 ? 'positive' : 'negative'"
        >
          {{ coinInfo.change24h >= 0 ? '+' : '' }}{{ coinInfo.change24h.toFixed(2) }}%
        </text>
      </view>
    </view>

    <!-- 买入表单 -->
    <view class="buy-form">
      <view class="form-section">
        <text class="section-title">买入数量</text>
        <view class="amount-input-group">
          <input 
            v-model="buyAmount" 
            type="number"
            placeholder="0.00"
            class="amount-input"
            @input="calculateTotalCost"
          />
          <text class="coin-symbol">{{ coinInfo.symbol }}</text>
        </view>
        <view class="amount-usd">
          约 ${{ totalCostUSD }}
        </view>
      </view>

      <view class="form-section">
        <text class="section-title">支付方式</text>
        <view class="payment-methods">
          <view 
            v-for="method in paymentMethods" 
            :key="method.id"
            class="payment-method"
            :class="{ active: selectedPayment === method.id }"
            @click="selectPayment(method.id)"
          >
            <icon-wrapper :name="method.icon" :size="30" />
            <text class="method-name">{{ method.name }}</text>
            <text class="method-balance">余额: {{ method.balance }}</text>
          </view>
        </view>
      </view>

      <view class="form-section">
        <text class="section-title">交易信息</text>
        <view class="trade-info">
          <view class="info-row">
            <text class="info-label">单价</text>
            <text class="info-value">${{ formatPrice(coinInfo.price) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">数量</text>
            <text class="info-value">{{ buyAmount || '0' }} {{ coinInfo.symbol }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">手续费</text>
            <text class="info-value">{{ feeRate }}% ({{ feeAmount }} {{ selectedPaymentMethod.symbol }})</text>
          </view>
          <view class="info-row total-row">
            <text class="info-label">总计</text>
            <text class="info-value total-amount">{{ totalCost }} {{ selectedPaymentMethod.symbol }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 买入按钮 -->
    <view class="buy-actions">
      <button 
        class="buy-btn" 
        :class="{ disabled: !canBuy }"
        @click="executeBuy"
      >
        {{ buyBtnText }}
      </button>
    </view>

    <!-- 风险提示 -->
    <view class="risk-warning">
      <text class="warning-title">⚠️ 风险提示</text>
      <text class="warning-text">数字货币投资有风险，请谨慎投资，理性决策。</text>
    </view>
  </view>
</template>

<script>
import { IconWrapper, CryptoIcon } from '@/components/icons'

export default {
  components: {
    'icon-wrapper': IconWrapper,
    'crypto-icon': CryptoIcon
  },
  data() {
    return {
      coinInfo: {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 45000,
        change24h: 2.5
      },
      buyAmount: '',
      selectedPayment: 'usdt',
      paymentMethods: [
        {
          id: 'usdt',
          name: 'USDT',
          symbol: 'USDT',
          icon: 'mdi:currency-usd',
          balance: '1000.00'
        },
        {
          id: 'eth',
          name: 'Ethereum',
          symbol: 'ETH',
          icon: 'mdi:ethereum',
          balance: '2.5'
        },
        {
          id: 'bnb',
          name: 'BNB',
          symbol: 'BNB',
          icon: 'mdi:currency-btc',
          balance: '50.0'
        }
      ],
      feeRate: '0.1',
      feeAmount: '0.00',
      totalCost: '0.00',
      isBuying: false
    }
  },
  
  computed: {
    selectedPaymentMethod() {
      return this.paymentMethods.find(method => method.id === this.selectedPayment) || this.paymentMethods[0]
    },
    
    totalCostUSD() {
      if (!this.buyAmount || parseFloat(this.buyAmount) <= 0) return '0.00'
      return (parseFloat(this.buyAmount) * this.coinInfo.price).toFixed(2)
    },
    
    canBuy() {
      return this.buyAmount && 
             parseFloat(this.buyAmount) > 0 && 
             parseFloat(this.totalCost) <= parseFloat(this.selectedPaymentMethod.balance) &&
             !this.isBuying
    },
    
    buyBtnText() {
      if (this.isBuying) return '买入中...'
      if (!this.buyAmount) return '输入买入数量'
      if (parseFloat(this.totalCost) > parseFloat(this.selectedPaymentMethod.balance)) {
        return '余额不足'
      }
      return `买入 ${this.buyAmount} ${this.coinInfo.symbol}`
    }
  },
  
  methods: {
    calculateTotalCost() {
      if (!this.buyAmount || parseFloat(this.buyAmount) <= 0) {
        this.totalCost = '0.00'
        this.feeAmount = '0.00'
        return
      }
      
      const cost = parseFloat(this.buyAmount) * this.coinInfo.price
      const fee = cost * (parseFloat(this.feeRate) / 100)
      this.feeAmount = fee.toFixed(2)
      this.totalCost = (cost + fee).toFixed(2)
    },
    
    selectPayment(paymentId) {
      this.selectedPayment = paymentId
      this.calculateTotalCost()
    },
    
    async executeBuy() {
      if (!this.canBuy) return
      
      try {
        this.isBuying = true
        
        const confirmResult = await this.showConfirmDialog()
        if (!confirmResult) {
          this.isBuying = false
          return
        }
        
        uni.showLoading({ title: '买入中...' })
        
        // 模拟买入请求
        await this.simulateBuyRequest()
        
        uni.showToast({
          title: '买入成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        console.error('买入失败:', error)
        uni.showToast({
          title: error.message || '买入失败',
          icon: 'none'
        })
      } finally {
        this.isBuying = false
        uni.hideLoading()
      }
    },
    
    simulateBuyRequest() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟90%成功率
          if (Math.random() > 0.1) {
            resolve({ success: true })
          } else {
            reject(new Error('网络错误，请重试'))
          }
        }, 2000)
      })
    },
    
    showConfirmDialog() {
      return new Promise((resolve) => {
        uni.showModal({
          title: '确认买入',
          content: `确定要用 ${this.totalCost} ${this.selectedPaymentMethod.symbol} 买入 ${this.buyAmount} ${this.coinInfo.symbol} 吗？`,
          success: (res) => {
            resolve(res.confirm)
          }
        })
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
    
    goBack() {
      uni.navigateBack()
    }
  },
  
  onLoad(options) {
    // 从路由参数获取币种信息
    if (options.symbol) {
      this.coinInfo.symbol = options.symbol.toUpperCase()
    }
    if (options.price) {
      this.coinInfo.price = parseFloat(options.price)
    }
    
    // 根据币种设置名称
    const nameMap = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'Binance Coin',
      'ADA': 'Cardano',
      'SOL': 'Solana',
      'XRP': 'XRP',
      'DOT': 'Polkadot',
      'DOGE': 'Dogecoin',
      'AVAX': 'Avalanche',
      'SHIB': 'Shiba Inu',
      'MATIC': 'Polygon',
      'LTC': 'Litecoin',
      'UNI': 'Uniswap',
      'LINK': 'Chainlink',
      'ATOM': 'Cosmos',
      'FTM': 'Fantom',
      'NEAR': 'NEAR Protocol',
      'ALGO': 'Algorand',
      'VET': 'VeChain',
      'ICP': 'Internet Computer'
    }
    
    this.coinInfo.name = nameMap[this.coinInfo.symbol] || this.coinInfo.symbol
  }
}
</script>

<style>
.buy-page {
  background-color: #f8f8f8;
  min-height: 100vh;
}

.buy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e5;
}

.back-btn {
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

.placeholder {
  width: 60rpx;
}

.coin-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30rpx;
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.coin-info {
  display: flex;
  align-items: center;
}

.coin-details {
  margin-left: 20rpx;
}

.coin-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.coin-symbol {
  font-size: 24rpx;
  color: #999;
}

.price-info {
  text-align: right;
}

.current-price {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.price-change {
  font-size: 24rpx;
  font-weight: bold;
}

.price-change.positive {
  color: #4cd964;
}

.price-change.negative {
  color: #ff3b30;
}

.buy-form {
  margin: 0 30rpx 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 40rpx;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.amount-input-group {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}

.amount-input {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  background: transparent;
}

.amount-usd {
  font-size: 24rpx;
  color: #999;
  text-align: right;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 15rpx;
  border: 2rpx solid transparent;
}

.payment-method.active {
  background-color: #e8f4ff;
  border-color: #4a8eff;
}

.method-name {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.method-balance {
  font-size: 24rpx;
  color: #999;
}

.trade-info {
  background-color: #f8f8f8;
  border-radius: 15rpx;
  padding: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #e5e5e5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.total-row {
  border-top: 2rpx solid #e5e5e5;
  margin-top: 10rpx;
  padding-top: 20rpx;
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

.total-amount {
  color: #4a8eff;
  font-size: 32rpx;
}

.buy-actions {
  margin: 0 30rpx 30rpx;
}

.buy-btn {
  width: 100%;
  height: 90rpx;
  background-color: #4cd964;
  color: #ffffff;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.buy-btn.disabled {
  background-color: #ccc;
  color: #999;
}

.risk-warning {
  margin: 0 30rpx 30rpx;
  padding: 20rpx;
  background-color: #fff3cd;
  border-radius: 15rpx;
  border-left: 6rpx solid #ffc107;
}

.warning-title {
  display: block;
  font-size: 24rpx;
  font-weight: bold;
  color: #856404;
  margin-bottom: 10rpx;
}

.warning-text {
  font-size: 22rpx;
  color: #856404;
  line-height: 1.5;
}
</style>
