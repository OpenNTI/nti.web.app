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
		this.callParent(arguments);

		this.addEvents('register-records');
		this.enableBubble(['register-records']);
	},


	afterRender: function(){
		this.callParent(arguments);

		var slide = this.slide;
		if(slide){
			this.buildUserDataStore();
			this.mon(this.slideImage,'load', Ext.defer(this.updateLayout, 1, this),this);
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

		data.isDomRange = true;
		this.fireEvent('show-editor', data, e.getTarget('.add-note-here', null, true));
	},


	onMouseOver: function(e){
		var t = e.getTarget('.image-wrap', null, true),
			box = t && t.down('.add-note-here'), me = this;

		if(this.suspendMoveEvents || !t || !box){ return; }

		this.mouseLeaveTimeout = setTimeout(function () {
			box.down('.note-here-control-box').removeCls('hidden');
			me.activeCueEl = t;
		}, 100);

	},

	onMouseOut: function(e){
		if (this.suspendMoveEvents) {
			return;
		}

		var target = e.getTarget('.image-wrap', null, true),
			box = target && target.down('.add-note-here');

		clearTimeout(this.mouseLeaveTimeout);
	},

	buildUserDataStore: function(){
		var containerId = this.slide.get('ContainerId'),
			filter, // = this.getUserDataTimeFilter(),
			me = this;

		function finish(store){
			// Apply filter to know which user data belong belong within the timing of this transcript.
			console.log('slide userdata store: ', store);
			if(!store){ return; }
			if(!Ext.isEmpty(filter) && Ext.isFunction(filter)){
				store.filter([{filterFn:filter}]);
			}
			// Now we will start to bucket notes.
			console.log('should start to show and bucket items');
			if(store.getCount() > 0){
				me.fireEvent('register-records', store, me);
			}
		}

		var url = $AppConfig.service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA),
			store = NextThought.store.PageItem.make(url, containerId,true);

		/** {@see NextThought.controller.UserData#addPageStore} for why we set this flag. */
		store.doesNotShareEventsImplicitly = true;
		Ext.apply(store.proxy.extraParams,{
			accept: NextThought.model.Note.mimeType,
			filter: 'TopLevel'
		});

		me.mon(store, 'load', finish, me);
		store.load();
	},


	getAnchorResolver: function(){
		return Anchors;
	},


	createDomRange:function(){
		var range = document.createRange(),
			el = this.el.down('img');

		if(el){ range.selectNode(el.dom); }
		return range;
	}

});