// ==UserScript==
// @name         Helpdesk / Powiadomienia windows
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Powiadomienia o nowych ticketach.
// @author       Dominik Banik dominik.banik@ekookna.pl
// @downloadURL  https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/user.js
// @updateURL    https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/user.js
// @match        https://helpdesk/
// @require      https://greasyfork.org/scripts/438798-userscript-notification-framework/code/UserScript%20Notification%20Framework.js?version=1019652
// @require  	 https://code.jquery.com/jquery-3.7.0.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.helpdesk
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    var styleElem = document.head.appendChild(document.createElement("style"));

    styleElem.innerHTML = `
    .row {margin: 0px;}

    .row:after {
     content: "";
     display: table;
     clear: both;
    }

    .column {
     float: left;
     width: 25%;
     padding: 10px 20px;
    }

    .card {
     box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
     padding: 16px;
     text-align: center;
     background-color: #f1f1f1;
     color:black;
     height:400px;
     max-height:400px;
     overflow-y:auto;
    }

    .card > sup {
     margin: 10px 0;
    }

    .footerContent {
     margin-top: auto;
    }

    @media screen and (max-width: 600px) {
     .column {
      width: 100%;
      display: block;
      margin-bottom: 20px;
     }
    }
    `;

    function minutes(el){
        let currDate = new Date();
        let totalSekund = Math.abs(currDate-el)/1000;
        let totalMinut = parseInt(totalSekund/60);
        let totalGodzin = Math.floor(totalMinut/60);
        let godzin = totalMinut % 60;
        if(totalGodzin>0){
            return totalGodzin+" godzin/y "+godzin+" minut temu";
        }
        else {
            return totalMinut+" minut temu";
        }
    }

    function powiadomienie() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            this.addEventListener('load', function() {
                if(url.indexOf("tickets") > -1){
                    if (this.readyState == 4) {
                        if (this.status == 200){
                            check(this);
                            przelacznik();
                            refreshZegary();
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

    function refreshZegary(){
        document.querySelectorAll(".footerContent").forEach((el) => {
            let staraData = el.getAttribute("data-cr");
            el.innerHTML = minutes(staraData);
        });
    }

    function display(x){
        //window.UserScript.Notifications.notify('This is a notification', 'You got notified!', 'https://some-icon.png');
        if(hasNotify()===true){window.UserScript.Notifications.notify('Nowe zgłoszenia', x+' nowe/ych zgłoszeń!', 'https://cdn-icons-png.flaticon.com/512/471/471662.png');}
        if(hasAudio()===true){new Audio("https://sndup.net/t54x/d").play();}
    }

    function hasAudio() {
            if (localStorage.getItem("HP-Audio") == 'true'){
                return(true);
            }
            else {
                return(false);
            }
    }

    function hasNotify() {
            if (localStorage.getItem("HP-Notify") == 'true'){
                return(true);
            }
            else {
                return(false);
            }
    }

    function hasAktywne() {
            if (localStorage.getItem("HP-aktywne") == 'true'){
                return(true);
            }
            else {
                return(false);
            }
    }

    function createLayout(){
        var layout = document.createElement('div');
        layout.style.position = "fixed";
        layout.style.top = '';
        layout.style.width = "100%";
        layout.style.height = "100%";
        layout.style.backgroundColor = "grey";
        layout.style.zIndex = "999999";
        layout.style.overflowY = "auto";
        layout.id = "layoutNotify";
        document.body.append(layout);
        var remLayout = document.createElement('span');
        remLayout.innerHTML = "Zamknij";
        remLayout.addEventListener("click",()=>{
            layout.style.top = '';
        });
        layout.prepend(remLayout);

        var f5Layout = document.createElement('span');
        f5Layout.innerHTML = "Odśwież";
        f5Layout.style.margin = "0 10px";
        f5Layout.setAttribute("ng-click","getTickets()");
        f5Layout.addEventListener("click",()=>{
            document.querySelector("[ng-click='getTickets()']").click();
        });
        //f5Layout.innerHTML = [`<a class="flex-a-center pl-2 btn-icon" ng-click="getTickets()" title="Odśwież teraz"><i class="icon-hdicon-HD_all_Reload f-18" aria-hidden="true"></i></a>`].join('');
        layout.prepend(f5Layout);

        var row = document.createElement('div');
        row.classList = "row";
        layout.append(row);
    }

    function openLayout(){
        var layout = document.querySelector("#layoutNotify");
        layout.style.top = "0";
    }

    function przelacznik(){
        var kotwica = document.querySelector("#page-heading > div");
        if(!document.querySelector("#kotwica") && kotwica){
            console.log("wczytano przelacznik");
            var newElementDiv = document.createElement("div"),newElementLabel = document.createElement("label"),newElement = document.createElement("input");
            kotwica.append(newElementDiv);
            newElementDiv.style.marginLeft = "10px";
            newElementLabel.setAttribute("for","kotwica");
            newElementLabel.innerHTML = "Notify";
            newElementDiv.append(newElementLabel);
            newElement.type = "checkbox";
            newElement.id = "kotwica";
            newElement.name = "przelacznik";
            if(hasNotify()===true){
                newElement.checked = true;
            }
            newElementDiv.prepend(newElement);
            newElement.addEventListener("click",()=>{
                localStorage.setItem("HP-Notify",newElement.checked);
                console.log("localStorage('HP-Notify'): "+localStorage.getItem("HP-Notify"));
                console.log("newElement.checked: "+newElement.checked);
            });
            var newAudioDiv = document.createElement("div");
            kotwica.append(newAudioDiv);
            newAudioDiv.style.marginLeft = "10px";
            var newAudioLabel = document.createElement("label");
            newAudioLabel.setAttribute("for","kAudio");
            newAudioLabel.innerHTML = "Audio";
            newAudioDiv.append(newAudioLabel);
            var newAudio = document.createElement("input");
            newAudio.type = "checkbox";
            newAudio.id = "kAudio";
            newAudio.name = "Audio";
            if(hasAudio()){
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
    }

    function check(xjson){
        var jsonResponse = JSON.parse(xjson.responseText);
        var x = 0;
        var nowyArray = [];

        var staryArray = JSON.parse(sessionStorage.getItem("HP-aktywne"))??[];
        if(jsonResponse.items){
            jsonResponse.items.forEach((el)=>{
                if( el.assignee === null && el.status === "New" /* && sessionStorage.getItem(el.displayId)===null*/){
                    if(staryArray.includes(el.displayId)===false){newAlertOnLayout(el);x++;}


                    //console.log(el);
                    //let data = new Date.parse(el.creationDate).toString();
                    //console.log(minutes(new Date(el.creationDate)));
                    sessionStorage.setItem(el.displayId,1);
                    nowyArray.push(el.displayId);
                }
            });
        }
        sessionStorage.setItem("HP-aktywne", JSON.stringify(nowyArray));
        staryArray.forEach((el,index)=>{console.log(index+"stary: "+el);
                                console.log(nowyArray.includes(el));
                                if(nowyArray.includes(el)===false){$("#"+el+"").remove();console.log("usunięto: "+el);}
                               });
        nowyArray.forEach((el,index)=>{console.log(index+"nowy "+el);
                               console.log(staryArray.includes(el));
                                if(staryArray.includes(el)===false){console.log("dodano: "+el);}
                              });
        if(staryArray.length != nowyArray.length){console.log("Różnica!!!");}
        //console.log(staryArray.every(v=>nowyArray.includes(v)));
        if(x>0){
            display(x);
        }
    }

    const newAlertOnLayout = (xjson) => {
        let layout = document.querySelector("#layoutNotify > .row");
        let wrapper = document.createElement("div");
        wrapper.classList = "column";
        wrapper.id = xjson.displayId;
        layout.append(wrapper);
        let content = document.createElement("div");
        content.className = "card";
        content.style.display = "flex";
        content.style.flexDirection = "column";
        content.innerHTML = [`
          <sup>${xjson.status} - ${xjson.category.name} - ${xjson.priority.name}</sup>
          <h3>${xjson.subject} (${xjson.displayId})</h3>
          <p>${xjson.description}</p>
          <p>~${xjson.creatorUser.fullName}</p>
          <sub class="footerContent" data-cr="${Date.parse(xjson.creationDate)}">${minutes(new Date(xjson.creationDate))}</sub>
        `].join('');
        switch(xjson.priority.name){
                case('Niski'):
                content.style.backgroundColor = "lightgreen";
                break;
                case('Wysoki'):
                content.style.backgroundColor = "indianred";
                break;
                case('Krytyczny'):
                content.style.backgroundColor = "red";
                break;
                case('Bloker'):
                content.style.backgroundColor = "black";
                content.style.color = "white";
                content.style.border = "10px solid red;";
                break;
        }
        //$(wrapper).hide();
        wrapper.append(content);
        //$(wrapper).show();
        //console.log(`${xjson.status}`);
    }

    (function(){
        //console.log("TEst");
        $(document).ready(()=> {
            var pStatus = localStorage.getItem("HP-Notify")??null;
            powiadomienie();
            createLayout();
            sessionStorage.clear("HP-aktywne");
        });
    })();


})();
