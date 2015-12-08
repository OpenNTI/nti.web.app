Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.InlineEditor', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-overviewgroup-inlineeditor',

	requires: [
		'NextThought.model.courses.overview.Group'
	],


	cls: 'overviewgroup-editor inline',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'label', html: 'Create A Group'},
		{tag: 'input', cls: 'title', placeholder: 'Title', type: 'text'},
		{cls: 'sub-label', html: 'Pick a Color'},
		{tag: 'ul', cls: 'colors', cn: [
			{tag: 'tpl', 'for': 'colors', cn: [
				{tag: 'li', cls: 'color {cls}', 'data-value': '{hex}', style: {background: '#{hex}'}}
			]}
		]}
	]),


	renderSelectors: {
		inputEl: '.title',
		colorsEl: '.colors'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var colors = NextThought.model.courses.overview.Group.COLOR_CHOICES;

		this.renderData = Ext.apply(this.renderData || {}, {
			colors: colors.map(function(hex, index) {
				return {
					cls: index === 0 ? 'selected' : '',
					hex: hex
				};
			})
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.colorsEl, 'click', this.maybeSelectColor.bind(this));
	},


	getSelectedColorEl: function() {
		return this.colorsEl && this.colorsEl.dom && this.colorsEl.dom.querySelector('.color.selected');
	},


	getSelectedColor: function() {
		var selectedEl = this.getSelectedColorEl();

		return selectedEl && selectedEl.getAttribute('data-value');
	},


	getTitle: function() {
		return this.inputEl && this.inputEl.getValue();
	},


	maybeSelectColor: function(e) {
		var color = e.getTarget('[data-value]'),
			current = this.getSelectedColorEl();

		if (color) {
			if (current) {
				current.classList.remove('selected');
			}
			color.classList.add('selected');
		}

	},


	getValue: function() {
		return {
			MimeType: NextThought.model.courses.overview.Group.mimeType,
			title: this.getTitle(),
			accentColor: this.getSelectedColor()
		};
	}
});
