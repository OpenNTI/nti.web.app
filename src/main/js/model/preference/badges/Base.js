export default Ext.define('NextThought.model.preference.badges.Base', {
	extend: 'NextThought.model.preference.Base',

	getResourceUrl: function() {
		return this.callParent(arguments) + '/Badges';
	}
});
