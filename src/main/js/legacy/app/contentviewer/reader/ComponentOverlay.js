var Ext = require('extjs');
var UtilDom = require('../../../util/Dom');
var UtilTabIndexTracker = require('../../../util/TabIndexTracker');
var {guidGenerator} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.contentviewer.reader.ComponentOverlay', {
	alias: 'reader.componentOverlay',

	constructor: function(config) {
		Ext.apply(this, config);

		function sync() {
			var p = NextThought.app.contentviewer.overlay.Panel;

			p.relayout();
			p.syncPositioningTillStable();
		}

		this.reader.on({
			scope: this,
			'set-content': 'clearOverlayedPanels',
			// 'content-updated': 'clearOverlayedPanels',
			'destroy': 'clearOverlayedPanels',
			'image-loaded': 'adjustOverlayedPanels',
			'afterRender': 'insertComponentOverlay',
			'afterLayout': sync,
			'sync-overlays': sync
		});

		this.tabIndexer = new NextThought.util.TabIndexTracker();
		this.activeOverlayedPanels = {};
	},

	insertComponentOverlay: function() {
		var container = Ext.DomHelper.append(this.reader.getInsertionPoint('innerCt'), { cls: 'component-overlay' }, true);
		this.reader.on('destroy' , function() { container.remove(); });
		this.componentOverlayEl = container;
	},

	overlayedPanelAtY: function(y) {
		var panel = null,
			offsets = this.reader.getAnnotationOffsets();

		y += offsets.top;

		//This may need to be optimized
		Ext.each(Ext.Object.getValues(this.activeOverlayedPanels), function(p) {
			if (p.isDestroyed || !p.el) {return;}
			var minY = p.el.getY(),
				maxY = minY + p.el.getHeight();
			if (y >= minY && y <= maxY) {
				panel = p;
			}

			return !panel;
		});

		return panel;
	},

	/**
	 *
	 * @param {String|Object} key
	 * @param {Object} [panel]
	 */
	registerOverlayedPanel: function(key, panel) {

		if (!panel && Ext.isObject(key)) {
			panel = key;
			key = guidGenerator();
		}

		if (!Ext.isString(key)) {
			Ext.Error.raise('Bad key');
		}
		if (!(Ext.isObject(panel) && panel.isComponent)) {
			console.warn('Bad panel');
			return;
		}
		panel.floatParent = this;
		this.activeOverlayedPanels[key] = panel;
		return panel;
	},

	adjustOverlayedPanels: function() {
		NextThought.app.contentviewer.overlay.Panel.syncPositioning();
	},

	clearOverlayedPanels: function() {
		var active = this.activeOverlayedPanels,
			myReader = this.reader;

		this.activeOverlayedPanels = {};
		this.tabIndexer.reset(10);

		Ext.Object.each(active, function(k, v) {
			delete v.floatParent;
			v.destroy();
			delete active[k];
		});

		Ext.each(
			Ext.ComponentQuery.query('overlayed-panel'),
			function(o) {
				if (o.reader === myReader) {
					o.destroy();
				}
			});
	},

	getRelatedElement: function(ntiid, objectEls) {
		var i;
		for (i = 0; i < objectEls.length; i++) {
			if (!(objectEls[i].getAttribute)) { continue; }
			if (objectEls[i].getAttribute('data-ntiid') === ntiid) {
				return objectEls[i];
			}
		}
		return undefined;
	},

	getContentElement: function(tagName, attribute, value) {
		try {
		var doc = this.reader.getDocumentElement(),
			tags = doc.getElementsByTagName(tagName),
			i = tags.length - 1,
			vRe = new RegExp('^' + RegExp.escape(value) + '$', 'ig');

		for (i; i >= 0; i--) {
			if (vRe.test(tags[i].getAttribute(attribute))) {
				return tags[i];
			}
		}
		}
		catch (er) {
			console.error(er.message);
		}
		return null;
	}
});
