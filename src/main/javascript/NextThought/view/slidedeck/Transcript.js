Ext.define('NextThought.view.slidedeck.Transcript', {
	extend: 'NextThought.view.content.Base', //'Ext.container.Container',
	alias: 'widget.slidedeck-transcript',
	requires:[
		'NextThought.layout.component.Natural',
		'NextThought.view.video.transcript.Transcript',
		'NextThought.view.content.reader.NoteOverlay',
		'NextThought.view.slidedeck.transcript.NoteOverlay',
		'NextThought.view.slidedeck.transcript.Slide'
	],

	ui:'transcript',
	cls:'transcript-view',

	layout: 'auto',
//	componentLayout: 'natural',
	childEls: ['body'],

	getTargetEl: function () { return this.body; },
	renderTpl: Ext.DomHelper.markup([
		{id: '{id}-body', cls:'transcript-wrap', cn:['{%this.renderContainer(out,values)%}']}
	]),

	items:[],


	initComponent: function(){
		this.buildPresentationTimeLine(this.slideStore, this.transcriptStore);
		this.callParent(arguments);
	},


	buildPresentationTimeLine: function(slideStore, transcriptStore){
		var items = [];

		slideStore.each(function(slide){
			var m = slide.get('media'),
				vid = m && m.getAssociatedVideoId(),
				t = transcriptStore.findRecord('associatedVideoId', vid, 0, false, true, true),
				start = slide.get('video-start'),
				end = slide.get('video-end');

			console.log('slide starts: ', start, ' slide ends: ', end, ' transcript url: ', t.get('associatedVideoId'));

			items.push({
				xtype:'slide-component',
				slide: slide,
				layout:{
					type:'vbox',
					align: 'stretch'
				}
			});

			if(t){
				// NOTE: make a copy of the transcript record,
				// since many slide can have the same transcript but different start and end time.
				t = t.copy();
				t.set('desired-time-start', start);
				t.set('desired-time-end', end);

				items.push({
					xtype:'video-transcript',
					flex:1,
					transcript: t,
					layout:{
						type:'vbox',
						align: 'stretch'
					}
				});
			}
		});

		this.items = items;
	},


	getTranscriptForVideo: function(id, transcriptStore){
		var s = transcriptStore.findRecord('associatedVideoId', id);
	},


	setupNoteOverlay: function(){
		var me = this;
		this.noteOverlay = Ext.widget('presentation-note-overlay', {reader: this, readerHeight: this.getHeight()});
		Ext.each(this.items.items, function(vt){
			me.noteOverlay.registerReaderView(vt);
		});

		this.fireEvent('reader-view-ready');
	},


	afterRender: function(){
		this.callParent(arguments);
		this.setupNoteOverlay();
		this.selectInitialSlide();
	},


	selectInitialSlide: function(){
		var startOn = this.startOn,
			s = this.query('slide-component'),
			slideCmp, images = [], me = this,
			targetImageEl;

		Ext.each(s, function(i){
			var id = i.slide.get('NTIID');
			if(id === startOn){
				targetImageEl = i.el.down('img.slide');
			}
			images.push(i.el.down('img.slide'));
		});

		this.el.mask('Loading....', 'loading');

		Ext.each(images, function(i){
			me.mon(i, {
				scope: me,
				'load': function(){
					Ext.Array.remove(images, i);
					if(images.length === 0){
						me.el.unmask();
						if(targetImageEl){
							console.log('should scroll into view: ', targetImageEl.dom);
							Ext.defer(function(){
								targetImageEl.scrollIntoView(me.getTargetEl(), false, {listeners:{}});
							}, 10, me);
						}
					}
				}
			});
		});
	},


	syncWithVideo: function(videoState){
//		this.transcriptView.syncTranscriptWithVideo(videoState);
	}

});