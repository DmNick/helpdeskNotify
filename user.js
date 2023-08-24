// ==UserScript==
// @name         Helpdesk / Powiadomienia windows
// @namespace    Eko-okna
// @version      0.98.5
// @description  Powiadomienia o nowych ticketach.
// @author       Dominik Banik dominik.banik@ekookna.pl
// @downloadURL  https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/user.js
// @updateURL    https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/user.js
// @match        https://helpdesk/
// @require  	 https://code.jquery.com/jquery-3.7.0.min.js
// @require      https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/notifications.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/printThis/1.15.0/printThis.js
// @require      https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAiJJREFUOE+Vk11Ik2EUx//Pq9t4xbWl9MaimhuIXWREVwXShTg/sPAmGrMmU1sXejEoyA0aJoqWedtNYYmzxL5wlOUHSRdB3teFCG4xa1rhaJhaNnfC593z1sUu5nNzzv9/zvmdhwceRkQM/awKCkagQEG2U5AxdZmYysRtgNEA6mDFKzp2GXT4FqDfk5WRzZSm8sDoOVbTpR1F6SM9OQ+KxvywDowmQFunv+9qswDo3xjA6Alos35j19t3BuS3BSrgZ+0aB+Q9qsN242sNJnSVy4+95kKcKC9FoM2p1QunjSog6fjBTf3QKWx53msNQjsuBDDzsA/XegdRbDaio+087zGNm8HoPijRsMoNOVSBTfc7DSB0rfs6JkPqI1e6/JgdvcnzovFiMLoN+tb0lRvG0EmQwaQB2O8k1txzqPd0YmKoi/vO9j6M3QnwXHm5H4z6QcsX4+qVxiqRdM5qAKHPtnbhxWAn92uagpga7ua5ZeSACvjsWlKv9NSBxLkZDSB0g7cb4XtB+G7cxdEyK7yuGt5zcPQQ2K8gaKX1kwqYbkai+sE/QEY3+gbAGEN1xXEErzQjFovxHuvjErB1P2jFu8gNm83GYzQahcVigSzLiEQisNvt3CciXts5UmoDJeFyFfClZUHbmmtiXhzGvg89cQ5Y8sznOgcptQ5T7BmUj70AwxmW9IGkfHVeEt/1P1z6D6AT3xmAwciLcUi4hKs0+RdlXsVylWyVrQAAAABJRU5ErkJggg==
// @resource     IMPORTED_CSS https://cdn.jsdelivr.net/npm/@sweetalert2/theme-dark@4/dark.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* global $ */

(function() {
    'use strict';

    const my_css = GM_getResourceText("IMPORTED_CSS");
    GM_addStyle(my_css);

    var styleElem = document.head.appendChild(document.createElement("style"));

    styleElem.innerHTML = `
    #toast-container {
     z-index: 999!important;
    }

    @font-face {
     font-family: diabloFont;
     src: url('https://dmnick.ovh/h/DiabloHeavy.ttf');
    }

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

    #layoutNotify {
     position: fixed;
     top: 100%;
     width: 100%;
     height: 100%;
     background-color: grey;
     z-index: 1000;
     overflow-y: auto;
    }

    #layoutSettings {
     position: fixed;
     top: 100%;
     max-width: 500px;
     margin: 10% auto;
     padding: 20px;
     left: 0;
     right: 0;
     min-height: 100px;
     background-color: grey;
     color: black;
     z-index: 999;
     overflow-y: auto;
     border-radius: 5px;
    }

    #layoutSettings > button {
     color:black;
    }

    [ng-model='ticket.description'] > p > span {
     color: #c6d0dc!important;
    }

    .theme-dark [ng-model='ticket.description'] * {
     color: #c6d0dc!important;
    }

    #dzwieki > div > label {
     width:200px;
    }

    .ticket-description {
     max-height:400px;
    }

    #footer {
     display:none;
    }

    .container {
     margin-bottom: 0;
    }

    #naklejka {
        display: flex;
        width: 150mm;
        height: 35mm;
        font-size: 18px;
        /*font-family: diabloFont;*/
        flex-wrap: wrap;
        align-content: flex-end;
        align-items: flex-end;
        margin: 0;
        padding: 10px;
        font-weight:bold;
        box-sizing: border-box;
        position: absolute;
        z-index: -1;
    }

    #details-additional-fields {
     text-align: -webkit-center;
    }

    .printNazwa {
     overflow: hidden;
     display: -webkit-box;
     -webkit-line-clamp: 2;
     line-clamp: 2;
     -webkit-box-orient: vertical;
    }

    .printOpis, .printPodpis {
     overflow: hidden;
     display: -webkit-box;
     -webkit-line-clamp: 1;
     line-clamp: 1;
     -webkit-box-orient: vertical;
    }

    #details-additional-fields input, .form-select {
     margin: 5px 5px;
     border-radius: 5px;
     border:1px;
     border-color: var(--primary-border-color);
     padding:5px;
     background-color:var(--input-background);
     color:var(--secondary-font-color);
    }

    #details-additional-fields input::placeholder {
     color:white;
     opacity: 0.8;
    }

    #details-additional-fieldsinput:focus{
     outline: none;
     outline-style: none;
    }

    .select2 {
     width:250px;
     margin: 0 10px;
    }

    .foo {
     font-size:small;
     color:grey;
     max-height:30px;
     overflow-y:hidden;
    }

    @page {
        size: auto;
        /* auto is the initial value */
        margin: 0mm;
        /* this affects the margin in the printer settings */
    }

    @media print {

        html,
        body {
            margin: 0;
            size: auto;
            size: landscape;
            /* size: 100mm 35mm;*/
        }
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
      //border: 10px solid red;
      background-color: red;
     }
     50% {
      //border: 10px solid white;
      background-color: white;
      color:black;
     }
     100% {
      //border: 10px solid red;
      background-color: red;
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
        let text = document.createElement("div");
        text.innerHTML = x;
        return text.innerText;
    }

    const ifLoaded = async (div) => {
        var x = 0;
        var tid = await setInterval(()=>{
            //console.log("wczytywanie "+div);
            if ($(div).length == 1) {
                functionToLoad();
            }
            if (x > 40){
                returnFalse();
                console.log("Przekroczono limit czasu: "+ div);
            }
            x++;
        }, 500);

        function functionToLoad(){
            clearInterval(tid);
            //console.log("wczytano "+div);
            return (true);
        }

        function returnFalse(){
            clearInterval(tid);
            return false;
        }
    }

    function audioAlert(type){
        let linkMp3 = 'https://dmnick.ovh/h/alert.mp3';
        let linkMp3Awaria = 'https://dmnick.ovh/h/awaria.mp3';
        let linkMp3Przypomnienie = 'https://dmnick.ovh/h/widziszmnie.mp3';
        let HPAudioNiski = localStorage.getItem("HP-AudioNiski")??null;
        let HPAudioWysoki = localStorage.getItem("HP-AudioWysoki")??null;
        let HPAudioKrytyczny = localStorage.getItem("HP-AudioKrytyczny")??null;
        let HPAudioBloker = localStorage.getItem("HP-AudioBloker")??null;
        let HPAudioAwaria = localStorage.getItem("HP-AudioAwaria")??null;
        switch(type){
            case('Niski'):
                if(HPAudioNiski && HPAudioNiski !== ''){
                    linkMp3 = HPAudioNiski;
                }
                break;
            case('Wysoki'):
                if(HPAudioWysoki && HPAudioWysoki !== ''){
                    linkMp3 = HPAudioWysoki;
                }
                break;
            case('Krytyczny'):
                if(HPAudioKrytyczny && HPAudioKrytyczny !== ''){
                    linkMp3 = HPAudioKrytyczny;
                }
                break;
            case('Bloker'):
                if(HPAudioBloker && HPAudioBloker !== ''){
                    linkMp3 = HPAudioBloker;
                }
                break;
            case('awaria'):
                if(HPAudioAwaria && HPAudioAwaria !== ''){
                    linkMp3 = HPAudioAwaria;
                }
                else {
                    linkMp3 = linkMp3Awaria;
                }
                break;
            case('przypomnienie30min'):
                linkMp3 = linkMp3Przypomnienie;
                break;
            default:
                break;
        }
        try {
            var audio = new Audio();
            audio.src = linkMp3;

            audio.onerror = function () {
                alert("Niewspierany format: "
                      + this.error.message);
            }
            audio.play();
        }
        catch(e) {
            console.log("błąd przy odtwarzaniu: "+e);
        }
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

    function zamknijZgloszenie(){
        try {


            ifLoaded("[ng-model='workingTime.disabled']").then(()=>{
                $("[ng-model='workingTime.disabled']").click();
            });
        }
        catch (e) {
            console.log(e);
        }
    }

    function dodajIZakoncz(){
        let panel = $(".upload-files > .actions");
        ifLoaded("[ng-click='addComment()']").then(() => {
            if(!document.querySelector(".dodajIZakoncz")){
                let button = document.createElement("div");
                button.classList = 'btn btn-info dodajIZakoncz';
                button.innerHTML = "Dodaj i zakończ";
                button.style.padding = "8px 20px";
                button.style.fontSize = "13px";
                button.style.fontWeight = "600";
                panel.prepend(button);
                //button.preventDefault();
                button.addEventListener('click',(el) => {
                    el.preventDefault()
                    let wew = document.querySelector("#wrap [ng-model='comment.isInternal']").checked;
                    let txt = $("[name='editor'] div[ta-bind='ta-bind']").html();
                    const cb = $("#wrap [ng-model='comment.isInternal']")[0];
                    const editorTxt = $("[name='close-ticket-editor'] div[ta-bind='ta-bind']");
                    const editorCb = $("[name='workTimeForm'] [ng-model='comment.isInternal']");
                    if(txt == '<p><br></p>'){txt = ''}
                    //console.log(wew);
                    //console.log(txt);
                    $("[ax-select-change='setStatus()'] select")[0].selectedIndex = $("[ax-select-change='setStatus()'] select")[0].length-1;
                    document.querySelector("[ax-select-change='setStatus()'] select").dispatchEvent(new Event('change'));

                    var tid = setInterval(()=>{
                        //console.log("wczytywanie");
                        var elementExist = $("[name='close-ticket-editor'] div[ta-bind='ta-bind']");
                        if (elementExist.length == 1) {
                            functionToLoad();
                        }
                    }, 500);

                    function functionToLoad(){
                        clearInterval(tid);
                        //console.log("wczytano checkbox");
                        $("[ng-model='workingTime.disabled']").click();
                        document.querySelector("[name='close-ticket-editor'] div[ta-bind='ta-bind']").innerHTML = txt;
                        document.querySelector("[name='close-ticket-editor'] div[ta-bind='ta-bind']").dispatchEvent(new Event('blur'));
                        //if(cb.checked){editorCb.checked = true}
                        console.log(cb.checked);
                        console.log($("[name='workTimeForm'] [ng-model='comment.isInternal']").checked);
                    }

                    zamknijZgloszenie();

                    //ifLoaded("[ng-model='workingTime.disabled']").then(()=>{$("[ng-model='workingTime.disabled']").checked = true;});

                });
            }
        });

    }

    function WylaczWewnetrzneOdp(){
        ifLoaded("[ng-model='comment.isInternal']").then(()=>{
            //console.log("wczytano slider");
            if(document.querySelector("[ng-model='comment.isInternal']").checked == true){
                document.querySelector("[ng-model='comment.isInternal']").click();
            };
        });
    }

    function insertZalacznik(e){
        GM.xmlHttpRequest({
            method: "GET",
            url: ""+e+"",
            responseType: "blob",
            onload: function(resp) {
                //console.log(resp);
                const arr = resp.responseHeaders.trim().split(/[\r\n]+/);
                const headerMap = {};
                arr.forEach((line) => {
                    const parts = line.split(": ");
                    const header = parts.shift();
                    const value = parts.join(": ");
                    headerMap[header] = value;
                });
                //console.log(headerMap);
                const nazwaArr = resp.finalUrl.trim().split("/");
                let fileName = nazwaArr[nazwaArr.length-1].toLowerCase();
                //let fileName = 'przekierowanie.gif'
                let file = new File([resp.response], fileName,{type:headerMap['content-type'], lastModified:new Date().getTime()}, 'utf-8');
                let container = new DataTransfer();
                container.items.add(file);
                document.querySelector("input[ngf-select='upload($files)']").files = container.files;
                //console.log(container.files);
                var event = new Event('change');
                document.querySelector("input[ngf-select='upload($files)']").dispatchEvent(event);
            }
        });
    }

    function wczytajSzablony(){
        //$(document.body).append($('<div/>', { id: 'licznikSzablony', html: '0'}));
        ifLoaded("#details-additional-fields").then(()=>{
            if(!document.querySelector("#selectSzablony")){
                let commentBar = document.querySelector("#wrap .upload-files div.actions");
                let selectSzablony = document.createElement("span");
                commentBar.prepend(selectSzablony);
                selectSzablony.id = "selectSzablony";
                selectSzablony.innerHTML = [
                    `<select class="form-select form-select-sm select2" aria-label=".form-select-sm example">`,
                    `<option></option>`,
                    `<option value="0" title="Czyści zawartość pola" data-bs-toggle="tooltip" data-bs-html="true" title="<em>Tooltip</em> <u>with</u> <b>HTML</b>">Wyczyść</option>`,
                    `</select>`
                ].join(',');
                //console.log(document.querySelectorAll("#selectSzablony select option"));

                //$.getJSON('https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/szablony.json',(e)=>{
                    //console.log(e.szablony);
                //    e.szablony.forEach((el,index) => {
                        //console.log(el);
                //        $( "<option/>", {"class": "my-new-list",html: el.nazwa, title: el.value, attr: {"data-gif":el.gif??""}}).appendTo( ".form-select" );
                //    });
                //});
                let linkSzablony = "https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/szablony.json";
                if(localStorage.getItem("HP-Szablony") && localStorage.getItem("HP-Szablony") !== ''){
                    linkSzablony = localStorage.getItem("HP-Szablony");
                }

                $.ajax({
                    cache: false,
                    url: linkSzablony,
                    dataType: "json",
                    success: function(e) {
                        e.szablony.forEach((el,index) => {
                            $( "<option/>", {"class": "my-new-list",html: el.nazwa, title: el.value, attr: {"data-gif":el.zalacznik??""}}).appendTo( ".form-select" );
                        });
                    },
                    error: function (er) {
                        alert("błąd przy wczytywaniu szablonu: "+er.responseText);
                        console.log(er);
                    }
                });

                function formatCustom(state) {
                    if($(state.element).attr('data-gif') && $(state.element).attr('data-gif') !== ''){
                        return $(
                            '<div><div>' + state.text + ' <span class="badge bg-primary rounded-pill">GIF</span></div><div class="foo">'
                            + $(state.element).attr('title')
                            + '</div></div>'
                        );
                    } else {
                        return $(
                            '<div><div>' + state.text + '</div><div class="foo">'
                            + $(state.element).attr('title')
                            + '</div></div>'
                        );
                    }
                }

                $("#selectSzablony select").on("change",(el,index) => {
                    var e = el.target;
                    var wybor = e.options[e.selectedIndex].text;
                    let cb = $("#wrap [ng-model='comment.isInternal']")[0];
                    let tekst = $("[name='editor'] div[ta-bind='ta-bind']").html();
                    let dataGif = e.options[e.selectedIndex].getAttribute('data-gif');
                    if(tekst == '<p><br></p>'){tekst=''}
                    switch(wybor){
                        case('Wyczyść'):
                            $("[name='editor'] div[ta-bind='ta-bind']").html('<p><br></p>');
                            $("[ng-click='removeFile(f)']").click();
                            document.querySelector("[name='editor'] div[ta-bind='ta-bind']").dispatchEvent(new Event('blur'));
                            break;
                        default:
                            if(cb.checked == true){cb.click()}
                            $("[name='editor'] div[ta-bind='ta-bind']").html(tekst+"<p>"+e.options[e.selectedIndex].title+"</p>");
                            document.querySelector("[name='editor'] div[ta-bind='ta-bind']").dispatchEvent(new Event('blur'));
                            if(dataGif && dataGif !== '' && dataGif !== null){
                                //console.log(dataGif);
                                insertZalacznik(dataGif);
                            };
                            break;
                    }
                    $("#selectSzablony select")[0].selectedIndex = 0;
                });
                $(document).ready(function() {
                    $('.form-select').select2({
                        placeholder: 'Szablony',
                        //allowClear: true
                        templateResult: formatCustom
                    });
                });
            }
        });
    }

    function powiadomienie() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            this.addEventListener('load', function() {
                if(url.indexOf("tickets?") > -1 && window.location.href.split('?')[0] == 'https://helpdesk/#/helpdesk'){
                    if (this.readyState == 4) {
                        if (this.status == 200){
                            check(this);
                            przelacznik();
                            refreshZegary();
                        }
                    };
                }
                if(url.indexOf("tickets/") > -1 && this.responseURL.split("/").length == '6' && window.location.href.indexOf('helpdesk/details/') > -1){
                    if (this.readyState == 4) {
                        if (this.status == 200){
                            //console.log(this.responseURL.split("/"));
                            //console.log(this);
                            if(hasPrintLayout()){printLayout(this)};
                            wczytajSzablony();
                            dodajIZakoncz();
                            if(hasWylaczWewnetrzneOdp()){WylaczWewnetrzneOdp()};
                        }
                    }
                }
            });

            this.addEventListener('error', function() {
                console.log('XHR errored out', method, url);
            });
            origOpen.apply(this, arguments);
        };
    };

    function printLayout(el){
        let resp = JSON.parse(el.response);
        let opis = document.querySelector("#details-additional-fields");
        var tid = setInterval(()=>{
            //console.log("wczytywanie");
            var elementExist = $('#details-additional-fields');
            if (elementExist.length == 1) {
                functionToLoad();
            }
        }, 500);

        function functionToLoad(){
            clearInterval(tid);
            //console.log("wczytano");
            //console.log(document.querySelector("#details-additional-fields"));
            //console.log(resp);
            //console.log(JSON.parse(resp.customFields).fields);
            let tab = [];
            document.querySelectorAll(".details-additional-fields__item").forEach(el=>{
                tab[el.firstElementChild.innerText] = el.lastElementChild.innerText;
            });
            //console.log(tab);
            if(tab["Lokalizacja:"]){tab["Miejsce pracy:"] = tab["Lokalizacja:"]}
            if(tab["Nr kontaktowy:"]){tab["Numer kontaktowy:"] = tab["Nr kontaktowy:"]}
            if(!tab["Miejsce pracy:"] && !document.querySelector("#Miejsce\\ pracy\\:")){
                let div = document.createElement("div");
                let input = document.createElement("input");
                input.id = "Miejsce pracy:";
                input.autocomplete = "off";
                input.placeholder = "Miejsce pracy";
                input.addEventListener('keyup',(el)=>{
                    document.querySelectorAll(".printOpisMP")[0].innerHTML = el.target.value;
                });
                document.querySelector("#details-additional-fields").append(div);
                div.append(input);
            }

            if(!tab["Numer pomieszczenia:"] && !document.querySelector("#Numer\\ pomieszczenia\\:")){
                let div = document.createElement("div");
                let input = document.createElement("input");
                input.id = "Numer pomieszczenia:";
                input.autocomplete = "off";
                input.placeholder = "Numer pomieszczenia";
                input.addEventListener('keyup',(el)=>{
                    document.querySelectorAll(".printOpisNP")[0].innerHTML = " | "+el.target.value;
                });
                document.querySelector("#details-additional-fields").append(div);
                div.append(input);
            }

            if(!tab["Numer kontaktowy:"] && !document.querySelector("#Numer\\ kontaktowy\\:")){
                let div = document.createElement("div");
                let input = document.createElement("input");
                input.id = "Numer kontaktowy:";
                input.autocomplete = "off";
                input.placeholder = "Numer kontaktowy";
                input.addEventListener('keyup',(el)=>{
                    document.querySelectorAll(".printOpisNK")[0].innerHTML = " | "+el.target.value;
                });
                document.querySelector("#details-additional-fields").append(div);
                div.append(input);
            }

            if(document.querySelector("#naklejka")){
                let naklejka = document.querySelector("#naklejka");
                let printButton = document.querySelector("#printButton");
            }
            else {
                let naklejka = document.createElement("div");
                document.querySelector("[ng-model='ticket.description']").append(naklejka);
                naklejka.id = 'naklejka';
                naklejka.style.display = "block";
                naklejka.style.width = "150mm";
                naklejka.style.height = "35mm";
                naklejka.style.fontSize = "30px";
                let printButton = document.createElement("button");
                printButton.id = "printButton";
                printButton.style.color = "#000";
                printButton.innerHTML = "Drukuj";
                document.querySelector("#details-additional-fields").append(document.createElement("br"));
                document.querySelector("#details-additional-fields").append(printButton);

                printButton.addEventListener('click',(el)=>{
                //console.log(el.target);
                /*Print(naklejka, {
                    onStart: function() {
                        //console.log('onStart', new Date())
                    },
                    onEnd: function() {
                        //console.log('onEnd', new Date())
                    }
                })*/
                //printJS('naklejka', 'html');
                $(naklejka).printThis({
                    importCSS: true,
                    importStyle: true
                });
            });
            }
            let naklejka = document.querySelector("#naklejka");
            let printButton = document.querySelector("#printButton");
            printButton.classList = "btn btn-default";
            printButton.style.color = "var(--primary-button-background)";
            naklejka.innerHTML = `
            <div class="printNazwa">#${resp.displayId} ${resp.subject}</div>
            <div class="printOpis"><span class="printOpisMP">${tab["Miejsce pracy:"]??''}</span> <span class="printOpisNP">${tab["Numer pomieszczenia:"]??''}</span> <span class="printOpisNK">${tab["Numer kontaktowy:"]??''}<span></div>
            <div class="printPodpis">${resp.requester.fullName}</div>
            `;
            //$('#printButton').replaceWith($('#printButton').clone());

        }
    }

    function createPrintLayout(resp){

    }

    function refreshZegary(){
        document.querySelectorAll(".footerContent").forEach((el) => {
            let staraData = el.getAttribute("data-cr");
            el.innerHTML = minutes(staraData);
            let minuty = parseInt(Math.abs(Date.parse(new Date()) - staraData)/1000/60);
            if(minuty>15 && minuty <30){
                el.closest(".card").style.backgroundColor = "orange";
            } else if (minuty>30){
                if(!el.closest(".card").classList.contains("warning") && hasAudio()===true){
                    console.log("przypomnienie");
                    audioAlert('przypomnienie30min');
                }
                el.closest(".card").classList.add("warning");
            }
        });
    }

    function display(x,type){
        if(hasNotify()===true){window.UserScript.Notifications.notify('Nowe zgłoszenia', x+' nowe/ych zgłoszeń!', 'https://dmnick.ovh/h/icon.png');}
        if(hasAudio()===true){
            audioAlert(type);

            //new Audio("https://sndup.net/t54x/d").play();
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

    function hasPrintLayout() {
            if (localStorage.getItem("HP-PrintLayout") == 'true'){
                return(true);
            }
            else {
                return(false);
            }
    }

    function hasWylaczWewnetrzneOdp() {
            if (localStorage.getItem("HP-WylaczWewnetrzneOdp") == 'true'){
                return(true);
            }
            else {
                return(false);
            }
    }

    function refresh10s(){
        if(document.querySelector("#layoutNotify.widoczne")){
            refreshList();
        }
    }

    function createLayout(){
        var layout = document.createElement('div');
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

    function saveSettings(){
        Swal.fire({
            position: 'top-center',
            icon: 'success',
            title: 'Zapisano ustawienia',
            showConfirmButton: false,
            timer: 1500
        })
    }

    function createSettings(){
        var settings = document.createElement("div");
        settings.id = "layoutSettings";
        settings.innerHMTL = "Ustawienia";
        document.body.append(settings);

        var dzwieki = document.createElement('div');
        dzwieki.id = "dzwieki";
        settings.prepend(dzwieki);
        dzwieki.innerHTML = `<div><label for="HP-AudioNiski">Niski priorytet: </label><input class="audio" type="text" placeholder="podaj link do .mp3" id="HP-AudioNiski" /><button class="testMp3">Test</button></div>
        <div><label for="HP-AudioWysoki">Wysoki priorytet: </label><input class="audio" type="text" placeholder="podaj link do .mp3" id="HP-AudioWysoki" /><button class="testMp3">Test</button></div>
        <div><label for="HP-AudioKrytyczny">Krytyczny priorytet: </label><input class="audio" type="text" placeholder="podaj link do .mp3" id="HP-AudioKrytyczny" /><button class="testMp3">Test</button></div>
        <div><label for="HP-AudioBloker">Bloker priorytet: </label><input class="audio" type="text" placeholder="podaj link do .mp3" id="HP-AudioBloker" /><button class="testMp3">Test</button></div>
        <div><label for="HP-AudioAwaria">Awaria: </label><input class="audio" type="text" placeholder="podaj link do .mp3" id="HP-AudioAwaria" /><button class="testMp3">Test</button></div>
        <div><label for="HP-OpenLayout" title="Automatycznie uruchamia layout przy odswieżeniu strony">Auto uruchom layout: </label><input class="cbox" type="checkbox" id="HP-OpenLayout" /></div>
        <div><label for="HP-PrintLayout" title="Etykietki na stronie ze skóconymi informacjami o zgłoszeniu">Drukowanie etykietek: </label><input class="cbox" type="checkbox" id="HP-PrintLayout" /></div>
        <div><label for="HP-WylaczWewnetrzneOdp" title="Wyłącza domyślnie wewnętrzne odpowiedzi w zgłoszeniach">Wyłącz zawsze wewnętrzne: </label><input class="cbox" type="checkbox" id="HP-WylaczWewnetrzneOdp" /></div>
        <div><label for="HP-Szablony" title="Link do własnych szablonów odpowiedzi">Własne szablony: </label><input class="audio" type="text" placeholder="podaj link do .json" id="HP-Szablony" /><a title="Przykładowy json" style="margin:0 10px; color:white" target="_blank" href="https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/szablony.json">?</a></div>
        `;


        var save = document.createElement('button');
        save.innerHTML = "Zapisz";
        save.addEventListener("click",()=>{
            //layout.style.top = '';
            document.querySelectorAll("#dzwieki > div > input.audio").forEach(el => {
                //console.log(el.id);
                localStorage.setItem(el.id,el.value);
                //console.log(el.id+" => "+el.value+" "+el.checked);
            });
            document.querySelectorAll("#dzwieki > div > input.cbox").forEach(el => {
                //console.log(el.id);
                let test = el.checked;
                if(test === false){test = ''}
                localStorage.setItem(el.id,test);
                //console.log(el.id+" => "+el.value+" "+el.checked);
            });
            saveSettings();
            settings.classList.remove("widoczne");
            settings.classList.add("niewidoczne");
        });
        settings.prepend(save);

        var remLayout = document.createElement('button');
        remLayout.innerHTML = "Zamknij";
        remLayout.addEventListener("click",()=>{
            //layout.style.top = '';
            settings.classList.remove("widoczne");
            settings.classList.add("niewidoczne");
        });
        settings.prepend(remLayout);

        var testMp3 = document.querySelectorAll(".testMp3");
        testMp3.forEach((el,index) => {
            //console.log(el.previousElementSibling.value);
            el.addEventListener("click",() => {
                let audioMp3 = el.parentElement.querySelector(".audio").value;
                console.log("test audio "+audioMp3);
                try {
                    //new Audio(audioMp3).play();
                    var audio = new Audio();
                    audio.src = audioMp3;

                    audio.onerror = function () {
                        alert("Nie udało się odtworzyć: "
                              + this.error.message);
                    }
                    audio.play();
                }
                catch(e) {
                    console.log("błąd przy odtwarzaniu: "+e);
                }
            });
        });

        document.querySelectorAll("#dzwieki div input").forEach(el=>{
            if(el.classList.contains('audio')){
                el.value = localStorage.getItem(el.id)??'';
            }
            if(el.classList.contains('cbox')){
                el.checked = localStorage.getItem(el.id)??'';
            }
        });
    }

    function openSettings(){
        var settings = document.querySelector("#layoutSettings");
        //layout.style.top = "0";
        settings.classList.remove("niewidoczne");
        settings.classList.add("widoczne");
        //document.querySelector("#HP-AudioNiski").value = localStorage.getItem("HP-AudioNiski")??'';
        //document.querySelector("#HP-AudioWysoki").value = localStorage.getItem("HP-AudioWysoki")??'';
        //document.querySelector("#HP-AudioKrytyczny").value = localStorage.getItem("HP-AudioKrytyczny")??'';
        //document.querySelector("#HP-AudioBloker").value = localStorage.getItem("HP-AudioBloker")??'';
        //document.querySelector("#HP-AudioAwaria").value = localStorage.getItem("HP-AudioAwaria")??'';
        //document.querySelector("#HP-OpenLayout").checked = localStorage.getItem("HP-OpenLayout")??'';
        //document.querySelector("#HP-PrintLayout").checked = localStorage.getItem("HP-PrintLayout")??'';


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

            //settings
            var openSettingsButton = document.createElement('div');
            openSettingsButton.innerHTML = [`
            <a class="btn-icon" title="Otwórz ustawienia"><i class="icon-hdicon-HD_all_Settings f-16"></i></a>
            `].join('');

            openSettingsButton.addEventListener("click",()=>{
                openSettings();
            });

            kotwica.append(openSettingsButton);
        }
    }

    function check(xjson){
        var jsonResponse = JSON.parse(xjson.responseText);
        var x = 0;
        var nowyArray = [];
        var staryArray = JSON.parse(sessionStorage.getItem("HP-aktywne"))??[];
        let type = "normal";
        if(jsonResponse.items){
            jsonResponse.items.forEach((el)=>{
                //console.log(el);
                if(el.assignee === null && el.status === "New" /* && sessionStorage.getItem(el.displayId)===null*/){
                    if(staryArray.includes(el.displayId)===false){
                        newAlertOnLayout(el);
                        x++;
                        console.log("dodano: "+el.displayId);
                        type = el.priority.name;
                        if(el.subject.toLowerCase().includes('awaria')){type="awaria"}
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
        staryArray.forEach((el,index)=>{
            if(nowyArray.includes(el)===false){delAlertOnLayout(el);console.log("usunięto: "+el);}
        });
        //nowyArray.forEach((el,index)=>{console.log(index+"nowy "+el);
        //                       //console.log(staryArray.includes(el));
        //                        if(staryArray.includes(el)===false){console.log("dodano: "+el);}
        //                      });
        if(staryArray.length != nowyArray.length){console.log("Różnica!!!");}
        console.log("Ostatni refresh: "+new Date());

        if(x>0){
            display(x, type);
        }
    }



    (function(){
        $(document).ready(()=> {
            powiadomienie();
            createLayout();
            createSettings();
            sessionStorage.clear("HP-aktywne");
            setInterval(refresh10s, 10000);
            if(localStorage.getItem("HP-OpenLayout")=='true'){
                openLayout();
            }

        });
    })();


})();
