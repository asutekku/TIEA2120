'use strict';

const gradients: number = 10,
    svgns: string = 'http://www.w3.org/2000/svg',
    taso3text: string = `TIEA212 Web-käyttöliittymien ohjelmointi -kurssin viikkotehtävä 4 taso 3 edellyttää tämännäköistä sivua`;

class vt4 {
    public static main(): void {
        createGradients();
        setHandlers();
        Objects.rabbit();
        Scroller.basic();
    }
}

function createGradients(): void {
    const area: HTMLElement = document.getElementById('barContainer')!;
    const interval = 2000 / gradients;
    for (let i = 0; i < gradients; i++) {
        const bar: SVGSVGElement = SVG.gradientBar(interval * i);
        area.appendChild(bar);
    }
}

function setHandlers(): void {
    document.getElementById("owlButton")!.onclick = () => {
        Objects.owl();
    }
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
        const svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            defs: Element = document.createElementNS(svgns, 'defs'),
            grad: Element = document.createElementNS(svgns, 'linearGradient'),
            rect: Element = document.createElementNS(svgns, 'rect'),
            stops = [
                {'color': '#000000', 'offset': '0%'},
                {'color': '#206DFF', 'offset': '50%'},
                {'color': '#000000', 'offset': '100%'}];
        stops.forEach(e => {
            const stop: Element = document.createElementNS(svgns, 'stop');
            stop.setAttribute('offset', e.offset);
            stop.setAttribute('stop-color', e.color);
            grad.appendChild(stop);
        });
        grad.id = 'gradientBar';
        grad.setAttribute('x1', '0');
        grad.setAttribute('x2', '1');
        grad.setAttribute('y1', '0');
        grad.setAttribute('y2', '0');
        defs.appendChild(grad);
        rect.setAttribute('fill', 'url(#gradientBar)');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        svg.appendChild(defs);
        svg.appendChild(rect);
        svg.classList.add('gradientBar');
        svg.setAttribute('type', 'image/svg+xml');
        if (delay) svg.style.animationDelay = `${delay}ms`;
        return svg;
    }

}

class Objects {
    /**
     * Initializes the rabbit
     */
    static rabbit(): void {
        const left: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('rabbitLeft'),
            leftCtx: CanvasRenderingContext2D = <CanvasRenderingContext2D>left.getContext('2d'),
            right: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('rabbitRight'),
            rightCtx: CanvasRenderingContext2D = <CanvasRenderingContext2D>right.getContext('2d'),
            img: HTMLImageElement = <HTMLImageElement>document.getElementById('rabbitIMG');
        console.log(img);
        left.width = img.width / 2;
        left.height = img.height * 2;
        right.width = img.width / 2;
        right.height = img.height * 2;
        leftCtx.drawImage(img, 0, 0, left.width, left.height, 0, 0, left.width, left.height);
        rightCtx.drawImage(img, right.width, 0, right.width, right.height, 0, 0, right.width, right.height);
    }

    /**
     * Creates an owl
     */
    static owl(): void {
        const area = document.getElementById('owlContainer')!,
            owl: HTMLObjectElement = <HTMLObjectElement>area.children[0].cloneNode(true),
            funcs = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end'],
            index = Math.floor(Math.random() * funcs.length);
        owl.style.animationTimingFunction = funcs[index];
        if (area.children.length % 2 === 1) owl.style.animationDirection = 'reverse';
        area.appendChild(owl);
    }
}

class Scroller {
    private static textXpos: number = window.innerWidth;

    static basic(): void {
        requestAnimationFrame(Scroller.scroll);
    }

    static scroll(timestamp: number) {
        const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('scroller'),
            ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, -20, 0, canvas.height);
        canvas.height = 200;
        canvas.width = window.innerWidth;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'black');
        gradient.addColorStop(0.5, 'yellow');
        gradient.addColorStop(1, 'black');
        ctx.font = `${canvas.height}px sans-serif`;
        ctx.fillStyle = gradient;
        ctx.textBaseline = 'hanging';
        Scroller.textXpos -= 5;
        if (Scroller.textXpos <= -(ctx.measureText(taso3text).width)) Scroller.textXpos = window.innerWidth;
        ctx.fillText(taso3text, Scroller.textXpos, 0);
        requestAnimationFrame(Scroller.scroll);
    }
}

window.onload = () => {
    vt4.main();
};
