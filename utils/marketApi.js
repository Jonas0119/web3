import axios from 'axios'

// 币安API配置
const BINANCE_API = 'https://api.binance.com/api/v3'
const COINBASE_API = 'https://api.coinbase.com/v2'

// 获取市场数据
export const getMarketData = async (params = {}) => {
  try {
    const { page = 1, limit = 20, sort = { field: 'marketCap', order: 'desc' } } = params
    
    // 获取币安24小时价格变动数据
    const response = await axios.get(`${BINANCE_API}/ticker/24hr`)
    
    // 获取币种信息
    const symbolsResponse = await axios.get(`${BINANCE_API}/exchangeInfo`)
    const symbolsMap = {}
    symbolsResponse.data.symbols.forEach(symbol => {
      symbolsMap[symbol.symbol] = symbol
    })
    
    // 处理数据
    const coins = response.data
      .filter(item => item.symbol.endsWith('USDT')) // 只取USDT交易对
      .map(item => {
        const symbol = item.symbol.replace('USDT', '')
        return {
          symbol: symbol,
          name: getCoinName(symbol),
          price: parseFloat(item.lastPrice),
          change24h: parseFloat(item.priceChangePercent),
          volume24h: parseFloat(item.volume),
          marketCap: parseFloat(item.lastPrice) * parseFloat(item.count), // 估算市值
          high24h: parseFloat(item.highPrice),
          low24h: parseFloat(item.lowPrice),
          openPrice: parseFloat(item.openPrice),
          closePrice: parseFloat(item.lastPrice),
          priceChange: parseFloat(item.priceChange),
          count: parseFloat(item.count),
          quoteVolume: parseFloat(item.quoteVolume)
        }
      })
      .sort((a, b) => {
        if (sort.field === 'marketCap') {
          return sort.order === 'desc' ? b.marketCap - a.marketCap : a.marketCap - b.marketCap
        } else if (sort.field === 'change24h') {
          return sort.order === 'desc' ? b.change24h - a.change24h : a.change24h - b.change24h
        }
        return 0
      })
      .slice((page - 1) * limit, page * limit)
    
    return {
      coins: coins,
      hasMore: coins.length === limit,
      total: response.data.length
    }
    
  } catch (error) {
    console.error('获取市场数据失败:', error)
    // 返回模拟数据
    return {
      coins: getMockMarketData(),
      hasMore: false,
      total: 0
    }
  }
}

// 获取币种详情
export const getCoinDetails = async (symbol) => {
  try {
    const response = await axios.get(`${BINANCE_API}/ticker/24hr?symbol=${symbol}USDT`)
    const data = response.data
    
    return {
      symbol: symbol,
      name: getCoinName(symbol),
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      volume24h: parseFloat(data.volume),
      marketCap: parseFloat(data.lastPrice) * parseFloat(data.count),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      openPrice: parseFloat(data.openPrice),
      closePrice: parseFloat(data.lastPrice),
      priceChange: parseFloat(data.priceChange),
      count: parseFloat(data.count),
      quoteVolume: parseFloat(data.quoteVolume)
    }
  } catch (error) {
    console.error('获取币种详情失败:', error)
    throw new Error('获取币种详情失败')
  }
}

// 获取币种名称映射
const getCoinName = (symbol) => {
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
  
  return nameMap[symbol] || symbol
}

// 获取K线数据
export const getKlineData = async (symbol, interval = '1d', limit = 100) => {
  try {
    const response = await axios.get(`${BINANCE_API}/klines`, {
      params: {
        symbol: `${symbol}USDT`,
        interval: interval,
        limit: limit
      }
    })
    
    return response.data.map(item => ({
      time: item[0],
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5])
    }))
  } catch (error) {
    console.error('获取K线数据失败:', error)
    throw new Error('获取K线数据失败')
  }
}

// 模拟市场数据
const getMockMarketData = () => {
  return [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 45000.00,
      change24h: 2.5,
      volume24h: 25000000000,
      marketCap: 850000000000,
      high24h: 46000.00,
      low24h: 44000.00,
      openPrice: 44500.00,
      closePrice: 45000.00,
      priceChange: 500.00,
      count: 19000000,
      quoteVolume: 25000000000
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 1600.00,
      change24h: -1.2,
      volume24h: 15000000000,
      marketCap: 190000000000,
      high24h: 1650.00,
      low24h: 1580.00,
      openPrice: 1620.00,
      closePrice: 1600.00,
      priceChange: -20.00,
      count: 120000000,
      quoteVolume: 15000000000
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      price: 300.00,
      change24h: 5.8,
      volume24h: 2000000000,
      marketCap: 45000000000,
      high24h: 310.00,
      low24h: 285.00,
      openPrice: 285.00,
      closePrice: 300.00,
      priceChange: 15.00,
      count: 150000000,
      quoteVolume: 2000000000
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.45,
      change24h: 3.2,
      volume24h: 800000000,
      marketCap: 15000000000,
      high24h: 0.47,
      low24h: 0.43,
      openPrice: 0.44,
      closePrice: 0.45,
      priceChange: 0.01,
      count: 33000000000,
      quoteVolume: 800000000
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 95.00,
      change24h: -2.1,
      volume24h: 1200000000,
      marketCap: 40000000000,
      high24h: 98.00,
      low24h: 92.00,
      openPrice: 97.00,
      closePrice: 95.00,
      priceChange: -2.00,
      count: 420000000,
      quoteVolume: 1200000000
    }
  ]
}
