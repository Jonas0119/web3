<template>
	<view class="import-wallet-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-icon" @click="handleBack">
				<text class="iconfont">&#xe6a5;</text>
			</view>
			<view class="title">导入账户</view>
			<view class="placeholder"></view>
		</view>
		
		<!-- 导入方式选择 -->
		<view class="import-type-box">
			<view class="import-type-label">选择导入方式</view>
			<view class="import-type-tabs">
				<view class="type-tab" 
					:class="{ 'active': importType === 'mnemonic' }" 
					@click="importType = 'mnemonic'">
					助记词
				</view>
				<view class="type-tab" 
					:class="{ 'active': importType === 'privateKey' }" 
					@click="importType = 'privateKey'">
					私钥
				</view>
			</view>
		</view>
		
		<!-- 导入表单 -->
		<view class="import-form">
			<!-- 助记词导入 -->
			<view v-if="importType === 'mnemonic'">
				<view class="form-item">
					<view class="form-label">输入助记词</view>
					<view class="mnemonic-grid">
						<view v-for="(word, index) in mnemonicWords" 
							:key="index" 
							class="mnemonic-word-item">
							<input 
								class="mnemonic-word-input"
								type="text"
								v-model="mnemonicWords[index]"
								:placeholder="'单词 ' + (index + 1)"
								@input="handleMnemonicInput"
							/>
						</view>
					</view>
					<view class="form-tips">请按顺序输入12个助记词。</view>
				</view>
			</view>
			
			<!-- 私钥导入 -->
			<view v-if="importType === 'privateKey'">
				<view class="form-item">
					<view class="form-label">输入私钥</view>
					<view class="form-input-wrapper">
						<input class="form-input" 
							v-model="privateKeyInput" 
							placeholder="请输入账户私钥" />
					</view>
					<view class="form-tips">通常为64位16进制字符，以0x开头。</view>
				</view>
			</view>
			
			<!-- 通用输入项 -->
			<view class="form-item">
				<view class="form-label">账户名称</view>
				<view class="form-input-wrapper">
					<input class="form-input" 
						v-model="walletName" 
						placeholder="请输入账户名称" />
				</view>
			</view>
		</view>
		
		<!-- 导入按钮 -->
		<view class="import-button" @click="handleImport" :class="{ 'disabled': !isFormValid }">
			立即导入
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			importType: 'mnemonic', // 导入方式：mnemonic, privateKey
			mnemonicWords: new Array(12).fill(''), // 12个助记词数组
			privateKeyInput: '',
			walletName: ''
		}
	},
	computed: {
		mnemonicInput() {
			return this.mnemonicWords.join(' ').toLowerCase();
		},
		isFormValid() {
			// 表单验证
			const baseValid = this.walletName.trim() !== '';
			
			// 根据不同导入方式进行特定验证
			if (this.importType === 'mnemonic') {
				// 验证所有助记词是否都已填写且只包含英文字母
				return baseValid && this.mnemonicWords.every(word => {
					const trimmedWord = word.trim();
					return trimmedWord !== '' && /^[a-zA-Z]+$/.test(trimmedWord);
				});
			} else if (this.importType === 'privateKey') {
				// 简单验证：长度是否正确
				return baseValid && this.privateKeyInput.trim().length >= 64;
			}
			
			return false;
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		handleImport() {
			if (!this.isFormValid) {
				uni.showToast({
					title: '请完成所有必填项',
					icon: 'none'
				});
				return;
			}
			
			// 显示加载提示
			uni.showLoading({
				title: '导入中...'
			});
			
			// 模拟导入钱包过程
			setTimeout(() => {
				uni.hideLoading();
				
				try {
					// 根据不同导入方式处理
					if (this.importType === 'mnemonic') {
						// 处理助记词导入
						this.importByMnemonic();
					} else if (this.importType === 'privateKey') {
						// 处理私钥导入
						this.importByPrivateKey();
					}
				} catch (error) {
					uni.showToast({
						title: '导入失败：' + error.message,
						icon: 'none'
					});
				}
			}, 2000);
		},
		importByMnemonic() {
			// 模拟助记词导入成功
			uni.showToast({
				title: '导入成功',
				icon: 'success',
				duration: 2000,
				success: () => {
					// 2秒后返回钱包管理页面
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 2000);
				}
			});
		},
		importByPrivateKey() {
			// 模拟私钥导入成功
			uni.showToast({
				title: '导入成功',
				icon: 'success',
				duration: 2000,
				success: () => {
					// 2秒后返回钱包管理页面
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 2000);
				}
			});
		},
		handleMnemonicInput() {
			// 清理每个单词的空格
			this.mnemonicWords = this.mnemonicWords.map(word => word.trim());
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

.import-wallet-container {
	padding: 30rpx;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
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

/* 导入方式选择 */
.import-type-box {
	margin-bottom: 30rpx;
}

.import-type-label {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 20rpx;
}

.import-type-tabs {
	display: flex;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.type-tab {
	flex: 1;
	text-align: center;
	padding: 25rpx 0;
	font-size: 28rpx;
	color: #666;
	position: relative;
}

.type-tab.active {
	color: #4a8eff;
	font-weight: 500;
}

.type-tab.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 25%;
	width: 50%;
	height: 4rpx;
	background-color: #4a8eff;
	border-radius: 2rpx;
}

/* 表单样式 */
.import-form {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 16rpx;
}

.form-input-wrapper {
	display: flex;
	align-items: center;
	background-color: #f8f8f8;
	border-radius: 8rpx;
	padding: 10rpx 20rpx;
}

.form-input {
	flex: 1;
	height: 80rpx;
	font-size: 30rpx;
}

.textarea-wrapper {
	background-color: #f8f8f8;
	border-radius: 8rpx;
	padding: 20rpx;
}

.mnemonic-input, .keystore-input {
	width: 100%;
	height: 160rpx;
	font-size: 28rpx;
	line-height: 1.5;
}

.form-tips {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}

/* 导入按钮 */
.import-button {
	background: linear-gradient(to right, #4a8eff, #5c9dff);
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	text-align: center;
	padding: 30rpx 0;
	border-radius: 12rpx;
	margin-top: auto;
}

.import-button.disabled {
	background: linear-gradient(to right, #cccccc, #dddddd);
	color: #ffffff;
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

.mnemonic-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20rpx;
	background-color: #f8f8f8;
	border-radius: 12rpx;
	padding: 20rpx;
}

.mnemonic-word-item {
	background: #FFFFFF;
	border-radius: 8rpx;
	overflow: hidden;
}

.mnemonic-word-input {
	width: 100%;
	height: 80rpx;
	font-size: 28rpx;
	text-align: center;
	background: #FFFFFF;
}

.mnemonic-word-input::placeholder {
	color: #999999;
	font-size: 24rpx;
}
</style> 