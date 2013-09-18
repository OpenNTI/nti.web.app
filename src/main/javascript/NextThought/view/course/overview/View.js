Ext.define('NextThought.view.course.overview.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',
	ui: 'course',
	cls: 'course-overview scrollable',

	requires: [
		'NextThought.view.course.overview.parts.*'
	],

	mixins:{
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	autoScroll: true,

	SECTION_TITLE_MAP: {
		'video': 'Videos',
		'discussions': 'Discussions',
		'additional': 'Additional Resources',
		'required': 'Required Resources',
		'assessments': 'Assessments'
	},


	SECTION_TYPE_MAP: {
		'course-overview-ntivideo': 'video',
		'course-overview-content': 'additional',
		'course-overview-discussion': 'discussions',
		'course-overview-externallink': 'additional',
		'course-overview-naquestionset': 'assessments'
	},


	SECTION_CONTAINER_MAP: {
		'video': 'course-overview-video-section',
		'discussions': 'course-overview-section',
		'additional': 'course-overview-section',
		'required': 'course-overview-section',
		'assessments': 'course-overview-section'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.mixins.customScroll.constructor.call(this);
	},


	getSelectionModel: DelegateFactory.getDelegated(),


	beforeRender: function () {
		this.callParent(arguments);

		var s = this.getSelectionModel();
		this.mon(s, 'select', 'onNodeSelected', this);
		if (s.hasSelection()) {
			this.onNodeSelected(s, s.getSelection()[0]);
		}
	},


	clear: function () {
		this.removeAll(true);
		delete this.currentPage;
	},


	onNodeSelected: function (s, r) {
		var me = this,
			SECTION_CONTAINER_MAP = me.SECTION_CONTAINER_MAP,
			SECTION_TYPE_MAP = me.SECTION_TYPE_MAP,
			SECTION_TITLE_MAP = me.SECTION_TITLE_MAP,
			locInfo,
			items = [],
			sections = {};
		//console.debug('Select???',arguments);

		if (!r || r.getId() === me.currentPage) {
			return;
		}

		locInfo = ContentUtils.getLocation(r.getId());

		me.clear();

		me.currentPage = r.getId();

		Ext.each(r.getChildren(), function (i) {
			var c, t;
			if (i.getAttribute('suppressed') === "true") {
				return;
			}

			i = me.getComponentForNode(i, locInfo, r);
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

		me.add([
			{xtype: 'course-overview-header', record: r}
		].concat(items));
	},


	getComponentForNode: function (node, info, rec) {
		var type = node && node.nodeName,
			section = (node && node.getAttribute('section')) || null;

		if (/^content:related$/i.test(type) || /^object$/i.test(type)) {
			type = node.getAttribute('type') || node.getAttribute('mimeType');
			type = type && type.replace(/^application\/vnd\.nextthought\./, '');
		}

		type = type && ('course-overview-' + type.toLowerCase());

		if (type && Ext.ClassManager.getByAlias('widget.' + type)) {
			return {xtype: type, node: node, locationInfo: info, courseRecord: rec, sectionOverride: section};
		}

		if (this.self.debug) {
			console.warn('Unknown overview type:', type, node);
		}
		return null;
	}

});
