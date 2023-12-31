const { DOMImplementation, XMLSerializer } = require('@xmldom/xmldom');
const { parse } = require('csv-parse/sync');
const JsBarcode = require('jsbarcode');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const pdfStream = fs.createWriteStream(`out/product_labels.pdf`);
const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
const nameSpace = 'http://www.w3.org/2000/svg';
const barcodeNode = document.createElementNS(nameSpace, 'svg');
const { logoNode } = require('./gcp-logo');

const pageWidth = 100;
const pageHeight = 50;
const barcodeSettings = {
  background: 'none',
  fontSize: 4,
  fontOptions: 'bold',
  textMargin: 0.05,
  height: 10,
  width: 0.4,
  marginBotton: 3,
  marginLeft: 5,
  marginRight: 5,
  marginTop: 3,
  xmlDocument: document,
};

const doc = new PDFDocument({size: [pageWidth * 0.0393701 * 72, pageHeight * 0.0393701 * 72]});

function saveToPdf(pageNode) {
  if (page > 1) doc.addPage();
  const svgText = new XMLSerializer().serializeToString(pageNode);
  SVGtoPDF(doc, svgText, 0, 0);
};

function makeLabel(product) {
  const pageNode = document.createElementNS(nameSpace, 'svg');
  pageNode.setAttribute('width', `${pageWidth}mm`);
  pageNode.setAttribute('height', `${pageHeight}mm`);
  pageNode.setAttribute('viewBox', `0 0 ${pageWidth} ${pageHeight}`);

  const whiteBoxNode = document.createElement('rect');
  whiteBoxNode.setAttribute('style', 'fill:#fff');
  whiteBoxNode.setAttribute('width', `${pageWidth}px`);
  whiteBoxNode.setAttribute('height', `${pageHeight}px`);
  pageNode.appendChild(whiteBoxNode);

  const qtyLine1Text = document.createElement('text');
  qtyLine1Text.setAttribute('style', 'font-style:normal;font-size:4px;font-weight:bold;font-family:sans-serif');
  qtyLine1Text.setAttribute('x', '3px');
  qtyLine1Text.setAttribute('y', `${product['Qty2'] ? '41.7' : product['Note'] ? '44.5' : '45'}px`);
  qtyLine1Text.setAttribute('text-anchor', 'left');
  qtyLine1Text.textContent = `Qty: ${product['Qty1']}`;
  pageNode.appendChild(qtyLine1Text);

  if (product['Qty2']) {
    const qtyLine2Text = document.createElement('text');
    qtyLine2Text.setAttribute('style', 'font-style:normal;font-size:3px;font-weight:bold;font-family:sans-serif');
    qtyLine2Text.setAttribute('x', '3px');
    qtyLine2Text.setAttribute('y', '45.2px');
    qtyLine2Text.setAttribute('text-anchor', 'left');
    qtyLine2Text.textContent = product['Qty2'];
    pageNode.appendChild(qtyLine2Text);
  }

  if (product['Note']) {
    const averageTextNode = document.createElement('text');
    averageTextNode.setAttribute('style', 'font-style:normal;font-size:2px;font-family:sans-serif');
    averageTextNode.setAttribute('text-anchor', 'left');
    averageTextNode.setAttribute('x', '3px');
    averageTextNode.setAttribute('y', '47.8px');
    averageTextNode.textContent = product['Note'];
    pageNode.appendChild(averageTextNode);
  }

  const urlNode = document.createElement('text');
  urlNode.setAttribute('style', 'font-style:normal;font-size:3px;font-family:sans-serif');
  urlNode.setAttribute('x', '68px');
  urlNode.setAttribute('y', '47px');
  urlNode.setAttribute('text-anchor', 'right');
  urlNode.textContent = 'gardencityplastics.com';
  pageNode.appendChild(urlNode);

  const middleBoxNode = document.createElement('rect');
  middleBoxNode.setAttribute('style', 'fill:#fff;stroke:#000000;stroke-width:0.5');
  middleBoxNode.setAttribute('width', `${pageWidth - 10}px`);
  middleBoxNode.setAttribute('height', '20px');
  middleBoxNode.setAttribute('x', '5px');
  middleBoxNode.setAttribute('y', '18px');
  pageNode.appendChild(middleBoxNode);

  const line1Node = document.createElement('text');
  line1Node.setAttribute('style', 'font-style:normal;font-weight:600;font-size:7px;font-family:sans-serif');
  line1Node.setAttribute('x', `${pageWidth / 2}px`);
  line1Node.setAttribute('y', `${product['Line2'] ? 26 : 30}px`);
  line1Node.setAttribute('text-anchor', 'middle');
  line1Node.textContent = product['Line1'];
  pageNode.appendChild(line1Node);

  if (product['Line2']) {
    const line2Node = document.createElement('text');
    line2Node.setAttribute('style', 'font-style:normal;font-weight:600;font-size:7px;font-family:sans-serif');
    line2Node.setAttribute('x', `${pageWidth / 2}px`);
    line2Node.setAttribute('y', '34px');
    line2Node.setAttribute('text-anchor', 'middle');
    line2Node.textContent = product['Line2'];
    pageNode.appendChild(line2Node);
  }

  JsBarcode(barcodeNode, product['ItemNumber'], barcodeSettings);
  const bNode = barcodeNode.getElementsByTagName('g')[0];
  const x = (100 - parseInt(barcodeNode.getAttribute('width').replace('px'))) + 7;
  bNode.setAttribute('style', 'shape-rendering:crispEdges');
  bNode.setAttribute('transform', `translate(${x}, 3)`);
  pageNode.appendChild(bNode);
  logoNode.setAttribute('transform', 'translate(3, 17) scale(0.016, -0.016)');
  pageNode.appendChild(logoNode);
  return pageNode;
}

async function makeLabels() {
  const fileData = fs.readFileSync('data/packed product label table.csv', { flag: 'r' });
  const products = parse(fileData, {columns: true, bom: true});
  products.forEach(product => {
    page += 1;
    const pageNode = makeLabel(product);
    saveToPdf(pageNode);
  })
  doc.pipe(pdfStream);
  doc.end();
}

let page = 0;
makeLabels();

