/*jslint node: true */
'use strict';
var CONTROLLER_BASE_URL = 'http://localhost:8080/testing676/ecap/1.0.0';
var CONTROLLER_URL = CONTROLLER_BASE_URL + '/controller-data';
var PID_URL = CONTROLLER_BASE_URL + '/pid';
var SET_POINT_URL = CONTROLLER_BASE_URL + '/pid/set-point';
var ACTIVATE_URL = CONTROLLER_BASE_URL + '/pid/activate';
var FETCH_CONTROLLER_DATA_INTREVAL = 1000;
var temperatures = [];
var TEMPERATURES_KEY = 'temperatures';
var LOCAL_STORAGE_LIMIT = 200000;
/* jshint undef: false */
window.onload = function() { setTimeout(function() { document.body.style.opacity = '100'; }, 1000); };

function changeSetPoint() {
    console.log('Start Ecap Controller');
    var request = new XMLHttpRequest();

    request.open('POST', SET_POINT_URL);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function() {
        if (request.status === 200) {
            console.log('Set point udpated');
        } else if (request.status !== 200) {
            console.log('An error occurred during the transaction POST new setPoint');
        }
    };
    var newSetPoint = document.getElementById('set-point-input').value;
    request.send(JSON.stringify({ setPoint: newSetPoint }));
}

function saveDataToExcel() {
    console.log('Saving data to excel');
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
        temperaturesRow = temperaturesRow.concat('"' + newTemperatures[i].value + '"');

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

    request.open('POST', ACTIVATE_URL);
    request.setRequestHeader('Content-Type', 'application/json');
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
    var temperatures = controllerData.temperatures;
    for (var i = 0; i < temperatures.length; i++) {
        var temperature = temperatures[i];
        document.getElementById(temperature.name).innerHTML = temperature.name + ': ' + temperature.value + '°C';
    }
}

var fetchControllerDataTimer = setInterval(fetchControllerData, FETCH_CONTROLLER_DATA_INTREVAL);
