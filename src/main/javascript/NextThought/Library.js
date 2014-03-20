//TODO: this needs to become a controller.

Ext.define('NextThought.Library', {
	singleton: true,
	mixins: { observable: 'Ext.util.Observable' },
	requires: [
		'NextThought.store.Library',
		'NextThought.proxy.JSONP',
		'NextThought.util.Base64',
		'NextThought.util.Promise'
	],

	bufferedToc: {},
	activeLoad: {},
	activeVideoLoad: {},

	constructor: function(config) {
		this.promiseToLoad = new Deffered();//XXX: Restructure this so we don't have to use a Deffered()
		this.tocs = {};
		this.addEvents({
			loaded: true
		});

		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
		this.getStore();// pre-init store so we can reference it by id early on
	},


	onceLoaded: function() {
		return this.promiseToLoad;
	},


	getStore: function() {
		var p, me = this;

		p = this.promiseToLoad;

		if (!this.store) {
			this.store = new NextThought.store.Library({
				id: 'library',
				filterOnLoad: false,
				listeners: {
					scope: this,
					load: 'onLoad',
					beforeload: function(s) {
						if (s.isLoading()) {
							return false;
						}

						var old = p;
						p = me.promiseToLoad = new Deffered();
						old.then(function() {return p;});
						old.fulfill();
					}
				},
				filters: [
					{
						fn: function(r) {return !r.get('isCourse'); }
					}
				]
			});
		}
		return this.store;
	},


	getCount: function() {
		var s = this.getStore(),//we filter out items, but we still can access them...
		// so get the true count, not the filtered count.
			o = s.snapshot || s.data;
		return o.getCount();
	},


	getFirstPage: function() {
		var first = this.getStore().first(false, true);
		return (first && first.get('NTIID')) || null;
	},


	each: function(callback, scope) {
		this.getStore().each(callback, scope || this, true);
	},


	getTitle: function(index) {
		var field = 'index';

		if (index instanceof Ext.data.Model) {
			index = index.getId();
		}
		else if (ParseUtils.isNTIID(index)) {
			field = 'NTIID';
		}

		return this.getStore().findRecord(field, index, 0, false, true, true, true);
	},


	findTitleWithPrefix: function(prefix) {
		var result = null;
		this.each(function(e) {
			if (e.get('NTIID').indexOf(prefix) === 0) {
				result = e;
			}
			return !result;
		});

		return result;
	},


	purgeTocs: function() {
		var me = this;

		Ext.Object.each(this.tocs, function(index, toc, o) {
			if (!me.getTitle(index)) {
				delete o[index];
			}
		});
	},


	getToc: function(index) {
		if (index instanceof Ext.data.Model) {
			index = index.getId();
		}

		if (index && !this.tocs[index]) {
			return undefined;
		}

		return this.tocs[index];
	},


	getVideoIndex: function(index, callback, scope) {
		if (index instanceof Ext.data.Model) {
			index = index.getId();
		}

		var me = this,
			title = me.getTitle(index),
			toc = me.getToc(title), t = toc,
			root = title.get('root'),
			url;

		function makeAbsolute(o) {
			o.src = getURL(o.src, root);
			o.srcjsonp = getURL(o.srcjsonp, root);
			return o;
		}

		function query(tag, id) {
			return tag + '[ntiid="' + ParseUtils.escapeId(id) + '"]';
		}

		function parse(q, s, resp) {
			var vi, n, cb, r, keys, keyOrder = [], containers;

			if (!s) {
				delete me.activeVideoLoad[index];
				failure(resp);
				return;
			}

			cb = me.activeVideoLoad[index];
			r = resp.responseText;

			if (Ext.isString(r)) {
				try {
					r = Ext.JSON.decode(r);
				}catch (e) {
					delete me.activeVideoLoad[index];
					failure(e);
					return;
				}
			}

			containers = (r && r.Containers) || {};
			keys = Ext.Object.getKeys(containers);
			keys.sort(function(a, b) {
				var c = toc.querySelector(query('topic', a)) || toc.querySelector(query('toc', a)),
					d = toc.querySelector(query('topic', b)),
					p;

				try {
					p = c.compareDocumentPosition(d);
					return ((p & Node.DOCUMENT_POSITION_PRECEDING) === Node.DOCUMENT_POSITION_PRECEDING) ? 1 : -1;
				} catch (e) {
					console.error(e.stack || e.message || e);
					return 0;
				}
			});

			keys.forEach(function(k) {
				//console.dir(containers[k]);
				keyOrder.push.apply(keyOrder, containers[k]);
			});


			vi = me.videoIndex[index] = (r && r.Items) || r;
			delete me.activeVideoLoad[index];

			for (n in vi) {
				if (vi.hasOwnProperty(n)) {
					n = vi[n];
					if (n && !Ext.isEmpty(n.transcripts)) {
						n.transcripts = n.transcripts.map(makeAbsolute);
					}
				}
			}

			vi._order = keyOrder;
			//console.dir(keyOrder);
			Ext.callback(cb, me, [me.videoIndex[index]]);
		}


		function failure() {
			console.error(arguments);
			Ext.callback(callback, scope);
		}


		if (!t) {
			console.warn('No toc yet for', index);
			failure();
			return;
		}

		if (!me.videoIndex) {
			me.videoIndex = {};
		}

		if (!me.videoIndex[index]) {
			t = t.querySelector('reference[type="application/vnd.nextthought.videoindex"]');
			if (!t) {
				console.warn('No video index defined', index);
				failure();
				return;
			}
			url = getURL(t.getAttribute('href'), title.get('root'));

			if (me.activeVideoLoad[index]) {
				me.activeVideoLoad[index] = Ext.Function.createSequence(me.activeVideoLoad[index], callback || Ext.emptyFn, scope);
				return;
			}

			me.activeVideoLoad[index] = scope ? Ext.bind(callback, scope) : callback;
			ContentProxy.request({
				ntiid: title.get('NTIID'),
				url: url,
				jsonpUrl: url + 'p', //todo: make smarter
				contentType: 'text/json',
				expectedContentType: 'application/json',
				callback: parse
			});
			return;
		}

		Ext.callback(callback, scope, [me.videoIndex[index]]);
	},


	load: function() {
		try {
			this.loaded = false;
			this.getStore().load();
		}
		catch (e2) {
			console.error('Loading Library: ', Globals.getError(e2));
		}
	},


	onLoad: function(store, records, success) {
		function go() {
			me.loaded = true;
			me.fireEvent('loaded', me);
			me.promiseToLoad.fulfill();
			if (me.store.getCount()) {
				me.fireEvent('show-books');
			} else {
				me.fireEvent('hide-books');
			}
		}

		var me = this;

		me.purgeTocs();

		if (success) {
			CourseWareUtils.onceLoaded()
				.done(function() {
					me.libraryLoaded(Ext.bind(go, me));
				})
				.fail(function(reason) {
					me.promiseToLoad.reject(['CoureWare failed to load.', reason]);
				});
		}
		else {
			console.error('FAILED: load library');
			Ext.callback(go, me);
		}
	},


	libraryLoaded: function(callback) {
		var me = this,
			store = this.getStore(),
			count = this.getStore().getCount();


		if (count === 0) {
			console.error('Oh no\'s!\n\n\n\n\n!! No content in Library !!\n\n\n\n\n');
			callback.call(this);
			return;
		}

		function setupToc(o, toc) {
			var d;
			count--;

			if (!toc) {
				console.log('Could not load "' + o.get('index') + '"... removing form library view');
				store.remove(o);
			}
			else {
				d = toc.documentElement;
				o.set('NTIID', d.getAttribute('ntiid'));
				d.setAttribute('base', o.get('root'));
				d.setAttribute('icon', o.get('icon'));
				d.setAttribute('title', o.get('title'));

				if (d.getAttribute('isCourse') === 'true') {
					o.set('isCourse', true);
				}
			}

			if (count <= 0 && callback) {
				store.filter();
				callback.call(me);
			}
		}

		//Loads TOC async, so once the last one loads, callback if available
		this.each(function(o) {
			if (!o.get || !o.get('index')) {
				setupToc(o);
				return;
			}

			me.loadToc(o, o.get('index'), o.get('NTIID'), setupToc);
		});
	},


	loadToc: function(index, url, ntiid, callback) {
		var me = this,
			record = index && index.isModel ? index : null,
			status = CourseWareUtils.getEnrollmentStatus(ntiid);

		if (!this.loaded && !callback) {
			Ext.log.warn('The library has not loaded yet');
		}

		index = (record && record.get('index')) || index;

		function tocLoaded(q, s, r) {
			var xml,
				cb = me.activeLoad[index], n;

			function strip(e) { Ext.fly(e).remove(); }
			function permitOrRemove(e) {
				if (!ContentUtils.hasVisibilityForContent(e, status)) {
					Ext.each(me.getAllNodesReferencingContentID(e.getAttribute('target-ntiid'), xml), strip);
				}
			}

			delete me.tocs[index];

			if (s) {
				xml = me.tocs[index] = me.parseXML(r.responseText);
				if (xml) {
					//Ext.each(Ext.DomQuery.select('topic:not([ntiid])[href*=#]', xml), strip);
					n = Ext.DomQuery.select('[visibility]:not([visibility=everyone])', xml);
					Ext.each(n, permitOrRemove);
				}
				else {
					console.warn('no data for index: ' + url);
				}
			}
			else {
				console.error('There was an error loading part of the library: ' + url, arguments);
			}

			delete me.activeLoad[index];
			Ext.callback(cb, me, [record, xml]);
		}

		try {
			url = getURL(url);

			if (me.activeLoad[index]) {
				me.activeLoad[index] = Ext.Function.createSequence(me.activeLoad[index], callback || Ext.emptyFn, null);
				return;
			}


			me.activeLoad[index] = callback;
			ContentProxy.request({
				ntiid: ntiid,
				jsonpUrl: record.get('index_jsonp'),
				url: url,
				expectedContentType: 'text/xml',
				scope: me,
				callback: tocLoaded
			});
		}
		catch (e) {
			console.error('Error loading the TOC:', e, e.message, e.stack);
		}
	},


	parseXML: function(xml) {
		try {
			return new DOMParser().parseFromString(xml, 'text/xml');
		}
		catch (e) {
			console.error('Could not parse xml for TOC');
		}

		return undefined;
	},


	getAllNodesReferencingContentID: function(ntiid, xml) {
		if (!xml || !ntiid) {
			console.warn('Error: toc/xml or ntiid is empty. Should provide valid toc');
			return [];
		}

		function getNodesForKey(keys) {
			var nodes = [];
			ntiid = ParseUtils.escapeId(ntiid);
			Ext.each(keys, function(k) {
				nodes = Ext.Array.merge(nodes, Ext.DomQuery.select(
					'[' + k + '="' + ntiid + '"]',
					xml));
				}
			);

			return nodes;
		}

		return getNodesForKey(['ntiid', 'target-ntiid']);
	},


	resolve: function(toc, title, containerId, report) {
		var elts, ix, topic, EA = Ext.Array;

		if (!toc) {
			return null;
		}

		if (toc.documentElement.getAttribute('ntiid') === containerId) {
				return {
				toc: toc,
				location: toc.documentElement,
				NTIID: containerId,
				ContentNTIID: containerId,
				title: title
			};
		}

		//returns a flat list of ALL topic tags. No need to recurse
		elts = EA.toArray(toc.getElementsByTagName('topic'));
		// add units to this list
		elts = elts.concat(EA.toArray(toc.getElementsByTagName('unit')));
		elts = elts.concat(EA.toArray(toc.getElementsByTagName('object')));
		elts = elts.concat(EA.toArray(toc.getElementsByTagNameNS('http://www.nextthought.com/toc', 'related')));

		for (ix = elts.length - 1; ix >= 0; ix--) {
			topic = elts[ix];
			if (topic && topic.getAttribute('ntiid') === containerId) {
				return {
					toc: topic.ownerDocument,
					location: topic,
					NTIID: containerId,
					title: title,
					ContentNTIID: topic.ownerDocument.documentElement.getAttribute('ntiid')
				};
			}
		}

		if (this.isDebug && report) {
			console.debug('Not Found: Top:\n', toc.documentElement.getAttribute('ntiid'), '\n', containerId);
			for (ix = elts.length - 1; ix >= 0; ix--) {
				console.debug('Not Found: Topic:\n', elts[ix].getAttribute('ntiid'), '\n', containerId);
			}
		}
		return null;
	}
},
function() {
	window.Library = this;
});
