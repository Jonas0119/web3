import Web3 from 'web3';
import { Wallet } from '@ethersproject/wallet';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import axios from 'axios';

// 配置
const CONFIG = {
    ETH_NODE_URL: 'http://47.95.5.231:8181/api/', // 本地ETH节点地址
    STORAGE_KEY: 'ETH_WALLET_INFO',
    WALLETS_STORAGE_KEY: 'ETH_WALLETS_LIST', // 钱包列表存储key
    // 升级的ETH价格API - 支持多个备用源确保可靠性
    ETH_PRICE_API: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', // 主API
    ETH_PRICE_API_BACKUP: 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', // 备用API 1
    ETH_PRICE_API_BACKUP2: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD', // 备用API 2
    ETH_PRICE_API_BACKUP3: 'https://api.coinbase.com/v2/exchange-rates?currency=ETH', // 备用API 3
    REFRESH_INTERVAL: 300000, // 5分钟更新一次，提高实时性
    ETH_PRICE_STORAGE_KEY: 'LAST_ETH_PRICE',
    ETH_PRICE_UPDATE_TIME_KEY: 'ETH_PRICE_UPDATE_TIME'
};

let web3Instance = null;
let lastEthPrice = null;

// 初始化Web3
export const initWeb3 = () => {
    if (!web3Instance) {
        const provider = new Web3.providers.HttpProvider(CONFIG.ETH_NODE_URL);
        web3Instance = new Web3(provider);
    }
    return web3Instance;
};

// 升级的ETH价格获取API
export const getEthPrice = async () => {
    try {
        const now = Date.now();
        
        // 检查缓存是否有效
        const lastUpdateTime = uni.getStorageSync(CONFIG.ETH_PRICE_UPDATE_TIME_KEY);
        const cachedPrice = uni.getStorageSync(CONFIG.ETH_PRICE_STORAGE_KEY);
        
        if (lastUpdateTime && cachedPrice && (now - lastUpdateTime) < CONFIG.REFRESH_INTERVAL) {
            console.log('使用缓存的ETH价格:', cachedPrice);
            lastEthPrice = cachedPrice;
            return cachedPrice;
        }
        
        console.log('开始获取新的ETH价格...');
        
        // 升级的API配置 - 更可靠的价格源
        const apis = [
            {
                name: 'coingecko',
                url: CONFIG.ETH_PRICE_API,
                parser: (data) => {
                    if (data.ethereum && data.ethereum.usd) {
                        return data.ethereum.usd;
                    }
                    throw new Error('CoinGecko API: 无效的价格数据');
                }
            },
            {
                name: 'binance',
                url: CONFIG.ETH_PRICE_API_BACKUP,
                parser: (data) => {
                    if (data.price) {
                        return parseFloat(data.price);
                    }
                    throw new Error('Binance API: 无效的价格数据');
                }
            },
            {
                name: 'cryptocompare',
                url: CONFIG.ETH_PRICE_API_BACKUP2,
                parser: (data) => {
                    if (data.USD) {
                        return data.USD;
                    }
                    throw new Error('CryptoCompare API: 无效的价格数据');
                }
            },
            {
                name: 'coinbase',
                url: CONFIG.ETH_PRICE_API_BACKUP3,
                parser: (data) => {
                    if (data.data && data.data.rates && data.data.rates.USD) {
                        return parseFloat(data.data.rates.USD);
                    }
                    throw new Error('Coinbase API: 无效的价格数据');
                }
            }
        ];
        
        let currentPrice = null;
        let lastError = null;
        
        // 依次尝试每个API（改为顺序请求以避免并发问题）
        for (let i = 0; i < apis.length; i++) {
            try {
                console.log(`尝试 ${apis[i].name} API...`);
                const response = await axios.get(apis[i].url, {
                    timeout: 8000, // 8秒超时
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Web3App/1.0)',
                        'Accept': 'application/json'
                    }
                });
                
                currentPrice = apis[i].parser(response.data);
                console.log(`${apis[i].name} API 获取成功，ETH价格:`, currentPrice);
                break;
                
            } catch (error) {
                lastError = error;
                console.warn(`${apis[i].name} API 失败:`, error.message);
                
                // 如果是网络错误，等待一下再尝试下一个
                if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                continue;
            }
        }
        
        if (currentPrice && currentPrice > 0) {
            // 更新缓存和时间戳
            uni.setStorageSync(CONFIG.ETH_PRICE_STORAGE_KEY, currentPrice);
            uni.setStorageSync(CONFIG.ETH_PRICE_UPDATE_TIME_KEY, now);
            lastEthPrice = currentPrice;
            
            console.log("获取新ETH价格成功:", currentPrice);
            return currentPrice;
        } else {
            throw lastError || new Error('所有API都失败了');
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
        
        // 如果都没有，返回默认价格
        console.log('使用默认ETH价格: 2400');
        return 2400; // 更新默认价格到当前市场水平
    }
};

// 创建新钱包
export const createWallet = async (walletName) => {
    try {
        const mnemonic = bip39.generateMnemonic(wordlist);
        const wallet = Wallet.fromMnemonic(mnemonic);
        
        const walletInfo = {
            name: walletName,
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: mnemonic,
            balance: '0',
            balanceUSD: '0.00',
            createdAt: new Date().toISOString()
        };
        
        return walletInfo;
    } catch (error) {
        console.error('创建钱包失败:', error);
        throw error;
    }
};

// 从助记词导入钱包
export const importWalletFromMnemonic = async (mnemonic, walletName) => {
    try {
        if (!bip39.validateMnemonic(mnemonic, wordlist)) {
            throw new Error('无效的助记词');
        }
        
        const wallet = Wallet.fromMnemonic(mnemonic);
        
        const walletInfo = {
            name: walletName,
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: mnemonic,
            balance: '0',
            balanceUSD: '0.00',
            createdAt: new Date().toISOString()
        };
        
        return walletInfo;
    } catch (error) {
        console.error('从助记词导入钱包失败:', error);
        throw error;
    }
};

// 从私钥导入钱包
export const importWalletFromPrivateKey = async (privateKey, walletName) => {
    try {
        const wallet = new Wallet(privateKey);
        
        const walletInfo = {
            name: walletName,
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: '', // 私钥导入没有助记词
            balance: '0',
            balanceUSD: '0.00',
            createdAt: new Date().toISOString()
        };
        
        return walletInfo;
    } catch (error) {
        console.error('从私钥导入钱包失败:', error);
        throw error;
    }
};

// 获取钱包余额
export const getWalletBalance = async (address) => {
    try {
        const web3 = initWeb3();
        const balance = await web3.eth.getBalance(address);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        return balanceInEth;
    } catch (error) {
        console.error('获取钱包余额失败:', error);
        return '0';
    }
};

// 获取ETH余额 (别名函数，为了兼容)
export const getEthBalance = getWalletBalance;

// 获取钱包余额（美元）
export const getWalletBalanceUSD = async (address) => {
    try {
        const balance = await getWalletBalance(address);
        const ethPrice = await getEthPrice();
        const balanceUSD = (parseFloat(balance) * ethPrice).toFixed(2);
        return balanceUSD;
    } catch (error) {
        console.error('获取钱包余额USD失败:', error);
        return '0.00';
    }
};

// 发送ETH
export const sendEth = async (fromPrivateKey, toAddress, amount) => {
    try {
        const web3 = initWeb3();
        const wallet = new Wallet(fromPrivateKey);
        
        // 获取nonce
        const nonce = await web3.eth.getTransactionCount(wallet.address);
        
        // 获取gas价格
        const gasPrice = await web3.eth.getGasPrice();
        
        // 构建交易
        const transaction = {
            from: wallet.address,
            to: toAddress,
            value: web3.utils.toWei(amount, 'ether'),
            gas: 21000,
            gasPrice: gasPrice,
            nonce: nonce
        };
        
        // 签名交易
        const signedTransaction = await wallet.signTransaction(transaction);
        
        // 发送交易
        const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        
        return receipt;
    } catch (error) {
        console.error('发送ETH失败:', error);
        throw error;
    }
};

// 保存钱包信息
export const saveWalletInfo = (walletInfo) => {
    try {
        uni.setStorageSync(CONFIG.STORAGE_KEY, walletInfo);
        console.log('钱包信息已保存');
    } catch (error) {
        console.error('保存钱包信息失败:', error);
    }
};

// 加载钱包信息
export const loadWalletFromStorage = () => {
    try {
        const walletInfo = uni.getStorageSync(CONFIG.STORAGE_KEY);
        return walletInfo || null;
    } catch (error) {
        console.error('加载钱包信息失败:', error);
        return null;
    }
};

// 保存钱包列表
export const saveWalletsList = (walletsList) => {
    try {
        uni.setStorageSync(CONFIG.WALLETS_STORAGE_KEY, walletsList);
        console.log('钱包列表已保存');
    } catch (error) {
        console.error('保存钱包列表失败:', error);
    }
};

// 加载钱包列表
export const loadWalletsList = () => {
    try {
        const walletsList = uni.getStorageSync(CONFIG.WALLETS_STORAGE_KEY);
        return walletsList || [];
    } catch (error) {
        console.error('加载钱包列表失败:', error);
        return [];
    }
};

// 删除钱包
export const deleteWallet = (walletAddress) => {
    try {
        const walletsList = loadWalletsList();
        const updatedList = walletsList.filter(wallet => wallet.address !== walletAddress);
        saveWalletsList(updatedList);
        
        // 如果删除的是当前钱包，清空当前钱包信息
        const currentWallet = loadWalletFromStorage();
        if (currentWallet && currentWallet.address === walletAddress) {
            uni.removeStorageSync(CONFIG.STORAGE_KEY);
        }
        
        console.log('钱包已删除');
        return true;
    } catch (error) {
        console.error('删除钱包失败:', error);
        return false;
    }
};

// 切换钱包
export const switchWallet = (walletAddress) => {
    try {
        const walletsList = loadWalletsList();
        const targetWallet = walletsList.find(wallet => wallet.address === walletAddress);
        
        if (targetWallet) {
            saveWalletInfo(targetWallet);
            console.log('钱包已切换');
            return true;
        } else {
            console.error('未找到目标钱包');
            return false;
        }
    } catch (error) {
        console.error('切换钱包失败:', error);
        return false;
    }
};

// 更新钱包余额
export const updateWalletBalance = async (walletAddress) => {
    try {
        const balance = await getWalletBalance(walletAddress);
        const balanceUSD = await getWalletBalanceUSD(walletAddress);
        
        // 更新钱包列表中的余额
        const walletsList = loadWalletsList();
        const walletIndex = walletsList.findIndex(wallet => wallet.address === walletAddress);
        
        if (walletIndex !== -1) {
            walletsList[walletIndex].balance = balance;
            walletsList[walletIndex].balanceUSD = balanceUSD;
            saveWalletsList(walletsList);
        }
        
        // 如果是当前钱包，更新当前钱包信息
        const currentWallet = loadWalletFromStorage();
        if (currentWallet && currentWallet.address === walletAddress) {
            currentWallet.balance = balance;
            currentWallet.balanceUSD = balanceUSD;
            saveWalletInfo(currentWallet);
        }
        
        return { balance, balanceUSD };
    } catch (error) {
        console.error('更新钱包余额失败:', error);
        return { balance: '0', balanceUSD: '0.00' };
    }
};

// 验证以太坊地址
export const isValidEthAddress = (address) => {
    try {
        const web3 = initWeb3();
        return web3.utils.isAddress(address);
    } catch (error) {
        console.error('验证地址失败:', error);
        return false;
    }
};

// 格式化地址显示
export const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 复制到剪贴板
export const copyToClipboard = (text) => {
    try {
        uni.setClipboardData({
            data: text,
            success: () => {
                uni.showToast({
                    title: '已复制到剪贴板',
                    icon: 'success'
                });
            },
            fail: () => {
                uni.showToast({
                    title: '复制失败',
                    icon: 'error'
                });
            }
        });
    } catch (error) {
        console.error('复制失败:', error);
    }
};

// ============== 新增的缺失函数 ==============

// 格式化余额显示
export const formatBalance = (balance) => {
    try {
        const num = parseFloat(balance);
        if (isNaN(num)) return '0.0000';
        
        // 如果余额很小，显示更多小数位
        if (num < 0.0001) {
            return num.toFixed(8);
        } else if (num < 1) {
            return num.toFixed(6);
        } else {
            return num.toFixed(4);
        }
    } catch (error) {
        console.error('格式化余额失败:', error);
        return '0.0000';
    }
};

// 计算代币价值
export const calculateTokenValue = async (balance) => {
    try {
        const ethPrice = await getEthPrice();
        const balanceFloat = parseFloat(balance);
        
        if (isNaN(balanceFloat) || balanceFloat <= 0) {
            return '0.00';
        }
        
        const value = balanceFloat * ethPrice;
        
        // 格式化价值显示
        if (value < 0.01) {
            return value.toFixed(6);
        } else if (value < 1) {
            return value.toFixed(4);
        } else {
            return value.toFixed(2);
        }
    } catch (error) {
        console.error('计算代币价值失败:', error);
        return '0.00';
    }
};

// 创建新钱包 (别名函数，为了兼容)
export const createNewWallet = () => {
    try {
        const mnemonic = bip39.generateMnemonic(wordlist);
        const wallet = Wallet.fromMnemonic(mnemonic);
        
        const walletInfo = {
            name: '主账户',
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: mnemonic,
            balance: '0',
            balanceUSD: '0.00',
            createdAt: new Date().toISOString()
        };
        
        return walletInfo;
    } catch (error) {
        console.error('创建新钱包失败:', error);
        throw error;
    }
};

// 从存储中加载钱包列表 (别名函数，为了兼容)
export const loadWalletsFromStorage = loadWalletsList;

// 保存钱包到存储 (别名函数，为了兼容)
export const saveWalletToStorage = (walletInfo) => {
    try {
        // 保存当前钱包
        saveWalletInfo(walletInfo);
        
        // 添加到钱包列表
        const walletsList = loadWalletsList();
        const existingIndex = walletsList.findIndex(w => w.address === walletInfo.address);
        
        if (existingIndex === -1) {
            walletsList.unshift(walletInfo); // 添加到列表开头
            saveWalletsList(walletsList);
        }
        
        return true;
    } catch (error) {
        console.error('保存钱包到存储失败:', error);
        return false;
    }
};

// 生成助记词
export const generateMnemonic = () => {
    try {
        return bip39.generateMnemonic(wordlist);
    } catch (error) {
        console.error('生成助记词失败:', error);
        throw error;
    }
};

// 验证助记词
export const validateMnemonic = (mnemonic) => {
    try {
        return bip39.validateMnemonic(mnemonic, wordlist);
    } catch (error) {
        console.error('验证助记词失败:', error);
        return false;
    }
};

// 获取gas价格
export const getGasPrice = async () => {
    try {
        const web3 = initWeb3();
        const gasPrice = await web3.eth.getGasPrice();
        return gasPrice;
    } catch (error) {
        console.error('获取gas价格失败:', error);
        return '20000000000'; // 默认20 Gwei
    }
};

// 估算gas费用
export const estimateGasFee = async (transaction) => {
    try {
        const web3 = initWeb3();
        const gasEstimate = await web3.eth.estimateGas(transaction);
        const gasPrice = await getGasPrice();
        
        const gasFee = web3.utils.fromWei((gasEstimate * gasPrice).toString(), 'ether');
        return gasFee;
    } catch (error) {
        console.error('估算gas费用失败:', error);
        return '0.001'; // 默认gas费用
    }
};

// 获取网络状态
export const getNetworkStatus = async () => {
    try {
        const web3 = initWeb3();
        const isConnected = await web3.eth.net.isListening();
        const networkId = await web3.eth.net.getId();
        const blockNumber = await web3.eth.getBlockNumber();
        
        return {
            connected: isConnected,
            networkId: networkId,
            blockNumber: blockNumber
        };
    } catch (error) {
        console.error('获取网络状态失败:', error);
        return {
            connected: false,
            networkId: null,
            blockNumber: null
        };
    }
};
