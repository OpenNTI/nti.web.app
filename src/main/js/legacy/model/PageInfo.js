const Ext = require('@nti/extjs');
const ContentUtils = require('internal/legacy/util/Content');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

const Assignment = require('./assessment/Assignment');

require('./assessment/Question');
require('./Base');

const ContentPackageMimeType =
	'application/vnd.nextthought.renderablecontentpackage';

module.exports = exports = Ext.define('NextThought.model.PageInfo', {
	extend: 'NextThought.model.Base',
	idProperty: 'ID',
	isPage: true,

	statics: {
		fromOutlineNode: function (data) {
			return {
				mimeType: this.mimeType,
				NTIID: data.href,
				label: data.title,
			};
		},
	},

	fields: [
		{ name: 'ContentPackageNTIID', type: 'string' },
		{ name: 'AssessmentItems', type: 'arrayItem' },
		{ name: 'sharingPreference', type: 'auto' },
		{ name: 'dataFilterPreference', type: 'auto' },
		//Placeholder for client-side generated page content :} *facepalm*
		{ name: 'content', type: 'string', persist: false },
		{ name: 'Title', type: 'string' },
		{ name: 'DoNotLoadAnnotations', persist: false },
		{ name: 'isFakePlaceholder', type: 'bool', persist: false },
		{ name: 'isFakePageInfo', type: 'bool', persis: true },
	],

	isPageInfo: true,

	getSubContainerURL: function (rel, id) {
		var pagesCollection = Service.getCollection('Pages') || {};

		if (!pagesCollection.href) {
			return null;
		}

		return (
			pagesCollection.href +
			encodeURIComponent('(' + id + ')') +
			'/UserGeneratedData'
		);
	},

	getTitle: function (/*defaultTitle*/) {
		return this.get('Title');
	},

	getLocationInfo: function () {
		this.locationInfo = this.locationInfo || ContentUtils.getLocation(this);
		return this.locationInfo;
	},

	isPageRoot: function () {
		return !this.getLinkFragment('content');
	},

	getContentPackage() {
		const url = this.getLink('package');
		const request = url
			? Service.request({
					url,
					headers: { Accept: ContentPackageMimeType },
			  })
			: Promise.reject(new Error('No Link'));

		return request.then(resp => {
			return lazy.ParseUtils.parseItems(resp)[0];
		});
	},

	getPageRootID: function () {
		if (this.isPageRoot()) {
			return this.getId();
		}

		var l = (ContentUtils.getLocation(this) || {}).location;

		function isRoot(n) {
			n = n && n.getAttribute('href');
			n = n && n.spnit('#')[1];
			return !l;
		}

		while (l && !isRoot(l)) {
			l = l.parentNode;
		}

		return l && l.getAttribute('ntiid');
	},

	isPartOfCourse: function () {
		var maybe = this.isCourse;

		if (!Ext.isDefined(maybe)) {
			maybe = this.getLocationInfo();
			if (maybe) {
				maybe = maybe.isCourse || false; //false instead of undefined
				this.isCourse = maybe;
			}
		}

		return maybe;
	},

	isPartOfCourseNav: function () {
		var l = this.getLocationInfo(),
			toc = l && l.toc,
			ntiid = (l && l.NTIID) || '--';

		ntiid = '[ntiid="' + lazy.ParseUtils.escapeId(ntiid) + '"]';

		if (!l || !toc) {
			return false;
		}

		return (
			this.isPartOfCourse() &&
			Boolean(
				/^toc$/i.test(l.location.nodeName) ||
					toc.querySelector('unit' + ntiid) ||
					toc.querySelector(
						'lesson' + ntiid.replace(/^\[/, '[topic-')
					)
			)
		);
	},

	getPublicScope: function () {
		var l = this.getLocationInfo(),
			title = l && l.title;
		console.error('[DEPRECATED] User CourseInstance');
		// FIXME: waiting on content for the right field name. Needs testing too.
		return (title && title.getScope('public')) || [];
	},

	getRestrictedScope: function () {
		//i don't think this is used
		var l = this.getLocationInfo(),
			title = l && l.title;
		console.error('[DEPRECATED] User CourseInstance');
		return (title && title.getScope('restricted')) || [];
	},

	hasAssessmentItems: function () {
		var items = this.get('AssessmentItems');

		return !Ext.isEmpty(items);
	},

	getAssignment: function () {
		var items = this.get('AssessmentItems') || [],
			i;

		for (i = 0; i < items.length; i++) {
			if (items[i] instanceof Assignment) {
				return items[i];
			}
		}

		return null;
	},

	/**
	 * If the user has more than one section of the course the assessmentItems might
	 * not be the correct one, so pull them off of the bundle and update our assessmentItems
	 *
	 * @param  {Object} bundle the bundle to sync to
	 * @returns {Promise}		fulfills when its done
	 */
	syncWithBundle: function (bundle) {
		var me = this;

		if (!bundle || !bundle.getAssignments || !me.hasAssessmentItems()) {
			return Promise.resolve();
		}
		//get the assignments from the assignments by outline node request on the course
		return bundle.getAssignments().then(function (assignments) {
			var oldAssessment = me.get('AssessmentItems') || [],
				newAssessment = [];

			//go through our assessment items and get the matching one
			//from the course assignments and update the dates
			oldAssessment.forEach(function (item) {
				var a = assignments.getItem(item.getId());

				if (a) {
					item.set({
						availableBeginning: a.get('availableBeginning'),
						availableEnding: a.get('availableEnding'),
					});
				}
			});

			//if we found any items to replace replace all of them
			if (!Ext.isEmpty(newAssessment)) {
				me.set('AssessmentItems', newAssessment);
			}
		});
	},

	replaceAssignment: function (assignment) {
		var items = this.get('AssessmentItems') || [];

		items = items.map(function (item) {
			if (item.getId() === assignment.getId()) {
				return assignment;
			}

			return item;
		});

		this.set('AssessmentItems', items);
	},

	clone() {
		return lazy.ParseUtils.parseItems(this.rawData)[0];
	},
});
