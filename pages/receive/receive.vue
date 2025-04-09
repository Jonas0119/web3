<template>
	<view class="receive-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-icon" @click="handleBack">
				<text class="iconfont icon-back"></text>
			</view>
			<view class="title">收款</view>
		</view>
		
		<!-- 提示信息 -->
		<view class="warning-tip">
			<text class="warning-icon">&#9432;</text>
			<text class="warning-text">仅向该地址转入ETH相关资产</text>
		</view>
		
		<!-- 二维码区域 -->
		<view class="qrcode-section">
			<tki-qrcode
				ref="qrcode"
				:size="250"
				:unit="'rpx'"
				:show="true"
				:val="walletAddress"
				:background="'#ffffff'"
				:foreground="'#000000'"
				:pdground="'#000000'"
				:onval="true"
				:loadMake="true"
				:usingComponents="true"
				:errorCorrectLevel="2"
			/>
		</view>
		
		<!-- 地址信息 -->
		<view class="address-section">
			<view class="address-label">收款账户:</view>
			<view class="address-value" @longpress="handleCopy">{{walletAddress}}</view>
			<!-- 隐藏的文本区域用于复制 -->
			<textarea class="hidden-textarea" :value="walletAddress" ref="hiddenTextarea"/>
		</view>
		
		<!-- 复制按钮 -->
		<view class="copy-button" @click="handleCopy">
			<text class="copy-icon iconfont icon-copy"></text>
			<text class="copy-text">复制账户</text>
		</view>
	</view>
</template>

<script>
import tkiQrcode from 'tki-qrcode'
import { loadWalletFromStorage, formatAddress } from '@/utils/web3Utils.js'

export default {
	components: {
		tkiQrcode
	},
	data() {
		return {
			walletAddress: ''
		}
	},
	onShow() {
		// 获取当前活动钱包地址
		const wallet = loadWalletFromStorage();
		if (wallet && wallet.address) {
			this.walletAddress = wallet.address;
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		formatAddress(address) {
			return formatAddress(address);
		},
		async handleCopy() {
			if (!this.walletAddress) {
				uni.showToast({
					title: '地址无效',
					icon: 'none'
				});
				return;
			}
			
			try {
				// H5环境
				// #ifdef H5
				await this.h5Copy(this.walletAddress);
				// #endif

				// APP环境
				// #ifdef APP-PLUS
				await this.appCopy(this.walletAddress);
				// #endif

				// 小程序环境
				// #ifdef MP
				await this.mpCopy(this.walletAddress);
				// #endif
				
				// 复制成功后的处理
				this.handleCopySuccess();
			} catch (error) {
				console.error('复制失败:', error);
				// 如果常规复制失败，尝试创建临时输入框复制
				await this.fallbackCopy(this.walletAddress);
			}
		},
		
		// H5环境复制
		h5Copy(text) {
			return new Promise((resolve, reject) => {
				const textarea = document.createElement('textarea');
				textarea.value = text;
				textarea.style.position = 'fixed';
				textarea.style.left = '0';
				textarea.style.top = '0';
				textarea.style.opacity = '0';
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				
				try {
					document.execCommand('copy');
					document.body.removeChild(textarea);
					resolve();
				} catch (err) {
					document.body.removeChild(textarea);
					reject(err);
				}
			});
		},
		
		// APP环境复制
		appCopy(text) {
			return new Promise((resolve, reject) => {
				try {
					// 优先使用plus接口
					if (window.plus) {
						plus.runtime.copyToClipboard(text);
						resolve();
						return;
					}
					
					// 降级使用uni接口
					uni.setClipboardData({
						data: text,
						success: resolve,
						fail: reject
					});
				} catch (error) {
					reject(error);
				}
			});
		},
		
		// 小程序环境复制
		mpCopy(text) {
			return new Promise((resolve, reject) => {
				uni.setClipboardData({
					data: text,
					success: resolve,
					fail: reject
				});
			});
		},
		
		// 降级复制方案
		async fallbackCopy(text) {
			try {
				// 创建临时输入框
				const input = document.createElement('input');
				input.setAttribute('readonly', 'readonly');
				input.setAttribute('value', text);
				input.style.position = 'absolute';
				input.style.left = '-9999px';
				document.body.appendChild(input);
				
				// 选择并复制
				input.select();
				input.setSelectionRange(0, text.length);
				document.execCommand('copy');
				document.body.removeChild(input);
				
				// 显示成功提示
				this.handleCopySuccess();
			} catch (error) {
				console.error('降级复制也失败了:', error);
				// 提示用户手动复制
				uni.showModal({
					title: '复制失败',
					content: '请手动长按以下地址进行复制：\n\n' + text,
					confirmText: '我已复制',
					success: (res) => {
						if (res.confirm) {
							this.handleCopySuccess();
						}
					}
				});
			}
		},
		
		handleCopySuccess() {
			uni.showToast({
				title: '地址已复制',
				icon: 'success',
				duration: 2000,
				success: () => {
					setTimeout(() => {
						uni.navigateBack();
					}, 2000);
				}
			});
		}
	}
}
</script>

<style>
.receive-container {
	min-height: 100vh;
	background-color: #FFFFFF;
	padding: 0 32rpx;
}

.navbar {
	display: flex;
	align-items: center;
	height: 88rpx;
	position: relative;
}

.back-icon {
	position: absolute;
	left: 0;
	font-size: 40rpx;
}

.title {
	flex: 1;
	text-align: center;
	font-size: 36rpx;
	font-weight: 500;
}

.warning-tip {
	margin-top: 20rpx;
	background-color: #FFF2F2;
	padding: 20rpx;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
}

.warning-icon {
	color: #FF4B4B;
	margin-right: 10rpx;
}

.warning-text {
	color: #FF4B4B;
	font-size: 28rpx;
}

.qrcode-section {
	margin: 40rpx auto;
	width: 600rpx;
	height: 600rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #FFFFFF;
}

.address-section {
	margin-top: 40rpx;
	padding: 20rpx;
	background-color: #F8F9FA;
	border-radius: 8rpx;
}

.address-label {
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 10rpx;
}

.address-value {
	font-size: 28rpx;
	color: #666666;
	word-break: break-all;
	user-select: text;
	-webkit-user-select: text;
}

.copy-button {
	margin-top: 40rpx;
	height: 100rpx;
	background-color: #4080FF;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #FFFFFF;
}

.copy-icon {
	margin-right: 10rpx;
}

.copy-text {
	font-size: 32rpx;
}

.hidden-textarea {
	position: absolute;
	left: -9999px;
	top: -9999px;
	opacity: 0;
	width: 1px;
	height: 1px;
}

/* 字体图标 */
@font-face {
	font-family: "iconfont";
	src: url('data:font/woff2;charset=utf-8;base64,d09GMgABAAAAAAKEAAsAAAAABkQAAAI4AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACCcApcdgE2AiQDCAsGAAQgBYRnBzYbmQXIHpIkBQQKEQEEI4KA8fD/ft/2ufcebERoklk0TTxJNEQoJEKFRoMQCZFs3v/N/H0za8wk6h1NNGky87D58bmXpvhEQyRC0YQQCYl4JUKEePtv2gk0kGx+oFzmWh9wKfEApw1sEmVHJK7cIPaGMW7wAk8T6DWpJO1OTy/BvsJeJYgbN64E+xWHlVKJrhC65tgiXqpOT9ML8CJ+P/6bRfsktQx77eXN0Sj0/YQ8KxHzEhB8IMAWZKwChbhqTV2WCozL9Oo1VwH7Kgd+QpF9FcH+1YusBmhvgD/lST8hP5NSA5CagDzx6/JMnf0p/QQ/Hc63D+9nO+2T/dFwvttv7Vx8nm93Xk8/L/Zvj5/u9N9Pd/qzZ/Wt+fb22UYQvDp4tOLF6tbl9x+m6v77C3q/P+//+PYm+QZk/9WlB4Dp/QEjg0XyRwckz8rXgDcFun3mVyVA8fhbqc8IQP5zVoD8h+8/qQZV5tXrCqpkVUHXYkrQa1L5/H0mVeGYzXSCFbsAQ98nJF1fkPX9UEX8g2rQPzT1Q0KvU6R37DNlEFl6wRxwQvQMNWKqgvIGlX2DXJGKWr5ClBxDR7qQW+YUe8QucY9YzKUURSpHCTnALsF1cByGIYU8QY7QGJQKc5VEyYrXFe0NUwxELHoC5QBOEPIMykgm1YvfQMr8DORUiYW6eK8gkngY9NCkF8pN5lCmI3YvzL2kcS4KRSIpDkUgDmArBNfGYaE0EuTZj0OQQ9AYSCk4PhWJJNWrrOpvr7B/u0EvG2DkZjEjRY4SNbpxhNBo1AAAAA==') format('woff2');
}

.iconfont {
	font-family: "iconfont" !important;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.icon-back:before {
	content: "\e6a5";
}

.icon-copy:before {
	content: "\e6a9";
}
</style> 