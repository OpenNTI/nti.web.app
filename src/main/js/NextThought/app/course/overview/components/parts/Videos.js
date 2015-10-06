Ext.define('NextThought.app.course.overview.components.parts.Videos', {
	extend: 'Ext.view.View',
	alias: ['widget.course-overview-video', 'widget.course-overview-ntivideo'],

	statics: {
		isVideo: true,

		buildConfig: function(item, prev) {

			if (prev && prev.xtype === this.xtype) {
				prev.items.push(item);
				return null;//don't add this new item
			}

			return {
				xtype: this.xtype,
				items: [item],
				course: item.course,
				navigate: item.navigate
			};
		}
	},

	requires: [
		'NextThought.model.PlaylistItem',
		'NextThought.app.video.Video',
		'Ext.data.reader.Json',
		'NextThought.app.library.Actions'
	],

	ui: 'course',
	cls: 'overview-videos scrollable',
	preserveScrollOnRefresh: true,

	config: {
		playerWidth: 512,
		leaveCurtain: false,
		videoDataLoadedCallback: Ext.emptyFn
	},

	selModel: {
		allowDeselect: false,
		deselectOnContainerClick: false
	},

	renderTpl: Ext.DomHelper.markup(
		{ cls: 'body', cn: [
			{ cls: 'video-container', cn: [
				{ cls: 'screen' }
			]},
			{ cls: 'curtain', cn: [
				{ cls: 'ctr', cn: [
					{ cls: 'play', cn: [
						{cls: 'blur-clip', cn: {cls: 'blur'}},
						{ cls: 'label', 'data-qtip': '{{{NextThought.view.courseware.overview.parts.Videos.playtranscript}}}'},
						{cls: 'launch-player', 'data-qtip': '{{{NextThought.view.courseware.overview.parts.Videos.play}}}'}
					] }
				] }
			]},
			{ cls: 'video-list'}
		]}
	),

	renderSelectors: {
		bodyEl: '.body',
		curtainEl: '.body .curtain',
		playBtnEl: '.body .curtain .play',
		playLabelEl: '.body .curtain .play .label',
		playBlurEl: '.body .curtain .play .blur',
		screenEl: '.body .screen',
		frameBodyEl: '.video-list'
	},


	getTargetEl: function() {
		return this.frameBodyEl;
	},


	overItemCls: 'over',
	itemSelector: '.video-row',
	tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{
			cls: 'video-row {viewedCls}',
			cn: [
				{ cls: 'label', html: '{label}', 'data-qtip': '{label:htmlEncode}' },
				{tag: 'tpl', 'if': 'viewed', cn: [
					{cls: 'viewed', html: 'viewed'}
				]}//,
				//{ cls:'comments', html: '{comments:plural("Comment")}' } // No comments yet
			]
		}
	]}),


	constructor: function(config) {
		this.store = config.store = new Ext.data.Store({
			fields: [
				{name: 'id', type: 'string', mapping: 'ntiid'},
				{name: 'date', type: 'date' },
				{name: 'label', type: 'string'},
				{name: 'poster', type: 'string'},
				{name: 'thumb', type: 'string'},
				{name: 'comments', type: 'auto'},
				{name: 'slidedeck', type: 'string'},
				{name: 'hasTranscripts', type: 'boolean'},
				{name: 'viewedCls', type: 'string'},
				{name: 'viewed', type: 'boolean'}
			],
			data: this.convertItems(config.items || [])
		});

		var i = config.items[0],
			single = this.store.getCount() === 1;

		//store.each(this.loadPageInfo,this);
		i = i && i.locationInfo;

		delete config.items;

		if (single) {
			config.playerWidth = 704;
		}

		this.callParent([config]);

		if (single) {
			this.addCls('singular');
		}

		this.LibraryActions = NextThought.app.library.Actions.create();

		this.playlist = [];

		if (i) {
			this.locationInfo = i;

			this.course.getVideoIndex()
				.then(this.applyVideoData.bind(this));
		}
		else {
			Ext.callback(this.getVideoDataLoadedCallback(), this, [undefined, 0]);
		}
	},


	initComponent: function() {
		this.on('select', 'onSelectChange', this);
		this.callParent(arguments);
	},



	applyVideoData: function(videoIndex) {
		//console.debug(videoIndex);
		var reader = Ext.data.reader.Json.create({model: NextThought.model.PlaylistItem}),
			me = this, selected = this.getSelectionModel().selected, toRemove = [], count,
			store = this.getStore();

		if (!store) {
			return;
		}

		try {
			//save for later
			if (!videoIndex) {
				console.error('No video index provided', this);
			}
			me.videoIndex = videoIndex || {};

			store.each(function(r) {
				var v = me.videoIndex[r.getId()], item, raw;
				if (v) {
					r.set('hasTranscripts', !Ext.isEmpty(v.transcripts) || !Ext.isEmpty(v.slidedeck));
					if (me.curtainEl && selected.contains(r)) {
                        me.playBtnEl.addCls('transcripts');
                        me.curtainEl.addCls('transcripts');
                        me.playLabelEl.dom.setAttribute('data-qtip', getString('NextThought.view.courseware.overview.parts.Videos.playtranscript'));
					}

					raw = v.sources[0];
					item = reader.read({
						'mediaId': v.title,
						'sources': v.sources,
						'NTIID': r.getId()
					}).records[0];

					me.mon(item, {
						'resolved-poster': function(item) {
						    if( item.get('poster') !== r.get('poster')
						       || item.get('thumbnail') !== r.get('thumbnail')){
							     r.set({
								    poster: item.get('poster'),
								    thumb: item.get('thumbnail')
							     });

							     me.onSelectChange(me.store, me.getSelectionModel().getSelection()[0]);
							}
						}
					});

					r.set({
						poster: item.get('poster') || raw.poster,
						thumb: item.get('thumbnail') || raw.thumbnail,
						label: v.title,
						slidedeck: v.slidedeck
					});

					me.playlist.push(item);
				}
				else {
					toRemove.push(r);
				}
			});

			if (!Ext.isEmpty(toRemove)) {
				console.warn('Droping ', toRemove.length, ' records that arent in video index');
				this.getStore().remove(toRemove);
			}

			count = store.getCount();
			if (count === 0) {
				console.error('Destroying video widget because there are no videos to play');
				this.destroy();
			}
		}
		catch (e) {
			console.warn('Coud not load video index because:', e.stack || e.message || e);
		}
		finally {
			Ext.callback(this.getVideoDataLoadedCallback(), this, [videoIndex, count]);
		}

	},


	convertItems: function(items) {
		var out = [];

		Ext.each(items, function(item) {
			var n = item.node || {getAttribute: function(a) { return item[a];} },
				poster = item.sources && item.sources[0] && item.sources[0].poster,
				i = item.locationInfo || {},
				r = item.courseRecord;

			out.push({
				poster: getURL(poster || n.getAttribute('poster'), i.root),
				ntiid: n.getAttribute('ntiid'),
				label: n.getAttribute('label') || n.getAttribute('title'),
				comments: getString('NextThought.view.courseware.overview.parts.Videos.loading') + ' ',
				date: r && r.get('date')
			});
		});

		return out;
	},


	beforeRender: function() {
		this.callParent(arguments);

		if (this.type) {
			this.addCls(this.type);
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		//if (this.store.getCount() === 1) {
		//	this.getTargetEl().hide();
		//}
		this.on({'click': {element: 'curtainEl', fn: 'onCurtainClicked'}, scope: this});

		if (this.screenEl) {
			this.screenEl.setVisibilityMode(Ext.isIE ? Ext.Element.OFFSETS : Ext.Element.VISIBILITY);
		}
		if (this.curtainEl) {
			this.curtainEl.setVisibilityMode(Ext.isIE ? Ext.Element.OFFSETS : Ext.Element.VISIBILITY);
		}

		this.getSelectionModel().select(0);
		this.showCurtain();
		//this.bodyEl.mask('Loading...');
	},


	getCommentCount: function(pi) {
    //		var link = pi.getLink('RecursiveUserGeneratedData');
    //		if(link){
		//load 1 item, filer by notes... read filteredTotal-something-or-other.
    //		}
		//on failure call resetCommentCount
	},


	pausePlayback: function() {
		if (this.player && this.player.isPlaying()) {
			this.player.pausePlayback();
		}
	},


	maybeCreatePlayer: function() {
		var single = this.store.getCount() === 1;

		if (!this.rendered) {
			this.on({afterRender: Ext.bind(this.maybeCreatePlayer, this, arguments), single: true});
			return;
		}

		if (single) {
			this.removeCls('viewed');
		}

		if (this.player) {
			return;
		}

		console.error('CREATING PLAYER');

		this.showCurtain();

		var p = this.player = Ext.widget({
			xtype: 'content-video',
			playlist: this.playlist,
			renderTo: this.screenEl,
			playerWidth: this.getPlayerWidth(),
			floatParent: this,
			playlistIndex: this.getSelectedVideoIndex()
		});

		this.on({
			scope: p,
			beforedestroy: function() {
				return p.fireEvent('beforedestroy');
			},
			destroy: 'destroy'
		});

		this.mon(p, {
			//'player-command-play':'hideCurtain',
			//'player-command-stop':'showCurtain',
			//'player-command-pause':'showCurtain',
			//'player-event-play': 'hideCurtain',
			'player-event-ended': 'showCurtain',
			//'player-event-pause': 'showCurtain',
			'player-error': 'onPlayerError'
		});

		this.relayEvents(p, [
			'player-command-play',
			'player-command-stop',
			'player-command-pause',
			'player-event-play',
			'player-event-pause',
			'player-event-ended',
			'player-error'
		]);
	},

	//allow querying using selector PATH (eg: "parent-xtype-container course-overview-ntivideo")
	getRefItems: function() {
		var p = this.player;
		return (p && [p]) || [];
	},


	resetCommentCount: function(a, r) {
		var req = r && r.request;
		console.warn('resetting count to 0\n', r && r.responseText);
		if (req) {
			r = this.store.findRecord('id', req.ntiid, 0, false, true, true);
			if (r) {
				r.set('comments', 0);
			}
		}
	},


	loadPageInfo: function(r) {
		var ntiid = r.getId();

		Service.getPageInfo(ntiid, this.getCommentCount, this.resetCommentCount, this);
	},


	onPlayerError: function() {
		this.showCurtain();
		alert(getString('NextThought.view.courseware.overview.parts.Videos.error'));
	},


	showCurtain: function() {
		var c = this.getLeaveCurtain(),
			a = c ? 'hide' : 'show',
			el = this[(c ? 'screen' : 'curtain') + 'El'];

		if (this.curtainEl.isMasked()) {
			console.log('unmasking curtain');
			this.curtainEl.unmask();
		}

		console.log('Showing curtain');
		if (el && !c) {
			el[a]();
		}
		else if (el) {
			el.setStyle({zIndex: 9});
		}

		wait().then(this.setProgress.bind(this));
	},


	hideCurtain: function() {
		var c = this.getLeaveCurtain(),
			a = c ? 'show' : 'hide',
			el = this[(c ? 'screen' : 'curtain') + 'El'];

		if (this.curtainEl.isMasked()) {
			console.log('Unmasking curtain');
			this.curtainEl.unmask();
		}

		if (el && !c) {
			console.log('Hiding curtain view');
			el[a]();
		}
		else if (el) {
			el.setStyle({zIndex: 0});
		}
	},


	onSelectChange: function(s, rec) {
		if (!rec) { return; }

		var p = rec.get('poster') || null, idx;

		if (p) {
			p = 'url(' + p + ')';
		}

		if (this.player) {
			this.player.stopPlayback();
			//Ext.destroy(this.player);
			//delete this.player;
			idx = this.getSelectedVideoIndex(rec);
			if (idx >= 0) {
				this.player.playlistSeek(idx);
			}
			else {
				console.error('No playlist index for rec', rec);
			}
		}

		if (this.curtainEl) {
			this.showCurtain();
			this.curtainEl.setStyle({backgroundImage: p});
			this.playBlurEl.setStyle({backgroundImage: p});
			this.playLabelEl.update(rec.get('label'));

            this.playBtnEl.addCls('transcripts');
            this.curtainEl.addCls('transcripts');
            this.playLabelEl.dom.setAttribute('data-qtip', getString('NextThought.view.courseware.overview.parts.Videos.playtranscript'));
		}
		else {
			console.warn('noes!');
		}

		wait().then(this.setProgress.bind(this));
	},


	getSelectedVideo: function() {
		return this.getSelectionModel().getSelection()[0];
	},


	getSelectedVideoIndex: function(r) {
		return this.getStore().indexOf(r || this.getSelectedVideo() || 0);
	},


	onCurtainClicked: function(e) {
		e.stopEvent();

		var me = this,
			m = me.getSelectedVideo(),
			li = me.locationInfo,
			slidedeck, slideActions,
			video = me.videoIndex[m.getId()];


		if (!e.getTarget('.launch-player') && e.getTarget('.transcripts')) {
			if (me.player) {
				if (me.player.isPlaying()) {
					console.debug('Pausing video for media');
					me.player.pausePlayback();
				} else {
					console.warn('Player did not report being in a state where the media viewer would interfere');
				}

				if (me.hasCls('playing')) { return; }
			}

			slidedeck = video.slidedeck || m.get('slidedeck');
			if (Ext.isEmpty(slidedeck)) {
				me.navigateToTarget(m, li.root);
			} else {
				me.navigateToSlidedeck(slidedeck);
			}

			return;
		}

		me.maybeCreatePlayer();

		if (!m || !me.player) {
			console.warn('Ignoring on curtain click', me, m);
			return;
		}

		if (e && e.shiftKey && me.player.canOpenExternally()) {
			me.player.openExternally();
		}
		else {
			console.log('Masking z curtain');
			me.hideCurtain();
			me.player.resumePlayback(true);
		}
	},

	navigateToTarget: function(videoItem, basePath) {
		if (!this.navigate) {
			console.error('No navigate set on content link');
			return;
		}

		var o = this.videoIndex[videoItem.getId()],
			video = NextThought.model.PlaylistItem.create(Ext.apply({ NTIID: o.ntiid }, o));

		video.basePath = basePath;
		this.navigate.call(null, video);
	},


	navigateToSlidedeck: function(slidedeckId, startVideo) {
		var me = this;
		if (slidedeckId) {
			Service.getObject(slidedeckId)
				.then(function(slidedeck) {
					me.navigate.call(null, slidedeck);
				});
		}

	},


	setProgress: function(progress) {
		progress = progress || this.progress;

		this.progress = progress;

		if (!progress || !this.store) { return; }

		var me = this,
			single = me.store.getCount() === 1;

		me.store.each(function(video) {
			if (progress.hasBeenViewed(video.get('id'))) {
				if (single) {
					me.addCls('viewed');
				} else {
					video.set('viewed', true);
					video.set('viewedCls', 'viewed');
				}
			}
		});
	}
});
