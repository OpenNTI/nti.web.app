var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.contentviewer.components.assignment.NotStartedPlaceholder', {
	extend: 'Ext.Component',
	alias: 'widget.assignment-notstarted-placeholder',

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
					{cls: 'title', html: 'Assignment Not Available'},
					{cls: 'message', cn: [
						'{title} is not available yet.',
						{tag: 'tpl', 'if': 'start', cn: [
							' It will be available {start}.'
						]}
					]}
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
			start = this.assignment.get('availableBeginning');

		start = start && Ext.Date.format(start, '\\a\\t g:ia \\o\\n F j, Y');

		this.renderData = Ext.apply(this.renderData || {}, {
			title: title,
			start: start
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var height = Ext.Element.getViewportHeight();

		this.el.setHeight(height - 100);
	}
});
