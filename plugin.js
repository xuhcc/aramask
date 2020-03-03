const BACKEND_URL = 'http://localhost:8082'

const accounts = {}

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
    switch (requestObject.method) {
        case 'addAccount':
            return await addAccount(requestObject.params[0])
        case 'setActor':
            await setActor(...requestObject.params)
            return true
        default:
            throw new Error('Method not found.')
    }
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

async function addAccount(daoName) {
    const chainId = await getChainId()
    const payload = {
        chainId: chainId,
        daoName: daoName,
    }
    const { daoAddress, agentAddress } = await callBackend('agent', payload)
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

async function setActor(account, actor) {
    const allowedActors = await wallet.send({
        method: 'eth_accounts',
    })
    if (allowedActors.indexOf(actor) === -1) {
        throw new Error('Account not found.')
    }
    accounts[account].actor = actor
}

wallet.registerAccountMessageHandler(async (originString, requestObject) => {
    switch (requestObject.method) {
        case 'eth_signTransaction':
            return await sendTransaction(requestObject.params[0])
        default:
            throw Error('Method not supported.')
    }
})

async function sendTransaction(tx) {
    const account = tx.from
    const {dao, actor} = accounts[account]
    if (!actor) {
        throw new Error('Actor not set for current account.')
    }
    const chainId = await getChainId()
    const payload = {
        chainId: chainId,
        dao: dao,
        actor: actor,
        txParams: [tx.to, tx.value, tx.data],
    }
    const { wrappedTx } = await callBackend('path', payload)
    wrappedTx.gas = wrappedTx.gas.toString(16)
    console.log('sending transaction: ', wrappedTx)
    const wrappedTxId = await wallet.send({
        method: 'eth_sendTransaction',
        params: [wrappedTx],
    })
    console.log('transaction ID: ', wrappedTxId)
    return wrappedTxId
}
