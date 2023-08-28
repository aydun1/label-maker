const { DOMImplementation, XMLSerializer } = require('@xmldom/xmldom');
const JsBarcode = require('jsbarcode');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const nameSpace = 'http://www.w3.org/2000/svg';
const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);

//Variables
const isles2 = [
  {isle: 'A', levels: [1, 2, 3, 4, 5, 6], sections: 24, arrows: 'l'},
  {isle: 'B', levels: [1, 2, 3], sections: 21, arrows: 'r'},
  {isle: 'C', levels: [1, 2, 3], sections: 21, arrows: 'l'},
  {isle: 'D', levels: [1, 2, 3], sections: 28, arrows: 'r'},
  {isle: 'E', levels: [1, 2, 3, 4], sections: 32, sides: 2},
  {isle: 'F', levels: [1, 2, 3, 4], sections: 32, sides: 2},
  {isle: 'G', levels: [1, 2, 3, 4], sections: 32, sides: 2},
  {isle: 'H', levels: [1, 2, 3, 4], sections: 76, arrows: 'rllrrllrrl-rllrrllrrllrrllrrllrrllrr-llrrl-rllrr-llrrl-rllrr-llrrl-rllrr-llr'}
];
const outputPdfFileName = 'out/barcodes.pdf';
const outputBinsFileName = 'out/bins.txt';
const colours = ['acb7b8', 'f15921', '9ad2ae', '15c0f2', 'b18ec1', 'fff101'];
const pageWidth = 600; // 297, 600
const pageHeight = 450; // 420, 450
const headingRatio = 0.08;
const tickHeight = 2;
const tickWidth = 0.1;
const pageAlign = 'left'; // left, right, center
const onlyVertical = false;
const barcodeSettings = {
  background: 'none',
  fontSize: 6,
  fontOptions: 'bold',
  textMargin: 0.1,
  height: 25, width: 0.7,
  marginBotton: 3, marginLeft: 5, marginRight: 5, marginTop: 3,
  xmlDocument: document
};

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
  const fitX = Math.floor(pageWidth / labelWidth);
  const extrasX = Math.floor((pageHeight - labelHeight) / labelWidth);
  const extrasY = Math.floor(pageWidth / labelHeight);
  const extraLabels = extrasX * extrasY;
  const totalLabels = fitX + extraLabels;
  if (pageLabelNumber < fitX) {
    labelNode.setAttribute('transform', `translate(${leftMargin + pageLabelNumber * labelWidth}, ${pageHeight - labelHeight})`);
    pageNode.appendChild(labelNode);
  } else if (pageLabelNumber < totalLabels && !onlyVertical) {
    const extra = extraLabels - (totalLabels - pageLabelNumber);
    const extra2 = extraLabels - (totalLabels - pageLabelNumber);
    const moveX = labelWidth * (extra % extrasX) + labelWidth;
    const moveY = labelHeight * (Math.floor(extra2 /extrasY))
    labelNode.setAttribute('transform', `rotate(270) translate(-${moveX}, ${moveY})`);
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

isles2.forEach((isle) => {
  const headingBlockHeight = headingRatio * pageHeight;
  const topHeadingHeight = headingBlockHeight;
  const bottomHeadingHeight = 2 * headingBlockHeight;
  const tileHeight = Math.min((pageHeight - topHeadingHeight - bottomHeadingHeight) / isle['levels'].length, 60);
  const blackBoxHeight = headingRatio * pageHeight;
  const labelHeight = tileHeight * isle['levels'].length + headingBlockHeight * 2 + blackBoxHeight;
  const labelWidth = 81;
  const yScale = tileHeight / 60;
  const xScale = labelWidth / 81;

  let odd = 1;
  let even = 2;
  const sectionArr = [...Array(isle['sections']).keys()].map(_ => _ + 1);

  sectionArr.forEach(section => {
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
          return (section % 2 === 0 ? leftArrow.cloneNode() : rightArrow.cloneNode());
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
      //binsFile.write(`INSERT INTO #BIN_IMPORT VALUES('${site}','${label}');\n`);
      binsFile.write(`${label}\r\n`);
      JsBarcode(barcodeNode, label, barcodeSettings);
      const bNode = barcodeNode.getElementsByTagName('g')[0];

      bNode.setAttribute('style', 'shape-rendering:crispEdges');
      bNode.setAttribute('transform', 'translate(-31.5, 3)');

      const tileNode = document.createElement('rect');
      tileNode.setAttribute('style', `fill:#${colours[colours.length - (i + 1)]}`);
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
console.log(`Created ${labelNumber} labels on ${pageNumber} pages`);