<template>
	<view class="manage-wallet-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-icon" @click="handleBack">
				<text class="iconfont">&#xe6a5;</text>
			</view>
			<view class="title">管理账户</view>
			<view class="add-icon" @click="toggleCreateModal">
				<text class="iconfont">+</text>
			</view>
		</view>
		
		<!-- 钱包列表 -->
		<view class="wallet-list">
			<view class="wallet-item" v-for="(wallet, index) in walletList" :key="index">
				<view class="wallet-info">
					<crypto-icon :symbol="wallet.symbol" :size="80" />
					<view class="wallet-details">
						<view class="wallet-name">{{wallet.name}}</view>
						<view class="wallet-address">{{wallet.address}}</view>
					</view>
				</view>
				<view class="wallet-amount">
					<view class="wallet-balance">${{wallet.balance}}</view>
				</view>
				<view class="delete-icon" @click="handleDeleteWallet(index)">
					<text class="iconfont">&#xe6a5;</text>
				</view>
			</view>
		</view>
		
		<!-- 创建钱包弹窗 -->
		<view class="create-wallet-modal" v-if="isShowCreateModal">
			<view class="modal-mask" @click="hideCreateOptions"></view>
			<view class="modal-content">
				<view class="modal-option" @click="handleCreateWallet">
					创建账户
				</view>
				<view class="modal-option" @click="handleImportWallet">
					导入账户
				</view>
				<view class="modal-cancel" @click="hideCreateOptions">
					取消
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isShowCreateModal: false,
			walletList: [
				{
					name: "BSC账户",
					symbol: "bsc",
					address: "0xD484D484D484...1af3",
					balance: "0.0000"
				},
				{
					name: "Piao账户",
					symbol: "piao",
					address: "0xD484D484D484...1af3",
					balance: "0.0000"
				},
				{
					name: "Dimei账户",
					symbol: "dimei",
					address: "0xD484D484D484...1af3",
					balance: "0.0000"
				},
				{
					name: "USDT账户",
					symbol: "usdo",
					address: "0xD484D484D484...1af3",
					balance: "0.0000"
				},
				{
					name: "PinfR账户",
					symbol: "pinfr",
					address: "0xD484D484D484...1af3",
					balance: "0.0000"
				},
				{
					name: "PinfR账户",
					symbol: "pinfr",
					address: "0xD484D484D484...1af3",
					balance: "0.0000"
				}
			]
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		toggleCreateModal() {
			this.isShowCreateModal = true;
		},
		hideCreateOptions() {
			this.isShowCreateModal = false;
		},
		handleDeleteWallet(index) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除此钱包吗？此操作不可逆，请确保已备份助记词或私钥。',
				success: (res) => {
					if (res.confirm) {
						this.walletList.splice(index, 1);
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
					}
				}
			});
		},
		handleCreateWallet() {
			this.hideCreateOptions();
			uni.navigateTo({
				url: '/pages/wallet/create'
			});
		},
		handleImportWallet() {
			this.hideCreateOptions();
			uni.navigateTo({
				url: '/pages/wallet/import'
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

.manage-wallet-container {
	padding: 0;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

/* 顶部导航栏 */
.navbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	margin-top: 40rpx;
	margin-bottom: 20rpx;
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

.add-icon {
	font-size: 44rpx;
	width: 60rpx;
	text-align: right;
}

/* 钱包列表 */
.wallet-list {
	padding: 0 30rpx;
}

.wallet-item {
	background-color: #ffffff;
	margin-bottom: 20rpx;
	border-radius: 16rpx;
	padding: 30rpx;
	display: flex;
	align-items: center;
	position: relative;
	overflow: hidden;
}

.wallet-item::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(74, 142, 255, 0.1), rgba(74, 142, 255, 0.05));
	border-radius: 16rpx;
	z-index: 0;
}

.wallet-item:nth-child(1)::before {
	background: linear-gradient(135deg, rgba(74, 142, 255, 0.2), rgba(74, 142, 255, 0.1));
}

.wallet-item:nth-child(2)::before {
	background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(138, 43, 226, 0.1));
}

.wallet-item:nth-child(3)::before {
	background: linear-gradient(135deg, rgba(0, 150, 200, 0.2), rgba(0, 150, 200, 0.1));
}

.wallet-item:nth-child(4)::before {
	background: linear-gradient(135deg, rgba(38, 161, 123, 0.2), rgba(38, 161, 123, 0.1));
}

.wallet-item:nth-child(5)::before {
	background: linear-gradient(135deg, rgba(255, 80, 0, 0.2), rgba(255, 80, 0, 0.1));
}

.wallet-item:nth-child(6)::before {
	background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1));
}

.wallet-info {
	display: flex;
	align-items: center;
	flex: 1;
	z-index: 1;
}

.wallet-details {
	display: flex;
	flex-direction: column;
	margin-left: 20rpx;
}

.wallet-name {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 6rpx;
}

.wallet-address {
	font-size: 24rpx;
	color: #999;
}

.wallet-amount {
	z-index: 1;
}

.wallet-balance {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
}

.delete-icon {
	margin-left: 30rpx;
	font-size: 44rpx;
	color: #999;
	z-index: 1;
}

/* 创建钱包弹窗 */
.create-wallet-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
}

.modal-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
}

.modal-content {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #FFFFFF;
	border-radius: 24rpx 24rpx 0 0;
	padding: 30rpx;
}

.modal-option {
	height: 110rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #333333;
	border-bottom: 1rpx solid #F5F5F5;
}

.modal-option:active {
	background-color: #F8F8F8;
}

.modal-cancel {
	height: 110rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #999999;
	margin-top: 20rpx;
	border-radius: 12rpx;
	background-color: #F8F8F8;
}

.modal-cancel:active {
	opacity: 0.8;
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