Ext.define('NextThought.view.account.history.Panel', {
	extend: 'Ext.view.View',
	alias: ['widget.user-panel-note', 'widget.user-panel'],

	requires: [
		'NextThought.model.events.Bus',
		'NextThought.store.PageItem',
		'NextThought.util.Time',
		'NextThought.model.converters.GroupByTime'
	],


	storeId: 'noteHighlightStore',
	filter: 'MeOnly',
	grouping: 'GroupingField',

	cls: 'user-data-panel',
	autoScroll: true,

	emptyText: Ext.DomHelper.markup([{
		cls:"history nothing",
		html: 'No Items'
	}]),


	itemSelector:'.history',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag:'tpl', 'for':'.', cn:[
			{
				cls: 'history {FavoriteGroupingField:lowercase}',
				cn:[
					{cls: 'path', html:'{path}'},
					{cls: 'location', html:'{location}'},
					{cls: 'body', cn:[
						{tag: 'span', html: '{textBodyContent}'}
					]}
				]
			}]
		}
		//			{tag:'tpl', 'if':'label', cn:[{
		//				cls: 'divider', cn:[{tag:'span', html:'{label}'}]
		//			}]}
	])),

	initComponent: function(){
		this.callParent(arguments);
		this.buildStore();
	},


	getMimeTypes: function(){
		this.mimeTypes = [];
		Ext.each(this.mimeType, function(t){
			this.mimeTypes.push('application/vnd.nextthought.' + RegExp.escape(t));
		}, this);

		return this.mimeTypes.join(',');
	},


	buildStore: function(){
		if(NextThought.store.PageItem.prototype.proxy.url === 'tbd'){
			Ext.defer(this.buildStore,100,this);
			return;
		}

		var s = NextThought.store.PageItem.create({id:this.storeId, groupField: this.grouping, groupDir: 'ASC'});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'createdTime',
			sortOrder: 'descending',
			filter: this.filter,
			accept: this.getMimeTypes()
		});

		this.store = s;

		this.mon(this.store,{
			scope: this,
			add: 'recordsAdded',
			load: 'storeLoaded'
		});

		this.store.load();
		this.bindStore(this.store);
	},


	recordsAdded: function(store, records){
		console.debug(' UserDataPanel Store added records:', arguments);
		Ext.each(records, this.fillInData);
	},


	storeLoaded: function(store, records){
		//		console.debug('*** UserDataPanel Store loaded: ', arguments);
		Ext.each(records, this.fillInData);
	},


	fillInData: function(rec){
		LocationMeta.getMeta(rec.get('ContainerId'),function(meta){
			var lineage = [],
				location = '';

			if(!meta){
				console.warn('No meta for '+rec.get('ContainerId'));
			}
			else {
				lineage = LocationProvider.getLineage(meta.NTIID,true);
				location = lineage.shift();
				lineage.reverse();
			}

			rec.set({'location': Ext.String.ellipsis(location, 150, false)});
			rec.set({'path': lineage.join(' / ')});
			rec.set({'textBodyContent': rec.getBodyText()});
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		this.on({
			scope:this,
			'itemclick': 'rowClicked',
			itemmouseenter: 'rowHover'
		});
	},


	rowClicked: function(view, rec, item){
		var cid = rec.get('ContainerId');
		this.fireEvent('navigation-selected', cid, rec);
	},


	rowHover: function(view, record, item){
		function fin(pop){
			// If the popout is destroyed, clear the activeTargetDom,
			// that way we will be able to show the popout again.
			if(!pop){ return; }
			pop.on('destroy', function(){
				delete me.activeTargetDom;
			}, pop);
		}

		var popout = NextThought.view.account.activity.Popout,
			target = Ext.fly(item),
			me = this;

		if(!record || me.activeTargetDom === Ext.getDom(Ext.fly(item))){return;}

		me.cancelPopupTimeout();
		me.hoverTimeout = Ext.defer(function(){
			target.un('mouseout',me.cancelPopupTimeout,me,{single:true});
			popout.popup(record, target, me, undefined, fin);
			me.activeTargetDom = Ext.getDom(target);
		}, 500);

		Ext.fly(item).on('mouseout',me.cancelPopupTimeout,me,{single:true});
	},


	cancelPopupTimeout: function(){
		clearTimeout(this.hoverTimeout);
	}
});