const Ext = require('@nti/extjs');

const {getURL} = require('legacy/util/Globals');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const ModelWithPublish = require('legacy/mixins/ModelWithPublish');

require('./UsersCourseAssignmentAttemptMetadataItem');

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
		{ name: 'UserCompletionCount', type: 'int'},
		{ name: 'SubmittedCount', type: 'int', mapping: 'GradeAssignmentSubmittedCount'},
		{ name: 'SubmittedCountTotalPossible', type: 'int', mapping: 'GradeSubmittedStudentPopulationCount'},
		{ name: 'no_submit', type: 'boolean'},
		{ name: 'version', type: 'string'},
		{ name: 'total_points', type: 'string'},
		{ name: 'submission_buffer', type: 'int'},
		// Timed assignment variables
		{ name: 'IsTimedAssignment', type: 'bool'},
		{ name: 'MaximumTimeAllowed', type: 'int'}, //this is in seconds
		{ name: 'Metadata', type: 'auto'},
		{ name: 'CurrentMetadataAttemptItem', type: 'singleItem'},
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

	isOutsideSubmissionBuffer () {
		const now = new Date();
		const due = this.getDueDate();
		const submissionBuffer = this.get('submission_buffer');

		//If there is no submission buffer or due date we aren't after the submission buffer
		if ((!submissionBuffer && submissionBuffer !== 0) || !due) {
			return false;
		}

		const latest = new Date(due.getTime() + ((submissionBuffer || 0) * 1000));

		return latest < now;
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
				if (reason.status !== 404) {
					console.error('Failed to get the assignment save point: ', reason);
				}
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
			var course = instance.getLink('CourseInstance'),
				href = nomnom(course);

			console.log('nomnom? "%s" === "%s"', href, link);
			return href === link;
		};
	},

	getQuestionCount: function () {
		var parts = this.get('parts'),
			part = parts && parts[0];

		return part && part.tallyParts();
	},


	shouldAutoStart: function () {
		return !this.isTimed;
	},


	hasSubmission () {
		return this.hasHistoryLink();
	},


	isStarted: function () {
		const attempt = this.get('CurrentMetadataAttemptItem');

		return !!attempt || !this.hasLink('Commence');
	},


	start: function () {
		const link = this.getLink('Commence');

		if (!link) {
			console.error('No Commence Link.');
			return Promise.reject();
		}

		return Service.post(link)
			.then((response) => {
				return this.syncWithResponse(response);
			});
	},


	getLatestAttempt () {
		const current = this.get('CurrentMetadataAttemptItem');

		if (current) {
			return Promise.resolve(current);
		}


		return this.getHistory()
			.then(history => {
				return history.get('MetadataAttemptItem');
			})
			.catch(() => null);
	},


	//Timed Assignment Methods
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


	getTimeRemaining: function () {
		const current = this.get('CurrentMetadataAttemptItem');
		const link = current && current.getLink('TimeRemaining');

		const fail = () => {
			console.error('Unable to get time remaining... Returning Zero');
			return Promise.resolve(0);
		};

		if (!link) {
			return fail();
		}

		return Service.request(link)
			.then((response) => {
				const json = JSON.parse(response);

				return json.TimeRemaining * 1000;
			})
			.catch(fail);
	},


	getDuration: function () {
		throw new Error('Duration is no longer available on the assignment metadata, you have to get it from the history item');
	}
});
