Ext.define('NextThought.view.contacts.SubView', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.contact-tab-view',

	requires: [
		'NextThought.view.contacts.outline.View'
	],

	navigation: { xtype: 'contacts-outline' },
	body: { xtype: 'data-bound-panel' },

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

		if('contact'!==type) {
			config.bodyDefaultType = config.bodyDefaultType||'contacts-tabs-grouping';
			config.storeId = config.storeId||'FriendsList';
		}

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

		this.applyConfigs('navigation',{
			store: config.storeId || this.config.storeId,
			outlineLabel: config.outlineLabel || ('All '+Ext.String.capitalize(Ext.util.Inflector.pluralize(type)))
		});

		this.callParent(arguments);
	}

});
