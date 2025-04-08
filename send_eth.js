
const Web3 = require('web3');

// 连接到Ganache搭建的ETH私链
const web3 = new Web3(new Web3.providers.HttpProvider('http://172.19.99.71:8545'));

// 转账发起方账户地址
const fromAccount = '0xDc0DAFB8A315800B9E7d52Ea61bFE2cf1eF0c4Ac';
// 转账接收方账户地址
const toAccount = '0x8fa411E2F4df5fDDA8E5a0db013C6804481446A6';
// 转账金额，以Wei为单位（1 ETH = 1e18 Wei）
const amount = web3.utils.toWei('2', 'ether');  ### 这里转账 2 ETH


// 显示转账前双方账户余额
async function showBalancesBefore() {
    const fromBalance = await web3.eth.getBalance(fromAccount);
    const toBalance = await web3.eth.getBalance(toAccount);
    console.log(`转账前，发起方余额: ${web3.utils.fromWei(fromBalance, 'ether')} ETH`);
    console.log(`转账前，接收方余额: ${web3.utils.fromWei(toBalance, 'ether')} ETH`);
}

// 调用函数显示转账前余额
showBalancesBefore();


// 构建转账交易
const transaction = {
    from: fromAccount,
    to: toAccount,
    value: amount,
    gas: 21000,
    gasPrice: web3.utils.toWei('5', 'gwei')
};

// 发送转账交易并显示转账后余额
web3.eth.sendTransaction(transaction, async function (error, transactionHash) {
    if (error) {
        console.error('转账失败:', error);
    } else {
        console.log('转账成功，交易哈希:', transactionHash);
        // 显示转账后双方账户余额
        const fromBalanceAfter = await web3.eth.getBalance(fromAccount);
        const toBalanceAfter = await web3.eth.getBalance(toAccount);
        console.log(`转账后，发起方余额: ${web3.utils.fromWei(fromBalanceAfter, 'ether')} ETH`);
        console.log(`转账后，接收方余额: ${web3.utils.fromWei(toBalanceAfter, 'ether')} ETH`);
    }
});


/*
输出结果:
转账成功，交易哈希: 0xe8b65f73e26dae81448519effd6583acbfa489bf0337b108b9c497a2e4111ba5
转账前，发起方余额: 86.95509072 ETH
转账前，接收方余额: 115 ETH
转账后，发起方余额: 84.95498572 ETH
转账后，接收方余额: 115 ETH
*/

