const { DOMImplementation, XMLSerializer } = require('@xmldom/xmldom');
const fs = require('fs');
const nameSpace = 'http://www.w3.org/2000/svg';
const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);

// vvv configuration options vvv
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
const exceptionsQld = [
  'A33-3', 'A35-3', 'A37-3', 'A39-3', 'A41-3', 'A43-3', 'A45-3', 'A47-3', 'A49-3', 'A51-3', 'A53-3', 'A55-3', 'A57-3', 'A59-3', 'A61-3', 'A63-3', 'A65-3', 'A67-3',
  'A33-5', 'A35-5', 'A37-5', 'A39-5', 'A41-5', 'A43-5', 'A45-5', 'A47-5', 'A49-5', 'A51-5', 'A53-5', 'A55-5', 'A57-5', 'A59-5', 'A61-5', 'A63-5', 'A65-5', 'A67-5',
  'B37-3', 'B39-3', 'B41-3', 'B43-3', 'B45-3', 'B47-3', 'B49-3', 'B51-3', 'B53-3', 'B55-3', 'B57-3', 'B59-3', 'B61-3', 'B63-3', 'B65-3', 'B67-3',
  'B41-5', 'B43-5', 'B45-5', 'B47-5', 'B49-5', 'B51-5', 'B53-5', 'B55-5', 'B57-5', 'B59-5', 'B61-5', 'B63-5', 'B65-5', 'B67-5',
  'D57-3', 'D59-3', 'D61-3', 'D63-3', 'D65-3', 'D67-3',
  'D57-5', 'D59-5', 'D61-5', 'D63-5', 'D65-5', 'D67-5',
  'E01-3', 'E03-3', 'E05-3', 'E07-3', 'E09-3', 'E11-3', 'E13-3', 'E15-3', 'E17-3', 'E19-3', 'E21-3', 'E23-3', 'E25-3', 'E27-3', 'E29-3', 'E31-3',
  'E01-5', 'E03-5', 'E05-5', 'E07-5', 'E09-5', 'E11-5', 'E13-5', 'E15-5', 'E17-5', 'E19-5', 'E21-5', 'E23-5', 'E25-5', 'E27-5', 'E29-5', 'E31-5',
  'E33-2', 'E35-2', 'E37-2', 'E39-2', 'E41-2', 'E43-2', 'E45-2', 'E47-2', 'E49-2', 'E51-2',
  'E53-3', 'E55-3', 'E57-3', 'E59-3', 'E61-3', 'E63-3', 'E65-3', 'E67-3',
  'E58-3', 'E60-3', 'E62-3', 'E64-3', 'E66-3', 'E68-3',
  'E58-5', 'E60-5', 'E62-5', 'E64-5', 'E66-5', 'E68-5',
  'F02-3', 'F04-3', 'F06-3', 'F08-3', 'F10-3', 'F12-3', 'F14-3', 'F16-3', 'F18-3', 'F20-3', 'F22-3', 'F24-3', 'F26-3', 'F28-3', 'F30-3', 'F32-3', 'F34-3', 'F36-3', 'F38-3', 'F40-3', 'F42-3', 'F44-3', 'F46-3', 'F48-3', 'F50-3', 'F52-3', 'F54-3', 'F56-3', 'F58-3', 'F60-3', 'F62-3', 'F64-3', 'F66-3', 'F68-3',
  'I01-2', 'I03-2', 'I05-2', 'I07-2', 'I09-2', 'I11-2', 'I13-2', 'I15-2', 'I17-2', 'I19-2', 'I21-2', 'I23-2', 'I25-2', 'I27-2', 'I29-2', 'I31-2', 'I33-2', 'I35-2', 'I37-2', 'I39-2', 'I41-2', 'I43-2', 'I45-2', 'I47-2', 'I49-2', 'I51-2', 'I53-2', 'I55-2', 'I57-2', 'I59-2', 'I61-2', 'I63-2', 'I65-2', 'I67-2',
  'J02-2', 'J04-2', 'J06-2', 'J08-2', 'J10-2', 'J12-2', 'J14-2', 'J16-2', 'J18-2', 'J20-2', 'J22-2', 'J24-2', 'J26-2', 'J28-2', 'J30-2', 'J32-2', 'J34-2', 'J36-2', 'J38-2', 'J40-2', 'J42-2', 'J44-2', 'J46-2', 'J48-2', 'J50-2', 'J52-2', 'J54-2', 'J56-2', 'J58-2', 'J60-2', 'J62-2', 'J64-2', 'J66-2', 'J68-2',
]
const isleGap = 50;
const binWidth = 21;
const binHeight = 12;
const pageWidth = 600;
const pageHeight = 450;
// ^^^ configuration options ^^^

function saveToSvg() {
  const svgText = new XMLSerializer().serializeToString(pageNode);
  fs.writeFileSync(`out/warehouse.svg`, svgText);
}

const pageNode = document.createElementNS(nameSpace, 'svg');
pageNode.setAttribute('width', `${pageWidth}mm`);
pageNode.setAttribute('height', `${pageHeight}mm`);
pageNode.setAttribute('viewBox', `0 0 ${pageWidth} ${pageHeight}`);

isles_qld.forEach((isle, isleIndex) => {
  const startAt = isle['startAt'] || 1;
  const sectionArr = [...Array(isle['sections']).keys()].map(_ => _ + startAt).filter(_ => isle.numbers ? isle.numbers === 'even' ? _ % 2 === 0 : _ % 2 !== 0  : _);
  const xPosRow = (pageWidth - isleIndex * isleGap) - binWidth * 2;


  const textNode = document.createElement('text');
  textNode.textContent = isle.isle;
  textNode.setAttribute('style', 'font-style:normal;font-weight:600;font-size:18px;font-family:sans-serif;fill:#000');
  textNode.setAttribute('text-anchor', 'middle');
  textNode.setAttribute('x', `${xPosRow + binWidth / 2}px`);
  textNode.setAttribute('y', `${pageHeight - 8}px`);



  sectionArr.reverse().forEach((section) => {
    const loc = `${isle['isle']}${section.toLocaleString('en-AU', {minimumIntegerDigits: 2, useGrouping:false})}`;
    const isOdd = section % 2 === 1;
    const yPos = pageHeight - ((section - (isOdd ? 0 : 1)) * (binHeight / 2)) - 40;
    const shift = isleGap/2 - binWidth/2 - 0.2;
    const xPos = isOdd ? xPosRow - (shift) : xPosRow + (shift);
    const blackBoxNode = document.createElement('rect');
    blackBoxNode.setAttribute('style', 'fill:#000');
    blackBoxNode.setAttribute('width', `${binWidth}px`);
    blackBoxNode.setAttribute('height', `${binHeight}px`);
    blackBoxNode.setAttribute('y', `${yPos}px`);
    blackBoxNode.setAttribute('x', `${xPos}px`);
    blackBoxNode.setAttribute('rx', `1`);
    blackBoxNode.setAttribute('id', loc);
    isle['levels'].forEach((level, i) => {
      const label = `${loc}-${level}`;
      //if (exceptionsQld.includes(label)) return;
      const scale = (7 - level) / 6;
      const tileNode = blackBoxNode.cloneNode();
      tileNode.setAttribute('style', `fill:#${111 * level}`);
      if (exceptionsQld.includes(label)) tileNode.setAttribute('style', `fill:#${'ff0000'}`);

      tileNode.setAttribute('id', label);
      tileNode.setAttribute('width', `${binWidth * scale}px`);
      //tileNode.setAttribute('height', `${binHeight * scale}px`);
      if (!isOdd) tileNode.setAttribute('x', `${xPos + binWidth - (binWidth * scale)}px`);
      tileNode.setAttribute('y', `${yPos + (binHeight * scale)}px`);
      //tileNode.setAttribute('transform', `translate(0, ${pageHeight * scale}) scale(${1}, ${scale})`);
      pageNode.appendChild(tileNode);
    });
    //pageNode.appendChild(blackBoxNode);
  })
  pageNode.appendChild(textNode);

})
saveToSvg();
console.log(`Done`);