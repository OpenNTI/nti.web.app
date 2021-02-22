const Ext = require('@nti/extjs');

const DomUtils = require('legacy/util/Dom');
const { guidGenerator } = require('legacy/util/Globals');
const { getString } = require('legacy/util/Localization');

require('legacy/common/ux/ImageZoomView');
require('legacy/common/components/cards/CardTarget');
require('../../../common/components/cards/CardIframe');
require('legacy/common/components/cards/OverlayedPanel');
require('../../mediaviewer/content/deck/OverlayedPanel');
require('../../mediaviewer/content/OverlayedPanel');
require('../../video/OverlayedPanel');
require('../../video/OverlayedPanelRef');
require('../../video/roll/OverlayedPanel');
require('../../image/OverlayedPanel');
require('../../forums/OverlayedPanel');
require('../components/EmbededWidgetPanel');
require('../components/RealPageNumber');

module.exports = exports = Ext.define(
	'NextThought.app.contentviewer.reader.ResourceManagement',
	{
		alias: 'reader.resourceManager',
		YOU_TUBE_API_KEY: 'YT',
		YOU_TUBE_IFRAME_QUERY: 'iframe[src*="youtube.com"]',

		YOU_TUBE_BLOCKED_TPL: Ext.DomHelper.createTemplate({
			cls: 'youtube blocked video',
			html: getString(
				'NextThought.view.content.reader.ResourceManagement.youtubeblocked'
			),
		}),

		CARD_TEMPLATE: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{
					cls: 'wrapper {presentationType}',
					cn: [
						{
							tag: 'a',
							href: '#zoom',
							'data-qtip':
								'{{{NextThought.view.content.reader.ResourceManagement.enlarge}}}',
							cls: 'zoom disabled',
							html: ' ',
							'data-non-anchorable': true,
						},
					],
				},
				{
					tag: 'span',
					cls: 'bar {presentationType}',
					'data-non-anchorable': true,
					'data-no-anchors-within': true,
					unselectable: true,
					cn: [
						{
							tag: 'a',
							href: '#slide',
							'data-qtip':
								'{{{NextThought.view.content.reader.ResourceManagement.open-slide}}}',
							cls: 'bar-cell slide',
							html: ' ',
						},
						{
							cls:
								"bar-cell {[values.annotatable || values.title || values.caption ? '' : 'no-details']}",
							cn: [
								{
									tag: 'a',
									href: '#zoom',
									cn: [
										{
											tag: 'tpl',
											if: 'title',
											cn: {
												tag: 'span',
												cls: 'image-title',
												html: '{title}',
											},
										},
										{
											tag: 'tpl',
											if: 'caption',
											cn: {
												tag: 'span',
												cls: 'image-caption',
												html: '{caption}',
											},
										},
									],
								},
								{
									tag: 'tpl',
									if: 'annotatable',
									cn: {
										tag: 'a',
										href: '#mark',
										'data-qtip':
											'{{{NextThought.view.content.reader.ResourceManagement.commentonthis}}}',
										cls: 'mark',
										html:
											'{{{NextThought.view.content.reader.ResourceManagement.comment}}}',
									},
								},
							],
						},
					],
				},
			])
		),

		IMAGE_TEMPLATE: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{
					cls: 'wrapper {presentationType}',
					cn: [
						{
							tag: 'a',
							href: '#zoom',
							'data-qtip':
								'{{{NextThought.view.content.reader.ResourceManagement.enlarge}}}',
							cls: 'zoom disabled',
							html: ' ',
							'data-non-anchorable': true,
						},
					],
				},
				{
					tag: 'span',
					cls: 'bar {presentationType}',
					'data-non-anchorable': true,
					'data-no-anchors-within': true,
					unselectable: true,
					cn: [
						{
							tag: 'a',
							href: '#slide',
							'data-qtip':
								'{{{NextThought.view.content.reader.ResourceManagement.open-slide}}}',
							cls: 'bar-cell slide',
							html: ' ',
						},
						{
							cls:
								"bar-cell {[values.annotatable || values.title || values.caption ? '' : 'no-details']}",
							cn: [
								{
									tag: 'tpl',
									if: 'title',
									cn: {
										tag: 'span',
										cls: 'image-title',
										html: '{title}',
									},
								},
								{
									tag: 'tpl',
									if: 'caption',
									cn: {
										tag: 'span',
										cls: 'image-caption',
										html: '{caption}',
									},
								},
								{
									tag: 'tpl',
									if: 'annotatable',
									cn: {
										tag: 'a',
										href: '#mark',
										'data-qtip':
											'{{{NextThought.view.content.reader.ResourceManagement.commentonthis}}}',
										cls: 'mark',
										html:
											'{{{NextThought.view.content.reader.ResourceManagement.comment}}}',
									},
								},
							],
						},
					],
				},
			])
		),

		AUDIO_SNIPPET_TEMPLATE: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{
					tag: 'button',
					id: '{id}',
					cls: 'x-component-assessment audio-clip',
					cn: {
						tag: 'audio',
						cn: {
							tag: 'tpl',
							for: 'sources',
							cn: [
								{
									tag: 'source',
									src: '{source}',
									type: '{type}',
								},
							],
						},
					},
				},
			])
		),

		AUDIO_SNIPPET_CODE_TEMPLATES: {
			init: function (document, id) {
				var btn = document.getElementById(id),
					audio = btn.querySelector('audio'),
					sources = audio.querySelectorAll('source'),
					lastsource = sources[sources.length - 1];

				function stopped() {
					btn.classList.remove('playing');
				}

				function play() {
					Array.prototype.forEach.call(
						document.querySelectorAll('audio'),
						function (a) {
							if (a !== audio) {
								a.load();
							}
						}
					);
				}

				function noplay() {
					btn.onclick = null;
					btn.classList.add('noplay');
				}

				function click() {
					btn.blur();
					if (audio.paused) {
						audio.play();
						btn.classList.add('playing');
					} else {
						audio.load();
					}
				}

				btn.addEventListener('click', click, false);

				if (lastsource) {
					lastsource.addEventListener('error', noplay, false);
				} else {
					noplay();
				}

				audio.addEventListener('play', play, false);

				['abort', 'ended', 'emptied', 'pause'].forEach(function (e) {
					audio.addEventListener(e, stopped, false);
				});
			},
		},

		OVERLAY_DOM_QUERY_XTYPE_MAP: {
			'object[type$=nticard]': 'overlay-card',
			'object[type$=nticard-target]': 'overlay-card-target',
			'object[type$=nticard-iframe]': 'overlay-card-iframe',
			'object[type$=ntislidedeck]': 'overlay-slidedeck',
			'object[type$=ntislidevideo][itemprop=presentation-card]':
				'overlay-slidevideo',
			'object[type$=ntivideo][itemprop=presentation-video]':
				'overlay-video',
			'object[type$=ntivideoref]': 'overlay-video-ref',
			'object[type$=videoroll]': 'overlay-video-roll',
			'object[type$=image-collection]': 'overlay-image-roll',

			'object[type$=embeded\\2e widget]':
				'overlay-content-embeded-widget',
			'object[type$=realpagenumber]': 'overlay-content-real-page-number',

			'object[class=ntirelatedworkref]': 'overlay-card',
			'object[type$=embededtopic]': 'overlay-topic',
		},

		constructor: function (config) {
			Ext.apply(this, config);

			this.reader.on('set-content', 'manage', this); //We can't defer this handler, otherwise the fireEvent completes before
			// we update the dom with container flags
		},

		manage: function (reader) {
			this.activateOverlays.apply(this, arguments);
			this.activateAnnotatableItems.apply(this, arguments);
			this.activateSequences.apply(this, arguments);
			this.activateAudioSnippets.apply(this, arguments);
			this.manageYouTubeVideos();
		},

		manageYouTubeVideos: function () {
			var d,
				items,
				tpl = this.YOU_TUBE_BLOCKED_TPL;

			if (window[this.YOU_TUBE_API_KEY] !== undefined) {
				return;
			}

			d = this.reader.getDocumentElement();
			items = d.querySelectorAll(this.YOU_TUBE_IFRAME_QUERY);

			Ext.each(items, function (i) {
				tpl.insertBefore(i);
				Ext.fly(i).remove();
			});
		},

		activateOverlays: function (reader, doc) {
			var me = this;
			Ext.Object.each(
				me.OVERLAY_DOM_QUERY_XTYPE_MAP,
				function (query, xtype) {
					me.activateOverlayedPanel(reader, doc, query, xtype);
				}
			);
		},

		activateOverlayedPanel: function (reader, doc, query, widgetXType) {
			var me = reader,
				o = me.getComponentOverlay(),
				els = doc.querySelectorAll(query);

			els = DomUtils.filterNodeList(els, 'isRootObject');

			Ext.each(els, function (el) {
				var id = el.getAttribute('data-ntiid');

				if (!id) {
					let param = el.querySelector('param[name=ntiid]');
					id = param && param.value;
				}

				o.registerOverlayedPanel(
					id,
					Ext.widget(widgetXType, {
						reader: me,
						renderTo: o.componentOverlayEl,
						tabIndexTracker: o.tabIndexer,
						contentElement: el,
					})
				);
			});
		},

		activateAudioSnippets: function (reader, doc) {
			var tpl = this.AUDIO_SNIPPET_TEMPLATE,
				code = this.AUDIO_SNIPPET_CODE_TEMPLATES;

			function trn(o) {
				if (
					o.service !== 'html5' ||
					o.source.length !== o.type.length
				) {
					console.error('Bad audio source', o);
					return [];
				}

				var a = [],
					i = 0;
				for (i; i < o.source.length; i++) {
					a.push({
						source: o.source[i],
						type: o.type[i],
					});
				}

				return a;
			}

			function flatten(agg, v) {
				return agg.concat(v);
			}

			Array.prototype.forEach.call(
				doc.querySelectorAll('object[type$=ntiaudio]'),
				function (snip) {
					var id = guidGenerator(),
						obj = Ext.apply(DomUtils.parseDomObject(snip), {
							id: id,
							sources: Array.prototype.map
								.call(
									snip.querySelectorAll(
										'object[type$=audiosource]'
									),
									DomUtils.parseDomObject
								)
								.map(trn)
								.reduce(flatten, []),
						});

					tpl.insertBefore(snip, obj);
					code.init(doc, id);
					Ext.fly(snip).remove();
				}
			);
		},

		activateSequences: function (reader, doc) {
			var me = this,
				ob = new Ext.util.Observable(),
				itemSelector = 'object[type$=ntisequenceitem]';

			function updateAnnotations() {
				try {
					var prefix = me.reader.prefix;
					me.reader.getAnnotations().getManager().render(prefix);
				} catch (e) {
					console.warn(e.stack || e.message || e);
				}
			}

			Ext.destroy(me.sequenceHandlers);
			Array.prototype.forEach.call(
				doc.querySelectorAll('object[type$=ntisequence]'),
				function (seq) {
					var items = Array.prototype.slice.call(
						seq.querySelectorAll(itemSelector)
					);
					Ext.fly(items[0]).addCls('active');

					me.sequenceHandlers = ob.mon(
						new Ext.dom.CompositeElement(items),
						{
							destroyable: true,
							click: function (e) {
								var sel = e
										.getTarget()
										.ownerDocument.getSelection()
										.isCollapsed,
									dom = e.getTarget(itemSelector),
									el = Ext.get(dom);

								if (sel) {
									el.removeCls('active');
									el =
										el.next(itemSelector) ||
										Ext.fly(dom.parentNode).first(
											itemSelector
										);
									el.addCls('active');
									updateAnnotations();
								}
							},
						}
					);
				}
			);
		},

		activateAnnotatableItems: function (reader, doc) {
			var els = reader.isAssignment()
					? []
					: doc.querySelectorAll(
							'[itemprop*=nti-data-markup],[itemprop~=nti-slide-video]'
					  ),
				activators = {
					'nti-data-markupenabled': Ext.bind(
						this.activateZoomBox,
						this
					),
				};
			function get(el, attr) {
				return el ? el.getAttribute(attr) : null;
			}

			function getStyle(el) {
				var s = (get(el, 'style') || '')
						.replace(/\s+/gi, '')
						.split(';'),
					r = {};
				Ext.each(s, function (v) {
					v = (v || '').split(':');
					r[v[0].toLowerCase()] = v[1];
				});
				return r;
			}

			Ext.each(els, el => {
				var p = (el.getAttribute('itemprop') || '').split(' '),
					figure = Ext.fly(el).up('div.figure'),
					target = Ext.fly(el).down('img,iframe', true),
					title = get(target, 'data-title'),
					caption = get(target, 'data-caption'),
					annotatable = Ext.Array.contains(
						p,
						'nti-data-markupenabled'
					),
					presentationProp =
						figure && figure.dom.getAttribute('itemprop'),
					isCard = presentationProp === 'presentation-card',
					presentationType = isCard ? 'card' : 'standard',
					tpl = isCard ? this.CARD_TEMPLATE : this.IMAGE_TEMPLATE,
					width,
					button,
					comment,
					bar = tpl.append(
						el,
						{
							title: title,
							caption: caption,
							annotatable: annotatable,
							presentationType: presentationType,
						},
						false
					);

				if (Ext.is.iOS) {
					button = Ext.get(el).down('.bar-cell.slide');
					comment = Ext.get(el).down('.mark');
					button.on('mouseover', function () {
						button.dom.click();
					});
					comment.on('mouseover', function () {
						comment.dom.click();
					});
				}

				if (!title && !caption && !annotatable) {
					Ext.fly(el).addCls('no-details');
				}
				Ext.fly(bar).unselectable();

				//move the targeted element into a wrapper
				if (
					Ext.fly(target).is('iframe') ||
					!Ext.Array.contains(p, 'nti-data-markupenabled')
				) {
					Ext.fly(el.querySelector('.wrapper a')).remove();
				}
				el.querySelector('.wrapper').prepend(target);

				let imgWidth =
					parseInt(
						getStyle(target).width || get(target, 'width'),
						10
					) || Ext.fly(target).getWidth();

				width = imgWidth + Ext.get(el).getBorderWidth('lr');

				//If the image gets deleted this width is being set very small
				//so the caption if wrapping after every character, use 30 px as
				//the cutoff since thats what IE
				//Don't set width for card display, CSS will handle that
				if (!isCard && width > 30) {
					Ext.get(el).setWidth(width);
				}

				// if we have a narrow image, remove the 'Comment' label and just show the comment icon
				if (imgWidth < 116) {
					comment = Ext.get(el).down('.mark');

					// not guaranteed to have this element
					if (comment) {
						comment.dom.innerHTML = '';
					}
				}

				Ext.each(p, function (feature) {
					(
						activators[feature] || Ext.emptyFn
					)(el, bar, reader.basePath);
				});
			});
		},

		activateZoomBox: function (containerEl, toolbarEl, basePath) {
			try {
				Ext.fly(containerEl.querySelector('a.zoom')).removeCls(
					'disabled'
				);
				var img = containerEl.querySelector('img[id]:not([id^=ext])'),
					current = img.getAttribute('data-nti-image-size');

				//TODO: precache the most likely-to-be-used image, for now, we're just grabbing them all.
				Ext.each(['full', 'half', 'quarter'], function (size) {
					if (size === current) {
						return;
					}
					new Image().src =
						basePath + img.getAttribute('data-nti-image-' + size);
				});
			} catch (e) {
				console.warn('Could not precache larger image', containerEl);
			}
		},
	}
);
