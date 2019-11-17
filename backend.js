#!/usr/bin/env node

const express = require('express');
const agent = require('./agent');

const app = express();
app.use(express.json());
app.get('/path/', (request, response) => {
    const data = request.params.data;
    agent.calculatePath(data).then((tx) => {
        response.json({tx: tx});
    });
});

const PORT = process.env.PORT || 8084;

app.listen(PORT, () => {
    console.log(`running at http://localhost:${PORT}/`);
});
