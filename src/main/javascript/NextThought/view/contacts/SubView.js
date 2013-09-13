Ext.define('NextThought.view.contacts.SubView', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias:  'widget.contact-tab-view',

	requires: [
		'NextThought.view.contacts.Grouping',
		'NextThought.view.contacts.outline.View',
		'NextThought.view.BoundPanel'
	],

	navigation: { xtype: 'contacts-outline' },
	body:       { xtype: 'data-bound-panel' },

	ui:  'contacts',
	cls: 'contact-sub-view',

	config: {
		bodyCls:         '',
		bodyDefaultType: 'contacts-tabs-card',
		storeId:         'all-contacts-store',
		subType:         'contact',
		filterFn:        undefined,
		bodyItems:       null
	},


	constructor: function (config) {
		var type = config.subType || this.config.subType,
				store,
				filter = config.filterFn || this.config.filterFn,
				bodyItems = config.bodyItems || this.config.bodyItems || [],
				emptyText = {
					cls: 'empty-state', cn: [
						{cls: 'header', html: '{{{no_' + type + '_header}}}'},
						{cls: 'sub', html: '{{{no_' + type + '_sub}}}'}
					]
				};

		if ('contact' !== type) {
			config.bodyDefaultType = config.bodyDefaultType || 'contacts-tabs-grouping';
			config.storeId = config.storeId || 'FriendsList';
		}

		//We can't use the config's helper functions because those get created in the call to the parent...after which,
		// these applications would become alot more tricky.
		this.applyConfigs('body', {
			defaultType:        config.bodyDefaultType || this.config.bodyDefaultType,
			storeId:            config.storeId || this.config.storeId,
			defaultInsertPoint: bodyItems.length,
			items:              bodyItems,
			filter:             filter,
			ui:                 'contacts-' + type,
			cls:                (config.bodyCls || this.config.bodyCls) + ' ' + type,
			emptyCmp:           {
				xtype:     'box', emptyState: true,
				renderTpl: Ext.DomHelper.markup(emptyText)
			}
		});


		store = StoreUtils.newView(config.storeId || this.config.storeId);

		if(store.model === NextThought.model.User){
			store.on('datachanged','injectLetterDividers', this);
		}

		if( Ext.isFunction(filter) ) {
			store.filter(filter);
		}

		this.applyConfigs('navigation', {
			cls:          type,
			subType:      type,
			store:        store,
			outlineLabel: config.outlineLabel || ('All ' + Ext.String.capitalize(Ext.util.Inflector.pluralize(type)))
		});


		this.callParent(arguments);

		this.on('destroy','clearListeners',store);

		this.mon(this.navigation,'contact-row-selected','scrollIntoView');
	},


	scrollIntoView: function(rec){
		var query = Ext.String.format('[recordId="{0}"]',rec.getId()
									.replace(/:/g, '\\3a ') //no colons
									.replace(/,/g, '\\2c ')), //no commas
			cmp = this.body.down(query);

		if(cmp){
			cmp.getEl().scrollIntoView(this.body.getEl());
			cmp.getEl().highlight('88d0f9');
		}
	},


	injectLetterDividers: function(store){
		var User = NextThought.model.User,
			pluck = Ext.Array.pluck,
			letters = {}, toAdd = [];

		Ext.each(pluck(pluck(store.getRange(),'data'),'displayName'),function(v){
			v = (v||'-')[0] || '-';
			letters[v.toUpperCase()] = 1;
		});

		Ext.each(Ext.Object.getKeys(letters), function(v){
			var m = User.getUnresolved(v);
			m.set('type','unit');
			if(store.findBy(function(r){ return r.get('type')==='unit' && r.get('Username')===v; }) < 0){
				toAdd.push(m);
			}
		});

		store.suspendEvents(false);
		store.add(toAdd);
		store.resumeEvents();
	}

});
