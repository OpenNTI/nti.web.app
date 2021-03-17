const Ext = require('@nti/extjs');
const { Overview } = require('@nti/web-course');
const { Modal } = require('internal/nti-web-app-lesson-items');
const ContentUtils = require('internal/legacy/util/Content');
const { getString } = require('internal/legacy/util/Localization');
const WindowActions = require('internal/legacy/app/windows/Actions');
const BaseModel = require('internal/legacy/model/Base');
const CalendarRoutes = require('internal/legacy/app/CalendarRoutes');

const { MODAL_ROUTE_BUILDERS } = require('./Constants');
require('internal/legacy/app/mediaviewer/Index');
require('internal/legacy/overrides/ReactHarness');
require('internal/legacy/mixins/Router');
require('./types/Content');
require('./types/Toc');

const CALENDAR_EVENT = /calendarevent$/;

const Lesson = Ext.define('NextThought.app.course.overview.components.Lesson', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-lesson',
	ui: 'course',

	mixins: {
		Router: 'NextThought.mixins.Router',
	},

	isLessonView: true,
	layout: 'none',
	cls: 'course-overview',

	initComponent() {
		this.callParent(arguments);

		this.calendarRoutes = CalendarRoutes(this);
	},

	afterRender: function () {
		this.callParent(arguments);

		this.maybeMask();
	},

	getContext() {
		const itemRoute =
			(this.activeItemRoute &&
				Modal.pathToSelection(this.activeItemRoute)) ||
			[];
		const video = this.mediaViewer && this.mediaViewer.mediaId;
		const ids = video ? [...itemRoute, video] : itemRoute;

		return {
			contentIds: ids,
			get: prop => {
				if (prop === 'NTIID') {
					return ids[0];
				}
			},
			getId: () => {
				return ids[0];
			},
		};
	},

	setActiveBundle: function (bundle) {
		this.bundle = bundle;
	},

	maybeMask: function () {
		if (!this.rendered || !this.buildingOverview) {
			return;
		}

		this.addCls('loading');
		this.el.mask(
			getString('NextThought.view.courseware.overview.View.loading'),
			'loading'
		);
	},

	maybeUnmask: function () {
		delete this.buildingOverview;

		if (this.rendered) {
			this.removeCls('loading');
			this.el.unmask();
		}
	},

	clear: function () {
		this.removeAll(true);
	},

	__updateProgress: function () {
		if (!this.currentNode || !this.currentNode.getProgress) {
			return;
		}

		var me = this;

		me.currentNode
			.getProgress()
			.then(function (progress) {
				me.items.each(function (item) {
					if (item.setProgress) {
						item.setProgress(progress);
					}
				});
			})
			.catch(function (reason) {
				console.error('Failed to load progress:', reason);
			});
	},

	__updateCounts: function () {
		if (!this.currentNode || !this.currentNode.getCommentCounts) {
			return;
		}

		var me = this;

		me.currentNode
			.getCommentCounts()
			.then(function (counts) {
				me.items.each(function (item) {
					if (item.setCommentCounts) {
						item.setCommentCounts(counts);
					}
				});
			})
			.catch(function (reason) {
				console.error('Failed to load comment counts: ', reason);
			});
	},

	getInfo: function (record, course, overviewSrc) {
		return Promise.all([
			course.getAssignments(),
			course.getWrapper && course.getWrapper(),
			ContentUtils.getLocation(record.get('ContentNTIID'), course),
			overviewSrc ? null : course.getVideoIndex(),
		]);
	},

	getRouteFor(object, context) {
		if (!object || object.isUser) {
			return null;
		}

		if (object.MimeType === 'application/vnd.nextthought.note') {
			return () => {
				this.WindowActions =
					this.WindowActions || WindowActions.create();

				this.WindowActions.pushWindow(
					BaseModel.interfaceToModel(object)
				);
			};
		}

		if (object.isNoteModel) {
			return () => {
				this.WindowActions =
					this.WindowActions || WindowActions.create();

				this.WindowActions.pushWindow(object);
			};
		}

		if (CALENDAR_EVENT.test(object.MimeType)) {
			return this.calendarRoutes(object, context);
		}

		const builder =
			MODAL_ROUTE_BUILDERS[object.MimeType] ||
			MODAL_ROUTE_BUILDERS['default'];

		return builder
			? builder(
					this.bundle,
					this.currentOutlineNode,
					object,
					context,
					this.activeItemRoute
			  )
			: null;
	},

	getRouteForModal(object, context) {
		return this.getRouteFor(object, context);
	},

	onRouteDeactivate() {
		if (this.deactivating || this.deactivated) {
			return;
		}

		this.deactivating = true;
		this.deactivateTimeout = setTimeout(() => {
			if (this.currentOverview) {
				this.currentOverview.onRouteDeactivate();
			}

			if (this.itemFlyout) {
				this.itemFlyout.onRouteDeactivate();
			}

			this.cleanUpMediaViewer();

			this.deactivated = true;
			delete this.deactivating;
		}, 100);
	},

	onRouteActivate() {
		this.deactivated = false;

		if (this.deactivating) {
			clearTimeout(this.deactivateTimeout);
			delete this.deactivating;
		} else {
			if (this.currentOverview) {
				this.currentOverview.onRouteActivate();
			}

			if (this.itemFlyout) {
				this.itemFlyout.onRouteActivate();
			}
		}
	},

	async renderLesson(record, doNotCache, subRoute) {
		try {
			this.buildingOverview = true;

			if (this.currentOverview) {
				if (
					!doNotCache &&
					record.getId() === this.activeRecord.getId()
				) {
					return;
				}
			}

			this.activeRecord = record;

			const course = await this.bundle.getInterfaceInstance();

			if (!this.currentOverview) {
				this.currentOverview = this.add({
					xtype: 'react',
					component: Overview.Lesson,
					className: 'course-overview-lesson-content',
					course: course,
					layout: Overview.Lesson.List,
					baseroute: '/',
					getRouteFor: this.getRouteFor.bind(this),
					inlinePlayback: false,
				});
			} else {
				this.currentOverview.setProps({ course });
			}

			let outline = await course.getOutline({ force: doNotCache });
			let node = outline.getNode(record.get('ContentNTIID'));

			if (!node) {
				outline = await course.getOutline({ force: true });
				node = outline.getNode(record.get('ContentNTIID'));
			}

			//If another lesson got rendered while we were loading don't do anything
			if (this.activeRecord.getId() !== record.getId()) {
				return;
			}

			this.currentOutlineNode = node;

			this.currentOverview.setProps({
				outlineNode: node,
			});
		} catch (e) {
			console.error(e);
		}
	},

	isShowingContent() {
		return this.activeItemRoute || this.mediaViewer;
	},

	cleanUpMediaViewer() {
		if (this.mediaViewer) {
			this.mediaViewer.destroy();
			delete this.mediaViewer;
		}
	},

	maybeAddMediaViewer(viewerRoute, lesson, returnPath) {
		if (!viewerRoute) {
			return;
		}

		const lessonCmp = this;

		if (!this.mediaViewer) {
			this.mediaViewer = this.add({
				xtype: 'media-window-view',
				currentBundle: this.bundle,
				autoShow: true,
				handleNavigation: (...args) => {
					if (lessonCmp.handleMediaViewerRoute) {
						lessonCmp.handleMediaViewerRoute(...args);
					}
				},
				handleClose: this.handleMediaClose.bind(this, returnPath),
			});
		}

		this.addChildRouter(this.mediaViewer);

		this.mediaViewer.currentBundle = this.bundle;
		this.mediaViewer.parentLesson = lesson;
		this.mediaViewer.handleRoute(viewerRoute);

		return true;
	},

	handleMediaClose(returnPath) {
		this.cleanUpMediaViewer();
		this.pushRoute(null, returnPath);
	},

	async maybeShowContent(lesson, route, subRoute) {
		const [itemRoute, viewerRoute] = !subRoute
			? []
			: subRoute.split('/viewer/');
		const hasEmptyItemRoute =
			!this.activeItemRoute || this.activeItemRoute === '/';
		const wasMounted = !!this.itemFlyout;

		if (!this.maybeAddMediaViewer(viewerRoute, lesson, itemRoute)) {
			this.cleanUpMediaViewer();
		}

		if (!this.itemFlyout) {
			this.itemFlyout = this.add({
				xtype: 'react',
				component: Modal,
				getRouteFor: this.getRouteForModal.bind(this),
				handleNavigation: this.handleModalNavigation.bind(this),
				addHistory: true,
				baseroute: '/',
			});
		}

		try {
			const course = await this.bundle.getInterfaceInstance();

			this.activeItemRoute = itemRoute;
			this.itemFlyout.setProps(
				{
					course,
					lesson,
					requiredOnly: Overview.isFilteredToRequired(),
					dismissPath: MODAL_ROUTE_BUILDERS['dismiss'](
						this.bundle,
						lesson
					),
					path: itemRoute,
					firstSelection: hasEmptyItemRoute && wasMounted,
					activeObjectId: route && route.object && route.object.id,
					activeHash: route && route.hash,
				},
				true
			);
		} catch (e) {
			console.error(e);
		}
	},

	handleModalNavigation(title, route, precache) {
		this.pushRoute(title, route, precache);
	},

	navigate: function (obj) {
		obj.parent = this.currentNode;
		this.navigateToObject(obj);
	},
});

module.exports = exports = Lesson;
