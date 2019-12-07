const actors = {}

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
    switch (requestObject.method) {
        case 'addAccount':
            await addAccount(requestObject.params[0])
            break
        case 'setActor':
            setActor(...requestObject.params)
            break
        default:
            throw new Error('Method not found.')
    }
    return true
})

async function addAccount(account) {
    await wallet.send({
        method: 'wallet_manageIdentities',
        params: [
            'add',
            {address: account},
        ],
    })
    actors[account] = null
}

function setActor(account, actor) {
    actors[account] = actor
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

const apiUrl = 'http://localhost:8084/path/'

async function sendTransaction(tx) {
    const account = tx.from
    const actor = actors[account]
    if (!actor) {
        throw new Error('Actor not set for current account.')
    }
    const allowedActors = await wallet.send({
        method: 'eth_accounts',
    })
    if (allowedActors.indexOf(actor) === -1) {
        throw new Error('Actor not allowed.')
    }
    const chainId = await wallet.send({
        method: 'net_version',
    })
    if (!chainId) {
        throw new Error('Can not get chain ID.')
    }
    const payload = {
        chainId: chainId,
        dao: account,
        actor: actor,
        txParams: [tx.to, tx.value, tx.data],
    }
    console.log('sending to backend service: ', payload)
    const response = await fetch(apiUrl, {
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
    const newTx = result.tx
    newTx.gas = newTx.gas.toString(16)
    console.log('sending transaction: ', newTx)
    const txId = await wallet.send({
        method: 'eth_sendTransaction',
        params: [newTx],
    })
    console.log('transaction ID: ', txId)
}
