export default Ext.define('NextThought.app.contentviewer.components.assignment.TimedPlaceholder', {
	extend: 'Ext.Component',
	alias: 'widget.assignment-timedplaceholder',

	cls: 'timed-placeholder',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', html: '{title}'},
		{cls: 'fake-questions', cn: [
			{cls: 'question', cn: [
				{cls: 'prompt', cn: [
					{cls: 'line'}
				]},
				{cls: 'answer-container', cn: [
					{cls: 'answers', cn: [
						{cls: 'answer'},
						{cls: 'answer'}
					]}
				]}
			]},
			{cls: 'question', cn: [
				{cls: 'prompt', cn: [
					{cls: 'line'},
					{cls: 'line'},
					{cls: 'line long'}
				]},
				{cls: 'answer-container', cn: [
					{cls: 'answers', cn: [
						{cls: 'answer'},
						{cls: 'answer'},
						{cls: 'answer'},
						{cls: 'answer'}
					]}
				]}
			]},
			{cls: 'question', cn: [
				{cls: 'prompt', cn: [
					{cls: 'line'},
					{cls: 'line'}
				]},
				{cls: 'answer-container', cn: [
					{cls: 'answers', cn: [
						{cls: 'answer'},
						{cls: 'answer'},
						{cls: 'answer'}
					]}
				]}
			]},
			{cls: 'question', cn: [
				{cls: 'prompt', cn: [
					{cls: 'line long'}
				]},
				{cls: 'answer-container', cn: [
					{cls: 'answers', cn: [
						{cls: 'answer'},
						{cls: 'answer'}
					]}
				]}
			]}
		]},
		{cls: 'nti-alert', cn: [
			{cls: 'alert-container', cn: [
				{cls: 'message-container', cn: [
					{cls: 'title', html: 'Timed Assignment'},
					{cls: 'message', cn: [
						'You have ',
						{tag: 'span', cls: 'bold', html: '{time} '},
						'to complete this Timed Assignment. ',
						{tag: 'span', cls: 'red', html: 'Once you\'ve started, the timer will not stop.'}
					]}
				]},
				{cls: 'button-body', cn: [
					{cls: 'button primary start', html: 'Start'}
				]}
			]}
		]}
	]),


	renderSelectors: {
		startEl: '.button.start'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var title = this.assignment.get('title'),
			maxTime = this.assignment.getMaxTime();

		this.renderData = Ext.apply(this.renderData || {}, {
			title: title,
			time: TimeUtils.getNaturalDuration(maxTime, 2)
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var height = Ext.Element.getViewportHeight();

		this.el.setHeight(height - 100);

		this.mon(this.startEl, 'click', 'start');
	},


	start: function() {
		this.assignment.start()
			.then(this.startAssignment.bind(this));
	}
});
