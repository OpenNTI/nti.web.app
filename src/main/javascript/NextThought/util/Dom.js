Ext.define('NextThought.util.Dom', {
	singleton: true,


	filterNodeList: function(nodeList, filter) {
		var d = Array.prototype.slice.call(nodeList);

		if (typeof filter === 'string') {
			filter = this[filter];
		}

		return d.filter(filter);
	},


	isRootObject: function rootObjects(e) {
		var p = e.parentNode;
		if (p && p.nodeName === 'OBJECT') { return false; }
		return p ? rootObjects(p) : true;
	},


	parseDomObject: function(objectDomEl) {
		var obj = {},
			id = Ext.get(objectDomEl).id;

		function addValue(o, n, v) {
			var c = o[n]; o[n] = c ? (Ext.isArray(c) ? c : [c]).concat(v) : v;
		}

		function directChildNodes(t) {
			return objectDomEl.querySelectorAll('#' + id + ' > ' + t);
		}

		Ext.each(objectDomEl.attributes, function(p) {
			addValue(obj, 'attribute-' + p.name, p.value);
		});

		Ext.each(directChildNodes('param'), function(p) {
			addValue(obj, p.name, p.value);
		});

    //		SAJ: Does not work as intent and just wastes CPU cycles.
    //		Ext.each(driectChildNodes('object'), this.parseDomObject, this);

		obj.asDomSpec = this.asDomSpec;

		return obj;
	},


	asDomSpec: function() {
		if (this instanceof Ext.Base) {
			Ext.Error.raise('Apply this to a simple object not a ext class');
		}

		var r = /^attribute\-(.*)$/,
			o = {
					tag: 'object',
					cn: []
				};


		Ext.Object.each(this, function(k, v) {
			if (Ext.isFunction(v) || Ext.isEmpty(v)) {return;}

			var n = (r.exec(k) || [])[1];
			if (!Ext.isEmpty(n)) {
				o[n] = v;
			}
			else {
				o.cn.push({tag: 'param', name: k, value: v});
			}
		});
		return o;
	},


	getVideosFromDom: function getVideosFromDom(contentElement) {
		var me = this,
			videoObjects = [];

		if (contentElement) {
			Ext.each(contentElement.querySelectorAll('object .naqvideo, object .ntivideo'), function(v) {
				var o = me.parseDomObject(v),
					s =	[];

				o.sources = s;

				Ext.each(v.querySelectorAll('object[type$=videosource]'), function(source) {
					s.push(me.parseDomObject(source));
				});

				videoObjects.push(o);
			});
		}

		return videoObjects;
	},


	getImagesFromDom: function(contentElement) {
		var imageObjects = [];
		Ext.each(contentElement.querySelectorAll('span > img'), function(i) {
			var imageObj = {},
				base,
				src = i.getAttribute('src'),
				current = i.getAttribute('data-nti-image-size'),
				full = i.getAttribute('data-nti-image-full');
				//half = i.getAttribute('data-nti-image-half'),
				//quarter = i.getAttribute('data-nti-image-quarter');

			current = src.indexOf(i.getAttribute('data-nti-image-' + current));
			base = src.substr(0, current);

			Ext.removeNode(i.parentNode);

			imageObj.url = base + full;
			imageObjects.push(imageObj);
		});
		return imageObjects;
	},


	/*
	 * A terribly named function that adjust links displayed to the user.  Note this
	 * is different then any content reference cleanup that happens when content loads.
	 * Right now the purpose it so detect links that are external (absolute and aren't the same
	 * base path) and set there target to _blank.  The base url check allows us to just do fragment
	 * navigatio in the same tab so if people get clever and insert links to things like profile we
	 * do the right thing.
	 */
	adjustLinks: function(dom, baseUrl) {
		var string, tempDom;

		if (!dom) {
			return;
		}

		if (Ext.isString(dom)) {
			string = true;
			tempDom = document.createElement('div');
			tempDom.innerHTML = dom;
			dom = tempDom;
		}

		Ext.each(Ext.fly(dom).query('a[href]') || [], function(link) {
			var href = Ext.fly(link).getAttribute('href') || '',
				base = baseUrl.split('#')[0],
				changeTarget = href.indexOf(base) !== 0;


			if (changeTarget) {
				Ext.fly(link).set({target: '_blank'});
			}
		});

		return string ? dom.innerHTML : dom;
	},


	isEmpty: function isEmpty(value) {
		var re = (isEmpty.re || /((&nbsp;)|(\u2060)|(\u200B)|(<br\/?>)|(<\/?div>))*/ig);

		isEmpty.re = re;

		value = (Ext.isArray(value) && value.join('')) || String(value);

		return value.replace(re, '') === '';
	},


	/**
	 * recursively remove an elment (if removing a node produces an empty parent node, remove it too...until we get to the root)
	 *
	 * @param {Node} el
	 * @private
	 */
	__removeNodeRecursively: function remove(el) {
		var pn = el && el.parentNode;
		if (!pn) {return;}
		pn.removeChild(el);
		if (pn.childNodes.length === 0) {
			remove(pn);
		}
	},


	/**
	 * Select the nodes we might want to remove.
	 *
	 * WARNING: this will MODIFY children of `root` if `cleanAttributes` is true.
	 *
	 * @param {Node} root - Root Node to select unwanted elements
	 * @param {Boolean} cleanAttributes - if true, will remove all attributes that are not white listed. (See KEEP_ATTRS)
	 * @return {Node[]}
	 * @private
	 */
	__pickUnsanitaryElements: function(root, cleanAttributes) {
		var namespaced = /:/,
			picked = [], tw, name, value, el, i,
			notJs = /^(?!javascript:).*/i,
			present = /.*/,
			KEEP_ATTR_IF = {
				style: present,
				href: notJs,
				src: notJs
			},
			BAD_NODES = {
				LINK: 1, STYLE: 1, META: 1, TITLE: 1, HEAD: 1,
				SCRIPT: 1, OBJECT: 1, EMBED: 1, APPLET: 1
			};

		tw = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_ELEMENT, null, false);
		do {
			el = tw.nextNode();
			if (!el) {continue;}

				//Remove comments
			if ((el.nodeType === Node.COMMENT_NODE) ||
				//remove nodes we deem bad
				(BAD_NODES[el.tagName]) ||
				//remove empty nodes (maybe dangerous, images?, is there a way to know if an element is meant to be unary?)
				//allow img and br tags
				(el.childNodes.length === 0 && !/^(IMG|BR)$/i.test(el.tagName)) ||
				//remove elements that are effectively empty (whitespace only text node as their only child)
				(el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE && el.childNodes[0].nodeValue.trim() === '') ||
				//remove Office (xml namespaced) elements (that are empty)... need an would be nice to just
				// find all patterns <(/?)FOO:BAR( ...?)> and delete them and leave the content they surround.
				(namespaced.test(el.tagName) && el.childNodes.length === 0)) {

				picked.push(el);

			} else if (cleanAttributes) {
				//Clean attributes of elements we will not remove
				i = el.attributes.length - 1;
				for (i; i >= 0; i--) {
					name = el.attributes[i].name;
					value = el.getAttribute(name);
					if (!KEEP_ATTR_IF[name] || !KEEP_ATTR_IF[name].test(value)) {
						el.removeAttribute(name);
					}
				}
			}
		} while (el);

		return picked;
	},


	/**
	 * @param {String|Node} html
	 * @return {String}
	 */
	sanitizeExternalContentForInput: function(html) {
		console.debug('Sanitizing html...', html);
		//html = html.trim().replace(/[\n\r]+/g, ' ');

		var offScreenBuffer = document.createElement('div'),
			toRemove, i;

		if (typeof html === 'string') {
			offScreenBuffer.innerHTML = html.replace(/[\n\r]+/ig, ' ');
		} else {
			offScreenBuffer.appendChild(html.cloneNode(true));
		}

		toRemove = this.__pickUnsanitaryElements(offScreenBuffer, true);

		//Data gathered, do the remove (in reverse)
		for (i = toRemove.length - 1; i >= 0; i--) {
			this.__removeNodeRecursively(toRemove[i]);
		}

		//get the new html content...
		html = offScreenBuffer.innerHTML;
		offScreenBuffer.innerHTML = ''; //free up
		return html;//return;
	}


},function() {
	window.DomUtils = this;
});
