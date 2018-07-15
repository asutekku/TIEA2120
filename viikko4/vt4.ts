"use strict";

const gradients: number = 10,
    svgns: string = "http://www.w3.org/2000/svg",
    taso3text: string = `TIEA212 Web-käyttöliittymien ohjelmointi -kurssin viikkotehtävä 4 taso 3 edellyttää tämännäköistä sivua`;

class vt4 {
    public static main(): void {
        createGradients();
        setHandlers();
        Objects.rabbit();
        Scroller.basic();
        SinScroll.init();
        Snowflakes.create();
    }
}

function createGradients(): void {
    const area: HTMLElement = document.getElementById("barContainer")!;
    const interval = 2000 / gradients;
    for (let i = 0; i < gradients; i++) {
        const bar: SVGSVGElement = SVG.gradientBar(interval * i);
        area.appendChild(bar);
    }
}

function setHandlers(): void {
    document.getElementById("owlButton")!.onclick = () => {
        Objects.owl();
    };
}

/**
 * Class for SVG drawing
 */
class SVG {
    /**
     * Creates gradient bar with additional delay parameter
     * @param {number} delay
     * @returns {SVGSVGElement}
     */
    static gradientBar(delay?: number): SVGSVGElement {
        const svg: SVGSVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
            defs: Element = document.createElementNS(svgns, "defs"),
            grad: Element = document.createElementNS(svgns, "linearGradient"),
            rect: Element = document.createElementNS(svgns, "rect"),
            stops = [
                {color: "#000000", offset: "0%"},
                {color: "#206DFF", offset: "50%"},
                {
                    color: "#000000",
                    offset: "100%"
                }
            ];
        stops.forEach(e => {
            const stop: Element = document.createElementNS(svgns, "stop");
            stop.setAttribute("offset", e.offset);
            stop.setAttribute("stop-color", e.color);
            grad.appendChild(stop);
        });
        grad.id = "gradientBar";
        grad.setAttribute("x1", "0");
        grad.setAttribute("x2", "1");
        grad.setAttribute("y1", "0");
        grad.setAttribute("y2", "0");
        defs.appendChild(grad);
        rect.setAttribute("fill", "url(#gradientBar)");
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        svg.appendChild(defs);
        svg.appendChild(rect);
        svg.classList.add("gradientBar");
        svg.setAttribute("type", "image/svg+xml");
        if (delay) svg.style.animationDelay = `${delay}ms`;
        return svg;
    }
}

class Objects {
    /**
     * Initializes the rabbit
     */
    static rabbit(): void {
        const left: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("rabbitLeft"),
            leftCtx: CanvasRenderingContext2D = <CanvasRenderingContext2D>left.getContext("2d"),
            right: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("rabbitRight"),
            rightCtx: CanvasRenderingContext2D = <CanvasRenderingContext2D>right.getContext("2d"),
            img: HTMLImageElement = <HTMLImageElement>document.getElementById("rabbitIMG");
        left.width = img.width / 2;
        left.height = img.height * 2;
        right.width = img.width / 2;
        right.height = img.height * 2;
        leftCtx.drawImage(img, 0, 0, left.width, left.height, 0, 0, left.width, left.height);
        rightCtx.drawImage(img, right.width, 0, right.width, right.height, 0, 0, right.width, right.height);
        Effects.wavy();
    }

    /**
     * Creates an owl
     */
    static owl(): void {
        const area = document.getElementById("owlContainer")!,
            owl: HTMLObjectElement = <HTMLObjectElement>area.children[0].cloneNode(true),
            funcs = ["ease", "ease-in", "ease-out", "ease-in-out", "linear", "step-start", "step-end"],
            index = Math.floor(Math.random() * funcs.length);
        owl.style.animationTimingFunction = funcs[index];
        if (area.children.length % 2 === 1) owl.style.animationDirection = "reverse";
        area.appendChild(owl);
    }
}

class Effects {
    private static args: any = {};

    /**
     * Sets the parameters for the wavy objects
     */
    static wavy() {
        Effects.args.img = <HTMLImageElement>document.getElementById("rabbitIMG");
        Effects.args.canvas = <HTMLCanvasElement>document.getElementById("rabbitLeft");
        Effects.args.canvas2 = <HTMLCanvasElement>document.getElementById("rabbitRight");
        Effects.args.ctx = Effects.args.canvas.getContext("2d")!;
        Effects.args.ctx2 = Effects.args.canvas2.getContext("2d")!;
        Effects.args.width = Effects.args.canvas.width;
        Effects.args.height = Effects.args.canvas.height;
        Effects.args.o1 = new Oscillator(0.05);
        Effects.args.o2 = new Oscillator(0.03);
        Effects.args.o3 = new Oscillator(0.06);
        Effects.args.y0 = 0;
        Effects.args.y1 = Effects.args.height * 0.25;
        Effects.args.y2 = Effects.args.height * 0.5;
        Effects.args.y3 = Effects.args.height * 0.75;
        Effects.args.y4 = Effects.args.height;
        requestAnimationFrame(this.waveEffect);
    }

    /**
     * Creates the wave effect for both of the bunnies
     */
    private static waveEffect = () => {
        const args = Effects.args;
        args.ctx.clearRect(0, 0, args.width, args.height);
        args.ctx2.clearRect(0, 0, args.width, args.height);
        for (let x = 0; x < args.width; x++) {
            const ly1 = args.y1 + args.o1.current(x * .2) * 100,
                ly2 = args.y2 + args.o2.current(x * 0.2) * 50,
                ly3 = args.y3 + args.o3.current(x * 0.2) * 50,
                h0 = ly1,
                h1 = ly2 - ly1,
                h2 = ly3 - ly2,
                h3 = args.y4 - ly3;
            //Draws the images in four parts to enchance effect
            args.ctx.drawImage(args.img, x, args.y0, 1, args.y1, x, 0, 1, h0);
            args.ctx.drawImage(args.img, x, args.y1, 1, args.y2 - args.y1, x, ly1 - 0.5, 1, h1);
            args.ctx.drawImage(args.img, x, args.y1, 1, args.y3 - args.y2, x, ly2 - 1, 1, h2);
            args.ctx.drawImage(args.img, x, args.y1, 1, args.y4 - args.y3, x, ly3 - 1.5, 1, h3);


            args.ctx2.drawImage(args.img, x+ args.img.width / 2, args.y0, 1, args.y1, x, 0, 1, h0);
            args.ctx2.drawImage(args.img, x+ args.img.width / 2, args.y1, 1, args.y2 - args.y1, x, ly1 - 0.5, 1, h1);
            args.ctx2.drawImage(args.img, x+ args.img.width / 2, args.y1, 1, args.y3 - args.y2, x, ly2 - 1, 1, h2);
            args.ctx2.drawImage(args.img, x+ args.img.width / 2, args.y1, 1, args.y4 - args.y3, x, ly3 - 1.5, 1, h3);
        }
        requestAnimationFrame(Effects.waveEffect);
    };
}

/**
 * Oscillator, which oscillates the bunnies
 */
class Oscillator {
    current: (x: number) => number;

    constructor(speed: number) {
        let frame = 0;
        this.current = function (x: number) {
            frame += 0.001 * speed;
            return Math.sin((frame + x * speed) * 2);
        };
    }
}

/**
 * Class for the basic scrolling text
 */
class Scroller {
    private static textXpos: number = window.innerWidth;

    static basic(): void {
        requestAnimationFrame(Scroller.scrollBasic);
    }

    static scrollBasic = () => {
        const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("basicScroller"),
            ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext("2d"),
            gradient = ctx.createLinearGradient(0, -20, 0, canvas.height);
        canvas.height = 200;
        canvas.width = window.innerWidth;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "black");
        gradient.addColorStop(0.5, "yellow");
        gradient.addColorStop(1, "black");
        ctx.font = `${canvas.height}px sans-serif`;
        ctx.fillStyle = gradient;
        ctx.textBaseline = "hanging";
        Scroller.textXpos -= 5;
        if (Scroller.textXpos <= -ctx.measureText(taso3text).width) Scroller.textXpos = window.innerWidth;
        ctx.fillText(taso3text, Scroller.textXpos, 0);
        requestAnimationFrame(Scroller.scrollBasic);
    };
}

/**
 * Class for the sinus scroll
 */
class SinScroll {
    private static charX: number = window.innerWidth;
    private static text: string = taso3text;
    private static font2: string = "40px serif";
    private static theta: number = 0.0;
    private static yValues: number[];
    private static amplitude: number = 40;
    private static velocity: number = 0.05;
    private static dx: number;
    private static xSpacing: number = 15;

    private static canvas: HTMLCanvasElement;
    private static ctx: CanvasRenderingContext2D;

    static init(): void {
        SinScroll.canvas = <HTMLCanvasElement>document.getElementById("sinusScroller");
        SinScroll.ctx = <CanvasRenderingContext2D>SinScroll.canvas.getContext("2d");
        SinScroll.yValues = new Array(SinScroll.text.length);
        SinScroll.dx = 2 * Math.PI / SinScroll.canvas.width * SinScroll.xSpacing;
        requestAnimationFrame(SinScroll.scrollSinus);
    }

    /**
     * Randomizes velocity each time the text passes the screen
     */
    static randomizeParams = () => {
        SinScroll.velocity = Math.floor(Math.random() * 100) / 400;
    };

    /**
     * Animation for the sinus scroll
     */
    private static scrollSinus = () => {
        SinScroll.canvas.height = 250;
        SinScroll.canvas.width = window.innerWidth;
        SinScroll.ctx.font = SinScroll.font2;
        SinScroll.charX -= 10;
        SinScroll.calcWave();
        SinScroll.drawWave();
        if (SinScroll.charX <= -(SinScroll.text.length * SinScroll.xSpacing * 2)) {
            SinScroll.charX = window.innerWidth;
            SinScroll.randomizeParams();
        }
        requestAnimationFrame(SinScroll.scrollSinus);
    };

    /**
     * Calculates the y values for each letter
     */
    private static calcWave(): void {
        SinScroll.theta += SinScroll.velocity;
        let x = SinScroll.theta;
        for (let i = 0; i < SinScroll.yValues.length; i++) {
            SinScroll.yValues[i] = Math.sin(x) * SinScroll.amplitude;
            x += SinScroll.dx;
        }
    }

    /**
     * Draws the wave letter by letter
     */
    static drawWave() {
        let x = SinScroll.theta;
        for (let i: number = 0; i < SinScroll.text.length; i++) {
            SinScroll.renderChar(i, x);
            x += SinScroll.dx + Math.cos(SinScroll.velocity * x);
        }
    }

    /**
     * Renders single character by index of the sentence
     * @param {number} index
     * @param {number} modifier
     */
    static renderChar(index: number, modifier: number): void {
        SinScroll.ctx.fillStyle = "White";
        SinScroll.ctx.font = SinScroll.font2;
        SinScroll.ctx.textBaseline = "hanging";
        const xPos: number = index * (this.xSpacing * 2) + Math.sin(modifier) * SinScroll.amplitude + SinScroll.charX;
        const yPos: number = SinScroll.yValues[index] * 2 + SinScroll.canvas.height / 2;
        SinScroll.ctx.fillText(SinScroll.text[index], xPos, yPos);
    }
}

/**
 * Class for the falling snowflakes
 */
class Snowflakes {
    private static div: HTMLDivElement;
    private static flake: HTMLObjectElement;
    private static spawnInterval: number = 250;
    private static lastSpawn: number = 0;
    private static falling: any[] = [];

    static create = () => {
        Snowflakes.div = <HTMLDivElement>document.getElementById("snowflakeContainer");
        Snowflakes.flake = <HTMLObjectElement>document.getElementById("snowflakeSVG");
        requestAnimationFrame(Snowflakes.snowflakeAnimate);
    };

    /**
     * Spawns new snowflake each 0.25 seconds
     * @param {number} callback
     */
    static snowflakeAnimate = (callback: number) => {
        if (callback - Snowflakes.lastSpawn > Snowflakes.spawnInterval) {
            Snowflakes.createSnowflake();
            Snowflakes.lastSpawn = callback;
        }
        Snowflakes.checkFalling();
        requestAnimationFrame(Snowflakes.snowflakeAnimate);
    };

    /**
     * Checks the falling snowflakes and removes their animation if they are in position
     */
    static checkFalling(): void {
        Snowflakes.falling.forEach((e, i, o) => {
            const xPos: number = parseInt(window.getComputedStyle(e).bottom!);
            if (xPos + 26 <= parseInt(e.style.marginBottom)) {
                e.style.animation = "none";
                o.splice(i, 1);
            }
        });
    }

    /**
     * Creates falling snowflakes
     * Checks the margin-bottom of the elements that are in the dom
     * and then evaluates what their margin-bottom should be
     */
    static createSnowflake(): void {
        const flakeElement = <HTMLElement>Snowflakes.flake.cloneNode(true),
            xPos: number = Math.floor(Math.random() * window.innerWidth),
            flakes = Array.from(document.getElementsByClassName("snowflakeSpawned"));
        if (flakes.length !== 0) {
            const xCount = flakes.filter(e => {
                const pre = parseInt((e as HTMLElement).style.marginLeft!);
                return xPos < pre + 20 && xPos > pre - 20;
            });
            if (xCount.length !== 0) {
                const highest: number = xCount.reduce((l: number, e) => {
                    const height: number = parseInt((e as HTMLElement).style.marginBottom!);
                    return height > l ? height : l;
                }, 0);
                flakeElement.style.marginBottom = `${highest + 26}px`;
            }
        }
        flakeElement.setAttribute("id", "");
        flakeElement.style.marginLeft = `${xPos}px`;
        flakeElement.classList.add("snowflakeSpawned");
        Snowflakes.falling.push(flakeElement);
        Snowflakes.div.appendChild(flakeElement);
    }
}

window.onload = () => {
    vt4.main();
};
