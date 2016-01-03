Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.InlineEditor', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-overviewgroup-inlineeditor',

	requires: [
		'NextThought.model.courses.overview.Group'
	],

	statics: {
		creationText: 'Create a section'
	},

	cls: 'overviewgroup-editor inline',


	renderTpl: Ext.DomHelper.markup([
		{tag: 'input', cls: 'title', placeholder: 'Section name', type: 'text', value: '{title}'},
		{cls: 'sub-label', html: 'Choose a Color'},
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

		var colors = NextThought.model.courses.overview.Group.COLOR_CHOICES,
			title = this.record ? this.record.get('title') : '',
			accent = this.record ? this.record.get('accentColor') : '';

		function isSelectedColor(hex, index) {
			if (accent) {
				return hex === accent;
			}

			return index === 0;
		}


		this.renderData = Ext.apply(this.renderData || {}, {
			colors: colors.map(function(hex, index) {
				return {
					cls: isSelectedColor(hex, index) ? 'selected' : '',
					hex: hex
				};
			}),
			title: title
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.colorsEl, 'click', this.maybeSelectColor.bind(this));
		this.mon(this.inputEl, 'keyup', this.onInputChange.bind(this));

		this.onInputChange();
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


	isEmpty: function() {
		var values = this.getValue();

		return !values.title && !values.accentColor;
	},


	onInputChange: function() {
		if (this.onChange) {
			this.onChange(this.getValue());
		}
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

		if (this.onChange) {
			this.onChange(this.getValue());
		}
	},


	getErrors: function() {
		var values = this.getValue();

		if (!values.title) {
			return {
				title: {
					missing: true
				}
			};
		}

		return {};
	},


	showErrorOn: function(name) {
		if (name === 'title') {
			this.inputEl.addCls('error');
		}
	},


	removeErrorOn: function(name) {
		this.inputEl.removeCls('error');
	},


	getErrorsFor: function(name) {
		var errors = this.getErrors();

		return errors[name];
	},


	getValue: function() {
		return {
			MimeType: NextThought.model.courses.overview.Group.mimeType,
			title: this.getTitle(),
			accentColor: this.getSelectedColor()
		};
	}
});
