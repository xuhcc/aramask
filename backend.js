#!/usr/bin/env node

/*
 * Supported environment variables:
 * - ETHEREUM_URL
 * - IPFS_GATEWAY_URL
 */

const express = require('express')
const agent = require('./agent')

const app = express()
app.use(express.json())

app.post('/agent/', async (request, response) => {
    console.log('Incoming request: ', request.body)
    try {
        const {chainId, dao} = request.body
        const agentAddress = await agent.findAgent(chainId, dao)
        response.json({ agentAddress })
    } catch (error) {
        console.error(error)
        response.json({error: error.toString()})
    }
})

app.post('/path/', async (request, response) => {
    console.log('Incoming request: ', request.body)
    try {
        const {chainId, dao, actor, txParams} = request.body
        const wrappedTx = await agent.calculatePath(chainId, dao, actor, txParams)
        response.json({ wrappedTx })
    } catch (error) {
        console.error(error)
        response.json({error: error.toString()})
    }
})

const PORT = 8082

app.listen(PORT, () => {
    console.log(`Backend service running on: http://localhost:${PORT}`)
})
