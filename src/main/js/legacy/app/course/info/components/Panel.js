const Ext = require('@nti/extjs');
const { Info } = require('@nti/web-course');
const { encodeForURI } = require('@nti/lib-ntiids');

const ContentProxy = require('legacy/proxy/JSONP');
const CoursesStateStore = require('legacy/app/library/courses/StateStore');

require('./parts/Description');
require('./parts/Instructors');
require('./parts/NotStarted');
require('./parts/Support');
require('./parts/Title');

module.exports = exports = Ext.define(
	'NextThought.app.course.info.components.Panel',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.course-info-panel',
		cls: 'course-info-panel scrollable',
		ui: 'course',
		layout: 'none',

		initComponent: function () {
			this.callParent(arguments);

			this.CourseStore = CoursesStateStore.getInstance();
		},

		onRouteDeactivate() {
			if (!this.rendered) {
				return;
			}

			var videos = this.el.dom.getElementsByTagName('video');

			for (let v of videos || []) {
				v.pause && v.pause();
			}

			this.InfoCmp.onRouteDeactivate();
		},

		onRouteActivate() {
			if (this.InfoCmp) {
				this.InfoCmp.onRouteActivate();
			}
		},

		setContent: async function (
			content,
			status,
			bundle,
			showRoster,
			showReports,
			showAdvanced
		) {
			if (this.activeContent === content) {
				return Promise.resolve();
			}

			this.activeContent = content;
			this.removeAll(true);

			const parsedBundle = bundle
				? await bundle.getInterfaceInstance()
				: null;
			const catalogEntry = await content.getInterfaceInstance();

			var infoCmp = this.up('course-info');

			if (!Ext.isObject(content)) {
				if (Ext.isString(content)) {
					Service.getPageInfo(
						content,
						this.loadPage,
						this.loadPageFailed,
						this
					);
				}
				return;
			}

			if (infoCmp && infoCmp.infoOnly && catalogEntry.IsEnrolled) {
				this.add({
					xtype: 'course-info-not-started',
					info: content,
					enrollmentStatus: status,
				});
			}

			this.InfoCmp = this.add({
				xtype: 'react',
				component: Info.Inline,
				catalogEntry,
				onSave: savedEntry => {
					this.CourseStore.fireEvent('modified-course', savedEntry);
					this.onSave && this.onSave(savedEntry);
				},
				editable: !this.viewOnly && content.hasLink('edit'),
				hasAdminToolsAccess: showRoster || showReports || showAdvanced,
				totalLearners: catalogEntry && catalogEntry.TotalEnrolledCount,
				bundle: parsedBundle,
				showRoster,
				showReports,
				showAdvanced,
				getRouteFor: function (obj, name) {
					if (obj && obj.isCourse && !obj.isCatalogEntry) {
						if (name === 'admin-info-dashboard') {
							return `app/course/${encodeForURI(
								obj.getID()
							)}/admin/dashboard`;
						} else if (name === 'admin-info-reports') {
							return `app/course/${encodeForURI(
								obj.getID()
							)}/admin/reports`;
						} else if (name === 'admin-info-roster') {
							return `app/course/${encodeForURI(
								obj.getID()
							)}/admin/roster`;
						} else if (name === 'admin-info-advanced') {
							return `app/course/${encodeForURI(
								obj.getID()
							)}/admin/advanced`;
						}
					}
				},
			});

			this.CourseStore.on('modified-course', newEntry => {
				if (newEntry) {
					this.InfoCmp.setProps({ catalogEntry: newEntry });
				}
			});
		},

		getVideo: function () {
			var title = this.down('course-info-title');

			return title && title.video;
		},

		//<editor-fold desc="Fallback Code">
		fillInPage: function (html) {
			var bodyTag = html.match(/<body.*?>(.*)<\/body>/i),
				parent = this.up('course-info');

			if (bodyTag.length > 1) {
				parent.addCls('make-white');
				this.add({
					xtype: 'box',
					cls: 'course-info-panel-legacy',
					html: bodyTag[1],
					listeners: {
						destroy: function () {
							parent.removeCls('make-white');
						},
					},
				});
			} else {
				console.error('info page has no body tag?? ', arguments);
			}
		},

		loadPage: function (pageInfo) {
			this.activeRequest = pageInfo.getId();
			ContentProxy.request({
				pageInfo: pageInfo,
				ntiid: pageInfo.getId(),
				jsonpUrl: pageInfo.getLink('jsonp_content'),
				url: pageInfo.getLink('content'),
				expectedContentType: 'text/html',
				scope: this,
				success: this.loadedPage,
				failure: this.loadPageFailed,
			});
		},

		loadPageFailed: function (r) {
			console.error(
				'server-side failure with status code ' +
					r.status +
					'. Message: ' +
					r.responseText
			);
		},

		//</editor-fold>
		loadedPage: function (r, req) {
			if (this.activeRequest !== req.pageInfo.getId()) {
				return;
			}

			this.fillInPage(r.responseText);
			delete this.activeRequest;
		},
	}
);
