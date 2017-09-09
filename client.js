var ethUtil = require('ethereumjs-util')
var Eth = require('ethjs')


var startupAccontCheck = 0;
var startupAccontCheckMaxTimes = 10;
window.eth = null ;
var el = function(id){ return document.querySelector(id); };

window.appReady = false;

window.addEventListener('load', function() {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        window.eth = new Eth(window.web3.currentProvider);
    } else {
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.eth = new Eth(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
    }

    // chat socket
    $(function () {
        window.socket = io();
        $('form').submit(function() {
            // no empty
            if($('#m').val().length > 0) {
                var text = $('#m').val();
                encodeMessage(text).then(function(signed){

                    var message = {
                        data: text,
                        from: window.currentAccount,
                        sig: signed
                    };

                    socket.emit('chat', message);
                });
                $('#m').val('');
            }
            return false;
        });
        window.socket.on('chat', function(received) {
            validateMessage(received.data).then(function(validated) {
                var msg = received.sender + ": " + received.data.from + " => " + received.data.data;
                if(validated) {
                    msg = "[VALID SIGNITURE] "+msg;
                }

                $('#messages').append($('<li>').text(msg));
                window.scrollTo(0, document.body.scrollHeight);

            });

        });
    });

    // Now you can start your app & access web3 freely:
    startupAccontCheck = 0;
    setTimeout(function(){ checkAppStart() }, 100);
});

function checkAppStart() {
    if(typeof(window.eth.defaultAccount) !== 'undefined' ) {
        startApp(window.eth.defaultAccount);
    } else {
        startupAccontCheck++;
        if(startupAccontCheck < startupAccontCheckMaxTimes) {
            setTimeout(function(){ checkAppStart() }, 100);
        } else {
            startApp(false);
        }
    }
}

function startApp(account) {
    updateInterface();
    account = window.eth.accounts[0];
    var accountInterval = setInterval(function() {
        if (window.eth.accounts[0] !== account) {
            account = window.eth.accounts[0];
            updateInterface();
        }
    }, 100);
}


function updateInterface() {
    window.eth.accounts(function(e, accounts){
        window.currentAccount = accounts[0];
        window.appReady = true;
    });
}





function encodeMessage(text) {

    if(window.appReady) {

        var from = window.currentAccount;
        var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))

        // see https://github.com/ethereum/EIPs/pull/683
        return window.eth.personal_sign(from, msg, function( signed ) {
            return signed;
        });
    }
    else {
        throw("Not ready yet. Please try again in like 100ms.");
    }
}

function validateMessage(received) {
    return window.eth.personal_ecRecover(received.data, received.sig, function( validated ) {
        return validated;
    });

    /*
    if (getPublicKeyFor(received.data) === received.from) {
        return true;
    }
    return false;
    */
}


function getPublicKeyFor (msgParams) {
    var message = ethUtil.toBuffer(msgParams.data)
    var msgHash = ethUtil.hashPersonalMessage(message)
    var signature = ethUtil.toBuffer(msgParams.sig)
    var sigParams = ethUtil.fromRpcSig(signature)
    var publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s)
    return publicKey
}

