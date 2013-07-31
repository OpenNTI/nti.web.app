Ext.define('NextThought.view.slidedeck.transcript.Slide',{
	extend: 'Ext.Component',
	alias: 'widget.slide-component',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn:[
			{tag: 'img', cls: 'slide'},
			{tag: 'span', cls:'add-note-here', cn:{cls:'note-here-control-box hidden', tag:'span'}}
			//			{cls: 'left', cn:[{cls: 'prev'}]},
//			{cls: 'right',cn:[{cls: 'next'}]}
		]}
	]),

	ui: 'slide',

	renderSelectors: {
		slideImage: 'img.slide',
		createNoteEl: '.add-note-here'
//		next: '.next',
//		prev: '.prev'
	},


	initComponent: function(){
		this.fireEvent('uses-page-stores', this);
		this.callParent(arguments);
		this.enableBubble(['register-records', 'unregister-records']);
	},


	afterRender: function(){
		this.callParent(arguments);

		var slide = this.slide;
		if(slide){
			this.mon(this.slideImage,'load', this.finishedLoadingImage, this);
			this.slideImage.set({src: slide.get('image')});

			this.mon(this.el, {
				scope: this,
				'mouseover': 'onMouseOver',
				'mouseout':'onMouseOut'
			});

			this.mon(this.createNoteEl,{
				scope:this,
				'click': 'openNoteEditor'
			});

		}
	},

	finishedLoadingImage: function(){
		var me = this;
		Ext.defer(function(){
			me.updateLayout();
			if(me.slide){
				me.buildUserDataStore();
			}
		},1, me);
	},

	openNoteEditor: function(e){
		var data = {startTime: this.slide.get('video-start'), endTime: this.slide.get('video-end')},
			dom = this.slide.get('dom-clone'),
			img = dom.querySelector('img'), range;

		if(!img){
//			onError();
			console.error('Missing img for the slide.');
			return false;
		}

		range = dom.ownerDocument.createRange();
		range.selectNode(img);

		data.range = range;
		data.containerId = this.slide.get('ContainerId');
		data.userDataStore = this.userDataStore;

		data.isDomRange = true;
		this.fireEvent('show-editor', data, e.getTarget('.add-note-here', null, true));
	},


	onMouseOver: function(e){
		var t = e.getTarget('.x-component-slide', null, true),
			box = t && t.down('.add-note-here'), me = this,
			current = this.el.parent().down('.note-here-control-box:not(.hidden)');

		if(this.suspendMoveEvents || !t || !box){ return; }

		clearTimeout(this.mouseEnterTimeout);

		this.mouseLeaveTimeout = setTimeout(function () {
			box.down('.note-here-control-box').removeCls('hidden');
			if(current && current !== box.down('.note-here-control-box')){
				current.addCls('hidden');
			}
			me.activeCueEl = t;
		}, 100);

	},

	onMouseOut: function(e){
		var target = e.getTarget(null, null, true),
			t = target && target.is('.x-component-slide'),
			box = t && target.down('.add-note-here'), me =  this;

		if(this.suspendMoveEvents || !target || !box){ return; }

		//clearTimeout(this.mouseLeaveTimeout);
	
		if(!box.down('.note-here-control-box').hasCls('hidden')){
			this.mouseEnterTimeout = setTimeout(function(){
				if(box && !box.down('.note-here-control-box').hasCls('hidden')){
					box.down('.note-here-control-box').addCls('hidden');
				}
				delete me.activeCueEl;
			}, 500);
		}
	},

	buildUserDataStore: function(){
		var containerId = this.slide.get('ContainerId'),
			url, store,
			me = this;

		function finish(store, records){
			if(!store){ return; }

			if(store.getCount() > 0){
				me.fireEvent('register-records', store, records, me);
			}
			me.userDataStore = store;
			me.fireEvent('listens-to-page-stores', me, {
				scope: me,
				add: 'onStoreEventsAdd',
				remove: 'onStoreEventsRemove'
			});
		}

		if(this.hasPageStore(containerId)){
			store = this.getPageStore(containerId);
		}
		else{
			url = $AppConfig.service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA);
			store = NextThought.store.PageItem.make(url, containerId,true);
			/** {@see NextThought.controller.UserData#addPageStore} for why we set this flag. */
			store.doesNotShareEventsImplicitly = true;
			Ext.apply(store.proxy.extraParams,{
				accept: NextThought.model.Note.mimeType,
				filter: 'TopLevel'
			});
			me.addPageStore(containerId, store);
		}

		me.mon(store, 'load', finish, me, {single:true});
		store.load();
	},


	onStoreEventsAdd:function(store, records){
		this.fireEvent('register-records', store, records, this);
	},


	onStoreEventsRemove: function(store, records){
		this.fireEvent('unregister-records', store, records, this);
	},


	getAnchorResolver: function(){
		return Anchors;
	},


	createDomRange:function(){
		var range = document.createRange(),
			el = this.el.down('img');

		if(el){ range.selectNode(el.dom); }
		return range;
	},

	getContextDomNode: function(){
		return Ext.clone(this.el.down('img').dom);
	}

});