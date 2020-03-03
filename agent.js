const { default: Aragon, ensResolve } = require('@aragon/wrapper')
const Web3 = require('web3')
const namehash = require('eth-ens-namehash')

const ARAGON_ETH_PROVIDERS = {
    1: 'wss://mainnet.eth.aragon.network/ws',
    4: 'wss://rinkeby.eth.aragon.network/ws',
}
const ARAGON_IPFS_GATEWAY = 'https://ipfs.eth.aragon.network/ipfs'
const ENS_REGISTRIES = {
    // https://github.com/aragon/aragon/blob/master/arapp.json
    1: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    4: '0x98df287b6c145399aaa709692c8d308357bc085d',
}
const AGENT_APP_ID = namehash.hash('agent.aragonpm.eth')

async function getDao(chainId, daoName) {
    const ethProvider = new Web3.providers.WebsocketProvider(
        process.env.ETHEREUM_URL || ARAGON_ETH_PROVIDERS[chainId],
    )
    const ipfsGatewayUrl = process.env.IPFS_GATEWAY_URL || ARAGON_IPFS_GATEWAY
    const ensRegistryAddress = ENS_REGISTRIES[chainId]

    let daoAddress
    if (daoName.startsWith('0x') && daoName.length === 42) {
        daoAddress = daoName
    } else {
        if (!daoName.endsWith('.eth')) {
            daoName += '.aragonid.eth'
        }
        daoAddress = await ensResolve(daoName, {
            provider: ethProvider,
            registryAddress: ensRegistryAddress,
        })
        console.log(`Resolved ${daoName} to ${daoAddress}`)
    }

    const dao = new Aragon(daoAddress, {
        provider: ethProvider,
        apm: {
            ipfs: {
                gateway: ipfsGatewayUrl,
            },
            ensRegistryAddress,
        },
    })
    await dao.init()
    console.log(`Found DAO at ${daoAddress}`)
    return dao
}

function getAgentAddress(dao) {
    return new Promise((resolve, reject) => {
        const subscription = dao.apps.subscribe((apps) => {
            subscription.unsubscribe()
            for (let idx = 0; idx < apps.length; idx++) {
                let app = apps[idx]
                if (app.appId === AGENT_APP_ID) {
                    const agentAddress = app.proxyAddress
                    console.log(`Agent address is ${agentAddress}`)
                    resolve(agentAddress)
                    return
                }
            }
            reject('agent not found')
        })
    })
}

async function findAgent(chainId, daoName) {
    const dao = await getDao(chainId, daoName)
    const agentAddress = await getAgentAddress(dao)
    return {
        daoAddress: dao.kernelProxy.address,
        agentAddress,
    }
}

async function calculatePath(chainId, daoAddress, actorAddress, txParams) {
    /*
     * txParams: [to, value, data]
     */
    const dao = await getDao(chainId, daoAddress)
    const agentAddress = await getAgentAddress(dao)
    // Forward transaction to an agent
    const result = await dao.calculateTransactionPath(actorAddress, agentAddress, 'execute', txParams)
    const tx = result[0]
    console.log('Forwarded TX: ', tx)
    return tx
}

module.exports.findAgent = findAgent
module.exports.calculatePath = calculatePath
