const Ext = require('extjs');

const MultiSelect = require('./filters/MultiSelect');
const Select = require('./filters/Select');
const SingleSelect = require('./filters/SingleSelect');

module.exports = exports = Ext.define('NextThought.app.stream.components.Filter', {
	extend: 'Ext.container.Container',
	alias: 'widget.stream-filter',

	cls: 'stream-filter',
	layout: 'none',

	items: [],

	initComponent () {
		this.callParent(arguments);

		if (!this.filters.length) {
			this.hide();
		}

		this.filterMap = this.setUpFilterMap(this.filters);
	},


	bindToStream (stream) {
		this.stream = stream;

		if (this.currentState) {
			this.applyState(this.currentState);
		}
	},


	afterRender () {
		this.callParent(arguments);

		if (this.currentState) {
			this.applyState(this.currentState);
		}
	},


	setUpFilterMap (filters) {
		return filters.reduce((acc, filter) => {
			let cmp;

			if (filter.type === 'select') {
				cmp = Select;
			} else if (filter.type === 'single-select') {
				cmp = SingleSelect;
			} else if (filter.type === 'multi-select') {
				cmp = MultiSelect;
			}

			filter.typeCls = filter.cls;
			delete filter.cls;

			acc[filter.key] = cmp && this.add(cmp.create(Object.assign({onChange: this.onFilterChange.bind(this)}, filter)));

			return acc;
		}, {});
	},


	applyState (state) {
		this.currentState = state;

		if (!this.rendered) {
			return;
		}

		let filterMap = this.filterMap;
		let keys = Object.keys(filterMap);
		let isValid = true;
		let params = {
			url: state.url
		};

		for (let key of keys) {
			let cmp = key && filterMap[key];
			let stateValue = state[key];
			let param = cmp && cmp.getParamFromState(stateValue);

			if (cmp) {
				cmp.setValue(stateValue);
			}

			if (param) {
				params[key] = param;
			} else if (cmp.paramRequired) {
				isValid = false;
			}
		}

		if (this.stream && isValid) {
			this.stream.setStreamParams(params);
		} else if (this.stream) {
			this.stream.onInvalidFilters();
		}
	},


	getState () {
		let filterMap = this.filterMap;
		let keys = Object.keys(filterMap);
		let state = this.currentState;

		for (let key of keys) {
			let value = key && filterMap[key] && filterMap[key].getValue();

			if (key && value !== null) {
				state[key] = value;
			}
		}

		return state;
	},


	onFilterChange () {
		if (this.setState) {
			this.setState(this.getState());
		}
	}
});
