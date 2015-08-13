Ext.define('NextThought.app.course.overview.components.parts.Survey', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-surveyref',

	requires: [
		'NextThought.model.assessment.Survey',
		'NextThought.model.PageInfo'
	],

	ui: 'course',
	cls: 'overview-survey',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'meta', cn: [
			{cls: 'title', html: '{title}'},
			{tag: 'span', cls: 'question-count', html: '{questions:plural("Question")}'},
			{tag: 'span', cls: 'responses', html: 'No Responses Yet'}
		]},
		{cls: 'button x-btn x-btn-primary-large', html: 'Take'}
	]),


	renderSelectors: {
		responsesEl: '.responses',
		startEl: '.button'
	},


	constructor: function(config) {
		var n = config.node || {getAttribute: function(a) { return config[a];} },
			ntiid = n.getAttribute('ntiid');

		config.data = {
			title: n.getAttribute('label'),
			ntiid: ntiid,
			questionCount: n.getAttribute('question-count'),
			submissions: n.getAttribute('submissions')
		};


		Service.getObject(ntiid)
			.then(this.onSurveyLoaded.bind(this))
			.fail(this.onSurveyFailed.bind(this));

		this.callParent([config]);
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.data.title,
			questions: this.data.questionCount
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.startEl, 'click', this.onStart.bind(this));

		if (this.data.submissions) {
			this.responsesEl.update(Ext.util.Format.plural(this.data.submissions, 'Response'));
		}
	},


	onSurveyLoaded: function(survey) {
		if (!this.rendered) {
			this.on('afterrender', this.onSurveyLoaded.bind(this, survey));
			return;
		}

		var responses = survey.get('submissions');

		this.survey = survey;

		if (responses) {
			this.responseEl.update(Ext.util.Format.plural(responses, 'Responses'));
		}
	},


	onSurveyFailed: function(reason) {
		console.error('Failed to load Survey: ', reason);

		this.hide();
	},


	onStart: function() {
		var ntiid = this.data.ntiid;


		this.navigate(NextThought.model.PageInfo.fromOutlineNode({
			href: ntiid
		}));
	}
});
