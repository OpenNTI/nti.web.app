const Ext = require('@nti/extjs');

require('./Select');

module.exports = exports = Ext.define('NextThought.app.stream.components.filters.MultiSelect', {
	extend: 'NextThought.app.stream.components.filters.Select',
	alias: 'widget.stream-filter-multiselect',

	cls: 'group multi-select',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'name', html: '{name}'},
		{tag: 'ul', cn: [
			{tag: 'tpl', 'for': 'options', cn: [
				{tag: 'li', cls: 'nti-checkbox native', cn: [
					{
						tag: 'label',
						'for': '{parent.id}-{index}',
						cn: [
							{
								tag: 'input',
								'type': 'checkbox',
								id: '{parent.id}-{index}',
								name: 'filter-multi-select-{index}',
								'value': '{value}'
							},
							{
								tag: 'span',
								cls: 'label',
								html: '{displayText}'
							}
						]
					}
				]}
			]}
		]}
	]),


	beforeRender () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.displayText,
			options: this.items.map((item, index) => {
				return {
					displayText: item.displayText,
					value: item.stateValue || item.value,
					index: index
				};
			})
		});
	},


	getInputs () {
		return this.el && this.el.dom && this.el.dom.querySelectorAll('input[type=checkbox]');
	},


	setUpInputs () {
		let inputs = this.getInputs();

		this.onInputChange = this.onInputChange.bind(this);

		for (let input of inputs) {
			if (input) {
				input.addEventListener('change', this.onInputChange);
			}
		}

		this.on('destroy', () => {
			for (let input of inputs) {
				if (input && input.removeEventListener) {
					input.removeEventListener('change', this.onInputChange);
				}
			}
		});
	},


	setValue (value) {
		if (!Array.isArray(value)) {
			value = [value];
		}

		let inputs = this.getInputs();

		for (let input of  inputs) {
			if (input) {
				input.checked = value[0] === 'all' || value.indexOf(input.value) >= 0;
			}
		}
	},


	getValue () {
		let inputs = this.getInputs();
		let values = [];
		let notAll = false;

		for (let input of inputs) {
			let checked = input && input.checked;
			let value = checked ? input.getAttribute('value') : null;

			if (value) {
				values.push(value);
			} else  {
				notAll = true;
			}
		}

		return notAll ? values : 'all';
	},


	getParamFromState (state) {
		if (state === 'all') {
			return this.allParam;
		}

		if (!Array.isArray(state)) {
			state = [state];
		}

		if (!state.length) {
			return null;
		}

		return state.map((s) => this.getParamValue(s));
	}
});
