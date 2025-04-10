<template>
	<view class="mnemonic-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-icon" @click="handleBack">
				<icon-wrapper name="mdi:back" :size="44" color="#333333" />
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
				<view class="mnemonic-words" @longpress="handleLongPress">
					<view class="word-item" 
						v-for="(word, index) in mnemonicWords" 
						:key="index"
						@click="handleWordClick(word)">
						<text class="word-text" user-select selectable>{{word || '点击下方选择'}}</text>
					</view>
				</view>
				<!-- 隐藏的助记词文本，用于复制 -->
				<textarea 
					class="hidden-textarea" 
					:value="mnemonicWords.join(' ')" 
					ref="hiddenTextarea"/>
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
				<icon-wrapper name="mdi:content-copy" :size="44" color="#FFFFFF" />
				复制助记词
			</view>
			<!-- <view class="next-button" @click="handleVerify">
				下一步
			</view> -->
		</view>
	</view>
</template>

<script>
import { IconWrapper } from '../../components/icons'
import { saveWalletToStorage, loadWalletsFromStorage } from '@/utils/web3Utils.js';

export default {
	components: {
		'icon-wrapper': IconWrapper
	},
	data() {
		return {
			walletInfo: null,
			mnemonicWords: []
		}
	},
	onShow() {
		// 从全局变量获取数据
		const app = getApp();
		if (app.globalData && app.globalData.tempWalletData) {
			const { mnemonic, walletInfo } = app.globalData.tempWalletData;
			if (mnemonic && mnemonic.length > 0) {
				this.mnemonicWords = mnemonic;
			}
			if (walletInfo) {
				this.walletInfo = walletInfo;
			}
			// 使用完后清除临时数据
			app.globalData.tempWalletData = null;
		}
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
		async handleCopy() {
			if (!this.mnemonicWords || this.mnemonicWords.length === 0) {
				uni.showToast({
					title: '助记词无效',
					icon: 'none'
				});
				return;
			}

			if (!this.walletInfo) {
				uni.showToast({
					title: '钱包信息无效',
					icon: 'none'
				});
				return;
			}

			console.log('准备复制助记词和保存钱包信息');
			
			// 1. 先保存钱包信息
			const saveResult = saveWalletToStorage(this.walletInfo);
			if (!saveResult) {
				uni.showToast({
					title: '钱包保存失败',
					icon: 'none'
				});
				return;
			}
			
			// 2. 准备助记词文本
			const mnemonicString = this.mnemonicWords.join(' ');
			
			// 3. 尝试复制
			try {
				// H5环境
				// #ifdef H5
				await this.h5Copy(mnemonicString);
				// #endif

				// APP环境
				// #ifdef APP-PLUS
				await this.appCopy(mnemonicString);
				// #endif

				// 小程序环境
				// #ifdef MP
				await this.mpCopy(mnemonicString);
				// #endif
				
				// 复制成功后的处理
				this.handleCopySuccess();
			} catch (error) {
				console.error('复制失败:', error);
				// 如果常规复制失败，尝试创建临时输入框复制
				await this.fallbackCopy(mnemonicString);
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
					content: '请手动长按以下助记词进行复制：\\n\\n' + text,
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
			// 验证钱包是否保存成功
			const wallets = loadWalletsFromStorage();
			const currentWallet = wallets.find(w => w.address === this.walletInfo.address);
			
			if (!currentWallet) {
				uni.showModal({
					title: '警告',
					content: '钱包信息可能未正确保存，是否继续？',
					success: (res) => {
						if (res.confirm) {
							this.navigateBack();
						}
					}
				});
				return;
			}
			
			uni.showToast({
				title: '助记词已复制，钱包创建成功',
				icon: 'success',
				duration: 2000,
				success: () => {
					setTimeout(() => {
						this.navigateBack();
					}, 2000);
				}
			});
		},
		
		navigateBack() {
			uni.navigateBack({
				delta: 2 // 返回到钱包管理页面
			});
		},
		
		// 长按复制处理
		handleLongPress() {
			const mnemonicString = this.mnemonicWords.join(' ');
			// 使用与handleCopy相同的复制逻辑
			this.handleCopy();
		},
		
		handleWordClick(word) {
			// 点击单个词时也可以复制
			uni.setClipboardData({
				data: word,
				success: () => {
					uni.showToast({
						title: '已复制：' + word,
						icon: 'none'
					});
				}
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
	user-select: text;
	-webkit-user-select: text;
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

.hidden-textarea {
	position: absolute;
	left: -9999px;
	top: -9999px;
	opacity: 0;
	width: 1px;
	height: 1px;
}
</style> 