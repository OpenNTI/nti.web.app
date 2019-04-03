const Ext = require('@nti/extjs');
const {Overview} = require('@nti/web-course');

const { isFeature } = require('legacy/util/Globals');
const {Modal} = require('nti-web-app-lesson-items');
const ContentUtils = require('legacy/util/Content');
const {getString} = require('legacy/util/Localization');
const WindowActions = require('legacy/app/windows/Actions');
const BaseModel = require('legacy/model/Base');

const { ROUTE_BUILDERS, MODAL_ROUTE_BUILDERS } = require('./Constants');
require('legacy/overrides/ReactHarness');
require('legacy/mixins/Router');
require('./types/Content');
require('./types/Toc');

const forceModal = true;

module.exports = exports = Ext.define('NextThought.app.course.overview.components.Lesson', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-lesson',
	ui: 'course',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	isLessonView: true,
	layout: 'none',
	cls: 'course-overview',

	afterRender: function () {
		this.callParent(arguments);

		this.maybeMask();
	},

	setActiveBundle: function (bundle) {
		this.bundle = bundle;
	},

	maybeMask: function () {
		if (!this.rendered || !this.buildingOverview) {
			return;
		}

		this.addCls('loading');
		this.el.mask(getString('NextThought.view.courseware.overview.View.loading'), 'loading');
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
		if (!this.currentNode || !this.currentNode.getProgress) { return; }

		var me = this;

		me.currentNode.getProgress()
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
		if (!this.currentNode || !this.currentNode.getCommentCounts) { return; }

		var me = this;

		me.currentNode.getCommentCounts()
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

	getInfo: function (record, course, overviewsrc) {
		return Promise.all([
			course.getAssignments(),
			course.getWrapper && course.getWrapper(),
			ContentUtils.getLocation(record.get('ContentNTIID'), course),
			overviewsrc ? null : course.getVideoIndex()
		]);
	},


	getRouteFor (object, context) {
		if (object.MimeType === 'application/vnd.nextthought.note') {
			return () => {
				this.WindowActions = this.WindowActions || WindowActions.create();

				this.WindowActions.pushWindow(BaseModel.interfaceToModel(object));
			};
		}

		const builder = forceModal || isFeature('course-content-modal') ?
			(MODAL_ROUTE_BUILDERS[object.MimeType] || MODAL_ROUTE_BUILDERS['default']) :
			(ROUTE_BUILDERS[object.MimeType]);

		return builder ? builder(this.bundle, this.currentOutlineNode, object, context) : null;
	},


	getRouteForModal (object, context) {
		return this.getRouteFor(object, context);
	},

	onRouteDeactivate () {
		if (this.deactivating || this.deactivated) { return; }

		this.deactivating = true;
		this.deactivateTimeout = setTimeout(() => {
			if (this.currentOverview) {
				this.currentOverview.onRouteDeactivate();
			}

			if (this.itemFlyout) {
				this.itemFlyout.onRouteDeactivate();
			}

			this.deactivated = true;
			delete this.deactivating;
		}, 100);
	},

	onRouteActivate () {
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

	async renderLesson (record, doNotCache, subRoute) {
		try {
			this.buildingOverview = true;

			if (this.currentOverview) {
				if (!doNotCache && record.getId() === this.activeRecord.getId()) {
					return;
				} else {
					this.currentOverview.destroy();
				}
			}

			this.activeRecord = record;

			const course = await this.bundle.getInterfaceInstance();

			this.currentOverview = this.add({
				xtype: 'react',
				component: Overview.Lesson,
				className: 'course-overview-lesson-content',
				course: course,
				layout: Overview.Lesson.List,
				baseroute: '/',
				getRouteFor: this.getRouteFor.bind(this)
			});


			let outline = await course.getOutline({force: doNotCache});
			let node = outline.getNode(record.get('ContentNTIID'));

			if (!node) {
				outline = await course.getOutline({force: true});
				node = outline.getNode(record.get('ContentNTIID'));
			}

			//If another lesson got rendered while we were loading don't do anything
			if (this.activeRecord.getId() !== record.getId()) { return; }

			this.currentOutlineNode = node;

			this.currentOverview.setProps({
				outlineNode: node
			});

		} catch (e) {
			console.error(e);
		}
	},


	async maybeShowContent (lesson, route, subRoute) {
		if (!this.itemFlyout) {
			this.itemFlyout = this.add({
				xtype: 'react',
				component: Modal,
				getRouteFor: this.getRouteForModal.bind(this),
				addHistory: true,
				baseroute: '/'
			});
		}

		try {
			const course = await this.bundle.getInterfaceInstance();

			this.itemFlyout.setProps({
				course,
				lesson,
				dismissPath: MODAL_ROUTE_BUILDERS['dismiss'](this.bundle, lesson),
				path: subRoute
			});
		} catch (e) {
			console.error(e);
		}
	},


	navigate: function (obj) {
		obj.parent = this.currentNode;
		this.navigateToObject(obj);
	}
});
