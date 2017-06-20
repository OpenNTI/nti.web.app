const Ext = require('extjs');

const OverviewGroup = require('legacy/model/courses/overview/Group');
const Color = require('legacy/util/Color');

const EditingActions = require('../../Actions');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.InlineEditor', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-overviewgroup-inlineeditor',

	statics: {
		creationText: 'Create a section'
	},

	cls: 'overviewgroup-editor inline',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'input', cls: 'title', placeholder: 'Section name', type: 'text', value: '{title}', maxlength: '{maxLength}'},
		{cls: 'sub-label', html: 'Choose a Color'},
		{tag: 'tpl', 'if': 'advanced', cn: [
			{tag: 'label', cn: [
				'#',
				{tag: 'input', cls: 'color-input', placeholder: 'Enter a Hex Code', value: '{currentColor}'}
			]}
		]},
		{tag: 'ul', cls: 'colors', cn: [
			{tag: 'tpl', 'for': 'colors', cn: [
				{tag: 'li', cls: 'color {cls}', 'data-value': '{hex}', style: {background: '#{hex}'}}
			]}
		]}
	]),

	renderSelectors: {
		inputEl: '.title',
		colorsEl: '.colors',
		colorInput: '.color-input'
	},

	beforeRender: function () {
		this.callParent(arguments);

		var colors = OverviewGroup.COLOR_CHOICES,
			title = this.record ? this.record.get('title') : '',
			accent = this.record ? this.record.get('accentColor') : '';

		function isSelectedColor (hex, index) {
			if (accent) {
				return hex === accent;
			}

			return index === 0;
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			colors: colors.map(function (hex, index) {
				return {
					cls: isSelectedColor(hex, index) ? 'selected' : '',
					hex: hex
				};
			}),
			currentColor: accent || colors[0],
			advanced: Service.canDoAdvancedEditing(),
			title: title,
			maxLength: EditingActions.MAX_TITLE_LENGTH
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.colorsEl, 'click', this.maybeSelectColor.bind(this));
		this.mon(this.inputEl, 'keyup', this.onInputChange.bind(this));

		if (this.colorInput) {
			this.mon(this.colorInput, 'keyup', this.onInputChange.bind(this));
		}

		this.onInputChange();
	},

	getSelectedColorEl: function () {
		return this.colorsEl && this.colorsEl.dom && this.colorsEl.dom.querySelector('.color.selected');
	},

	getSelectedColor: function () {
		var selectedEl = this.getSelectedColorEl(),
			recordColor = this.record && this.record.get('accentColor'),
			value;

		if (this.colorInput) {
			value = this.colorInput && this.colorInput.dom.value;
			value = value.replace('#', '');
		} else if (selectedEl) {
			value = selectedEl.getAttribute('data-value');
		} else if (recordColor) {
			value = recordColor;
		}

		return value;
	},

	getTitle: function () {
		return this.inputEl && this.inputEl.getValue();
	},

	isEmpty: function () {
		var values = this.getValue();

		return !values.title && !values.accentColor;
	},

	onInputChange: function () {
		if (this.onChange) {
			this.onChange(this.getValue());
		}
	},

	maybeSelectColor: function (e) {
		var color = e.getTarget('[data-value]'),
			value = color && color.getAttribute('data-value'),
			current = this.getSelectedColorEl();

		if (color) {
			if (current) {
				current.classList.remove('selected');
			}

			color.classList.add('selected');

			if (this.colorInput) {
				this.colorInput.dom.value = value;
			}
		}

		if (this.onChange) {
			this.onChange(this.getValue());
		}
	},

	getErrors: function () {
		var values = this.getValue(),
			errors = {};

		if (!values.title || !values.title.trim().length) {
			errors.title = {
				missing: true
			};
		}

		if (!values.accentColor) {
			errors.color = {
				missing: true
			};
		}

		if (!Color.isValidHexColor(values.accentColor)) {
			errors.color = {
				invalidColor: true
			};
		}

		return errors;
	},

	showErrorOn: function (name) {
		if (name === 'title') {
			this.inputEl.addCls('error');
		}
	},

	removeErrorOn: function (name) {
		this.inputEl.removeCls('error');
	},

	getErrorsFor: function (name) {
		var errors = this.getErrors();

		return errors[name];
	},

	getValue: function () {
		return {
			MimeType: OverviewGroup.mimeType,
			title: this.getTitle(),
			accentColor: this.getSelectedColor()
		};
	}
});
