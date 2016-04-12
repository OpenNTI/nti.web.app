const Ext = require('extjs');
const Select = require('legacy/common/form/fields/select');

module.exports = exports = Ext.define('NextThought.app.stream.components.filters.Select', {
	extend: 'Ext.Component',
	alias: 'widget.stream-filter-select',

	cls: 'group',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'name', html: '{name}'}
	]),

	initComponent () {
		this.callParent(arguments);

		if (this.typeCls) {
			this.addCls(this.typeCls);
		}


		this.valueMap = this.items.reduce((acc, item) => {
			if (item.stateValue) {
				acc[item.stateValue] = item.value;
			}

			return acc;
		}, {});
	},


	beforeRender () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.displayText
		});
	},


	afterRender () {
		this.callParent(arguments);

		this.setUpInputs();
	},


	setUpInputs () {
		this.selectCmp = Select.create({
			renderTo: this.el,
			options: this.items.map((item) => {
				return {
					displayText: item.displayText,
					value: item.stateValue || item.state
				};
			}),
			onChange: this.onInputChange.bind(this)
		});

		this.on('destroy', () => { this.selectCmp.destroy(); });
	},


	onInputChange () {
		if (this.onChange) {
			this.onChange();
		}
	},


	setValue (value) {
		this.selectCmp.selectValue(value);
	},


	getValue () {
		let value = this.selectCmp.getSelectedValue();

		return value;
	},


	getParamValue (value) {
		return this.valueMap.hasOwnProperty(value) ? this.valueMap[value] : value;
	},


	getParamFromState (state) {
		return this.getParamValue(state);
	}
});
