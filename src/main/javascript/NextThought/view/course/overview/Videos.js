Ext.define('NextThought.view.course.overview.Videos',{
	extend: 'Ext.view.View',
	alias: ['widget.course-overview-video-section','widget.course-overview-ntivideo'],


	ui: 'course',
	cls: 'overview-videos',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'h2', cls:'{type}', cn:[{tag:'span',html: '{title}'}] },
		{ cls: 'body', cn:[
			{ cls: 'screen' },
			{ cls: 'curtain' },
			{ cls: 'video-list'}
		]}
	]),

	renderSelectors: {
		bodyEl: '.body',
		curtainEl: '.body .curtain',
		screenEl: '.body .screen',
		frameBodyEl: '.video-list'
	},


	getTargetEl: function(){ return this.frameBodyEl; },

	overItemCls:'over',
	itemSelector:'.video-row',
	tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [
		{ cls: 'video-row', cn: [
			{ cls:'label', html: '{label}', 'data-qtip':'{label}' }//,
			//{ cls:'comments', html: '{comments:plural("Comment")}' } // No comments yet
		]}
	]}),


	listeners: {
		select: 'onSelectChange'
	},


	constructor: function(config){


		var i = config.items[0],
			store = config.store = new Ext.data.Store({
			fields: [
				{name:'id', type:'string', mapping: 'ntiid'},
				{name:'label', type:'string'},
				{name:'poster', type:'string'},
				{name:'comments', type:'auto'}
			],
			data: this.convertItems(config.items || [])
		});

		//store.each(this.loadPageInfo,this);
		i = i && i.locationInfo;

		delete config.items;
		this.callParent([config]);

		if(i){
			Library.getVideoIndex(i.title,this.applyVideoData,this);
		}
	},


	applyVideoData: function(videoIndex){
		console.debug(videoIndex);
	},


	convertItems: function(items){
		var out = [];

		Ext.each(items,function(item) {
			var n = item.node,
				i = item.locationInfo;

			out.push({
				poster: getURL(n.getAttribute('poster'),i.root),
				ntiid: n.getAttribute('ntiid'),
				label: n.getAttribute('label'),
				comments: 'Loading... '
			});
		});

		return out;
	},


	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData||{},{
			title: this.title || 'Untitled',
			type: this.type || ''
		});

		if( this.type ){
			this.addCls(this.type);
		}
	},


	afterRender: function(){
		this.callParent(arguments);
		this.getSelectionModel().select(0);
		//this.bodyEl.mask('Loading...');
	},


	getCommentCount: function(pi){
//		var link = pi.getLink('RecursiveUserGeneratedData');
//		if(link){
			//load 1 item, filer by notes... read filteredTotal-something-or-other.
//		}
		//on failure call resetCommentCount
	},


	resetCommentCount: function(a,r){
		var req = r && r.request;
		console.warn('resetting count to 0\n',r && r.responseText);
		if( req ){
			r = this.store.findRecord('id',req.ntiid,0,false,true,true);
			if( r ){
				r.set('comments',0);
			}
		}
	},


	loadPageInfo: function(r){
		var ntiid = r.getId();

		$AppConfig.service.getPageInfo(ntiid,this.getCommentCount,this.resetCommentCount,this);
	},


	onSelectChange: function(s,rec){
		var p = rec.get('poster') || null;
		if(p){
			p = 'url('+p+')';
		}

		if( this.curtainEl ){
			this.curtainEl.setStyle({backgroundImage:p});
		}
		else {
			console.warn('noes!');
		}
	}

});
