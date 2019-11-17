#!/usr/bin/env node

const agent = require('./agent');

const args = process.argv;

const daoAddress = args[2];
const agentAddress = args[3];
const actorAddress = args[4];
const txParams = [args[5], args[6], args[7]];

agent.calculatePath(daoAddress, agentAddress, actorAddress, txParams).then((tx) => {
    console.log(tx);
});
