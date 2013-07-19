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
	filter: 'onlyMe,Bookmarks',
	filterOperator: '0',
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

	deferEmptyText: true,

	emptyText: Ext.DomHelper.markup([{
		cls:"history nothing rhp-empty-list",
		html: 'No Activity Yet'
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

			if(label === 'Today'){
				this.todayCount = (this.todayCount !== undefined)? this.todayCount + 1 : 0;
			}

			if(this.todayCount < 2 && this.itemAdded){
				this.itemAdded = false;
			}

			if(this.todayCount === 2 && (this.itemAdded || this.itemAdded !== undefined)){
				this.itemAdded = true;
			}

			if(this.todayCount > 2){
				delete this.itemAdded; 
			}

			// Detect if the grouping type change from the previous else and make we insert the new group title.
			if(!Ext.isEmpty(label) && (!this.previousGrouping || this.previousGrouping !== label || this.alreadyLoaded || (this.itemAdded && label === 'Today'))){
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

		this.on('resize','manageMaskSize');
	},

	getMimeTypes: function(){
		this.mimeTypes = [];
		Ext.each(this.mimeType, function(t){
			this.mimeTypes.push('application/vnd.nextthought.' + RegExp.escape(t));
		}, this);

		return this.mimeTypes;
	},


	onMaskBeforeShow: function(mask){
		if(this.getHeight() === 0){
			mask.setHeight(0);
		}
		return this.callParent(arguments);
	},


	manageMaskSize: function(width, height){
		this.loadMask.setHeight(height);
	},


	buildStore: function(){
		if(NextThought.store.PageItem.prototype.proxy.url === 'tbd'){
			Ext.defer(this.buildStore,100,this);
			return;
		}

		var s = NextThought.store.PageItem.create({
			id:this.storeId,
			groupField: this.grouping,
			groupDir: 'ASC',
			sortOnLoad: true,
			statefulFilters: false,
			remoteSort: false,
			remoteFilter: false,
			remoteGroup: false,
			filterOnLoad: true,
			sortOnFilter: true
		});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'createdTime',
			sortOrder: 'descending'
		});

		this.store = s;

		this.applyFilterParams();

		this.mon(this.store,{
			scope: this,
			add: 'recordsAdded',
			load: 'storeLoaded'
		});

		s.filter([function(rec){
			if(isMe(rec.get('Creator'))){
				return true;
			}
			return rec.isFavorited() || rec.isBookmark;
		}]);

		if(this.rendered){
			this.store.load();
		}else{
			this.on('afterrender', function(){
				this.store.load();
			}, this);
		}
		this.bindStore(this.store);
	},

	applyFilterParams: function(){
		if(this.store){
			Ext.apply(this.store.proxy.extraParams,{
				filterOperator: this.filterOperator,
				filter: this.filter,
				accept: this.getMimeTypes().join(',')
			});
		}
	},

	recordsAdded: function(store, records){
		console.debug(' UserDataPanel Store added records:', arguments);
		delete this.tpl.todayCount;
		this.tpl.itemAdded = true;
		Ext.each(records, this.fillInData, this);
	},


	storeLoaded: function(store){
		Ext.each(store.getRange(), this.fillInData, this);

		this.maybeShowMoreItems();
	},

	maybeShowMoreItems: function(){
		var lastItem = this.el.dom.lastChild,
			lastEl = Ext.get(lastItem),
			height = this.el.getHeight();

		//if we can't scroll
		if( height >= (lastEl.getY() + lastEl.getHeight()) ){
			this.prefetchNext();
		}
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
		var popout,
			target = Ext.get(item),
			me = this;

		if(record && record.getClassForModel) {
			popout = record.getClassForModel('widget.activity-popout-',NextThought.view.account.activity.Popout);
		}

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

		var me = this,
			s = me.getStore(),
			fo = (filterTypes.length > 1)? '0' : '1';

		if(Ext.isEmpty(filterTypes)){
			filterTypes = ['onlyMe','Bookmarks'];
			fo = '0';
		}

		me.filter = filterTypes.join(',');
		me.filterOperator = (filterTypes.length > 1)? fo : undefined;
		this.getMimeTypes = function(){ return mimeTypes; };

		if(!s || s.storeId === 'ext-empty-store'){
			return;			
		}


		s.removeAll();

		me.applyFilterParams();

		s.clearFilter(true);
		s.addFilter([function(rec){
			if(Ext.Array.contains(filterTypes, 'onlyMe')){
				if(isMe(rec.get('Creator'))){ return true; }

				if(Ext.Array.contains(filterTypes, 'Bookmarks')){
					return rec.isFavorited() || rec.isBookmark;
				}
			}else if(Ext.Array.contains(filterTypes, 'Bookmarks')){
				return rec.isFavorited() || rec.isBookmark;
			}

			return false;
		}], false);

		s.currentPage = 1;
		s.load();
	}
});
