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

	lineFilterId: 'plinefilter',


	initComponent: function(){
		this.enableBubble(['presentation-parts-ready', 'no-presentation-parts']);

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

		this.cmpMap = {};

        if(!this.slideStore && !this.transcript){
           this.hasNoPresentationParts = true;
        }
		this.fireEvent('uses-page-stores', this);

		this.fireEvent('listens-to-page-stores', this, {
			scope: this,
			add: 'onStoreEventsAdd',
			remove: 'onStoreEventsRemove'
		});

		Ext.EventManager.onWindowResize(function(){
			this.fireEvent('sync-height');
		},this,{buffer: 250});

		this.on('resize', function(){
			this.fireEvent('sync-height');
		}, this);
	},


    beforeRender: function(){
        this.callParent(arguments);
        if(this.hasNoPresentationParts){
            this.fireEvent('no-presentation-parts', this);
        }
    },


	bindStoreToComponents: function(store, cmps){

		this.cmpMap[store.containerId] = cmps;

		Ext.Array.each(cmps, function(cmp){
			this.fireEvent('register-records', store, store.getRange(), cmp);
			cmp.bindToStore(store);
		});

		if(this.record){
			var r, sEl, memoryStore;
			//Loop the components looking for something that knows where
			//this.record is
			Ext.Array.each(cmps, function(cmp){
				r = this.noteOverlay.rangeForDescription(this.record, cmp, cmp.getStore());
				return r !== null;
			}, this);

			if(r){
				console.log('Need to scroll to range', r);
				sEl = this.el.getScrollingEl();
				if(sEl){
					sEl.scrollTo('top', RangeUtils.safeBoundingBoxForRange(r).top - sEl.getY());
				}
				memoryStore  = NextThought.store.FlatPage.create();
				memoryStore.add(this.record);
				this.showAnnotations(memoryStore.data, undefined, memoryStore);
                //Select record to open the note viewer.
                this.annotationView.select(this.record, undefined, false);
				delete this.record;
			}

		}
	},

	onStoreEventsAdd:function(store, records){
		var cmps = this.cmpMap[store.containerId || ''];
		if(cmps){
			Ext.Array.each(cmps, function(c){
				this.fireEvent('register-records', store, records, c);
			});
		}
	},


	onStoreEventsRemove: function(store, records){
		var cmps = this.cmpMap[store.containerId || ''];
		if(cmps){
			Ext.Array.each(cmps, function(c){
				this.fireEvent('register-records', store, records, c);
			});
		}
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

		this.ownerCt.hasSlides = this.hasSlides;

		this.setupNoteOverlay();
		this.el.unselectable();
		this.el.mask('Loading....');
		this.maybeLoadData();
		this.mon(this.el, {
			scope:this,
			'mousedown': 'mayBeHideAnnotationView'
		});
	},


	getPartComponents: function(){
		return Ext.Array.filter(this.items.items, function(p){return p!==undefined;});
	},


	maybeLoadData: function(){
		var partCmps = this.getPartComponents(),
			readyMap = {}, me = this;

		function maybeDone(){
			var done = true;
			Ext.Object.each(readyMap, function(k, v){
				if(v === false){
					done = false;
				}
				return done;
			});

			if(done){
				me.ownerCt.slidesReady = true;

				if(me.hasSlides){
					me.selectInitialSlide();
				}

				me.el.unmask();

				me.fireEvent('presentation-parts-ready', me,  me.getPartComponents(), me.startOn);
				me.fireEvent('load-presentation-userdata', me, me.getPartComponents());
			}
		}

		Ext.Array.each(partCmps, function(p){

			//Just in case something we aren't expecting sneaks in.
			if(p.isPresentationPartReady === undefined){
				return;
			}

			if(!p.$presentationUUID){
				p.$presentationUUID = guidGenerator();
			}
			readyMap[p.$presentationUUID] = p.isPresentationPartReady;
			if(p.isPresentationPartReady === false){
				this.mon(p, 'presentation-part-ready', function(sender){
					readyMap[sender.$presentationUUID] = true;
					maybeDone();
				});
			}
		}, this);
		maybeDone();
	},


	selectInitialSlide: function(){
		var startOn = this.startOn,
			s = this.query('slide-component'), me = this,
			targetImageEl;


		Ext.each(s, function(i){
			var id = i.slide.get('NTIID'), img;
			if(id === startOn){
				targetImageEl = i.el.down('img.slide');
			}
		});

		if(targetImageEl){
			console.log('should scroll into view: ', targetImageEl.dom);
			Ext.defer(function(){
				targetImageEl.scrollIntoView(me.getTargetEl(), false, {listeners:{}});
			}, 10, me);
		}
	},


    scrollToStartingTime: function(seconds){
        var cmps = this.getPartComponents(), tEl, me = this, scrollingEl;

        // scroll the component that contains the given time into view.
        Ext.each(cmps, function(part){
            if(part.isTimeWithinTimeRange && part.isTimeWithinTimeRange(seconds)){
                tEl = part.getElementAtTime(seconds);
                scrollingEl = this.el.getScrollingEl();

                if(tEl && scrollingEl){
                    console.log('scrolling into view: ', tEl);
                    scrollingEl.scrollTo('top', tEl.getBox().top - scrollingEl.getY());
                    return false;
                }
            }
        });

        //return target element.
        return tEl;
    },


	selectSlide: function(slide){
		var s = this.query('slide-component'),
			me = this,
			targetImageEl;

		Ext.each(s, function(i){
			var id = i.slide.get('NTIID');

			if(id === slide.getId()){
				targetImageEl = i.el.down('img.slide');
			}
		});

		if(!this.el.isMasked() && targetImageEl){
			Ext.defer(function(){
				targetImageEl.scrollIntoView(me.getTargetEl(), false, {listeners:{}});
			}, 10, me);
		}
	},


	syncWithVideo: function(videoState){
//		this.transcriptView.syncTranscriptWithVideo(videoState);
	},


	showAnnotations: function(annotations, line, s){
		if(!annotations || annotations.getCount()=== 0){
			return;
		}

		if(!s){
			s = NextThought.store.FlatPage.create({
				storeId: 'presentation-annotations-'+line
			});
			annotations.each(function(annotation){
				//Note stores aren't unique here, but flatpage store won't let
				//us bind the same store to it twice.  How convenient..
				s.bind(annotation.store);
			});
		}

		if(line){
			console.log('filtering by line: ', line);
			s.addFilter({
				id: this.lineFilterId,
				filterFn: function(r){
					console.log('rec: ', r.getId(), ' line: ', r.get('line'));
					return r.get('pline')=== line;
				}
			});
		}
		s.sort();

		this.showAnnotationView(s);
	},


	showAnnotationView: function(store){
		if(!this.annotationView){
			this.annotationView = this.add({
				xtype: 'annotation-view',
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

		if(this.annotationView.store.storeId !== store.storeId){
			// NOTE: Make sure we remove lineFilter before this is unbound.
			// otherwise, we end up in a funky state.
			this.annotationView.store.removeFilter(this.lineFilterId);
			this.annotationView.bindStore(store);
		}
		else{
			this.annotationView.refresh();
		}
		this.annotationView.show();
		this.on('resize', function(){
			if(this.isVisible()){
				this.toFront();
			}
		}, this.annotationView);
	},


	destroy: function(){
		if(this.annotationView && this.annotationView.store){
			//Make sure we clear the line filter, since this store could be bound to another view.
			this.annotationView.store.removeFilter(this.lineFilterId);
			this.annotationView.destroy();
		}
		this.callParent(arguments);

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


	getDomContextForRecord: function(r){
		//Find the cmp with our UGD store.
		function fn(cmp){
			var s = cmp.userDataStore;
			return s && s.findRecord('NTIID', r.get('NTIID'));
		}

		var cmps = Ext.Array.filter(this.items.items, fn),
			domFrag, slide, utils, b, node;

		Ext.each(cmps, function(cmp){
			utils = cmp.getAnchorResolver();
			if(cmp.slide){
				domFrag = cmp.slide.get('dom-clone');
				b = utils.doesContentRangeDescriptionResolve(r.get('applicableRange'), domFrag);
				if(b){
					node = cmp.getContextDomNode();
					return false;
				}
			}
			else{
				node = RangeUtils.getContextAroundRange(r.get('applicableRange'), cmp.getDocumentElement(), cmp.getCleanContent(), r.get('ContainerId'));
				if(node){ return false; }
			}
			return true;
		});

		return node;
	},

	//For compliance as a reader.
	getDocumentElement: Ext.emptyFn,
	getCleanContent: Ext.emptyFn,


	getScrollTarget: function(){
		return this.getTargetEl().dom || this.el.dom;
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
			}
		};
	}

});
