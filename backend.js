#!/usr/bin/env node

const express = require('express')
const agent = require('./agent')

const app = express()
app.use(express.json())
app.post('/path/', async (request, response) => {
    console.log('Incoming request: ', request.body)
    try {
        const tx = await agent.calculatePath(
            request.body.dao,
            request.body.actor,
            request.body.txParams,
        )
        response.json({tx: tx})
    } catch (error) {
        console.error(error)
        response.json({error: error.toString()})
    }
})

const PORT = process.env.PORT || 8084

app.listen(PORT, () => {
    console.log(`Backend service running on: http://localhost:${PORT}`)
})
