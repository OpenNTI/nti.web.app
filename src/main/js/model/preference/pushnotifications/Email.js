export default Ext.define('NextThought.model.preference.pushnotifications.Email', {
	extend: 'NextThought.model.preference.pushnotifications.Base',

	fields: [
		{name: 'email_a_summary_of_interesting_changes', type: 'bool'}
	],


	getResourceUrl: function() {
		return this.callParent(arguments) + '/Email';
	}
});
