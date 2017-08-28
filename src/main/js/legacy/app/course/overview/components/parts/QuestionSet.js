const Ext = require('extjs');

const {getString, getFormattedString} = require('legacy/util/Localization');
const ContentUtils = require('legacy/util/Content');
const Globals = require('legacy/util/Globals');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const AssessedQuestionSet = require('legacy/model/assessment/AssessedQuestionSet');
const PageInfo = require('legacy/model/PageInfo');

require('legacy/common/chart/Score');
require('legacy/model/QuestionSetRef');
require('legacy/model/AssignmentRef');
require('../../../../assessment/ScoreboardHeader');
require('../../../../assessment/ScoreboardTally');
require('../../../assessment/components/AssignmentStatus');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.QuestionSet', {
	extend: 'Ext.Panel',

	alias: [
		'widget.course-overview-naquestionset',
		'widget.course-overview-questionsetref',
		'widget.course-overview-nanosubmitassignment',
		'widget.course-overview-naassignment',
		'widget.course-overview-assignment',
		'widget.course-overview-assignmentref'
	],

	statics: {
		isAssessmentWidget: true
	},

	header: false,
	cls: 'scoreboard overview-naquestionset',
	ui: 'assessment',
	layout: 'none',
	items: [],

	config: {
		assignment: null,
		containerId: null,
		ntiid: null,
		total: 0,
		quetionSetContainerTitle: ''
	},

	constructor: function (config) {
		var me = this,
			n = config.node || {getAttribute: function (a) { return config[a];} },
			ntiid = n.getAttribute('target-ntiid') || 'no-value',
			rec = config && config.record;

		config = Ext.apply(config, {
			quetionSetContainerTitle: n.getAttribute('label'),
			ntiid: ntiid,
			questionSetId: ntiid,
			total: n.getAttribute('question-count') || (rec && rec.get('question-count'))
		});

		delete config.title;

		me.callParent([config]);


		if (config.xtype !== 'course-overview-assignment') {
			me.buildForAssessment();
		} else if (me.assignment) {
			me.buildForAssignment();
		} else {
			console.warn('Hidding Assignment widget. Assignmet was null. %o', config);
			me.hide();
		}
	},

	getButton: function () {
		var me = this;

		return {
			xtype: 'button',
			text: getString('NextThought.view.courseware.overview.parts.QuestionSet.review'),
			ui: 'secondary',
			scale: 'large',
			cls: 'review-btn',
			handler: function () {
				me.reviewClicked();
			}
		};
	},

	buildForAssessment: function () {
		var me = this,
			req, ntiid = this.getNtiid();

		me.add([
			{xtype: 'chart-score'},
			{xtype: 'assessment-tally', flex: 1, ellipseMessage: true},
			me.getButton()
		]);

		req = {
			scope: me,
			method: 'GET',
			params: {
				accept: AssessedQuestionSet.mimeType,
				batchStart: 0,
				batchSize: 1,
				sortOn: 'lastModified',
				sortOrder: 'descending',
				filter: 'TopLevel'
			},
			callback: me.containerLoaded.bind(me)
		};

		ContentUtils.getLineage(ntiid, me.course)
			.then(function (lineages) {
				var lineage = lineages[0],
					containerId = lineage && lineage[1];

				me.setContainerId(containerId);
				req.url = Service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA);

				return req;
			})
			.then(function (r) {
				Ext.Ajax.request(r);
			});
	},

	buildForAssignment: function () {
		const totalPoints = this.assignment.getTotalPointsLabel();

		this.add([
			{
				xtype: 'container',
				flex: 1,
				layout: 'none',
				cls: 'assignment-box',
				items: [
					{xtype: 'box', autoEl: {cls: 'title', cn: [
						{cls: 'label', tag: 'span', html: this.assignment.get('title')},
						{cls: 'points', tag: 'strong', html: totalPoints}
					]}},
					this.getButton()
				]
			},
			{
				xtype: 'course-assignment-status',
				assignment: this.assignment,
				onEditorOpen: this.disableButton.bind(this),
				onEditorClose: this.enableButtonIfAvailable.bind(this)
			}
		]);

		this.mon(this.assignment, 'update', this.setAsAssignment.bind(this, this.assignment));

		this.setAsAssignment(this.assignment);
	},

	disableButton: function () {
		var button = this.down('button');

		if (button) {
			button.disable();
		}
	},

	enableButtonIfAvailable: function () {
		this.isAvailable && this.enableButton();
	},

	enableButton: function () {
		var button = this.down('button');

		if (button) {
			button.enable();
		}
	},

	setAsAssignment: function (assignment) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setAsAssignment, this, arguments), this, {single: true});
			return;
		}

		this.setQuetionSetContainerTitle(assignment.get('title'));

		var status = this.down('course-assignment-status'),
			parts = assignment.get('parts') || [],
			isNoSubmit = assignment.isNoSubmit(),
			now = new Date(),
			opens = assignment.get('availableBeginning'),
			dueDate = assignment.get('availableEnding'),
			button = this.down('button'),
			titleEl = this.el.down('.assignment-box .title .label'),
			pointEl = this.el.down('.assignment-box .title .points');

		this.addCls('assignment');
		this.setAsNotStarted();

		status.enableEditing();

		if (titleEl) {
			titleEl.update(assignment.get('title'));
		}

		if (pointEl) {
			if (assignment.getTotalPointsLabel()) {
				pointEl.update(assignment.getTotalPointsLabel());
			}
			else {
				pointEl.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
			}
		}

		assignment.getHistory()
			.then(this.setHistory.bind(this));

		if (dueDate && dueDate < now) {
			//if assignment is a no-submit, don't make it late
			if (isNoSubmit) {
				this.addCls('nosubmit');
			} else {
				this.addCls('late');
			}
		} else if (opens && opens <= now) {
			if(button) {
				this.enableButton();
				button.show();

				this.isAvailable = true;
			}
		} else if (opens && opens > now) {
			if (button) {
				button.hide();
				this.disableButton();

				this.isAvailable = false;
			}

			if (status) {
				status.setStatus(getFormattedString('NextThought.view.courseware.overview.parts.QuestionSet.available', {
					date: Ext.Date.format(opens, 'l, F j, g:i a T')
				}));
			}
		} else if (parts.length === 0 && !assignment.isTimed && !isNoSubmit) {
			this.down('button').setText(getString('NextThought.view.courseware.overview.parts.QuestionSet.review'));
		}
	},


	setHistory: function (history) {
		if (!history) {
			console.warn('No history');
			return;
		}

		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setHistory, this, arguments), this, {single: true});
			return;
		}

		var status = this.down('course-assignment-status'),
			button = this.down('button'),
			submission = history.get('Submission'),
			completed = (submission && submission.get('CreatedTime')) || new Date(),
			due = this.assignment && this.assignment.get('availableEnding'),
			late = completed > due,
			isNoSubmit = this.assignment && this.assignment.isNoSubmit();

		if (status) {
			status.setHistory(history);
		}

		if (button && !isNoSubmit) {
			button.setText('Review');
		}

		if (isNoSubmit) {
			this.addCls('nosubmit');
		} else {
			this.addCls('turned-in-assignment');
			this[late ? 'addCls' : 'removeCls']('late');
		}
	},

	containerLoaded: function (q, s, r) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.containerLoaded, this, arguments), this, {single: true});
			return;
		}

		var correct = NaN, total = NaN,
			json = Ext.decode(r.responseText, true) || {};

		json = (json.Items || [])[0];
		//		console.debug('Loaded:', r.status, r.responseText);

		if (!json) {
			this.setAsNotStarted();
		}
		else {
			json = lazy.ParseUtils.parseItems(json)[0];
			correct = json.getCorrectCount();
			total = json.getTotalCount();
		}

		this.updateWithScore(correct, total);
	},

	setAsNotStarted: function () {
		const isNoSubmit = this.assignment && this.assignment.isNoSubmit();
		const b = this.down('button');

		if (b) {
			b.setUI('primary');
			b.setText(getString('NextThought.view.courseware.overview.parts.QuestionSet.start'));

			if (isNoSubmit) {
				b.setText('View');
			}
		}

		this.addCls('not-started');
	},

	updateWithScore: function (correct, total) {
		var tally = this.down('assessment-tally'),
			score = this.down('chart-score');

		if (tally) {
			tally.setTally(correct || 0, total || this.getTotal(), isNaN(correct));
			tally.setMessage(this.getQuetionSetContainerTitle());
		}

		if (score && !isNaN(correct)) {
			score.setValue(Math.floor(100 * correct / (total || this.getTotal())) || 0);
		}
		this.updateLayout();
	},

	reviewClicked: function () {
		if (this.assignment) {
			this.navigate(this.assignment);
			return;
		}

		this.navigate(PageInfo.fromOutlineNode({
			href: this.getContainerId()
		}));
	}
});
