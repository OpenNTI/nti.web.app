Ext.define('NextThought.app.library.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.library.StateStore',
		'NextThought.app.library.courses.Actions',
		'NextThought.app.library.content.Actions',
		'NextThought.login.StateStore',
		'NextThought.proxy.JSONP'
	],


	constructor: function() {
		this.callParent(arguments);

		this.CourseActions = NextThought.app.library.courses.Actions.create();
		this.ContentActions = NextThought.app.library.content.Actions.create();

		this.LibraryStore = NextThought.app.library.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();

		var store = this.LibraryStore;

		if (window.Service && !store.loading && !store.hasFinishedLoading) {
			this.onLogin();
		} else {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},


	onLogin: function() {
		var s = window.Service,
			store = this.LibraryStore;


		store.setLoading();

		Promise.all([
			this.CourseActions.loadCourses(s),
			this.ContentActions.loadContent(s)
		]).then(function() {
			store.setLoaded();
		});
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


	getVideoIndex: function(bundle) {
		console.warn('DEPCRECIATED: we should try to not rely on getVideoIndex');
		var cache = this.LibraryStore.videoIndex = this.LibraryStore.videoIndex || {},
			index = bundle.getId(), toc, root;

		function query(tag, id) {
			return tag + '[ntiid="' + ParseUtils.escapeId(id) + '"]';
		}

		function makeAbsolute(o) {
			o.src = getURL(o.src, root);
			o.srcjsonp = getURL(o.srcjsonp, root);
			return o;
		}

		if (cache[index]) { return cache[index]; }

		cache[index] =  bundle.getTocs()
			.then(function(tocs) {
				toc = tocs[0];

				var content = bundle.getContentPackages()[0],
					url, req,
					ref = toc && toc.querySelector('reference[type="application/vnd.nextthought.videoindex"]');

				root = content && content.get('root');

				if (!ref || !toc) {
					return Promise.reject('No video index defined, or no toc yet for ' + bundle);
				}

				return ContentProxy.request({
					url: getURL(ref.getAttribute('href'), root),
					ntiid: content.get('NTIID'),
					contentType: 'text/json',
					expectContentType: 'application/json'
				});
			})
			.then(function(json) {
				var vi, n, keys, keyOrder = [],
					containers;

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

						/*jshing bitwise:false*/
						return ((p & Node.DOCUMENT_POSITION_PRECEDING) === Node.DOCUMENT_POSITION_PRECEDING) ? 1 : -1;
					})
				} catch(e) {
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
				vi.containers = containers;

				return vi;
			});

		cache[index].fail(function(reason) {
			console.error('Failed to load video index', reason);
			//it fails, remove the cached promise so it can retry.
			delete cache[index];
		});


		return cache[index];
	}
});
