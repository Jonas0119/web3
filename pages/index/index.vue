60.29.255.74:9018<template>
	<view class="wallet-container">		
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="menu-icon">
				<!-- <icon-wrapper :name="getIconName('menu')" :size="44" color="#333333" /> -->
			</view>
			<view class="title">智慧账簿</view>
		</view>
		
		<!-- 钱包卡片区域 -->
		<view class="wallet-section">
			<!-- 钱包卡片 -->
			<view class="wallet-card">
				<view class="wallet-card-header">
					<view class="wallet-name">{{walletName}}</view>
					<view class="wallet-details" @click="handleManageWallet">账户管理 ></view>
				</view>
				
				<view class="wallet-balance">
					<text class="currency-symbol">$</text>
					<text class="balance-amount">{{balanceAmount}}</text>
				</view>
			</view>
			
			<!-- 转账和收款按钮 -->
			<view class="action-buttons">
				<view class="action-button transfer" @click="handleTransfer">
					<icon-wrapper :name="getIconName('send')" :size="32" color="#FFFFFF" />
					<text class="action-text">转账</text>
				</view>
				<view class="action-button receive" @click="handleReceive">
					<icon-wrapper :name="getIconName('receive')" :size="32" color="#FFFFFF" />
					<text class="action-text">收款</text>
				</view>
			</view>
		</view>
		
		<!-- 资产列表头部 -->
		<view class="assets-header">
			<view class="assets-title">资产</view>
			<!-- <view class="add-asset" @click="handleAddAsset">
				<icon-wrapper :name="getIconName('plus')" :size="36" color="#333333" />
			</view> -->
		</view>
		
		<!-- 资产列表 -->
		<view class="assets-list">
			<view class="asset-item" v-for="(asset, index) in assetsList" :key="index">
				<view class="asset-info">
					<crypto-icon :symbol="asset.symbol" :size="80" />
					<view class="asset-details">
						<view class="asset-name">
							{{asset.name}} 
							<text class="asset-trend-icon">{{asset.trendIcon}}</text>
						</view>
						<view class="asset-address">{{formatAddress(asset.address)}}</view>
					</view>
				</view>
				<view class="asset-amount">
					<view class="asset-balance">{{asset.balance}}</view>
					<view class="asset-value">{{asset.value}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import {
	initWeb3,
	createNewWallet,
	loadWalletFromStorage,
	loadWalletsFromStorage,
	saveWalletToStorage,
	getEthBalance,
	formatBalance,
	calculateTokenValue,
	formatAddress
} from '../../utils/web3Utils.js';
import { getIconName } from '../../utils/icons';
import { IconWrapper, CryptoIcon } from '../../components/icons';

export default {
	components: {
		'icon-wrapper': IconWrapper,
		'crypto-icon': CryptoIcon
	},
	data() {
		return {
			walletInfo: null,
			balanceAmount: "0.0000",
			walletName: "",
			assetsList: [
				{
					name: "ETH",
					symbol: "eth",
					trendIcon: "↗",
					address: "",
					balance: "0.0000",
					value: "0.0000"
				}
			],
			refreshInterval: null
		}
	},
	methods: {
		getIconName,
		// 初始化钱包
		async initWallet() {
			try {
				const wallet = loadWalletFromStorage();
				if (!wallet) {
					const newWallet = createNewWallet();
					if (saveWalletToStorage(newWallet)) {
						this.walletInfo = newWallet;
					} else {
						throw new Error('保存钱包失败');
					}
				} else {
					this.walletInfo = wallet;
					const wallets = loadWalletsFromStorage();
					if (wallets.length <= 0) {
						//saveWalletToStorage(wallet);
						console.log("钱包列表为空");
					}
				}
				
				if (this.walletInfo) {
					this.walletName = this.walletInfo.name || '主账户';
					await this.updateBalances();
				}
			} catch (error) {
				console.error('初始化钱包失败:', error);
				uni.showToast({
					title: '初始化钱包失败',
					icon: 'none'
				});
			}
		},

		// 更新所有余额
		async updateBalances() {
			if (!this.walletInfo || !this.walletInfo.address) {
				return;
			}

			try {
				const ethBalance = await getEthBalance(this.walletInfo.address);
				if (ethBalance) {
					const formattedBalance = formatBalance(ethBalance);
					const value = await calculateTokenValue(formattedBalance);
					
					// 更新ETH余额
					this.assetsList[0].balance = formattedBalance;
					this.assetsList[0].value = value;
					this.assetsList[0].address = this.walletInfo.address;
					
					// 更新总余额显示
					this.balanceAmount = value;
				}
			} catch (error) {
				console.error('更新余额失败:', error);
				uni.showToast({
					title: '更新余额失败',
					icon: 'none'
				});
			}
		},

		handleTransfer() {
			uni.navigateTo({
				url: '../transfer/transfer'
			});
		},
		handleReceive() {
			uni.navigateTo({
				url: '../receive/receive'
			});
		},
		handleAddAsset() {
			uni.showToast({
				title: '添加资产功能待实现',
				icon: 'none'
			});
		},
		handleManageWallet() {
			uni.navigateTo({
				url: '../wallet/manage',
				success: () => {
					console.log('跳转到钱包管理页面成功');
				},
				fail: (err) => {
					console.error('跳转到钱包管理页面失败', err);
					uni.showToast({
						title: '跳转失败: ' + err.errMsg,
						icon: 'none',
						duration: 2000
					});
				}
			});
		},
		formatAddress(address) {
			return formatAddress(address);
		}
	},
	onLoad() {
		this.initWallet();
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
		}
		this.refreshInterval = setInterval(() => {
			if (this.walletInfo) {
				this.updateBalances();
			}
		}, 600000);
	},
	onUnload() {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval);
			this.refreshInterval = null;
		}
	},
	onPullDownRefresh() {
		this.updateBalances().then(() => {
			uni.stopPullDownRefresh();
		}).catch(() => {
			uni.stopPullDownRefresh();
		});
	},
	onShow() {
		// 每次显示页面时重新加载钱包列表，以更新新创建的钱包
		this.initWallet();
	}
}
</script>

<style>
/* 基础样式 */
page {
	background-color: #ffffff;
	font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
}

.wallet-container {
	padding-bottom: 30rpx;
}

/* 顶部状态栏 */
.status-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10rpx 20rpx;
	background-color: #ffffff;
	color: #333333;
	font-size: 24rpx;
	height: 50rpx;
}

.signal {
	font-size: 12rpx;
	letter-spacing: -1rpx;
}

.battery {
	display: flex;
	align-items: center;
}

.battery-percent {
	margin-right: 10rpx;
}

.battery-icon {
	width: 44rpx;
	height: 22rpx;
	border: 2rpx solid #333;
	border-radius: 4rpx;
	position: relative;
}

.battery-icon:after {
	content: "";
	position: absolute;
	top: 4rpx;
	left: 4rpx;
	right: 4rpx;
	bottom: 4rpx;
	background-color: #333;
	border-radius: 2rpx;
}

.battery-icon:before {
	content: "";
	position: absolute;
	top: 6rpx;
	right: -6rpx;
	width: 4rpx;
	height: 10rpx;
	background-color: #333;
	border-radius: 0 2rpx 2rpx 0;
}

/* 顶部导航栏 */
.navbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
}

.menu-icon {
	width: 60rpx;
	color: #333;
}

.title {
	font-size: 42rpx;
	font-weight: 600;
	text-align: center;
	flex: 1;
	color: #333;
}

/* 钱包卡片区域 */
.wallet-section {
	position: relative;
	padding-bottom: 40rpx; /* 为按钮留出空间 */
}

/* 钱包卡片 */
.wallet-card {
	margin: 20rpx 30rpx;
	background: linear-gradient(to right, #4a8eff, #6babff);
	border-radius: 30rpx;
	padding: 40rpx 30rpx 60rpx;
	color: #ffffff;
	box-shadow: 0 4rpx 30rpx rgba(74, 142, 255, 0.3);
	position: relative;
	overflow: hidden;
}

.wallet-card:before {
	content: "";
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background-image: 
		radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
	background-size: 10px 10px;
	opacity: 0.5;
}

.wallet-card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	z-index: 2;
}

.wallet-name {
	font-size: 36rpx;
	font-weight: bold;
}

.wallet-details {
	font-size: 28rpx;
	opacity: 0.9;
	cursor: pointer;
}

.wallet-balance {
	margin-top: 60rpx;
	display: flex;
	align-items: baseline;
	position: relative;
	z-index: 2;
}

.currency-symbol {
	font-size: 60rpx;
	margin-right: 10rpx;
}

.balance-amount {
	font-size: 80rpx;
	font-weight: 500;
}

/* 转账和收款按钮 */
.action-buttons {
	display: flex;
	margin: 0 30rpx;
	gap: 20rpx;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 10;
	transform: translateY(50%);
}

.action-button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 90rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
	font-weight: 500;
	gap: 16rpx;
}

.action-button.transfer {
	background-color: #4a90f0;
	color: #ffffff;
}

.action-button.receive {
	background-color: #f0a33e;
	color: #ffffff;
}

/* 资产列表头部 */
.assets-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 60rpx 30rpx 10rpx;
	padding-bottom: 10rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.assets-title {
	font-size: 34rpx;
	font-weight: bold;
	color: #333;
}

.add-asset {
	width: 50rpx;
	height: 50rpx;
	background-color: #ffffff;
	border-radius: 25rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

/* 资产列表 */
.assets-list {
	margin: 0 30rpx;
}

.asset-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}

.asset-info {
	display: flex;
	align-items: center;
}

.asset-details {
	margin-left: 20rpx;
}

.asset-name {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 8rpx;
	display: flex;
	align-items: center;
}

.asset-trend-icon {
	color: #4cd964;
	font-size: 28rpx;
	margin-left: 10rpx;
}

.asset-address {
	font-size: 24rpx;
	color: #999;
}

.asset-amount {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.asset-balance {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 8rpx;
}

.asset-value {
	font-size: 24rpx;
	color: #999;
}
</style> 