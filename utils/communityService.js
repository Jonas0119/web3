import { initWeb3, loadWalletFromStorage } from './web3Utils.js'
import communityContract from './communityContract.js'

// 社区服务类 - 免费版本
class CommunityService {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.currentUser = null;
        this.storageKeys = {
            posts: 'COMMUNITY_POSTS',
            users: 'COMMUNITY_USERS',
            likes: 'COMMUNITY_LIKES',
            comments: 'COMMUNITY_COMMENTS',
            follows: 'COMMUNITY_FOLLOWS'
        };
        
        this.init();
    }
    
    // 初始化服务
    async init() {
        try {
            // 初始化Web3 (使用测试网)
            this.web3 = initWeb3();
            
            // 获取当前用户
            this.currentUser = loadWalletFromStorage();
            
            // 初始化示例数据（仅在没有数据时）
            //this.initSampleData();
            
            console.log('社区服务初始化成功');
        } catch (error) {
            console.log('社区服务初始化失败，使用纯本地模式:', error);
        }
    }
    
    // 初始化示例数据
    initSampleData() {
        try {
            const existingPosts = this.getFromStorage(this.storageKeys.posts);
            if (existingPosts.length === 0) {
                const samplePosts = [
                    {
                        id: 'sample_1',
                        author: '0xA294...48CB',
                        content: '今天PCB调整的厉害，市场波动很大，大家怎么看？',
                        images: [],
                        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3分钟前
                        likes: 5,
                        comments: 2,
                        isDeleted: false,
                        createdAt: Date.now() - 3 * 60 * 1000
                    },
                    {
                        id: 'sample_2',
                        author: '0xA294...48CB',
                        content: '测试信息一，这是一个测试帖子',
                        images: [],
                        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4分钟前
                        likes: 3,
                        comments: 1,
                        isDeleted: false,
                        createdAt: Date.now() - 4 * 60 * 1000
                    },
                    {
                        id: 'sample_3',
                        author: '0xB123...5678',
                        content: 'Web3技术分享：如何构建去中心化应用',
                        images: [],
                        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10分钟前
                        likes: 8,
                        comments: 4,
                        isDeleted: false,
                        createdAt: Date.now() - 10 * 60 * 1000
                    },
                    {
                        id: 'sample_4',
                        author: '0xC456...9ABC',
                        content: '区块链投资心得分享，新手必看！',
                        images: [],
                        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分钟前
                        likes: 12,
                        comments: 6,
                        isDeleted: false,
                        createdAt: Date.now() - 30 * 60 * 1000
                    }
                ];
                
                // 初始化示例用户数据
                const sampleUsers = [
                    {
                        address: '0xA294...48CB',
                        nickname: '区块链新手',
                        bio: '刚入门区块链的小白',
                        website: '',
                        joinTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        avatar: 'mdi:account-circle'
                    },
                    {
                        address: '0xB123...5678',
                        nickname: 'Web3开发者',
                        bio: '专注去中心化应用开发',
                        website: 'https://github.com/web3dev',
                        joinTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        avatar: 'mdi:account-tie'
                    },
                    {
                        address: '0xC456...9ABC',
                        nickname: '投资达人',
                        bio: '区块链投资专家，分享投资心得',
                        website: 'https://twitter.com/crypto_investor',
                        joinTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                        avatar: 'mdi:account-supervisor'
                    }
                ];
                
                // 添加调试日志
                console.log('示例用户数据:', sampleUsers);
                
                // 保存示例数据
                uni.setStorageSync(this.storageKeys.posts, samplePosts);
                uni.setStorageSync(this.storageKeys.users, sampleUsers);
                console.log('示例数据初始化完成');
            }
        } catch (error) {
            console.error('初始化示例数据失败:', error);
        }
    }
    
    // 获取当前用户
    getCurrentUser() {
        return this.currentUser ? this.currentUser.address : null;
    }
    
    // 获取用户昵称
    getUserNickname(address) {
        // 直接从钱包存储读取昵称
        const walletInfo = uni.getStorageSync('ETH_WALLET_INFO');
        if (walletInfo && walletInfo.address === address && walletInfo.nickname && walletInfo.nickname.trim()) {
            console.log('显示用户昵称:', walletInfo.nickname);
            return walletInfo.nickname;
        }
        
        // 没有昵称则返回地址缩写
        console.log('显示地址缩写:', this.formatAddress(address));
        return this.formatAddress(address);
    }
    
    // 获取用户完整信息
    getUserFullInfo(address) {
        // 直接从钱包存储获取昵称信息
        const walletInfo = uni.getStorageSync('ETH_WALLET_INFO');
        const hasNickname = walletInfo && walletInfo.address === address && 
                           walletInfo.nickname && walletInfo.nickname.trim();
        
        // 头像和颜色仍从社区存储获取（因为这些是社区功能特有的）
        const users = this.getFromStorage(this.storageKeys.users);
        const user = users.find(u => u.address === address);
        
        return {
            address: address,
            nickname: hasNickname ? walletInfo.nickname : '',
            displayName: this.getUserNickname(address),
            hasNickname: hasNickname,
            avatar: this.getUserAvatar(address),
            color: this.getAvatarColor(address)
        };
    }
    
    // 获取用户头像
    getUserAvatar(address) {
        const users = this.getFromStorage(this.storageKeys.users);
        const user = users.find(u => u.address === address);
        return user ? user.avatar : this.getDefaultAvatar(address);
    }
    
    // 获取默认头像
    getDefaultAvatar(address) {
        // 根据地址生成一致的默认头像
        const avatars = [
            'mdi:account-circle',      // 默认圆形头像
            'mdi:account',             // 默认人形头像
            'mdi:face-man',            // 男性头像
            'mdi:face-woman',          // 女性头像
            'mdi:account-tie',         // 商务头像
            'mdi:account-hard-hat',    // 工人头像
            'mdi:account-supervisor',  // 主管头像
            'mdi:account-tie-hat',     // 帽子头像
            'mdi:account-tie-woman',   // 女性商务头像
            'mdi:account-group'        // 群组头像
        ];
        
        // 根据地址哈希选择头像
        let hash = 0;
        for (let i = 0; i < address.length; i++) {
            hash = ((hash << 5) - hash + address.charCodeAt(i)) & 0xffffffff;
        }
        const index = Math.abs(hash) % avatars.length;
        return avatars[index];
    }
    
    // 获取头像颜色
    getAvatarColor(address) {
        const colors = [
            '#4a8eff',  // 蓝色
            '#ff6b6b',  // 红色
            '#4ecdc4',  // 青色
            '#45b7d1',  // 天蓝色
            '#96ceb4',  // 绿色
            '#feca57',  // 黄色
            '#ff9ff3',  // 粉色
            '#54a0ff',  // 亮蓝色
            '#5f27cd',  // 紫色
            '#00d2d3'   // 青绿色
        ];
        
        // 根据地址哈希选择颜色
        let hash = 0;
        for (let i = 0; i < address.length; i++) {
            hash = ((hash << 5) - hash + address.charCodeAt(i)) & 0xffffffff;
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }
    
    // 格式化地址显示
    formatAddress(address) {
        if (!address) return '匿名用户';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    // 创建帖子
    async createPost(content, images = []) {
        try {
            const author = this.getCurrentUser();
            
            if (!author) {
                throw new Error('请先连接钱包');
            }
            
            // 先保存到本地存储
            const postId = Date.now() + Math.random().toString(36).substr(2, 9);
            const post = {
                id: postId,
                author: author,
                content: content,
                images: images,
                timestamp: new Date().toISOString(),
                likes: 0,
                comments: 0,
                isDeleted: false,
                createdAt: Date.now()
            };
            
            this.saveToStorage(this.storageKeys.posts, post);
            
            // 尝试同步到区块链
            if (communityContract.isContractAvailable()) {
                try {
                    const result = await communityContract.createPost(content);
                    console.log('帖子已同步到区块链:', result.transactionHash);
                    
                    // 更新本地帖子ID为链上ID
                    post.blockchainId = result.postId;
                    post.transactionHash = result.transactionHash;
                    this.updatePostInStorage(post);
                } catch (error) {
                    console.log('链上同步失败，使用本地存储:', error);
                }
            }
            
            return {
                success: true,
                data: post,
                message: '帖子创建成功'
            };
        } catch (error) {
            console.error('创建帖子失败:', error);
            return {
                success: false,
                message: error.message || '创建帖子失败'
            };
        }
    }
    
    // 获取帖子列表
    async getPosts(page = 1, limit = 10, filter = 'all') {
        try {
            const posts = this.getFromStorage(this.storageKeys.posts) || [];
            let filteredPosts = posts.filter(post => !post.isDeleted);
            
            // 应用筛选
            if (filter === 'following') {
                const following = this.getFollowing();
                filteredPosts = filteredPosts.filter(post => following.includes(post.author));
            }
            
            // 按时间排序
            filteredPosts.sort((a, b) => b.createdAt - a.createdAt);
            
            // 分页
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
            
            // 添加用户信息
            const postsWithUserInfo = paginatedPosts.map(post => {
                const userInfo = this.getUserFullInfo(post.author);
                return {
                    ...post,
                    authorNickname: userInfo.displayName,
                    authorAvatar: userInfo.avatar,
                    authorColor: userInfo.color,
                    authorHasNickname: userInfo.hasNickname,
                    authorAddress: userInfo.address,
                    isLiked: this.isPostLiked(post.id),
                    likeCount: this.getPostLikeCount(post.id)
                };
            });
            
            return {
                success: true,
                data: postsWithUserInfo,
                pagination: {
                    page,
                    limit,
                    total: filteredPosts.length,
                    hasMore: endIndex < filteredPosts.length
                }
            };
        } catch (error) {
            console.error('获取帖子列表失败:', error);
            return {
                success: false,
                data: [],
                message: '获取帖子列表失败'
            };
        }
    }
    
    // 点赞帖子
    async likePost(postId) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('请先连接钱包');
            }
            
            const likeKey = `${user}_${postId}`;
            const likes = this.getFromStorage(this.storageKeys.likes) || [];
            
            if (likes.includes(likeKey)) {
                // 取消点赞
                const newLikes = likes.filter(like => like !== likeKey);
                this.saveToStorage(this.storageKeys.likes, newLikes);
                
                // 更新帖子点赞数
                this.updatePostLikes(postId, -1);
                
                return {
                    success: true,
                    message: '已取消点赞',
                    isLiked: false
                };
            } else {
                // 添加点赞
                likes.push(likeKey);
                this.saveToStorage(this.storageKeys.likes, likes);
                
                // 更新帖子点赞数
                this.updatePostLikes(postId, 1);
                
                return {
                    success: true,
                    message: '点赞成功',
                    isLiked: true
                };
            }
        } catch (error) {
            console.error('点赞失败:', error);
            return {
                success: false,
                message: error.message || '点赞失败'
            };
        }
    }
    
    // 添加评论
    async addComment(postId, content) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('请先连接钱包');
            }
            
            const commentId = Date.now() + Math.random().toString(36).substr(2, 9);
            const comment = {
                id: commentId,
                postId: postId,
                author: user,
                content: content,
                timestamp: new Date().toISOString(),
                isDeleted: false,
                createdAt: Date.now()
            };
            
            // 保存评论
            this.saveToStorage(this.storageKeys.comments, comment);
            
            // 更新帖子评论数
            this.updatePostComments(postId, 1);
            
            return {
                success: true,
                data: {
                    ...comment,
                    authorNickname: this.getUserNickname(user)
                },
                message: '评论成功'
            };
        } catch (error) {
            console.error('添加评论失败:', error);
            return {
                success: false,
                message: error.message || '添加评论失败'
            };
        }
    }
    
    // 获取帖子评论
    async getPostComments(postId) {
        try {
            const comments = this.getFromStorage(this.storageKeys.comments) || [];
            const postComments = comments
                .filter(comment => comment.postId === postId && !comment.isDeleted)
                .sort((a, b) => a.createdAt - b.createdAt)
                .map(comment => ({
                    ...comment,
                    authorNickname: this.getUserNickname(comment.author)
                }));
            
            return {
                success: true,
                data: postComments
            };
        } catch (error) {
            console.error('获取评论失败:', error);
            return {
                success: false,
                data: [],
                message: '获取评论失败'
            };
        }
    }
    
    // 关注用户
    async followUser(targetAddress) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('请先连接钱包');
            }
            
            if (user === targetAddress) {
                throw new Error('不能关注自己');
            }
            
            const followKey = `${user}_${targetAddress}`;
            const follows = this.getFromStorage(this.storageKeys.follows) || [];
            
            if (follows.includes(followKey)) {
                // 取消关注
                const newFollows = follows.filter(follow => follow !== followKey);
                this.saveToStorage(this.storageKeys.follows, newFollows);
                
                return {
                    success: true,
                    message: '已取消关注',
                    isFollowing: false
                };
            } else {
                // 添加关注
                follows.push(followKey);
                this.saveToStorage(this.storageKeys.follows, follows);
                
                return {
                    success: true,
                    message: '关注成功',
                    isFollowing: true
                };
            }
        } catch (error) {
            console.error('关注失败:', error);
            return {
                success: false,
                message: error.message || '关注失败'
            };
        }
    }
    
    // 搜索帖子
    async searchPosts(keyword, page = 1, limit = 10) {
        try {
            const posts = this.getFromStorage(this.storageKeys.posts) || [];
            const filteredPosts = posts.filter(post => 
                !post.isDeleted && 
                (post.content.toLowerCase().includes(keyword.toLowerCase()) ||
                 this.getUserNickname(post.author).toLowerCase().includes(keyword.toLowerCase()))
            );
            
            // 按时间排序
            filteredPosts.sort((a, b) => b.createdAt - a.createdAt);
            
            // 分页
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
            
            // 添加用户信息
            const postsWithUserInfo = paginatedPosts.map(post => {
                const userInfo = this.getUserFullInfo(post.author);
                return {
                    ...post,
                    authorNickname: userInfo.displayName,
                    authorAvatar: userInfo.avatar,
                    authorColor: userInfo.color,
                    authorHasNickname: userInfo.hasNickname,
                    authorAddress: userInfo.address,
                    isLiked: this.isPostLiked(post.id),
                    likeCount: this.getPostLikeCount(post.id)
                };
            });
            
            return {
                success: true,
                data: postsWithUserInfo,
                pagination: {
                    page,
                    limit,
                    total: filteredPosts.length,
                    hasMore: endIndex < filteredPosts.length
                }
            };
        } catch (error) {
            console.error('搜索失败:', error);
            return {
                success: false,
                data: [],
                message: '搜索失败'
            };
        }
    }
    
    // 获取关注列表
    getFollowing() {
        const user = this.getCurrentUser();
        if (!user) return [];
        
        const follows = this.getFromStorage(this.storageKeys.follows) || [];
        return follows
            .filter(follow => follow.startsWith(`${user}_`))
            .map(follow => follow.split('_')[1]);
    }
    
    // 检查是否已点赞
    isPostLiked(postId) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        const likeKey = `${user}_${postId}`;
        const likes = this.getFromStorage(this.storageKeys.likes) || [];
        return likes.includes(likeKey);
    }
    
    // 获取帖子点赞数
    getPostLikeCount(postId) {
        const likes = this.getFromStorage(this.storageKeys.likes) || [];
        return likes.filter(like => like.endsWith(`_${postId}`)).length;
    }
    
    // 更新帖子点赞数
    updatePostLikes(postId, delta) {
        const posts = this.getFromStorage(this.storageKeys.posts) || [];
        const postIndex = posts.findIndex(post => post.id === postId);
        
        if (postIndex !== -1) {
            posts[postIndex].likes = Math.max(0, (posts[postIndex].likes || 0) + delta);
            this.saveToStorage(this.storageKeys.posts, posts);
        }
    }
    
    // 更新帖子评论数
    updatePostComments(postId, delta) {
        const posts = this.getFromStorage(this.storageKeys.posts) || [];
        const postIndex = posts.findIndex(post => post.id === postId);
        
        if (postIndex !== -1) {
            posts[postIndex].comments = Math.max(0, (posts[postIndex].comments || 0) + delta);
            this.saveToStorage(this.storageKeys.posts, posts);
        }
    }
    
    // 本地存储方法
    saveToStorage(key, data) {
        try {
            const existing = this.getFromStorage(key) || [];
            if (Array.isArray(data)) {
                // 如果是数组，直接保存
                uni.setStorageSync(key, data);
            } else {
                // 如果是单个对象，添加到数组
                existing.push(data);
                uni.setStorageSync(key, existing);
            }
        } catch (error) {
            console.error('保存到本地存储失败:', error);
        }
    }
    
    getFromStorage(key) {
        try {
            return uni.getStorageSync(key) || [];
        } catch (error) {
            console.error('从本地存储获取失败:', error);
            return [];
        }
    }
    
    // 更新帖子在存储中的信息
    updatePostInStorage(updatedPost) {
        try {
            const posts = this.getFromStorage(this.storageKeys.posts) || [];
            const postIndex = posts.findIndex(post => post.id === updatedPost.id);
            
            if (postIndex !== -1) {
                posts[postIndex] = updatedPost;
                uni.setStorageSync(this.storageKeys.posts, posts);
            }
        } catch (error) {
            console.error('更新帖子存储失败:', error);
        }
    }
    
    // 同步到区块链 (测试网)
    async syncPostToBlockchain(post) {
        // 这里可以添加智能合约同步逻辑
        // 目前使用本地存储，后续可以集成测试网合约
        console.log('同步到区块链:', post);
    }
}

// 创建单例实例
const communityService = new CommunityService();

export default communityService;
