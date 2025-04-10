<template>
  <view 
    class="crypto-icon"
    :style="{ 
      width: size + 'rpx',
      height: size + 'rpx'
    }"
  >
    <image
      v-if="iconUrl"
      :src="iconUrl"
      :style="{ 
        width: size + 'rpx',
        height: size + 'rpx'
      }"
      mode="aspectFit"
    />
    <view v-else class="fallback-icon" :style="fallbackStyle">
      {{ getSymbolText() }}
    </view>
  </view>
</template>

<script>
const ICON_COLORS = {
  'eth': '#627EEA',
  'btc': '#F7931A',
  'usdt': '#26A17B',
  'bnb': '#F3BA2F',
  'default': '#4A8EFF'
}

// 添加图标缓存
const iconCache = new Map();

export default {
  name: 'CryptoIcon',
  props: {
    symbol: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 80
    },
    type: {
      type: String,
      default: 'color', // 'color' 或 'black'
      validator: value => ['color', 'black'].includes(value)
    }
  },
  data() {
    return {
      iconUrl: '',
      isLoading: false
    }
  },
  computed: {
    fallbackStyle() {
      const symbol = this.symbol.toLowerCase()
      const backgroundColor = ICON_COLORS[symbol] || ICON_COLORS.default
      
      return {
        backgroundColor,
        width: this.size + 'rpx',
        height: this.size + 'rpx',
        fontSize: (this.size * 0.4) + 'rpx'
      }
    },
    cacheKey() {
      return `${this.type}_${this.symbol.toLowerCase()}`
    }
  },
  methods: {
    getSymbolText() {
      if (!this.symbol) return ''
      return this.symbol.charAt(0).toUpperCase()
    },
    async loadIcon() {
      if (this.isLoading) return;
      
      try {
        const symbol = this.symbol.toLowerCase()
        const iconType = this.type === 'color' ? 'color' : 'black'
        
        // 检查缓存
        if (iconCache.has(this.cacheKey)) {
          this.iconUrl = iconCache.get(this.cacheKey);
          return;
        }
        
        // 标记加载状态
        this.isLoading = true;
        
        // 使用静态资源路径
        const iconUrl = `/static/crypto-icons/${iconType}/${symbol}.svg`
        
        // 检查图标是否存在
        try {
          const [error] = await new Promise((resolve) => {
            uni.getImageInfo({
              src: iconUrl,
              success: () => resolve([null, true]),
              fail: (err) => resolve([err, false])
            })
          });
          
          if (!error) {
            this.iconUrl = iconUrl;
            // 缓存成功加载的图标URL
            iconCache.set(this.cacheKey, iconUrl);
          } else {
            this.iconUrl = '';
            // 缓存空结果，避免重复请求不存在的图标
            iconCache.set(this.cacheKey, '');
          }
        } catch (error) {
          console.error('Failed to check icon:', error);
          this.iconUrl = '';
        }
      } catch (error) {
        console.error('Failed to load crypto icon:', error);
        this.iconUrl = '';
      } finally {
        this.isLoading = false;
      }
    }
  },
  watch: {
    cacheKey: {
      immediate: true,
      handler() {
        this.loadIcon();
      }
    }
  }
}
</script>

<style>
.crypto-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
}

.fallback-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #FFFFFF;
  font-weight: bold;
}
</style> 