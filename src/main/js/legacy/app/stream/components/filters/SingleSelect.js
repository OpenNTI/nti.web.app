const Ext = require('@nti/extjs');

require('./MultiSelect');

module.exports = exports = Ext.define('NextThought.app.stream.components.filters.SingleSelect', {
	extend: 'NextThought.app.stream.components.filters.MultiSelect',
	alias: 'widget.stream-filter-single-select',

	cls: 'group single-select',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'name', html: '{name}'},
		{tag: 'ul', cn: [
			{tag: 'tpl', 'for': 'options', cn: [
				{tag: 'li', cn: [
					{
						tag: 'input',
						'type': 'radio',
						id: '{parent.id}-{index}',
						name: 'filter-single-select-{parent.id}',
						'value': '{value}'
					},
					{
						tag: 'label',
						'for': '{parent.id}-{index}',
						html: '{displayText}'
					}
				]}
			]}
		]}
	]),


	renderSelectors: {
		listEl: 'ul'
	},


	getInputs () {
		return this.el && this.el.dom && this.el.dom.querySelectorAll('input[type=radio]');
	},


	__getSelectedValue () {
		let input = this.el.dom.querySelector('input[type=radio]:checked');

		return input ? input.getAttribute('value') : null;
	},


	getValue () {
		let value = this.__getSelectedValue();

		return value;
	},


	getParamFromState (state) {
		return this.getParamValue(state);
	}
});
