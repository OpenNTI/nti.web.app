const Ext = require('extjs');

const ContentProxy = require('legacy/proxy/JSONP');
const {getURL} = require('legacy/util/Globals');
const lazy = require('legacy/util/lazy-require')
	.get('ContentStateStore', ()=> require('./content/StateStore'))
	.get('LibraryStateStore', ()=> require('./StateStore'))
	.get('CoursesActions', ()=> require('./courses/Actions'))
	.get('CoursesStateStore', ()=> require('./courses/StateStore'))
	.get('ContentActions', ()=> require('./content/Actions'))
	.get('ParseUtils', ()=> require('legacy/util/Parsing'))
	.get('LoginStateStore', () => require('legacy/login/StateStore'));



require('legacy/proxy/JSONP');
require('legacy/common/Actions');

module.exports = exports = Ext.define('NextThought.app.library.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.CourseActions = lazy.CoursesActions.create();
		this.ContentActions = lazy.ContentActions.create();

		this.CourseStore = lazy.CoursesStateStore.getInstance();
		this.ContentStore = lazy.ContentStateStore.getInstance();

		this.LibraryStore = lazy.LibraryStateStore.getInstance();
		this.LoginStore = lazy.LoginStateStore.getInstance();
	},


	reload () {
		return Promise.all([
			this.CourseActions.loadCourses(),
			this.ContentActions.loadContent()
		]).then(() => this.CourseStore.afterAddCourse());
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
		var toc, root;

		function query (tag, id) {
			return tag + '[ntiid="' + lazy.ParseUtils.escapeId(id) + '"]';
		}

		function makeAbsolute (o) {
			o.src = getURL(o.src, root);
			o.srcjsonp = getURL(o.srcjsonp, root);
			return o;
		}

		const getToc = contentPackageID ? bundle.getTocFor(contentPackageID) : bundle.getTocs().then(tocs => tocs[0]);
		const contentPackage = contentPackageID ? bundle.getContentPackage(contentPackageID) : bundle.getContentPackages[0];

		return Promise.all([
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
			}).catch((reason) => {
				console.error('Failed to load video index', reason);
			});
	}
});
