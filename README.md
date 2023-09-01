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

- `isle` (string): The isle name
- `levels` (string[]): A list of levels
- `sections` (number): How many sections/bins across the isle
- `sides` (number: 1 or 2): The number of sides the isle has. This controls the direction of the arrows.  
            If the result isn't what you expect, use `arrows` instead
- `arrows` (string of `l`s, `r`s and/or `-`s):
        For the first section/bin, the arrow will match the first letter.  
        For the second section/bin, the arrow will match the second letter, and so on.  
        If there are more sections than letters, the next section/bin will loop back to the first letter and start over.  
        I.e. 'l' will only use left arrows. '-' will use no arrows. 'rllr' will go right, left, left, right (and repeat)  
        Setting sides to two is equivalent to arrows = 'rllr' and setting sides to 1 is equivalent to arrows = 'rl'  

### Other options

- `outputPdfFileName` (string): The output PDF file for the labels
- `outputBinsFileName` (string): The output TXT file for the bin names
- `colours` (strings[]): A list of hexadecimal colours for each level
- `pageWidth` (number): The page width
- `pageHeight` (number): The page height
- `headingRatio` (number): The heading height, defined as a ratio to page height
- `tickHeight` (number): Height of the 'tick' - a visual marker to assist in cutting once printed
- `tickWidth` (number): Width of the tick
- `pageAlign` (string: `left`, `right` or `center`): Horizontal alignment of the labels on the page
- `onlyVertical` (boolean): Set to true to prevent horizontal labels being added to the page to fill in any gaps