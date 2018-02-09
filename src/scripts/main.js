/*jslint node: true */
'use strict';
var CONTROLLER_BASE_URL = 'http://www.mocky.io';
var CONTROLLER_GET_URL = CONTROLLER_BASE_URL + '/v2/5a75f6b92e000057006ab249';
var GET_CONTROLLER_DATA_INTREVAL = 1000;

function startController() {
	console.log('Start Ecap Controller');
}

function saveDataToExcel() {
	console.log('Saving data to excel');
}

function getControllerData() {
	console.log('Fetching data from: ' + CONTROLLER_GET_URL);
}

var getControllerDataTimer = setInterval(getControllerData, GET_CONTROLLER_DATA_INTREVAL);

window.onbeforeunload = function() {
	clearInterval(getControllerDataTimer);
};
