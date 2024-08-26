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
  {isle: 'J', levels: [1, 2, 3, 4, 5, 6], sections: 68, sides: 2, skips: [41, 43, 45, 47, 49]},
  {isle: 'K', levels: [1, 3, 5], sections: 40, sides: 2},
  {isle: 'L', levels: [1, 3, 5], sections: 40, sides: 2, numbers: 'even'},

];

const exceptionsQld = [
  '^(A(33|35|37|39|41|43|45|47|49|51|53|55|57|59|61|63|65|67)-(3|5))$',
  '^(B(37|39)-(3))$',
  '^(B(41|43|45|47|49|51|53|55|57|59|61|63|65|67)-(3|5))$',
  '^(D(57|59|61|63|65|67)-(3|5))$',
  '^(E(01|03|05|07|09|11|13|15|17|19|21|23|25|27|29|31)-(3|5))$',
  '^(E(33|35|37|39|41|43|45|47|49|51)-(2))$',
  '^(E(53|55|57|59|61|63|65|67)-(3))$',
  '^(E(58|60|62|64|66|68)-(3|5))$',
  '^(F[0123456][02468]-(3))$',
  '^(I[0123456][13579]-(2))$',
  '^(J[0123456][02468]-(2))$',
  '^(J[0123456][13579]-(2|4|6))$'
]
const re = new RegExp(exceptionsQld.join('|'));


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
    if (isle.skips?.includes(section)) return;
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
      if (re.test(label)) return;
      const scale = (7 - level) / 6;
      const tileNode = blackBoxNode.cloneNode();
      tileNode.setAttribute('style', `fill:#${111 * level}`);
      //if (exceptionsQld.includes(label)) tileNode.setAttribute('style', `fill:#${'ff0000'}`);

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