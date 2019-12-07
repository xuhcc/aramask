const Aragon = require('@aragon/wrapper').default
const Web3 = require('web3')
const namehash = require('eth-ens-namehash')

const ARAGON_ETH_PROVIDERS = {
    1: 'wss://mainnet.eth.aragon.network/ws',
    4: 'wss://rinkeby.eth.aragon.network/ws',
}
const ARAGON_IPFS_GATEWAY = 'https://ipfs.eth.aragon.network/ipfs'
const ENS_REGISTRIES = {
    1: '0x314159265dd8dbb310642f98f50c066173c1259b',
    4: '0x98df287b6c145399aaa709692c8d308357bc085d',
}
const AGENT_APP_ID = namehash.hash('agent.aragonpm.eth')

function getAgentAddress(dao) {
    return new Promise((resolve, reject) => {
        const subscription = dao.apps.subscribe((apps) => {
            subscription.unsubscribe()
            for (let idx = 0; idx < apps.length; idx++) {
                let app = apps[idx]
                if (app.appId === AGENT_APP_ID) {
                    resolve(app.proxyAddress)
                    return
                }
            }
            reject('agent not found')
        })
    })
}

async function calculatePath(chainId, daoAddress, actorAddress, txParams) {
    /*
     * txParams: [to, value, data]
     */
    const ethProvider = new Web3.providers.WebsocketProvider(
        process.env.ETHEREUM_URL || ARAGON_ETH_PROVIDERS[chainId],
    )
    const ipfsGatewayUrl = process.env.IPFS_GATEWAY_URL || ARAGON_IPFS_GATEWAY
    const dao = new Aragon(daoAddress, {
        provider: ethProvider,
        apm: {
            ipfs: {
                gateway: ipfsGatewayUrl,
            },
            ensRegistryAddress: ENS_REGISTRIES[chainId],
        },
    })
    await dao.init()
    console.log(`Found DAO at ${daoAddress}`)
    const agentAddress = await getAgentAddress(dao)
    console.log(`Agent address is ${agentAddress}`)
    // Forward transaction to an agent
    const result = await dao.calculateTransactionPath(actorAddress, agentAddress, 'execute', txParams)
    const tx = result[0]
    console.log('Forwarded TX: ', tx)
    return tx
}

module.exports.calculatePath = calculatePath
