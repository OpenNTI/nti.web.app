Ext.define('NextThought.app.context.types.Content', {

	requires: [
		'NextThought.util.Ranges',
		'NextThought.common.components.cards.OverlayedPanel',
		'NextThought.common.components.cards.Card',
		'NextThought.app.slidedeck.OverlayedPanel',
		'NextThought.app.slidedeck.SlideDeck',
		'NextThought.app.slidedeck.slidevideo.SlideVideo',
		'NextThought.app.slidedeck.slidevideo.OverlayedPanel',
		'NextThought.app.context.components.cards.*',
		'NextThought.app.context.components.Default'
	],


	statics: {
		type: 'content',

		canHandle: function(obj) {
			return obj instanceof Node;
		}
	},


	constructor: function(config) {
		this.callParent(arguments);

		this.container = config.container;
		this.range = config.range;
		this.maxWidth = config.maxWidth || 574;
	},


	parse: function(doc, contextKind) {
		var page = doc && doc.querySelector('#NTIContent'),
			context,
			range = this.range,
			cid = this.container, config, cleanContext;

		try {
			if (this.range.isEmpty && page && page.getAttribute('data-page-ntiid') === cid) {
				return '';
			}

			context = doc && RangeUtils.getContextAroundRange(range, doc, doc.body, cid);
			cleanContext = this.__fixUpContext(context);


			config = {
					type: this.self.type,
					snippet: cleanContext,
					fullContext: cleanContext,
					containerId: cid
				};

			if (contextKind === 'card') {
				return Ext.apply(config, {xtype: 'context-content-card' });
			}
			return Ext.widget('context-default', config);

		} catch (e) {
			console.error('Faild to load content context:', e);
		}
	},

	//TODO: clean this up to not rely on ext so much.
	__fixUpContext: function(n) {
		var node = Ext.get(n), cardTpl, slideDeckTpl, slideVideoTpl,
			maxWidth = this.maxWidth;

		node.select('.injected-related-items,.related,.anchor-magic').remove();

		//WE want to remove redaction text in the node body of the note viewer.
		Ext.each(node.query('.redaction '), function(redaction) {
			if (!Ext.fly(redaction).hasCls('redacted')) {
				Ext.fly(redaction).addCls('redacted');
			}
		});

		node.select('.redactionAction .controls').remove();

		Ext.each(node.query('span[itemprop~=nti-data-markupenabled]'), function(i) {
			var e = Ext.get(i);
			//only strip off the style for width that are too wide.
			if (i.style && parseInt(i.style.width, 10) >= maxWidth) {
				e.setStyle({width: undefined});
			}
		});

		Ext.each(node.query('iframe'), function(i) {
			var e = Ext.get(i),
				w, h, r;
			if (e.parent('div.externalvideo')) {
				w = parseInt(e.getAttribute('width'), 10);
				h = parseInt(e.getAttribute('height'), 10);
				r = h !== 0 ? w / h : 0;
				if (w >= maxWidth && r !== 0) {
					e.set({width: maxWidth, height: maxWidth / r});
				}
			}
			else {
				e.remove();
			}
		});

		Ext.each(node.query('.application-highlight'), function(h) {
			if (this.record.isModifiable()) {
				Ext.fly(h).addCls('highlight-mouse-over');
			}
		}, this);


		cardTpl = Ext.DomHelper.createTemplate({cls: 'content-card', html: NextThought.common.components.cards.Card.prototype.renderTpl.html});
		Ext.each(node.query('object[type*=nticard]'), function(c) {
			var d = NextThought.common.components.cards.OverlayedPanel.getData(c);
			cardTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});

		slideDeckTpl = Ext.DomHelper.createTemplate({cls: 'content-launcher', html: NextThought.app.slidedeck.SlideDeck.prototype.renderTpl.html});
		Ext.each(node.query('object[type*=ntislidedeck]'), function(c) {
			var d = NextThought.app.slidedeck.OverlayedPanel.getData(c);
			slideDeckTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});

		slideVideoTpl = Ext.DomHelper.createTemplate({cls: 'content-launcher', html: NextThought.app.slidedeck.slidevideo.SlideVideo.prototype.renderTpl.html});
		Ext.each(node.query('object[type*=ntislidevideo][itemprop$=card]'), function(c) {
			var d = NextThought.app.slidedeck.slidevideo.OverlayedPanel.getData(c);
			slideVideoTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});

		if (node.query('object[type$=slide]').length) {
			this.context.up('.context').addCls('slide');
		}

		node.query('object.overlayed').forEach(function(ob) {
			ob.removeAttribute('data');
			ob.removeAttribute('style');
		});

		return node.dom;
	}
});
