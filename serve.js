const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const itsme = require('./index');

app.use(bodyParser.json());

app.post('/', async (req, res) => {
    try {
        await itsme(req.body.itsme, req.body.deviceId);
        res.send('success');
    } catch (e) {
        res.status(500).send(e);
    }
});

const port = 5004;
app.listen(port, () => console.log(`itsme automatization running on port ${port}`));
