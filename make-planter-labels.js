const { DOMImplementation, XMLSerializer } = require('@xmldom/xmldom');
const JsBarcode = require('jsbarcode');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const readXlsxFile = require('read-excel-file/node')
const fs = require('fs');
const pdfStream = fs.createWriteStream(`out/barcodes.pdf`);
const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
const nameSpace = 'http://www.w3.org/2000/svg';
const barcodeNode = document.createElementNS(nameSpace, 'svg');
const { logoNode } = require('./gcp-logo');

const pageWidth = 100;
const pageHeight = 100;
const barcodeSettings = {
  background: 'none',
  fontSize: 6,
  fontOptions: 'bold',
  textMargin: 0.1,
  height: 20,
  width: 0.5,
  marginBotton: 3,
  marginLeft: 5,
  marginRight: 5,
  marginTop: 3,
  xmlDocument: document,
};

const doc = new PDFDocument({size: [pageWidth * 0.0393701 * 72, pageHeight * 0.0393701 * 72]});

function saveToSvg(fName, pageNode) {
  const svgText = new XMLSerializer().serializeToString(pageNode);
  fs.writeFileSync(`out/${fName}.svg`, svgText);
}

function saveToPdf(pageNode) {
  if (page > 1) doc.addPage();
  const svgText = new XMLSerializer().serializeToString(pageNode);
  SVGtoPDF(doc, svgText, 0, 0);
};

let page = 0;

async function makeLabels() {
  const products = (await readXlsxFile('planter bag label table.xlsx')).slice(1);

  products.forEach(product => {
    page += 1;

    const pageNode = document.createElementNS(nameSpace, 'svg');
    pageNode.setAttribute('width', `${pageWidth}mm`);
    pageNode.setAttribute('height', `${pageHeight}mm`);
    pageNode.setAttribute('viewBox', `0 0 ${pageWidth} ${pageHeight}`);

    const whiteBoxNode = document.createElement('rect');
    whiteBoxNode.setAttribute('style', 'fill:#fff');
    whiteBoxNode.setAttribute('width', '100px');
    whiteBoxNode.setAttribute('height', '100px');
    pageNode.appendChild(whiteBoxNode);




    const topRightBoxNode = document.createElement('rect');
    topRightBoxNode.setAttribute('style', 'fill:#fff;stroke:#000000;stroke-width:0.5');
    topRightBoxNode.setAttribute('width', '50px');
    topRightBoxNode.setAttribute('height', `30px`);
    topRightBoxNode.setAttribute('x', `${pageWidth - 50 - 5}px`);
    topRightBoxNode.setAttribute('y', `${5}px`);
    pageNode.appendChild(topRightBoxNode);




    const topRightText = document.createElement('g');
    const topRightLine1TextNode = document.createElement('text');
    const xPos = pageWidth - 5 - 50 / 2;
    topRightLine1TextNode.setAttribute('style', 'font-style:normal;font-size:10px;font-weight:bold;font-family:sans-serif');
    topRightLine1TextNode.setAttribute('x', `${xPos}px`);
    topRightLine1TextNode.setAttribute('y', '18px');
    topRightLine1TextNode.setAttribute('text-anchor', 'middle');
    topRightLine1TextNode.textContent = `${product[6]} L`;
    topRightText.appendChild(topRightLine1TextNode);
  
    const topRightLine2TextNode = document.createElement('text');
    topRightLine2TextNode.setAttribute('style', 'font-style:normal;font-size:10px;font-weight:bold;font-family:sans-serif');
    topRightLine2TextNode.setAttribute('x', `${xPos}px`);
    topRightLine2TextNode.setAttribute('y', '28.5px');
    topRightLine2TextNode.setAttribute('text-anchor', 'middle');
    topRightLine2TextNode.textContent = `${product[4]}`;
    topRightText.appendChild(topRightLine2TextNode);


    if (product[2] !== 'Black') {
      const topRightLine3TextNode = document.createElement('text');
      topRightLine3TextNode.setAttribute('style', 'font-style:normal;font-size:10px;font-weight:bold;font-family:sans-serif');
      topRightLine3TextNode.setAttribute('x', `${xPos}px`);
      topRightLine3TextNode.setAttribute('y', '39px');
      topRightLine3TextNode.setAttribute('text-anchor', 'middle');
      topRightLine3TextNode.textContent = product[2].toUpperCase();
      topRightText.appendChild(topRightLine3TextNode);
      topRightText.setAttribute('transform', `translate(0, -5)`);

    }


    pageNode.appendChild(topRightText);










    const middleBoxNode = document.createElement('rect');
    middleBoxNode.setAttribute('style', 'fill:#fff;stroke:#000000;stroke-width:0.5');
    middleBoxNode.setAttribute('width', `${pageWidth - 10}px`);
    middleBoxNode.setAttribute('height', `20px`);
    middleBoxNode.setAttribute('x', `${5}px`);
    middleBoxNode.setAttribute('y', `45px`);
    pageNode.appendChild(middleBoxNode);

    const descriptionTextNode = document.createElement('text');
    descriptionTextNode.setAttribute('style', 'font-style:normal;font-size:6px;font-family:sans-serif');
    descriptionTextNode.setAttribute('x', `${pageWidth / 2}px`);
    descriptionTextNode.setAttribute('y', '42px');
    descriptionTextNode.setAttribute('text-anchor', 'middle');
    descriptionTextNode.textContent = `Poly Planter Bags - ${product[2]}`;
    pageNode.appendChild(descriptionTextNode);

    const quantityTextNode = document.createElement('text');
    quantityTextNode.setAttribute('style', 'font-style:normal;font-weight:700;font-size:8px;font-family:sans-serif');
    quantityTextNode.setAttribute('x', `${pageWidth / 2}px`);
    quantityTextNode.setAttribute('y', `54px`);
    quantityTextNode.setAttribute('text-anchor', 'middle');
    quantityTextNode.textContent = `Quantity: ${product[11]}`;
    pageNode.appendChild(quantityTextNode);

    const dimensionsTextNode = document.createElement('text');
    dimensionsTextNode.textContent = `Filled size: ${product[9]}(d) x ${product[10]}(h) mm`;
    dimensionsTextNode.setAttribute('style', 'font-style:normal;font-weight:400;font-size:6px;font-family:sans-serif;fill:#000');
    dimensionsTextNode.setAttribute('text-anchor', 'middle');
    dimensionsTextNode.setAttribute('x', `${pageWidth / 2}px`);
    dimensionsTextNode.setAttribute('y', '62px');
    pageNode.appendChild(dimensionsTextNode);

    JsBarcode(barcodeNode, product[0], barcodeSettings);
    const bNode = barcodeNode.getElementsByTagName('g')[0];
    const x = (100 - parseInt(barcodeNode.getAttribute('width').replace('px'))) / 2 + 5;
    bNode.setAttribute('style', 'shape-rendering:crispEdges');
    bNode.setAttribute('transform', `translate(${x}, 69)`);
    pageNode.appendChild(bNode);

    logoNode.setAttribute('transform', `translate(5, 34) scale(0.03, -0.03)`);
    pageNode.appendChild(logoNode);

    saveToPdf(pageNode);
    saveToSvg(product.itemNumber, pageNode);
  })
  doc.pipe(pdfStream);
  doc.end();
}
makeLabels()

