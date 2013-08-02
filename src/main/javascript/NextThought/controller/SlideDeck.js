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

	init: function(){
		this.listen({
			'component':{
				'*':{
					'start-media-player': 'launchMediaPlayer'
				},
				'slidedeck-transcript': {
					'load-presentation-userdata': 'loadDataForPresentation'
				}
			}
		});
	},

	launchMediaPlayer: function(video, videoId){
		console.log('Controller should media player for video: ', arguments);
		if(Ext.isEmpty(video)){
			console.error('Could not open the video: insufficient info', arguments);
			return;
		}

		//See if we have a transcript.
		var reader = Ext.ComponentQuery.query('reader-content')[0].getContent(),
			transcript, videoEl, frag, me = this;

		if(video && !video.isModel){
			video.Class = video.Class || 'PlaylistItem';
			video = ParseUtils.parseItems(video)[0];
			video.set('NTIID', videoId);
			transcript = NextThought.model.transcript.TranscriptItem.fromVideo(video, reader);
		}
		else{
			frag = video && video.get('dom-clone');
			videoEl = frag.querySelector('object[type$=ntivideo]');
			transcript = videoEl && NextThought.model.transcript.TranscriptItem.fromDom(videoEl, reader);
		}

		// NOTE: this is overly simplified in the future,
		// instead of just passing the transcript, we will pass all the associated items.

		this.activeMediaPlayer = Ext.widget('media-viewer', {
			video: video,
			transcript: transcript,
			autoShow: true
		});
		this.activeMediaPlayer.fireEvent('suspend-annotation-manager', this);
		this.activeMediaPlayer.on('destroy', function(){
			me.activeMediaPlayer.fireEvent('resume-annotation-manager', this);
		});
	},


	createStoreForContainer: function(containerId){
		var url = $AppConfig.service.getContainerUrl(containerId, Globals.USER_GENERATED_DATA),
			store = NextThought.store.PageItem.make(url, containerId, true);

		Ext.apply(store.proxy.extraParams,{
			accept: NextThought.model.Note.mimeType,
			filter: 'TopLevel'
		});

		return store;
	},


	loadDataForPresentation: function(sender, cmps){
		var containers = {}, containerSettingsMap = {};
		Ext.Array.each(cmps, function(cmp){
			var containerId = Ext.isFunction(cmp.containerIdForData) ? cmp.containerIdForData() : null;

			if(Ext.isObject(containerId)){
				var object = containerId, props = {};
				containerId = object.containerId
				Ext.Object.each(object, function(k,v){
					if( k !== 'containerId'){
						props[k] = v;
					}
				})
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
			var store, props;
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
	}
});
