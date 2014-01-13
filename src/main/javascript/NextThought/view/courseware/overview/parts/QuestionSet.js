Ext.define('NextThought.view.courseware.overview.parts.QuestionSet', {
	extend: 'Ext.Panel',
	alias: [
		'widget.course-overview-naquestionset',
		'widget.course-overview-assignment'
	],

	requires: [
		'NextThought.view.assessment.Score',
		'NextThought.view.assessment.ScoreboardHeader',
		'NextThought.view.assessment.ScoreboardTally'
	],

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
			text: 'Review',
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
		var n = config.node,
			ntiid = n.getAttribute('target-ntiid') || 'no-value',
			containerId = ContentUtils.getLineage(ntiid)[1],
			req;

		config = Ext.apply(config, {
			quetionSetContainerTitle: n.getAttribute('label'),
			ntiid: ntiid,
			questionSetId: ntiid,
			containerId: containerId,
			total: n.getAttribute('question-count') || 10
		});

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
		} else if (this.assignment) {
			this.assignmentId = this.assignment.getId();
			this.setAsAssignment(this.assignment);
			this.fireEvent('has-been-submitted', this);
		} else {
			this.hide();
		}
	},


	setAsAssignment: function(assignment) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.setAsAssignment, this, arguments), this, {single: true});
			return;
		}

		this.setQuetionSetContainerTitle(assignment.get('title'));

		var score = this.down('assessment-score'),
			tally = this.down('assessment-tally'),
			format = 'l, F j',
			date = assignment.get('availableEnding'),
			day = (new Date(date.getTime())).setHours(0, 0, 0, 0),
			today = (new Date()).setHours(0, 0, 0, 0),
			html = 'Due ';

		if (day === today) {
			html += 'Today';
		} else {
			html += Ext.Date.format(date, format);
		}

		if (score) { score.destroy(); }

		this.addCls('assignment');
		this.setAsNotStarted();
		this.updateWithScore();
		tally.setGreyText(html);

		if (assignment.get('availableBeginning') > new Date()) {
			this.down('button').destroy();
		}
	},


	setAsNotStarted: function() {
		var b = this.down('button');
		b.setUI('primary');
		b.setText('Start');
		this.addCls('not-started');
	},


	containerLoaded: function(q, s, r) {
		if (this.alreadyTurnedIn) { return; }

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


	setHistory: function(history) {
		if (!history) {
			console.warn('No history');
			return;
		}

		var submission = history.get('Submission'),
			completed = (submission && submission.get('CreatedTime')) || new Date(),
			due = this.assignment && this.assignment.get('availableEnding');

		this.markAssignmentTurnedIn(completed, completed > due);
	},


	markAssignmentTurnedIn: function(completed, late) {
		var button = this.down('button'),
			tally = this.down('assessment-tally');

		if (button) { button.setText('Review'); }

		this.addCls('turned-in-assignment');
		if (late) {
			this.addCls('late');
		}
		tally[late ? 'setRedText' : 'setGreyText']('Completed ' + Ext.Date.format(completed, 'l, F j'));
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
		//console.log('navigate to', this.getContainerId());
		if (this.assignment) {
			this.fireEvent('navigate-to-assignment', this.assignmentId);
			return;
		}
		this.fireEvent('navigate-to-href', this, this.getContainerId());
	}
});
