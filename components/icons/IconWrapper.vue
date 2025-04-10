<template>
  <view 
    class="icon-wrapper"
    :style="{ 
      color: color,
      fontSize: size + 'rpx',
      width: size + 'rpx',
      height: size + 'rpx',
      ...customStyle
    }"
    @click="handleClick"
  >
    <text v-if="isIconify" class="iconify" :class="iconClasses">{{ getIconContent() }}</text>
    <text v-else :class="['iconfont', name]"></text>
  </view>
</template>

<script>
import { MDI_CONFIG } from '../../plugins/iconify'

// 添加全局字体加载状态
let isFontLoaded = false;

export default {
  name: 'IconWrapper',
  props: {
    // 图标名称
    name: {
      type: String,
      required: true
    },
    // 图标大小
    size: {
      type: [Number, String],
      default: 32
    },
    // 图标颜色
    color: {
      type: String,
      default: 'currentColor'
    },
    // 自定义样式
    customStyle: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    // 判断是否为 Iconify 图标
    isIconify() {
      return this.name.startsWith('mdi:')
    },
    // 图标类名
    iconClasses() {
      return {
        'mdi': true,
        [`mdi-${this.getMdiName()}`]: true
      }
    }
  },
  methods: {
    handleClick(event) {
      this.$emit('click', event)
    },
    getMdiName() {
      return this.name.replace('mdi:', '')
    },
    getIconContent() {
      const iconName = this.getMdiName()
      return MDI_CONFIG.icons[iconName] || ''
    },
    async loadFont() {
      // 如果字体已加载，直接返回
      if (isFontLoaded) {
        return;
      }

      try {
        await new Promise((resolve, reject) => {
          uni.loadFontFace({
            family: 'Material Design Icons',
            source: 'url("https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/fonts/materialdesignicons-webfont.woff2")',
            success() {
              console.log('字体加载成功');
              resolve();
            },
            fail(error) {
              console.error('字体加载失败:', error);
              reject(error);
            }
          });
        });
        
        // 设置全局加载状态
        isFontLoaded = true;
      } catch (error) {
        console.error('字体加载出错:', error);
      }
    }
  },
  mounted() {
    this.loadFont();
  }
}
</script>

<style>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.iconify {
  font-family: 'Material Design Icons';
  font-style: normal;
  line-height: 1;
}

.iconfont {
  font-family: "iconfont" !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style> 