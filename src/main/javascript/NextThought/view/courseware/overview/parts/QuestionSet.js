Ext.define('NextThought.view.courseware.overview.parts.QuestionSet', {
	extend: 'Ext.Panel',
	alias: [
		'widget.course-overview-naquestionset',
		'widget.course-overview-nanosubmitassignment',
		'widget.course-overview-naassignment',
		'widget.course-overview-assignment'
	],

	requires: [
		'NextThought.view.assessment.Score',
		'NextThought.view.assessment.ScoreboardHeader',
		'NextThought.view.assessment.ScoreboardTally'
	],

	statics: {
		isAssessmentWidget: true
	},

	header: false,

	cls: 'scoreboard overview-naquestionset',
	ui: 'assessment',

	layout: {
		type: 'hbox',
		align: 'middle'
	},


	items: [
		{ xtype: 'assessment-score' },
		{ xtype: 'assessment-tally', flex: 1 },
		{ xtype: 'button',
			text: getString('NextThought.view.courseware.overview.parts.QuestionSet.review'),
			ui: 'secondary',
			scale: 'large',
			handler: function(b) {b.up('course-overview-naquestionset').reviewClicked();}
		}
	],


	config: {
		assignment: null,
		containerId: null,
		ntiid: null,
		total: 0,
		quetionSetContainerTitle: ''
	},

	constructor: function(config) {
		var n = config.node || {getAttribute: function(a) { return config[a];} },
			ntiid = n.getAttribute('target-ntiid') || 'no-value',
			containerId = ContentUtils.getLineage(ntiid)[1],
			req;

		config = Ext.apply(config, {
			quetionSetContainerTitle: n.getAttribute('label'),
			ntiid: ntiid,
			questionSetId: ntiid,
			containerId: containerId,
			total: n.getAttribute('question-count') || 0
		});

		delete config.title;

		this.callParent([config]);

		if (config.xtype !== 'course-overview-assignment') {
			req = {
				url: Service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA),
				scope: this,
				method: 'GET',
				params: {
					accept: NextThought.model.assessment.AssessedQuestionSet.mimeType,
					batchStart: 0,
					batchSize: 1,
					sortOn: 'lastModified',
					sortOrder: 'descending',
					filter: 'TopLevel'
				},
				callback: this.containerLoaded
			};

			Ext.Ajax.request(req);
		} else {
			if (this.assignment) {
				this.setAsAssignment(this.assignment);
				this.assignmentId = this.assignment.getId();
				this.fireEvent('has-been-submitted', this);
			} else {
				console.warn('Hidding Assignment widget. Assignmet was null. %o', config);
				this.hide();
			}
		}
	},


	setAsAssignment: function(assignment) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setAsAssignment, this, arguments), this, {single: true});
			return;
		}

		this.setQuetionSetContainerTitle(assignment.get('title'));

		var parts = assignment.get('parts') || [],
			//added to determine whether or not assignment is a no-submit
			isNoSubmit = assignment.isNoSubmit(),
			score = this.down('assessment-score'),
			tally = this.down('assessment-tally'),
			format = 'l, F j, g:i a T',
			opens = assignment.get('availableBeginning'),
			date = assignment.get('availableEnding'),
			day = date && (new Date(date.getTime())).setHours(0, 0, 0, 0),
			today = (new Date()).setHours(0, 0, 0, 0),
			html = date && (getString('NextThought.view.courseware.overview.parts.QuestionSet.due') + ' ');

		if (date) {
			if (day === today) {
				html += getString('NextThought.view.courseware.overview.parts.QuestionSet.today');
			}
			else {
				html += Ext.Date.format(date, format);
			}
		}

		if (score) { score.destroy(); }

		this.addCls('assignment');
		this.setAsNotStarted();
		this.updateWithScore();
		tally.setGreyText(html || '');

		if (date && date < today) {
			//if assignment is a no-submit, don't make it late
			if (isNoSubmit === true) {
					this.addCls('nosubmit');
					tally.setGreyText(html);
			}
			else {
				this.addCls('late');
				tally.setRedText(html);
			}

		}
		else if (opens && opens > new Date()) {
			this.down('button').destroy();
			tally.setGreyText(getFormattedString('NextThought.view.courseware.overview.parts.QuestionSet.available', {
				date: Ext.Date.format(opens, format)
			}));
		}
		else if (parts.length === 0 && !this.assignment.isTimed) {
			this.down('button').setText(getString('NextThought.view.courseware.overview.parts.QuestionSet.review'));
		}
	},


	setAsNotStarted: function() {
		var b = this.down('button');
		b.setUI('primary');
		b.setText(getString('NextThought.view.courseware.overview.parts.QuestionSet.start'));
		this.addCls('not-started');
	},


	containerLoaded: function(q, s, r) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.containerLoaded, this, arguments), this, {single: true});
			return;
		}

		var correct = NaN,
			json = Ext.decode(r.responseText, true) || {};

		json = (json.Items || [])[0];
    //		console.debug('Loaded:', r.status, r.responseText);

		if (!json) {
			this.setAsNotStarted();
		}
		else {
			json = ParseUtils.parseItems(json)[0];
			correct = json.getCorrectCount();
		}

		this.updateWithScore(correct);
	},


	fillInAssessmentAttempt: function(questionSet) {
		if (!questionSet || questionSet.get('questionSetId') !== this.ntiid) { return; }

		var b = this.down('button');

		b.setUI('secondary');
		b.setText(getString('NextThought.view.courseware.overview.parts.QuestionSet.review'));
		this.removeCls('not-started');

		this.updateWithScore(questionSet.getCorrectCount());
	},


	setHistory: function(history) {
		if (!history) {
			console.warn('No history');
			return;
		}

		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setHistory, this, arguments), this, {single: true});
			return;
		}

		var submission = history.get('Submission'),
			completed = (submission && submission.get('CreatedTime')) || new Date(),
			due = this.assignment && this.assignment.get('availableEnding'),
			isNoSubmit = this.assignment && this.assignment.isNoSubmit();

		this.markAssignmentTurnedIn(completed, completed > due, isNoSubmit);
	},


	markAssignmentTurnedIn: function(completed, late, noSubmit) {
		var button = this.down('button'),
			tally = this.down('assessment-tally');

		if (button) {
			button.setText('Review');
		}

		if (noSubmit === true) {
			this.addCls('nosubmit');
		} else {
			this.addCls('turned-in-assignment');
			this[late ? 'addCls' : 'removeCls']('late');
			tally[late ? 'setRedText' : 'setGreyText'](getFormattedString('NextThought.view.courseware.overview.parts.QuestionSet.completed', {
				date: Ext.Date.format(completed, 'l, F j g:i a T')
			}));
		}
	},


	updateWithScore: function(correct) {
		var tally = this.down('assessment-tally'),
			score = this.down('assessment-score');

		tally.setTally(correct || 0, this.getTotal(), isNaN(correct));
		tally.message.update(this.getQuetionSetContainerTitle());

		if (score) {
			score.setValue(Math.floor(100 * correct / this.getTotal()) || 0);
		}
		this.updateLayout();
	},


	reviewClicked: function() {
		var container = this.up('content-view-container'),
			bundle = container && container.currentBundle;

		//console.log('navigate to', this.getContainerId());
		if (this.assignment) {
			this.fireEvent('navigate-to-assignment', this.assignmentId);
			return;
		}
		this.fireEvent('set-location-rooted', this.getContainerId(), null, null, bundle);
		//this.fireEvent('navigate-to-href', this, this.getContainerId());
	}
});
