# label-maker
Use these Node.js scripts to create barcoded labels.

## Requirements
Node.js 18.16.0 (or later should work)

## Installation
Run `npm install` to install 

## Usage
Run using `node file-name.js`

## Configuration
make-racking-labels.js
This makes labels that can be used to label a warehouse.
Edit the file to adjust the configuration options as required. 


### Isles
This is a list of isle objects. Each object should have the following properties:

**isle** - Isle name (string)  
**levels** - A list of levels (list of strings)  
**sections** - How many sections/bins across the isle (number)  
**sides** - The number of sides the isle has. This controls the direction of the arrows.  
            If the result isn't what you expect, use "arrows" instead (number: 1 or 2)  
**arrows** - optional (overrides sides). a string of l, r and -.  
        For the first section/bin, the arrow will match the first letter.  
        For the second section/bin, the arrow will match the second letter, and so on.  
        If there are more sections than letters, the next section/bin will loop back to the first letter and start over.  
        I.e. 'l' will only use left arrows. '-' will use no arrows. 'rllr' will go right, left, left, right (and repeat)  
        Setting sides to two is equivalent to arrows = 'rllr' and setting sides to 1 is equivalent to arrows = 'rl'  

### Other options
**outputPdfFileName** - The output PDF file for the labels (string)  
**outputBinsFileName** - The output TXT file for the bin names (string)  
**colours** - A list of hexadecimal colours for each level (list of strings)  
**pageWidth** - The page width (number)  
**pageHeight** - The page height (number)  
**headingRatio** - The heading height, defined as a ratio to page height (number).  
**tickHeight** - Height of the 'tick' - a visual marker to assist in cutting once printed (number)  
**tickWidth** - Width of the tick (number)  
**pageAlign** - Horizontal alignment of the labels on the page (string: left, right, center)  
**onlyVertical** - Set to true to prevent horizontal labels being added to the page to fill in any gaps (boolean: true, false)  