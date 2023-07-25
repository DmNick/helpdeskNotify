// ==UserScript==
// @name         Helpdesk / Powiadomienia windows
// @namespace    Eko-okna
// @version      0.81
// @description  Powiadomienia o nowych ticketach.
// @author       Dominik Banik dominik.banik@ekookna.pl
// @downloadURL  https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/user.js
// @updateURL    https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/user.js
// @match        https://helpdesk/
// @require      https://greasyfork.org/scripts/438798-userscript-notification-framework/code/UserScript%20Notification%20Framework.js?version=1019652
// @require  	 https://code.jquery.com/jquery-3.7.0.min.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAiJJREFUOE+Vk11Ik2EUx//Pq9t4xbWl9MaimhuIXWREVwXShTg/sPAmGrMmU1sXejEoyA0aJoqWedtNYYmzxL5wlOUHSRdB3teFCG4xa1rhaJhaNnfC593z1sUu5nNzzv9/zvmdhwceRkQM/awKCkagQEG2U5AxdZmYysRtgNEA6mDFKzp2GXT4FqDfk5WRzZSm8sDoOVbTpR1F6SM9OQ+KxvywDowmQFunv+9qswDo3xjA6Alos35j19t3BuS3BSrgZ+0aB+Q9qsN242sNJnSVy4+95kKcKC9FoM2p1QunjSog6fjBTf3QKWx53msNQjsuBDDzsA/XegdRbDaio+087zGNm8HoPijRsMoNOVSBTfc7DSB0rfs6JkPqI1e6/JgdvcnzovFiMLoN+tb0lRvG0EmQwaQB2O8k1txzqPd0YmKoi/vO9j6M3QnwXHm5H4z6QcsX4+qVxiqRdM5qAKHPtnbhxWAn92uagpga7ua5ZeSACvjsWlKv9NSBxLkZDSB0g7cb4XtB+G7cxdEyK7yuGt5zcPQQ2K8gaKX1kwqYbkai+sE/QEY3+gbAGEN1xXEErzQjFovxHuvjErB1P2jFu8gNm83GYzQahcVigSzLiEQisNvt3CciXts5UmoDJeFyFfClZUHbmmtiXhzGvg89cQ5Y8sznOgcptQ5T7BmUj70AwxmW9IGkfHVeEt/1P1z6D6AT3xmAwciLcUi4hKs0+RdlXsVylWyVrQAAAABJRU5ErkJggg==
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
     //-webkit-animation-name: move;
     //-webkit-animation-duration: 10s;
     //-webkit-animation-iteration-count: infinite;
     //-webkit-animation-direction: up;
     //-webkit-animation-timing-function:linear;
    }

    .card > sup {
     margin: 10px 0;
    }

    .footerContent {
     margin-top: auto;
    }

    .widoczne {
     animation: move 1s ease-out;
     animation-fill-mode: forwards;
    }

    .niewidoczne {
     animation: moveOut 1s ease-out;
     animation-fill-mode: forwards;
    }

    .warning {
     animation: warningPulse 2s ease-out infinite;
    }

    @media screen and (max-width: 600px) {
     .column {
      width: 100%;
      display: block;
      margin-bottom: 20px;
     }
    }

    @-webkit-keyframes move {
     0% {
      top: 100%;
     }
     95% {
      top: -5%;
     }
     100% {
      top: 0;
     }
    }

    @-webkit-keyframes moveOut {
     0% {
      top: 0;
     }
     100% {
      top: 100%;
     }
    }

    @-webkit-keyframes warningPulse {
     0% {
      border: 10px solid red;
     }
     50% {
      border: 10px solid white;
     }
     100% {
      border: 10px solid red;
     }
    }
    `;

    function refreshList(){
        document.querySelector("[ng-click='getTickets()']").click();
    }

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

    function bezParagrafu(x){
        var xx = x.replaceAll('<p>',' ');
        xx = xx.replaceAll('</p>', ' ');
        xx = xx.replaceAll('</br>', ' ');
        xx = xx.replaceAll('<br>', ' ');
        xx = xx.replaceAll('<br/>', ' ');
        return xx;
    }

    const delAlertOnLayout = (el) => {
        let stary = $("#"+el+"");
        stary.slideUp(1000, function(){this.remove()});
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
          <h1>${xjson.subject} (${xjson.displayId})</h1>
          <h3>${bezParagrafu(xjson.description)}</h3>
          <h3>~${xjson.creatorUser.fullName}</h3>
          <h4 class="footerContent" data-cr="${Date.parse(xjson.creationDate)}">${minutes(new Date(xjson.creationDate))}</h4>
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
        $(wrapper).hide();
        wrapper.append(content);
        $(wrapper).slideDown(1000);
        //console.log(bezParagrafu(xjson.description));
    }

    function powiadomienie() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            this.addEventListener('load', function() {
                if(url.indexOf("tickets?") > -1){
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
            if(parseInt(Math.abs(Date.parse(new Date()) - staraData)/1000/60)>15){
                el.closest(".card").classList.add("warning");
            }
        });
    }

    function display(x){
        if(hasNotify()===true){window.UserScript.Notifications.notify('Nowe zgłoszenia', x+' nowe/ych zgłoszeń!', 'https://dmnick.ovh/h/icon.png');}
        if(hasAudio()===true){
            //new Audio("https://sndup.net/t54x/d").play();
            new Audio("https://dmnick.ovh/h/alert.mp3").play();
        }
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

    function refresh10s(){
        if(document.querySelector(".widoczne")){
            refreshList();
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
            //layout.style.top = '';
            layout.classList.remove("widoczne");
            layout.classList.add("niewidoczne");
        });
        layout.prepend(remLayout);

        var f5Layout = document.createElement('span');
        f5Layout.innerHTML = "Odśwież";
        f5Layout.style.margin = "0 10px";
        f5Layout.addEventListener("click",()=>{
            refreshList();
        });
        //f5Layout.innerHTML = [`<a class="flex-a-center pl-2 btn-icon" ng-click="getTickets()" title="Odśwież teraz"><i class="icon-hdicon-HD_all_Reload f-18" aria-hidden="true"></i></a>`].join('');
        layout.prepend(f5Layout);

        var row = document.createElement('div');
        row.classList = "row";
        layout.append(row);
    }

    function openLayout(){
        var layout = document.querySelector("#layoutNotify");
        //layout.style.top = "0";
        layout.classList.remove("niewidoczne");
        layout.classList.add("widoczne");
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
                    if(staryArray.includes(el.displayId)===false){
                        newAlertOnLayout(el);
                        x++;
                        console.log("dodano: "+el.displayId);
                    }
                    nowyArray.push(el.displayId);
                }
        //         else {
        //             if(nowyArray.includes(el.displayId)===false && staryArray.includes(el.displayId)){
        //                 delAlertOnLayout(el.displayId);
        //                 console.log("usunięto: "+el.displayId);
        //             }
        //         }
            });
        }
        sessionStorage.setItem("HP-aktywne", JSON.stringify(nowyArray));
        staryArray.forEach((el,index)=>{console.log(index+"stary: "+el);
                                //console.log(nowyArray.includes(el));
                                if(nowyArray.includes(el)===false){delAlertOnLayout(el);console.log("usunięto: "+el);}
                               });
        //nowyArray.forEach((el,index)=>{console.log(index+"nowy "+el);
        //                       //console.log(staryArray.includes(el));
        //                        if(staryArray.includes(el)===false){console.log("dodano: "+el);}
        //                      });
        if(staryArray.length != nowyArray.length){console.log("Różnica!!!");}
        console.log("Ostatni refresh: "+new Date());

        if(x>0){
            display(x);
        }
    }



    (function(){
        $(document).ready(()=> {
            powiadomienie();
            createLayout();
            sessionStorage.clear("HP-aktywne");
            setInterval(refresh10s, 10000);
        });
    })();


})();
