import { initWeb3 } from './web3Utils.js'

// 社区智能合约集成 - 测试网版本
class CommunityContract {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.contractAddress = null;
        this.abi = null;
        this.isConnected = false;
        
        this.init();
    }
    
    // 初始化合约
    async init() {
        try {
            this.web3 = initWeb3();
            
            // 测试网合约配置
            this.contractAddress = '0x0000000000000000000000000000000000000000'; // 待部署
            this.abi = this.getContractABI();
            
            if (this.contractAddress !== '0x0000000000000000000000000000000000000000') {
                this.contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
                this.isConnected = true;
                console.log('社区合约连接成功');
            } else {
                console.log('社区合约未部署，使用本地存储模式');
            }
        } catch (error) {
            console.error('社区合约初始化失败:', error);
            this.isConnected = false;
        }
    }
    
    // 获取合约ABI
    getContractABI() {
        return [
            {
                "inputs": [
                    {"internalType": "string", "name": "content", "type": "string"}
                ],
                "name": "createPost",
                "outputs": [
                    {"internalType": "uint256", "name": "", "type": "uint256"}
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "postId", "type": "uint256"}
                ],
                "name": "likePost",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "postId", "type": "uint256"},
                    {"internalType": "string", "name": "content", "type": "string"}
                ],
                "name": "addComment",
                "outputs": [
                    {"internalType": "uint256", "name": "", "type": "uint256"}
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "offset", "type": "uint256"},
                    {"internalType": "uint256", "name": "limit", "type": "uint256"}
                ],
                "name": "getPosts",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "uint256", "name": "id", "type": "uint256"},
                            {"internalType": "address", "name": "author", "type": "address"},
                            {"internalType": "string", "name": "content", "type": "string"},
                            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                            {"internalType": "uint256", "name": "likes", "type": "uint256"},
                            {"internalType": "uint256", "name": "comments", "type": "uint256"}
                        ],
                        "internalType": "struct CommunityContract.Post",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "postId", "type": "uint256"}
                ],
                "name": "getPostComments",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "uint256", "name": "id", "type": "uint256"},
                            {"internalType": "uint256", "name": "postId", "type": "uint256"},
                            {"internalType": "address", "name": "author", "type": "address"},
                            {"internalType": "string", "name": "content", "type": "string"},
                            {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
                        ],
                        "internalType": "struct CommunityContract.Comment",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "string", "name": "nickname", "type": "string"}
                ],
                "name": "registerUser",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "user", "type": "address"}
                ],
                "name": "getUserInfo",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "address", "name": "wallet", "type": "address"},
                            {"internalType": "string", "name": "nickname", "type": "string"},
                            {"internalType": "uint256", "name": "joinTime", "type": "uint256"},
                            {"internalType": "bool", "name": "isActive", "type": "bool"}
                        ],
                        "internalType": "struct CommunityContract.User",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
                    {"indexed": true, "internalType": "address", "name": "author", "type": "address"},
                    {"indexed": false, "internalType": "string", "name": "content", "type": "string"}
                ],
                "name": "PostCreated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "uint256", "name": "commentId", "type": "uint256"},
                    {"indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256"},
                    {"indexed": true, "internalType": "address", "name": "author", "type": "address"}
                ],
                "name": "CommentAdded",
                "type": "event"
            }
        ];
    }
    
    // 检查合约是否可用
    isContractAvailable() {
        return this.isConnected && this.contract;
    }
    
    // 获取当前用户地址
    getCurrentUserAddress() {
        try {
            const accounts = this.web3.eth.accounts;
            return accounts[0] || null;
        } catch (error) {
            console.error('获取用户地址失败:', error);
            return null;
        }
    }
    
    // 创建帖子
    async createPost(content) {
        if (!this.isContractAvailable()) {
            throw new Error('合约未连接');
        }
        
        try {
            const userAddress = this.getCurrentUserAddress();
            if (!userAddress) {
                throw new Error('请先连接钱包');
            }
            
            const result = await this.contract.methods.createPost(content).send({
                from: userAddress,
                gas: 200000
            });
            
            return {
                success: true,
                transactionHash: result.transactionHash,
                postId: result.events.PostCreated.returnValues.postId
            };
        } catch (error) {
            console.error('创建帖子失败:', error);
            throw error;
        }
    }
    
    // 点赞帖子
    async likePost(postId) {
        if (!this.isContractAvailable()) {
            throw new Error('合约未连接');
        }
        
        try {
            const userAddress = this.getCurrentUserAddress();
            if (!userAddress) {
                throw new Error('请先连接钱包');
            }
            
            const result = await this.contract.methods.likePost(postId).send({
                from: userAddress,
                gas: 100000
            });
            
            return {
                success: true,
                transactionHash: result.transactionHash
            };
        } catch (error) {
            console.error('点赞失败:', error);
            throw error;
        }
    }
    
    // 添加评论
    async addComment(postId, content) {
        if (!this.isContractAvailable()) {
            throw new Error('合约未连接');
        }
        
        try {
            const userAddress = this.getCurrentUserAddress();
            if (!userAddress) {
                throw new Error('请先连接钱包');
            }
            
            const result = await this.contract.methods.addComment(postId, content).send({
                from: userAddress,
                gas: 150000
            });
            
            return {
                success: true,
                transactionHash: result.transactionHash,
                commentId: result.events.CommentAdded.returnValues.commentId
            };
        } catch (error) {
            console.error('添加评论失败:', error);
            throw error;
        }
    }
    
    // 获取帖子列表
    async getPosts(offset = 0, limit = 10) {
        if (!this.isContractAvailable()) {
            throw new Error('合约未连接');
        }
        
        try {
            const result = await this.contract.methods.getPosts(offset, limit).call();
            
            // 转换数据格式
            const posts = result.map(post => ({
                id: post.id.toString(),
                author: post.author,
                content: post.content,
                timestamp: new Date(parseInt(post.timestamp) * 1000).toISOString(),
                likes: parseInt(post.likes),
                comments: parseInt(post.comments)
            }));
            
            return {
                success: true,
                data: posts
            };
        } catch (error) {
            console.error('获取帖子列表失败:', error);
            throw error;
        }
    }
    
    // 获取帖子评论
    async getPostComments(postId) {
        if (!this.isContractAvailable()) {
            throw new Error('合约未连接');
        }
        
        try {
            const result = await this.contract.methods.getPostComments(postId).call();
            
            // 转换数据格式
            const comments = result.map(comment => ({
                id: comment.id.toString(),
                postId: comment.postId.toString(),
                author: comment.author,
                content: comment.content,
                timestamp: new Date(parseInt(comment.timestamp) * 1000).toISOString()
            }));
            
            return {
                success: true,
                data: comments
            };
        } catch (error) {
            console.error('获取评论失败:', error);
            throw error;
        }
    }
    
    // 注册用户
    async registerUser(nickname) {
        if (!this.isContractAvailable()) {
            throw new Error('合约未连接');
        }
        
        try {
            const userAddress = this.getCurrentUserAddress();
            if (!userAddress) {
                throw new Error('请先连接钱包');
            }
            
            const result = await this.contract.methods.registerUser(nickname).send({
                from: userAddress,
                gas: 100000
            });
            
            return {
                success: true,
                transactionHash: result.transactionHash
            };
        } catch (error) {
            console.error('注册用户失败:', error);
            throw error;
        }
    }
    
    // 获取用户信息
    async getUserInfo(address) {
        if (!this.isContractAvailable()) {
            throw new Error('合约未连接');
        }
        
        try {
            const result = await this.contract.methods.getUserInfo(address).call();
            
            return {
                success: true,
                data: {
                    wallet: result.wallet,
                    nickname: result.nickname,
                    joinTime: new Date(parseInt(result.joinTime) * 1000).toISOString(),
                    isActive: result.isActive
                }
            };
        } catch (error) {
            console.error('获取用户信息失败:', error);
            throw error;
        }
    }
    
    // 监听事件
    async listenToEvents() {
        if (!this.isContractAvailable()) {
            return;
        }
        
        try {
            // 监听帖子创建事件
            this.contract.events.PostCreated({
                fromBlock: 'latest'
            }, (error, event) => {
                if (error) {
                    console.error('监听帖子创建事件失败:', error);
                } else {
                    console.log('新帖子创建:', event.returnValues);
                    // 这里可以触发UI更新
                }
            });
            
            // 监听评论添加事件
            this.contract.events.CommentAdded({
                fromBlock: 'latest'
            }, (error, event) => {
                if (error) {
                    console.error('监听评论添加事件失败:', error);
                } else {
                    console.log('新评论添加:', event.returnValues);
                    // 这里可以触发UI更新
                }
            });
            
        } catch (error) {
            console.error('监听事件失败:', error);
        }
    }
    
    // 获取网络信息
    async getNetworkInfo() {
        try {
            const networkId = await this.web3.eth.net.getId();
            const isListening = await this.web3.eth.net.isListening();
            
            return {
                networkId: networkId,
                isListening: isListening,
                isTestnet: networkId !== 1 // 1是主网
            };
        } catch (error) {
            console.error('获取网络信息失败:', error);
            return {
                networkId: null,
                isListening: false,
                isTestnet: false
            };
        }
    }
}

// 创建单例实例
const communityContract = new CommunityContract();

export default communityContract;
