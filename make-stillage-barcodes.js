const { DOMImplementation, XMLSerializer } = require('@xmldom/xmldom');
const JsBarcode = require('jsbarcode');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const pdfStream = fs.createWriteStream(`out/barcodes.pdf`);
const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
const nameSpace = 'http://www.w3.org/2000/svg';
const barcodeNode = document.createElementNS(nameSpace, 'svg');
const binsFile = fs.createWriteStream('out/bins.txt');

//Variables
const sections = 100;
const colours = ['acb7b8', 'f15921', '9ad2ae', '15c0f2', 'b18ec1', 'fff101'];
const labelWidth = 81;
const pageWidth = 600//297//600;
const pageHeight = 450//420//450;
const headingRatio = 0.08;
const tickHeight = 2;
const tickWidth = 0.1;
const pageAlign = 'left'; // left, right, center
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
const xScale = labelWidth / 81;
const yScale = pageHeight / 450 *  6 / levels.length;
const sectionArr = [...Array(sections).keys()].map(_ => _ + 1);
const leftMargin = pageAlign === 'left' ? 0 : pageAlign === 'right' ? pageWidth % labelWidth : pageWidth % labelWidth / 2;
const headingBlockHeight = headingRatio * pageHeight;
const topHeadingHeight = headingBlockHeight;
const bottomHeadingHeight = 2 * headingBlockHeight;
const tileHeight = (pageHeight - topHeadingHeight - bottomHeadingHeight) / levels.length;
const doc = new PDFDocument({size: [pageWidth * 0.0393701 * 72, pageHeight * 0.0393701 * 72]});

const leftArrow = document.createElementNS(nameSpace, 'path');
leftArrow.setAttribute('d', 'M63 23V8H22V0L0 15.5 22 31v-8z');

const rightArrow = document.createElementNS(nameSpace, 'path');
rightArrow.setAttribute('d', 'M0 23V8h41V0l22 15.5L41 31v-8z');

function saveToSvg() {
  const svgText = new XMLSerializer().serializeToString(pageNode);
  fs.writeFileSync(`out/page${page}.svg`, svgText);
}

function saveToPdf() {
  if (page > 1) doc.addPage();
  const svgText = new XMLSerializer().serializeToString(pageNode);
  SVGtoPDF(doc, svgText, 0, 0);
};

function initPageNode() {
  labelNumber = 0;
  page += 1;

  const pageNode = document.createElementNS(nameSpace, 'svg');
  pageNode.setAttribute('width', `${pageWidth}mm`);
  pageNode.setAttribute('height', `${pageHeight}mm`);
  pageNode.setAttribute('viewBox', `0 0 ${pageWidth} ${pageHeight}`);

  const blackBoxNode = document.createElement('rect');
  blackBoxNode.setAttribute('style', 'fill:#000');
  blackBoxNode.setAttribute('width', '100%');
  blackBoxNode.setAttribute('height', `${headingRatio * pageHeight}px`);
  blackBoxNode.setAttribute('y', `${pageHeight - headingRatio * pageHeight}px`);

  const whiteBoxNode = document.createElement('rect');
  whiteBoxNode.setAttribute('style', 'fill:#fff');
  whiteBoxNode.setAttribute('width', '100%');
  whiteBoxNode.setAttribute('height', `${pageHeight}px`);

  pageNode.appendChild(whiteBoxNode);
  pageNode.appendChild(blackBoxNode);

  levels.forEach((level, i) => {
    const tileNode = document.createElement('rect');
    tileNode.setAttribute('style', `fill:#${colours[levels.length - 1 - i]}`);
    tileNode.setAttribute('width', '100%');
    tileNode.setAttribute('height', `${tileHeight}px`);
    tileNode.setAttribute('y', `${topHeadingHeight + tileHeight * (levels.length - 1 - i)}px`);
    pageNode.appendChild(tileNode);
  })
  return pageNode;
}

let page = 0;
let labelNumber = 0;
let pageNode = initPageNode();
isles.forEach(isle => {
  let odd = 1;
  let even = 2;
  sectionArr.forEach(s => {
    const loc = `${isle}${s.toLocaleString('en-AU', {minimumIntegerDigits: 2, useGrouping:false})}`;

    const labelNode = document.createElement('g');
    labelNode.setAttribute('transform', `translate(${leftMargin + labelNumber * labelWidth}, 0)`);

    const startTopTickNode = document.createElement('rect');
    startTopTickNode.setAttribute('width', `0.1px`);
    startTopTickNode.setAttribute('height', `${tickHeight}px`);
    startTopTickNode.setAttribute('x', `${ - tickWidth / 2}px`);

    const startBottomTickNode = document.createElement('rect');
    startBottomTickNode.setAttribute('style', 'fill:#fff');
    startBottomTickNode.setAttribute('width', `0.1px`);
    startBottomTickNode.setAttribute('height', `${tickHeight}px`);
    startBottomTickNode.setAttribute('x', `${- tickWidth / 2}px`);
    startBottomTickNode.setAttribute('y', `${pageHeight - tickHeight}px`);

    const endTopTickNode = document.createElement('rect');
    endTopTickNode.setAttribute('width', `0.1px`);
    endTopTickNode.setAttribute('height', `${tickHeight}px`);
    endTopTickNode.setAttribute('x', `${labelWidth - tickWidth / 2}px`);

    const endBottomTickNode = document.createElement('rect');
    endBottomTickNode.setAttribute('style', 'fill:#fff');
    endBottomTickNode.setAttribute('width', `0.1px`);
    endBottomTickNode.setAttribute('height', `${tickHeight}px`);
    endBottomTickNode.setAttribute('x', `${labelWidth - tickWidth / 2}px`);
    endBottomTickNode.setAttribute('y', `${pageHeight - tickHeight}px`);

    if (pageAlign !== 'left') labelNode.appendChild(startTopTickNode);
    if (pageAlign !== 'left') labelNode.appendChild(startBottomTickNode);
    if (pageAlign !== 'right') labelNode.appendChild(endTopTickNode);
    if (pageAlign !== 'right') labelNode.appendChild(endBottomTickNode);

    const titleTextNode = document.createElement('text');
    titleTextNode.setAttribute('style', 'font-style:normal;font-weight:700;font-size:26px;font-family:sans-serif;fill:#fff');
    titleTextNode.setAttribute('x', `${labelWidth / 2}px`);
    titleTextNode.setAttribute('y', `${pageHeight - (headingBlockHeight - 18) / 2}px`);
    titleTextNode.setAttribute('text-anchor', 'middle');
    titleTextNode.textContent = loc;

    const arrowHeight = 31;
    const arrowX = labelWidth / 2 - 31.5 * xScale;
    const arrow = (s % 2 === 0 && even !== s || odd === s ? rightArrow : leftArrow).cloneNode();

    const topArrowContainer = document.createElementNS(nameSpace, 'g');
    topArrowContainer.setAttribute('transform', `translate(${arrowX}, ${(headingBlockHeight - arrowHeight * yScale) / 2 }) scale(${xScale}, ${yScale})`);
    topArrowContainer.appendChild(arrow);

    const bottomArrowContainer = document.createElementNS(nameSpace, 'g');
    bottomArrowContainer.setAttribute('transform', `translate(${arrowX}, ${pageHeight - bottomHeadingHeight + (headingBlockHeight - arrowHeight * yScale) / 2}) scale(${xScale}, ${yScale})`);
    bottomArrowContainer.appendChild(arrow.cloneNode());

    if (s === even) even += 4;
    if (s === odd) odd += 4;

    labelNode.appendChild(titleTextNode);
    labelNode.appendChild(topArrowContainer)
    labelNode.appendChild(bottomArrowContainer);
  
    levels.forEach((level, i) => {
      const label = `${loc}-${level}`;
      //binsFile.write(`INSERT INTO #BIN_IMPORT VALUES('${site}','${label}');\n`);
      binsFile.write(`${label}\r\n`);
      JsBarcode(barcodeNode, label, barcodeSettings);
      const bNode = barcodeNode.getElementsByTagName('g')[0];

      bNode.setAttribute('style', 'shape-rendering:crispEdges');
      bNode.setAttribute('transform', 'translate(-31.5, 3)');

      const levelTextNode = document.createElement('text');
      levelTextNode.textContent = `LEVEL ${level}`;
      levelTextNode.setAttribute('style', 'font-style:normal;font-weight:400;font-size:14px;font-family:sans-serif;fill:#000');
      levelTextNode.setAttribute('text-anchor', 'middle');
      levelTextNode.setAttribute('x', `0`);
      levelTextNode.setAttribute('y', '50px');

      const windowNode = document.createElement('rect');
      windowNode.setAttribute('style', 'fill:#fff');
      windowNode.setAttribute('width', `${labelWidth - 9}px`);
      windowNode.setAttribute('height', '37px');
      windowNode.setAttribute('x', `${-(labelWidth - 9) / 2}`);

      const gNode = document.createElement('g');

      const scale = Math.min(xScale, yScale);
      gNode.setAttribute('transform', `translate(${labelWidth / 2}, ${topHeadingHeight + tileHeight * (levels.length - 1 - i) + (tileHeight - 50 * scale) / 2}) scale(${scale}, ${scale})`);
      gNode.appendChild(windowNode);
      gNode.appendChild(bNode);
      gNode.appendChild(levelTextNode);

      labelNode.appendChild(gNode);
    });

    labelNumber += 1;
    pageNode.appendChild(labelNode);
    if (labelWidth * (labelNumber + 1) > pageWidth) {
      saveToPdf();
      saveToSvg()
      pageNode = initPageNode();
    }
  })
})
doc.pipe(pdfStream);

if (labelNumber > 0) saveToPdf();
doc.end();
