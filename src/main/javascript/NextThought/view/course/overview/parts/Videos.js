/*jslint */
/*globals $AppConfig, Library, getURL, NextThought  */
Ext.define('NextThought.view.course.overview.parts.Videos',{
	extend: 'Ext.view.View',
	alias: ['widget.course-overview-video-section','widget.course-overview-ntivideo'],

	requires: [
		'NextThought.model.PlaylistItem',
		'NextThought.view.video.Video',
		'Ext.data.reader.Json'
	],

	ui: 'course',
	cls: 'overview-videos',
	preserveScrollOnRefresh: true,

	config: {
		playerWidth: 512,
		leaveCurtain: false
	},

	selModel: {
		allowDeselect: false,
		deselectOnContainerClick: false
	},

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'h2', cls:'{type}', cn:[{tag:'span',html: '{title}'}] },
		{ cls: 'body', cn:[
			{ cls: 'video-container', cn:[{ cls: 'screen' }]},
			{ cls: 'curtain', cn:[
				{ cls:'ctr', cn:[
					{ cls: 'play', cn:[
						{cls:'blur-clip',cn:{cls:'blur'}},
						{ cls: 'label', 'data-qtip': 'Play' },{cls:'launch-player', 'data-qtip': 'Play with transcript'}
					] }
				] }
			]},
			{ cls: 'video-list'}
		]}
	]),

	renderSelectors: {
		bodyEl: '.body',
		curtainEl: '.body .curtain',
		playBtnEl: '.body .curtain .play',
		playLabelEl: '.body .curtain .play .label',
		playBlurEl: '.body .curtain .play .blur',
		screenEl: '.body .screen',
		frameBodyEl: '.video-list'
	},


	getTargetEl: function(){ return this.frameBodyEl; },

	overItemCls:'over',
	itemSelector:'.video-row',
	tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [{
		cls: 'video-row',
		cn: [
			{ cls:'label', html: '{label}', 'data-qtip':'{label}' }//,
			//{ cls:'comments', html: '{comments:plural("Comment")}' } // No comments yet
		]
	}]}),


	listeners: {
		select: 'onSelectChange',
		click: {element: 'curtainEl', fn: 'onCurtainClicked'}
	},


	constructor: function(config){


		var i = config.items[0],
			store = config.store = new Ext.data.Store({
			fields: [
				{name:'id', type:'string', mapping: 'ntiid'},
				{name:'date', type:'date' },
				{name:'label', type:'string'},
				{name:'poster', type:'string'},
				{name:'comments', type:'auto'},
				{name:'hasTransripts', type:'boolean'}
			],
			data: this.convertItems(config.items || [])
		});

		//store.each(this.loadPageInfo,this);
		i = i && i.locationInfo;

		delete config.items;
		this.callParent([config]);

		this.playlist = [];

		if(i){
			Library.getVideoIndex(i.title,this.applyVideoData,this);
		}
	},


	applyVideoData: function(videoIndex){
		//console.debug(videoIndex);
		var reader = Ext.data.reader.Json.create({model: NextThought.model.PlaylistItem}),
			me = this;

		//save for later
		me.videoIndex = videoIndex;

		this.getStore().each(function(r){
			var v = videoIndex[r.getId()];
			r.set('hasTranscripts',!Ext.isEmpty(v.transcripts));
			me.playlist.push(reader.read({
				'mediaId': v.title,
				'sources': v.sources
			}).records[0]);
		});

		this.maybeCreatePlayer();
	},


	convertItems: function(items){
		var out = [];

		Ext.each(items,function(item) {
			var n = item.node,
				i = item.locationInfo,
				r = item.courseRecord;

			out.push({
				poster: getURL(n.getAttribute('poster'),i.root),
				ntiid: n.getAttribute('ntiid'),
				label: n.getAttribute('label'),
				comments: 'Loading... ',
				date: r && r.get('date')
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
		var c = this.up('{isOwnerLayout("card")}');
		if( c ){
			c.on('deactivate','pausePlayback',this);
		}else{
			Ext.log.warn('No Card parent for '+this.id);
		}
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


	pausePlayback: function(){
		if( this.player && this.player.isPlaying() ){
			this.player.pausePlayback();
		}
	},


	maybeCreatePlayer: function(){
		if (!this.rendered){
			this.on({afterRender: Ext.bind(this.maybeCreatePlayer, this, arguments), single: true});
			return;
		}

		this.showCurtain();

		var p = this.player = Ext.widget({
			xtype: 'content-video',
			playlist: this.playlist,
			renderTo: this.screenEl,
			playerWidth: this.getPlayerWidth(),
			floatParent: this
		});

		this.on({
			scope: p,
			destroy: 'destroy'
		});

		this.mon(p,{
			'player-command-play':'hideCurtain',
			'player-command-stop':'showCurtain',
			'player-command-pause':'showCurtain',
			'player-error':'showCurtain'
		});

		this.relayEvents(p,[
			'player-command-play',
			'player-command-stop',
			'player-command-pause',
			'player-error'
		]);
	},

	//allow querying using selector PATH (eg: "parent-xtype-container course-overview-ntivideo")
	getRefItems: function(){
		var p = this.player;
		return (p && [p]) || [];
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


	showCurtain: function(){
		var c = this.getLeaveCurtain(),
			a = c? 'hide':'show',
			el = this[(c ? 'screen':'curtain')+'El'];

		if(el){
			el.setVisibilityMode(Ext.Element.DISPLAY)[a]();
		}
	},


	hideCurtain: function(){
		var c = this.getLeaveCurtain(),
			a = c? 'show':'hide',
			el = this[(c ? 'screen':'curtain')+'El'];

		if(el){
			el.setVisibilityMode(Ext.Element.DISPLAY)[a]();
		}
	},


	onSelectChange: function(s,rec){
		var p = rec.get('poster') || null;

		if(p){
			p = 'url('+p+')';
		}

		if(this.player){
			this.player.stopPlayback();
		}

		if( this.curtainEl ){
			this.curtainEl.setStyle({backgroundImage:p});
			this.playBlurEl.setStyle({backgroundImage:p});
			this.playLabelEl.update(rec.get('label'));
			this.playBtnEl[rec.get('hasTranscripts')?'addCls':'removeCls']('transcripts');
		}
		else {
			console.warn('noes!');
		}
	},


	onCurtainClicked: function(e){
		e.stopEvent();

		var m = this.getSelectionModel().getSelection()[0],
			t = m && this.getStore().indexOf(m);

		if (!m || t<0 || !this.player){
			return;
		}

		if(e.getTarget('.launch-player')){
			this.fireEvent('start-media-player', this.videoIndex[m.getId()], m.getId());
			return;
		}


		this.player.playlistSeek(t);
	}
});
