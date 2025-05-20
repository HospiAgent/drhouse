"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/dashify";
exports.ids = ["vendor-chunks/dashify"];
exports.modules = {

/***/ "(ssr)/./node_modules/dashify/index.js":
/*!***************************************!*\
  !*** ./node_modules/dashify/index.js ***!
  \***************************************/
/***/ ((module) => {

eval("/*!\n * dashify <https://github.com/jonschlinkert/dashify>\n *\n * Copyright (c) 2015-2017, Jon Schlinkert.\n * Released under the MIT License.\n */\n\n\n\nmodule.exports = (str, options) => {\n  if (typeof str !== 'string') throw new TypeError('expected a string');\n  return str.trim()\n    .replace(/([a-z])([A-Z])/g, '$1-$2')\n    .replace(/\\W/g, m => /[À-ž]/.test(m) ? m : '-')\n    .replace(/^-+|-+$/g, '')\n    .replace(/-{2,}/g, m => options && options.condense ? '-' : m)\n    .toLowerCase();\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvZGFzaGlmeS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLEdBQUc7QUFDbkI7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL25leHRqcy8uL25vZGVfbW9kdWxlcy9kYXNoaWZ5L2luZGV4LmpzP2FlYjgiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBkYXNoaWZ5IDxodHRwczovL2dpdGh1Yi5jb20vam9uc2NobGlua2VydC9kYXNoaWZ5PlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNS0yMDE3LCBKb24gU2NobGlua2VydC5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gKHN0ciwgb3B0aW9ucykgPT4ge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdGVkIGEgc3RyaW5nJyk7XG4gIHJldHVybiBzdHIudHJpbSgpXG4gICAgLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpXG4gICAgLnJlcGxhY2UoL1xcVy9nLCBtID0+IC9bw4Atxb5dLy50ZXN0KG0pID8gbSA6ICctJylcbiAgICAucmVwbGFjZSgvXi0rfC0rJC9nLCAnJylcbiAgICAucmVwbGFjZSgvLXsyLH0vZywgbSA9PiBvcHRpb25zICYmIG9wdGlvbnMuY29uZGVuc2UgPyAnLScgOiBtKVxuICAgIC50b0xvd2VyQ2FzZSgpO1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/dashify/index.js\n");

/***/ })

};
;