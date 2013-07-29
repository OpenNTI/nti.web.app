Ext.define('NextThought.view.slidedeck.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-view',
	requires: [
		'NextThought.view.slidedeck.Slide',
		'NextThought.view.slidedeck.Queue',
		'NextThought.view.slidedeck.Video',
		'NextThought.view.slidedeck.Transcript',
		'NextThought.model.transcript.TranscriptItem',
		'NextThought.view.slidedeck.media.Viewer'
	],

	cls: 'view',
	ui: 'slidedeck',
	plain: true,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},

	renderTpl: Ext.DomHelper.markup([
		'{%this.renderContainer(out,values)%}',
		{ cls: 'exit-button', html: 'Exit Presentation', tabIndex: 0, role: 'button' }]
	),

	renderSelectors: {
		exitEl: '.exit-button'
	},

	constructor: function(config){
		var t, vPlaylist;

		config.items = [{
			xtype: 'container',
			width: 400,
			plain: true,
			ui: 'slidedeck-controls',
			layout: { type: 'vbox', align: 'stretch' }
		},{
			flex: 1,
			xtype: 'slidedeck-slide'
		}];

		t = config.items[1];

		if(isFeature('transcript-presentation')){
			t.xtype = 'slidedeck-transcript';
			t.data = config.transcript;
			this.hasTranscript = true;
			vPlaylist = this.getVideoPlayList(config.store);
			t.transcriptStore = this.buildTranscriptStore(vPlaylist);
			// NOTE: Slides are a time-series and currently that's what drives the presentation.
			// We get this store passed to be the one contain a sequence of slides with their associated data.
			t.slideStore = config.store;
			t.startOn = config.startOn;
		}

		return this.callParent([config]);
	},

	initComponent: function(){
		this.callParent(arguments);
		var store = this.store,
			start = this.startOn,
			ctrls = this.items.getAt(0),
			slide = this.getSlide(),
			vPlaylist = this.getVideoPlayList(store),
			v, q;

		//clear the reference, pass it along...
		delete this.store;
		delete this.startOn;

		v = this.video = ctrls.add({ xtype: 'slidedeck-video', playlist: vPlaylist});
		//Ths queue is the primary control. Selection causes video and slide to change.
		q = this.queue = ctrls.add({ xtype: 'slidedeck-queue', store: store, startOn: start, flex: 1 });

		v.queue = q;
		slide.queue = q;

		//wire up
		this.mon(q,'select', this.maybeSelect, this);
		this.mon(q, 'beforeselect', function(dvm){
			this.wasSelected = dvm.getSelection();
		}, this);

		this.on('editorActivated',function(){
			this.pausedForEditing = v.pausePlayback();
		}, this);
		this.on('editorDeactivated', function(){
			//Don't start back up if the user had us paused explictly
			//only if we paused for the edit
			if(this.pausedForEditing){
				this.pausedForEditing = false;
				v.resumePlayback();
			}
		}, this);

		// pause and reply video when share overlay opens and closes

		this.mon(NextThought.getApplication(),'showshare', function(evt, target) {
			this.pausedForSharing = v.pausePlayback();
		}, this);
		this.mon(NextThought.getApplication(),'hideshare', function(evt, target) {
			if (this.pausedForSharing) {
				v.resumePlayback();
			}
		}, this);

		if(this.hasTranscript){
			this.mon(this.down('slidedeck-transcript'), 'jump-video-to', this.jumpVideoToLocation, this);
			this.mon(this.video, 'media-heart-beat', this.actOnMediaHeartBeat, this);
		}
	},

	getVideoPlayList: function(store){
		var playList = [];
		store.each(function(s){ playList.push(s.get('media')); },this);
		return playList;
	},


	jumpVideoToLocation: function(videoNTIID, time){
		this.video.fireEvent('jump-to-location', videoNTIID, time);
	},


	buildTranscriptStore: function(playList){
		var s = new Ext.data.Store({proxy:'memory'}),
			transcripts = [],
			reader = Ext.ComponentQuery.query('reader-content')[0].getContent(),
			videoObjects = this.getUniqueVideoObjects(playList);

		Ext.each(videoObjects, function(v){
			var m = NextThought.model.transcript.TranscriptItem.fromDom(v, reader);
			if(m){
				transcripts.push(m);
			}
		});

		s.add(transcripts);
		return s;
	},


	getUniqueVideoObjects: function(playList){
		var vObjects = [], uniqueIds=[];

		Ext.each(playList, function(v){
			var frag = v.get('dom-clone'),
				video = frag.querySelector('object[type$=ntivideo]');

			vObjects.push(video);
		});

		vObjects = Ext.Array.filter(vObjects, function(i){
			var id = Ext.fly(i).getAttribute('data-ntiid'),
				ret = !Ext.Array.contains(uniqueIds, id);

			uniqueIds.push(id);
			return ret;
		});

		return vObjects;
	},


	actOnMediaHeartBeat: function(){
		var s = this.video.getState();

		if(this.hasTranscript){
			this.down('slidedeck-transcript').syncWithVideo(s);
		}
	},


	getSlide: function(){
		return this.items.getAt(1);
	},


	doSelect: function(){
		var s = this.getSlide();
		this.video.updateVideoFromSelection.apply(this.video, arguments);
		if(s.updateSlide){
			s.updateSlide.apply(s, arguments);
		}
	},


	//If we have an editor open we don't really want to do the selection
	//so detect that, pause the video if necessary. prompt the user and if they
	//ignore the warning close the editor, play the video if we paused it, and let the update go on
	//if the click cancel we leave things in a paused state and the editor open
	maybeSelect: function(v, slide){
		var slideView = this.getSlide(),
			destructiveSelection = slideView.editorActive && slideView.editorActive(),
			wasPlaying,
			me = this;

		function actOnSelect(){
			me.doSelect(v, slide);
		}

		function allowDestructiveAction(){
			if(wasPlaying){
				me.video.resumePlayback();
			}
			if(slideView.activeEditorOwner && slideView.activeEditorOwner.deactivateEditor){
				slideView.activeEditorOwner.deactivateEditor();
			}

			actOnSelect();
		}

		if(!destructiveSelection){
			actOnSelect();
			return;
		}

		wasPlaying = this.video.pausePlayback();
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: 'Leaving this slide will cause any unsaved data to be lost.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'caution:Continue'},
			title: 'Are you sure?',
			fn: function(str){
				if(str === 'ok'){
					allowDestructiveAction();
				}
				else{
					v.select(me.wasSelected, false, true);
				}
				delete me.wasSelected;
			}
		});

	},

	afterRender: function(){
		this.callParent(arguments);
		var me = this;

		function enterFilter(e) { var k = e.getKey(); return (k === e.ENTER || k === e.SPACE); }
		function close(){
			var slide = me.getSlide().slide;

			if(me.fireEvent('beforeexit', me, slide) === false){
				return;
			}
			me.destroy();
			me.fireEvent('exited', me, slide);
		}

		this.mon(this.exitEl,{
			click: close,
			keydown: Ext.Function.createInterceptor(close,enterFilter,null,null)
		});
	}
});
