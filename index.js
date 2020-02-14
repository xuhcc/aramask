const BACKEND_URL = 'http://localhost:8084'

const accounts = {}

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
    switch (requestObject.method) {
        case 'addAccount':
            return await addAccount(requestObject.params[0])
        case 'setActor':
            setActor(...requestObject.params)
            break
        default:
            throw new Error('Method not found.')
    }
    return true
})

async function getChainId() {
    const chainId = await wallet.send({
        method: 'net_version',
    })
    if (!chainId) {
        throw new Error('Can not get chain ID.')
    }
    return chainId
}

async function callBackend(endpoint, payload) {
    const url = `${BACKEND_URL}/${endpoint}/`
    console.log(`sending to ${url}: `, payload)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    const result = await response.json()
    if (result.error) {
        throw new Error(result.error)
    }
    console.log('received: ', result)
    return result
}

async function addAccount(daoAddress) {
    const chainId = await getChainId()
    const payload = {
        chainId: chainId,
        dao: daoAddress,
    }
    const { agentAddress } = await callBackend('agent', payload)
    await wallet.send({
        method: 'wallet_manageIdentities',
        params: [
            'add',
            {address: agentAddress},
        ],
    })
    accounts[agentAddress] = {dao: daoAddress, actor: null}
    return agentAddress
}

function setActor(account, actor) {
    accounts[account].actor = actor
}

wallet.registerAccountMessageHandler(async (originString, requestObject) => {
    switch (requestObject.method) {
        case 'eth_signTransaction':
            await sendTransaction(requestObject.params[0])
            break
        default:
            throw Error('Method not supported.')
    }
    return true
})

async function sendTransaction(tx) {
    const account = tx.from
    const {dao, actor} = accounts[account]
    if (!actor) {
        throw new Error('Actor not set for current account.')
    }
    const allowedActors = await wallet.send({
        method: 'eth_accounts',
    })
    if (allowedActors.indexOf(actor) === -1) {
        throw new Error('Actor not allowed.')
    }
    const chainId = await getChainId()
    const payload = {
        chainId: chainId,
        dao: dao,
        actor: actor,
        txParams: [tx.to, tx.value, tx.data],
    }
    const result = await callBackend('path', payload)
    const newTx = result.tx
    newTx.gas = newTx.gas.toString(16)
    console.log('sending transaction: ', newTx)
    const txId = await wallet.send({
        method: 'eth_sendTransaction',
        params: [newTx],
    })
    console.log('transaction ID: ', txId)
}
