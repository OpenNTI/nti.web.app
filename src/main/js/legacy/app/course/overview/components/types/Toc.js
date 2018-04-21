const Ext = require('@nti/extjs');

const Video = require('legacy/model/Video');
const VideoRoll = require('legacy/model/VideoRoll');
const {getString} = require('legacy/util/Localization');

require('../parts/ContentLink');
require('../parts/Discussion');
require('../parts/Header');
require('../parts/IframeWindow');
require('../parts/Poll');
require('../parts/QuestionSet');
require('../parts/Section');
require('../parts/Spacer');
require('../parts/Survey');
require('../parts/Timeline');
require('../parts/Topic');
require('../parts/Video');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.types.Toc', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-types-toc',

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

	initComponent: function () {
		this.callParent(arguments);

		this.buildFromToc(this.record, this.locInfo, this.assignments, this.course);
	},

	setProgress: function (progress) {
		this.items.each(function (item) {
			if (item.setProgress) {
				item.setProgress(progress);
			}
		});
	},

	setCommentCounts: function (commentCounts) {
		this.items.each(function (item) {
			if (item.setCommentCounts) {
				item.setCommentCounts(commentCounts);
			}
		});
	},

	buildFromToc: function (node, locInfo, assignments, course) {
		var me = this,
			SECTION_CONTAINER_MAP = me.SECTION_CONTAINER_MAP,
			SECTION_TYPE_MAP = me.SECTION_TYPE_MAP,
			SECTION_TITLE_MAP = me.SECTION_TITLE_MAP,
			sections = {},
			children = this.collapseVideos(node.getChildren()),
			items = [];

		Ext.each(children, function (i) {
			var c, t;

			if (i.isModel) {
				items.push(me.getComponentForRecord(i));
			} else {
				if (i.getAttribute('suppressed') === 'true') {
					return;
				}

				if (/^object$/i.test(i.tagName) && i.getAttribute('mimeType') === 'application/vnd.nextthought.relatedworkref') {
					return;
				}



				i = me.getComponentForNode(i, locInfo, node, assignments, course);
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
								c.items.push({xtype: 'course-overview-video', items: [], course: course});
							}
							c = c.items[0];
						}

						c.items.push(i);
					}
					else {
						items.push(i);
					}

				}
			}
		});

		this.add([{xtype: 'course-overview-header', record: node}].concat(items));
	},

	getComponentForNode: function (node, info, rec, assignments, course) {
		var type = node && node.nodeName,
			section = (node && node.getAttribute('section')) || null,
			assignment, cls;

		if (/^content:related$/i.test(type) || /^object$/i.test(type)) {
			type = node.getAttribute('type') || node.getAttribute('mimeType');
			type = type && type.replace(/^application\/vnd\.nextthought\./, '');
		}

		type = type && ('course-overview-' + type.toLowerCase());
		cls = Ext.ClassManager.getByAlias('widget.' + type);

		if (cls) {
			if (cls && cls.isAssessmentWidget) {
				assignment = assignments.isAssignment(node.getAttribute('target-ntiid'));
				type = assignment ? 'course-overview-assignment' : type;
				assignment = assignments.getItem(node.getAttribute('target-ntiid'));
			}

			return {
				xtype: type,
				node: node,
				locationInfo: info,
				courseRecord: rec,
				sectionOverride: section,
				assignment: assignment,
				course: course,
				navigate: this.navigate.bind(this)
			};
		}

		if (this.self.debug) {
			console.warn('Unknown overview type:', type, node);
		}
		return null;
	},

	getComponentForRecord: function (rec) {
		var config;

		if (rec instanceof VideoRoll) {
			config = {
				xtype: 'course-overview-videoroll',
				record: rec,
				course: this.course,
				navigate: this.navigate,
				locationInfo: this.locInfo
			};
		} else if (rec instanceof Video) {
			config = {
				xtype: 'course-overview-video',
				record: rec,
				course: this.course,
				locationInfo: this.locInfo,
				navigate: this.navigate
			};
		}

		return config;
	},

	collapseVideos: function (nodes) {
		var me = this,
			children;

		children = nodes.reduce(function (acc, item, index, arr) {
			var last = acc.last(),
				next = index < (arr.length - 1) ? arr[index + 1] : null;

			if (item.getAttribute('mimeType') === 'application/vnd.nextthought.ntivideo') {
				if (last && last.mimeType === 'application/vnd.nextthought.videoroll') {
					var video = me.createVideo(item);

					last.addVideo(video);
				} else if (next && next.getAttribute('mimeType') === 'application/vnd.nextthought.ntivideo') {

					acc.push(VideoRoll.create({
						Items: [me.createVideo(item)]
					}));
				} else {
					acc.push(me.createVideo(item));
				}
			} else {
				acc.push(item);
			}

			return acc;
		}, []);

		return children;
	},

	createVideo: function (node) {
		var ntiid = node.getAttribute('ntiid'),
			item = this.videoIndex[ntiid];

		return Video.create({
			'label': node.getAttribute('label'),
			'title': item.title || node.getAttribute('label'),
			'mediaId': item.title || node.getAttribute('label'),
			'sources': item.sources || [],
			'NTIID': ntiid,
			'slidedeck': item.slidedeck || '',
			'poster': item.poster || node.getAttribute('poster'),
			'transcripts': item.transcripts
		});
	}
});
