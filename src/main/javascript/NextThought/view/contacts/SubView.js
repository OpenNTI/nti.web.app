Ext.define('NextThought.view.contacts.SubView', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.contact-tab-view',

	navigation: { cls: 'make-white'},
	body: {
		xtype: 'data-bound-panel'
	},


	config:{
		   bodyDefaultType: 'contacts-tabs-card',
		   storeId: 'all-contacts-store',
		   subType: 'contact',
		   bodyItems: null
	},


	constructor: function(config){
		var type = config.subType || this.config.subType,
			bodyItems = config.bodyItems || this.config.bodyItems || [],
			emptyText = {
				cls: 'contacts-empty-state', cn: [
					{cls: 'header', html: '{{{no_'+type+'_header}}}'},
					{cls: 'sub', html: '{{{no_'+type+'_sub}}}'}
				]
			};

		this.applyConfigs('body',{
			defaultType: config.bodyDefaultType || this.config.bodyDefaultType,
			storeId: config.storeId || this.config.storeId,
			defaultInsertPoint: bodyItems.length,
			items: bodyItems,
			emptyCmp: {
				xtype: 'box', emptyState:true,
				renderTpl: Ext.DomHelper.markup(emptyText)
			}
		});

		this.callParent(arguments);
	}

});
