Ext.define('NextThought.view.UserDataPanel',{
	extend: 'Ext.Component',
	alias: 'widget.user-data-panel',

	requires: [
		'NextThought.store.PageItem'
	],


	cls: 'user-data-panel',
	autoScroll: true,


	feedTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag:'tpl', 'if':'length==0', cn:[{
			cls:"history nothing",
			cn: ['No Items']
		}]},
		{tag:'tpl', 'for':'.', cn:[


			{tag:'tpl', 'if':'isNote', cn:[
			{
				'data-guid': '{guid}',
				cls: 'history note',
				cn:[
					{cls: 'path', html:'{path}'},
					{cls: 'location', html:'{location}'},
					{cls: 'body', html: '{textContent}'}
				]
			}]},

			{tag:'tpl', 'if':'isFavorite', cn:[
			{
				'data-guid': '{guid}',
				cls: 'history favorite',
				cn:[
//					{cls: 'path', html:'{path}'},
//					{cls: 'location', html:'{location}'}
				]
			}]},


			{tag:'tpl', 'if':'isChat', cn:[
			{
				'data-guid': '{guid}',
				cls: 'history chat',
				cn:[
				]
			}]},



			{tag:'tpl', 'if':'label', cn:[{
				cls: 'divider', cn:[{tag:'span', html:'{label}'}]
			}]}
		]}
	])),



	initComponent: function(){
		var data = NextThought.model,
			m = this.dataMapper = {};

		m[data.Note.prototype.mimeType] = this.getNoteItem;
		m[data.Highlight.prototype.mimeType] = this.getHighlightItem;
		m[data.Transcript.prototype.mimeType] = this.getChatItem;

		this.callParent(arguments);


		this.initializeStore();
	},



	initializeStore: function(){
		if(NextThought.store.PageItem.prototype.proxy.url === 'tbd'){
			Ext.defer(this.initializeStore,100,this);
			return;
		}

		var s = this.store = NextThought.store.PageItem.create({groupField:'GroupingField'});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
//			sortOn: 'lastModified',
//			sortOrder: 'descending',
			//filter: 'OnlyMe',
			accept: this.mimeType
		});

		s.proxy.limitParam = undefined;
		s.proxy.startParam = undefined;
		delete s.pageSize;

		this.mon(s,{
			scope: this,
			datachanged: this.redraw
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		try{
			this.store.load();
		}
		catch(e){
			console.error(e.message, e.stack|| e.stacktrace);
		}
	},

	redraw: function(){
		var container = this,
			items = [],
			store = this.store,
			groups = store.getGroups(),
			me = this;

		function doGroup(group){
			var label = (group.name||'').replace(/^[A-Z]\d{0,}\s/,'') || 'Today';
			if( label ){ items.push({ label: label }); }

			Ext.each(group.children,function(c){
				var fn = me.dataMapper[c.mimeType];
				if( fn ){ items.push(fn.call(me,c)); }
			});
		}

		if(groups.length === 0){
			this.feedTpl.overwrite(container.getEl(), []);
			container.updateLayout();
		}

		Ext.each(groups,doGroup,this);

		this.feedTpl.overwrite(container.getEl(),items);

		container.updateLayout();
	},



	getHighlightItem: function(rec){

		rec.getBodyText = function(){
			return rec.get('selectedText');
		};

		return this.getNoteItem(rec);
	},

	getNoteItem: function(rec){
		var me = this,
			guid = guidGenerator(),
			data = {
				isNote: true,
				guid: guid,
				location: '...',
				path: '...',
				textContent: rec.getBodyText()
			};

		LocationMeta.getMeta(rec.get('ContainerId'),function(meta){
			var lineage = [],
				location = '',
				dom;

			if(!meta){
				console.warn('No meta for '+rec.get('ContainerId'));
			}
			else {
				lineage = LocationProvider.getLineage(meta.NTIID,true);
				location = lineage.shift();
				lineage.reverse();

				Ext.apply(data, {
					location: Ext.String.ellipsis(location, 150, false),
					path: lineage.join(' / ')
				});
			}

			try {
				dom = me.el.down('[data-guid='+guid+']');
				if (dom) {
					dom.down('.path').update(data.path);
					dom.down('.location').update(data.location);
				}
			}
			catch(e){
				console.log('strange :P', e.message, e.stack);
			}


		});

		return data;
	},


	getChatItem: function(rec){
		console.log(rec);

		return {isChat:true};
	}

});
