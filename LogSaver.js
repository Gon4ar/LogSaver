// ==UserScript==
// @name         LogSaver
// @namespace    http://tampermonkey.net/
// @version      0.1
// @grant        unsafeWindow
// @description  LogSaver
// @author       You
// @match      http://mush.vg/*
// @match      http://mush.vg/#
// @match      http://mush.twinoid.com/*
// @match      http://mush.twinoid.com/#
// @match      http://mush.twinoid.es/*
// @match      http://mush.twinoid.es/#
// @require    https://code.jquery.com/jquery-2.2.1.min.js
// @downloadURL https://github.com/Gon4ar/LogSaver/blob/master/LogSaver.js
// ==/UserScript==

(function() {
    'use strict';
})();


var console = unsafeWindow.console;
var localStorage = unsafeWindow.localStorage;

var logSaver = {
    nodes: null,
    gameObject: null,
    mainInfo: null,
    methods: {
        html: {},
        data: {},
    }
};

logSaver.nodes = {
    created: {
        saveButton: null,
        showButton: null,
        hideButton: null,
        clearButton: null,
        roomList: null,
        roomLog: null,
        roomLogWrap: null,
        background: null,
    },
    basic: {
        gameMainChat: null,
    },
};

logSaver.methods.html.showLog = function () {
    console.log('html.showLog');
    logSaver.nodes.created.roomLogWrap.show();
    logSaver.nodes.created.background.show();
}


logSaver.methods.html.hideLog = function () {
    console.log('html.hideLog');
    logSaver.nodes.created.roomLogWrap.hide();
    logSaver.nodes.created.background.hide();
}

logSaver.createNodes = function () {
    console.log('createNodes');

    if (!this.nodes.basic.gameMainChat) {
        this.nodes.basic.gameMainChat=$('#cdMainChat'); }

    if (!this.nodes.created.saveButton) {
        this.nodes.created.saveButton = $('<a class="butmini" id="logSaverSaveButton">Save current room</a>');
        this.nodes.created.saveButton.appendTo (this.nodes.basic.gameMainChat);
    }

    if (!this.nodes.created.showButton) {
        this.nodes.created.showButton = $('<a class="butmini" id="logSaverShowButton">Show</a>');
        this.nodes.created.showButton.appendTo (this.nodes.basic.gameMainChat);
    }

    if (!this.nodes.created.clearButton) {
        this.nodes.created.clearButton = $('<a class="butmini" id="logSaverClearButton">CLEAR</a>');
        this.nodes.created.clearButton.appendTo (this.nodes.basic.gameMainChat);
    }

    if (!this.nodes.created.roomLogWrap) {
        this.nodes.created.roomLogWrap = $('<td id="logSaverLogWrap" class="chat_box"></td>');
        this.nodes.created.roomLogWrap.appendTo ('body');
    }

    if (!this.nodes.created.roomLog) {
        this.nodes.created.roomLog = $('<div class="chattext" id="logSaverLog">room log</div>');
        this.nodes.created.roomLog.appendTo (this.nodes.created.roomLogWrap);
    }

    if (!this.nodes.created.roomList) {
        this.nodes.created.roomList = $('<div id="logSaverRoomList" class="">room list</div>');
        this.nodes.created.roomList.appendTo (this.nodes.created.roomLogWrap);
    }

    if (!this.nodes.created.hideButton) {
        this.nodes.created.hideButton = $('<a class="butmini" id="logSaverHideButton">Hide</a>');
        this.nodes.created.hideButton.appendTo (this.nodes.created.roomLogWrap);
    }

    if (!this.nodes.created.background) {
        this.nodes.created.background = $('<div id="logSaverBackground" class=""></div>');
        this.nodes.created.background.appendTo ('body');
    }
}

logSaver.init = function () {
    console.log('init');
    var $this = this;

    if (unsafeWindow.Main)
        this.gameObject = unsafeWindow.Main;
    else
        throw "logSaver error: game object is not defined";

    this.restoreInfo();
    this.createNodes();
    this.fillRoomList();

    this.mainInfo.gameId = this.getCurrentGame();

    this.nodes.created.saveButton.on ('click', function (event) {
        event.preventDefault();
        $this.saveCurrentRoom();
    });

    this.nodes.created.showButton.on ('click', function (event) {
        event.preventDefault();
        $this.methods.html.showLog();
    });

    this.nodes.created.hideButton.on ('click', function (event) {
        event.preventDefault();
        $this.methods.html.hideLog();
    });

    this.nodes.created.clearButton.on ('click', function (event) {
        event.preventDefault();
        $this.clearInfo();
    });


}

logSaver.insertLog = function (roomName) {
    console.log('insertLog');
    this.nodes.created.roomLog.empty();
    for (var key in this.mainInfo.roomLogs) {
        if (roomName && roomName===key) {
            console.log(key);
            for (var cycle in this.mainInfo.roomLogs[key]) {
                this.nodes.created.roomLog.prepend (this.mainInfo.roomLogs[key][cycle]);
            }
        }
    }
    this.nodes.created.roomLog.find('.not_read').each (function (item){
        $(this).removeClass('not_read');
    });
    this.nodes.created.roomLog.find('.recent').remove();
    return true;
}


logSaver.saveCurrentRoom = function () {
    console.log('saveCurrentRoom');
    if (!this.mainInfo.roomLogs)
        this.mainInfo.roomLogs = {};

    var currentRoom = this.getCurrentRoom();
    console.log(currentRoom);

    if (typeof this.mainInfo.roomLogs[currentRoom] !=='object')
        this.mainInfo.roomLogs[currentRoom] = {};

    var temp = this.mainInfo.roomLogs[currentRoom];

    $('#localChannel').find ('.cdChatPack').each (function (index) {
        var cycle = $(this).attr('data-c');
        temp[cycle] = $(this).html();
    });

    this.mainInfo.roomLogs[currentRoom] = temp;
    this.saveInfo();
    this.fillRoomList();
}

logSaver.fillRoomList = function () {
    console.log('fillRoomList');
    var $this = this;
    this.nodes.created.roomList.empty();

    var wrap = $('<div class="room-list-wrap"></div>');

    wrap.append ('<a class="js-room butmini" data-room-name="" data-first="true">empty</a>');
    for (var key in this.mainInfo.roomLogs) {
        wrap.append ('<a class="js-room butmini" data-room-name="'+key+'">'+key+'</a>');
    }

    this.nodes.created.roomList.append (wrap);

    this.nodes.created.roomList.find ('.js-room').each (function (index){
        $(this).on('click',function (event){
            event.preventDefault();
            var roomName = $(this).data('room-name');
            $this.insertLog(roomName);
            $this.nodes.created.roomList.find ('.js-room[data-first="true"]').html(roomName);
        });
    });
}

logSaver.getCurrentRoom = function () {
    console.log('getCurrentRoom');
    return $("#input").attr('d_name');
}

logSaver.getCurrentGame = function () {
    console.log('getCurrentGame');
    return $("#input").attr('js_ship');
}


logSaver.getInfo = function () {
    console.log('getInfo');
    return this.mainInfo;
}


logSaver.saveInfo = function () {
    console.log('saveInfo');
    localStorage['logSaver'] = JSON.stringify(this.mainInfo);
    return true;
}


logSaver.restoreInfo = function () {
    console.log('restoreInfo');
    try { this.mainInfo = JSON.parse(localStorage['logSaver'])} catch (err) {this.mainInfo={}};
    return true;
}

logSaver.clearInfo = function () {
    console.log('clearInfo');
    if (confirm("Удалить логи?")) {
        this.mainInfo.roomLogs = {};
        localStorage['logSaver'] = {};
    } else {
    }

    this.fillRoomList();
    return true;
}


$(function () {
    console.log('start LogSaver');
    logSaver.init();
    var logSaverTimer = setInterval(function() {
        //logSaver.saveCurrentRoom();
    }, 4000);
    console.log(logSaver);
});




function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

addGlobalStyle ('#logSaverBackground {display: none; position: fixed;width: 100%;height: 100%;background-color: #FFF;top: 0px;left: 0px;z-index: 3;opacity: 0.6;}');
addGlobalStyle ('#logSaverLogWrap {display: none; position: absolute;background-color: #fff;left: 20%;top: 20%;width: 430px;height: 800px;z-index: 9;}');
addGlobalStyle ('#logSaverLog {height: 100%;}');
addGlobalStyle ('#logSaverRoomList {position: absolute;top: 0px;right: -80px;}');
addGlobalStyle ('#logSaverRoomList a.butmini {display: block;}');
addGlobalStyle ('#logSaverRoomList a.butmini:first-of-type {margin-bottom: 10px;}');
addGlobalStyle ('#logSaverHideButton {position: absolute;top: -20px;right: -80px;}');


