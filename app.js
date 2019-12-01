const origin = new URL('package.json', window.location.href).toString()
const snapId = `wallet_plugin_${origin}`

const installButton = document.querySelector('button.install')
const connectButton = document.querySelector('button.connect')
const alertButton = document.querySelector('button.alert')
const addButton = document.querySelector('button.add')
const setActorButton = document.querySelector('button.set-actor')
const sendButton = document.querySelector('button.send')

installButton.addEventListener('click', install)
connectButton.addEventListener('click', connect)
alertButton.addEventListener('click', showAlert)
addButton.addEventListener('click', add)
setActorButton.addEventListener('click', setActor)
sendButton.addEventListener('click', execute)

async function install() {
    console.log('install')
    const response = await ethereum.send({
        method: 'wallet_requestPermissions',
        params: [{
            [snapId]: {},
            'eth_accounts': {},
        }],
    })
    console.log('installed: ', response)
}

async function connect() {
    console.log('connect')
    const response = await ethereum.send({
        method: 'wallet_requestPermissions',
        params: [{
            'eth_accounts': {},
        }],
    })
    console.log('connected: ', response)
}

async function showAlert() {
    console.log(`show alert ${snapId}`)
    const response = await ethereum.send({
        method: snapId,
        params: [{
            method: 'hello',
        }],
    })
    console.log('alert showed: ', response)
}

async function add() {
    const address = document.querySelector('input.dao-address').value.toLowerCase()
    console.log('adding account: ', address)
    const response = await ethereum.send({
        method: snapId,
        params: [{
            method: 'addAccount',
            params: [ address ],
        }],
    })
    console.log('added: ', response)
}

async function setActor() {
    const accResponse = await ethereum.send({
        method: 'eth_accounts',
    })
    console.log('accounts: ', accResponse)
    const account = accResponse[0]
    const actor = document.querySelector('input.actor-address').value.toLowerCase()
    console.log('setting actor: ', actor)
    const sendResponse = await ethereum.send({
        method: snapId,
        params: [{
            method: 'setActor',
            params: [ account, actor ],
        }],
    })
    console.log('actor set: ', sendResponse)
}

async function execute() {
    const accResponse = await ethereum.send({
        method: 'eth_accounts',
    })
    console.log('accounts: ', accResponse)
    const account = accResponse[0]
    const value = 0
    const gasPrice = 0
    const to = '0x0000000000000000000000000000000000000000'
    const sendResponse = await ethereum.send({
        method: 'eth_sendTransaction',
        params: [{
            from: account,
            value: value.toString(16),
            gasPrice: gasPrice.toString(16),
            to: to,
        }],
    })
    console.log('sent: ', sendResponse)
}
