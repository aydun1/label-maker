const { DOMImplementation, XMLSerializer } = require('@xmldom/xmldom');
const JsBarcode = require('jsbarcode');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const nameSpace = 'http://www.w3.org/2000/svg';
const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);


// vvv configuration options vvv
const isles_nsw = [
  {isle: 'A', levels: [1, 2], sections: 22, arrows: 'l'},
  {isle: 'B', levels: [1, 2, 3], sections: 19, arrows: 'r'},
  {isle: 'C', levels: [1, 2, 3], sections: 19, arrows: 'l'},
  {isle: 'D', levels: [1, 2, 3], sections: 26, arrows: 'r'},
  {isle: 'E', levels: [1, 2, 3, 4], sections: 62, sides: 2},
  {isle: 'F', levels: [1, 2, 3, 4], sections: 62, sides: 2},
  {isle: 'G', levels: [1, 2, 3, 4], sections: 62, sides: 2},
  {isle: 'H', levels: [1, 2, 3, 4], sections: 76, arrows: 'rllrrllrrl-rllrrllrrllrrllrrllrrllrr-llrrl-rllrr-llrrl-rllrr-llrrl-rllrr-llr'}
];

const isles_wa = [
  {isle: 'B', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 1, numbers: 'odd', side: 'left'},
  {isle: 'B', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'C', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'D', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'E', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'F', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 1, numbers: 'odd', side: 'right'},
  {isle: 'F', levels: [1, 2, 3, 4, 5], sections: 68, sides: 1, numbers: 'even', side: 'left'},
  {isle: 'G', levels: [1, 2, 3, 4], sections: 68, sides: 2},
  {isle: 'H', levels: [1, 2, 3, 4], sections: 68, sides: 1, numbers: 'odd', side: 'right'},
  {isle: 'H', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 1, numbers: 'even', side: 'left'}
];

const isles_hea = [
  {isle: 'A', levels: [1, 2, 3], sections: 33, sides: 1, arrows: 'l'},
  {isle: 'B', levels: [1, 2, 3], sections: 36, sides: 1, arrows: 'r'},
  {isle: 'B', levels: [1], sections: 2, sides: 1, arrows: 'r', startAt: 37},
  {isle: 'B', levels: [1, 2, 3, 4], sections: 4, sides: 1, arrows: 'r', startAt: 39},
  {isle: 'B', levels: [1, 2, 3], sections: 3, sides: 1, arrows: 'r', startAt: 43},
  {isle: 'C', levels: [1, 2, 3, 4], sections: 16, sides: 1, arrows: 'l'},
  {isle: 'C', levels: [1, 2, 3], sections: 20, sides: 1, arrows: 'l', startAt: 17},
  {isle: 'C', levels: [1], sections: 2, sides: 1, arrows: 'l', startAt: 37},
  {isle: 'C', levels: [1, 2, 3], sections: 7, sides: 1, arrows: 'l', startAt: 39},
  {isle: 'D', levels: [1, 2, 3], sections: 28, sides: 1, arrows: 'r'},
  {isle: 'D', levels: [1], sections: 1, sides: 1, arrows: 'r', startAt: 29},
  {isle: 'D', levels: [1, 2, 3], sections: 18, sides: 1, arrows: 'r', startAt: 30},
  {isle: 'E', levels: [1, 2, 3], sections: 1, sides: 1, arrows: 'r'},
  {isle: 'E', levels: [1, 2, 3], sections: 1, sides: 1, arrows: 'l'},
  {isle: 'E', levels: [1], sections: 1, sides: 1, arrows: 'l', startAt: 2},
  {isle: 'E', levels: [1], sections: 1, sides: 1, arrows: 'r', startAt: 2},
];

const isles_qld = [
  {isle: 'A', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2, numbers: 'odd'},
  {isle: 'B', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'C', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'D', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'E', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'F', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'G', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'H', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'I', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2},
  {isle: 'J', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2, numbers: 'even'}

];

const outputPdfFileName = 'out/barcodes.pdf';
const outputBinsFileName = 'out/bins.txt';
const colours = ['fff101', 'b18ec1', '15c0f2', '9ad2ae', 'f15921', 'acb7b8'];
const pageWidth = 600;
const pageHeight = 450;
const headingRatio = 0.08;
const tickHeight = 2;
const tickWidth = 0.1;
const pageAlign = 'left';
const onlyVertical = true;
const barcodeSettings = {
  background: 'none',
  fontSize: 6,
  fontOptions: 'bold',
  textMargin: 0.1,
  height: 25, width: 0.7,
  marginBotton: 3, marginLeft: 5, marginRight: 5, marginTop: 3,
  xmlDocument: document
};
// ^^^ configuration options ^^^


// Derived values
const pdfStream = fs.createWriteStream(outputPdfFileName);
const binsFile = fs.createWriteStream(outputBinsFileName);
const barcodeNode = document.createElementNS(nameSpace, 'svg');
const leftMargin = pageAlign === 'left' ? 0 : pageAlign === 'right' ? pageWidth % labelWidth : pageWidth % labelWidth / 2;
const doc = new PDFDocument({size: [pageWidth * 0.0393701 * 72, pageHeight * 0.0393701 * 72]});

const leftArrow = document.createElementNS(nameSpace, 'path');
leftArrow.setAttribute('d', 'M63 23V8H22V0L0 15.5 22 31v-8z');

const rightArrow = document.createElementNS(nameSpace, 'path');
rightArrow.setAttribute('d', 'M0 23V8h41V0l22 15.5L41 31v-8z');

let pageNumber = 0;
let labelNumber = 0;
let pageLabelNumber = 0;
let pageNode = initPageNode();
let bins = [];

function saveToSvg() {
  const svgText = new XMLSerializer().serializeToString(pageNode);
  fs.writeFileSync(`out/page${pageNumber}.svg`, svgText);
}

function saveToPdf() {
  if (pageNumber > 1) doc.addPage();
  const svgText = new XMLSerializer().serializeToString(pageNode);
  SVGtoPDF(doc, svgText, 0, 0);
};

function initPageNode() {
  pageLabelNumber = 0;
  pageNumber += 1;
  const pageNode = document.createElementNS(nameSpace, 'svg');
  pageNode.setAttribute('width', `${pageWidth}mm`);
  pageNode.setAttribute('height', `${pageHeight}mm`);
  pageNode.setAttribute('viewBox', `0 0 ${pageWidth} ${pageHeight}`);
  return pageNode;
}

function addLabelToPage(labelNode, labelHeight, labelWidth) {
  const horizontalSpacing = 0;
  const fitX = Math.floor(pageWidth / labelWidth);
  const extrasY = Math.floor((pageHeight - labelHeight) / labelWidth);
  const extrasX = Math.floor(pageWidth / (labelHeight + horizontalSpacing));
  const extraLabels = extrasY * extrasX;
  const totalLabels = fitX + extraLabels;
  if (pageLabelNumber < fitX) {
    labelNode.setAttribute('transform', `translate(${leftMargin + pageLabelNumber * labelWidth}, ${pageHeight - labelHeight})`);
    pageNode.appendChild(labelNode);
  } else if (pageLabelNumber < totalLabels && !onlyVertical) {
    const extra = extraLabels - (totalLabels - pageLabelNumber);
    const xCoord = extra % extrasX;
    const yCoord = Math.floor(extra / extrasX);
    const moveX = labelHeight * xCoord + horizontalSpacing * xCoord;
    const moveY = labelWidth * yCoord + labelWidth;
    labelNode.setAttribute('transform', `rotate(270) translate(-${moveY}, ${moveX})`);
    pageNode.appendChild(labelNode);
  } else {
    saveToPdf();
    saveToSvg();
    pageNode = initPageNode();
    labelNode.setAttribute('transform', `translate(${leftMargin + pageLabelNumber * labelWidth}, ${pageHeight - labelHeight}px)`);
    pageNode.appendChild(labelNode);
  }
  pageLabelNumber += 1;
  labelNumber += 1;
}

isles_hea.forEach((isle) => {
  const headingBlockHeight = headingRatio * pageHeight;
  const topHeadingHeight = headingBlockHeight;
  const bottomHeadingHeight = 2 * headingBlockHeight;
  const tileHeight = Math.min((pageHeight - topHeadingHeight - bottomHeadingHeight) / isle['levels'].length, 57);
  const blackBoxHeight = headingRatio * pageHeight;
  const labelHeight = tileHeight * isle['levels'].length + headingBlockHeight * 2 + blackBoxHeight;
  const labelWidth = 81;
  const yScale = tileHeight / 60;
  const xScale = labelWidth / 81;
  const startAt = isle['startAt'] || 1;

  let odd = 1;
  let even = 2;
  const sectionArr = [...Array(isle['sections']).keys()].map(_ => _ + startAt).filter(_ => isle.numbers ? isle.numbers === 'even' ? _ % 2 === 0 : _ % 2 !== 0  : _);
  console.log(sectionArr)
  sectionArr.forEach((section, index) => {
    const loc = `${isle['isle']}${section.toLocaleString('en-AU', {minimumIntegerDigits: 2, useGrouping:false})}`;
    const labelNode = document.createElement('g');

    const startTopTickNode = document.createElement('rect');
    startTopTickNode.setAttribute('width', `0.1px`);
    startTopTickNode.setAttribute('height', `${tickHeight}px`);
    startTopTickNode.setAttribute('x', `${ - tickWidth / 2}px`);

    const startBottomTickNode = document.createElement('rect');
    startBottomTickNode.setAttribute('style', 'fill:#fff');
    startBottomTickNode.setAttribute('width', `0.1px`);
    startBottomTickNode.setAttribute('height', `${tickHeight}px`);
    startBottomTickNode.setAttribute('x', `${- tickWidth / 2}px`);
    startBottomTickNode.setAttribute('y', `${labelHeight - tickHeight}px`);

    const endTopTickNode = document.createElement('rect');
    endTopTickNode.setAttribute('width', `0.1px`);
    endTopTickNode.setAttribute('height', `${tickHeight}px`);
    endTopTickNode.setAttribute('x', `${labelWidth - tickWidth / 2}px`);

    const endBottomTickNode = document.createElement('rect');
    endBottomTickNode.setAttribute('style', 'fill:#fff');
    endBottomTickNode.setAttribute('width', `0.1px`);
    endBottomTickNode.setAttribute('height', `${tickHeight}px`);
    endBottomTickNode.setAttribute('x', `${labelWidth - tickWidth / 2}px`);
    endBottomTickNode.setAttribute('y', `${labelHeight - tickHeight}px`);

    const titleTextNode = document.createElement('text');
    titleTextNode.setAttribute('style', 'font-style:normal;font-weight:700;font-size:26px;font-family:sans-serif;fill:#fff');
    titleTextNode.setAttribute('x', `${labelWidth / 2}px`);
    titleTextNode.setAttribute('y', `${isle['levels'].length * tileHeight + headingBlockHeight * 2 + (headingBlockHeight + 18) / 2}px`);
    titleTextNode.setAttribute('text-anchor', 'middle');
    titleTextNode.textContent = loc;

    const whiteBoxNode = document.createElement('rect');
    whiteBoxNode.setAttribute('style', 'fill:#fff');
    whiteBoxNode.setAttribute('width', `${labelWidth}px`);
    whiteBoxNode.setAttribute('height', `${labelHeight}px`);

    const blackBoxNode = document.createElement('rect');
    blackBoxNode.setAttribute('style', 'fill:#000');
    blackBoxNode.setAttribute('width', `${labelWidth}px`);
    blackBoxNode.setAttribute('height', `${blackBoxHeight}px`);
    blackBoxNode.setAttribute('y', `${isle['levels'].length * tileHeight + headingBlockHeight * 2}px`);

    function whichArrow() {
      if (isle['arrows']) {
        const direction = isle['arrows'][(section - 1) % isle['arrows']?.length];
        return direction== 'l' ? leftArrow.cloneNode() : direction == 'r' ? rightArrow.cloneNode() : '';
      };
      switch(isle['sides']) {
        case 1:
          return (isle.side === 'left' && index % 2 === 0 || isle.side === 'right' && index % 2 !== 0? leftArrow.cloneNode() : rightArrow.cloneNode());
        case 2:
          const arrow = (section % 2 === 0 && even !== section || odd === section ? rightArrow : leftArrow);
          if (section === even) even += 4;
          if (section === odd) odd += 4;
          return arrow.cloneNode()
      }
    }

    const arrowHeight = 31;
    const arrowX = labelWidth / 2 - 31.5 * xScale;
    const arrow = whichArrow();

    const topArrowContainer = document.createElementNS(nameSpace, 'g');
    topArrowContainer.setAttribute('transform', `translate(${arrowX}, ${(headingBlockHeight - arrowHeight * yScale) / 2 }) scale(${xScale}, ${yScale})`);
    if (arrow) topArrowContainer.appendChild(arrow);

    const bottomArrowContainer = document.createElementNS(nameSpace, 'g');
    bottomArrowContainer.setAttribute('transform', `translate(${arrowX}, ${isle['levels'].length * tileHeight + headingBlockHeight + (headingBlockHeight - arrowHeight * yScale) / 2}) scale(${xScale}, ${yScale})`);
    if (arrow) bottomArrowContainer.appendChild(arrow.cloneNode());

    labelNode.appendChild(whiteBoxNode);
    labelNode.appendChild(blackBoxNode);
    labelNode.appendChild(titleTextNode);
    labelNode.appendChild(topArrowContainer)
    labelNode.appendChild(bottomArrowContainer);
    labelNode.appendChild(startTopTickNode);
    labelNode.appendChild(startBottomTickNode);
    labelNode.appendChild(endTopTickNode);
    labelNode.appendChild(endBottomTickNode);
    
    isle['levels'].forEach((level, i) => {
      const label = `${loc}-${level}`;
      bins.push(label);
      JsBarcode(barcodeNode, label, barcodeSettings);
      const bNode = barcodeNode.getElementsByTagName('g')[0];

      bNode.setAttribute('style', 'shape-rendering:crispEdges');
      bNode.setAttribute('transform', 'translate(-31.5, 3)');

      const tileNode = document.createElement('rect');
      tileNode.setAttribute('style', `fill:#${colours[i]}`);
      tileNode.setAttribute('width', `${labelWidth}px`);
      tileNode.setAttribute('height', `${tileHeight}px`);
      tileNode.setAttribute('y', `${topHeadingHeight + tileHeight * (isle['levels'].length - 1 - i)}px`);

      const levelTextNode = document.createElement('text');
      levelTextNode.textContent = `LEVEL ${level}`;
      levelTextNode.setAttribute('style', 'font-style:normal;font-weight:400;font-size:14px;font-family:sans-serif;fill:#000');
      levelTextNode.setAttribute('text-anchor', 'middle');
      levelTextNode.setAttribute('x', `0`);
      levelTextNode.setAttribute('y', `${50 * 1.06}px`);

      const windowNode = document.createElement('rect');
      windowNode.setAttribute('style', 'fill:#fff');
      windowNode.setAttribute('width', `${labelWidth - 9}px`);
      windowNode.setAttribute('height', '37px');
      windowNode.setAttribute('x', `${-(labelWidth - 9) / 2}`);

      const gNode = document.createElement('g');

      const scale = Math.min(xScale, yScale);
      gNode.setAttribute('transform', `translate(${labelWidth / 2}, ${topHeadingHeight + tileHeight * (isle['levels'].length - 1 - i) + (tileHeight - 54 * scale) / 2}) scale(${scale}, ${scale})`);
      gNode.appendChild(windowNode);
      gNode.appendChild(bNode);
      gNode.appendChild(levelTextNode);

      labelNode.appendChild(tileNode);
      labelNode.appendChild(gNode);
    });

    addLabelToPage(labelNode, labelHeight, labelWidth);
  })
})
doc.pipe(pdfStream);

if (pageLabelNumber > 0) saveToPdf();
doc.end();


binsFile.write([...new Set(bins)].sort().join('\r\n'));

console.log(`Created ${labelNumber} labels on ${pageNumber} pages`);