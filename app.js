const origin = new URL('package.json', window.location.href).toString()
const snapId = `wallet_plugin_${origin}`

const installButton = document.querySelector('button.install')
const addButton = document.querySelector('button.add')
const connectButton = document.querySelector('button.connect')
const setActorButton = document.querySelector('button.set-actor')
const sendButton = document.querySelector('button.send')

installButton.addEventListener('click', install)
addButton.addEventListener('click', addAccount)
connectButton.addEventListener('click', connect)
setActorButton.addEventListener('click', setActor)
sendButton.addEventListener('click', sendTransaction)

async function install() {
    console.log('installing...')
    await ethereum.send({
        method: 'wallet_requestPermissions',
        params: [{
            [snapId]: {},
            'eth_accounts': {},
        }],
    })
    console.log('installed.')
}

async function connect() {
    console.log('connecting to account...')
    await ethereum.send({
        method: 'wallet_requestPermissions',
        params: [{
            'eth_accounts': {},
        }],
    })
    console.log('connected.')
}

async function addAccount() {
    const daoAddress = document.querySelector('input.dao-address').value.toLowerCase()
    console.log('adding account: ', daoAddress)
    const response = await ethereum.send({
        method: snapId,
        params: [{
            method: 'addAccount',
            params: [
                daoAddress,
            ],
        }],
    })
    if (response) {
        console.log('account added.')
    }
}

async function setActor() {
    const accounts = await ethereum.send({
        method: 'eth_accounts',
    })
    if (accounts.length === 0) {
        console.log('no accounts available.')
        return
    }
    const account = accounts[0]
    const actor = document.querySelector('input.actor-address').value.toLowerCase()
    console.log('setting actor: ', actor)
    const response = await ethereum.send({
        method: snapId,
        params: [{
            method: 'setActor',
            params: [
                account,
                actor,
            ],
        }],
    })
    if (response) {
        console.log('actor set.')
    }
}

async function sendTransaction() {
    const accounts = await ethereum.send({
        method: 'eth_accounts',
    })
    if (accounts.length === 0) {
        console.log('no accounts available.')
        return
    }
    const account = accounts[0]
    console.log('sending transaction...')
    const value = 0
    const gasPrice = 0 // Otherwise Metamask will show 'insufficient funds' error
    const to = '0x0000000000000000000000000000000000000000'
    const response = await ethereum.send({
        method: 'eth_sendTransaction',
        params: [{
            from: account,
            to: to,
            value: value.toString(16),
            gasPrice: gasPrice.toString(16),
        }],
    })
    console.log('sent: ', response)
}
