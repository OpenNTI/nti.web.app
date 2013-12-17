Ext.define('NextThought.view.courseware.overview.parts.QuestionSet', {
	extend: 'Ext.Panel',
	alias: [
		'widget.course-overview-naquestionset'
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

		config = {
			quetionSetContainerTitle: n.getAttribute('label'),
			ntiid: ntiid,
			questionSetId: ntiid,
			containerId: containerId,
			total: n.getAttribute('question-count') || 10
		};

		this.callParent([config]);


		req = {
			url: $AppConfig.service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA),
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

		this.fireEvent('has-been-submitted', this);
	},

	containerLoaded: function(q, s, r) {
		if(this.alreadyTurnedIn){ return; }

		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.containerLoaded, this, arguments), this, {single: true});
			return;
		}

		var correct = NaN, b,
			json = Ext.decode(r.responseText, true) || {};

		json = (json.Items || [])[0];
    //		console.debug('Loaded:', r.status, r.responseText);

		if (!json) {
			b = this.down('button');
			b.setUI('primary');
			b.setText('Start');
			this.addCls('not-started');
		}
		else {
			json = ParseUtils.parseItems(json)[0];
			correct = json.getCorrectCount();
		}

		this.updateWithScore(correct);
	},

	updateWithScore: function(correct) {
		var tally = this.down('assessment-tally');
		tally.setTally(correct || 0, this.getTotal(), isNaN(correct));
		tally.message.update(this.getQuetionSetContainerTitle());
		this.down('assessment-score').setValue(Math.floor(100 * correct / this.getTotal()) || 0);
		this.updateLayout();
	},


	showAsTurnedInAssignment: function(){
		if(!this.rendered){
			this.on('afterrender', Ext.bind(this.showAsTurnedInAssignment, this, arguments), this, {single: true});
			return;
		}

		var score = this.down('assessment-score'),
			tally = this.down('assessment-tally'),
			button = this.down('button');

		if (score) { score.destroy(); }

		if (button) {
			button.setUI('primary');
			button.setText('Review');
		}
		
		if (tally) { 
			tally.setTally(0, this.getTotal(), true);
			tally.message.update(this.getQuetionSetContainerTitle());
		}
	},


	markAsTurnedInAssignment: function(){		
		this.alreadyTurnedIn = true;

		this.addCls('turned-in-assignment');

		this.showAsTurnedInAssignment();
	},


	reviewClicked: function() {
		//console.log('navigate to', this.getContainerId());
		this.fireEvent('navigate-to-href', this, this.getContainerId());
	}
});
