Ext.define('NextThought.view.slidedeck.media.GridView', {
	extend: 'Ext.view.View',
	alias: 'widget.media-grid-view',

	requies: ['NextThought.model.resolvers.VideoPosters'],


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
                            {tag: 'tpl', 'if': 'progress', cn: [
                                {tag: 'span', html: '{progress}'}
                            ]}
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

		var lineage = ContentUtils.getLineage(this.getSource().get('NTIID')),
			location = ContentUtils.getLocation(lineage.last()),
			title = location.title;

		//if we can determine bundle to use its outline to order by
		//use it, otherwise just use the video index
		wait()
			.then(this.getBundleOutline.bind(this))
			.then(this.fillInFromOutline.bind(this, title))
			.fail(this.getVideoData.bind(this, title));

		this.setLocationInfo(location);

		this.on({
			itemclick: function(cmp, record, item) {
				var selectionChanged = cmp.getSelectedNodes()[0] !== item;

				if (!selectionChanged) {
					cmp.fireEvent('hide-grid');
					return;
				}

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


	fillInFromOutline: function(title, navStore) {
		Library.getVideoIndex(title)
			.then(this.applyNavigationData.bind(this, navStore));
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


	applyNavigationData: function(navStore, data) {
		var me = this,
			reader = Ext.data.reader.Json.create({model: NextThought.model.PlaylistItem}),
			currentId = me.source.get('NTIID'),
			selected,
			videos = [];

		function fillIn(ids) {
			var i, v;

			for (i = 0; i < ids.length; i++) {
				v = NextThought.model.PlaylistItem(data[ids[i]]);
				v.NTIID = v.ntiid;

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

				fillIn(videoIds);
			}
		});

		me.store = new Ext.data.Store({
			model: NextThought.model.PlaylistItem,
			proxy: 'memory',
			data: videos
		});

		me.store.each(function(record) {
			me.getThumbnail(record);
		});

		me.bindStore(me.store);

        me._currentProgress = navStore.courseInstance.getVideoProgress();
        me.__updateProgress();

		me.fireEvent('store-set', me.store);

		selected = me.store.getById(currentId);

		if (selected) {
			me.getSelectionModel().select(selected, false, true);
		}
	},


	applyVideoData: function(data) {
		//data is a NTIID->source map
		var me = this,
			reader = Ext.data.reader.Json.create({model: NextThought.model.PlaylistItem}),
			selected = me.getSource().get('NTIID'),
			sections = {},
			videos = [],
			fillingIn = [];

		function iter(key) {
			var v = data[key], section;
			if (key !== v.ntiid) {
				console.error(key, '!=', v);
			}

			//get the ntiid of the section to key the groups by
			section = ContentUtils.getLineage(key)[1];

			//get the label to show to the user
			return ContentUtils.getLineageLabels(key)
				.then(function(labels) {
					var label = labels[1];

					if (!sections.hasOwnProperty(section)) {
						sections[section] = NextThought.model.PlaylistItem({section: label, sources: []});
						videos.push(sections[section]);
					}

					videos.push(reader.read(Ext.apply(v, {
						NTIID: v.ntiid,
						section: section
					})).records[0]);

					if (key === selected) {
						selected = videos.last();
					}

				});
		}

		fillingIn = data._order.map(iter);

		Promise.all(fillingIn)
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

				me.bindStore(me.store);

                me.__updateProgress();

				me.fireEvent('store-set', me.store);
				if (!Ext.isString(selected)) {
					me.getSelectionModel().select(selected, false, true);
				}
			});
	},
	//</editor-fold>


    __updateProgress: function(){
        var currentProgress = this.__getCurrentProgress(), me = this;

        this.__getCurrentProgress()
            .then(function(progress){
                me.store.each(function(r){
                    if(progress.hasBeenViewed(r.get("id"))){
                        r.set("progress", "viewed");
                    }
                });
            })
            .fail(function(reason){
                console.error("Could not load the video progress: " + reason);
            });
    },


	fireSelection: function() {
		var rec = this.getSelectionModel().getSelection().first(),
			li = this.getLocationInfo();

		//console.log('Change video to:', rec);
		Ext.defer(this.fireEvent, 1, this, ['change-media-in-player', rec.raw, rec.get('NTIID'), getURL(li.root)]);
	},


    adjustOnResize: function(availableWidth, availableHeight){}
});
