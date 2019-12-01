const actors = {};

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
    switch (requestObject.method) {
        case 'hello':
            return wallet.send({
                method: 'alert',
                params: [`Hello, ${originString}!`],
            });
        case 'addAccount':
            addAccount(requestObject.params[0]);
            break;
        case 'setActor':
            const account = requestObject.params[0];
            const actor = requestObject.params[1];
            actors[account] = actor;
            console.log(`set actor for account ${account} to ${actor}`);
            break;
        default:
            throw new Error('Method not found.');
    }
    return true;
});

async function addAccount(account) {
    console.log('addAccount: ', account);
    const result = await wallet.send({
        method: 'wallet_manageIdentities',
        params: [
            'add',
            {address: account},
        ],
    });
    console.log('wallet_manageIdentities: ', result);
    actors[account] = null;
}

wallet.registerAccountMessageHandler(async (originString, requestObject) => {
    console.log('account request: ', requestObject);
    switch (requestObject.method) {
        case 'eth_signTransaction':
            const txInfo = requestObject.params[0];
            const account = txInfo.from;
            const actor = actors[account];
            if (!actor) {
                throw new Error('Actor is not set');
            }
            const allowedActors = await wallet.send({
                method: 'eth_accounts',
            });
            if (allowedActors.indexOf(actor) === -1) {
                throw new Error('Actor is not allowed.');
            }
            const txParams = [txInfo.to, txInfo.value, txInfo.data];
            const payload = {
                dao: account,
                actor: actor,
                txParams: txParams,
            };
            console.log('sending: ', payload);
            const url = 'http://localhost:8084/path/';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.error) {
                console.log('error: ', result.error);
                return false;
            }
            const tx = result.tx;
            tx.gas = tx.gas.toString(16);
            console.log('created tx: ', tx);
            const txResult = await wallet.send({
                method: 'eth_sendTransaction',
                params: [tx],
            });
            console.log('sendTransaction: ', txResult);
            return true;
        default:
            throw Error('account error');
    }
});
