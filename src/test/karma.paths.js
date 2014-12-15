if (!fromIndexHTML) {
	/**
	 * what to use as the root
	 * @type {String}
	 */
	window.testRoot = '/base/';

	/**
	 * Add this as an empty fn
	 */
	console.log = function() {};

	/**
	 * Add this as an empty fn
	 */
	console.debug = function() {};

	/**
	 * Add this as an empty fn
	 */
	console.warn = function() {};

	/**
	 * Add this as an empty fn
	 */
	console.info = function() {};

	/**
	 * Add this as an empty fn
	 */
	console.error = function() {};
}


/**
 * Empty NTIStrings object
 * @type {Object}
 */
window.NTIStrings = {};


/**
 * Returns a random integer between the min (inclusive) and max (exclusive)
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 *
 * @param  {Integer} min lower bound
 * @param  {Integer} max upper bound
 * @return {Interger}     random int
 */
window.getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};


/**
 * Add a polyfill for the matches on the element
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.matches
 *
 * @param  {String} selector selector to match the element with
 * @return {Bool}          if the element matches the selector
 * @this {Element}
 */
Element.prototype.matches = Element.prototype.matches || function(selector) {
  var element = this;
  var matches = (element.document || element.ownerDocument).querySelectorAll(selector);
  var i = 0;

  while (matches[i] && matches[i] !== element) {
    i++;
  }

  return matches[i] ? true : false;
};
