const Ext = require('extjs');
const {DayTimeToggle} = require('nti-web-commons');
const ParseUtils = require('../../../../../../util/Parsing');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.controls.Calendar', {
	extend: 'NextThought.ReactHarness',
	alias: 'widget.overview-editing-controls-calendar',


	constructor (config) {
		this.callParent([{...config, component: DayTimeToggle}]);
	},


	getProps () {
		const {record, disableText} = this;
		const availableBeginning = record.get('AvailableBeginning');
		const availableEnding = record.get('AvailableEnding');

		return {
			onChange: (...args) => this.onSave(...args),
			availableBeginning,
			availableEnding,
			disableText
		};
	},


	onSave (AvailableBeginning, AvailableEnding) {
		const link = this.record && this.record.getLink('edit');
		const values = {
			AvailableBeginning,
			AvailableEnding
		};

		if (values && link) {
			Service.put(link, values)
				.then((response) => {
					this.record.syncWithResponse(response);
				})
				.then(() => {
					const availableBeginning = this.record.get('AvailableBeginning');
					const availableEnding = this.record.get('AvailableEnding');
					this.setProps({
						availableBeginning,
						availableEnding
					});
				});
		}
	}
});
