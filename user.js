// ==UserScript==
// @name         Helpdesk / Powiadomienia windows
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Powiadomienia o nowych ticketach.
// @author       Dominik Banik dominik.banik@ekookna.pl
// @downloadURL  https://dmnick.ovh/helpdeskotify.js
// @updateURL    https://dmnick.ovh/helpdeskotify.js
// @match        https://helpdesk/
// @require      https://greasyfork.org/scripts/438798-userscript-notification-framework/code/UserScript%20Notification%20Framework.js?version=1019652
// @require  	 https://code.jquery.com/jquery-3.7.0.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.helpdesk
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';



    function powiadomienie() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            this.addEventListener('load', function() {
                if(url.indexOf("tickets") > -1){
                    if (this.readyState == 4) {
                        if (this.status == 200){
                            przelacznik(this);
                            //check(this);
                        }
                    };
                }
            });

            this.addEventListener('error', function() {
                console.log('XHR errored out', method, url);
            });
            origOpen.apply(this, arguments);
        };
    };

    function display(x){
        //window.UserScript.Notifications.notify('This is a notification', 'You got notified!', 'https://some-icon.png');
        if(hasAudio()){new Audio("https://sndup.net/t54x/d").play();}
        window.UserScript.Notifications.notify('Nowe zgłoszenia', x+' nowe/ych zgłoszeń!', 'https://cdn-icons-png.flaticon.com/512/471/471662.png');
    }

    function hasAudio() {
        return new Promise(function (resolve) {
            if (localStorage.getItem("HP-Audio") == 'true'){
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    }

    function hasNotify() {
        return new Promise(function (resolve) {
            if (localStorage.getItem("HP-Notify") == 'true'){
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    }

    function createLayout(){
        var layout = document.createElement('div');
        layout.style.position = "fixed";
        layout.style.top = '';
        layout.style.width = "100%";
        layout.style.height = "100%";
        layout.style.backgroundColor = "grey";
        layout.style.zIndex = "999999";
        layout.id = "layoutNotify";
        document.body.append(layout);
        var remLayout = document.createElement('div');
        remLayout.innerHTML = "Zamknij";
        remLayout.addEventListener("click",()=>{
            layout.style.top = '';
        });
        layout.prepend(remLayout);
    }

    function openLayout(){
        var layout = document.querySelector("#layoutNotify");
        layout.style.top = "0";
    }

    function przelacznik(xjson){
        var kotwica = document.querySelector("#page-heading > div");
        if(!document.querySelector("#kotwica")){
            var newElementDiv = document.createElement("div"),newElementLabel = document.createElement("label"),newElement = document.createElement("input");
            kotwica.append(newElementDiv);
            newElementDiv.style.marginLeft = "10px";
            newElementLabel.setAttribute("for","kotwica");
            newElementLabel.innerHTML = "Powiadomienia";
            newElementDiv.append(newElementLabel);
            newElement.type = "checkbox";
            newElement.id = "kotwica";
            newElement.name = "przelacznik";
            if(localStorage.getItem("HP-Notify") == 'true'){
                newElement.checked = true;
            }
            newElementDiv.prepend(newElement);
            newElement.addEventListener("click",()=>{
                localStorage.setItem("HP-Notify",newElement.checked);
            });
            var newAudioDiv = document.createElement("div");
            kotwica.append(newAudioDiv);
            newAudioDiv.style.marginLeft = "10px";
            var newAudioLabel = document.createElement("label");
            newAudioLabel.setAttribute("for","kAudio");
            newAudioLabel.innerHTML = "z dzwiękiem";
            newAudioDiv.append(newAudioLabel);
            var newAudio = document.createElement("input");
            newAudio.type = "checkbox";
            newAudio.id = "kAudio";
            newAudio.name = "Audio";
            if(localStorage.getItem("HP-Audio") == 'true'){
                newAudio.checked = true;
            }
            newAudio.addEventListener("click",()=>{
                localStorage.setItem("HP-Audio",newAudio.checked);
            });
            newAudioDiv.prepend(newAudio);

            var openLayoutButton = document.createElement('div');
            openLayoutButton.innerHTML = [`
            <a class="btn-icon" title="Otwórz layout"><i class="icon-hdicon-HD_all_Settings f-16"></i></a>
            `].join('');
            openLayoutButton.addEventListener("click",()=>{
                openLayout();
            });
            kotwica.append(openLayoutButton);

        }
        else {
            if(hasNotify()){
                check(xjson);
            }
        }
    }

    function check(xjson){
        var jsonResponse = JSON.parse(xjson.responseText);
        var x = 0;
        if(jsonResponse.items){
            jsonResponse.items.forEach((el)=>{
                if(el.assignee === null && el.status === "New" && sessionStorage.getItem(el.displayId)===null){
                    newAlertOnLayout(el);
                    sessionStorage.setItem(el.displayId,1);
                    x++;
                }
            });
        }
        if(x>0){
            display(x);
        }
    }

    const newAlertOnLayout = (xjson) => {
        let layout = document.querySelector("#layoutNotify");
        let wrapper = document.createElement("div");
        layout.append(wrapper);
        console.log(`${xjson.status}`);
    }

    (function(){
        //console.log("TEst");
        $(document).ready(()=> {
            var pStatus = localStorage.getItem("HP-Notify")??null;
            powiadomienie();
            createLayout();

        });
    })();


})();
