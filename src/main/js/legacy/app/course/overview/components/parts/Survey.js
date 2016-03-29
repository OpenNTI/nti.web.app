var Ext = require('extjs');
var ModelSurveyRef = require('../../../../../model/SurveyRef');
var AssessmentSurvey = require('../../../../../model/assessment/Survey');
var ModelPageInfo = require('../../../../../model/PageInfo');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.Survey', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-surveyref',
	ui: 'course',
	cls: 'overview-survey',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'meta', cn: [
			{cls: 'title', html: '{title}'},
			{tag: 'span', cls: 'question-count', html: '{questions:plural("Question")}'},
			{tag: 'span', cls: 'responses', html: 'No Responses Yet'},
			{tag: 'tpl', 'if': 'hasReportLink', cn: [
				{tag: 'span', cls: 'report', html: 'View Reports'}
			]}
		]},
		{cls: 'button x-btn x-btn-primary-large', html: '{buttonTxt}'}
	]),

	renderSelectors: {
		responsesEl: '.responses',
		startEl: '.button',
		reportEl: '.report'
	},

	constructor: function (config) {
		var n = config.node || {getAttribute: function (a) { return config[a];} },
			links = n.getAttribute('Links'),
			ntiid = n.getAttribute('ntiid');

		config.data = {
			title: n.getAttribute('label'),
			ntiid: ntiid,
			questionCount: n.getAttribute('question-count'),
			submissions: n.getAttribute('submissions'),
			reportLink: Service.getLinkFrom(links, 'InquiryReport'),
			isSubmitted: Service.getLinkFrom(links, 'History'),
			isClosed: n.getAttribute('isClosed')
		};

		this.callParent([config]);
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.data.title,
			questions: this.data.questionCount,
			buttonTxt: this.data.isSubmitted ? 'Review' : this.data.isClosed ? 'Closed' : 'Take',
			hasReportLink: !!this.data.reportLink
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.startEl, 'click', this.onStart.bind(this));

		if (this.data.submissions) {
			this.responsesEl.update(Ext.util.Format.plural(this.data.submissions, 'Response'));
		}

		if (this.data.isSubmitted) {
			this.startEl.update('Review');
		}

		if (this.reportEl) {
			this.mon(this.reportEl, 'click', this.showReport.bind(this));
		}
	},

	onStart: function (e) {
		var ntiid = this.data.ntiid;

		if (!e.getTarget('.closed')) {
			this.navigate(NextThought.model.PageInfo.fromOutlineNode({
				href: ntiid
			}));
		}
	},

	showReport: function (e) {
		var win = Ext.widget('iframe-window', {
			width: 'max',
			saveText: getString('NextThought.view.menus.Reports.savetext'),
			link: this.data.reportLink,
			loadingText: getString('NextThought.view.menus.Reports.loadingtext')
		});

		win.show();
	}
});
