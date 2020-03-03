const snapId = new URL('package.json', window.location.href).toString()

const installButton = document.querySelector('button.install')
const addAccountButton = document.querySelector('button.add-account')
const connectButton = document.querySelector('button.connect')
const setActorButton = document.querySelector('button.set-actor')
const sendButton = document.querySelector('button.send')

installButton.addEventListener('click', install)
addAccountButton.addEventListener('click', addAccount)
connectButton.addEventListener('click', connect)
setActorButton.addEventListener('click', setActor)
sendButton.addEventListener('click', sendTransaction)

async function install() {
    console.log('installing...')
    await ethereum.send({
        method: 'wallet_enable',
        params: [{
            'wallet_plugin': {
                [snapId]: {},
            },
            'eth_accounts': {},
        }],
    })
    console.log('installed.')
}

async function connect() {
    console.log('connecting to account...')
    await ethereum.send({
        method: 'wallet_enable',
        params: [{
            'eth_accounts': {},
        }],
    })
    console.log('connected.')
}

async function addAccount() {
    const daoName = document.querySelector('input.dao-name').value.toLowerCase()
    console.log('looking for agent in dao: ', daoName)
    const statusBox = document.querySelector('.add-account-status')
    statusBox.textContent = 'please wait...'
    statusBox.style.color = 'green'
    let account
    try {
        account = await ethereum.send({
            method: 'wallet_invokePlugin',
            params: [snapId, {
                method: 'addAccount',
                params: [
                    daoName,
                ],
            }],
        })
    } catch (error) {
        statusBox.textContent = error.message
        statusBox.style.color = 'red'
        console.error(error)
        return
    }
    statusBox.textContent = `account added: ${account}`
    console.log('account added: ', account)
}

async function setActor() {
    const accounts = await ethereum.send({
        method: 'eth_accounts',
    })
    if (accounts.length === 0) {
        alert('no accounts available.')
        return
    }
    const account = accounts[0]
    const actor = document.querySelector('input.actor-address').value.toLowerCase()
    console.log('setting actor: ', actor)
    const statusBox = document.querySelector('.set-actor-status')
    try {
        await ethereum.send({
            method: 'wallet_invokePlugin',
            params: [snapId, {
                method: 'setActor',
                params: [
                    account,
                    actor,
                ],
            }],
        })
    } catch (error) {
        statusBox.textContent = error.message
        statusBox.style.color = 'red'
        console.error(error)
        return
    }
    statusBox.textContent = `done.`
    statusBox.style.color = 'green'
    console.log('actor set.')
}

async function sendTransaction() {
    const accounts = await ethereum.send({
        method: 'eth_accounts',
    })
    if (accounts.length === 0) {
        alert('no accounts available.')
        return
    }
    const account = accounts[0]
    console.log('sending transaction...')
    const value = 0
    const to = '0x0000000000000000000000000000000000000000'
    const response = await ethereum.send({
        method: 'eth_sendTransaction',
        params: [{
            from: account,
            to: to,
            value: value.toString(16),
        }],
    })
    console.log('sent: ', response)
}
