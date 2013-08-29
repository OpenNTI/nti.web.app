/**
 * This class implements the model event domain. All classes extending from {@link NextThought.model.Base} are included
 * in this domain.
 *
 * @protected
 */
Ext.define('NextThought.app.domain.Model', {
	extend:    'Ext.app.EventDomain',
	singleton: true,

	requires: [
		'NextThought.model.Base'
	],

	type: 'model',

	constructor: function () {
		this.callParent();
		this.monitor(NextThought.model.Base);
	},

	match: function (target, selector) {
		return target.is(selector);
	}
});
