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
}

wallet.registerAccountMessageHandler(async (originString, requestObject) => {
    switch (requestObject.method) {
        case 'eth_sign':
        case 'eth_signTransaction':
        case 'personal_sign':
        case 'wallet_signTypedData':
        case 'wallet_signTypedData_v3':
        case 'wallet_signTypedData_v4':
            console.log('request: ', requestObject);
            return false;
        default:
            throw Error('account error');
    }
});
