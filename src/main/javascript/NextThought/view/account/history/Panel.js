Ext.define('NextThought.view.account.history.Panel', {
	extend: 'Ext.view.View',
	alias: ['widget.user-history-panel'],

	requires: [
		'NextThought.model.events.Bus',
		'NextThought.store.PageItem',
		'NextThought.util.Time',
		'NextThought.model.converters.GroupByTime',
		'NextThought.view.account.history.mixins.Note',
		'NextThought.view.account.history.mixins.ForumTopic',
		'NextThought.view.account.history.mixins.BlogEntry',
		'NextThought.view.account.history.mixins.Highlight',
		'NextThought.view.account.history.mixins.Bookmark'

	],


	storeId: 'noteHighlightStore',
	filter: 'MeOnly',
	filterMap: {
		'application/vnd.nextthought.bookmarks': 'Bookmarks'
	},

	mimeType: [
		'note',
		'highlight',
		'contact',
		'forums.personalblogcomment',
		'forums.personalblogentrypost',
		'forums.communityheadlinepost',
		'forums.generalforumcomment'
	],

	grouping: 'GroupingField',

	ui: 'history',
	cls: 'user-data-panel',
	preserveScrollOnRefresh: true,

	emptyText: Ext.DomHelper.markup([{
		cls:"history nothing",
		html: 'No Items'
	}]),


	itemSelector:'.history',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag:'tpl', 'for':'.', cn:[
			'{%this.insertGroupTitle(values,out)%}',
			'{%this.getTemplateFor(values,out)%}']
		}
	]),{
		getTemplateFor: function(values,out){
			if(!this.subTemplates || !this.subTemplates[values.MimeType]){
				return console.log('No tpl for...', values);
			}
			return this.subTemplates[values.MimeType].applyOut(values, out);
		},

		insertGroupTitle: function(values, out){
			var label = Ext.data.Types.GROUPBYTIME.groupTitle(values.GroupingField, 'Today');

			// Detect if the grouping type change from the previous else and make we insert the new group title.
			if(!Ext.isEmpty(label) && (!this.previousGrouping || this.previousGrouping !== label)){
				this.previousGrouping = label;
				return Ext.DomHelper.createTemplate({ cls:'divider', cn:[{tag:'span', html: label}] }).applyOut({}, out);
			}
			return '';
		}
	}),


	registerSubType: function(key, itemTpl){
		if(!this.tpl.subTemplates){ this.tpl.subTemplates = {}; }
		this.tpl.subTemplates[key] = itemTpl;
	},


	registerFillData: function(key, fn){
		if(!this.fillData){ this.fillData = {}; }
		this.fillData[key] = fn;
	},


	registerClickHandler: function(key, fn){
		if(!this.clickHandlers){ this.clickHandlers = {}; }
		this.clickHandlers[key] = fn;
	},


	initComponent: function(){
		this.callParent(arguments);

		this.noteItem = new NextThought.view.account.history.mixins.Note({panel: this});
		this.highlightItem = new NextThought.view.account.history.mixins.Highlight({panel: this});
		this.forumTopicItem = new NextThought.view.account.history.mixins.ForumTopic({panel: this});
		this.blogEntryItem = new NextThought.view.account.history.mixins.BlogEntry({panel: this});
		this.bookmarkItem = new NextThought.view.account.history.mixins.Bookmark({panel: this});

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
		Ext.each(records, this.fillInData, this);
	},


	storeLoaded: function(store, records){
		Ext.each(records, this.fillInData, this);
	},


	fillInData: function(rec){
		if(Ext.isFunction( this.fillData && this.fillData[rec.get('MimeType')])){
			this.fillData[rec.get('MimeType')](rec);
		}
	},


	afterRender: function(){
		this.callParent(arguments);

		this.on({
			scope:this,
			'itemclick': 'rowClicked',
			itemmouseenter: 'rowHover'
		});

		this.mon(this.el,{
			scope: this,
			scroll: this.onScroll
		});
	},


	rowClicked: function(view, rec, item){
		if(Ext.isFunction( this.clickHandlers && this.clickHandlers[rec.get('MimeType')])){
			this.clickHandlers[rec.get('MimeType')](view, rec);
		}
	},


	rowHover: function(view, record, item, index, e){
		var popout = NextThought.view.account.activity.Popout,
			target = Ext.get(item),
			me = this,
			cls = record.get('Class');

		if(!record || me.activeTargetDom === item || cls === 'Highlight' || cls === 'Bookmark'){return;}

		me.cancelPopupTimeout();
		
		me.hoverTimeout = Ext.defer(this.showPopup, 500, me, [record,item]);

		target.on('mouseout',me.cancelPopupTimeout,me,{single:true});
	},


	showPopup: function(record, item){
		var popout = NextThought.view.account.activity.Popout,
			target = Ext.get(item),
			me = this;

		function fin(pop){
			// If the popout is destroyed, clear the activeTargetDom,
			// that way we will be able to show the popout again.
			if(!pop){ return; }
			pop.on('destroy', function(){
				delete me.activeTargetDom;
				delete me.activeTargetRecord;
			}, pop);
		}

		me.cancelPopupTimeout();

		target.un('mouseout',me.cancelPopupTimeout,me,{single:true});
		me.activeTargetDom = item;
		me.activeTargetRecord = record;

		popout.popup(record, target, me, undefined, fin);
	},


	cancelPopupTimeout: function(){
		delete this.activeTargetDom;
		delete this.activeTargetRecord;
		clearTimeout(this.hoverTimeout);
	},


	onUpdate: function(store,record){
		var item, r = this.callParent(arguments);
		if(this.activeTargetRecord === record){
			item = this.getNode(record);
			this.showPopup(record,item);
		}
		return r;
	},

	prefetchNext: function(){
		var s = this.getStore(), max;

		if (!s.hasOwnProperty('data')) {
			return;
		}

		max = s.getPageFromRecordIndex(s.getTotalCount());
		if(s.currentPage < max && !s.isLoading()){
			s.clearOnPageLoad = false;
			s.nextPage();
		}
	},


	onScroll: function(e,dom){
		var el = dom.lastChild,
			offsets = Ext.get(el).getOffsetsTo(dom),
			top = offsets[1] + dom.scrollTop,
			ctBottom = dom.scrollTop + dom.clientHeight;

		if(ctBottom > top){
			this.prefetchNext();
		}

	},

	applyFilters: function(mimeTypes,filterTypes){
		if(Ext.isEmpty(mimeTypes) && Ext.isEmpty(filterTypes)){
			return;
		}

		Ext.Array.include(filterTypes, 'onlyMe');

		var s = this.getStore(),
			selectedMimeTypes = [],
			selectedFilters = [this.filter];

		s.removeAll();

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'relevance',
			sortOrder: 'descending',
			filter: filterTypes.join(','),
			filterOperator: (filterTypes.length > 1)? '0' : '1',
			accept: mimeTypes.join(',')
		});

		s.load();
	}
});