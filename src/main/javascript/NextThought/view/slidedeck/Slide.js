Ext.define('NextThought.view.slidedeck.Slide',{
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-slide',
	requires: [
		'NextThought.providers.Location',
		'NextThought.view.annotations.note.Panel',
		'NextThought.util.Anchors'
	],

	ui: 'slide',
	layout: 'auto',

	defaultType: 'note-panel',

	childEls: ['body'],
	getTargetEl: function () { return this.body; },
	renderTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn:[
			{tag: 'img', cls: 'slide'},
			{cls: 'left', cn:[{cls: 'prev'}]},
			{cls: 'right',cn:[{cls: 'next'}]}
		]},
		{id: '{id}-body', html:'{%this.renderContainer(out,values)%}'}
	]),

	renderSelectors: {
		slideImage: 'img.slide',
		next: '.next',
		prev: '.prev'
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
		var me = this;

		function finish(store){
			me.store = store;
			if(store.isLoading() || store.getCount() === 0){
				store.on('load',me.showUserData,me,{single:true});
				store.load();
				return;
			}
			me.showUserData();
		}

		function success(pi){
			var id = pi.get('NTIID'), store;
			if(LocationProvider.hasStore(id)){
				store = LocationProvider.getStore(id);
			}

			store = store || NextThought.store.PageItem.make(
					pi.getLink(Globals.USER_GENERATED_DATA),
					containerId,true);

			//for caching?
			//If we get here, the containerId didn't have a value associated with it.
			// So put what ever we come up with under the "containerId" key, even if the store is from the pageInfo's id
			// (even if it's different than what we started with)
			LocationProvider.addStore(containerId,store);
			finish(store);
		}

		function failure(){
			console.error('Could not resolve pageinfo for: '+containerId);
		}

		if(LocationProvider.hasStore(containerId)){
			console.debug('Using existing page store...',containerId);
			finish(LocationProvider.getStore(containerId));
		}
		else{
			$AppConfig.service.getPageInfo(containerId,success, failure, this);
		}
	},


	showUserData: function(){
		var items = this.store.getItems(),
			toAdd = [],
			dom = this.slide.get('dom-clone');

		Ext.each(items||[], function(record){

			var guid = IdCache.getComponentId(record, null, 'reply'),
				add = true,
				dec = record.get('applicableRange');


			if(!Anchors.doesContentRangeDescriptionResolve(dec,dom)){
				console.warn('Skipping item, because it does not anchor to this slide');
				add = false;
			}
			else if (record.getModelName() !== 'Note') {
				console.warn('it is not a note and I am not prepared to handle that.');
				add=false;
			}
			else if (Ext.getCmp(guid)) {
				console.log('already showing this reply? Ensure the note window is not open.');
				add=false;
			}

			if(add){
				toAdd.push({record: record, id: guid, root:true});
			}
		});

		console.log('Adding note records', toAdd);
		this.removeAll(true);
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
	}
});
