Ext.define('NextThought.view.slidedeck.Slide',{
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-slide',
	requires: [
		'NextThought.providers.Location',
		'NextThought.view.slidedeck.CommentHeader',
		'NextThought.view.slidedeck.ThreadRoot',
		'NextThought.util.Anchors'
	],

	ui: 'slide',
	layout: 'auto',

	defaultType: 'slidedeck-slide-note',

	childEls: ['body'],
	getTargetEl: function () { return this.body; },
	renderTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn:[
			{tag: 'img', cls: 'slide'},
			{cls: 'left', cn:[{cls: 'prev'}]},
			{cls: 'right',cn:[{cls: 'next'}]}
		]},
		{id: '{id}-body', cls:'slide-notes', html:'{%this.renderContainer(out,values)%}'}
	]),

	renderSelectors: {
		slideImage: 'img.slide',
		next: '.next',
		prev: '.prev'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents('editorActivated','editorDeactivated');
		this.enableBubble('editorActivated', 'editorDeactivated');
		this.on({
			scope: this,
//			beforecollapse: this.handleCollapsingThread,
			beforeexpand: this.handleExpandingThread,
			add: this.updateCount
		});
	},


	updateSlide: function(v,slide){
		this.slide = slide;
		if(!this.slideImage){
			return;
		}

		var hasNext = Boolean(slide.getSibling(1)),
			hasPrev = Boolean(slide.getSibling(-1)),
			cid = slide.get('ContainerId');

		console.log('Set slide:',slide, slide.get('dom-clone'));

		this.buildItemStore(cid);

		this.slideImage.set({src: slide.get('image')});

		this.next[hasNext?'removeCls':'addCls']('disabled');
		this.prev[hasPrev?'removeCls':'addCls']('disabled');
	},


	buildItemStore: function(containerId){
		function getCacheKey(id){
			return id+'-slides';
		}

		var me = this, cahceKey = getCacheKey(containerId);

		if(me.store){
			console.log('removing add listener from', me.store);
			me.mun(me.store, 'add', this.itemAddedToStore, this);
		}
		delete me.store;//don't let this dangle if there is a problem down the road.

		function finish(store){
			me.store = store;
			me.mon(me.store, 'add', me.itemAddedToStore, me);
			console.log('Adding add listener to ', me.store);
			store.on('load',me.showUserData,me,{single:me});
			store.load();
		}

		function success(pi){
			var id = getCacheKey(pi.get('NTIID')), store;
			if(LocationProvider.hasStore(id)){
				store = LocationProvider.getStore(id);
			}
			else {
				store = NextThought.store.PageItem.make(
						pi.getLink(Globals.USER_GENERATED_DATA),
						containerId,true);

				Ext.apply(store.proxy.extraParams,{
					accept: NextThought.model.Note.mimeType,
					filter: 'TopLevel'
				});

				//for caching
				LocationProvider.addStore(cahceKey,store);
			}

			finish(store);
		}

		function failure(){
			console.error('Could not resolve pageinfo for: '+containerId);
		}

		if(LocationProvider.hasStore(cahceKey)){
			console.debug('Using existing page store...',cahceKey);
			finish(LocationProvider.getStore(cahceKey));
		}
		else{
			$AppConfig.service.getPageInfo(containerId,success, failure, this);
		}
	},


	itemAddedToStore: function(store, records){
		console.log('Slide detected records added to store ', store, records);
		var dom = this.slide.get('dom-clone'), toAdd = [];

		//We only care about top level
		records = Ext.Array.filter(records, function(r){ return !r || r.isTopLevel();});

		Ext.Array.sort(records, Globals.SortModelsBy('Last Modified', 'ASC'));

		Ext.each(records, function(record){
			var cmp = this.componentForRecord(record, dom);
			if(cmp){
				toAdd.push(cmp);
			}
		}, this, true);

		//Uses semi-private implementation detail for speed.
		this.add(1, toAdd);
	},


	updateCount: function(){
		var header;
		header = this.down('slide-comment-header');

		if(header){
			header.updateCount(this.query('slidedeck-slide-note').length);
		}
	},


	onRemove: function(){
		this.callParent(arguments);
		this.updateCount();
	},


	componentForRecord: function(record, dom){
		var guid = IdCache.getComponentId(record, null, 'reply'),
			add = true,
			dec = record.get('applicableRange');


		if (record.getModelName() !== 'Note') { add=false; }

		else if(!Anchors.doesContentRangeDescriptionResolve(dec,dom)){
			add = false;
			console.warn('Skipping item, because it does not anchor to this slide');
		}
		else if (Ext.getCmp(guid)) {
			console.log('already showing this reply? Ensure the note window is not open.');
			add=false;
		}

		return add ? {record: record, id: guid} : null;
	},


	showUserData: function(){
		var items = this.store.getItems()||[],
			toAdd = [],
			dom = this.slide.get('dom-clone');

		Ext.Array.sort(items, Globals.SortModelsBy('Last Modified', 'ASC'));

		Ext.each(items, function(record){
			var cmp = this.componentForRecord(record, dom);
			if(cmp){
				toAdd.push(cmp);
			}
		}, this);

		console.log('Adding note records', toAdd);
		this.removeAll(true);
		if(toAdd.length> 0){
			toAdd.push({xtype: 'box', cls: 'note-footer'});
		}
		toAdd.unshift({xtype: 'slide-comment-header', store: this.store, slide: this.slide, count: toAdd.length-1});
		this.add(toAdd);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.slideImage,'load',this.updateLayout,this);
		if(this.slide){
			this.updateSlide({},this.slide);
		}
		this.mon(this.next,'click',this.queue.nextSlide,this.queue);
		this.mon(this.prev,'click',this.queue.previousSlide,this.queue);
	},


	handleExpandingThread: function(root /*,childrenDom*/){
		var h = 0, t = this.el.getScroll().top;
		Ext.each(this.query(this.defaultType),function(i){
			if(i === root){return;}
			if(!i.collapsed){
				h += i.getTargetEl().getHeight();
				i.collapse();
			}
		});

		console.debug('TODO: figure out a better scroll lock, lost height: '+h+', current scroll position: '+t);

		this.el.scrollTo('top', t,true);
	},


	getRoot:function(){	return this; },


	editorActive: function(){
		return Boolean(this.getRoot().activeEditorOwner);
	},


	setEditorActive: function(cmp){
		var active = Boolean(cmp),
			root = this.getRoot();
		console.log('Will mark Slide as having an ' + (active ? 'active' : 'inactive') + ' editor', cmp);
		if(root.editorActive() === active){
			console.warn('Slide already has an ' + (active ? 'active' : 'inactive') + ' editor. Unbalanced calls?');
			return;
		}
		delete root.activeEditorOwner;
		if(cmp){
			root.activeEditorOwner = cmp;
		}
		root.fireEvent(active ? 'editorActivated' : 'editorDeactivated', this);
	},


	checkAndMarkAsActive: function(cmp){
		var root = this.getRoot();
		if(!root.editorActive()){
			root.setEditorActive(cmp);
			return true;
		}
		return false;
	}
});
