const Ext = require('extjs');
const {DateTimeField} = require('@nti/web-commons');
require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.common.form.fields.DateTimeComponent', {
	extend: 'NextThought.ReactHarness',
	alias: 'widget.date-time-component',

	cls: 'date-time-field',

	constructor (config) {
		this.callParent([{...config, component: DateTimeField}]);
	},

	selectDate (value) {
		this.setProps({
			value
		});
	},

	showDateError (error) {
		this.setProps({
			error
		});
	},

	disable () {
		this.setProps({
			disabled: true
		});
	},

	enable () {
		this.setProps({
			disabled: false
		});
	}
});
