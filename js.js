/*globals Module*/
'use strict'

function $(id) {
	return document.getElementById(id)
}

window.onload = function () {
	$('sha-message').onkeyup = updateSha
	$('hmac-key').onkeyup = $('hmac-message').onkeyup = updateHmac
	$('pbkdf-password').onkeyup = $('pbkdf-salt').onkeyup = $('pbkdf-rounds').onkeyup = updatePbkdf
}

var sha = Module.cwrap('sha_simple', 'string', ['string'])
var hmac = Module.cwrap('hmac_simple', 'string', ['string', 'string'])
var pbkdf = Module.cwrap('pbkdf_simple', 'string', ['string', 'string', 'number', 'number'])

function updateSha() {
	$('sha-digest').textContent = sha($('sha-message').value)
}

function updateHmac() {
	$('hmac-tag').textContent = hmac($('hmac-key').value, $('hmac-message').value)
}

function updatePbkdf() {
	$('pbkdf-key').textContent = pbkdf($('pbkdf-password').value, $('pbkdf-salt').value, 0, Number($('pbkdf-rounds').value))
}