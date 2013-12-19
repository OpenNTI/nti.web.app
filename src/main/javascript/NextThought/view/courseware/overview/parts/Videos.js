/*jslint */
/*globals $AppConfig, Library, getURL, NextThought  */
Ext.define('NextThought.view.courseware.overview.parts.Videos', {
	extend: 'Ext.view.View',
	alias: ['widget.course-overview-video-section', 'widget.course-overview-ntivideo'],

	requires: [
		'NextThought.model.PlaylistItem',
		'NextThought.view.video.Video',
		'Ext.data.reader.Json'
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

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'h2', cls: '{type}', cn: [
			{tag: 'span', html: '{title}'}
		] },
		{ cls: 'body', cn: [
			{ cls: 'video-container', cn: [
				{ cls: 'screen' }
			]},
			{ cls: 'curtain', cn: [
				{ cls: 'ctr', cn: [
					{ cls: 'play', cn: [
						{cls: 'blur-clip', cn: {cls: 'blur'}},
						{ cls: 'label', 'data-qtip': 'Play' },
						{cls: 'launch-player', 'data-qtip': 'Play with transcript'}
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


	getTargetEl: function() {
		return this.frameBodyEl;
	},


	overItemCls: 'over',
	itemSelector: '.video-row',
	tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{
			cls: 'video-row',
			cn: [
				{ cls: 'label', html: '{label}', 'data-qtip': '{label:htmlEncode}' }//,
				//{ cls:'comments', html: '{comments:plural("Comment")}' } // No comments yet
			]
		}
	]}),


	constructor: function(config) {
		var i = config.items[0];

		this.store = config.store = new Ext.data.Store({
			fields: [
				{name: 'id', type: 'string', mapping: 'ntiid'},
				{name: 'date', type: 'date' },
				{name: 'label', type: 'string'},
				{name: 'poster', type: 'string'},
				{name: 'thumb', type: 'string'},
				{name: 'comments', type: 'auto'},
				{name: 'hasTranscripts', type: 'boolean'}
			],
			data: this.convertItems(config.items || [])
		});

		//store.each(this.loadPageInfo,this);
		i = i && i.locationInfo;

		delete config.items;
		this.callParent([config]);

		this.playlist = [];

		if (i) {
			this.locationInfo = i;
			Library.getVideoIndex(i.title, this.applyVideoData, this);
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
				var v = me.videoIndex[r.getId()], item;
				if (v) {
					r.set('hasTranscripts', !Ext.isEmpty(v.transcripts));
					if (me.curtainEl && selected.contains(r)) {
						me.playBtnEl[r.get('hasTranscripts') ? 'addCls' : 'removeCls']('transcripts');
					}

					item = v.sources[0];
					r.set({
						poster: item.poster,
						thumb: item.thumbnail
					});

					me.playlist.push(reader.read({
						'mediaId': v.title,
						'sources': v.sources
					}).records[0]);
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
			var n = item.node,
				i = item.locationInfo || {},
				r = item.courseRecord;

			out.push({
				poster: getURL(n.getAttribute('poster'), i.root),
				ntiid: n.getAttribute('ntiid'),
				label: n.getAttribute('label'),
				comments: 'Loading... ',
				date: r && r.get('date')
			});
		});

		return out;
	},


	beforeRender: function() {
		this.callParent(arguments);

		var t = this.title || 'Video';

		if (this.store.getCount() !== 1) {
			t = Ext.util.Inflector.pluralize(t);
		} else {
			this.addCls('singular');
		}


		this.renderData = Ext.apply(this.renderData || {}, {
			title: t,
			type: this.type || ''
		});

		if (this.type) {
			this.addCls(this.type);
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.store.getCount() === 1) {
			this.getTargetEl().hide();
		}

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
		if (!this.rendered) {
			this.on({afterRender: Ext.bind(this.maybeCreatePlayer, this, arguments), single: true});
			return;
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
			destroy: 'destroy'
		});

		this.mon(p, {
			//'player-command-play':'hideCurtain',
			//'player-command-stop':'showCurtain',
			//'player-command-pause':'showCurtain',
			'player-event-play': 'hideCurtain',
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

		$AppConfig.service.getPageInfo(ntiid, this.getCommentCount, this.resetCommentCount, this);
	},


	onPlayerError: function() {
		this.showCurtain();
		alert('An error occurred playing the video.  Please try again later.');
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
		var p = rec.get('poster') || null, idx;

		if (p) {
			p = 'url(' + p + ')';
		}

		if (this.player) {
			this.player.stopPlayback();
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
			this.playBtnEl[rec.get('hasTranscripts') ? 'addCls' : 'removeCls']('transcripts');
		}
		else {
			console.warn('noes!');
		}
	},


	getSelectedVideo: function() {
		return this.getSelectionModel().getSelection()[0];
	},


	getSelectedVideoIndex: function(r) {
		return this.getStore().indexOf(r || this.getSelectedVideo() || 0);
	},


	onCurtainClicked: function(e) {
		e.stopEvent();

		var m = this.getSelectedVideo(),
			li = this.locationInfo;

		if (e.getTarget('.launch-player')) {
			this.fireEvent('start-media-player', this.videoIndex[m.getId()], m.getId(), getURL(li.root));
			return;
		}

		this.maybeCreatePlayer();

		if (!m || !this.player) {
			console.warn('Ignoring on curtain click', this, m);
			return;
		}

		if (e && e.shiftKey && this.player.canOpenExternally()) {
			this.player.openExternally();
		}
		else {
			console.log('Masking z curtain');
			this.curtainEl.mask('Loading...');
			this.player.resumePlayback();
		}
	}
});
