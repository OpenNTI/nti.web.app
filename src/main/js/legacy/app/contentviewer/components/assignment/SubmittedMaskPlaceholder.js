const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.app.contentviewer.components.assignment.MaskedPlaceholder', {
	extend: 'Ext.Component',
	alias: 'widget.assignment-submitted-masked-placeholder',

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
					{cls: 'title', html: 'You\'re all set!'},
					{cls: 'message', cn: [
						'Your answers have been submitted.',
					]}
				]}
			]}
		]}
	]),


	renderSelectors: {
		startEl: '.button.start'
	},


	beforeRender: function () {
		this.callParent(arguments);

		var title = this.assignment.get('title'),
			start = this.assignment.get('availableBeginning');

		start = start && Ext.Date.format(start, '\\a\\t g:ia \\o\\n F j, Y');

		this.renderData = Ext.apply(this.renderData || {}, {
			title: title,
			start: start
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		var height = Ext.Element.getViewportHeight();

		this.el.setHeight(height - 100);
	}
});
