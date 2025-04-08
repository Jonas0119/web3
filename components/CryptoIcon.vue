<template>
  <view class="crypto-icon" :class="['icon-' + symbol.toLowerCase()]">
    {{ getSymbolText() }}
  </view>
</template>

<script>
export default {
  name: 'CryptoIcon',
  props: {
    symbol: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 80
    }
  },
  methods: {
    getSymbolText() {
      if (!this.symbol) return '';
      return this.symbol.charAt(0).toUpperCase();
    }
  }
}
</script>

<style>
@import '../static/icons/icon.css';

.crypto-icon {
  border-radius: 50%;
  width: v-bind(size + 'rpx');
  height: v-bind(size + 'rpx');
}
</style> 