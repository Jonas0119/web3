import axios from 'axios'

// 兑换服务API配置
const EXCHANGE_API = 'https://api.1inch.io/v5.0/1' // 使用1inch API
const BACKUP_API = 'https://api.coingecko.com/api/v3'

// 获取支持的币种列表
export const getSupportedCoins = async () => {
  try {
    // 这里应该从实际的钱包余额API获取
    // 暂时返回模拟数据
    return [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '1.2345',
        price: 1600.00,
        icon: 'eth'
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        balance: '1000.00',
        price: 1.00,
        icon: 'usdt'
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: '0.0012',
        price: 45000.00,
        icon: 'btc'
      },
      {
        symbol: 'BNB',
        name: 'Binance Coin',
        balance: '5.6789',
        price: 300.00,
        icon: 'bnb'
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        balance: '1000.00',
        price: 0.45,
        icon: 'ada'
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: '10.50',
        price: 95.00,
        icon: 'sol'
      }
    ]
  } catch (error) {
    console.error('获取支持币种失败:', error)
    return []
  }
}

// 获取兑换汇率
export const getExchangeRate = async (fromSymbol, toSymbol) => {
  try {
    // 使用1inch API获取汇率
    const response = await axios.get(`${EXCHANGE_API}/quote`, {
      params: {
        fromTokenAddress: getTokenAddress(fromSymbol),
        toTokenAddress: getTokenAddress(toSymbol),
        amount: '1000000000000000000' // 1 ETH in wei
      }
    })
    
    const rate = parseFloat(response.data.toTokenAmount) / parseFloat(response.data.fromTokenAmount)
    return rate
    
  } catch (error) {
    console.error('获取兑换汇率失败:', error)
    
    // 备用方案：使用CoinGecko API
    try {
      const response = await axios.get(`${BACKUP_API}/simple/price`, {
        params: {
          ids: `${getCoinGeckoId(fromSymbol)},${getCoinGeckoId(toSymbol)}`,
          vs_currencies: 'usd'
        }
      })
      
      const fromPrice = response.data[getCoinGeckoId(fromSymbol)].usd
      const toPrice = response.data[getCoinGeckoId(toSymbol)].usd
      
      return fromPrice / toPrice
      
    } catch (backupError) {
      console.error('备用API也失败:', backupError)
      // 返回模拟汇率
      return getMockExchangeRate(fromSymbol, toSymbol)
    }
  }
}

// 执行兑换
export const executeExchange = async (params) => {
  try {
    const { fromCoin, toCoin, fromAmount, toAmount, exchangeRate, fee } = params
    
    // 这里需要集成实际的兑换服务
    // 例如：1inch、Uniswap、PancakeSwap等
    
    // 模拟兑换过程
    const transactionId = generateTransactionId()
    
    // 记录兑换历史
    await saveExchangeHistory({
      id: transactionId,
      fromCoin: fromCoin,
      toCoin: toCoin,
      fromAmount: fromAmount,
      toAmount: toAmount,
      exchangeRate: exchangeRate,
      fee: fee,
      status: 'completed',
      timestamp: Date.now()
    })
    
    return {
      success: true,
      transactionId: transactionId,
      transactionHash: `0x${transactionId}`,
      fromAmount: fromAmount,
      toAmount: toAmount,
      exchangeRate: exchangeRate,
      fee: fee
    }
    
  } catch (error) {
    console.error('执行兑换失败:', error)
    return {
      success: false,
      error: error.message || '兑换失败'
    }
  }
}

// 计算手续费
export const calculateFee = (amount, feeRate) => {
  const fee = parseFloat(amount) * parseFloat(feeRate) / 100
  return fee.toFixed(6)
}

// 获取代币地址
const getTokenAddress = (symbol) => {
  const addressMap = {
    'ETH': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
    'USDC': '0xa0b86a33e6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0',
    'BTC': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    'BNB': '0xb8c77482e45f1f44de1745f52c74426c631bdd52'
  }
  
  return addressMap[symbol] || '0x0000000000000000000000000000000000000000'
}

// 获取CoinGecko ID
const getCoinGeckoId = (symbol) => {
  const idMap = {
    'ETH': 'ethereum',
    'BTC': 'bitcoin',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'BNB': 'binancecoin',
    'ADA': 'cardano',
    'SOL': 'solana',
    'XRP': 'ripple',
    'DOT': 'polkadot',
    'DOGE': 'dogecoin'
  }
  
  return idMap[symbol] || symbol.toLowerCase()
}

// 生成交易ID
const generateTransactionId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// 保存兑换历史
const saveExchangeHistory = async (history) => {
  try {
    const histories = uni.getStorageSync('exchange_histories') || []
    histories.unshift(history)
    
    // 只保留最近100条记录
    if (histories.length > 100) {
      histories.splice(100)
    }
    
    uni.setStorageSync('exchange_histories', histories)
  } catch (error) {
    console.error('保存兑换历史失败:', error)
  }
}

// 获取兑换历史
export const getExchangeHistory = async () => {
  try {
    return uni.getStorageSync('exchange_histories') || []
  } catch (error) {
    console.error('获取兑换历史失败:', error)
    return []
  }
}

// 模拟汇率数据
const getMockExchangeRate = (fromSymbol, toSymbol) => {
  const rates = {
    'ETH_USDT': 1600,
    'ETH_BTC': 0.035,
    'ETH_BNB': 5.33,
    'BTC_USDT': 45000,
    'BTC_ETH': 28.57,
    'BTC_BNB': 150,
    'USDT_ETH': 0.000625,
    'USDT_BTC': 0.000022,
    'USDT_BNB': 0.0033,
    'BNB_ETH': 0.1875,
    'BNB_BTC': 0.0067,
    'BNB_USDT': 300
  }
  
  const key = `${fromSymbol}_${toSymbol}`
  return rates[key] || 1
}
