const Web3 = require('web3');
const Aragon = require('@aragon/wrapper').default;

const ENS_REGISTRIES = {
    1: '0x314159265dd8dbb310642f98f50c066173c1259b',
    4: '0x98df287b6c145399aaa709692c8d308357bc085d'
};

const ensRegistryAddress = ENS_REGISTRIES[4]; // rinkeby
const ethereumUrl = process.env.ETHEREUM_URL || 'wss://rinkeby.eth.aragon.network/ws';
const provider = new Web3.providers.WebsocketProvider(ethereumUrl);
const ipfsGatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://ipfs.eth.aragon.network/ipfs';

async function calculatePath(daoAddress, agentAddress, actorAddress, txParams) {
    /*
     * txParams: [to, value, data]
     */
    const dao = new Aragon(daoAddress, {
        provider: provider,
        apm: {
            ipfs: {
                gateway: ipfsGatewayUrl,
            },
            ensRegistryAddress: ensRegistryAddress,
        },
    });
    await dao.init();
    console.log('init successul');
    const result = await dao.calculateTransactionPath(actorAddress, agentAddress, 'execute', txParams);
    return result[0];
}

module.exports.calculatePath = calculatePath;
