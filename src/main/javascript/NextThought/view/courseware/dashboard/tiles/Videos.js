Ext.define('NextThought.view.courseware.dashboard.tiles.Videos', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-videos',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish) {
			var f = 'object[mimeType$=ntivideo]',
				DQ = Ext.DomQuery,
				videos = [], seen = {},
				store = this.getCourseNavStore(courseNodeRecord), r, i, len, c;

			function addDate(r) {
				if (/^videos$/i.test(r.get('label'))) {
					console.warn('Super HACK filter! dropping VIDEOS "lesson"', r);
					return Ext.emptyFn;
				}

				return function(n) {
					var id = n.getAttribute('ntiid');
					if (r) {
						//this will only be referenced within THIS class/file. WARNING: VERY PRIVATE
						n.NTCourseNode = r;
					}

					if (!seen[id]) {
						seen[id] = true;
						videos.push(n);
					} else {
						console.warn(r, 'has dups');
					}
				};
			}

			if (store) {
				i = store.indexOf(courseNodeRecord);
				len = store.getCount();
				for (i; i < len; i++) {
					r = store.getAt(i);
					Ext.each(DQ.filter(r.getChildren() || [], f), addDate(r));
				}
			}

			if (!Ext.isEmpty(videos)) {
				c = this.create({lastModified: courseNodeRecord.get('date'), sources: videos, locationInfo: locationInfo});
			}

			//console.debug('Giving dashboard:',c);
			Ext.callback(finish, null, [c]);
		}

	},

	config: {
		cols: 6,
		rows: 4,
		baseWeight: 10,
		sources: []
	},


	//Effectively disable, I know we aren't really deprecating them, but rather just blocking them.
	add: Ext.deprecated('This component is not meant to be handled like a container.'),
	remove: Ext.deprecated('This component is not meant to be handled like a container.'),


	afterRender: function() {
		this.callParent(arguments);

		var items = [],
			l = this.getLocationInfo();

		Ext.each(this.getSources(), function(s) {
			var rec = s.NTCourseNode;
			delete s.NTCourseNode;
			items.push({node: s, locationInfo: l, courseRecord: rec});
		});

		this.content = Ext.widget({
			xtype: 'course-overview-video-section',
			floatParent: this,
			playerWidth: 711,
			renderTo: this.el,
			items: items,
			cls: 'dashboard-videos',
			leaveCurtain: true,
			tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [{
					cls: 'video-row',
					cn: [
						{ cls: 'poster', style: { backgroundImage: 'url({thumb})'} },
						{ cls: 'meta', cn: [
							{ cls: 'date', html: '{date:date("l, F j")}' },
							{ cls: 'label', html: '{label}', 'data-qtip': '{label:htmlEncode}' }
						]}
					]
				}]}),
			listeners: {
				scope: this,
				'destroy': 'widgetDestroyed'
			},
			xhooks: {
				showCurtain: function() {
					this.callParent(arguments);
					this.removeCls('hide-list playing');
				}
			}
		});

		this.mon(this.content, {
			//'player-command-play':'onPlayerPlay',
			//'player-command-stop':'onPlayerStop',
			//'player-command-pause':'onPlayerStop',
			'player-event-play': 'onPlayerPlay',
			'player-event-pause': 'onPlayerPause',
			'player-event-ended': 'onPlayerStop',
			'player-error': 'onPlayerStop',
			buffer: 10
		});
	},

	widgetDestroyed: function() {
		if (!this.isDestroyed && !this.destroying) {
			//WARNING: this is not the #add() you seek. Calling the super only in the error case that our intended view
			// was destroyed.
			this.superclass.add.call(this, {
				xtype: 'box',
				autoEl: {
					cls: 'no-videos',
					cn: [
						{ cls: 'message', html: 'Videos are unavailable at this time.' },
						{ cls: 'subtext', html: 'Please try again later.'}
					]
				}
			});
		}
	},


	onPlayerPlay: function() {
		this.content.addCls('hide-list playing');
	},


	onPlayerPause: function() {
		this.content.removeCls('hide-list');
	},

	onPlayerStop: function() {
		this.content.removeCls('hide-list playing');
	}
});
