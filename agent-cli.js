#!/usr/bin/env node

/*
 * Forward transaction to an agent and exit
 * Usage: ./agent-cli.js <chain-id> <dao-address> <actor-address> <to> <value> <data>
 */

const agent = require('./agent')

const args = process.argv

const chainId = args[2]
const daoAddress = args[3]
const actorAddress = args[4]
const txParams = [args[5], args[6], args[7]]

agent.calculatePath(chainId, daoAddress, actorAddress, txParams).then(() => {
    process.exit()
})
