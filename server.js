const Web3 = require('web3')
const web3http = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/e0545923a679490dbad2b378f01621ac"))
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/e0545923a679490dbad2b378f01621ac'))
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');

const acc = {
    address: process.env.address,
    privateKey: process.env.privateKey
}
web3.eth.defaultAccount = acc.address;
web3.eth.accounts.wallet.add({
    privateKey: acc.privateKey,
    address: acc.address
})

const contractAddress = '0x0E27952C2BcED1802dE393923F90635EA2eb1bF6';
const abi = fs.readFileSync('./contracts/abi.json');
const defitry = new web3.eth.Contract(JSON.parse(abi), contractAddress);

const getBalance = async () => {
    await defitry.methods.getBalance()
    .call()
    .then(res => console.log('Balance ==> ', web3.utils.fromWei(res, 'ether'), ' ETH', res))
}

async function swap (acc2, value) {
    const deadline = await Math.floor((new Date().getTime())/1000) + 40;
    console.log('DeadLine ==> ',deadline)
    let gasEstimated = 500000/*
    try {
        await defitry.methods.swapEthForTokenWithUniswap(
        value, 
        acc2,
        web3.utils.toHex(deadline))
    .estimateGas()
    .then(res => {gasEstimated = res; console.log('Estimated Gas ==>', gasEstimated)})
    .catch(err=> console.error(err))
    }
    catch (err) {
        console.log('[+] Could get gasEstimated, going forward with ', gasEstimated,' gas');
    }
    finally { */
    await defitry.methods.swapEthForTokenWithUniswap(
        value, 
        acc2,
        web3.utils.toHex(deadline))
    .send({from: acc.address, gas: gasEstimated})
    .then(res => console.log('==> SWAPPED ', res))
    .catch(err => console.error(err));
 //   }
        
}
script = async () => {
    defitry.events.Deposit()
    .on('data', res => {
        console.log('DATA ==>', res);
        getBalance();
        console.log('[+] Executing swap')
        swap (res.returnValues._From, res.returnValues._amount)
        getBalance();
    })
    .on('connected', res => console.log('Connected ==>', res))

}


script();
