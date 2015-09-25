export default Ext.define('NextThought.app.mediaviewer.components.Grid', {
	extend: 'Ext.view.View',
	alias: 'widget.media-grid-view',

	requies: [
		'NextThought.model.resolvers.VideoPosters',
		'NextThought.app.library.Actions'
	],

	//<editor-fold desc="Config">
	config: {
		source: null,
		locationInfo: null
	},

	selModel: {
		allowDeselect: false,
		toggleOnClick: false,
		deselectOnContainerClick: false
	},

	preserveScrollOnRefresh: true,

	ui: 'media-viewer-grid',
	trackOver: true,
	overItemCls: 'over',
	selectedItemCls: 'selected',

	itemSelector: '.item',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
			{ tag: 'tpl', 'if': 'this.is(values)', cn: { cls: 'item heading', cn: [
				{ tag: 'tpl', 'if': 'this.splitNumber(values)', cn: ''},
				{ tag: 'span', cls: 'number', html: '{number}'},
				{ tag: 'span', cls: 'name', html: '{section}'}
			] } },
			{ tag: 'tpl', 'if': '!this.is(values)', cn: [
				{ cls: 'item video {progress}', cn: [
					{ cls: 'thumbnail', style: { backgroundImage: 'url({[this.thumb(values.sources)]})'} },
					{ cls: 'meta', cn: [
						{ cls: 'title', html: '{title}' },
						{ cls: 'info', cn: [
            //							{ tag: 'span', html: '{duration}'},
            //							{ tag: 'span', html: '{comments:plural("Comment")}'}
						] }
					] }
				] }
			] }
		] }
	), {
		is: function(values) {
			return values.sources.length === 0;
		},

		splitNumber: function(values) {
			var s = (values.section || '').split(' '),
				number = s.shift(),
				numberVal = parseFloat(number),
				section = s.join(' ');

			if (!isNaN(numberVal) && isFinite(numberVal)) {
				values.number = number;
				values.section = section;
			}
		},

		thumb: function(sources) {
			return sources[0].thumbnail;
		}
	}),
	//</editor-fold>


	//<editor-fold desc="Setup">
	initComponent: function() {
		this.callParent(arguments);

		this.LibraryActions = NextThought.app.library.Actions.create();

		this.on({
			itemclick: function(cmp, record, item) {
				var selectionChanged = cmp.getSelectedNodes()[0] !== item;

				if (!selectionChanged) {
					cmp.fireEvent('hide-grid');
					return;
				}
				cmp.fireEvent('toggl-grid');
				this.fromClick = true;
			},
			beforeselect: function(s, r) {
				var pass = r.get('sources').length > 0,
					store = s.getStore(),
					last = s.lastSelected || store.first(),
					next;

				if (this.fromKey && !pass) {
					last = store.indexOf(last);
					next = store.indexOf(r);
					next += ((next - last) || 1);

					//do the in the next event pump
					Ext.defer(s.select, 1, s, [next]);
				}
				return pass;

			},
			select: function(s, r) {
				var node = this.getNodeByRecord(r),
					ct = this.el.getScrollingEl();
				if (node && Ext.fly(node).needsScrollIntoView(ct)) {
					node.scrollIntoView(ct, false, {});
				}
				if (this.fromClick) {
					this.fireSelection();
				}
				delete this.fromClick;
				delete this.fromKey;
			}
		});
	},

	setContent: function(source, bundle){
		var me = this;

		me.source = source;
		if(me.currentBundle !== bundle) {
			me.__bundleChanged(bundle);
		}
		else {
			ContentUtils.getLineage(source.get('NTIID'), bundle)
				.then(function(lineages) {
					var lineage = lineages[0];
					ContentUtils.getLocation(lineage.last(), bundle)
						.then(function (location) {
							me.setLocationInfo(location);
						});
				});

			// Since the bundle didn't change but the current video changed,
			// firing store-set will trigger setting next and previous video
			me.fireEvent('store-set', me.store);

			me.__scrollSelectedIntoView();
		}
	},

	__bundleChanged: function(bundle) {
		var me = this;

		me.currentBundle = bundle;
		Promise.all([
			me.getBundleOutline(),
			me.LibraryActions.getVideoIndex(me.currentBundle)
		])
			.then(me.fillInData.bind(me));

		ContentUtils.getLineage(me.source.get('NTIID'), bundle)
			.then(function(lineages) {
				var lineage = lineages[0];
				ContentUtils.getLocation(lineage.last(), bundle)
					.then(function (location) {
						me.setLocationInfo(location);
					});
			});		
	},


	__scrollSelectedIntoView: function() {
		if(!this.rendered) { return; }

		var r = this.getSelectionModel().getLastSelected(),
			node = r && this.getNodeByRecord(r),
			ct = this.el && this.el.getScrollingEl();

		if (node && Ext.fly(node).needsScrollIntoView(ct)) {
			node.scrollIntoView(ct, false, {});
		}
	},


	getBundleOutline: function() {
		var catalog, load;

		//if we were passed a bundle to use
		if (this.currentBundle) {
			load = this.currentBundle.getNavigationStore().building;
		//else if we can find a course for the source
		} else {
			catalog = CourseWareUtils.courseForNtiid(this.source.getId());

			if (!catalog) {
				load = Promise.reject();
			} else {
				load = CourseWareUtils.findCourseBy(catalog.findByMyCourseInstance())
						.then(function(course) {
							course = course.get('CourseInstance') || course;

							return course.getNavigationStore().building;
						});
			}
		}

		return load;
	},


    __getCurrentProgress: function(){
        return this._currentProgress || Promise.reject();
    },


	processSpecialEvent: function(e) {
		var k = e.getKey();
		if (k === e.SPACE || k === e.ENTER) {
			this.fireSelection();
		}
	},


	beforeRender: function() {
		this.callParent();
		var me = this, s = this.getSelectionModel();
		s.onNavKey = Ext.Function.createInterceptor(s.onNavKey, function() {
			me.fromKey = true;
		});
		if (Ext.is.iOS) {
			this.addCls('scrollable');
		}
	},


    afterRender: function(){
        this.callParent(arguments);

        this.on('refresh', this.__updateProgress, this);
    },


	getVideoData: function(title) {
		Library.getVideoIndex(title).then(this.applyVideoData.bind(this));
	},


	getThumbnail: function(video) {
		var source = video.get('sources')[0],
			thumbnail = source && source.thumbnail;

		if (!thumbnail && source) {
			NextThought.model.resolvers.VideoPosters.resolveForSource(source)
				.then(function(obj) {
					source.thumbnail = obj.thumbnail;

					video.set('sources', [source]);
				});
		}
	},


	fillInData: function(results) {
		var navStore = results[0],
			videos = results[1];

		this.applyVideoData(videos, navStore);
	},


	applyVideoData: function(data, navStore) {
		//data is a NTIID->source map
		var me = this,
			reader = Ext.data.reader.Json.create({model: NextThought.model.PlaylistItem}),
			selected = me.getSource().get('NTIID'),
			sections = {},
			videos = [];


		function fillIn(ids, section) {
			var i, v;

			for (i = 0; i < ids.length; i++) {
				v = NextThought.model.PlaylistItem(data[ids[i]]);
				v.NTIID = v.ntiid;
				v.section = section && section.getId();
				videos.push(v);
			}
		}

		//go through the navigation store and add the videos in order
		//the lessons they appear in do
		navStore.each(function(node) {
			if (node.get('type') !== 'lesson') { return; }

			var videoIds = data.containers[node.getId()];

			if (videoIds && videoIds.length) {
				videos.push(NextThought.model.PlaylistItem({
					section: node.get('label'),
					sources: []
				}));

				fillIn(videoIds, node);
			}
		});

		Promise.resolve(videos)
			.then(function(results) {
				me.store = new Ext.data.Store({
					model: NextThought.model.PlaylistItem,
					proxy: 'memory',
					data: videos,
					sorters: [
						//Globals.getNaturalSorter('section'),
						//Globals.getNaturalSorter('title')
					]
				});
				
				me.store.each(function(record) {
			         me.getThumbnail(record);
		        });

				me.bindStore(me.store);

                me.__updateProgress();

				me.fireEvent('store-set', me.store);
				if (!Ext.isString(selected)) {
					me.getSelectionModel().select(selected, false, true);
				}
			});
	},


    __updateProgress: function(){
        var me = this;

        this.__getCurrentProgress()
            .then(function(progress){
                me.store.each(function(r){
                    if(r.get('NTIID') && progress.hasBeenViewed(r.get('NTIID'))){
                        r.set("progress", "viewed");
                    }
                });
            })
            .fail(function(reason){
                console.log("Could not load the video progress: " + reason);
            });
    },


	fireSelection: function() {
		var rec = this.getSelectionModel().getSelection().first(),
			li = this.getLocationInfo(), 
			slidedeckId = rec && rec.get('slidedeck'),
			section = rec && rec.get('section'),
			route = section && ParseUtils.encodeForURI(section) + '/video/' + ParseUtils.encodeForURI(rec.getId()),
			isVideo = true;

		if (!Ext.isEmpty(slidedeckId)) {
			route = section && ParseUtils.encodeForURI(section) + '/slidedeck/' + ParseUtils.encodeForURI(slidedeckId);
			isVideo = false;
		}

		if (this.ownerCt && this.ownerCt.handleNavigation && !Ext.isEmpty(route)) {
			this.ownerCt.handleNavigation(rec.get('title'), route, {video: isVideo ? rec : null, basePath: getURL(li.root)});
		}
	},


    adjustOnResize: function(availableWidth, availableHeight){}
});
