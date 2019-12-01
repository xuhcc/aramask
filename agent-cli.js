#!/usr/bin/env node

/*
 * Forward transaction to an agent and exit
 * Usage: ./test.js <dao-address> <actor-address> <to> <value> <data>
 */

const agent = require('./agent')

const args = process.argv

const daoAddress = args[2]
const actorAddress = args[3]
const txParams = [args[4], args[5], args[6]]

agent.calculatePath(daoAddress, actorAddress, txParams).then(() => {
    process.exit()
})
