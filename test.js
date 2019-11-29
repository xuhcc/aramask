#!/usr/bin/env node

const agent = require('./agent');

const args = process.argv;

const daoAddress = args[2];
const actorAddress = args[3];
const txParams = [args[4], args[5], args[6]];

agent.calculatePath(daoAddress, actorAddress, txParams).then((tx) => {
    process.exit();
});
