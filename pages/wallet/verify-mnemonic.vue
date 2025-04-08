<template>
	<view class="verify-mnemonic-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="back-icon" @click="handleBack">
				<text class="iconfont">&#xe6a5;</text>
			</view>
			<view class="title">验证助记词</view>
			<view class="placeholder"></view>
		</view>
		
		<view class="content-box">
			<!-- 提示文本 -->
			<view class="tips-box">
				<view class="tips-title">确认您的助记词</view>
				<view class="tips-content">
					请按照正确的顺序选择助记词，以确认您已安全备份。
				</view>
			</view>
			
			<!-- 选择结果区域 -->
			<view class="selected-words-box">
				<view class="selected-words">
					<view class="selected-word-item" 
						v-for="(word, index) in selectedWords" 
						:key="'selected-' + index"
						@click="unselectWord(index)">
						<text v-if="word">{{word}}</text>
						<text v-else class="placeholder-text">点击下方选择</text>
					</view>
				</view>
			</view>
			
			<!-- 候选词区域 -->
			<view class="candidate-words-box">
				<view class="candidate-words">
					<view class="candidate-word-item" 
						v-for="(word, index) in candidateWords" 
						:key="'candidate-' + index"
						:class="{ 'selected': selectedIndices.includes(index) }"
						@click="selectWord(word, index)">
						<text>{{word}}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 底部按钮区域 -->
		<view class="button-group">
			<view class="clear-button" @click="clearAll">
				清空
			</view>
			<view class="confirm-button" 
				@click="handleConfirm" 
				:class="{ 'disabled': !isAllSelected || !isOrderCorrect }">
				确认
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			originalMnemonic: [],
			walletInfo: null,
			selectedWords: Array(12).fill(''), // 用户选择的助记词
			selectedIndices: [], // 已选择的候选词索引
			candidateWords: [], // 候选词列表
			verifyIndices: [0, 3, 6, 9] // 需要验证的助记词索引
		}
	},
	computed: {
		isAllSelected() {
			// 检查是否所有需要验证的位置都已选择
			return this.verifyIndices.every(index => this.selectedWords[index] !== '');
		},
		isOrderCorrect() {
			// 检查选择的助记词顺序是否正确
			return this.verifyIndices.every(index => 
				this.selectedWords[index] === this.originalMnemonic[index]
			);
		}
	},
	onLoad() {
		// 监听并接收助记词数据
		uni.$on('mnemonicToVerify', (data) => {
			this.originalMnemonic = data.mnemonic;
			this.walletInfo = data.walletInfo;
			
			// 生成验证用的候选词
			this.generateCandidateWords();
		});
	},
	onUnload() {
		// 页面卸载时移除事件监听
		uni.$off('mnemonicToVerify');
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		generateCandidateWords() {
			// 创建验证用的候选词列表：包含正确的词和一些干扰词
			let candidates = [];
			
			// 添加需要验证的助记词
			this.verifyIndices.forEach(index => {
				candidates.push(this.originalMnemonic[index]);
			});
			
			// 添加一些随机干扰词
			const distractors = [
				'apple', 'book', 'cat', 'dog', 'earth', 
				'fire', 'gold', 'house', 'ice', 'joy', 
				'king', 'leaf', 'moon', 'night', 'ocean', 
				'paper', 'queen', 'river', 'star', 'tree'
			];
			
			// 随机选择干扰词填充到12个候选词
			while (candidates.length < 12) {
				const randomIndex = Math.floor(Math.random() * distractors.length);
				const word = distractors[randomIndex];
				
				// 确保不重复添加
				if (!candidates.includes(word)) {
					candidates.push(word);
				}
			}
			
			// 打乱候选词顺序
			this.candidateWords = this.shuffleArray(candidates);
		},
		shuffleArray(array) {
			// 随机打乱数组顺序
			const newArray = [...array];
			for (let i = newArray.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
			}
			return newArray;
		},
		selectWord(word, candidateIndex) {
			// 如果该候选词已被选中，则返回
			if (this.selectedIndices.includes(candidateIndex)) {
				return;
			}
			
			// 找到第一个空位并填入选中的词
			const emptyIndex = this.verifyIndices.find(index => this.selectedWords[index] === '');
			if (emptyIndex !== undefined) {
				this.selectedWords[emptyIndex] = word;
				this.selectedIndices.push(candidateIndex);
			}
		},
		unselectWord(index) {
			// 只能取消选择验证索引中的词
			if (!this.verifyIndices.includes(index) || this.selectedWords[index] === '') {
				return;
			}
			
			// 查找对应候选词的索引
			const candidateIndex = this.candidateWords.findIndex(word => word === this.selectedWords[index]);
			if (candidateIndex !== -1) {
				const selectedIndex = this.selectedIndices.indexOf(candidateIndex);
				if (selectedIndex !== -1) {
					this.selectedIndices.splice(selectedIndex, 1);
				}
			}
			
			// 清空已选词
			this.selectedWords[index] = '';
		},
		clearAll() {
			// 清空所有已选词
			this.verifyIndices.forEach(index => {
				this.selectedWords[index] = '';
			});
			this.selectedIndices = [];
		},
		handleConfirm() {
			if (!this.isAllSelected) {
				uni.showToast({
					title: '请选择所有助记词',
					icon: 'none'
				});
				return;
			}
			
			if (!this.isOrderCorrect) {
				uni.showToast({
					title: '助记词顺序错误',
					icon: 'none'
				});
				return;
			}
			
			// 验证成功，模拟创建钱包流程
			uni.showLoading({
				title: '创建中...'
			});
			
			// 延迟2秒模拟创建过程
			setTimeout(() => {
				uni.hideLoading();
				
				// 显示成功提示
				uni.showToast({
					title: '钱包创建成功',
					icon: 'success',
					duration: 2000,
					success: () => {
						// 延迟2秒后返回钱包列表页面
						setTimeout(() => {
							uni.navigateBack({
								delta: 3 // 返回到钱包管理页面
							});
						}, 2000);
					}
				});
			}, 2000);
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

.verify-mnemonic-container {
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

/* 已选词区域 */
.selected-words-box {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.selected-words {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
}

.selected-word-item {
	width: 30%;
	height: 90rpx;
	background-color: #f8f8f8;
	border-radius: 8rpx;
	padding: 16rpx 20rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.placeholder-text {
	color: #ccc;
	font-size: 24rpx;
}

/* 候选词区域 */
.candidate-words-box {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.candidate-words {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
}

.candidate-word-item {
	width: 30%;
	height: 90rpx;
	background-color: #f8f8f8;
	border-radius: 8rpx;
	padding: 16rpx 10rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: #333;
	box-sizing: border-box;
}

.candidate-word-item.selected {
	background-color: #e0e0e0;
	color: #999;
}

/* 底部按钮 */
.button-group {
	display: flex;
	margin-top: 20rpx;
}

.clear-button {
	flex: 1;
	background-color: #ffffff;
	color: #4a8eff;
	font-size: 32rpx;
	font-weight: 500;
	text-align: center;
	padding: 25rpx 0;
	border-radius: 12rpx;
	margin-right: 20rpx;
	border: 1px solid #4a8eff;
}

.confirm-button {
	flex: 2;
	background: linear-gradient(to right, #4a8eff, #5c9dff);
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	text-align: center;
	padding: 30rpx 0;
	border-radius: 12rpx;
}

.confirm-button.disabled {
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