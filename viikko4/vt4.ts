"use strict";

const numGradientBars = 10;

class vt4 {
    public static main(): void {
        createGradients();
        drawRabbit(); // Muista: piirto ei tapahdu heti, vaan vasta kun kuva on ladattu
        drawScroller();
        initScroller2();
        window.requestAnimationFrame(animateScroller2);
        window.requestAnimationFrame(animateSnowflakes);
    }
}

//#region Bars, owl and rabbit

// Luo ylös ja alas liikkuvat palkit
function createGradients(): void {
    let area = document.getElementById('barContainer');

    // Aika, jonka välein laitetaan uusi palkki menemään
    let interval = 2000 / numGradientBars;

    for (let i = 0; i < numGradientBars; i++) {
        let obj = document.createElement('object');
        obj.data = 'gradientBar.svg';
        obj.type = 'image/svg+xml';
        obj.className = 'gradientBar';
        obj.style.animationDelay = interval * i + 'ms';

        area.appendChild(obj);
    }
}

// Piirtää piilotetuille canvas-elementeille jäniksen puolikkaat
function drawRabbit() {
    let left = document.getElementById('rabbitLeftSrc');
    let leftCtx = left.getContext('2d');
    let right = document.getElementById('rabbitRightSrc');
    let rightCtx = right.getContext('2d');

    let img = document.getElementById('imgRabbit');

    img.onload = function () {
        left.width = img.width / 2;
        left.height = img.height;
        leftCtx.drawImage(img, 0, 0, left.width, left.height, 0, 0, left.width, left.height);

        right.width = img.width / 2;
        right.height = img.height;
        rightCtx.drawImage(img, right.width, 0, right.width, right.height, 0, 0, right.width, right.height);

        // Laitetaan tässä vaiheessa ruudulla näkyvien piirtokohteiden koot kuntoon
        let l = document.getElementById('rabbitLeft');
        l.width = left.width;
        l.height = left.height * 2; // varataan tilaa venyttämiselle
        let r = document.getElementById('rabbitRight');
        r.width = right.width;
        r.height = right.height * 2;

        window.requestAnimationFrame(drawRabbitStretched);
    }
}

// Lisää satunnaisella liikefunktiolla varustetun pöllön
function createOwl() {
    let area = document.getElementById("owlContainer");
    let template = area.children[0];

    // Kopioidaan valmiiksi dokumentissa olevasta
    let owl = template.cloneNode(true);
    let funcs = ["ease", "ease-in", "ease-out", "ease-in-out", "linear", "step-start", "step-end"];
    let i = Math.floor(Math.random() * funcs.length);
    owl.style.animationTimingFunction = funcs[i];

    // Joka toinen takaperin
    if (area.children.length % 2 == 1) owl.style.animationDirection = "reverse";

    area.appendChild(owl);
}

// Piirtää jäniksen venytettynä aaltoilevasti.
function drawRabbitStretched(timestamp) {
    drawStretched(document.getElementById('rabbitLeftSrc'), document.getElementById('rabbitLeft'), timestamp);
    drawStretched(document.getElementById('rabbitRightSrc'), document.getElementById('rabbitRight'), timestamp);
    window.requestAnimationFrame(drawRabbitStretched);
}

// Piirtää lähdecanvaksen sisällön venytettynä kohdecanvakselle.
function drawStretched(src, target, time) {
    let srcCtx = src.getContext('2d');
    let targetCtx = target.getContext('2d');

    let srcData = srcCtx.getImageData(0, 0, src.width, src.height);
    let targetData = targetCtx.createImageData(target.width, target.height);

    // Edetään datassa rivi kerrallaan
    let srcRow = 0;
    let targetRow = 0;
    while (srcRow < srcData.height && targetRow < targetData.height) {
        for (let l = 0; l < lineCount(srcRow); l++) {
            let srcLineStart = srcRow * srcData.width * 4; // 4 alkiota per pikseli
            let targetLineStart = targetRow * targetData.width * 4;
            // Piirretään rivi
            for (let i = 0; i < 4 * srcData.width; i++) {
                targetData.data[targetLineStart + i] = srcData.data[srcLineStart + i];
            }

            targetRow++;
        }

        srcRow++;
    }

    targetCtx.putImageData(targetData, 0, 0);

    // Laskee, montako kertaa rivi pitäisi missäkin kohtaa kopioida
    function lineCount(row) {
        return Math.round(2 + Math.sin((row - time / 30) / 20));
    }
}

//#endregion


//#region Scroller 1

const scrollerText = 'TIEA212 Web-käyttöliittymien ohjelmointi -kurssin viikkotehtävä 4 taso 3 edellyttää tämännäköistä sivua';

// Piirtää tekstin skrollerin lähdecanvakselle
function drawScroller() {
    let canvas = document.getElementById('scroller');
    let ctx = canvas.getContext('2d');

    canvas.height = 200;

    // Luodaan liukuväri
    let gradient = ctx.createLinearGradient(0, -20, 0, canvas.height);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(0.5, 'yellow');
    gradient.addColorStop(1, 'black');

    // Mitataan tarvittava leveys
    let font = canvas.height + 'px calibri';
    ctx.font = font;
    ctx.fillStyle = gradient;
    canvas.width = ctx.measureText(scrollerText).width;

    // Nämä resetoituvat, kun canvaksen kokoa muuttaa
    ctx.font = font;
    ctx.fillStyle = gradient;
    ctx.textBaseline = 'hanging';

    ctx.fillText(scrollerText, 0, 0);
}

//#endregion


//#region Scroller 2

const scroller2font = '35px serif';

// Asettaa toiselle skrollerille järkevät mittasuhteet
function initScroller2() {
    let canvas = document.getElementById('scroller2');
    let ctx = canvas.getContext('2d');

    canvas.height = 150;

    ctx.font = '35px serif';
    canvas.width = ctx.measureText(scrollerText).width + 800; // lisätilaa sivuttaisliikkeelle

    // Kuuntelija, joka arpoo animaation
    canvas.parentElement.addEventListener('animationiteration', onScrollerLoop);
}

// Skrollerin animaation kontrollimuuttujat
const params = {
    "XIntensity": 0, // sivuttaisliikkeen suuruus
    "XFreq": 1, // sivuttaisliikkeen nopeus
    "YFreq": 1, // pystyliikkeen nopeus
    "XWL": 1, // sivuttaisliikkeen aallonpituus
    "YWL": 1 // pystyliikkeen aallonpituus
}

// Päivittää toisen skrollerin animaation.
function animateScroller2(time) {
    let canvas = document.getElementById('scroller2');
    let ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'White';
    ctx.font = scroller2font;
    ctx.textBaseline = 'middle';

    // Piirretään teksti kirjain kerrallaan 
    let x = 400;
    for (let i = 0; i < scrollerText.length; i++) {
        let char = scrollerText.charAt(i);
        ctx.fillText(char, x + xOffset(x), yOffset(x));
        x += ctx.measureText(char).width;
    }

    function xOffset(xPos) {
        return -Math.round(Math.cos(xPos / (50 * params['XWL']) + time * params["XFreq"] / 400) * params['XIntensity'] * 50);
    }

    function yOffset(xPos) {
        let center = canvas.height / 2;
        return Math.round(center + Math.sin((xPos / (50 * params['YWL']) + time * params['YFreq'] / 400)) * (center - 20));
    }

    window.requestAnimationFrame(animateScroller2);
}

// Arvotaan skrollerille satunnainen animaatio aina kun se alkaa alusta
function onScrollerLoop() {
    params['XIntensity'] = Math.random() * 5;
    if (params['XIntensity'] < 0.75) {
        // Mennään nollaan asti jos tämä on pieni, niin saadaan joskus
        // perus siniaallon näköisiäkin animaatioita
        params['XIntensity'] = 0;
    }
    params['XFreq'] = 1 + Math.random();
    params['YFreq'] = 1 + Math.random();
    // tämän pitää olla pitkä jos intensiteetti on iso, muuten näyttää liian sekavalta
    params['XWL'] = params['XIntensity'] - 1 + Math.random() * 2;
    params['YWL'] = 1 + Math.random() * 3;
}

//#endregion


//#region Snowflakes

let prevSpawnTime = 0; // Viimeisimmän hiutaleen luontiaika
let spawnInterval = 250; // Aika, jonka välein luodaan uusi hiutale

// Päivittää lumihiutaleiden tilanteen
function animateSnowflakes(time) {
    // Luodaan uusi jos aikaa on kulunut riittävästi
    if (time - prevSpawnTime > spawnInterval) {
        spawnSnowflake();
        prevSpawnTime = time;
    }

    checkSnowflakeHeights();

    window.requestAnimationFrame(animateSnowflakes);
}

// Tallennetaan kaikki hiutaleet taulukkoon x-koordinaatin mukaan. Näin voidaan
// nopeasti löytää sellaiset hiutaleet, jotka saattavat olla toisen alla
let flakes = [[]];
// Törmäysten tutkimiseen käytettävät luvut, todelliset ovat eri
let flakeWidth = 20;
let flakeHeight = 22;

// Luo uuden lumihiutaleen
function spawnSnowflake() {
    let area = document.getElementById('snowflakeContainer');

    let template = document.getElementById("flakeTemplate");
    let flake = template.cloneNode(true);
    flake.id = "";

    // Arvotaan x-koordinaatti ruudun alueelta
    let x = Math.random() * (window.innerWidth - flakeWidth);
    flake.style.left = x + 'px';
    flake.x = x;

    // Lasketaan, mille korkeudelle hiutaleen pitäisi laskeutua
    flake.targetHeight = 0;
    let index = Math.floor(x / flakeWidth);
    for (let i = index - 1; i <= index + 1; i++) {
        if (i > 0 && flakes[i]) {
            for (let j in flakes[i]) {
                if ((flakes[i][j].x + flakeWidth > flake.x) && (flakes[i][j].x < flake.x + flakeWidth)) {
                    // hiutale on tämän alla, muutetaan kohdekorkeutta
                    let height = flakes[i][j].targetHeight + flakeHeight;
                    if (height > flake.targetHeight) {
                        flake.targetHeight = height;
                    }
                }
            }
        }
    }

    // Laitetaan hiutale taulukkoon
    if (!flakes[index]) {
        flakes[index] = [];
    }
    flakes[index].push(flake);

    area.appendChild(flake);
}

// Tarkistaa kaikkien lumihiutaleiden korkeudet ja pysäyttää sellaiset, jotka ovat riittävän matalalla
function checkSnowflakeHeights() {
    for (let flake of document.getElementsByClassName('snowflake')) {
        let bottom = getComputedStyle(flake).bottom;
        let h = parseFloat(bottom.slice(0, bottom.length - 2));
        if (h <= flake.targetHeight) {
            // ollaan pohjalla, animaatio pois ja oikealle korkeudelle
            flake.style.animation = 'none';
            flake.style.bottom = flake.targetHeight + 'px';
        }
    }
}

window.onload = () => {
    vt4.main();
};
