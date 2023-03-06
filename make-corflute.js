const { DOMImplementation, XMLSerializer } = require('@xmldom/xmldom');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
const pdfStream = fs.createWriteStream(`out/letters.pdf`);

//Variables
const isles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
const pageWidth = 297//297//600;
const pageHeight = 420//420//450;
const fontSize = 326;

//Derived stuff
const pdfDoc = new PDFDocument({size: [pageWidth * 0.0393701 * 72, pageHeight * 0.0393701 * 72], info: {Title: 'GCP isle labels', Author: 'Aidan O\'Brien'}});

const pageNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
pageNode.setAttribute('width', `${pageWidth}mm`);
pageNode.setAttribute('height', `${pageHeight}mm`);
pageNode.setAttribute('viewBox', `0 0 ${pageWidth} ${pageHeight}`);

const whiteBoxNode = document.createElement('rect');
whiteBoxNode.setAttribute('style', 'fill:#fff');
whiteBoxNode.setAttribute('width', '100%');
whiteBoxNode.setAttribute('height', `${pageHeight}px`);


const titleTextNode = document.createElement('text');
titleTextNode.setAttribute('style', `font-style:normal;font-weight:900;font-size:${fontSize}px;font-family:sans-serif;fill:#000`);
titleTextNode.setAttribute('x', `${pageWidth / 2}px`);
titleTextNode.setAttribute('y', `${pageHeight / 2}px`);
titleTextNode.setAttribute('text-anchor', 'middle');
titleTextNode.setAttribute('dominant-baseline', 'central');

pageNode.appendChild(whiteBoxNode);
pageNode.appendChild(titleTextNode);

pdfDoc.pipe(pdfStream);

isles.forEach((isle, i) => {
  titleTextNode.textContent = isle;
  const svgText = new XMLSerializer().serializeToString(pageNode);
  if (i > 0) pdfDoc.addPage();

  SVGtoPDF(pdfDoc, svgText, 0, 0);
  pdfDoc.addPage();
  SVGtoPDF(pdfDoc, svgText, 0, 0);
  pdfDoc.addPage();
  SVGtoPDF(pdfDoc, svgText, 0, 0);
  pdfDoc.addPage();
  SVGtoPDF(pdfDoc, svgText, 0, 0);
})

pdfDoc.end();
