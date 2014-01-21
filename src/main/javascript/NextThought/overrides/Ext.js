Ext.define('NextThought.overrides.Ext', {
	override: 'Ext',


	/**
	 * This will apply `cfg` to `o` recursively.  This is handy for situations like adding a username to all the
	 * component configs in your component's item array prior to them becoming instantiated by initComponent.
	 *
	 * @param o {Object} The object or array to apply to.
	 * @param cfg {Object} The values to apply to the object in the first arg.
	 * @return {*}
	 */
	applyRecursively: function applyRecursively(o, cfg) {
		if (!o) {return o;}

		if (Ext.isArray(o)) {
			Ext.each(o, function(v, i, a) { a[i] = applyRecursively(v, cfg); });
		}
		else if (Ext.isObject(o)) {
			Ext.Object.each(o, function(k, v) { o[k] = applyRecursively(v, cfg); });
			o = Ext.apply(o, cfg);
		}

		return o;
	}


},function() {

	var EC = Ext.cache,
		Element = Ext.dom.Element,
		get = Ext.getElementById;

	/**
	 *  This is not to be confused with document.getElementById.  Ext has a periodic task that checks that cached
	 *  elements are still present, and if not cleans their registered event listeners and destroys the associated cache
	 *  entries.
	 *
	 *  This is all fine and desired. However, their implementation does not account for nodes accross iframe boundries.
	 *
	 *  This patch is intended to make the garbage collector see the objects in various iframes as well as the host
	 *  document.
	 *
	 *  Caveat:
	 *
	 *  This function on the Ext object is only used in two places in the entire Ext framework. 1) to determine a node's
	 *  existence for the "garbage collector" task, and 2) the "string" fallback branch of Ext.getDom().  It is very
	 *  unlikely this change will offend any existing code, nor future code. (getDom is predominately used to normalize
	 *  an input from either Ext.dom.Element or a Node and allow you to assume you are working with a raw Node)
	 *
	 *
	 *  An alternative is to reimplement their (Ext's) garbage collector function and make it inspect the node's
	 *  ownerDocument.
	 *
	 *  Notes on reimplementing Ext's GC:
	 *
	 *  clear the interval: Ext.Element.collectorThreadId
	 *  Copy function garbageCollect() from ext/src/dom/Element.js as a starting point, then restart the 30second interval.
	 */
	Ext.getElementById = function(id) {
		var el = get.apply(this, arguments);

		function testFrame(frame) {
			var win = frame.contentWindow || window.frames[frame.name],
				src;
			try {
				src = Globals.HOST_PREFIX_PATTERN.exec(frame.getAttribute('src'));
				if (src[3] === document.domain || src[1] === 'javascript') {
					el = win.document.getElementById(id) || false;
				}
			//for iframes where we cannot access its content(Cross Origin Content) ignore.
			} catch (e) { swallow(e); }
			return !el;
		}

		if (!el) {
			Ext.each(document.getElementsByTagName('iframe'), testFrame);
		}

		return el;
	};


	//do our own GC... (mostly copied verbatim, added lint fixes and try/catch)
	function garbageCollect() {
		if (!Ext.enableGarbageCollector) {
			clearInterval(Element.collectorThreadId);
		} else {
			var eid,
				d,
				o,
				t, clean;

			for (eid in EC) {
				if (EC.hasOwnProperty(eid)) {
					clean = false;
					o = EC[eid];

					// Skip document and window elements
					if (o.skipGarbageCollection) {
						continue;
					}

					d = o.dom;

					try {
						clean = !d || (!d.parentNode || (!d.offsetParent && !Ext.getElementById(eid)));
					} catch (e) {
						clean = true;
					}

					if (clean) {
						if (Ext.enableListenerCollection) {
							Ext.EventManager.removeAll(d);
						}
						delete EC[eid];
					}
				}
			}
			// Cleanup IE Object leaks
			if (Ext.isIE) {
				t = {};
				for (eid in EC) {
					if (EC.hasOwnProperty(eid)) {
						t[eid] = EC[eid];
					}
				}
				EC = Ext.cache = t;
			}
		}
	}

	function takeOverGC() {
		if (!Element.collectorThreadId) {
			setTimeout(takeOverGC, 1000);
			return;
		}

		clearInterval(Element.collectorThreadId);//stop Ext's Garbage collector...
		//then do our own...
		Element.collectorThreadId = setInterval(garbageCollect, 30000);
	}

	takeOverGC();
});
