// ==UserScript==
// @name         Helpdesk / Powiadomienia windows
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Powiadomienia o nowych ticketach.
// @author       Dominik Banik dominik.banik@ekookna.pl
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

    function przelacznik(xjson){
        if(!document.querySelector("#kotwica")){
            var kotwica = document.querySelector("#page-heading > div"),newElementDiv = document.createElement("div"),newElementLabel = document.createElement("label"),newElement = document.createElement("input");
            kotwica.append(newElementDiv);
            newElementLabel.setAttribute("for","kotwica");
            newElementLabel.innerHTML = "Powiadomienia";
            newElementDiv.append(newElementLabel);
            newElement.type = "checkbox";
            newElement.id = "kotwica";
            newElement.name = "przelacznik";
            newElement.innerHTML = "Powiadomienia";
            if(localStorage.getItem("HP-Notify") == 'true'){
                newElement.checked = true;
            }
            newElementDiv.prepend(newElement);
            newElement.addEventListener("click",()=>{
                localStorage.setItem("HP-Notify",newElement.checked);
            });

        }
        else {
            var ofOn = document.querySelector("#kotwica").checked;
            if(ofOn){
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
                    sessionStorage.setItem(el.displayId,1);
                    x++;
                }
            });
        }
        if(x>0){
            display(x);
        }
    }

    (function(){
        //console.log("TEst");
        $(document).ready(()=> {
            var pStatus = localStorage.getItem("HP-Notify")??null;
            powiadomienie();
        });
    })();


})();
