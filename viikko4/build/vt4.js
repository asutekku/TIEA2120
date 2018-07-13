'use strict';
const gradients = 10;
const svgns = 'http://www.w3.org/2000/svg';
class vt4 {
    static main() {
        createGradients();
        setHandlers();
        Objects.rabbit();
    }
}
function createGradients() {
    const area = document.getElementById('barContainer');
    const interval = 2000 / gradients;
    for (let i = 0; i < gradients; i++) {
        const bar = SVG.gradientBar(interval * i);
        area.appendChild(bar);
    }
}
function setHandlers() {
    document.getElementById("owlButton").onclick = () => {
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
    static gradientBar(delay) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), defs = document.createElementNS(svgns, 'defs'), grad = document.createElementNS(svgns, 'linearGradient'), rect = document.createElementNS(svgns, 'rect'), stops = [
            { 'color': '#000000', 'offset': '0%' },
            { 'color': '#206DFF', 'offset': '50%' },
            { 'color': '#000000', 'offset': '100%' }
        ];
        stops.forEach(e => {
            const stop = document.createElementNS(svgns, 'stop');
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
        if (delay)
            svg.style.animationDelay = `${delay}ms`;
        return svg;
    }
}
class Objects {
    /**
     * Initializes the rabbit
     */
    static rabbit() {
        const left = document.getElementById('rabbitLeft'), leftCtx = left.getContext('2d'), right = document.getElementById('rabbitRight'), rightCtx = right.getContext('2d'), img = document.getElementById('rabbitIMG');
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
    static owl() {
        const area = document.getElementById('owlContainer'), owl = area.children[0].cloneNode(true), funcs = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end'], index = Math.floor(Math.random() * funcs.length);
        owl.style.animationTimingFunction = funcs[index];
        if (area.children.length % 2 === 1)
            owl.style.animationDirection = 'reverse';
        area.appendChild(owl);
    }
}
window.onload = () => {
    vt4.main();
};
