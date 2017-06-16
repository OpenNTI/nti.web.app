const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.overrides.builtins.Node', {});
	//Patch-in features that might be missing.
(function () {

	var EP = Element.prototype;

	Ext.applyIf(EP, {
		matches: EP.matches || EP.webkitMatchesSelector || EP.mozMatchesSelector || EP.msMatchesSelector || EP.oMatchesSelector
	});

	//FireFox & Safari & IE (WTH!@#??) give a different instance of Element.protoyp in their
	// event targets so our above patch is not present for those instances! LAME!!
	Element.matches = function (el, selector) {
		var m = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector;
		return m.call(el, selector);
	};

	window.Node = window.Node || function () {};
	window.NodeFilter = window.NodeFilter || {};

	Ext.applyIf(NodeFilter, {
		SHOW_ELEMENT: 1,
		SHOW_COMMENT: 128
	});


	Ext.applyIf(Node.prototype, {
		DOCUMENT_POSITION_DISCONNECTED: 1,
		DOCUMENT_POSITION_PRECEDING: 2,
		DOCUMENT_POSITION_FOLLOWING: 4,
		DOCUMENT_POSITION_CONTAINS: 8,
		DOCUMENT_POSITION_CONTAINED_BY: 16,
		DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
		TEXT_NODE: 3,


		getChildren: function () {
			if (this.children) {
				return this.children;
			}
			var EA = Ext.Array;
			return EA.filter(
					EA.toArray(this.childNodes, 0, this.childNodes.length),
						function (i) {
							return i && i.nodeType !== Node.TEXT_NODE;
						});
		}
	});


	NodeList.prototype.toArray = function () {
		return Array.prototype.slice.call(this);
	};


	if (!('remove' in Element.prototype)) {
		Element.prototype.remove = function () {
			if (this.parentNode) {
				this.parentNode.removeChild(this);
			}
		};
	}

	if (!HTMLCanvasElement.prototype.toBlob) {
		Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
			value: function (callback, type, quality) {
				var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
					len = binStr.length,
					arr = new Uint8Array(len);

				for (var i = 0; i < len; i++) {
					arr[i] = binStr.charCodeAt(i);
				}

				callback(new Blob([arr], {type: type || 'image/png'}));
			}
		});
	}
}());
