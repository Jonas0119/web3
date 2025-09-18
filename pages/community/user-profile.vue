<template>
  <view class="user-profile-page">
    <!-- 顶部导航 -->
    <view class="profile-header">
      <icon-wrapper 
        name="mdi:arrow-left" 
        :size="24" 
        color="#333" 
        @click="goBack"
      />
      <text class="page-title">个人资料</text>
      <view class="placeholder"></view>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-section">
        <view class="user-avatar-container">
          <icon-wrapper 
            :name="getUserAvatar(userProfile.address)" 
            :size="120" 
            :color="getUserColor(userProfile.address)" 
          />
        </view>
        <view class="avatar-actions">
          <icon-wrapper 
            name="mdi:camera" 
            :size="20" 
            color="#666"
            @click="changeAvatar"
          />
        </view>
      </view>
      
      <view class="user-info">
        <text class="username">{{ userProfile.nickname || '未设置昵称' }}</text>
        <text class="user-address">{{ formatAddress(userProfile.address) }}</text>
        <text class="join-time">加入时间：{{ formatDate(userProfile.joinTime) }}</text>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ userStats.posts }}</text>
        <text class="stat-label">帖子</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ userStats.followers }}</text>
        <text class="stat-label">粉丝</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ userStats.following }}</text>
        <text class="stat-label">关注</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ userStats.likes }}</text>
        <text class="stat-label">获赞</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="editProfile">
        <icon-wrapper name="mdi:account-edit" :size="24" color="#4a8eff" />
        <text class="menu-text">编辑资料</text>
        <icon-wrapper name="mdi:chevron-right" :size="20" color="#ccc" />
      </view>
      
      <view class="menu-item" @click="showMyPosts">
        <icon-wrapper name="mdi:file-document-outline" :size="24" color="#4a8eff" />
        <text class="menu-text">我的帖子</text>
        <icon-wrapper name="mdi:chevron-right" :size="20" color="#ccc" />
      </view>
      
      <view class="menu-item" @click="showFollowing">
        <icon-wrapper name="mdi:account-heart" :size="24" color="#4a8eff" />
        <text class="menu-text">我的关注</text>
        <icon-wrapper name="mdi:chevron-right" :size="20" color="#ccc" />
      </view>
      
      <view class="menu-item" @click="showFollowers">
        <icon-wrapper name="mdi:account-group" :size="24" color="#4a8eff" />
        <text class="menu-text">我的粉丝</text>
        <icon-wrapper name="mdi:chevron-right" :size="20" color="#ccc" />
      </view>
      
      <view class="menu-item" @click="showSettings">
        <icon-wrapper name="mdi:cog" :size="24" color="#4a8eff" />
        <text class="menu-text">设置</text>
        <icon-wrapper name="mdi:chevron-right" :size="20" color="#ccc" />
      </view>
    </view>

    <!-- 编辑资料弹窗 -->
    <view v-if="showEditModal" class="modal-overlay" @click="hideEditModal">
      <view class="edit-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑资料</text>
          <icon-wrapper name="mdi:close" :size="24" color="#666" @click="hideEditModal" />
        </view>
        <view class="modal-content">
          <view class="form-group">
            <text class="form-label">昵称</text>
            <input 
              v-model="editForm.nickname" 
              placeholder="请输入昵称" 
              class="form-input"
              maxlength="20"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">个人简介</text>
            <textarea 
              v-model="editForm.bio" 
              placeholder="介绍一下自己..." 
              class="form-textarea"
              maxlength="100"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">社交链接</text>
            <input 
              v-model="editForm.website" 
              placeholder="个人网站或社交媒体" 
              class="form-input"
            />
          </view>
          
          <view class="form-actions">
            <button class="cancel-btn" @click="hideEditModal">取消</button>
            <button class="save-btn" @click="saveProfile">保存</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 我的帖子弹窗 -->
    <view v-if="showPostsModal" class="modal-overlay" @click="hidePostsModal">
      <view class="posts-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">我的帖子</text>
          <icon-wrapper name="mdi:close" :size="24" color="#666" @click="hidePostsModal" />
        </view>
        <scroll-view class="posts-list" scroll-y>
          <view v-for="post in myPosts" :key="post.id" class="post-item">
            <text class="post-content">{{ post.content }}</text>
            <text class="post-time">{{ formatTime(post.timestamp) }}</text>
            <view class="post-stats">
              <text class="stat">{{ post.likes }} 赞</text>
              <text class="stat">{{ post.comments }} 评论</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { IconWrapper } from '@/components/icons'
import communityService from '@/utils/communityService.js'
import { loadWalletFromStorage } from '@/utils/web3Utils.js'

export default {
  components: {
    'icon-wrapper': IconWrapper
  },
  data() {
    return {
      userProfile: {
        address: '',
        nickname: '',
        bio: '',
        website: '',
        joinTime: '',
        avatar: ''
      },
      userStats: {
        posts: 0,
        followers: 0,
        following: 0,
        likes: 0
      },
      showEditModal: false,
      showPostsModal: false,
      myPosts: [],
      editForm: {
        nickname: '',
        bio: '',
        website: ''
      }
    }
  },
  onLoad() {
    this.loadUserProfile()
    this.loadUserStats()
    this.loadMyPosts()
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载用户资料
    loadUserProfile() {
      const currentUser = loadWalletFromStorage()
      if (currentUser) {
        this.userProfile = {
          address: currentUser.address,
          nickname: currentUser.nickname || '',
          bio: currentUser.bio || '',
          website: currentUser.website || '',
          joinTime: currentUser.createdAt || new Date().toISOString(),
          avatar: currentUser.avatar || ''
        }
        
        this.editForm = {
          nickname: this.userProfile.nickname,
          bio: this.userProfile.bio,
          website: this.userProfile.website
        }
      }
    },
    
    // 加载用户统计
    async loadUserStats() {
      try {
        // 这里可以从社区服务获取统计数据
        // 目前使用模拟数据
        this.userStats = {
          posts: 12,
          followers: 156,
          following: 89,
          likes: 234
        }
      } catch (error) {
        console.error('加载用户统计失败:', error)
      }
    },
    
    // 加载我的帖子
    async loadMyPosts() {
      try {
        const result = await communityService.getPosts(1, 50, 'all')
        if (result.success) {
          const currentUser = loadWalletFromStorage()
          this.myPosts = result.data.filter(post => post.author === currentUser.address)
        }
      } catch (error) {
        console.error('加载我的帖子失败:', error)
      }
    },
    
    // 格式化地址
    formatAddress(address) {
      if (!address) return ''
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    },
    
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleDateString()
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const now = new Date()
      const postTime = new Date(timestamp)
      const diff = now - postTime
      
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) {
        return '刚刚'
      } else if (minutes < 60) {
        return `${minutes}分钟前`
      } else if (hours < 24) {
        return `${hours}小时前`
      } else if (days < 7) {
        return `${days}天前`
      } else {
        return postTime.toLocaleDateString()
      }
    },
    
    // 获取用户头像
    getUserAvatar(address) {
      return communityService.getUserAvatar(address)
    },
    
    // 获取用户颜色
    getUserColor(address) {
      return communityService.getAvatarColor(address)
    },
    
    // 更换头像
    changeAvatar() {
      uni.showToast({
        title: '头像功能开发中',
        icon: 'none'
      })
    },
    
    // 编辑资料
    editProfile() {
      this.showEditModal = true
    },
    
    // 隐藏编辑弹窗
    hideEditModal() {
      this.showEditModal = false
    },
    
    // 保存资料
    async saveProfile() {
      if (!this.editForm.nickname.trim()) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'error'
        })
        return
      }
      
      try {
        // 更新用户资料
        const currentUser = loadWalletFromStorage()
        if (currentUser) {
          currentUser.nickname = this.editForm.nickname
          currentUser.bio = this.editForm.bio
          currentUser.website = this.editForm.website
          
          // 保存到本地存储
          uni.setStorageSync('ETH_WALLET_INFO', currentUser)
          
          // 更新显示
          this.userProfile = {
            ...this.userProfile,
            nickname: this.editForm.nickname,
            bio: this.editForm.bio,
            website: this.editForm.website
          }
          
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          this.hideEditModal()
        }
      } catch (error) {
        console.error('保存资料失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'error'
        })
      }
    },
    
    // 显示我的帖子
    showMyPosts() {
      this.showPostsModal = true
    },
    
    // 隐藏帖子弹窗
    hidePostsModal() {
      this.showPostsModal = false
    },
    
    // 显示关注列表
    showFollowing() {
      uni.showToast({
        title: '关注功能开发中',
        icon: 'none'
      })
    },
    
    // 显示粉丝列表
    showFollowers() {
      uni.showToast({
        title: '粉丝功能开发中',
        icon: 'none'
      })
    },
    
    // 显示设置
    showSettings() {
      uni.showToast({
        title: '设置功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style>
.user-profile-page {
  background-color: #f8f8f8;
  min-height: 100vh;
}

/* 顶部导航 */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e5;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.placeholder {
  width: 24rpx;
}

/* 用户信息卡片 */
.user-card {
  background-color: #ffffff;
  margin: 20rpx 30rpx;
  padding: 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.avatar-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  position: relative;
}

.user-avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  border: 4rpx solid #ffffff;
}

.avatar-actions {
  position: absolute;
  bottom: 10rpx;
  right: 50%;
  transform: translateX(50%);
  margin-right: -60rpx;
  width: 50rpx;
  height: 50rpx;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid #f0f0f0;
}

.user-info {
  text-align: center;
}

.username {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.user-address {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.join-time {
  font-size: 24rpx;
  color: #999;
  display: block;
}

/* 统计信息 */
.stats-section {
  display: flex;
  background-color: #ffffff;
  margin: 0 30rpx 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
  display: block;
}

/* 功能菜单 */
.menu-section {
  background-color: #ffffff;
  margin: 0 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.3s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background-color: #f5f5f5;
}

.menu-text {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #333;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-modal,
.posts-modal {
  width: 90%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-content {
  padding: 30rpx;
}

/* 表单样式 */
.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  border: none;
  outline: none;
}

.form-textarea {
  min-height: 120rpx;
  resize: none;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  border: none;
  outline: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.save-btn {
  background-color: #4a8eff;
  color: #ffffff;
}

/* 帖子列表 */
.posts-modal {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.posts-list {
  flex: 1;
  padding: 20rpx;
}

.post-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.post-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 10rpx;
  display: block;
}

.post-time {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 10rpx;
  display: block;
}

.post-stats {
  display: flex;
  gap: 20rpx;
}

.stat {
  font-size: 22rpx;
  color: #666;
}
</style>
