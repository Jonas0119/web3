<template>
	<view class="transfer-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-icon" @click="handleBack">
				<icon-wrapper name="mdi:back" :size="44" color="#333333" />
			</view>
			<view class="title">转账</view>
			<view class="placeholder"></view>
		</view>
		
		<!-- 转账表单 -->
		<view class="transfer-form">
			<!-- 账户信息区域 -->
			<view class="form-item account-info">
				<view class="account-details">
					<view class="account-name">{{currentWallet.name || 'ETH账户'}}</view>
					<view class="account-address">{{currentWallet.address}}</view>
					<view class="account-balance">总余额: ${{currentWallet.balance || '0.00'}}</view>
				</view>
			</view>
			
			<!-- 接收地址 -->
			<view class="form-item">
				<view class="form-label">接收地址</view>
				<view class="form-input-wrapper">
					<input class="form-input" v-model="receiverAddress" placeholder="输入或粘贴地址" />
					<!-- <view class="scan-icon" @click="handleScan">
						<icon-wrapper name="mdi:scan" :size="44" color="#333333" />
					</view> -->
				</view>
			</view>
			
			<!-- 币种选择 -->
			<view class="form-item">
				<view class="form-label">币种</view>
				<view class="form-input-wrapper currency-select">
					<view class="selected-currency">
						<view class="currency-icon" style="background-color: #627eea">
							<text class="currency-symbol-text">E</text>
						</view>
						<text class="currency-name">ETH</text>
					</view>
				</view>
				<view class="currency-balance">余额: {{tokenBalance}} ETH</view>
			</view>
			
			<!-- 转账金额 -->
			<view class="form-item">
				<view class="form-label">金额</view>
				<view class="form-input-wrapper amount-input">
					<input class="form-input" 
						type="number" 
						v-model="transferAmount" 
						placeholder="输入转账金额" />
					<view class="max-button" @click="setMaxAmount">最大</view>
				</view>
				<view class="amount-usd" v-if="transferAmount">≈ ${{usdValue}}</view>
			</view>
		</view>
		
		<!-- 确认按钮 -->
		<view class="confirm-button" @click="handleConfirm">
			确认转账
		</view>
	</view>
</template>

<script>
import { IconWrapper } from '../../components/icons'
import {
	loadWalletFromStorage,
	getEthBalance,
	formatBalance,
	calculateTokenValue,
	transferETH
} from '../../utils/web3Utils.js';

export default {
	components: {
		'icon-wrapper': IconWrapper
	},
	data() {
		return {
			currentWallet: {},
			receiverAddress: "",
			transferAmount: "",
			tokenBalance: "0.0000",
			isTransferring: false,
			usdValue: "0.00"
		}
	},
	watch: {
		async transferAmount(newVal) {
			if (newVal) {
				this.usdValue = await calculateTokenValue(newVal);
			} else {
				this.usdValue = "0.00";
			}
		}
	},
	methods: {
		async loadWalletInfo() {
			const wallet = loadWalletFromStorage();
			if (wallet) {
				// 获取ETH余额
				const balance = await getEthBalance(wallet.address);
				const formattedBalance = formatBalance(balance);
				const value = await calculateTokenValue(formattedBalance);
				
				this.currentWallet = {
					name: wallet.name || 'ETH账户',
					address: wallet.address,
					balance: value,
					privateKey: wallet.privateKey
				};
				this.tokenBalance = formattedBalance;
			}
		},
		
		handleBack() {
			uni.navigateBack();
		},
		
		handleScan() {
			uni.showToast({
				title: '扫码功能待实现',
				icon: 'none'
			});
		},
		
		setMaxAmount() {
			this.transferAmount = this.tokenBalance;
		},
		
		async handleConfirm() {
			if (this.isTransferring) {
				return;
			}
			
			if (!this.receiverAddress) {
				uni.showToast({
					title: '请输入接收地址',
					icon: 'none'
				});
				return;
			}
			
			if (!this.transferAmount || parseFloat(this.transferAmount) <= 0) {
				uni.showToast({
					title: '请输入有效金额',
					icon: 'none'
				});
				return;
			}
			
			// 检查余额是否足够
			if (parseFloat(this.transferAmount) > parseFloat(this.tokenBalance)) {
				uni.showToast({
					title: '余额不足',
					icon: 'none'
				});
				return;
			}
			
			// 展示确认信息
			uni.showModal({
				title: '确认转账',
				content: `将向 ${this.receiverAddress.substring(0, 8)}... 转账 ${this.transferAmount} ETH`,
				success: async (res) => {
					if (res.confirm) {
						this.isTransferring = true;
						uni.showLoading({
							title: '转账中...'
						});
						
						try {
							const result = await transferETH(
								this.currentWallet.address,
								this.receiverAddress,
								this.transferAmount,
								this.currentWallet.privateKey
							);
							
							if (result.success) {
								uni.hideLoading();
								uni.showToast({
									title: '转账成功',
									icon: 'success',
									duration: 2000,
									success: () => {
										setTimeout(() => {
											uni.navigateBack();
										}, 2000);
									}
								});
							} else {
								throw new Error(result.error);
							}
						} catch (error) {
							uni.hideLoading();
							uni.showToast({
								title: error.message || '转账失败',
								icon: 'none',
								duration: 3000
							});
						} finally {
							this.isTransferring = false;
						}
					}
				}
			});
		}
	},
	onLoad() {
		this.loadWalletInfo();
	},
	onShow() {
		this.loadWalletInfo();
	}
}
</script>

<style>
/* 基础样式 */
page {
	background-color: #f8f8f8;
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
}

.transfer-container {
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
.transfer-form {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
}

.form-item {
	margin-bottom: 30rpx;
}

/* 账户信息样式 */
.account-info {
	padding-bottom: 30rpx;
	border-bottom: 1px solid #f0f0f0;
}

.account-details {
	display: flex;
	flex-direction: column;
}

.account-name {
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 8rpx;
}

.account-address {
	font-size: 24rpx;
	color: #999;
	margin-bottom: 8rpx;
}

.account-balance {
	font-size: 28rpx;
	color: #666;
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

.scan-icon {
	color: #666;
	font-size: 40rpx;
	padding: 0 10rpx;
}

.amount-input {
	margin-bottom: 10rpx;
}

.max-button {
	background-color: #e9f0ff;
	color: #4a8eff;
	padding: 6rpx 16rpx;
	border-radius: 6rpx;
	font-size: 24rpx;
}

.amount-usd {
	font-size: 24rpx;
	color: #999;
	text-align: right;
}

/* 币种选择 */
.currency-select {
	justify-content: space-between;
	height: 80rpx;
}

.selected-currency {
	display: flex;
	align-items: center;
}

.currency-icon {
	width: 40rpx;
	height: 40rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #ffffff;
	font-size: 20rpx;
	margin-right: 12rpx;
}

.currency-symbol-text {
	font-weight: bold;
}

.currency-name {
	font-size: 30rpx;
	color: #333;
}

.currency-balance {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
	padding-left: 20rpx;
}

/* 确认按钮 */
.confirm-button {
	background: linear-gradient(to right, #4a8eff, #5c9dff);
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	text-align: center;
	padding: 30rpx 0;
	border-radius: 12rpx;
	margin-top: auto;
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