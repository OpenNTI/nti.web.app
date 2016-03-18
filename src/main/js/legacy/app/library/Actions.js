var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');
var ContentProxy = require('../../proxy/JSONP');
var CommonActions = require('../../common/Actions');
var LibraryStateStore = require('./StateStore');
var CoursesActions = require('./courses/Actions');
var CoursesStateStore = require('./courses/StateStore');
var ContentActions = require('./content/Actions');
var ContentStateStore = require('./content/StateStore');
var LoginStateStore = require('../../login/StateStore');
var ProxyJSONP = require('../../proxy/JSONP');


module.exports = exports = Ext.define('NextThought.app.library.Actions', {
    extend: 'NextThought.common.Actions',

    constructor: function() {
		this.callParent(arguments);

		this.CourseActions = NextThought.app.library.courses.Actions.create();
		this.ContentActions = NextThought.app.library.content.Actions.create();

		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();

		this.LibraryStore = NextThought.app.library.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();

		var store = this.LibraryStore;

		if (window.Service && !store.loading && !store.hasFinishedLoad) {
			this.onLogin();
		} else {
			this.LoginStore.registerLoginAction(this.onLogin.bind(this), 'load-library');
		}
	},

    onLogin: function() {
		var s = window.Service,
			store = this.LibraryStore,
			courseStore = this.CourseStore,
			contentStore = this.ContentStore;


		store.setLoading();

		Promise.all([
			this.CourseActions.loadCourses(s),
			this.ContentActions.loadContent(s)
		])
		.then(this.deDupContentPackages.bind(this))
		.then(function() {
			store.setLoaded();
			courseStore.setLoaded();
			contentStore.setLoaded();
		});
	},

    /**
	 * Iterate the courses, admin courses, and content bundles, adding the content packages
	 * they use to a list, then tell the content store to remove any content packages in that
	 * list
	 *
	 * TODO: needs unit tests
	 */
	deDupContentPackages: function() {
		var courses = this.CourseStore.getEnrolledCourses(),
			admin = this.CourseStore.getAdminCourses(),
			bundles = this.ContentStore.getContentBundles(),
			used = {};

		function unWrapBundle(bundle) {
			var packages = bundle.getContentPackages();

			packages.forEach(function(p) {
				used[p.getId()] = true;
			});
		}

		function unWrapCourse(course) {
			return unWrapBundle(course.get('CourseInstance'));
		}

		courses.forEach(unWrapCourse);


		admin.forEach(unWrapCourse);


		bundles.forEach(unWrapBundle);

		this.ContentStore.deDupContentPackages(used);
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

    findBundle: function(id) {
		return this.CourseActions.findCourseInstance(id)
				.fail(this.ContentActions.findContent.bind(this.ContentActions, id));
	},

    findBundleForNTIID: function(id) {
		return this.CourseActions.findForNTIID(id)
			.fail(this.ContentActions.findForNTIID.bind(this.ContentActions, id));
	},

    findContentPackage: function(id) {
		return this.findBundleForNTIID(id)
			.then(function(bundle) {
				var packages = bundle && bundle.getContentPackages() || [],
					pack;

				packages.forEach(function(p) {
					if (p.get('NTIID') === id) {
						pack = p;
					}
				});

				return pack;
			});
	},

    findBundleBy: function(fn) {

	},

    /**
	 * Takes a function that takes a course and returns a number priority
	 * and returns an array of the courses ordered by their priority, excluding
	 * courses that have zero or lower priority
	 * @param  {Function} fn takes a bundle instance and wrapper and returns a number
	 * @return {Promise}     fulfills with an array of bundles in order
	 */
	findBundleByPriority: function(fn) {
		return this.CourseActions.findCourseByPriority(fn)
			.then(function(bundles) {
				if (!bundles || !bundles.length) {
					return Promise.reject();
				}

				return bundles;
			})
			.fail(this.ContentActions.findContentByPriority.bind(this.ContentActions, fn));
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

		cache[index] = bundle.getTocs()
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
							p = d && c.compareDocumentPosition(d);

						/*jshing bitwise:false*/
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
