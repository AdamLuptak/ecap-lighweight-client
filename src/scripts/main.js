/*jslint node: true */
'use strict';
var CONTROLLER_BASE_URL = 'http://192.168.1.177';
var CONTROLLER_URL = CONTROLLER_BASE_URL + '/controller-data';
var PID_URL = CONTROLLER_BASE_URL + '/pid';
var SET_POINT_URL = CONTROLLER_BASE_URL + '/pid/set-point';
var ACTIVATE_URL = CONTROLLER_BASE_URL + '/pid/activate';
var FETCH_CONTROLLER_DATA_INTREVAL = 1000;
var temperatures = [];
var HEADER = 'tk1,tk2,tk3\n';
var TEMPERATURES_KEY = 'temperatures';
var LOCAL_STORAGE_LIMIT = 200000;
var MAX_ALLOW_TEMPERATURE = 500;
/* jshint undef: false */
window.onload = function() {
    setTimeout(function() { document.body.style.opacity = '100'; }, 1000);
};

function changeSetPoint() {
    console.log('Start Ecap Controller');
    var request = new XMLHttpRequest();
    var newSetPoint = document.getElementById('set-point-input').value;

    request.open('POST', SET_POINT_URL + '?setPoint=' + newSetPoint);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function() {
        if (request.status === 200) {
            console.log('Set point udpated');
        } else if (request.status !== 200) {
            console.log('An error occurred during the transaction POST new setPoint');
        }
    };
    request.send();
}

function changePid(e) {
    var queryParameters = '?';
    queryParameters = queryParameters + 'kp=' + e.currentTarget[0].value + '&';
    queryParameters = queryParameters + 'ki=' + e.currentTarget[1].value + '&';
    queryParameters = queryParameters + 'kd=' + e.currentTarget[2].value + '&';
    queryParameters = queryParameters + 'minOutput=' + e.currentTarget[3].value;

    var request = new XMLHttpRequest();
    request.open('POST', PID_URL + queryParameters);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function() {
        if (request.status === 200) {
            console.log('Pid change');
        } else if (request.status !== 200) {
            console.log('An error occurred during the transaction POST new setPoint');
        }
    };
    request.send();
}

function saveDataToExcel() {
    console.log('Saving data to excel');
    var a = window.document.createElement('a');
    var contentType = 'text/csv';
    var CSV = JSON.parse(localStorage.getItem(TEMPERATURES_KEY));
    CSV = HEADER + CSV.join('\n');
    var csvFile = new Blob([CSV], { type: "application/csv" });
    a.href = window.URL.createObjectURL(csvFile);
    a.download = 'measurement.csv';
    document.body.appendChild(a);
    a.click();
}

window.onbeforeunload = confirmExit;

function confirmExit() {
    if (document.getElementById('save-to-excel-after-close').checked) {
        saveDataToExcel();
    }
}

function fetchControllerData() {
    console.log('Fetching data from: ' + CONTROLLER_URL);
    /* jshint undef: false */
    var request = new XMLHttpRequest();
    request.onload = function(e) {
        var controllerData = e.target.response;
        updateHtmlData(controllerData);
        saveData(controllerData);
    };
    request.onerror = function() {
        var header = document.getElementById('header');
        header.innerHTML = 'An error occurred during the transaction<br>GET:' + CONTROLLER_URL;
    };
    request.open('GET', CONTROLLER_URL, true);
    request.setRequestHeader('Accept', 'application/json');
    request.responseType = 'json';
    request.send();
}

function saveData(controllerData) {
    var newTemperatures = controllerData.temperatures;
    var temperaturesRow = '';
    for (var i = 0; i < newTemperatures.length; i++) {
        temperaturesRow = temperaturesRow.concat(newTemperatures[i].value);

        if (i < newTemperatures.length - 1) {
            temperaturesRow = temperaturesRow.concat(',');
        }
    }
    temperatures.push(temperaturesRow);
    upsertDataLocalStorage(temperaturesRow);
}

function toggleRegulator(isTurnOn) {
    console.log(isTurnOn);
    if (isTurnOn) {
        localStorage.removeItem(TEMPERATURES_KEY);
    }
    var request = new XMLHttpRequest();

    request.open('POST', ACTIVATE_URL + '?activate=' + isTurnOn);

    request.onload = function() {
        if (request.status === 200) {
            console.log('Regulator state change to: ' + isTurnOn);
        } else if (request.status !== 200) {
            console.log('An error occurred during the transaction POST new setPoint');
        }
    };
    request.send(JSON.stringify({ activate: isTurnOn }));
}

function upsertDataLocalStorage(temperaturesRow) {
    if (TEMPERATURES_KEY in localStorage) {
        var storedTemperatures = localStorage.getItem(TEMPERATURES_KEY);
        var jsonTemperatures = JSON.parse(storedTemperatures);
        if (jsonTemperatures.length >= LOCAL_STORAGE_LIMIT) {
            localStorage.removeItem(TEMPERATURES_KEY);
            jsonTemperatures = [];
        }
        jsonTemperatures.push(temperaturesRow);
        localStorage.setItem(TEMPERATURES_KEY, JSON.stringify(jsonTemperatures));
    } else {
        var temperatures = Array(1).fill(temperaturesRow);
        localStorage.setItem(TEMPERATURES_KEY, JSON.stringify(temperatures));
    }
}


function updateHtmlData(controllerData) {
    if (controllerData.pid.activate) {
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('stopButton').style.display = 'inline';
    } else {
        document.getElementById('stopButton').style.display = 'none';
        document.getElementById('startButton').style.display = 'inline';
    }

    document.getElementById('controller-state').innerHTML = ' STATE: ' + (controllerData.pid.activate ? 'ON' : 'OFF');
    document.getElementById('header').innerHTML = 'ECAP Temperature Controller';
    document.getElementById('set-point').innerHTML = 'Setpoint: ' + controllerData.pid.setPoint + '°C';
    document.getElementById('kp').innerHTML = 'kp: ' + controllerData.pid.kp;
    document.getElementById('ki').innerHTML = 'ki: ' + controllerData.pid.ki;
    document.getElementById('kd').innerHTML = 'kd: ' + controllerData.pid.kd;
    document.getElementById('min-output').innerHTML = 'minOutput: ' + controllerData.pid.minOutput;


    var temperatures = controllerData.temperatures;
    var overHeatTemperature = {};

    for (var i = 0; i < temperatures.length; i++) {
        var temperature = temperatures[i];
        var header = document.getElementById('header');
        if (temperature.value > MAX_ALLOW_TEMPERATURE) {
            overHeatTemperature = temperature;
        }

        document.getElementById(temperature.name).innerHTML = temperature.name + ': ' + temperature.value + '°C';
    }

    if (overHeatTemperature.name != null) {
        document.getElementById('control').style.display = 'none'
        header.style.color = 'red';
        header.innerHTML = 'SYSTEM IS IN DANGER STATE </br>TEMPERATURE ' + overHeatTemperature.name + ' is: ' + overHeatTemperature.value + '°C </br>MAX ALLOW TEMPERATURE IS: ' + MAX_ALLOW_TEMPERATURE + ' °C';
    } else if (header.style.color === 'red') {
        document.getElementById('control').style.display = 'inline';
        header.style.color = 'black';
    }
}

var fetchControllerDataTimer = setInterval(fetchControllerData, FETCH_CONTROLLER_DATA_INTREVAL);