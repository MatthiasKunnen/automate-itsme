const fs = require('fs');
const itsme = require('./index');

(async () => {
    const configuration = JSON.parse(await fs.readFileSync('./configuration.json', 'utf8'));
    await itsme(configuration);
})();
