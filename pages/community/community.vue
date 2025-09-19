<template>
  <view class="community-page tab-page">
    <!-- 顶部导航 -->
    <view class="community-header">
      <text class="page-title">社区</text>
      <view class="header-actions">
        <icon-wrapper 
          name="mdi:magnify" 
          :size="30" 
          color="#666" 
          @click="showSearch = true"
        />
        <icon-wrapper 
          name="mdi:plus" 
          :size="30" 
          color="#4a8eff" 
          @click="showCreatePost = true"
        />
      </view>
    </view>

    <!-- 搜索栏 -->
    <view v-if="showSearch" class="search-bar">
      <view class="search-input-wrapper">
        <icon-wrapper name="mdi:magnify" :size="20" color="#999" />
        <input 
          v-model="searchKeyword" 
          placeholder="搜索帖子或用户..." 
          class="search-input"
          @input="handleSearchInput"
          @confirm="handleSearch"
        />
        <icon-wrapper 
          name="mdi:close" 
          :size="20" 
          color="#999" 
          @click="hideSearch"
        />
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view 
        v-for="tab in filterTabs" 
        :key="tab.key"
        :class="['filter-tab', { active: currentFilter === tab.key }]"
        @click="switchFilter(tab.key)"
      >
        <text class="filter-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 帖子列表 -->
    <scroll-view 
      class="posts-container" 
      scroll-y 
      @scrolltolower="loadMorePosts"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="refreshPosts"
    >
      <view v-if="posts.length === 0 && !loading" class="empty-state">
        <icon-wrapper 
          :name="isSearching ? 'mdi:magnify' : 'mdi:forum-outline'" 
          :size="80" 
          :color="isSearching ? '#4a8eff' : '#ccc'" 
        />
        <text class="empty-text">
          {{ isSearching ? '未找到相关帖子' : '暂无帖子' }}
        </text>
        <text class="empty-desc">
          {{ isSearching ? '试试其他关键词' : '快来发布第一条帖子吧！' }}
        </text>
      </view>

      <view v-for="post in posts" :key="post.id" class="post-item">
        <!-- 用户信息 -->
        <view class="post-header">
          <view class="user-info" @click="goToUserProfile(post.author)" @longpress="showUserAddress(post)">
            <view class="avatar-container">
              <icon-wrapper 
                :name="post.authorAvatar" 
                :size="40" 
                :color="post.authorColor" 
              />
            </view>
            <view class="user-details">
              <view class="user-name-row">
                <text class="username">{{ post.authorNickname }}</text>
                <view v-if="post.authorHasNickname" class="nickname-badge">
                  <icon-wrapper name="mdi:check-circle" :size="14" color="#4a8eff" />
                </view>
              </view>
              <text class="post-time">{{ formatTime(post.timestamp) }}</text>
            </view>
          </view>
        </view>

        <!-- 帖子内容 -->
        <view class="post-content">
          <text class="post-text" v-html="highlightSearchKeyword(post.content)"></text>
          <view v-if="post.images && post.images.length > 0" class="post-images">
            <image 
              v-for="(image, index) in post.images" 
              :key="index"
              :src="image" 
              class="post-image"
              mode="aspectFill"
            />
          </view>
        </view>

        <!-- 操作区域 -->
        <view class="post-footer">
          <view class="action-buttons">
            <view class="action-button" @click="toggleLike(post)">
              <icon-wrapper 
                :name="post.isLiked ? 'mdi:heart' : 'mdi:heart-outline'" 
                :size="18" 
                :color="post.isLiked ? '#ff4757' : '#666'"
              />
              <text class="action-text">{{ post.isLiked ? '已赞' : '点赞' }}</text>
              <text class="action-count">{{ post.likeCount }}</text>
            </view>
            <view class="action-button" @click="showComments(post)">
              <icon-wrapper name="mdi:comment-outline" :size="18" color="#666" />
              <text class="action-text">评论</text>
              <text class="action-count">{{ post.comments }}</text>
            </view>
            <view class="action-button" @click="sharePost(post)">
              <icon-wrapper name="mdi:share-outline" :size="18" color="#666" />
              <text class="action-text">分享</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <icon-wrapper name="mdi:loading" :size="24" color="#4a8eff" />
        <text class="loading-text">加载中...</text>
      </view>
    </scroll-view>

    <!-- 发帖弹窗 -->
    <view v-if="showCreatePost" class="modal-overlay" @click="hideCreatePost">
      <view class="create-post-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">发布帖子</text>
          <icon-wrapper name="mdi:close" :size="24" color="#666" @click="hideCreatePost" />
        </view>
        <view class="modal-content">
          <textarea 
            v-model="newPostContent" 
            placeholder="分享你的想法..." 
            class="post-textarea"
            maxlength="500"
          />
          <view class="post-options">
            <view class="char-count">{{ newPostContent.length }}/500</view>
            <view class="post-buttons">
              <button class="cancel-btn" @click="hideCreatePost">取消</button>
              <button 
                class="publish-btn" 
                :disabled="!newPostContent.trim()"
                @click="publishPost"
              >
                发布
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 评论弹窗 -->
    <view v-if="showCommentsModal" class="modal-overlay" @click="hideComments">
      <view class="comments-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">评论</text>
          <icon-wrapper name="mdi:close" :size="24" color="#666" @click="hideComments" />
        </view>
        <scroll-view class="comments-list" scroll-y>
          <view v-for="comment in comments" :key="comment.id" class="comment-item">
            <view class="comment-avatar">
              <icon-wrapper 
                :name="getUserAvatar(comment.author)" 
                :size="32" 
                :color="getUserColor(comment.author)" 
              />
            </view>
            <view class="comment-content">
              <view class="comment-header">
                <text class="comment-author">{{ comment.authorNickname }}</text>
                <text class="comment-time">{{ formatTime(comment.timestamp) }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="comment-input-wrapper">
          <input 
            v-model="newComment" 
            placeholder="写评论..." 
            class="comment-input"
            @confirm="addComment"
          />
          <icon-wrapper 
            name="mdi:send" 
            :size="20" 
            color="#4a8eff"
            @click="addComment"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { IconWrapper } from '@/components/icons'
import communityService from '@/utils/communityService.js'
import { safeNavigateTo } from '@/utils/pageStackDebug.js'

export default {
  components: {
    'icon-wrapper': IconWrapper
  },
  data() {
    return {
      // 帖子数据
      posts: [],
      loading: false,
      refreshing: false,
      currentPage: 1,
      hasMore: true,
      
      // 筛选和搜索
      currentFilter: 'all',
      filterTabs: [
        { key: 'all', label: '全部', icon: 'mdi:view-list' },
        { key: 'following', label: '关注', icon: 'mdi:account-heart' },
        { key: 'hot', label: '热门', icon: 'mdi:fire' }
      ],
      showSearch: false,
      searchKeyword: '',
      isSearching: false,
      
      // 发帖
      showCreatePost: false,
      newPostContent: '',
      
      // 评论
      showCommentsModal: false,
      currentPost: null,
      comments: [],
      newComment: ''
    }
  },
  onLoad() {
    console.log('社区页面加载')
    this.loadPosts()
    // 延迟检查用户昵称设置，避免影响页面加载
    setTimeout(() => {
      this.checkCurrentUserNickname()
    }, 1000)
  },
  onShow() {
    // 页面显示时刷新数据，确保昵称更新
    this.loadPosts(true)
  },
  methods: {
    // 加载帖子列表
    async loadPosts(refresh = false) {
      if (this.loading) return
      
      this.loading = true
      
      try {
        if (refresh) {
          this.currentPage = 1
          this.posts = []
        }
        
        const result = await communityService.getPosts(
          this.currentPage, 
          10, 
          this.currentFilter
        )
        
        if (result.success) {
          if (refresh) {
            this.posts = result.data
          } else {
            this.posts = [...this.posts, ...result.data]
          }
          
          this.hasMore = result.pagination.hasMore
          this.currentPage++
        } else {
          uni.showToast({
            title: result.message || '加载失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('加载帖子失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    
    // 刷新帖子
    async refreshPosts() {
      this.refreshing = true
      await this.loadPosts(true)
    },
    
    // 加载更多帖子
    loadMorePosts() {
      if (this.hasMore && !this.loading && !this.isSearching) {
        this.loadPosts()
      }
    },
    
    // 切换筛选
    switchFilter(filter) {
      if (this.currentFilter === filter) return
      
      this.currentFilter = filter
      this.isSearching = false // 切换筛选时退出搜索状态
      this.loadPosts(true)
    },
    
    // 显示搜索
    showSearchBar() {
      this.showSearch = true
    },
    
    // 隐藏搜索
    hideSearch() {
      this.showSearch = false
      this.searchKeyword = ''
      this.isSearching = false
      this.loadPosts(true)
    },
    
    // 搜索输入处理
    handleSearchInput() {
      // 防抖处理，避免频繁搜索
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        if (this.searchKeyword.trim()) {
          this.handleSearch()
        } else {
          this.isSearching = false
          this.loadPosts(true)
        }
      }, 500)
    },
    
    // 处理搜索
    async handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.isSearching = false
        this.loadPosts(true)
        return
      }
      
      this.loading = true
      this.isSearching = true
      
      try {
        const result = await communityService.searchPosts(
          this.searchKeyword, 
          1, // 搜索时重置为第一页
          10
        )
        
        if (result.success) {
          this.posts = result.data
          this.hasMore = result.pagination.hasMore
          this.currentPage = 1 // 重置分页
          
          console.log('搜索结果:', result.data.length, '条')
        } else {
          uni.showToast({
            title: result.message || '搜索失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('搜索失败:', error)
        uni.showToast({
          title: '搜索失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 显示发帖弹窗
    showCreatePostModal() {
      this.showCreatePost = true
    },
    
    // 隐藏发帖弹窗
    hideCreatePost() {
      this.showCreatePost = false
      this.newPostContent = ''
    },
    
    // 发布帖子
    async publishPost() {
      if (!this.newPostContent.trim()) {
        uni.showToast({
          title: '请输入内容',
          icon: 'error'
        })
        return
      }
      
      try {
        const result = await communityService.createPost(this.newPostContent.trim())
        
        if (result.success) {
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          })
          
          this.hideCreatePost()
          this.loadPosts(true)
        } else {
          uni.showToast({
            title: result.message || '发布失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('发布帖子失败:', error)
        uni.showToast({
          title: '发布失败',
          icon: 'error'
        })
      }
    },
    
    // 切换点赞
    async toggleLike(post) {
      try {
        const result = await communityService.likePost(post.id)
        
        if (result.success) {
          // 更新本地状态
          const postIndex = this.posts.findIndex(p => p.id === post.id)
          if (postIndex !== -1) {
            this.posts[postIndex].isLiked = result.isLiked
            this.posts[postIndex].likeCount = result.isLiked ? 
              this.posts[postIndex].likeCount + 1 : 
              Math.max(0, this.posts[postIndex].likeCount - 1)
          }
        } else {
          uni.showToast({
            title: result.message || '操作失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('点赞失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    },
    
    // 显示评论
    async showComments(post) {
      this.currentPost = post
      this.showCommentsModal = true
      await this.loadComments()
    },
    
    // 隐藏评论
    hideComments() {
      this.showCommentsModal = false
      this.currentPost = null
      this.comments = []
      this.newComment = ''
    },
    
    // 加载评论
    async loadComments() {
      if (!this.currentPost) return
      
      try {
        const result = await communityService.getPostComments(this.currentPost.id)
        
        if (result.success) {
          this.comments = result.data
        }
      } catch (error) {
        console.error('加载评论失败:', error)
      }
    },
    
    // 添加评论
    async addComment() {
      if (!this.newComment.trim() || !this.currentPost) return
      
      try {
        const result = await communityService.addComment(
          this.currentPost.id, 
          this.newComment.trim()
        )
        
        if (result.success) {
          this.comments.push(result.data)
          this.newComment = ''
          
          // 更新帖子评论数
          const postIndex = this.posts.findIndex(p => p.id === this.currentPost.id)
          if (postIndex !== -1) {
            this.posts[postIndex].comments++
          }
          
          uni.showToast({
            title: '评论成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: result.message || '评论失败',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('添加评论失败:', error)
        uni.showToast({
          title: '评论失败',
          icon: 'error'
        })
      }
    },
    
    // 分享帖子
    sharePost(post) {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    },
    
    // 跳转到用户资料 - 使用安全跳转
    goToUserProfile(authorAddress) {
      // 添加触觉反馈
      uni.vibrateShort({
        type: 'light'
      });
      
      // 使用安全的页面跳转
      safeNavigateTo('/pages/community/user-profile')
    },
    
    // 检查当前用户是否设置昵称
    checkCurrentUserNickname() {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const userInfo = communityService.getUserFullInfo(currentUser);
        if (!userInfo.hasNickname) {
          this.showNicknameGuide();
        }
      }
    },
    
    // 显示昵称设置引导
    showNicknameGuide() {
      uni.showModal({
        title: '设置昵称',
        content: '设置一个昵称，让其他用户更容易认识你',
        confirmText: '去设置',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/community/user-profile'
            });
          }
        }
      });
    },
    
    // 获取当前用户
    getCurrentUser() {
      return communityService.getCurrentUser();
    },
    
    // 显示用户地址
    showUserAddress(post) {
      const address = post.authorAddress || post.author;
      uni.showModal({
        title: '用户地址',
        content: address,
        showCancel: false,
        confirmText: '复制地址',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: address,
              success: () => {
                uni.showToast({
                  title: '地址已复制',
                  icon: 'success'
                });
              }
            });
          }
        }
      });
    },
    
    // 获取用户头像
    getUserAvatar(address) {
      return communityService.getUserAvatar(address)
    },
    
    // 获取用户颜色
    getUserColor(address) {
      return communityService.getAvatarColor(address)
    },
    
    // 高亮搜索关键词
    highlightSearchKeyword(text) {
      if (!this.isSearching || !this.searchKeyword.trim()) {
        return text
      }
      
      const keyword = this.searchKeyword.trim()
      const regex = new RegExp(`(${keyword})`, 'gi')
      return text.replace(regex, '<span class="highlight">$1</span>')
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
    }
  }
}
</script>

<style>
.community-page {
  background-color: #f8f8f8;
  min-height: 100vh;
}

/* 顶部导航 */
.community-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e5;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
  letter-spacing: 0.5rpx;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 48rpx; /* 再拉大间距 */
  padding-right: 12rpx; /* 与右侧边缘留白 */
}

.header-actions icon-wrapper {
  padding: 8rpx;
  border-radius: 50%;
  transition: all 0.3s ease;
}

/* 兼容不支持 flex gap 的内核，确保两个icon有间距 */
.header-actions icon-wrapper + icon-wrapper {
  margin-left: 24rpx;
}

.header-actions icon-wrapper:active {
  background-color: #f5f5f5;
  transform: scale(0.9);
}

/* 搜索栏 */
.search-bar {
  padding: 24rpx 30rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e5;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #f8f9fa;
  border-radius: 50rpx;
  border: 1rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  border-color: #4a8eff;
  box-shadow: 0 0 0 3rpx rgba(74, 142, 255, 0.1);
}

.search-input {
  flex: 1;
  margin: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
  font-weight: 400;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  padding: 20rpx 30rpx; /* 与market保持一致 */
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e5;
  gap: 20rpx;
}
/* 兼容不支持 flex gap 的内核（如部分内置浏览器） */
.filter-tab + .filter-tab {
  margin-left: 16rpx;
}

.filter-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background-color: #f5f5f5;
  transition: all 0.2s ease;
}

.filter-tab.active {
  background-color: #4a8eff;
}

.filter-tab:active {
  transform: scale(0.95);
}

.filter-text {
  margin-left: 0;
  font-size: 26rpx; /* 与market一致 */
  color: #666;
  font-weight: 500;
}

.filter-tab.active .filter-text {
  color: #ffffff;
}

/* 帖子容器 */
.posts-container {
  flex: 1;
  padding: 16rpx 0; /* 略微缩小上下留白 */
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  margin: 20rpx 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin: 30rpx 0 20rpx;
  font-weight: 500;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  line-height: 1.5;
}

/* 帖子项 */
.post-item {
  background-color: #ffffff;
  border-radius: 12rpx; /* 卡片四角小圆弧 */
  margin-bottom: 12rpx; /* 两个帖子之间留一个很小的间隔 */
  padding: 24rpx 24rpx; /* 内容更紧凑 */
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #f0f0f0; /* 轻边框提升卡片感 */
  transition: all 0.2s ease;
}

.post-item:active {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.12);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 8rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.user-info:active {
  background-color: #f5f5f5;
  transform: scale(0.98);
}

.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.user-details {
  margin-left: 20rpx;
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.username {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.nickname-badge {
  display: flex;
  align-items: center;
  padding: 2rpx 6rpx;
  background-color: rgba(74, 142, 255, 0.1);
  border-radius: 8rpx;
  border: 1rpx solid rgba(74, 142, 255, 0.2);
}

.post-time {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 6rpx;
  line-height: 1.2;
}

/* 帖子内容 */
.post-content {
  margin-bottom: 24rpx;
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  border: none;
}

.post-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  word-break: break-word;
  font-weight: 400;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.post-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 操作区域 */
.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8rpx; /* 更靠近上方灰线 */
  margin-top: -6rpx; /* 视觉上更贴近分割线 */
  border-top: 1rpx solid #f0f0f0;
}

.action-buttons {
  display: flex;
  width: 100%;
}

.action-button {
  flex: 1; /* 三项等分 */
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: center;
  padding: 6rpx 4rpx; /* 进一步压缩整体高度与宽度 */
  border-radius: 50rpx;
  transition: all 0.2s;
  background-color: transparent;
  cursor: pointer; /* H5 悬停提示可点击 */
}

.action-button:active {
  background-color: #f5f5f5;
  transform: scale(0.95);
}

.action-text {
  margin-left: 6rpx;
  font-size: 20rpx; /* 再小一点 */
  color: #666;
  font-weight: 500;
  line-height: 1; /* 与数字对齐 */
}

.action-count {
  margin-left: 4rpx;
  font-size: 20rpx; /* 与文字一致的小号 */
  color: #4a8eff;
  line-height: 1; /* 与文字对齐 */
}

/* 右侧独立统计已并入按钮内部，移除此块 */

/* 悬停与按下状态，增强可点击感（H5有效） */
.action-button:hover {
  background-color: #f5f7fa;
}
.action-button:active {
  transform: scale(0.98);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.stat-number {
  font-size: 20rpx;
  color: #4a8eff;
  font-weight: 600;
}

/* 加载更多 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  gap: 20rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  margin: 20rpx 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.loading-text {
  font-size: 26rpx;
  color: #4a8eff;
  font-weight: 500;
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

.create-post-modal,
.comments-modal {
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

.post-textarea {
  width: 100%;
  min-height: 200rpx;
  font-size: 28rpx;
  color: #333;
  background-color: #f8f8f8;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx;
  resize: none;
  outline: none;
}

.post-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
}

.char-count {
  font-size: 24rpx;
  color: #999;
}

.post-buttons {
  display: flex;
  gap: 20rpx;
}

.cancel-btn,
.publish-btn {
  padding: 16rpx 32rpx;
  border-radius: 50rpx;
  font-size: 26rpx;
  border: none;
  outline: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.publish-btn {
  background-color: #4a8eff;
  color: #ffffff;
}

.publish-btn:disabled {
  background-color: #ccc;
  color: #999;
}

/* 评论弹窗 */
.comments-modal {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.comments-list {
  flex: 1;
  padding: 20rpx;
}

.comment-item {
  display: flex;
  margin-bottom: 30rpx;
}

.comment-avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  margin-left: 20rpx;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.comment-author {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
  margin-left: 20rpx;
}

.comment-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.comment-input-wrapper {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-top: 1rpx solid #e5e5e5;
  gap: 20rpx;
}

.comment-input {
  flex: 1;
  padding: 16rpx 20rpx;
  background-color: #f8f8f8;
  border-radius: 50rpx;
  font-size: 26rpx;
  color: #333;
  border: none;
  outline: none;
}

/* 搜索高亮样式 */
.highlight {
  background-color: #fff3cd;
  color: #856404;
  padding: 2rpx 4rpx;
  border-radius: 4rpx;
  font-weight: 600;
}
</style>
