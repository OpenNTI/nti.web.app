Ext.define('NextThought.app.course.overview.components.parts.VideoRoll', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-videoroll',

	statics: {
		isVideoRoll: true,

		buildConfig: function(item) {
			return {
				xtype: this.xtype,
				videoRoll: item,
				course: item.course,
				navigate: item.navigate
			};
		}
	},

	ui: 'course',
	cls: 'overview-videos scrollable',
	preserveScrollOnRefresh: true,

	layout: 'none',

	requires: [
		'NextThought.model.PlaylistItem',
		'NextThought.app.video.Video',
		'NextThought.app.course.overview.components.parts.VideoRollItem',
		'NextThought.model.VideoRollItem',
		'Ext.data.reader.Json',
		'NextThought.app.library.Actions',
	],

	config: {
		playerWidth: 512,
		leaveCurtain: false,
		videoDataLoadedCallback: Ext.emptyFn
	},

	renderTpl: Ext.DomHelper.markup({
		cls: 'body',
		cn: [{
			cls: 'video-container',
			cn: [{
				cls: 'screen'
			}]
		}, {
			cls: 'curtain',
			cn: [{
				cls: 'ctr',
				cn: [{
					cls: 'play',
					cn: [{
						cls: 'blur-clip',
						cn: {
							cls: 'blur'
						}
					}, {
						cls: 'label',
						'data-qtip': '{{{NextThought.view.courseware.overview.parts.Videos.playtranscript}}}'
					}, {
						cls: 'launch-player',
						'data-qtip': '{{{NextThought.view.courseware.overview.parts.Videos.play}}}'
					}]
				}]
			}]
		}, {
			id: '{id}-body', cls: 'video-list',
			cn: ['{%this.renderContainer(out,values)%}']
		}]
	}),

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],

	renderSelectors: {
		bodyEl: '.body',
		curtainEl: '.body .curtain',
		playBtnEl: '.body .curtain .play',
		playLabelEl: '.body .curtain .play .label',
		playBlurEl: '.body .curtain .play .blur',
		screenEl: '.body .screen',
		frameBodyEl: '.video-list'
	},

	constructor: function(config) {
		this.callParent([config]);
		var me = this;

		this.locationInfo =  this.videoRoll.locationInfo;

		this.LibraryActions = NextThought.app.library.Actions.create();
		this.WindowActions = NextThought.app.windows.Actions.create();

		this.playlist = [];
		this.rawItems = this.convertItems(this.videoRoll && this.videoRoll.Items);

		if (this.locationInfo) {
			this.course.getVideoIndex()
				.then(this.applyVideoData.bind(this));
		}
	},

	convertItems: function(items) {
		var out = [];

		Ext.each(items, function(item) {
			var n = item.node || {
					getAttribute: function(a) {
						return item[a];
					}
				},
				poster = item.sources && item.sources[0] && item.sources[0].poster,
				i = item.locationInfo || {},
				r = item.courseRecord,
				model = new NextThought.model.VideoRollItem({
					poster: getURL(poster || n.getAttribute('poster'), i.root),
					NTIID: n.getAttribute('ntiid'),
					label: n.getAttribute('label') || n.getAttribute('title'),
					comments: getString('NextThought.view.courseware.overview.parts.Videos.loading') + ' ',
					date: r && r.get('date'),
					title: n.getAttribute('title') || n.getAttribute('label'),
					sources: n.getAttribute('sources'),
					hasTranscripts: !Ext.isEmpty(n.getAttribute('transcripts'))
				});

			out.push(model);
		});

		return out;
	},


	addComponents: function(items){
		var me = this;
		Ext.each(items || [], function(item) {
			me.add({
				xtype: 'course-overview-videoroll-item',
				record: item
			});
		});

		wait()
			.then(function() {
				me.onSelectChange(null, items[0]);
			})
	},

	initComponent: function() {
		this.callParent(arguments);
	},

	applyVideoData: function(videoIndex) {
		var reader = Ext.data.reader.Json.create({model: NextThought.model.PlaylistItem}),
			me = this,
			selected = this.selectedVideo,
			toRemove = [],
			count;

		try {
			//save for later
			if (!videoIndex) {
				console.error('No video index provided', this);
			}
			me.videoIndex = videoIndex || {};

			Ext.each(this.rawItems, function(r) {

				var v = me.videoIndex[r.getId()],
					item, raw;
				if (v) {
					r.set('hasTranscripts', !Ext.isEmpty(v.transcripts) || !Ext.isEmpty(v.slidedeck));

					// TODO: Compare the selected video and r based on their NTIID.
					if (me.curtainEl && selected && selected.getId() === r.getId()) {
						me.playBtnEl.addCls('transcripts');
						me.curtainEl.addCls('transcripts');
						me.playLabelEl.dom.setAttribute('data-qtip', getString('NextThought.view.courseware.overview.parts.Videos.playtranscript'));
					}

					raw = v.sources[0];
					// item = reader.read({
					// 	'mediaId': v.title,
					// 	'sources': v.sources,
					// 	'NTIID': r.NTIID
					// }).records[0];

					r.set('sources', v.sources);
					r.set('mediaId', v.title);


					// me.mon(item, {
					// 	'resolved-poster': function(item) {
					// 		if (item.get('poster') !== r.get('poster') || item.get('thumbnail') !== r.get('thumbnail')) {
					// 			r.set({
					// 				poster: item.get('poster'),
					// 				thumb: item.get('thumbnail')
					// 			});
					//
					// 			// me.onSelectChange(me.store, me.getSelectionModel().getSelection()[0]);
					// 		}
					// 	}
					// });

					r.set('slidedeck', v.slidedeck);

					// r.set({
					// 	poster: item.get('poster') || raw.poster,
					// 	thumb: item.get('thumbnail') || raw.thumbnail,
					// 	label: v.title,
					// 	slidedeck: v.slidedeck
					// });
					me.playlist.push(r);
				} else {
					toRemove.push(r);
				}
			});

			this.addComponents(me.playlist);
		} catch (e) {
			console.warn('Coud not load video index because:', e.stack || e.message || e);
		} finally {
			Ext.callback(this.getVideoDataLoadedCallback(), this, [videoIndex, count]);
		}
	},

	beforeRender: function() {
		this.callParent(arguments);

		if (this.type) {
			this.addCls(this.type);
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		this.on({
			'click': {
				element: 'curtainEl',
				fn: 'onCurtainClicked'
			},
			scope: this
		});

		if (this.screenEl) {
			this.screenEl.setVisibilityMode(Ext.isIE ? Ext.Element.OFFSETS : Ext.Element.VISIBILITY);
		}
		if (this.curtainEl) {
			this.curtainEl.setVisibilityMode(Ext.isIE ? Ext.Element.OFFSETS : Ext.Element.VISIBILITY);
		}

		this.selectedVideo = this.rawItems[0];
		this.showCurtain();
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
		} else if (el) {
			el.setStyle({
				zIndex: 9
			});
		}

		wait().then(this.setProgress.bind(this));
	},

	maybeCreatePlayer: function() {
		var single = this.store.getCount() === 1;

		if (!this.rendered) {
			this.on({
				afterRender: Ext.bind(this.maybeCreatePlayer, this, arguments),
				single: true
			});
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

	/**
	 * Handle the play button click on the overview videos
	 *
	 * For a video that belongs to a slidedeck, we open the media viewer with a slidedeck.
	 * Otherwise, we determine whether to play the video inline or launch the mediaviewer
	 * based on where the user clicked on the overview.
	 *
	 * @param  {Event} e browser click event
	 */
	onCurtainClicked: function(e) {
		e.stopEvent();

		var m = this.getSelectedVideo(),
			li = this.locationInfo,
			slidedeck = m.get('slidedeck'),
			slideActions;

		if (!Ext.isEmpty(slidedeck)) {
			this.maybePauseCurrentVideo();
			this.navigateToSlidedeck(slidedeck);
		} else if (e && e.getTarget('.edit')) {
			this.WindowActions.showWindow('edit-video', null, null, {});
		} else if (!e.getTarget('.launch-player') && e.getTarget('.transcripts')) {
			this.maybePauseCurrentVideo();
			this.navigateToTarget(m, li.root);
		} else {
			this.maybeCreatePlayer();

			if (!m || !this.player) {
				console.warn('Ignoring on curtain click', this, m);
				return;
			}

			if (e && e.shiftKey && this.player.canOpenExternally()) {
				this.player.openExternally();
			} else {
				console.log('Masking z curtain');
				this.hideCurtain();
				this.player.resumePlayback(true);
			}
		}
	},

	getSelectedVideo: function() {
		return this.selectedVideo;
	},

	setProgress: function(progress) {
		progress = progress || this.progress;

		this.progress = progress;

		if (!progress || !this.store) {
			return;
		}

		var me = this;

		me.store.each(function(video) {
			if (progress.hasBeenViewed(video.get('id'))) {
				video.set('viewed', true);
				video.set('viewedCls', 'viewed');
			}
		});
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
	}
});
