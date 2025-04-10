<template>
	<view class="manage-wallet-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-icon" @click="handleBack">
				<icon-wrapper name="mdi:back" :size="44" color="#333333" />
			</view>
			<view class="title">管理账户</view>
			<view class="add-icon" @click="toggleCreateModal">
				<icon-wrapper name="mdi:plus" :size="44" color="#333333" />
			</view>
		</view>
		
		<!-- 钱包列表 -->
		<view class="wallet-list">
			<view class="wallet-item" 
				v-for="(wallet, index) in walletList" 
				:key="index"
				@click="handleSelectWallet(wallet)">
				<!-- 左侧图标区域 -->
				<view class="wallet-left">
					<crypto-icon :symbol="wallet.symbol" :size="80" />
				</view>
				<!-- 右侧内容区域 -->
				<view class="wallet-content">
					<!-- 第一行：账户名称和市值 -->
					<view class="wallet-row">
						<view class="name-wrapper">
							<text class="wallet-name">{{wallet.name}}</text>
							<text class="active-tag" v-if="isActiveWallet(wallet)">当前</text>
						</view>
						<text class="wallet-balance">${{wallet.balance}}</text>
					</view>
					<!-- 第二行：地址和删除按钮 -->
					<view class="wallet-row">
						<text class="wallet-address">{{formatAddress(wallet.address)}}</text>
						<view class="delete-icon" @click.stop="handleDeleteWallet(index)">
							<icon-wrapper name="mdi:delete" :size="28" color="#FF6B6B" />
						</view>
					</view>
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
import { IconWrapper, CryptoIcon } from '../../components/icons'
import {
	loadWalletsFromStorage,
	deleteWallet,
	getEthBalance,
	formatBalance,
	calculateTokenValue,
	saveWalletToStorage,
	formatAddress,
	loadWalletFromStorage
} from '../../utils/web3Utils.js';

export default {
	components: {
		'icon-wrapper': IconWrapper,
		'crypto-icon': CryptoIcon
	},
	data() {
		return {
			isShowCreateModal: false,
			walletList: [],
			currentWallet: null
		}
	},
	methods: {
		// 加载钱包列表
		async loadWallets() {
			const wallets = loadWalletsFromStorage();
			// 获取当前活跃钱包
			this.currentWallet = loadWalletFromStorage();
			
			// 获取每个钱包的最新余额
			for (let wallet of wallets) {
				const balance = await getEthBalance(wallet.address);
				const formattedBalance = formatBalance(balance);
				const value = await calculateTokenValue(formattedBalance);
				wallet.balance = value;
			}
			this.walletList = wallets;
		},
		
		handleBack() {
			uni.navigateBack();
		},
		
		toggleCreateModal() {
			this.isShowCreateModal = true;
		},
		
		hideCreateOptions() {
			this.isShowCreateModal = false;
		},
		
		// 选择钱包
		handleSelectWallet(wallet) {
			// 保存选中的钱包作为当前活跃钱包
			const saveResult = saveWalletToStorage(wallet);
			console.log('新账号为:', wallet.address);
			if (saveResult) {
				uni.showToast({
					title: '切换账号成功',
					icon: 'success',
					duration: 1500,
					success: () => {
						setTimeout(() => {
							// 返回首页
							uni.navigateBack({
								delta: 1
							});
						}, 1500);
					}
				});
			} else {
				uni.showToast({
					title: '切换账号失败',
					icon: 'none'
				});
			}
		},
		
		// 删除钱包时阻止事件冒泡
		async handleDeleteWallet(index) {
			const wallet = this.walletList[index];
			const currentWallet = loadWalletFromStorage();
			
			// 如果只剩一个钱包，不允许删除
			if (this.walletList.length === 1) {
				uni.showToast({
					title: '至少保留一个账户',
					icon: 'none'
				});
				return;
			}
			
			uni.showModal({
				title: '确认删除',
				content: '确定要删除此钱包吗？此操作不可逆，请确保已备份助记词或私钥。',
				success: async (res) => {
					if (res.confirm) {
						if (deleteWallet(wallet.address)) {
							this.walletList.splice(index, 1);
							
							// 如果删除的是当前活跃账户，则将第一个账户设为活跃账户
							if (currentWallet && currentWallet.address === wallet.address) {
								const firstWallet = this.walletList[0];
								if (firstWallet) {
									await saveWalletToStorage(firstWallet);
								}
							}
							
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
						} else {
							uni.showToast({
								title: '删除失败',
								icon: 'none'
							});
						}
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

		formatAddress(address) {
			return formatAddress(address);
		},
		
		handleImportWallet() {
			this.hideCreateOptions();
			uni.navigateTo({
				url: '/pages/wallet/import'
			});
		},
		
		// 判断是否为当前活跃钱包
		isActiveWallet(wallet) {
			return this.currentWallet && wallet.address === this.currentWallet.address;
		}
	},
	onLoad() {
		this.loadWallets();
	},
	onShow() {
		// 每次显示页面时重新加载钱包列表，以更新新创建的钱包
		this.loadWallets();
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
	padding: 24rpx;
	display: flex;
	align-items: stretch;
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

/* 左侧图标区域 */
.wallet-left {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 20rpx;
	z-index: 1;
}

/* 右侧内容区域 */
.wallet-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin-left: 10rpx;
	z-index: 1;
}

/* 行样式 */
.wallet-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
}

/* 账户名称 */
.wallet-name {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
}

/* 账户余额 */
.wallet-balance {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
}

/* 账户地址 */
.wallet-address {
	font-size: 24rpx;
	color: #999;
}

/* 删除图标 */
.delete-icon {
	padding: 4rpx 0 4rpx 20rpx;
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

/* 名称包装器 */
.name-wrapper {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

/* 当前账号标签 */
.active-tag {
	font-size: 22rpx;
	font-weight: bold;
	color: #4080FF;
	background-color: rgba(64, 128, 255, 0.1);
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
}
</style> 