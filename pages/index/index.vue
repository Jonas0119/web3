<template>
	<view class="wallet-container">		
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="menu-icon">
				<text class="iconfont icon-menu"></text>
			</view>
			<view class="title">Web3钱包</view>
		</view>
		
		<!-- 钱包卡片区域 -->
		<view class="wallet-section">
			<!-- 钱包卡片 -->
			<view class="wallet-card">
				<view class="wallet-card-header">
					<view class="wallet-name">主账户</view>
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
					<view class="action-icon transfer-icon">⟲</view>
					<text class="action-text">转账</text>
				</view>
				<view class="action-button receive" @click="handleReceive">
					<view class="action-icon receive-icon">¥</view>
					<text class="action-text">收款</text>
				</view>
			</view>
		</view>
		
		<!-- 资产列表头部 -->
		<view class="assets-header">
			<view class="assets-title">资产</view>
			<view class="add-asset" @click="handleAddAsset">
				<text class="add-icon">+</text>
			</view>
		</view>
		
		<!-- 资产列表 -->
		<view class="assets-list">
			<view class="asset-item" v-for="(asset, index) in assetsList" :key="index">
				<view class="asset-info">
					<view class="asset-icon">
						<text v-if="asset.symbol === 'bsc'" class="crypto-icon">₿</text>
						<text v-else-if="asset.symbol === 'usdo'" class="crypto-icon usdo-icon">₮</text>
						<text v-else class="crypto-icon">{{asset.symbol.charAt(0).toUpperCase()}}</text>
					</view>
					<view class="asset-details">
						<view class="asset-name">
							{{asset.name}} 
							<text class="asset-trend-icon">{{asset.trendIcon}}</text>
						</view>
						<view class="asset-address">{{asset.address}}</view>
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
export default {
	data() {
		return {
			balanceAmount: "289905",
			assetsList: [
				{
					name: "BSC-1",
					symbol: "bsc",
					trendIcon: "↗",
					address: "0x...1103($0.002081)",
					balance: "0",
					value: "$0"
				},
				{
					name: "Piao",
					symbol: "piao",
					trendIcon: "↗",
					address: "0x...1103($0.002081)",
					balance: "0",
					value: "$0"
				},
				{
					name: "USDO",
					symbol: "usdo",
					trendIcon: "↗",
					address: "0x...1103($0.002081)",
					balance: "0",
					value: "$0"
				},
				{
					name: "Dimei",
					symbol: "dimei",
					trendIcon: "↗",
					address: "0x...1103($0.002081)",
					balance: "0",
					value: "$0"
				},
				{
					name: "Mu",
					symbol: "mu",
					trendIcon: "↗",
					address: "0x...1103($0.002081)",
					balance: "0",
					value: "$0"
				},
				{
					name: "PinfR",
					symbol: "pinfr",
					trendIcon: "↗",
					address: "0x...1103($0.002081)",
					balance: "0",
					value: "$0"
				}
			]
		}
	},
	methods: {
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
		}
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
	font-size: 50rpx;
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
}

.action-button.transfer {
	background-color: #4a90f0;
	color: #ffffff;
}

.action-button.receive {
	background-color: #f0a33e;
	color: #ffffff;
}

.action-icon {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 40rpx;
	height: 40rpx;
	border: 2rpx solid #ffffff;
	border-radius: 50%;
	margin-right: 16rpx;
	font-size: 22rpx;
	line-height: 1;
}

.transfer-icon {
	font-weight: normal;
	transform: scaleX(-1);
}

.receive-icon {
	font-weight: bold;
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
	font-size: 36rpx;
	font-weight: bold;
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

.asset-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #ffffff;
	font-weight: bold;
}

.asset-item:nth-child(1) .asset-icon {
	background-color: #f7931a; /* BSC 比特币金色 */
}

.asset-item:nth-child(2) .asset-icon {
	background-color: #627eea; /* Piao 以太坊蓝色 */
}

.asset-item:nth-child(3) .asset-icon {
	background-color: #26a17b; /* USDO 泰达币绿色 */
}

.asset-item:nth-child(4) .asset-icon {
	background-color: #9b59b6; /* Dimei 紫色 */
}

.asset-item:nth-child(5) .asset-icon {
	background-color: #3498db; /* Mu 蓝色 */
}

.asset-item:nth-child(6) .asset-icon {
	background-color: #e74c3c; /* PinfR 红色 */
}

.crypto-icon {
	font-size: 36rpx;
}

.usdo-icon {
	font-size: 42rpx;
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