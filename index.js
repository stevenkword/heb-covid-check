const fetch = require('node-fetch');
const open = require('open');
const beep = require('beepbeep');
const { exec } = require("child_process");



// settings
const checkInterval = 6; // 10 times/minute
const tabsToOpen = 1; // set to a higher number to try to get multiple appointments at similar times
const desiredCities = [ // use lowercase to avoid any case mismatches
    'austin',
    'kyle',
    'buda',
    'bastrop',
];



const checkAvailability = function () {
    console.log('checking...');
    fetch('https://heb-ecom-covid-vaccine.hebdigital-prd.com/vaccine_locations.json', {
        headers: {
            'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0'
        },
        referrer: 'https://vaccine.heb.com/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
    })
        .then(response => response.json())
        .then(data => {
            let available = [];
            for (let i = 0, len = data.locations.length; i < len; i++) {
                if (desiredCities.includes(data.locations[i].city.toLowerCase()) && data.locations[i].openTimeslots > 1) { // <= 1 time slot never seems to be actually available
                    available.push(data.locations[i]);
                }
            }
            if (available.length > 0) {
                clearInterval(checking);
                available.sort((a, b) => b.openTimeslots - a.openTimeslots);
                console.log(available);
                for (let i = 0; i < tabsToOpen; i++) {
                    (async () => {
                        await open(available[0].url);
                    })();
                }
                beep(3, 250);
                exec("say Appointment found", (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            }
        });
};

const checking = setInterval(checkAvailability, checkInterval * 1000);
checkAvailability();
