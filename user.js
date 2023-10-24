// ==UserScript==
// @name         Helpdesk / Powiadomienia windows
// @namespace    Eko-okna
// @version      0.98.99
// @description  Powiadomienia o nowych ticketach.
// @author       Dominik Banik dominik.banik@ekookna.pl
// @downloadURL  https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/user.js
// @updateURL    https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/user.js
// @match        https://helpdesk/*
// @require  	 https://code.jquery.com/jquery-3.7.0.min.js
// @require      https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/notifications.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/printThis/1.15.0/printThis.js
// @require      https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js
// @require      https://unpkg.com/@popperjs/core@2.11.8/dist/umd/popper.min.js
// @require      https://unpkg.com/tippy.js@6.3.7/dist/tippy-bundle.umd.min.js
// @require      https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js
// @require      https://raw.githubusercontent.com/ejci/favico.js/master/favico-0.3.10.min.js
// @require      https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js
// @connect      https://raw.githubusercontent.com/DmNick/*
// @connect      https://dmnick.ovh*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAiJJREFUOE+Vk11Ik2EUx//Pq9t4xbWl9MaimhuIXWREVwXShTg/sPAmGrMmU1sXejEoyA0aJoqWedtNYYmzxL5wlOUHSRdB3teFCG4xa1rhaJhaNnfC593z1sUu5nNzzv9/zvmdhwceRkQM/awKCkagQEG2U5AxdZmYysRtgNEA6mDFKzp2GXT4FqDfk5WRzZSm8sDoOVbTpR1F6SM9OQ+KxvywDowmQFunv+9qswDo3xjA6Alos35j19t3BuS3BSrgZ+0aB+Q9qsN242sNJnSVy4+95kKcKC9FoM2p1QunjSog6fjBTf3QKWx53msNQjsuBDDzsA/XegdRbDaio+087zGNm8HoPijRsMoNOVSBTfc7DSB0rfs6JkPqI1e6/JgdvcnzovFiMLoN+tb0lRvG0EmQwaQB2O8k1txzqPd0YmKoi/vO9j6M3QnwXHm5H4z6QcsX4+qVxiqRdM5qAKHPtnbhxWAn92uagpga7ua5ZeSACvjsWlKv9NSBxLkZDSB0g7cb4XtB+G7cxdEyK7yuGt5zcPQQ2K8gaKX1kwqYbkai+sE/QEY3+gbAGEN1xXEErzQjFovxHuvjErB1P2jFu8gNm83GYzQahcVigSzLiEQisNvt3CciXts5UmoDJeFyFfClZUHbmmtiXhzGvg89cQ5Y8sznOgcptQ5T7BmUj70AwxmW9IGkfHVeEt/1P1z6D6AT3xmAwciLcUi4hKs0+RdlXsVylWyVrQAAAABJRU5ErkJggg==
// @resource     IMPORTED_CSS https://cdn.jsdelivr.net/npm/@sweetalert2/theme-dark@4/dark.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* global $ Swal tippy Favico dayjs Typed */


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
     width: 468px;
     padding: 10px 20px;
    }

    .card {
     box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
     padding: 16px;
     text-align: left;
     background-color: #f1f1f1;
     color:black;
     height:45vh;
     /*min-height: 45vh;*/
     /*max-height:400px;*/
     overflow-y:auto;
     position:relative;
     /*-webkit-animation-name: move;
     -webkit-animation-duration: 10s;
     -webkit-animation-iteration-count: infinite;
     -webkit-animation-direction: up;
     -webkit-animation-timing-function:linear;*/
    }

    .card > sup {
     margin: 10px 0;
    }

    .card > .desc {
     overflow-y:auto;
     /*height:100%;*/
     padding: 5px 0;
    }

    .card > .desc > span {
     display:block;
     /*animation: infiniteScroll infinite 3s alternate;*/
    }

    .card > .ticket {
     position:absolute;
     right:20px;
     bottom:10px;
     color:#0000008c;
     font-weight:bold;
     opacity: 0.4;
    }

    .footerSignature {
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
     background-color: var(--primary-content-background);
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
     background-color: var(--primary-content-background);
     border: 3px solid black;
     color: black;
     z-index: 999;
     overflow-y: auto;
     border-radius: 5px;
    }

    #layoutSettings > button {
     color:white;
     margin-top:10px;
     font-weight: 600;
     letter-spacing: 0;
     border-radius: 4px;
     font-size: 13px;
     border: 4px;
    }

    #layoutSettings input {
     background-color:grey;
     color:white;
    }

    #layoutSettings input::placeholder {
     color:white;
    }

    [ng-model='ticket.description'] * {
     color: var(--primary-label-color)!important;
    }

    #dzwieki > div > label:not(.switch),
    #dzwieki > div > span:not(.switch){
     width:200px;
     display: inline-block;
     color: var(--primary-label-color);
    }

    #dzwieki > div {
     display: inline-flex;
     align-items: center;
     margin:5px 0 0 0;
    }

    #dzwieki .form-control {
     width: auto;
     /*height: 30px;*/
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

    #details-additional-fields {
     text-align: -webkit-center;
    }

    #details-additional-fields input, .form-select {
     margin: 5px 5px;
     border-radius: 5px;
     border:1px;
     border-color: var(--primary-border-color);
     padding:5px;
     background-color:var(--input-disabled-background);
     color:var(--secondary-font-color);
    }

    .theme-dark #details-additional-fields input::placeholder {
     color:white;
     opacity: 0.8;
    }

    .theme-dark #details-additional-fieldsinput:focus{
     outline: none;
     outline-style: none;
    }

    .theme-dark .comment * {
     color:#c6d0dc!important;
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

    .przekreslone {
     text-decoration: line-through;
    }

    @page {
    size: 100mm 36mm;
    /* auto is the initial value */
    margin: 0;
    /* this affects the margin in the printer settings */
    overflow:hidden;
    }

    @media print {
    * {
        margin:0;
        padding:0;
    }
    body {
        size: 100mm 36mm;
        margin:0!important;
        padding:0!important;
        width:100%;
        height:35mm;
        overflow:hidden;
     }
    }

    @media screen and (max-width: 600px) {
     .column {
      width: 100%;
      display: block;
      margin-bottom: 20px;
      }
     }

    @media screen and (max-width: 1300px) {
     #page-heading > div > h1:first-child,
     #page-heading > div > .number {
      display:none;
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

    @keyframes infiniteScroll {
     0% {
      margin-top: 0%;
     }
     50% {
      margin-top: -100%;
     }
     100% {
      margin-top: -240%;
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

    async function ifLoaded(div){
        var x = 0;
        var tid = setInterval(()=>{
            //console.log("wczytywanie "+div);
            if ($(div).length == 1 || $(div).ELEMENT_NODE == 1) {
                functionToLoad();
            }
            if (x > 40){
                returnFalse();
            }
            x++;
        }, 500);

        function functionToLoad(){
            clearInterval(tid);
            //console.log("wczytano "+div);
            return true;
        }

        function returnFalse(){
            clearInterval(tid);
            console.log("Przekroczono limit czasu: "+ div);
            return false;
        }
    }

    let ifLoaded2 = async (div) => new Promise((myResolve,myReject) => {
        var x = 0;
        //console.log(this);
        var tid = setInterval(()=>{
            //console.log("wczytywanie "+div);
            //console.log($(div));
            if ($(div).length == 1 || $(div).ELEMENT_NODE == 1) {
                clearInterval(tid);
                //console.log(x);
                myResolve(true);
            }
            if (x > 40){
                clearInterval(tid);
                console.log("Przekroczono limit czasu dla: "+div);
                myReject(false);
            }
            x++;
        }, 500);

    });

    let ifLoaded3 = async (el) => new Promise((myResolve,myReject) => {
        var x = 0;
        //console.log(this);
        var tid = setInterval(()=>{
            //console.log("wczytywanie "+div);
            //console.log($(div));
            if (el !== null) {
                clearInterval(tid);
                //console.log(x);
                myResolve(true);
            }
            if (x > 40){
                clearInterval(tid);
                console.log("Przekroczono limit czasu dla obiektu");
                myReject(false);
            }
            x++;
        }, 500);

    });

    async function audioAlert(type){
        let linkMp3 = 'https://helpdesk/v1/files/15b6afcb-ca5f-425a-ac8d-807906095102/alert.mp3'; //'https://dmnick.ovh/h/alert.mp3';
        let linkMp3Awaria = 'https://helpdesk/v1/files/de116302-2a55-4a16-9afd-08af209b4077/awaria.mp3'; //'https://dmnick.ovh/h/awaria.mp3';
        let linkMp3Przypomnienie = 'https://helpdesk/v1/files/02a0a1f4-f3f2-4adb-9eed-d8070709d5aa/widziszmnie.mp3'; //'https://dmnick.ovh/h/widziszmnie.mp3';
        let linkMp3Naklejka = 'https://helpdesk/v1/files/1bbba69a-a769-4cac-b31a-aee9c16bac3b/dobryprzekaznaklejka.mp3'; //'https://dmnick.ovh/h/dobryprzekaznaklejka.mp3';
        let HPAudioNiski = localStorage.getItem("HP-AudioNiski")??null;
        let HPAudioWysoki = localStorage.getItem("HP-AudioWysoki")??null;
        let HPAudioKrytyczny = localStorage.getItem("HP-AudioKrytyczny")??null;
        let HPAudioBloker = localStorage.getItem("HP-AudioBloker")??null;
        let HPAudioAwaria = localStorage.getItem("HP-AudioAwaria")??null;
        let HPPrzypomnienie30minLink = localStorage.getItem("HP-Przypomnienie30minLink")??null;
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
                if(HPPrzypomnienie30minLink && HPPrzypomnienie30minLink !==''){
                    linkMp3 = HPPrzypomnienie30minLink;
                }
                else {
                    linkMp3 = linkMp3Przypomnienie;
                }
                break;
            case('naklejka'):
                linkMp3 = linkMp3Naklejka;
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
            audio.oncanplaythrough = function(){
                audio.play();
            }
            //audio.play();
        }
        catch(e) {
            console.log("błąd przy odtwarzaniu: "+e);
        }
    }

    function wezUrl(el){
        switch(el){
            case('HP-OpenLayout'):
                return '/v1/files/3c6404ee-445b-475a-a1d9-41b280622bd6/HP-OpenLayout.png';
                break;
            case('HP-PrintLayout'):
                return '/v1/files/6a9fe46b-0a7c-4b61-a73d-2581399411a4/HP-PrintLayout.png';
                break;
            case('HP-WylaczWewnetrzneOdp'):
                return '/v1/files/08e9cab8-2339-45af-9e7c-b47bd35a54e4/HP-WylaczWewnetrzneOdp.png';
                break;
            case('HP-WiecejWidokow'):
                return '/v1/files/47f01deb-260c-416b-a042-48e837dda97f/HP-WiecejWidokow.png';
                break;
        }
    }

    const delAlertOnLayout = async (el) => {
        let stary = $("#"+el+"");
        stary.slideUp(1000, function(){this.remove()});
    }

    const newAlertOnLayout = async (xjson) => {
        let layout = document.querySelector("#layoutNotify > .row");
        let wrapper = document.createElement("div");
        wrapper.classList = "column";
        wrapper.id = xjson.displayId;
        layout.append(wrapper);
        let content = document.createElement("div");
        content.className = "card";
        content.style.display = "flex";
        content.style.flexDirection = "column";
        //content.innerHTML = [`
        //  <span style="font-size:150%">${xjson.category.name} - ${xjson.priority.name}</span>
        //  <h1>${xjson.subject}</h1>
        //  <h1 class="ticket">${xjson.displayId}</h1>
        //  <h3 class="desc"><span>${bezParagrafu(xjson.description)}</span></h3>
        //  <h3 class="footerSignature">~${xjson.requester.fullName ?? xjson.creatorUser.fullName}</h3>
        //  <h4 class="footerContent" data-cr="${Date.parse(xjson.creationDate)}">${minutes(new Date(xjson.creationDate))}</h4>
        //`].join('');
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

        const typed = new Typed(content, {
            strings: ['<h1>testowy opis przed prawidłowym</h1>',
                      `<span style="font-size:150%">${xjson.category.name} - ${xjson.priority.name}</span>
          <h1>${xjson.subject}</h1>
          <h1 class="ticket">${xjson.displayId}</h1>
          <h3 class="desc"><span>${bezParagrafu(xjson.description)}</span></h3>
          <h3 class="footerSignature">~${xjson.requester.fullName ?? xjson.creatorUser.fullName}</h3>
          <h4 class="footerContent" data-cr="${Date.parse(xjson.creationDate)}">${minutes(new Date(xjson.creationDate))}</h4>
                      `],
            typeSpeed: 30,
        });

        //console.log(bezParagrafu(xjson.description));
    }

    function zamknijZgloszenie(){
        try {

            ifLoaded2("[name='workTimeForm'] [ng-model='comment.isInternal']").then((el)=>{
                //console.log("koniec ifLoaded2");
                //console.log(el);
                //console.log("wrap: "+$("#wrap [ng-model='comment.isInternal']")[0].checked);
                if(el == true && $("#wrap [ng-model='comment.isInternal']")[0].checked){
                    $("[name='workTimeForm'] [ng-model='comment.isInternal']")[0].click();
                }
            });

            //ifLoaded("[name='workTimeForm'] [ng-model='comment.isInternal']").finally((el)=>{
            //    console.log(this);
            //    if(el == true){console.log("wczytano zakończ");}
            //    console.log(document.querySelector("[name='workTimeForm'] [ng-model='comment.isInternal']"));
            //    document.querySelector("[name='workTimeForm'] [ng-model='comment.isInternal']").checked = true;
            //    document.querySelector("[name='workTimeForm'] [ng-model='comment.isInternal']").dispatchEvent(new Event('change'));
            //});
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
                button.innerHTML = "Zakończ zgłoszenie";
                button.style.padding = "8px 20px";
                button.style.fontSize = "13px";
                button.style.fontWeight = "600";
                panel.prepend(button);
                //button.preventDefault();
                let commentEditor = $("[name='editor'] div[ta-bind='ta-bind']");
                commentEditor.on('keyup blur',()=>{
                if(commentEditor.html() == '<p><br></p>' || commentEditor == ''){button.innerHTML = 'Zakończ zgłoszenie'}
                    else{button.innerHTML = 'Dodaj i zakończ'}
                });
                button.addEventListener('click',(el) => {
                    el.preventDefault()
                    let wew = document.querySelector("#wrap [ng-model='comment.isInternal']").checked;
                    let txt = $("[name='editor'] div[ta-bind='ta-bind']").html();
                    let editorTxt = $("[name='close-ticket-editor'] div[ta-bind='ta-bind']");
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
                        let cb = $("#wrap [ng-model='comment.isInternal']");
                        let editorCb = $("[name='workTimeForm'] [ng-model='comment.isInternal']");
                        //console.log("wczytano checkbox");
                        $("[ng-model='workingTime.disabled']").click();
                        document.querySelector("[name='close-ticket-editor'] div[ta-bind='ta-bind']").innerHTML = txt;
                        document.querySelector("[name='close-ticket-editor'] div[ta-bind='ta-bind']").dispatchEvent(new Event('blur'));
                        //if(cb.checked){editorCb.checked = true}
                        //console.log(cb.checked);
                        //console.log($("[name='workTimeForm'] [ng-model='comment.isInternal']").checked);
                    }

                    zamknijZgloszenie();

                    //ifLoaded("[ng-model='workingTime.disabled']").then(()=>{$("[ng-model='workingTime.disabled']").checked = true;});

                });
            }
        });

    }

    function przypiszMnie(id){
        let x = document.createElement("a");
        x.style.marginLeft = "4px";
        x.classList.add('przypiszMnie');
        if(document.querySelector(".przypiszMnie") == null){
            let user = document.querySelector(".user-name > span > span > span").innerHTML;
            let userSearch = user.replaceAll(" ","+");
            x.innerHTML = `<i class="icon-hdicon-HD_all_event-new-user align-middle"></i>`;
            document.querySelector("#details-users > div:nth-child(4)").append(x);
            x.addEventListener("click",()=>{
                ifLoaded3(localStorage.getItem('HP-Token')).then((el)=>{
                    fetch(`https://helpdesk/v1/users/me`, {
                        headers: {
                            Authorization: localStorage.getItem('HP-Token')
                        }
                    })
                        .then(resp => resp.json())
                        .then(async json => {
                        console.log(json.id);
                        let noweId = await getIdSubject()??id;
                        var newOption = new Option(user,json.id,!0,!0)
                        //document.querySelector("#details-users [ax-select-model='ticket.assignee']  select").append(newOption);
                        //document.querySelector("#details-users [ax-select-model='ticket.assignee']  select").dispatchEvent(new Event("change"));
                        if(noweId){
                            fetch(`https://helpdesk/v1/tickets/${noweId}`,{
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: localStorage.getItem('HP-Token')
                                },
                                body: JSON.stringify({assigneeId: ""+json.id+""})
                            });
                        }

                    })
                        .catch( error => console.error(error));
                });

                //$("#selectSzablony > select").select2();
            });
        }
    }

    function odobserujMnie(id){
        let x = document.createElement("a");
        x.style.marginLeft = "4px";
        x.classList.add('odobserujMnie');
        x.style.display = "flex";
        if(document.querySelector(".odobserujMnie") == null){
            let user = document.querySelector(".user-name > span > span > span").innerHTML;
            let userSearch = user.replaceAll(" ","+");
            x.innerHTML = `<i class="icon-hdicon-HD_all_event-user-leave"></i>`;
            document.querySelector("#details-users > div:nth-child(5)").append(x);
            x.addEventListener("click",()=>{
                ifLoaded3(localStorage.getItem('HP-Token')).then((el)=>{
                    fetch(`https://helpdesk/v1/users/me`, {
                        headers: {
                            Authorization: localStorage.getItem('HP-Token')
                        }
                    })
                        .then(resp => resp.json())
                        .then(async json => {
                        console.log("Moje id = "+json.id);
                        let noweId = await getIdSubject()??id;
                        if(noweId){
                            fetch(`https://helpdesk/v1/tickets/${noweId}/watchers?limit=false`,{
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: localStorage.getItem('HP-Token')
                                }
                            }).then(el=> el.json()).then(el=>{
                                //console.log(el);
                                if(el.total > 0){
                                    let watchers = [];
                                    let watchersInclude = [];
                                    el.items.forEach(e=>{
                                        watchersInclude.push(e.id);
                                        if(json.id !== e.id){
                                            watchers.push(e.id);
                                        }
                                    });
                                    if(!watchersInclude.includes(json.id)){
                                        watchers.push(json.id);
                                    }
                                    //console.log(watchers);

                                    fetch(`https://helpdesk/v1/tickets/${noweId}/watchers`,{
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: localStorage.getItem('HP-Token')
                                        },
                                        body: "["+watchers+"]"
                                    });
                                }
                            });
                        }

                    })
                        .catch( error => console.error(error));
                });

                //$("#selectSzablony > select").select2();
            });
        }
    }

    function WiecejWidokow(){
        try {
            //ifLoaded2(".filters-loaded").then((el)=>{
                console.log("Wczytano filtry");
                document.querySelector(".sidebar.table-filters-double .sidebar-overflow.small").style.maxHeight = "calc(90% - 40px)";
            //});
        }
        catch (e) {
            console.log(e);
        }
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
                            $("[name='editor'] div[ta-bind='ta-bind']").html(tekst+"<p>"+e.options[e.selectedIndex].title.replaceAll('\n','</br>')+"</p>");
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
                    $('#selectSzablony .form-select').select2({
                        placeholder: 'Szablony',
                        //allowClear: true
                        templateResult: formatCustom
                    });
                });
            }
        });
    }

    function printLayout(){
        let naklejka = document.querySelector("#naklejka");
        let printOpis = document.querySelector("#printOpis");
        let printInfo = document.querySelector("#printInfo");
        let tab = []
        document.querySelectorAll(".details-additional-fields__item").forEach(el=>{
            tab[el.firstElementChild.innerText] = el.lastElementChild.innerText;

        });
        printOpis.innerHTML = `<span class="printOpisMP">${tab["Miejsce pracy:"]??''}</span> <span class="printOpisNP">${tab["Numer pomieszczenia:"]??''}</span> <span class="printOpisNK">${tab["Numer kontaktowy:"]??''}<span>`;
        printInfo.innerHTML = document.querySelectorAll(".printInfo")[0].innerHTML;

    }

    function createPrintLayout(el){
        let resp = JSON.parse(el.response);
        let opis = document.querySelector("#details-additional-fields");
        var tid = setInterval(()=>{
            var elementExist = $('#details-additional-fields');
            if (elementExist.length == 1) {
                functionToLoad();
            }
        }, 500);

        function functionToLoad(){
            clearInterval(tid);
            if(!document.querySelector("#printButton")){
                let printButton = document.createElement("button");
                printButton.id = "printButton";
                printButton.classList = "btn btn-default";
                printButton.style.color = "var(--primary-button-background)";
                printButton.innerHTML = "Drukuj";
                printButton.addEventListener('click',(el)=>{
                    $(naklejka).printThis({
                        importCSS: false,
                        importStyle: true,
                        afterPrint: async function after(){if(hasAudio()==true){audioAlert('naklejka')}}
                    });
                });
                if($("#naklejka")){$("#naklejka").remove()}
                let naklejka = document.createElement("div");
                document.body.append(naklejka);
                naklejka.id = "naklejka";
                naklejka.style.display = "block";
                naklejka.style.width = "100mm";
                naklejka.style.height = "36mm";
                naklejka.style.overflow = "hidden";
                naklejka.style.lineHeight = "17px";
                naklejka.style.paddingTop = "5px";
                naklejka.style.backgroundColor = "red";
                naklejka.style.position = "fixed";
                //naklejka.style.top = "0";
                naklejka.style.fontFamily = "'Open Sans',sans-serif"
                naklejka.style.fontSize = "5mm";
                naklejka.style.fontWeight = "bold";
                naklejka.innerHTML = `<div class="printNazwa" style="overflow: hidden;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;line-height: 5mm">#${resp.displayId} ${resp.subject}</div>
                                      <div class="printOpis" style="overflow: hidden;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;line-height: 5mm;max-height:10mm">
                                      <div class="printMP" style="float: left;"></div>
                                      <div class="printNP" style="float: left;"></div>
                                      <div class="printNK" style="float: left;"></div>
                                      </div>
                                      <div class="printPodpis" style="clear:both;overflow: hidden;display: -webkit-box;-webkit-line-clamp: 1;-webkit-box-orient: vertical;line-height: 5mm">${resp.requester.fullName}</div>
                                      <div class="printInfo" style="overflow: hidden;display: -webkit-box;-webkit-line-clamp: 1;-webkit-box-orient: vertical;line-height: 5mm"></div>`;

                let tab = [];
                document.querySelectorAll(".details-additional-fields__item").forEach(el=>{
                    if(el.firstElementChild.innerText == "Miejsce pracy:" || el.firstElementChild.innerText == "Lokalizacja:"){
                        el.lastElementChild.setAttribute("data-dodatkowe_pola","printMP");
                    }
                    if(el.firstElementChild.innerText == "Numer pomieszczenia:"){
                        el.lastElementChild.setAttribute("data-dodatkowe_pola","printNP");
                    }
                    if(el.firstElementChild.innerText == "Numer kontaktowy:" || el.firstElementChild.innerText == "Nr kontaktowy:"){
                        el.lastElementChild.setAttribute("data-dodatkowe_pola","printNK");
                    }

                    const ajdi = el.lastElementChild.getAttribute("data-dodatkowe_pola");
                    //console.log(ajdi);
                    tab[el.firstElementChild.innerText] = el.lastElementChild.innerText;
                    el.firstElementChild.addEventListener("click",(e)=>{
                        //console.log(el.firstElementChild);
                        el.firstElementChild.classList.toggle("przekreslone");

                        if(el.firstElementChild.classList.contains("przekreslone")){
                            //console.log("przekreślone");
                            $("."+ajdi).html("");
                        }
                        else {
                            //console.log("przekreślenie wycofane");
                            if(ajdi == 'printMP'){$("."+ajdi).html(el.lastElementChild.innerText+" ")}
                            else{$("."+ajdi).html(" | "+el.lastElementChild.innerText+" ")}
                            //console.log($("[data-dodatkowe_pola='"+ajdi+"']").text());
                        }
                    });




                    if(ajdi == 'printMP'){$("."+ajdi).html(el.lastElementChild.innerText)}
                    else{$("."+ajdi).html(" | "+el.lastElementChild.innerText+" ")}

                    el.lastElementChild.setAttribute("contenteditable",true);
                    el.lastElementChild.addEventListener('keyup',(ele)=>{
                        if(ajdi == 'printMP'){$("."+ajdi).html(el.lastElementChild.innerText)}
                        else{$("."+ajdi).html(" | "+el.lastElementChild.innerText+" ")}
                        //console.log( el.lastElementChild.getAttribute("data-dodatkowe_pola") );
                        //console.log(ele);
                    });
                });

                if(tab["Lokalizacja:"]){tab["Miejsce pracy:"] = tab["Lokalizacja:"]}
                if(tab["Nr kontaktowy:"]){tab["Numer kontaktowy:"] = tab["Nr kontaktowy:"]}
                if(!tab["Miejsce pracy:"] && !document.querySelector("#Miejsce\\ pracy\\:")){
                    let div = document.createElement("div");
                    let input = document.createElement("input");
                    input.id = "Miejsce pracy:";
                    input.autocomplete = "off";
                    input.placeholder = "Miejsce pracy";
                    input.addEventListener('keyup',(el)=>{
                        document.querySelectorAll(".printMP")[0].innerHTML = el.target.value;
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
                        document.querySelectorAll(".printNP")[0].innerHTML = " | "+el.target.value;
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
                        document.querySelectorAll(".printNK")[0].innerHTML = " | "+el.target.value;
                    });
                    document.querySelector("#details-additional-fields").append(div);
                    div.append(input);
                }

                if(!document.querySelector("#dodatkoweInfo")){
                    let div = document.createElement("div");
                    let input = document.createElement("input");
                    input.id = "dodatkoweInfo";
                    input.autocomplete = "off";
                    input.placeholder = "Dodatkowe informacje";
                    input.addEventListener('keyup',(el)=>{
                        document.querySelectorAll(".printInfo")[0].innerHTML = el.target.value;
                    });
                    document.querySelector("#details-additional-fields").append(div);
                    div.append(input);
                }

                document.querySelector("#details-additional-fields").append(document.createElement("br"));
                document.querySelector("#details-additional-fields").append(printButton);
            }
        }

    }

    function getIdSubject(){
        return new Promise((resolve, reject) => {
            let shortId = document.querySelector("[ng-if='::ticket.displayId']")?document.querySelector("[ng-if='::ticket.displayId']").innerHTML.replace("#",""):alert("Nie znaleziono id zgłoszenia/odśwież stronę");
            if(shortId && shortId !== null && shortId !== ''){
                try {
                    fetch(`https://helpdesk/v1/tickets/${shortId}`,{
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: localStorage.getItem('HP-Token')
                        }
                    }).then(el=>el.json()).then(el=>{
                        resolve(el.id);
                    });
                }
                catch(er) {
                    console.log("Nie znaleziono id ticketu w funkcji editSubject->getIdSubject() \n\rError: ");
                    console.log(er);
                }
            }
            else {
                console.log("Nie znaleziono id ticketu w funkcji editSubject->getIdSubject() \n\rError: ");
                alert("Skontaktuj się z dominik.banik@ekookna.pl, Nie znaleziono id ticketu w funkcji editSubject->getIdSubject()");
            }
        });
    }

    function editSubject(id){

        ifLoaded2(".one-line.element__events").then((el)=>{
            if(document.querySelector("#editSubject") == null){
                async function changeSubject(nowaNazwa){
                    let noweId = await getIdSubject()??id;
                    if(noweId){
                        fetch(`https://helpdesk/v1/tickets/${noweId}`,{
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: localStorage.getItem('HP-Token')
                            },
                            body: JSON.stringify({subject: ""+nowaNazwa+""})
                        }).then(el=>el.json()).then(el=>{
                            //console.log(el);
                            document.querySelector("[ax-ellipsis='ticket.subject'] > span").innerHTML = nowaNazwa;
                        });
                    }
                }

                //console.log("wczytano edit");
                let div = document.createElement("div");
                div.id = "editSubject";
                document.querySelector(".one-line.element__events").appendChild(div);
                let before = document.createElement("select");
                before.classList.add("beforeSubject","form-select");
                div.appendChild(before);

                let after = document.createElement("select");
                after.classList.add("afterSubject","form-select");
                div.appendChild(after);

                var beforeArray = [], afterArray = [];
                if(!localStorage.getItem("HP-BeforeSubject") || localStorage.getItem("HP-BeforeSubject") == null || localStorage.getItem("HP-BeforeSubject") == ''){
                    localStorage.setItem("HP-BeforeSubject",JSON.stringify(['Dodaj wybór','Usuń wybór','Z1','Z2','Z3','Z4','Z5','Z6','Z7','Z8','MWS','MWG']));
                }
                if(!localStorage.getItem("HP-AfterSubject") || localStorage.getItem("HP-AfterSubject") == null || localStorage.getItem("HP-AfterSubject") == ''){
                    localStorage.setItem("HP-AfterSubject",JSON.stringify(['Dodaj wybór','Usuń wybór','Laptop','Terminal','Monitor','Drukarka']));
                }


                function loadArrays(){
                    beforeArray = JSON.parse(localStorage.getItem("HP-BeforeSubject"))??[];
                    afterArray = JSON.parse(localStorage.getItem("HP-AfterSubject"))??[];

                    let staraNazwa = document.querySelector("[ax-ellipsis='ticket.subject'] > span").innerHTML;

                    before.innerHTML = `<option selected disabled>Przed</option>`;
                    beforeArray.forEach((el,index) => {
                        if(staraNazwa.toUpperCase().includes("["+el.toUpperCase()+"]")){
                            before.innerHTML += `<option selected>${el}</option>`;
                            before[index+1].disabled = true;
                        }
                        else {
                            before.innerHTML += `<option>${el}</option>`;
                        }
                    });

                    after.innerHTML = `<option disabled selected>Po</option>`;
                    afterArray.forEach((el,index) => {
                        if(staraNazwa.toUpperCase().includes("["+el.toUpperCase()+"]")){
                            after.innerHTML += `<option selected>${el}</option>`;
                            after[index+1].disabled = true;
                        }
                        else {
                            after.innerHTML += `<option>${el}</option>`;
                        }
                    });
                }
                loadArrays();



                before.addEventListener("change",(el)=>{
                    if(/*el.target.selectedIndex === 1 || */el.target.value == "Dodaj wybór"){
                        before.selectedIndex = 0;
                        let newBefore = prompt("Dodaj opcję do 'Przed': ");

                        if (newBefore != null) {
                            beforeArray.push(newBefore);
                            localStorage.setItem("HP-BeforeSubject",JSON.stringify(beforeArray));
                            loadArrays();
                        }
                        return false;
                    }
                    if(el.target.value == "Usuń wybór"){
                        before.selectedIndex = 0;
                        let delBefore = prompt("Usuń opcję z 'Przed': ");
                        if(delBefore != null){
                            beforeArray = beforeArray.filter(function (letter) {
                                return letter !== delBefore;
                            });
                            localStorage.setItem("HP-BeforeSubject",JSON.stringify(beforeArray));
                            loadArrays();
                        }
                        return false;
                    }

                    let staraNazwa = document.querySelector("[ax-ellipsis='ticket.subject'] > span").innerHTML;
                    let nowaNazwa;

                    beforeArray.forEach((data,index) => {
                        if(staraNazwa.toUpperCase().includes("["+data.toUpperCase()+"]")){
                            let regexObj = new RegExp("\\["+data+"\\]","gi");
                            nowaNazwa = staraNazwa.replaceAll(regexObj,"["+el.target.value+"]");
                        }
                        else if (nowaNazwa == '' || nowaNazwa == undefined || nowaNazwa == null){
                            nowaNazwa = "["+el.target.value+"] "+staraNazwa;
                        }
                        if(index!==0){before[index+1].disabled = false;}
                    });
                    before[before.selectedIndex].disabled = true;
                    changeSubject(nowaNazwa);
                });

                after.addEventListener("change",(el)=>{
                    if(/*el.target.selectedIndex === 1 || */el.target.value == "Dodaj wybór"){
                        after.selectedIndex = 0;
                        let newAfter = prompt("Dodaj opcję do 'Po': ");

                        if (newAfter != null) {
                            afterArray.push(newAfter);
                            localStorage.setItem("HP-AfterSubject",JSON.stringify(afterArray));
                            loadArrays();
                        }
                        return false;
                    }
                    if(el.target.value == "Usuń wybór"){
                        after.selectedIndex = 0;
                        let delAfter = prompt("Usuń opcję z 'Po': ");
                        if(delAfter != null){
                            afterArray = afterArray.filter(function (letter) {
                                return letter !== delAfter;
                            });
                            localStorage.setItem("HP-AfterSubject",JSON.stringify(afterArray));
                            loadArrays();
                        }
                        return false;
                    }

                    let staraNazwa = document.querySelector("[ax-ellipsis='ticket.subject'] > span").innerHTML;
                    let nowaNazwa;

                    afterArray.forEach((data,index) => {
                        if(staraNazwa.toUpperCase().includes("["+data.toUpperCase()+"]")){
                            let regexObj = new RegExp("\\["+data+"\\]","gi");
                            nowaNazwa = staraNazwa.replaceAll(regexObj,"["+el.target.value+"]");
                        }
                        else if (nowaNazwa == '' || nowaNazwa == undefined || nowaNazwa == null){
                            nowaNazwa = staraNazwa+" ["+el.target.value+"]";
                        }
                        if(index!=0){after[index+1].disabled = false;}
                    });
                    after[after.selectedIndex].disabled = true;
                    changeSubject(nowaNazwa);
                });
            }
        });
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
                    if(hasPrzypomnienie30min()){audioAlert('przypomnienie30min')};
                }
                el.closest(".card").classList.add("warning");
            }
        });
    }

    async function display(x,type){
        if(hasNotify()===true){window.UserScript.Notifications.notify('Nowe zgłoszenia', x+' nowe/ych zgłoszeń!', 'https://helpdesk/v1/files/10200197-1845-4248-b26a-d5dd53cec7dd/icon.png');}
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

    function hasWiecejWidokow() {
            if (localStorage.getItem("HP-WiecejWidokow") == 'true'){
                return(true);
            }
            else {
                return(false);
            }
    }

    function hasPrzypomnienie30min() {
            if (localStorage.getItem("HP-Przypomnienie30min") == 'true'){
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
            position: 'center',
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
        dzwieki.innerHTML = `
        <div><label for="HP-AudioNiski">Niski priorytet: </label><input class="audio form-control" type="text" placeholder="podaj link do .mp3" id="HP-AudioNiski" /><button class="testMp3 btn">Test</button></div>
        <div><label for="HP-AudioWysoki">Wysoki priorytet: </label><input class="audio form-control" type="text" placeholder="podaj link do .mp3" id="HP-AudioWysoki" /><button class="testMp3 btn">Test</button></div>
        <div><label for="HP-AudioKrytyczny">Krytyczny priorytet: </label><input class="audio form-control" type="text" placeholder="podaj link do .mp3" id="HP-AudioKrytyczny" /><button class="testMp3 btn">Test</button></div>
        <div><label for="HP-AudioBloker">Bloker priorytet: </label><input class="audio form-control" type="text" placeholder="podaj link do .mp3" id="HP-AudioBloker" /><button class="testMp3 btn">Test</button></div>
        <div><label for="HP-AudioAwaria">Awaria: </label><input class="audio form-control" type="text" placeholder="podaj link do .mp3" id="HP-AudioAwaria" /><button class="testMp3 btn">Test</button></div>
        <div><span title="Przypomnienie po 30 minutach">Przypomnienie po 30min: </span><label class="switch ml-5 mr-10 mb-0"><input type="checkbox" class="cbox" id="HP-Przypomnienie30min"> <span class="slider"></span></label><input class="audio form-control" type="text" placeholder="podaj link do .mp3" id="HP-Przypomnienie30minLink" style="width: 30%;"><button class="testMp3 btn">Test</button></div>
        <div><span title="Automatycznie uruchamia layout przy odswieżeniu strony">Auto uruchom layout: </span><label class="switch ml-5 mr-10 mb-0"><input type="checkbox" class="cbox" id="HP-OpenLayout"> <span class="slider"></span></label></div>
        <div><span title="Etykietki na stronie ze skóconymi informacjami o zgłoszeniu">Drukowanie etykietek: </span><label class="switch ml-5 mr-10 mb-0"><input type="checkbox" class="cbox" id="HP-PrintLayout"> <span class="slider"></span></label></div>
        <div><span title="Wyłącza domyślnie wewnętrzne odpowiedzi w zgłoszeniach">Wyłącz zawsze wewnętrzne: </span><label class="switch ml-5 mr-10 mb-0"><input type="checkbox" class="cbox" id="HP-WylaczWewnetrzneOdp"> <span class="slider"></span></label></div>
        <div><span title="Wiecej miejsca dla widoków">Wiecej widoków: </span><label class="switch ml-5 mr-10 mb-0"><input type="checkbox" class="cbox" id="HP-WiecejWidokow"> <span class="slider"></span></label></div>
        <div><label for="HP-Szablony" title="Link do własnych szablonów odpowiedzi">Własne szablony: </label><input class="audio form-control" type="text" placeholder="podaj link do .json" id="HP-Szablony" /><a title="Przykładowy json" style="margin:0 10px" target="_blank" href="https://raw.githubusercontent.com/DmNick/helpdeskNotify/main/szablony.json">?</a>
        <a title="Stwórz własny json" style="margin:0 10px" target="_blank" href="https://dmnick.ovh/json_editor.html"> + </a>
        </div>
        `;

        var save = document.createElement('button');
        save.innerHTML = "Zapisz";
        save.classList.add('btn','btn-primary');
        save.style.float = "left";
        save.addEventListener("click",()=>{
            //layout.style.top = '';
            document.querySelectorAll("#dzwieki input.audio").forEach(el => {
                //console.log(el.id);
                localStorage.setItem(el.id,el.value);
                //console.log(el.id+" => "+el.value+" "+el.checked);
            });
            document.querySelectorAll("#dzwieki input.cbox").forEach(el => {
                //console.log(el.id);
                let test = el.checked;
                if(test === false){test = ''}
                localStorage.setItem(el.id,test);
                //console.log(el.id+" => "+el.value+" "+el.checked);
            });
            saveSettings();
            $(settings).fadeOut();
            //settings.classList.remove("widoczne");
            //settings.classList.add("niewidoczne");
        });
        settings.append(save);

        var remLayout = document.createElement('button');
        remLayout.innerHTML = "Zamknij";
        remLayout.classList.add('btn','btn-danger');
        remLayout.style.float = "right";
        remLayout.style.padding = "8px 20px";
        remLayout.addEventListener("click",()=>{
            //layout.style.top = '';
            $(settings).fadeOut(200);
            settings.classList.remove("widoczne");
            settings.classList.add("niewidoczne");
        });
        settings.append(remLayout);

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
                if(el.id == 'HP-Przypomnienie30min') return;
                //tippy(`div#dzwieki > div:has(input#${el.id})`, {
                tippy(document.querySelector(`#${el.id}`).closest("div"), {
                    content(reference){
                        let link = wezUrl(el.id);
                        return `<img src='${link}' style='display:block;max-height:400px'>`
                    },
                    allowHTML: true,
                    placement: 'right',
                    //onShow(instance) {
                    //    let link = wezUrl(el.id);
                    //    fetch(link)
                    //        .then((response) => response.blob())
                    //        .then((blob) => {
                    //        const url = URL.createObjectURL(blob);
                    //        const image = new Image();
                    //        image.style.display = 'block';
                    //        image.style.maxHeight = "400px"
                    //        image.src = url;
                    //        instance.setContent(image);
                    //    })
                    //        .catch((error) => {
                    //        instance.setContent(`Request failed. ${error}`);
                    //    });
                    //},
                });

            }
        });

        //tippy('div#dzwieki > div:has(input#HP-OpenLayout)', {
        //    content: 'My tooltip!',
        //});
    }

    function openSettings(){
        var settings = document.querySelector("#layoutSettings");
        //layout.style.top = "0";
        $(settings).fadeIn(800);
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
            <a class="btn-icon" title="Otwórz layout"><i class="icon-hdicon-HD_all_help-center"></i></a>
            `].join('');

            openLayoutButton.addEventListener("click",()=>{
                openLayout();
            });

            kotwica.append(openLayoutButton);

            //settings
            var openSettingsButton = document.createElement('div');
            openSettingsButton.innerHTML = [`
            <a class="btn-icon" title="Otwórz ustawienia"><i class="icon-hdicon-HD_all_Settings"></i></a>
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
        //console.log("stare: "+JSON.parse(sessionStorage.getItem("HP-aktywne")).length+" nowe: "+nowyArray.length);
        //if(JSON.parse(sessionStorage.getItem("HP-aktywne")).length !== nowyArray.length){favicon.badge(nowyArray.length)}
        favicon.badge(nowyArray.length);

        staryArray.forEach((el,index)=>{
            if(nowyArray.includes(el)===false){delAlertOnLayout(el);console.log("usunięto: "+el);}
        });
        //nowyArray.forEach((el,index)=>{console.log(index+"nowy "+el);
        //                       //console.log(staryArray.includes(el));
        //                        if(staryArray.includes(el)===false){console.log("dodano: "+el);}
        //                      });
        if(staryArray.length != nowyArray.length){console.log("Różnica!!!");}
        //console.log("Ostatni refresh: "+new Date());
        console.log("Ostatni refresh: "+dayjs(new Date()).format('HH:mm:ss'));

        if(x>0){
            display(x, type);
        }
    }

    var favicon=new Favico({
        //animation:'slide',
        animation:'none',
        bgColor : '#FF00FF',
        //bgColor : '#5CB85C',
        textColor : '#ff0'
    });

    function init() {
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            this.addEventListener('load', function() {
                if(url.indexOf("tickets?") > -1 && window.location.href.split('?')[0] == 'https://helpdesk/#/helpdesk'){
                    if (this.readyState == 4) {
                        if (this.status == 200){
                            //console.log(this);
                            check(this);
                            przelacznik();
                            refreshZegary();
                            if(hasWiecejWidokow()){WiecejWidokow()};
                        }
                    };
                }
                if(url.indexOf("tickets/") > -1 && this.responseURL.split("/").length == '6' && window.location.href.indexOf('helpdesk/details/') > -1){
                    var sentHeaders = {}
                    var originalXMLHttpRequest_setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

                    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
                        sentHeaders[header] = value;
                        if(header == 'Authorization'){localStorage.setItem('HP-Token',value)}
                        originalXMLHttpRequest_setRequestHeader.call(this, header, value);
                    }
                    if (this.readyState == 4) {
                        if (this.status == 200){
                            if(hasPrintLayout()){createPrintLayout(this)};
                            wczytajSzablony();
                            dodajIZakoncz();
                            if(hasWylaczWewnetrzneOdp()){WylaczWewnetrzneOdp()};
                            editSubject(JSON.parse(this.response).id);
                            przypiszMnie(JSON.parse(this.response).id);
                            odobserujMnie(JSON.parse(this.response).id);
                            //console.log(JSON.parse(this.response));
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

    (function(){
        $(document).ready(()=> {
            let h = window.location.href.split("/");
            if(h[3] !== "#"){h[3] = '#';window.location.replace(h.join('/'))}
            init();
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