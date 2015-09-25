export default Ext.define('NextThought.app.library.communities.components.Page', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-view-community-page',

	requires: ['NextThought.app.library.communities.components.Collection'],

	layout: 'none',
	storeModel: 'NextThought.model.Community',


	initComponent: function() {
		this.callParent();

		this.setItems(this.communities);
	},


	setItems: function(items) {
		this.removeAll(true);

		if (items && items.length) {
			this.add({
				xtype: 'library-communities-collection',
				store: this.buildStore(items),
				navigate: this.navigate && this.navigate.bind(this)
			});
		}
	},


	buildStore: function(items) {
		return new Ext.data.Store({
			model: this.storeModel,
			data: items,
			sorters: [{
				property: 'displayName'
			}]
		});
	}
});
