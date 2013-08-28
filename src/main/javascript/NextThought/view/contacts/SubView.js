Ext.define('NextThought.view.contacts.SubView', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.contact-tab-view',

	navigation: { cls: 'make-white'},
	body: {
		xtype: 'data-bound-panel'
	},

	ui: 'contacts',
	cls: 'contact-sub-view',

	config:{
		   bodyCls: '',
		   bodyDefaultType: 'contacts-tabs-card',
		   storeId: 'all-contacts-store',
		   subType: 'contact',
		   filterFn: undefined,
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

		//We can't use the config's helper functions because those get created in the call to the parent...after which,
		// these applications would become alot more tricky.
		this.applyConfigs('body',{
			defaultType: config.bodyDefaultType || this.config.bodyDefaultType,
			storeId: config.storeId || this.config.storeId,
			defaultInsertPoint: bodyItems.length,
			items: bodyItems,
			filter: config.filterFn || this.config.filterFn,
			ui: 'contacts-'+type,
			cls: (config.bodyCls  || this.config.bodyCls) + ' ' + type,
			emptyCmp: {
				xtype: 'box', emptyState:true,
				renderTpl: Ext.DomHelper.markup(emptyText)
			}
		});

		this.callParent(arguments);
	}

});
