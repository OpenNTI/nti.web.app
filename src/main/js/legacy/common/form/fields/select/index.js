const Ext = require('@nti/extjs');

module.exports = exports = Ext.define('NextThought.common.form.fields.Select', {
	extend: 'Ext.Component',
	alias: 'widget.form-fields-select',

	cls: 'nt-select',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'label', cn: [
			{tag: 'label', html: '{label}'}
		]},
		{tag: 'span', cls: 'active', html: '{active}'},
		{tag: 'select', name: '{name}', cn: [
			{tag: 'tpl', 'for': 'options', cn: [
				{tag: 'option', 'data-value': '{value}', value: '{value}', html: '{displayText}'}
			]}
		]}
	]),


	renderSelectors: {
		activeEl: '.active',
		selectEl: 'select'
	},


	beforeRender () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.name || 'select-' + this.id,
			label: this.label,
			options: this.options
		});
	},


	afterRender () {
		this.callParent(arguments);

		this.mon(this.selectEl, 'change', (...args) => this.onSelectChange(...args));

		this.onSelectChange();
	},


	getSelectedValue () {
		return this.selectEl && this.selectEl.dom && this.selectEl.dom.value;
	},


	getSelectedOption () {
		return this.getOptionFor(this.getSelectedValue());
	},


	getOptionFor (value) {
		return value && this.selectEl && this.selectEl.dom && this.selectEl.dom.querySelector(`option[value=${value}]`);
	},


	onSelectChange (e) {
		let selectedOption = this.getSelectedOption();
		let selectedText = selectedOption && (selectedOption.innerHTML || selectedOption.textContent);

		if (selectedText) {
			this.activeEl.update(selectedText);
		}

		if (this.onChange && e) {
			this.onChange(e);
		}
	},


	selectValue (value) {
		let option = this.getOptionFor(value);

		if (option) {
			option.selected = true;
		}

		this.onSelectChange();
	}
});
