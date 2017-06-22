const Ext = require('extjs');

const ImageZoomView = require('legacy/common/ux/ImageZoomView');
const SlideDeck = require('legacy/common/ux/SlideDeck');
const ContentUtils = require('legacy/util/Content');
const Globals = require('legacy/util/Globals');
const ObjectUtils = require('legacy/util/Object');
const ParseUtils = require('legacy/util/Parsing');
const {getString} = require('legacy/util/Localization');
const NavigationActions = require('legacy/app/navigation/Actions');

require('legacy/common/ux/IFramePopout');


module.exports = exports = Ext.define('NextThought.app.contentviewer.reader.Content', {
	alias: 'reader.content',

	mixins: {
		observable: 'Ext.util.Observable'
	},

	BODY_TEMPLATE: Ext.DomHelper.createTemplate({ id: 'NTIContent', html: '{0}'}).compile(),
	getBubbleTarget: function () {return this.reader; },

	constructor: function (config) {
		Ext.apply(this, config);
		var me = this,
			reader = me.reader;

		me.loadedResources = {};
		me.meta = {};
		me.css = {};

		me.mixins.observable.constructor.apply(me);

		reader.on('destroy', 'destroy',
			reader.relayEvents(me, [
				'navigate-to-href',
				'markupenabled-action',
				'set-content',
				'image-loaded',
				'clear-annotations',
				'load-annotations-skipped',
				'load-annotations'
			]));

		me.mon(reader, 'content-updated-with', 'insertRelatedLinks', me);


		ObjectUtils.defineAttributes(reader, {
			basePath: {
				getter: function () {return me.basePath;}
			}
		});

		reader.getContentRoot = Ext.bind(this.getContentRoot, this);
	},

	getDocumentElement: function () {
		return this.reader.getDocumentElement();
	},

	getContentRoot: function () {
		if (!this.contentRootElement) {
			this.contentRootElement = this.getDocumentElement().querySelector('#NTIContent > .page-contents');
		}

		return this.contentRootElement;
	},

	listenForImageLoads: function () {
		var d = this.getDocumentElement(),
			imgs = d.querySelectorAll('img'),
			me = this;

		Ext.each(imgs, function (i) {
			i.onload = function () {
				me.fireEvent('image-loaded');
			};
		});
	},

	insertRelatedLinks: function (body, doc) {
		var position = body.query('#NTIContent .chapter.title')[0],
			reader = this.reader,
			tpl = this.relatedTemplate, last = null,
			c = 0,
			container = {
				tag: 'div',
				cls: 'injected-related-items',
				html: 'Related Topics:'
			};

		reader.getRelated()
			.then(function (related) {
				if (Ext.Object.getKeys(related).length === 0) {
					return;
				}

				try {
					container = Ext.DomHelper.insertAfter(position, container);
				} catch (er) {
					try {
						position = Ext.fly(doc.body).query('#NTIContent .page-contents')[0];
						container = Ext.DomHelper.insertFirst(position, container);
					}
					catch (ffs) {
						return;
					}
				}

				container = Ext.DomHelper.append(container, {tag: 'span', cls: 'related'});

				if (!tpl) {
					tpl = Ext.DomHelper.createTemplate({
						tag: 'a', href: '{0}',
						onclick: 'window.top.ReaderPanel.get(\'{3}\').relatedItemHandler(this);return false;',
						cls: 'related c{2}', html: '{1}'}).compile();

					this.relatedTemplate = tpl;
				}

				Ext.Object.each(related, function (key, value) {
					c++;
					last = tpl.append(container, [key, value.label, c, reader.prefix]);
					last.relatedInfo = value;
				});

				if (last) {
					container = container.parentNode;

					if (c > 10) {
						Ext.DomHelper.append(container, {tag: 'span', cls: 'more', html: getString('NextThought.view.content.reader.Content.showmore')});
					}

					Ext.fly(container).on('click', function () {
						Ext.fly(container).removeAllListeners().addCls('showall');
					});
				} else {
					Ext.fly(container).remove();
				}
			})
			.catch(function (e) {
				console.warn('Could not insert related links due to: ', e.stack || e.message || e);
				return;
			});
	},

	//TODO: move this to a better place.
	pauseAllVideos: function () {
		var d = this.getDocumentElement(),
			frames = d.querySelectorAll('iframe');

		Ext.each(frames, function (o) {
			if (/^(http(s)?:)?\/\/www\.youtube\.com/i.test(o.getAttribute('src'))) {
				o.contentWindow.postMessage(JSON.stringify({
					event: 'command',
					func: 'pauseVideo',
					args: [],
					id: o.getAttribute('id')
				}), '*');
			}
			//else if(vimeo){}
			//else if(html5){}...
		});
		Ext.each(Ext.ComponentQuery.query('overlay-video-roll'), function (c) {c.pauseVideo();});
	},

	resolveContainers: function () {
		var d = this.getDocumentElement(),
			els, containers = [];

		//TODO: get all ntiids on the page.
		//els = d.querySelectorAll('[data-ntiid],[ntiid]');

		//for now just get object tags (assessment items)
		els = d.querySelectorAll('[data-ntiid]');

		Ext.each(els, function (el) {
			var id = el.getAttribute('data-ntiid') || el.getAttribute('ntiid');
			//Depends on overlayed panels being constructed and setting the attribute...
			if (!el.hasAttribute('data-nti-container')) {return;}
			containers.push(id);
		});

		// these should already be in the order of the dom.
		return containers;
	},

	setContent: function (resp, assessmentItems, finish) {
		var me = this,
			req = resp.request,
			o = req.options,
			c = me.parseHTML(resp),
			doc = me.getDocumentElement(),
			reader = me.reader,
			ntiid,
			pageInfo = o.pageInfo;

		me.fireEvent('clear-annotations');

		reader.getIframe().update(this.BODY_TEMPLATE.apply([c]), this.meta);

		me.listenForImageLoads();
		reader.getScroll().to(0, false);


		//apply any styles that may be on the content's body, to the NTIContent div:
		this.applyBodyStyles(
			resp.responseText.match(/<body([^>]*)>/i),
			this.buildPath(resp.request.options.url));

		ntiid = reader.getLocation().NTIID;

		doc.getElementById('NTIContent').setAttribute('data-page-ntiid', ntiid);
		me.adjustNTIIDLinks(doc);

		me.fireEvent('set-content', reader, doc, assessmentItems, pageInfo);

		//Do not attempt to load annotations from these locations
		if (!pageInfo.isPartOfCourseNav() && !pageInfo.get('DoNotLoadAnnotations')) {
			me.fireEvent('load-annotations', ntiid, me.resolveContainers());
		} else {
			me.fireEvent('load-annotations-skipped');
		}

		Ext.callback(finish, null, [reader]);
	},

	buildPath: function (s) {
		var p = (s || '').split('/'); p.splice(-1, 1, '');
		return (s && p.join('/')) || '';
	},

	parseHTML: function (request) {
		const me = this;
		const basePath = this.buildPath(request.request.options.url);
		const rc = me.loadedResources;

		const c = request.responseText;
		const rf = c.toLowerCase();

		const start = rf.indexOf('>', rf.indexOf('<body')) + 1;
		const end = rf.indexOf('</body');

		const head = c.substring(0, start).replace(/[\t\r\n\s]+/g, ' ');
		const body = c.substring(start, end);


		function toObj (a, k, v) {
			var i = a.length - 1, o = {};
			for (i; i >= 0; i--) { o[(k.exec(a[i]) || [])[2]] = Ext.htmlDecode((v.exec(a[i]) || [])[1]); }
			return o;
		}

		function metaObj (m) {
			return toObj(m, /(name|http\-equiv)="([^"]+)"/i, /content="([^"]*)"/i);
		}

		function cssObj (m) {
			const key = /href="([^"]*)"/i;

			for (let i = 0; i < m.length; i++) {
				const o = key.test(m[i]) ? basePath + key.exec(m[i])[1] : m[i];
				c[o] = {};
				if (!rc[o]) {
					rc[o] = c[o] = Globals.loadStyleSheet({
						url: o,
						document: me.getDocumentElement()
					});
				}
			}

			//remove resources not used anymore...
			Ext.Object.each(rc, (k, v, o) => {
				if (!c[k]) {
					Ext.fly(v).remove();
					delete o[k];
				}
			});

			return c;
		}

		me.basePath = basePath;

		this.meta = metaObj(head.match(/<meta[^>]*>/gi) || []);
		this.meta.title = ((/<title[^>]*>(.*)<\/title>/gi).exec(head) || [])[1];
		this.css = cssObj(head.match(/<link[^<>]*?href="([^"]*css)"[^<>]*>/ig) || []);

		return ContentUtils.fixReferences(body, basePath);
	},

	applyBodyStyles: function (bodyTag, basePath) {
		var styleMatches = bodyTag && bodyTag[1] && bodyTag[1].match(/style="([^"]+)"/i),
			bodyStyles = styleMatches && styleMatches[1],
			body = Ext.get(this.getDocumentElement().getElementById('NTIContent')),
			bodyStylesObj = {};

		//Create an object with our styles split out
		if (bodyStyles) {
			Ext.each(bodyStyles.split(';'), function (s) {
				var keyVal = s.split(':'),
					key = keyVal[0].trim(),
					val = keyVal[1].trim(),
					url;

				//make any url adjustments:
				if (key === 'background-image') {
					val = val.replace(/['|"]/g , '').replace('"', '');
					url = val.match(/url\(([^\)]*)/i)[1];
					val = 'url(' + basePath + url + ')';
				}

				bodyStylesObj[key] = val;
			});
		}
		body.setStyle(bodyStylesObj);
	},

	//We would like all links to be both clickable in the app and right clickable to open in a
	//new tab.	However we can't really hijack the context menu or cntlclicking and by default
	//doing that on ntiids is just going to barf in the new tab.  So rewrite ntiid based links here
	//in a way that the browsers native handling can process them (basically going out and coming back in)
	//however we decorate the links such that our click handler to handle links internally can
	//act as they always had.
	adjustNTIIDLinks: function (doc) {
		var links = doc.querySelectorAll('a[href^="tag:nextthought.com"]');

		Ext.Array.each(links, function (l) {
			var link = Ext.fly(l),
				ntiid = ParseUtils.parseNTIID(link.getAttribute('href') || ''),
				type, provider, typeSpecific, externalLink;

			if (ntiid) {
				type = ntiid.specific.type;
				provider = ntiid.specific.provider;
				typeSpecific = ntiid.specific.typeSpecific;

				if (type && provider && typeSpecific) {
					externalLink = Ext.String.format('/app/#!{0}/{1}/{2}', type, provider, typeSpecific);

					if (externalLink) {
						link.set({
							'data-internal-nav-href': ntiid.toString(),
							'href': externalLink
						});
					}
				}
			}
		});


	},

	navigateToFragment: function (frag) {
		this.reader.getScroll().toTarget(frag);
	},

	onClick: function (e, el) {
		//Stupid FF fires onClick for right click. WTF!
		if (e.button !== 0) {
			return true;
		}


		e.stopEvent();
		var m = this,
			r = el.getAttribute('data-internal-nav-href') || el.href,
			p = el.getAttribute('data-presentation'),
			hash = r.split('#'),
			target = hash[1],
			whref = window.location.href.split('#')[0],
			doc = this.reader.getDocumentElement(),
			element = doc.getElementById(target) || doc.getElementsByName(target)[0] || null,
			isExternalUri = ContentUtils.isExternalUri(r);

		if (p && p === 'popup') {
			Ext.widget('iframe-lightbox', { src: m.basePath.concatPath(el.getAttribute('data-source-wrapped')) }).show();
			return false;
		}

		//Is this a special internal link that we need to handle
		if (el.getAttribute('onclick') || !r || whref + '#' === r) {
			return false;
		}

		if (Ext.fly(el).is('.disabled')) {
			return false;
		}

		if (/^slide/i.test(target) && !isExternalUri) {
			this.pauseAllVideos();
			SlideDeck.openFromDom(el, this.reader);
			return false;
		}

		if (/^zoom$/i.test(target) && !isExternalUri) {
			Ext.defer(function () {
				m.reader.getIframe().get().win.blur();
				window.focus();
			},100);
			ImageZoomView.zoomImage(el, this.reader);
			return false;
		}

		if (/^mark$/i.test(target) && !isExternalUri) {
			m.fireEvent('markupenabled-action', el, target);
			return false;
		}

		if (element) {
			this.reader.getScroll().toNode(element);
			return false;
		}

		if (NavigationActions.navigateToHref(r)) {
			//Someone handled us so stop the event
			return false;
		}
		else {
			// if we have hash/fragment and it's an internal link, scroll to the fragment.
			if (target && !isExternalUri) {
				this.reader.goToFragment(target);
			}
		}

		console.warn('Unable to handle content link navigation for ', el, r);
		return undefined;
	}
});
