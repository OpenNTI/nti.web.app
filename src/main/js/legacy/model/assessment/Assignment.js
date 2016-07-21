const Ext = require('extjs');
const ParseUtils = require('legacy/util/Parsing');
const {getURL} = require('legacy/util/Globals');

require('legacy/mixins/ModelWithPublish');

require('legacy/model/Base');


module.exports = exports = Ext.define('NextThought.model.assessment.Assignment', {
	extend: 'NextThought.model.Base',
	isAssignment: true,

	mixins: {
		ModelWithPublish: NextThought.mixins.ModelWithPublish
	},

	fields: [
		{ name: 'category_name', type: 'string'},
		{ name: 'ContainerId', type: 'string', persist: false, convert: function (v, rec) {
			return v || (rec && rec.raw.containerId);
		}},
		{ name: 'containerId', type: 'string' },//lowercase C?
		{ name: 'content', type: 'string' },
		{ name: 'availableBeginning', type: 'ISODate', mapping: 'available_for_submission_beginning' },
		{ name: 'availableEnding', type: 'ISODate', mapping: 'available_for_submission_ending' },
		{ name: 'PublicationState', type: 'string'},
		{ name: 'parts', type: 'arrayItem' },
		{ name: 'title', type: 'string' },
		{ name: 'SubmittedCount', type: 'int', mapping: 'GradeAssignmentSubmittedCount'},
		{ name: 'no_submit', type: 'boolean'},
		{ name: 'version', type: 'string'}
	],

	isAvailable: function () {
		var now = new Date(),
			start = this.get('availableBeginning');

		return !start || start < now;
	},

	containsId: function (id) {
		var parts = this.get('parts') || [],
			items = parts.filter(function (p) {
				p = p.get('question_set');
				return p && p.getId() === id;
			});

		return items.length > 0;
	},


	canEdit () {
		return !!this.getLink('edit');
	},


	canSaveProgress: function () {
		return !!this.getLink('Savepoint');
	},

	getSavePoint: function () {
		var url = this.getLink('Savepoint');

		if (!url) {
			return Promise.resolve();
		}

		return Service.request(url)
			.then(function (response) {
				return ParseUtils.parseItems(response)[0];
			})
			.catch(function (reason) {
				console.error('Failed to get the assignment save point: ', reason);
			});
	},

	setHistoryLink: function (link) {
		this.historyLink = link;
	},

	getHistory: function () {
		var link = this.historyLink || this.getLink('History');

		if (!link) { return Promise.reject(); }

		return Service.request(link)
			.then(function (response) {
				return ParseUtils.parseItems(response)[0];
			});
	},

	hasHistoryLink: function () {
		return !!(this.historyLink || this.getLink('History'));
	},

	getDueDate: function () {
		return this.get('availableEnding');
	},

	getDateEditingLink: function () {
		return this.getLink('date-edit') || this.getLink('edit');
	},

	tallyParts: function () {
		function sum (agg, r) {
			return agg + (r.tallyParts ? r.tallyParts() : 1);
		}
		return (this.get('parts') || []).reduce(sum, 0);
	},

	isOpen: function () {
		var start = this.get('availableBeginning');

		return !start || start < new Date();
	},

	isNoSubmit: function () {
		return this.get('no_submit');
	},

	/**
	 * If the assignment has parts or not
	 * @return {Boolean} False if there are parts
	 */
	isEmpty: function () {
		return Ext.isEmpty(this.get('parts'));
	},

	doNotShow: function () {
		return this.isDeleted ||  this.isNoSubmit() && this.get('title') === 'Final Grade';
	},

	findMyCourse: function () {
		//returns a string that can be compared. NOTE: not for use as a URL!
		function nomnom (href) {
			return (getURL(href) || '').split('/').map(decodeURIComponent).join('/');
		}

		var link = (this.getLink('History') || this.get('href')).replace(/\/AssignmentHistories.*/, '');

		link = nomnom(link);

		return function (instance) {
			var course = instance.get('CourseInstance') || instance,
				href = nomnom(course && course.get('href'));

			return href === link;
		};
	},

	getQuestionCount: function () {
		var parts = this.get('parts'),
			part = parts && parts[0];

		return part && part.tallyParts();
	}
});
