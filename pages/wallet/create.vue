<template>
	<view class="create-wallet-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-icon" @click="handleBack">
				<icon-wrapper name="mdi:back" :size="44" color="#333333" />
			</view>
			<view class="title">创建账号</view>
			<view class="placeholder"></view>
		</view>
		
		<!-- 创建钱包表单 -->
		<view class="create-form">
			<!-- 钱包名称 -->
			<view class="form-item">
				<view class="form-label">账号名称</view>
				<view class="form-input-wrapper">
					<input class="form-input" 
						v-model="walletName" 
						placeholder="请输入账号名称" 
						maxlength="20" />
				</view>
			</view>
		</view>
		
		<!-- 创建按钮 -->
		<view class="create-button" @click="handleCreate" :class="{ 'disabled': !isFormValid }">
			开始创建
		</view>
	</view>
</template>

<script>
import { IconWrapper } from '../../components/icons'
import { generateMnemonicAndWallet } from '@/utils/web3Utils.js';

export default {
	components: {
		'icon-wrapper': IconWrapper
	},
	data() {
		return {
			walletName: '',
		}
	},
	computed: {
		isFormValid() {
			return this.walletName.trim() !== '';
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		async handleCreate() {
			if (!this.isFormValid) {
				if (this.walletName.trim() === '') {
					uni.showToast({
						title: '请输入账号名称',
						icon: 'none'
					});
					return;
				}
				return;
			}
			
			// 显示加载中
			uni.showLoading({
				title: '创建中...'
			});
			
			try {
				// 生成助记词和钱包
				const result = await generateMnemonicAndWallet();
				
				if (!result.success) {
					throw new Error(result.error || '创建失败');
				}
				
				const walletInfo = {
					name: this.walletName,
					address: result.address,
					privateKey: result.privateKey,
					createTime: new Date().getTime()
				};
				
				// 将数据存储到全局变量
				getApp().globalData = getApp().globalData || {};
				getApp().globalData.tempWalletData = {
					mnemonic: result.mnemonic,
					walletInfo: walletInfo
				};
				
				// 跳转到助记词页面
				uni.navigateTo({
					url: '/pages/wallet/mnemonic'
				});
			} catch (error) {
				uni.showToast({
					title: error.message || '创建失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
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

.create-wallet-container {
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

/* 表单样式 */
.create-form {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
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

/* 密码提示 */
.password-tips {
	font-size: 24rpx;
	color: #999;
	line-height: 1.6;
	padding: 20rpx 0;
}

.password-tips text {
	display: block;
	margin-bottom: 10rpx;
}

/* 创建按钮 */
.create-button {
	background: linear-gradient(to right, #4a8eff, #5c9dff);
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	text-align: center;
	padding: 30rpx 0;
	border-radius: 12rpx;
	margin-top: auto;
}

.create-button.disabled {
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
</style> 