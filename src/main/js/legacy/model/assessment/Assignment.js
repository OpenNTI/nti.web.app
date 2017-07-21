const Ext = require('extjs');

const {getURL} = require('legacy/util/Globals');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const TimeUtils = require('legacy/util/Time');
const ModelWithPublish = require('legacy/mixins/ModelWithPublish');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.assessment.Assignment', {
	extend: 'NextThought.model.Base',
	isAssignment: true,

	statics: {
		TimedAssignmentMimeType: 'application/vnd.nextthought.assessment.timedassignment',
		mimeType: [
			'application/vnd.nextthought.assessment.assignment',
			'application/vnd.nextthought.assessment.timedassignment'
		]
	},

	mimeType: [
		'application/vnd.nextthought.assessment.assignment',
		'application/vnd.nextthought.assessment.timedassignment'
	],

	mixins: {
		ModelWithPublish
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
		{ name: 'title', type: 'string',
			convert (v) {
				return v || '(No Title)';
			}
		},
		{ name: 'SubmittedCount', type: 'int', mapping: 'GradeAssignmentSubmittedCount'},
		{ name: 'SubmittedCountTotalPossible', type: 'int', mapping: 'GradeSubmittedStudentPopulationCount'},
		{ name: 'no_submit', type: 'boolean'},
		{ name: 'version', type: 'string'},
		{ name: 'total_points', type: 'string'},
		// Timed assignment variables
		{ name: 'IsTimedAssignment', type: 'bool'},
		{ name: 'MaximumTimeAllowed', type: 'int'}, //this is in seconds
		{ name: 'Metadata', type: 'auto'},
		//ui fields
		{ name: 'isStarted', type: 'bool', persist: false, convert: function (v, rec) {
			return v || !!rec.getLink('StartTime');
		}}
	],

	constructor () {
		this.callParent(arguments);
		Object.defineProperty(this, 'isTimed', {
			get: () => this.get('IsTimedAssignment')
		});
	},

	isAvailable: function () {
		var now = new Date(),
			start = this.get('availableBeginning');

		return !start || start < now;
	},

	containsId: function (id) {
		var parts = this.get('parts') || [],
			items = parts.filter(function (p) {
				const qSet = p.get('question_set');
				const questionSetID = p.get('QuestionSetId') || (qSet && qSet.getId());

				return questionSetID === id;
			});

		return items.length > 0;
	},


	canEdit () {
		//There are a lot more links that drive editing different fields on an assignment
		//for now we'll stick to these two until we have a case where we need to check more
		return this.hasLink('edit') || this.hasLink('date-edit');
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
				return lazy.ParseUtils.parseItems(response)[0];
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
				return lazy.ParseUtils.parseItems(response)[0];
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


	getTotalPointsLabel () {
		const points = this.get('total_points');

		if (isNaN(points) || points < 1) {
			return '';
		}

		return `${points.trim()} pts.`;
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
	},

	//Timed Assignment Methods
	isStarted: function () {
		return this.get('isStarted');
	},


	start: function () {
		var me = this,
			link = this.getLink('Commence');

		if (!link) {
			console.error('No commence link');
			return Promise.reject();
		}

		return Service.post(link)
			.then(function (response) {
				return me.syncWithResponse(response);
			});
	},


	updateMetaData: function (metaData) {
		var current = this.get('Metadata');

		if (!current) {
			this.set('Metadata', metaData);
		}
	},


	getMaxTime: function () {
		var maxTime = this.get('MaximumTimeAllowed');

		return maxTime * 1000;
	},


	getMaxTimeString: function () {
		var maxTime = this.get('MaximumTimeAllowed');

		return TimeUtils.getNaturalDuration(maxTime, 2);
	},


	getStartTime: function () {
		var metaData = this.get('Metadata');

		return (metaData && (metaData.StartTime * 1000));
	},


	getTimeRemaining: function () {
		var link = this.getLink('TimeRemaining');

		function fail () {
			console.error('Unable get time remaining.. Returning Zero');
			return Promise.resolve(0);
		}

		if (!link) {
			return fail();
		}

		return Service.request(link)
			.then(function (response) {
				var json = JSON.parse(response);

				return json.TimeRemaining * 1000;
			})
			.catch(fail);
	},


	getDuration: function () {
		var metaData = this.get('Metadata');

		return metaData && (metaData.Duration * 1000);
	}
});
