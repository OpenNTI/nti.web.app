const Ext = require('extjs');
const ParseUtils = require('../../util/Parsing');
const ContentProxy = require('../../proxy/JSONP');
const {getURL} = require('legacy/util/Globals');

require('../../common/Actions');
require('./StateStore');
require('./courses/Actions');
require('./courses/StateStore');
require('./content/Actions');
require('./content/StateStore');
require('../../login/StateStore');
require('../../proxy/JSONP');


module.exports = exports = Ext.define('NextThought.app.library.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.CourseActions = NextThought.app.library.courses.Actions.create();
		this.ContentActions = NextThought.app.library.content.Actions.create();

		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();

		this.LibraryStore = NextThought.app.library.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();
	},


	reload () {
		return Promise.all([
			this.CourseActions.loadCourses(),
			this.ContentActions.loadContent()
		]);
	},


	parseXML: function (xml) {
		try {
			return new DOMParser().parseFromString(xml, 'text/xml');
		}
		catch (e) {
			console.error('Could not parse xml for TOC');
		}

		return undefined;
	},

	findBundle: function (id) {
		return this.CourseActions.findCourseInstance(id)
				.catch(this.ContentActions.findContent.bind(this.ContentActions, id));
	},

	findBundleForNTIID: function (id) {
		return this.CourseActions.findForNTIID(id)
			.catch(this.ContentActions.findForNTIID.bind(this.ContentActions, id));
	},

	findContentPackage: function (id) {
		return this.findBundleForNTIID(id)
			.then(function (bundle) {
				var packages = bundle && bundle.getContentPackages() || [],
					pack;

				packages.forEach(function (p) {
					if (p.get('NTIID') === id) {
						pack = p;
					}
				});

				return pack;
			});
	},

	findBundleBy: function (/*fn*/) {

	},

	/**
	 * Takes a function that takes a course and returns a number priority
	 * and returns an array of the courses ordered by their priority, excluding
	 * courses that have zero or lower priority
	 * @param  {Function} fn takes a bundle instance and wrapper and returns a number
	 * @return {Promise}	 fulfills with an array of bundles in order
	 */
	findBundleByPriority: function (fn) {
		return this.CourseActions.findCourseByPriority(fn)
			.then(function (bundles) {
				if (!bundles || !bundles.length) {
					return Promise.reject();
				}

				return bundles;
			})
			.catch(this.ContentActions.findContentByPriority.bind(this.ContentActions, fn));
	},


	getVideoIndex: function (bundle, contentPackageID) {
		//For now at least it looks like we need this for raw videos in content. Need to
		//look closer at it, but for now remove the depreciation message.
		// console.warn('DEPCRECIATED: we should try to not rely on getVideoIndex');
		var cache = this.LibraryStore.videoIndex = this.LibraryStore.videoIndex || {},
			index = bundle.getId(), toc, root;

		function query (tag, id) {
			return tag + '[ntiid="' + ParseUtils.escapeId(id) + '"]';
		}

		function makeAbsolute (o) {
			o.src = getURL(o.src, root);
			o.srcjsonp = getURL(o.srcjsonp, root);
			return o;
		}

		if (cache[index]) { return cache[index]; }

		const getToc = contentPackageID ? bundle.getTocFor(contentPackageID) : bundle.getTocs().then(tocs => tocs[0]);
		const contentPackage = contentPackageID ? bundle.getContentPackage(contentPackageID) : bundle.getContentPackages[0];

		cache[index] = Promise.all([
			getToc,
			contentPackage
		])
		.then((results) => {
			const content = results[1];

			//TODO: don't rely on closure to set these
			toc = results[0];
			root = content && content.get('root');

			const ref = toc && toc.querySelector('reference[type="application/vnd.nextthought.videoindex"]');

			if (!ref || !toc) {
				return Promise.reject('No video index, defined, or no toc yet for ' + bundle);
			}

			return ContentProxy.request({
				url: getURL(ref.getAttribute('href'), root),
				ntiid: content.get('NTIID'),
				contentType: 'text/json',
				expectContentType: 'application/json'
			});
		})
		.then(function (json) {
			var vi, n, keys, keyOrder = [],
				containers;

			if (Ext.isString(json)) {
				json = Ext.JSON.decode(json);
			}

			containers = (json && json.Containers) || {};
			keys = Ext.Object.getKeys(containers);

			try {
				keys.sort(function (a, b) {
					var c = toc.querySelector(query('topic', a)) || toc.querySelector(query('toc', a)),
						d = toc.querySelector(query('topic', b)),
						p = d && c.compareDocumentPosition(d);

					/*jshint bitwise:false*/
					return ((p & Node.DOCUMENT_POSITION_PRECEDING) === Node.DOCUMENT_POSITION_PRECEDING) ? 1 : -1;
				});
			} catch (e) {
				console.warn('Potentially unsorted:', e.stack || e.message || e);
			}

			keys.forEach(function (k) {
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

		cache[index].catch(function (reason) {
			console.error('Failed to load video index', reason);
			//it fails, remove the cached promise so it can retry.
			delete cache[index];
		});


		return cache[index];
	}
});
