Ext.define('NextThought.view.course.overview.parts.QuestionSet',{
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
		{ xtype:'assessment-score' },
		{ xtype: 'assessment-tally', flex: 1 },
		{ xtype: 'button',
			text: 'Review',
			ui: 'secondary',
			scale: 'large',
			handler: function(b){b.up('course-overview-naquestionset').reviewClicked();}
		}
	],


	config: {
		containerId: null,
		ntiid: null,
		total: 0,
		quetionSetContainerTitle: ''
	},

	constructor: function(config){
		var n = config.node,
			ntiid = n.getAttribute('target-ntiid') || 'no-value',
			containerId = ContentUtils.getLineage(ntiid)[1],
			req;

		config = {
			quetionSetContainerTitle: n.getAttribute('label'),
			ntiid: ntiid,
			containerId: containerId,
			total: n.getAttribute('question-count') || 10
		};

		this.callParent([config]);


		req = {
			url: $AppConfig.service.getContainerUrl(containerId,Globals.USER_GENERATED_DATA),
			scope: this,
			method: 'GET',
			params: {
				accept: NextThought.model.assessment.AssessedQuestionSet.mimeType,
				batchStart:0,
				batchSize:1,
				sortOn: 'lastModified',
				sortOrder: 'descending',
				filter:'TopLevel'
			},
			callback: this.containerLoaded
		};

		Ext.Ajax.request(req);
	},

	containerLoaded: function(q,s,r){
		var correct = NaN, b,
			json = Ext.decode(r.responseText,true) || {};

		json = (json.Items || [])[0];
//		console.debug('Loaded:', r.status, r.responseText);

		if(!json){
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

	updateWithScore: function(correct){
		var tally = this.down('assessment-tally');
		tally.setTally(correct||0,this.getTotal(),isNaN(correct));
		tally.message.update(this.getQuetionSetContainerTitle());
		this.down('assessment-score').setValue(Math.floor(100*correct/this.getTotal())||0);
		this.updateLayout();
	},

	reviewClicked: function(){
		console.log('navigate to', this.getContainerId());
		this.fireEvent('navigate-to-href', this, this.getContainerId());
	}
});
