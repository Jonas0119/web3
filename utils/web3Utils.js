import Web3 from 'web3';
import { Wallet } from '@ethersproject/wallet';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import axios from 'axios';

// 配置
const CONFIG = {
    ETH_NODE_URL: 'http://47.95.5.231:8181/api/', // 本地ETH节点地址
    STORAGE_KEY: 'ETH_WALLET_INFO',
    WALLETS_STORAGE_KEY: 'ETH_WALLETS_LIST', // 添加钱包列表存储key
    ETH_PRICE_API: 'https://tsanghi.com/api/fin/crypto/realtime?token=demo&ticker=ETH/USD',
    //COINGECKO_API: 'https://api.coingecko.com/api/v3',
    REFRESH_INTERVAL: 600000, // 5分钟更新一次
    ETH_PRICE_STORAGE_KEY: 'LAST_ETH_PRICE', // ETH价格存储key
    ETH_PRICE_UPDATE_TIME_KEY: 'ETH_PRICE_UPDATE_TIME' // 添加价格更新时间存储key
};

let web3Instance = null;
let lastEthPrice = null; // 添加最后一次成功获取的ETH价格缓存

// 初始化Web3
export const initWeb3 = () => {
    if (!web3Instance) {
        const provider = new Web3.providers.HttpProvider(CONFIG.ETH_NODE_URL);
        web3Instance = new Web3(provider);
    }
    return web3Instance;
};

// 创建新钱包
export const createNewWallet = () => {
    const wallet = Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        createdAt: Date.now()
    };
};

// 从存储加载钱包
export const loadWalletFromStorage = () => {
    try {
        const walletInfo = uni.getStorageSync(CONFIG.STORAGE_KEY);
        return walletInfo || null;
    } catch (error) {
        console.error('加载钱包失败:', error);
        return null;
    }
};

// 从存储加载所有钱包
export const loadWalletsFromStorage = () => {
    try {
        const walletsList = uni.getStorageSync(CONFIG.WALLETS_STORAGE_KEY);
        return walletsList || [];
    } catch (error) {
        console.error('加载钱包列表失败:', error);
        return [];
    }
};

// 保存钱包到存储
export const saveWalletToStorage = (walletInfo) => {
    try {
        if (!walletInfo || !walletInfo.address) {
            console.error('无效的钱包信息');
            return false;
        }
        
        // 保存当前活跃钱包
        uni.setStorageSync(CONFIG.STORAGE_KEY, walletInfo);
        
        // 更新钱包列表
        let walletsList = loadWalletsFromStorage();
        const existingWalletIndex = walletsList.findIndex(w => w.address === walletInfo.address);
        
        if (existingWalletIndex === -1) {
            // 如果是新钱包，添加到列表
            walletsList.push({
                name: walletInfo.name || `ETH账户 ${walletsList.length + 1}`,
                address: walletInfo.address,
                privateKey: walletInfo.privateKey,
                createTime: walletInfo.createTime || Date.now(),
                balance: "0.0000",
                symbol: "eth"
            });
            
            // 保存更新后的钱包列表
            uni.setStorageSync(CONFIG.WALLETS_STORAGE_KEY, walletsList);
            return true;
        } else {
            // 如果钱包已存在，更新信息
            walletsList[existingWalletIndex] = {
                ...walletsList[existingWalletIndex],
                ...walletInfo,
                symbol: "eth"
            };
            
            // 保存更新后的钱包列表
            uni.setStorageSync(CONFIG.WALLETS_STORAGE_KEY, walletsList);
            return true;
        }
    } catch (error) {
        console.error('保存钱包失败:', error);
        return false;
    }
};

// 删除钱包
export const deleteWallet = (address) => {
    try {
        let walletsList = loadWalletsFromStorage();
        const newWalletsList = walletsList.filter(w => w.address !== address);
        uni.setStorageSync(CONFIG.WALLETS_STORAGE_KEY, newWalletsList);
        
        // 如果删除的是当前活跃钱包，清除当前活跃钱包
        const currentWallet = loadWalletFromStorage();
        if (currentWallet && currentWallet.address === address) {
            uni.removeStorageSync(CONFIG.STORAGE_KEY);
        }
        
        return true;
    } catch (error) {
        console.error('删除钱包失败:', error);
        return false;
    }
};

// 获取ETH余额
export const getEthBalance = async (address) => {
    try {
        if (!address) {
            return '0';
        }
        const web3 = initWeb3();
        const balance = await web3.eth.getBalance(address);
        //console.log("getEthBalance:", balance);
        return balance;
    } catch (error) {
        console.error('获取ETH余额失败:', error);
        return '0';
    }
};

// 获取ETH价格
export const getEthPrice = async () => {
    try {
        // 检查是否需要更新价格
        const now = Date.now();
        const lastUpdateTime = uni.getStorageSync(CONFIG.ETH_PRICE_UPDATE_TIME_KEY) || 0;
        const savedPrice = uni.getStorageSync(CONFIG.ETH_PRICE_STORAGE_KEY);
        
        // 如果有缓存价格且未超过更新间隔，直接返回缓存价格
        if (savedPrice && (now - lastUpdateTime) < CONFIG.REFRESH_INTERVAL) {
            //console.log('使用缓存的ETH价格:', savedPrice);
            return savedPrice;
        }
        
        // 请求新价格
        const response = await axios.get(CONFIG.ETH_PRICE_API);
        if (response.data.code === 200 && response.data.data && response.data.data[0]) {
            const currentPrice = response.data.data[0].close;
            console.log("获取新ETH价格时间为:", new Date(now).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
            console.log("获取到新的ETH价格:", currentPrice);
            
            // 更新缓存和时间戳
            uni.setStorageSync(CONFIG.ETH_PRICE_STORAGE_KEY, currentPrice);
            uni.setStorageSync(CONFIG.ETH_PRICE_UPDATE_TIME_KEY, now);
            lastEthPrice = currentPrice;
            
            return currentPrice;
        } else {
            throw new Error('无效的价格数据');
            //console.log("获取ETH价格失败:", new Date(now).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
            //return 1600;
        }
    } catch (error) {
        console.error('获取ETH价格失败:', error);
        
        // 如果内存中有缓存价格，使用缓存
        if (lastEthPrice !== null) {
            console.log('使用内存缓存的ETH价格:', lastEthPrice);
            return lastEthPrice;
        }
        
        // 尝试使用本地存储的价格
        const savedPrice = uni.getStorageSync(CONFIG.ETH_PRICE_STORAGE_KEY);
        if (savedPrice) {
            console.log('使用本地存储的ETH价格:', savedPrice);
            lastEthPrice = savedPrice;
            return savedPrice;
        }
        
        // 如果没有任何缓存价格，获取一次新价格
        try {
            const response = await axios.get(CONFIG.ETH_PRICE_API);
            if (response.data.code === 200 && response.data.data && response.data.data[0]) {
                const currentPrice = response.data.data[0].close;
                console.log("首次获取ETH价格:", currentPrice);
                
                // 保存价格和更新时间
                uni.setStorageSync(CONFIG.ETH_PRICE_STORAGE_KEY, currentPrice);
                uni.setStorageSync(CONFIG.ETH_PRICE_UPDATE_TIME_KEY, Date.now());
                lastEthPrice = currentPrice;
                
                return currentPrice;
            }
        } catch (retryError) {
            console.error('首次获取ETH价格也失败:', retryError);
            return 1600;
        }
        
        // 如果所有尝试都失败，返回默认值
        return 1600;
    }
};

// 获取代币余额
export const getTokenBalance = async (tokenContract, address) => {
    try {
        const web3 = initWeb3();
        const minABI = [
            {
                constant: true,
                inputs: [{ name: "_owner", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "balance", type: "uint256" }],
                type: "function",
            },
        ];
        
        const contract = new web3.eth.Contract(minABI, tokenContract);
        const balance = await contract.methods.balanceOf(address).call();
        return balance;
    } catch (error) {
        console.error('获取代币余额失败:', error);
        return '0';
    }
};

// 格式化余额显示
export const formatBalance = (balance) => {
    try {
        if (!balance) {
            return '0.0000';
        }
        const web3 = initWeb3();
        return parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(4);
    } catch (error) {
        console.error('格式化余额失败:', error);
        return '0.0000';
    }
};

// 计算代币市值（本地链上只有ETH，直接返回余额）
export const calculateTokenValue = async (balance) => {
    try {
        if (!balance) {
            return '0.0000';
        }
        const ethPrice = await getEthPrice();
        //console.log("ethPrice:", ethPrice);
        const value = parseFloat(balance) * parseFloat(ethPrice);
        //console.log("calculateTokenValue:", value);
        return value.toFixed(2);
    } catch (error) {
        console.error('计算余额失败:', error);
        return '0.0000';
    }
};

// 转账ETH
export const transferETH = async (fromAddress, toAddress, amount, privateKey) => {
    try {
        const web3 = initWeb3();
        
        // 验证参数
        if (!fromAddress || !toAddress || !amount || !privateKey) {
            throw new Error('缺少必要参数：发送地址、接收地址、金额或私钥');
        }

        // 验证私钥格式
        if (!privateKey.startsWith('0x')) {
            privateKey = '0x' + privateKey;
        }
        
        // 验证接收地址
        if (!web3.utils.isAddress(toAddress)) {
            throw new Error('无效的接收地址');
        }
        
        console.log('转账参数验证通过，开始获取nonce');
        
        // 获取当前账户的nonce
        const nonce = await web3.eth.getTransactionCount(fromAddress);
        console.log('获取nonce成功:', nonce);
        
        // 获取当前gas价格
        const gasPrice = await web3.eth.getGasPrice();
        console.log('获取gasPrice成功:', gasPrice);
        
        // 预估gas限制
        const gasLimit = 21000; // ETH转账的固定gas消耗
        
        // 构建交易对象
        const txObject = {
            nonce: web3.utils.toHex(nonce),
            to: toAddress,
            value: web3.utils.toHex(web3.utils.toWei(amount.toString(), 'ether')),
            gasLimit: web3.utils.toHex(gasLimit),
            gasPrice: web3.utils.toHex(gasPrice)
        };
        
        console.log('交易对象构建完成:', JSON.stringify(txObject));
        
        // 签名交易
        const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
        console.log('交易签名成功');
        
        // 发送交易
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('交易发送成功，收据:', receipt);
        
        return {
            success: true,
            hash: receipt.transactionHash
        };
    } catch (error) {
        console.error('转账失败，详细错误:', error);
        return {
            success: false,
            error: error.message || '转账失败'
        };
    }
};

// 生成助记词和钱包
export const generateMnemonicAndWallet = async () => {
    try {
        // 生成随机助记词
        const mnemonic = bip39.generateMnemonic(wordlist);
        console.log("mnemonic:", mnemonic);
        const mnemonicArray = mnemonic.split(' ');
        console.log("mnemonicArray:", mnemonicArray);
        
        // 从助记词生成钱包
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const wallet = Wallet.fromMnemonic(mnemonic);
        console.log("wallet:", wallet);
        console.log("wallet.address:", wallet.address);
        console.log("wallet.privateKey:", wallet.privateKey);
        
        return {
            success: true,
            mnemonic: mnemonicArray,
            address: wallet.address,
            privateKey: wallet.privateKey
        };
    } catch (error) {
        console.error('生成助记词和钱包失败:', error);
        return {
            success: false,
            error: error.message || '生成失败'
        };
    }
};

// 格式化地址显示
export const formatAddress = (address) => {
    if (!address) return '';
    if (address.length < 15) return address;
    return `${address.slice(0, 15)}...${address.slice(-5)}`;
}; 