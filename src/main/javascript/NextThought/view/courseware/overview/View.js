Ext.define('NextThought.view.courseware.overview.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',
	ui: 'course',
	cls: 'course-overview scrollable',

	requires: [
		'NextThought.view.courseware.overview.parts.*'
	],

	autoScroll: true,

	SECTION_TITLE_MAP: {
		'video': 'Video',
		'discussions': 'Discussions',
		'additional': 'Additional Resources',
		'required': 'Required Resources',
		'assessments': 'Practice Questions',
		'assignments': 'Assignments'
	},


	SECTION_TYPE_MAP: {
		'course-overview-ntivideo': 'video',
		'course-overview-content': 'additional',
		'course-overview-discussion': 'discussions',
		'course-overview-externallink': 'additional',
		'course-overview-naquestionset': 'assessments',
		'course-overview-assignment': 'assignments'
	},


	SECTION_CONTAINER_MAP: {
		'video': 'course-overview-video-section',
		'discussions': 'course-overview-section',
		'additional': 'course-overview-section',
		'required': 'course-overview-section',
		'assessments': 'course-overview-section',
		'assigments': 'course-overview-section'
	},


	getSelectionModel: DelegateFactory.getDelegated(),


	beforeRender: function() {
		this.callParent(arguments);

		var s = this.getSelectionModel();
		if (!s) {
			Ext.log.error('No selection model!');
			return;
		}
		this.mon(s, 'select', 'onNodeSelected', this);
		if (s.hasSelection()) {
			this.onNodeSelected(s, s.getSelection()[0]);
		}
	},


	clear: function() {
		this.removeAll(true);
		delete this.currentPage;
	},


	onNodeSelected: function(s, r) {
		var me = this,
			SECTION_CONTAINER_MAP = me.SECTION_CONTAINER_MAP,
			SECTION_TYPE_MAP = me.SECTION_TYPE_MAP,
			SECTION_TITLE_MAP = me.SECTION_TITLE_MAP,
			locInfo,
			items = [],
			sections = {},
			course = me.up('course').currentCourse;

		//console.debug('Select???',arguments);

		if (!r || r.getId() === me.currentPage || !course || !course.getAssignments) {
			return;
		}

		this.buildingOverwiew = true;
		me.maybeMask();

		locInfo = ContentUtils.getLocation(r.getId());
		me.clear();
		me.currentPage = r.getId();


		course.getAssignments()
			.then(function(assignments) {
				if (me.currentPage !== r.getId()) {
					return;
				}

				Ext.each(r.getChildren(), function(i) {
					var c, t;
					if (i.getAttribute('suppressed') === 'true') {
						return;
					}

					i = me.getComponentForNode(i, locInfo, r, assignments);
					t = i && (i.sectionOverride || SECTION_TYPE_MAP[i.xtype] || 'Unknown');
					if (t) {
						if (i.xtype !== 'course-overview-topic') {
							c = sections[t];
							if (!c) {
								c = sections[t] = {
									xtype: SECTION_CONTAINER_MAP[t] || 'course-overview-section',
									type: t,
									title: SECTION_TITLE_MAP[t] || 'Section ' + t,
									items: []
								};
								items.push(c);
							}
							c.items.push(i);
						}
						else {
							items.push(i);
						}

					}
				});

				me.removeAll(true);//make sure its a clean slate
				me.add([{xtype: 'course-overview-header', record: r}].concat(items));
			})
			.fail(function(reason) { console.error(reason); })
			.done(me.maybeUnmask.bind(me));
	},


	maybeMask: function() {
		var el = this.rendered && Ext.get('course-nav');
		if ((!el || !el.dom) && this.buildingOverwiew) {
			this.on({single: true, afterrender: 'maybeMask'});
			return;
		}
		el.mask('Loading...', 'loading');
	},


	maybeUnmask: function() {
		delete this.buildingOverwiew;
		var el = this.rendered && Ext.get('course-nav');
		if (el && el.dom) {
			el.unmask();
		}
	},


	getComponentForNode: function(node, info, rec, assignments) {
		var type = node && node.nodeName,
			section = (node && node.getAttribute('section')) || null,
			assignment;

		if (/^content:related$/i.test(type) || /^object$/i.test(type)) {
			type = node.getAttribute('type') || node.getAttribute('mimeType');
			type = type && type.replace(/^application\/vnd\.nextthought\./, '');
		}

		type = type && ('course-overview-' + type.toLowerCase());

		if (type === 'course-overview-naquestionset') {
			assignment = assignments.isAssignment(node.getAttribute('target-ntiid'));
			type = assignment ? 'course-overview-assignment' : type;
			assignment = assignments.getItem(node.getAttribute('target-ntiid'));
		}

		if (type && Ext.ClassManager.getByAlias('widget.' + type)) {
			return {xtype: type, node: node, locationInfo: info, courseRecord: rec, sectionOverride: section, assignment: assignment};
		}

		if (this.self.debug) {
			console.warn('Unknown overview type:', type, node);
		}
		return null;
	}

});
