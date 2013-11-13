Ext.define('NextThought.view.courseware.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course',
	ui: 'course',
	requires: [
		'NextThought.view.courseware.outline.View',
		'NextThought.view.courseware.overview.View'
	],


	navigation: {xtype: 'course-outline'},
	body: {xtype: 'course-overview', delegate: ['course course-outline']},


	initComponent: function() {
		this.callParent(arguments);
		this.on('select-card-node', 'openCardNode', this);
	},


	onNavigateComplete: function(pageInfo) {
		if (!pageInfo || !pageInfo.isPartOfCourse()) {
			this.navigation.clear();
			this.body.clear();
			return;
		}

		var l = pageInfo && ContentUtils.getLocation(pageInfo),
			t = l && l.title,
			course = t && t.getId();

		if (this.currentCourse !== course) {
			this.fireEvent('courseChanged', pageInfo, course);
			this.currentCourse = course;
			this.store = course ? new NextThought.store.courseware.Navigation({data: l.toc}) : undefined;
		}

		this.navigation.maybeChangeStoreOrSelection(pageInfo, this.store);
	},

	makeListenForCourseChange: function(monitors) {
		Ext.each(monitors, function(m) {
			m.mon(this, 'courseChanged', 'onCourseChanged');
		}, this);
	},

	// Add a way to explicitly select a card node rather
	// than going through the originalNTIIDRequested Hack
	openCardNode: function(ntiid) {
		var card, i;

		Ext.each(this.query('content-card'), function(crd) {
			i = crd.data && crd.data.ntiid;
			if (i === ntiid) {
				card = crd;
				return false;
			}
		});

		if (card && card.navigateToTarget) {
			card.navigateToTarget();
		}

	}

});
