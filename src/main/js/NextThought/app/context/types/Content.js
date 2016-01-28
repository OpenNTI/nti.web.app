Ext.define('NextThought.app.context.types.Content', {

	requires: [
		'NextThought.util.Ranges',
		'NextThought.common.components.cards.OverlayedPanel',
		'NextThought.common.components.cards.Card',
		'NextThought.common.components.cards.Launcher',
		'NextThought.app.library.Actions',
		'NextThought.app.mediaviewer.content.deck.OverlayedPanel',
		'NextThought.app.mediaviewer.content.Slidedeck',
		'NextThought.app.mediaviewer.content.SlideVideo',
		'NextThought.app.image.OverlayedPanel',
		'NextThought.app.mediaviewer.content.OverlayedPanel',
		'NextThought.app.video.roll.OverlayedPanel',
		'NextThought.app.context.components.cards.*',
		'NextThought.app.context.components.Default',
		'NextThought.app.context.components.list.Content'
	],


	statics: {
		type: 'content',

		canHandle: function(obj) {
			return obj instanceof NextThought.model.PageInfo;
		}
	},


	constructor: function(config) {
		this.callParent(arguments);

		this.LibraryActions = NextThought.app.library.Actions.create();

		this.container = config.container;
		this.range = config.range;
		this.record = config.contextRecord;
		this.doNavigate = config.doNavigate;
		this.maxWidth = config.maxWidth || 574;
	},


	parse: function(pageInfo, contextKind) {
		var me = this,
			link = pageInfo.getLink('content'),
			contentPackage = pageInfo.get('ContentPackageNTIID');

		return Promise.all([
				Service.request(link),
				this.LibraryActions.findContentPackage(contentPackage)
			]).then(function(results) {
				var xml = results[0],
					content = results[1];

				xml = (new DOMParser()).parseFromString(xml, 'text/xml');

				if (xml.querySelector('parsererror')) {
					return Promise.resolve('');
				}

				return me.__parseNode(xml, content && content.get('root'), contextKind);
			});
	},


	__parseNode: function(doc, root, contextKind) {
		var page = doc && doc.querySelector('#NTIContent'),
			context,
			range = this.range,
			cid = this.container, config, cleanContext;

		try {
			if (this.range.isEmpty && page && page.getAttribute('data-page-ntiid') === cid) {
				return '';
			}

			context = doc && RangeUtils.getContextAroundRange(range, doc, doc.body, cid);
			cleanContext = this.__fixUpContext(context, root);


			config = {
				type: this.self.type,
				snippet: cleanContext,
				fullContext: cleanContext,
				containerId: cid,
				record: this.record,
				doNavigate: this.doNavigate
			};

			if (contextKind === 'card') {
				return Ext.apply(config, {xtype: 'context-content-card'});
			} else if (contextKind === 'list') {
				return Ext.widget('context-content-list', config);
			}

			return Ext.widget('context-default', config);

		} catch (e) {
			console.error('Faild to load content context:', e);
		}
	},

	//TODO: clean this up to not rely on ext so much.
	__fixUpContext: function(n, root) {
		var node = Ext.get(n), cardTpl, slideDeckTpl, slideVideoTpl, dom, data,
			imgs = n && n.querySelectorAll('img'),
			maxWidth = this.maxWidth, Slide, c;

		if (!node) { return;}

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

		// Fix up URL for external links
		Ext.each(node.query('a[target=_blank]'), function(a) {
			var url = a.getAttribute('href'),
				isExternalNTILink = !(/^(http(s)?:)/i.test(url));

			if (isExternalNTILink) {
				url = root + url;
				url = getURL(url);
				a.setAttribute('href', url);
			}
		});


		this.__fixCards(node, root);

		// cardTpl = Ext.DomHelper.createTemplate({cls: 'content-card', html: NextThought.common.components.cards.Card.prototype.renderTpl.html});
		// Ext.each(node.query('object[type*=nticard]'), function(c) {
		// 	var d = NextThought.common.components.cards.OverlayedPanel.getData(c);
		// 	cardTpl.insertAfter(c, d, false);
		// 	Ext.fly(c).remove();
		// });

		// slideDeckTpl = Ext.DomHelper.createTemplate({cls: 'content-launcher', html: NextThought.app.mediaviewer.content.Slidedeck.prototype.renderTpl.html});
		// Ext.each(node.query('object[type*=ntislidedeck]'), function(c) {
		// 	var d = NextThought.app.mediaviewer.content.deck.OverlayedPanel.getData(c);
		// 	slideDeckTpl.insertAfter(c, d, false);
		// 	Ext.fly(c).remove();
		// });



		if (node.query('object[type*=ntislidevideo][itemprop$=card]').length > 0) {
			c = node.query('object[type*=ntislidevideo][itemprop$=card]')[0];
			data = NextThought.app.mediaviewer.content.OverlayedPanel.getData(c);
			dom = new Ext.XTemplate(NextThought.app.mediaviewer.content.SlideVideo.prototype.renderTpl).apply(data);
			dom = Ext.DomHelper.createDom({cls: 'content-launcher', html: dom});
			return dom;
		}

		if (node.query('object[type$=slide]').length) {
			data = NextThought.model.Slide.getParamFromDom(node.query('object[type$=slide]')[0], 'slideimage');
			Slide = NextThought.app.mediaviewer.components.reader.parts.Slide;
			dom = new Ext.XTemplate(Slide && Slide.prototype.contextTpl).apply({image: root + data});
			dom = Ext.DomHelper.createDom({cls: 'content-launcher', html: dom});
			return dom;
		}

		node.query('object.overlayed').forEach(function(ob) {
			ob.removeAttribute('data');
			ob.removeAttribute('style');
		});

		if (imgs) {
			imgs = Array.prototype.slice.call(imgs);
		} else {
			imgs = [];
		}

		imgs.forEach(function(img) {
			var src = img.getAttribute('src');

			if (!Globals.ROOT_URL_PATTERN.test(src)) {
				src = '/' + Globals.trimRoute(root) + '/' + Globals.trimRoute(src);
				img.setAttribute('src', src);
			}
		});

		return node.dom;
	},


	__fixCards: function(node, root) {
		var cardTpl = new Ext.XTemplate(Ext.DomHelper.markup({
				cls: 'content-card',
				html: NextThought.common.components.cards.Card.prototype.renderTpl
			})),
			slideDeckTpl = Ext.DomHelper.createTemplate({
				cls: 'content-launcher',
				html: NextThought.app.mediaviewer.content.Slidedeck.prototype.renderTpl.html
			}),
			contentLauncherTpl = Ext.DomHelper.createTemplate({
				cls: 'content-launcher',
				html: NextThought.common.components.cards.Launcher.prototype.renderTpl.html
			});

		function fixLink(link) {
			if (link && Globals.ROOT_URL_PATTERN.test(link)) {
				link = getURL(link);
			} else if (link) {
				link = getURL(link, root || '');
			}

			return link;
		}

		Ext.each(node.query('object[type*=nticard]'), function(c) {
			var d = NextThought.common.components.cards.OverlayedPanel.getData(c);

			d.thumbnail = fixLink(d.thumbnail);

			cardTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});

		Ext.each(node.query('object[type*=ntislidedeck]'), function(c) {
			var d = NextThought.app.mediaviewer.content.deck.OverlayedPanel.getData(c);
			slideDeckTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});

		Ext.each(node.query('object[type*=videoroll]'), function(c) {
			var d = NextThought.app.video.roll.OverlayedPanel.getData(c);
			contentLauncherTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});

		Ext.each(node.query('object[type*=image-collection]'), function(c) {
			var d = NextThought.app.image.OverlayedPanel.getData(c);

			d.thumbnail = fixLink(d.thumbnail);

			contentLauncherTpl.insertAfter(c, d, false);
			Ext.fly(c).remove();
		});
	}
});
