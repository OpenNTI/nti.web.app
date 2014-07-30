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
		this.tocs = {};
		this.addEvents({
			loaded: true
		});

		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
		this.getStore();// pre-init store so we can reference it by id early on
	},


	onceLoaded: function() {
		if (!this.promiseToLoad) {
			this.promiseToLoad = new Deferred();//XXX: Restructure this so we don't have to use a Deferred()
		}
		return this.promiseToLoad;
	},


	getStore: function() {
		var me = this;

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

						var old = me.onceLoaded(),
							p = me.promiseToLoad = new Deferred();

						p.chain(old);
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


	removeForPrefix: function(prefix) {
		var t = this.findTitleWithPrefix(prefix);
		if (t) {
			this.purgeToc(t);
			this.store.remove(t);
		}
	},


	purgeTocs: function() {
		var map = this.tocs,
			indices = Object.keys(map),
			i = indices.length, key;

		while (--i >= 0) {
			key = indices[i];
			if (!this.getTitle(key)) {
				delete map[key];
			}
		}
	},


	purgeToc: function(thing) {
		var t = this.getTitle(thing);
		if (t) {
			delete this.tocs[t.getId()];
		} else {
			console.error('Could not purge ToC for ', thing);
		}
	},


	getToc: function(index) {//todo: return a promise instead
		if (index instanceof Ext.data.Model) {
			index = index.getId();
		}

		if (index && !this.tocs[index]) {
			return undefined;
		}

		return this.tocs[index];
	},


	getVideoIndex: function(index) {
		if (index instanceof Ext.data.Model) {
			index = index.getId();
		}

		var me = this,
			title = me.getTitle(index),
			toc = me.getToc(title),
			ref = toc && toc.querySelector('reference[type="application/vnd.nextthought.videoindex"]'),
			root = title && title.get('root'),
			url, req;

		function parse(json) {
			var vi, n, keys, keyOrder = [],
				containers;

			function makeAbsolute(o) {
				o.src = getURL(o.src, root);
				o.srcjsonp = getURL(o.srcjsonp, root);
				return o;
			}

			function query(tag, id) {
				return tag + '[ntiid="' + ParseUtils.escapeId(id) + '"]';
			}


			if (Ext.isString(json)) {
				json = Ext.JSON.decode(json);
			}

			containers = (json && json.Containers) || {};
			keys = Ext.Object.getKeys(containers);

			try {
				keys.sort(function(a, b) {
					var c = toc.querySelector(query('topic', a)) || toc.querySelector(query('toc', a)),
						d = toc.querySelector(query('topic', b)),
						p = c.compareDocumentPosition(d);
					return ((p & Node.DOCUMENT_POSITION_PRECEDING) === Node.DOCUMENT_POSITION_PRECEDING) ? 1 : -1;
				});
			} catch (e) {
				console.warn('Potentially unsorted:', e.stack || e.message || e);
			}

			keys.forEach(function(k) {
				keyOrder.push.apply(keyOrder, containers[k]);
			});

			vi = (json && json.Items) || json;
			for (n in vi) {
				if (vi.hasOwnProperty(n)) {
					n = vi[n];
					if (n && !Ext.isEmpty(n.transcripts)) {
						n.transcripts = n.transcripts.map(makeAbsolute);
					}
				}
			}

			vi._order = keyOrder;

			return vi;
		}


		if (!toc || !ref) {
			return Promise.reject('No video index defined, or no toc yet for ' + index);
		}

		me.videoIndex = me.videoIndex || {};

		if (!me.videoIndex[index]) {
			url = getURL(ref.getAttribute('href'), title.get('root'));
			req = {
				ntiid: title.get('NTIID'),
				url: url,
				jsonpUrl: url + 'p', //todo: make smarter
				contentType: 'text/json',
				expectedContentType: 'application/json'
			};

			me.videoIndex[index] = ContentProxy.request(req).then(parse); //the promise returned by 'then' is what is cached.

			me.videoIndex[index].fail(function(reason) {
				console.error(reason);
				//it fails, remove the cached promise so it can retry.
				delete me.videoIndex[index];
			});
		}

		return me.videoIndex[index];
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
			if (me.promiseToLoad) {
				me.promiseToLoad.fulfill();
			} else {
				me.promiseToLoad = Promise.resolve();
			}

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
					reason = ['CoureWare failed to load.', reason];
					if (me.promiseToLoad) {
						me.promiseToLoad.reject(reason);
					} else {
						me.promiseToLoad = Promise.reject(reason);
					}
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
				o.on('icon-changed', function() {
					d.setAttribute('icon', o.get('icon'));
				});

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


	resolve: function(toc, title, containerId, report) {//todo: return a promise instead
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
