<template>
	<view class="mnemonic-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-icon" @click="handleBack">
				<text class="iconfont">&#xe6a5;</text>
			</view>
			<view class="title">备份助记词</view>
			<view class="placeholder"></view>
		</view>
		
		<view class="content-box">
			<!-- 提示文本 -->
			<view class="tips-box">
				<!-- <view class="tips-title">请记下你的助记词</view> -->
				<view class="tips-content">
					助记词用于恢复账号，请将它准确抄写到纸上，并存放在安全的地方。
				</view>
			</view>
			
			<!-- 助记词展示 -->
			<view class="mnemonic-box">
				<view class="mnemonic-words">
					<view class="word-item" v-for="(word, index) in mnemonicWords" :key="index">
						<text class="word-text">{{word || '点击下方选择'}}</text>
					</view>
				</view>
			</view>
			
			<!-- 警告文本 -->
			<view class="warning-box">
				<view class="warning-icon">⚠️</view>
				<view class="warning-text">
					<text>• 勿将助记词分享给任何人，泄露助记词将导致资产丢失</text>
					<text>• 助记词一旦丢失，资产将无法恢复</text>
					<text>• 请勿通过截屏、网络传输的方式进行备份保存</text>
				</view>
			</view>
		</view>
		
		<!-- 底部按钮区域 -->
		<view class="button-group">
			<view class="copy-button" @click="handleCopy">
				复制助记词
			</view>
			<!-- <view class="next-button" @click="handleVerify">
				下一步
			</view> -->
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			walletInfo: null,
			mnemonicWords: [
				'abandon', 'ability', 'able', 'about', 'above', 'absent',
				'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
			]
		}
	},
	onLoad() {
		// 监听并接收助记词数据
		uni.$on('walletCreated', (data) => {
			if (data.mnemonic) {
				this.mnemonicWords = data.mnemonic;
			}
			this.walletInfo = data.walletInfo;
		});
	},
	onUnload() {
		// 页面卸载时移除事件监听
		uni.$off('walletCreated');
	},
	methods: {
		handleBack() {
			uni.showModal({
				title: '确认返回',
				content: '返回将取消钱包创建，确定要返回吗？',
				success: (res) => {
					if (res.confirm) {
						uni.navigateBack({
							delta: 2 // 返回到管理钱包页面
						});
					}
				}
			});
		},
		handleCopy() {
			const mnemonicString = this.mnemonicWords.join(' ');
			uni.setClipboardData({
				data: mnemonicString,
				success: () => {
					uni.showToast({
						title: '助记词已复制，钱包创建成功',
						icon: 'success',
						duration: 2000,
						success: () => {
							// 延迟2秒后返回钱包列表页面
							setTimeout(() => {
								uni.navigateBack({
									delta: 2 // 返回到钱包管理页面
								});
							}, 2000);
						}
					});
				}
			});
		},
		handleVerify() {
			// 跳转到验证助记词页面
			uni.$emit('mnemonicToVerify', {
				mnemonic: this.mnemonicWords,
				walletInfo: this.walletInfo
			});
			
			uni.navigateTo({
				url: '/pages/wallet/verify-mnemonic'
			});
		}
	}
}
</script>

<style>
/* 基础样式 */
page {
	background-color: #f8f8f8;
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
}

.mnemonic-container {
	padding: 30rpx;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	position: relative;
}

/* 顶部导航栏 */
.navbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	margin-top: 40rpx;
	margin-bottom: 30rpx;
}

.back-icon {
	font-size: 44rpx;
	width: 60rpx;
}

.title {
	font-size: 36rpx;
	font-weight: 500;
	text-align: center;
	flex: 1;
}

.placeholder {
	width: 60rpx;
}

/* 内容区域 */
.content-box {
	flex: 1;
	display: flex;
	flex-direction: column;
}

/* 提示文本 */
.tips-box {
	margin-bottom: 30rpx;
}

.tips-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 20rpx;
	text-align: center;
}

.tips-content {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	text-align: center;
	padding: 0 30rpx;
}

/* 助记词展示 */
.mnemonic-box {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.mnemonic-words {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20rpx;
}

.word-item {
	background-color: #F8F8F8;
	border-radius: 12rpx;
	padding: 30rpx 20rpx;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
}

.word-text {
	font-size: 28rpx;
	color: #999;
}

.word-text:not(:empty) {
	color: #333;
}

/* 警告文本 */
.warning-box {
	background-color: rgba(255, 74, 74, 0.1);
	border-radius: 12rpx;
	padding: 20rpx;
	display: flex;
	align-items: flex-start;
	margin-bottom: 40rpx;
}

.warning-icon {
	font-size: 32rpx;
	margin-right: 16rpx;
}

.warning-text {
	flex: 1;
	font-size: 24rpx;
	color: #ff4a4a;
	line-height: 1.8;
}

.warning-text text {
	display: block;
}

/* 底部按钮 */
.button-group {
	display: flex;
	margin-top: 40rpx;
}

.copy-button {
	flex: 1;
	background: linear-gradient(to right, #4a8eff, #5c9dff);
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	text-align: center;
	padding: 28rpx 0;
	border-radius: 12rpx;
	margin-right: 20rpx;
}

.next-button {
	flex: 1;
	background: linear-gradient(to right, #4a8eff, #5c9dff);
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	text-align: center;
	padding: 30rpx 0;
	border-radius: 12rpx;
}

/* 字体图标 */
@font-face {
	font-family: "iconfont";
	src: url('data:font/woff2;charset=utf-8;base64,d09GMgABAAAAAAOMAAsAAAAAB2AAAANAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDHAqCEIITATYCJAMQCwoABCAFhGcHShtpBsiusCnDvUiRCmozEGFkXuHh37/f7zLzHiJJRDNNs3lshuhEiJooJFIJ2ezdrP/t/LUECqRA4FJBC1QspOmqhJr8Tlp1mD79PZh/uPcMTZaQuZC8/0uu8ebiO/gdXE4biwOP6eJSNzA+tMB7H4xNmrLQF0g8YLyNgVjMw5IA4SZQOoKKK+dAUQGSCqgXiCsMWQUpKllKCjWhtqyN4h0qNfU0vQbemr8f/0FGFEiqGdDQxVmfQehP+KkfXh3+V3QpjgLG08HYRsYCUIgbtZYraJgsQMipf0YsAdSaJH3Cz8Seip/G/z9x0BLz1T88kghRA+quYRSYIH3CkpLwE6FJBc3DQN04sAc8YS3eUJNj0aiqiyHjvWVxlr26MTunwhDSZp1vSI8dT2Kn31PBsfJ57gm5ccjN1WLxGvEqtRaK6Kl8JGc8nZzX8nmXzH/h2bVMzlXnfzIaeGqWfXW1/tVVx8vLTf59DtW7mqXdvj316tW0wz6fW36S9qxZTy2JLU+VL9e8KmG/XBlqzNOnqrC/6hh89OigdXDwEbTnmXJ9tDMvrGh5elYpzVU8aHlwUN21vFfKfPhw/6NDne3Z3+4Pt9u6mW9z06xUt3e8vl8rTF2tztKS7sqmI9WFmYXHLwl7K+v3V1btr6yN2R//l5rC71QIfTZmvl4mOLhWXV9FjPLkS57qFmKUNe+1nxHe+y+5fO5fq/6L3wx5R3+YX0YIYvHQwQNHWHXRPwbfPEzzZT9CvPWP6ByRn1qHzrFLO9nKx8l53Lm4Y6ot7lA+iVBnEoLQpkkSkzohaNKkYr7FvpOoq0+TENrMJwh1RpCE2jNIGr1CpaUvqNUFgrDP+bWWRsLKPGYtQGjSE0I7PiDp0htkHR8YivmBWm9+iHXlF+pt1IQjS3IKcTDSMAuwaCQ3E2tURcNbRjS/t8SokYQcbCIrG6lR3sgT0eaZYnPt3JJPiIrpYSleQzyLGJiObEJwHd3kJjrTbD2myc0oijt5SYCKzWYmBwYyGLIAJjISNyZsGlMttG0lGr/fIkwykgg1LCJTbkqNJm+ILkTWzCzW1k4P4JNQEZ1YFA0YQV9HMGBUm5hAkDpzNrETWnHb9DBV5MrQVNjJK+SBbTPfNAIkQQakQg1akMt1JCsVbpFIm5YxdWxIiSwGAAAA') format('woff2');
}

.iconfont {
	font-family: "iconfont" !important;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
</style> 