Ext.define('NextThought.controller.SlideDeck',{
	extend: 'Ext.app.Controller',
	models:[
		'transcript.TranscriptItem'
	],
	views: [
		'slidedeck.Overlay',
		'slidedeck.Queue',
		'slidedeck.Slide',
		'slidedeck.Video',
		'slidedeck.View',
		'slidedeck.Transcript',
		'slidedeck.media.Viewer'
	],

	refs:[
		{ ref: 'activeMediaViewer', selector: 'media-viewer' },
		{ ref: 'activeSlideDeck', selector: 'slidedeck-overlay' }
	],

	init: function(){
		this.listen({
			'component':{
				'*':{
					'change-media-in-player': 'changeMediaInPlayer',
					'start-media-player': 'launchMediaPlayer',
					'profile-link-clicked': 'maybeCloseMediaViewer'
				},
				'slidedeck-transcript': {
					'load-presentation-userdata': 'loadDataForPresentation'
				}
			},
			'controller': {
				'*': {
					'show-object': 'maybeShowMediaPlayer',
					 'before-show-profile': 'maybeCloseSlideDeck'
				}
			}
		},this);
	},


	maybeCloseSlideDeck: function(){
		var v = this.getActiveSlideDeck();

		//TODO: make this query for open editors and return false to abort
		if(v){
			v.destroy();
		}
	},


	changeMediaInPlayer: function(v, videoId, basePath, rec, options){
		var a = this.getActiveMediaViewer();
		if (a) {
			a.exitViewer();
		}

		this.launchMediaPlayer.apply(this,arguments);
	},



	launchMediaPlayer: function(v, videoId, basePath, rec, options){
		//Only allow one media player at a time
		console.debug('Launching media viewer');
		if (this.getActiveMediaViewer()) {
			console.warn('Cancelling media player launch because one is already active');
			return;
		}

		console.log('Controller should media player for video: ', arguments);
		if(Ext.isEmpty(v)){
			console.error('Could not open the video: insufficient info', arguments);
			return;
		}

		//See if we have a transcript.
		var transcript, video, videoEl, frag, me = this;

		if(v && !v.isModel){
			video = Ext.clone(v);
			video.Class = video.Class || 'PlaylistItem';
			video = ParseUtils.parseItems(video)[0];
			video.set('NTIID', videoId);
			transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, basePath);
		}
		else{
			frag = v && v.get('dom-clone');
			videoEl = frag.querySelector('object[type$=ntivideo]');
			transcript = videoEl && NextThought.model.transcript.TranscriptItem.fromDom(videoEl, basePath);
		}

		// NOTE: this is overly simplified in the future,
		// instead of just passing the transcript, we will pass all the associated items.

		function createMediaPlayer(record, scrollToId){
			me.activeMediaPlayer = Ext.widget('media-viewer', {
				video: video,
				transcript: transcript,
				autoShow: true,
				record: record,
				scrollToId: scrollToId,
				startAtMillis: options && options.startAtMillis
			});
			me.activeMediaPlayer.fireEvent('suspend-annotation-manager', this);
			me.activeMediaPlayer.on('destroy', function(){
				me.activeMediaPlayer.fireEvent('resume-annotation-manager', this);
				me.activeMediaPlayer = null;
			});
			me.activeMediaPlayer.on('media-viewer-ready', function(viewer){
				var fn = options && options.callback,
					scope = this;
				if(Ext.isObject(fn)){
					fn = fn.fn;
					scope = fn.scope;
				}

				Ext.callback(fn, scope, [viewer]);
			});
		}

		if(!rec || rec.isTopLevel()){
			createMediaPlayer(rec);
			return;
		}

		//Otherwise, will need to load the parent record before we can navigate to it.
		this.navigateToReply(rec, createMediaPlayer, me);
	},


	navigateToReply: function(rec, callback, scope){
		var	targets = (rec.get('references') || []).slice(),
			me = this;

		targets.push(rec.getId());

		function continueLoad() {
			if(Ext.isEmpty(targets)){
				console.warn('Targets is empty, so we are done here. (we should not get here!)');
				Ext.callback(callback, scope, [rec]);
			}
			$AppConfig.service.getObject(targets.pop(), loaded, fail, me);
		}

		function loaded(r){
			var isTopLevel = r.isTopLevel();

			// We're done here
			if(isTopLevel){
				Ext.callback(callback, scope, [r, rec.getId()]);
				return;
			}

			// if not, let's load the next object
			continueLoad();
		}

		function fail(req, resp) {
			//FIXME: could not figure out the type of the object. Normally, that's what we want but it's hard to get with info we have.
			var objDisplayType = 'object',
				msgCfg = { msg: 'An unexpected error occurred loading the ' + objDisplayType };

			if (resp && resp.status) {
				if (resp.status === 404) {
					msgCfg.title = 'Not Found!';
					msgCfg.msg = 'The ' + objDisplayType + ' you are looking for no longer exists.';
				}
				else if (resp.status === 403) {
					msgCfg.title = 'Unauthorized!';
					msgCfg.msg = 'You do not have access to this ' + objDisplayType + '.';
				}
			}
			console.log("Could not retrieve rawData for: ", targets);
			console.log("Error: ", arguments);
			alert(msgCfg);
		}

		continueLoad();
	},

	createStoreForContainer: function(containerId){
		var url = $AppConfig.service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA),
			store = NextThought.store.PageItem.make(url, containerId, true);

		store.doesNotParticipateWithFlattenedPage = true;
		Ext.apply(store.proxy.extraParams,{
			accept: NextThought.model.Note.mimeType,
			filter: 'TopLevel'
		});

		return store;
	},


	loadDataForPresentation: function(sender, cmps){
		var containers = {}, containerSettingsMap = {};
		Ext.each(cmps, function(cmp){
			var object,
				props = {},
				containerId = Ext.isFunction(cmp.containerIdForData) ? cmp.containerIdForData() : null;

			if(Ext.isObject(containerId)){
				object = containerId;
				containerId = object.containerId;
				Ext.Object.each(object, function(k,v){
					if( k !== 'containerId'){
						props[k] = v;
					}
				});
				containerSettingsMap[containerId] = props;
			}

			if(containerId){
				if(Ext.isArray(containers[containerId])){
					containers[containerId].push(cmp);
				}
				else{
					containers[containerId] = [cmp];
				}
			}
		});
		console.log('Need to load data for containers', containers);

		function finish(store, records, success){
			var cmps = containers[store.containerId];
			console.debug('Finished load for container', store.containerId);
			console.log('Need to push records', success && records ? records.length : 0, 'to components', cmps);
			sender.bindStoreToComponents(store, cmps);
		}

		Ext.Object.each(containers, function(cid){
			var store;
			if(sender.hasPageStore(cid)){
				store = sender.getPageStore(cid);
			}
			else{
				store = this.createStoreForContainer(cid);
				Ext.apply(store, containerSettingsMap[cid] || {});
				sender.addPageStore(cid, store);
			}

			store.on('load', finish, this, {single: true});
			store.load();

		}, this);
	},


	maybeShowMediaPlayer: function(obj, fragment, rec, options){
		var mime;

		if(obj instanceof NextThought.model.PlaylistItem){
			this.launchMediaPlayer(obj, obj.getId());
			return false;
		}

		if(!obj.isModel){
			mime = obj.mimeType || obj.MimeType;
			if(/vnd.nextthought.ntivideo/.test(mime)){
				this.launchMediaPlayer(obj, obj.ntiid, obj.basePath, rec, options);
				return false;
			}
		}
		return true;
	},


	maybeCloseMediaViewer: function(user, callback, scope){
		var me = this;
		if(this.activeMediaPlayer){
			Ext.Msg.show({
				msg: 'You are about to exit the media viewer.',
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				icon: 'warning-red',
				buttonText: {'ok': 'caution:Exit'},
				title: 'Are you sure?',
				fn: function (str) {
					if (str === 'ok') {
						//console.debug('should dismiss the MEDIA VIEWER prior to navigating: ', arguments);
						me.activeMediaPlayer.fireEvent('exit-viewer');
						Ext.callback(callback, scope, [true]);
					}
				}
			});
			return false;
		}
		return true;
	}
});
