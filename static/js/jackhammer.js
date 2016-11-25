/*
This code is directly adapted from the New York Times' Crowbar utility - https://github.com/NYTimes/svg-crowbar

Copyright (c) 2013 The New York Times

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var jackhammer = {};

var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

window.URL = (window.URL || window.webkitURL);

var body = document.body;

var prefix = {
xmlns: "http://www.w3.org/2000/xmlns/",
xlink: "http://www.w3.org/1999/xlink",
svg: "http://www.w3.org/2000/svg"
};

// add empty svg element
var emptySvg = window.document.createElementNS(prefix.svg, 'svg');
window.document.body.appendChild(emptySvg);
var emptySvgDeclarationComputed = getComputedStyle(emptySvg);

jackhammer.getSource = function(svg) {
  svg.setAttribute("version", "1.1");

  // removing attributes so they aren't doubled up
  svg.removeAttribute("xmlns");
  svg.removeAttribute("xlink");

  // These are needed for the svg
  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
  }

  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);

  jackhammer.setInlineStyles(svg);

  var source = (new XMLSerializer()).serializeToString(svg);
  var rect = svg.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    class: svg.getAttribute("class"),
    id: svg.getAttribute("id"),
    childElementCount: svg.childElementCount,
    source: [doctype + source]
  };
}};

jackhammer.setInlineStyles =function(svg) {

function explicitlySetStyle (element) {
  var cSSStyleDeclarationComputed = getComputedStyle(element);
  var i, len, key, value;
  var computedStyleStr = "";
  for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
    key=cSSStyleDeclarationComputed[i];
    value=cSSStyleDeclarationComputed.getPropertyValue(key);
    if (value!==emptySvgDeclarationComputed.getPropertyValue(key)) {
      computedStyleStr+=key+":"+value+";";
    }
  }
  element.setAttribute('style', computedStyleStr);
}
function traverse(obj){
  var tree = [];
  tree.push(obj);
  visit(obj);
  function visit(node) {
    if (node && node.hasChildNodes()) {
      var child = node.firstChild;
      while (child) {
        if (child.nodeType === 1 && child.nodeName != 'SCRIPT'){
          tree.push(child);
          visit(child);
        }
        child = child.nextSibling;
      }
    }
  }
  return tree;
}
// hardcode computed css styles inside svg
var allElements = traverse(svg);
var i = allElements.length;
while (i--){
  explicitlySetStyle(allElements[i]);
}
};