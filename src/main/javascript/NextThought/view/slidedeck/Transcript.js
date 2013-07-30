Ext.define('NextThought.view.slidedeck.Transcript', {
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-transcript',
	requires:[
		'NextThought.layout.component.Natural',
		'NextThought.util.Store',
		'NextThought.view.video.transcript.Transcript',
		'NextThought.view.content.reader.NoteOverlay',
		'NextThought.view.slidedeck.transcript.NoteOverlay',
		'NextThought.view.slidedeck.transcript.Slide',
		'NextThought.view.annotations.renderer.Manager',
		'NextThought.view.annotations.View'
	],

	ui:'transcript',
	cls:'transcript-view',
	items:[],


	initComponent: function(){
		//TODO: this needs to be more centralized.
		if(this.slideStore){
			this.buildPresentationTimeLine(this.slideStore, this.transcriptStore);
			this.hasSlides = true;
		}
		if(this.transcript){
			this.setupSingleTranscript(this.transcript);
			this.hasSlides = false;
		}
		this.callParent(arguments);
	},


	setupSingleTranscript: function(transcript){
		var items = [];
		items.push({
			xtype:'video-transcript',
			flex:1,
			transcript: transcript,
			layout:{
				type:'vbox',
				align: 'stretch'
			}
		});

		this.items = items;
	},


	buildPresentationTimeLine: function(slideStore, transcriptStore){
		var items = [];

		slideStore.each(function(slide){
			var m = slide.get('media'),
				vid = m && m.getAssociatedVideoId(),
				t = transcriptStore.findRecord('associatedVideoId', vid, 0, false, true, true),
				start = slide.get('video-start'),
				end = slide.get('video-end');

			console.log('slide starts: ', start, ' slide ends: ', end, ' and has transcript for videoid: ', t && t.get('associatedVideoId'));

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
	},


	afterRender: function(){
		this.callParent(arguments);
		this.setupNoteOverlay();
		if(this.hasSlides){
			this.selectInitialSlide();
		}
		this.mon(this.el, {
			scope:this,
			'mousedown': 'mayBeHideAnnotationView'
		});
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
	},


	showAnnotations: function(annotations, line){
		if(!annotations || annotations.getCount()=== 0){
			return;
		}

		// NOTE: annotations that we get may not share the same store
		// since right now we mix transcript with slides and slides have a different store.
		// However, we're making an assumptions that records on the same line WILL share the same store.
		var s = annotations.getAt(0).store;

		StoreUtils.fillInUsers(s,s.getRange());

		s.removeFilter('lineFilter');
		if(line){
			s.addFilter({
				id: 'lineFilter',
				filterFn: function(r){
					return r.get('line') === line;
				}
			});
		}
		s.sort();

		this.showAnnotationView(s);
	},


	showAnnotationView: function(store){
		if(!this.annotationView){
			this.annotationView = Ext.widget('annotation-view',{
				floating:true,
				border:false,
				width:400,
				shadow:false,
				constrain:true,
				renderTo: Ext.getBody(),
				cls:'presentation-note-slider annotation-view',
				title: 'Discussion',
				iconCls: 'discus',
				discussion:true,
				store: 'ext-empty-store',
				anchorComponent: this,
				anchorComponentHooks: this.getViewerHooks()
			});
		}

		this.annotationView.bindStore(store);
		this.annotationView.show();
		this.on('destroy', 'destroy',this.annotationView);
	},


	mayBeHideAnnotationView: function(e){
		if(!this.annotationView || !this.annotationView.isVisible()){
			return true;
		}
		if(!e.getTarget('.annotation-view') && this.annotationView.isVisible()){
			this.annotationView.hide();
		}
		return true;
	},


	getDocumentElement: function(){
		console.log('should return doc element');
		return this.el.dom.ownerDocument;
	},


	getCleanContent: function(){
		return this.el.dom;
	},


	getViewerHooks: function(){
		return {
			'resizeView': function(){
				var reader = this.reader,
					w = reader.getWidth() - reader.annotationView.getWidth() - 20,
					h = reader.annotationView.getHeight(),
					pos = reader.annotationView.getPosition(),
					minWidth = 575;

				w = w > minWidth ? w : minWidth;
				pos[0] = (pos[0] - w > 0) ? (pos[0] - w) : 0;
				pos[0] += 10;
				pos[1] += 10;
				this.setPosition(pos);
				this.setWidth(w);
				this.setHeight(h);
				Ext.defer(this.el.setStyle, 10, this.el, ['z-index','20000']);
			}
		};
	}

});
