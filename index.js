const adb = require('adbkit');
const fs = require('fs');
const url = require('url');
const util = require('util');

const sleep = util.promisify(setTimeout);

(async () => {
    try {
        const configuration = JSON.parse(await fs.readFileSync('./configuration.json', 'utf8'));

        const authenticationUrl = new url.URL(configuration.endpoint);
        authenticationUrl.searchParams.append('client_id', configuration.client_id);
        authenticationUrl.searchParams.append('response_type', 'code');
        authenticationUrl.searchParams.append('redirect_uri', configuration.redirect_uri);
        authenticationUrl.searchParams.append('scope', configuration.scope);

        const adbClient = adb.createClient();
        const devices = await adbClient.listDevices();

        if (devices.length === 0) {
            throw Error('Expected at least one device.');
        }

        const device = devices[0];

        console.log('Submitting ' + authenticationUrl.href);
        await adbClient.shell(device.id, `am start -a "android.intent.action.VIEW" -d "${authenticationUrl.href}"`);
        await sleep(5000);

        console.log('Pressing confirm');
        await adbClient.shell(device.id, 'input tap 30 1044');
        await sleep(2000);

        console.log('Inputting PIN');
        const startPoint = {
            x: 34 + 217,
            y: 1048 + 343,
        };
        const xTransformation = 290;
        const yTransformation = 140;
        const mapping = {
            '0': {
                x: 1,
                y: 3,
            },
            '1': {
                x: 0,
                y: 0,
            },
            '2': {
                x: 1,
                y: 0,
            },
            '3': {
                x: 2,
                y: 0,
            },
            '4': {
                x: 0,
                y: 1,
            },
            '5': {
                x: 1,
                y: 1,
            },
            '6': {
                x: 2,
                y: 1,
            },
            '7': {
                x: 0,
                y: 2,
            },
            '8': {
                x: 1,
                y: 2,
            },
            '9': {
                x: 2,
                y: 2,
            },
            'ok': {
                x: 2,
                y: 3,
            },
        };

        const tap = async (key) => {
            const location = mapping[key];
            const xHit = startPoint.x + location.x * xTransformation;
            const yHit = startPoint.y + location.y * yTransformation;
            await adbClient.shell(device.id, `input tap ${xHit} ${yHit}`);
            await sleep(500);
            console.log(`Tapped ${key} at ${xHit} ${yHit}`);
        };

        for (let key of configuration.pin) {
            await tap(key);
        }

        await tap('ok');

        console.log('Pin entered');

    } catch (e) {
        console.error(e)
    }
})();
