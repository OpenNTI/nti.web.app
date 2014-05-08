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
		'video': getString('NextThought.view.courseware.overview.View.video'),
		'discussions': getString('NextThought.view.courseware.overview.View.discussion'),
		'additional': getString('NextThought.view.courseware.overview.View.additional'),
		'required': getString('NextThought.view.courseware.overview.View.required'),
		'assessments': getString('NextThought.view.courseware.overview.View.assessment'),
		'session-overview': getString('NextThought.view.courseware.overview.View.session'),
		'assignments': getString('NextThought.view.courseware.overview.View.assignments')
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
		'video': 'course-overview-section',
		'discussions': 'course-overview-section',
		'additional': 'course-overview-section',
		'required': 'course-overview-section',
		'assessments': 'course-overview-section',
		'session-overview': 'course-overview-section',
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
			locInfo,
			course = me.up('course').currentCourse,
			overviewSrc = (r && r.get('src')) || null;

		if (!r || r.getId() === me.currentPage || !course || !course.getAssignments) {
			//show empty state??
			return;
		}

		this.buildingOverwiew = true;
		me.maybeMask();

		locInfo = ContentUtils.getLocation(r.getId());
		me.clear();
		me.currentPage = r.getId();

		if (overviewSrc) {
			overviewSrc = getURL(locInfo.root + overviewSrc);
		}

		Promise.all([
			(overviewSrc && ContentProxy.get(overviewSrc)) || Promise.resolve(null),
			course.getAssignments()
		])
			.then(function(data) {
				var assignments = data && data[1],
					content = data && data[0];

				if (me.currentPage !== r.getId()) {
					return;
				}

				me.removeAll(true);//make sure its a clean slate

				if (!content) {
					me.buildFromToc(r, locInfo, assignments);
				} else {
					content = Ext.decode(content);
					me.buildFromContent(content, r, locInfo, assignments);
				}
			})
			.fail(function(reason) { console.error(reason); })
			.done(me.maybeUnmask.bind(me));
	},


	buildFromContent: function(content, node, locInfo, assignments) {
		console.debug(content);

		function getItems(c) {return c.Items || c.items || [];}
		function getType(i) {return 'course-overview-' + (i.MimeType || i.type || '').split('.').last();}
		function getClass(t) {return t && Ext.ClassManager.getByAlias('widget.' + t);}

		function process(items, item, i, a) {
			var type = getType(item),
				cls = getClass(type),
				assignment, prev;

			if (!cls) {
				console.debug('No component found for:', item);
				return items;
			}

			if (cls.isSection) {
				items.push({
					xtype: type,
					title: item.title,
					type: 'content-driven',
					color: item.accentColor,
					items: getItems(item).reduce(process, [])
				});
			} else {
				Ext.applyIf(item, {
					//too many references to these to make changes to accept all spellings.
					'target-ntiid': item['Target-NTIID'],
					ntiid: item.NTIID
				});
				if (type === 'course-overview-naquestionset') {
					assignment = assignments.isAssignment(item['target-ntiid']);
					type = assignment ? 'course-overview-assignment' : type;
					assignment = assignments.getItem(item['target-ntiid']);
				}

				prev = items.last();
				item = Ext.applyIf({
					xtype: type,
					locationInfo: locInfo,
					courseRecord: node,
					assignment: assignment
				}, item);

				if (cls.buildConfig) {
					item = cls.buildConfig(item, prev);
				}

				if (item) {
					items.push(item);
				}
			}
			return items;
		}

		var items = getItems(content).reduce(process, []);

		this.add([{xtype: 'course-overview-header', title: content.title, record: node}].concat(items));
	},


	buildFromToc: function(node, locInfo, assignments) {
		var me = this,
			SECTION_CONTAINER_MAP = me.SECTION_CONTAINER_MAP,
			SECTION_TYPE_MAP = me.SECTION_TYPE_MAP,
			SECTION_TITLE_MAP = me.SECTION_TITLE_MAP,
			sections = {},
			items = [];

		Ext.each(node.getChildren(), function(i) {
			var c, t, p;
			if (i.getAttribute('suppressed') === 'true') {
				return;
			}

			if (/^object$/i.test(i.tagName) && i.getAttribute('mimeType') === 'application/vnd.nextthought.relatedworkref') {
				return;
			}

			i = me.getComponentForNode(i, locInfo, node, assignments);
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

					if (t === 'video') {
						if (c.items.length === 0) {
							c.items.push({xtype: 'course-overview-video', items: []});
						}
						c = c.items[0];
					}

					c.items.push(i);
				}
				else {
					items.push(i);
				}

			}
		});

		this.add([{xtype: 'course-overview-header', record: node}].concat(items));
	},


	maybeMask: function() {
		var el = this.rendered && Ext.get('course-nav');
		if ((!el || !el.dom) && this.buildingOverwiew) {
			this.on({single: true, afterrender: 'maybeMask'});
			return;
		}
		el.mask(getString('NextThought.view.courseware.overview.View.loading'), 'loading');
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
	},


	updateAssessments: function(questionSet) {
		var assessments = this.query('course-overview-naquestionset');

		(assessments || []).forEach(function(a) {
			a.fillInAssessmentAttempt(questionSet);
		});
	}
});
