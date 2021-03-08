const Ext = require('@nti/extjs');
const { getService } = require('@nti/web-client');
const { Navigation, Publish: PublishContent } = require('@nti/web-content');
const AppDispatcher = require('@nti/lib-dispatcher').default;
const { encodeForURI } = require('@nti/lib-ntiids');
const { Prompt } = require('@nti/web-commons');
const { PublishCourse } = require('@nti/web-course');

const CoursesStateStore = require('../../library/courses/StateStore');

require('internal/legacy/mixins/State');
require('internal/legacy/overrides/ReactHarness');

const DEFAULT = 'default';

const HANDLERS = {
	course: {
		edit: item => {
			return `/course/${encodeForURI(item.id)}/info`;
		},
		delete: async (item, fireEvent) => {
			await Prompt.areYouSure('Do you want to delete this course?');

			try {
				const service = await getService();
				const course = await service.getObject(item.id);

				await course.delete();

				fireEvent('modified-course', null);

				return '/library';
			} catch (e) {
				if (e && e.message) {
					alert(e.message);
				} else {
					alert('You don\t have permission to delete this course.');
				}
			}
		},
		publish: async (item, fireEvent) => {
			try {
				const savedEntry = await PublishCourse.show(item.id);

				fireEvent('modified-course', savedEntry);
			} catch (e) {
				//swallow
			}
		},
		[DEFAULT]: item => {
			return `/course/${encodeForURI(item.id)}/`;
		},
	},
	book: {
		publish: async item => {
			await PublishContent.show(item.id);
		},
		[DEFAULT]: item => {
			return `/bundle/${encodeForURI(item.id)}/`;
		},
	},
};

module.exports = exports = Ext.define(
	'NextThought.app.content.components.ContentSwitcher',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.content-switcher',
		stateKey: 'content-switcher',

		mixins: {
			State: 'NextThought.mixins.State',
		},

		floating: true,
		layout: 'none',
		cls: 'content-switcher',

		initComponent() {
			this.callParent(arguments);

			this.LibraryCourseStateStore = CoursesStateStore.getInstance();

			this.add({
				xtype: 'component',
				autoEl: {
					tag: 'div',
					cls: 'course-nav-arrow',
				},
			});

			this.add({
				xtype: 'react',
				component: Navigation.ContentSwitcher,
				addHistory: true,
				getRouteFor: (item, context) => {
					return () => {
						this.navigateToItem(item, context);
					};
				},
			});

			this.mon(
				this.LibraryCourseStateStore,
				'modified-course',
				this.onCourseModified.bind(this)
			);
			this.dispatcher = AppDispatcher.register(
				this.handleDispatch.bind(this)
			);
		},

		onCourseModified(course) {
			Navigation.ContentSwitcher.updateContent(course);
		},

		async handleDispatch(event) {
			const {
				action: { type, response },
			} = event;

			if (type !== 'COURSE_ASSET_UPLOAD') {
				return;
			}

			try {
				const service = await getService();
				const course = await service.getObject(response.id);

				this.onCourseModified(course);
			} catch (e) {
				//swallow
			}
		},

		async navigateToItem(item, context) {
			this.hide();

			const typeHandler = HANDLERS[item.type];

			if (!typeHandler) {
				return;
			}

			const contextHandler = typeHandler[context] || typeHandler[DEFAULT];

			if (!contextHandler) {
				return;
			}

			try {
				const route = await contextHandler(item, (...args) => {
					this.LibraryCourseStateStore.fireEvent(...args);
				});

				if (route) {
					this.switchContent(route);
				}
			} catch (e) {
				//swallow
			}
		},

		xhandleDispatch(event) {
			const {
				action: { type, response },
			} = event;

			if (type === 'COURSE_ASSET_UPLOAD') {
				this.updateEntry(response && response.id);
			}
		},

		openAt: function (x, y) {
			this.show();

			var myWidth = this.getWidth(),
				viewWidth = Ext.Element.getViewportWidth(),
				top,
				left;

			top = y;
			left = x - myWidth / 2;

			if (left <= 5) {
				left = 5;
			} else if (left + myWidth > viewWidth + 5) {
				left = left - (left + myWidth - (viewWidth + 5));
			}

			this.el.dom.style.left = left + 'px';
			this.el.dom.style.top = top + 'px';
		},

		addBundle: async function (bundle, route) {
			try {
				const instance = await bundle.getInterfaceInstance();

				Navigation.ContentSwitcher.setActiveContent(instance, route);
			} catch (e) {
				//swallow
			}
		},

		updateRouteFor: async function (bundle, route) {
			try {
				const instance = await bundle.getInterfaceInstance();

				Navigation.ContentSwitcher.updateContent(instance, route);
			} catch (e) {
				//swallow
			}
		},

		applyState: function () {},

		async updateEntry(id) {
			const state = this.getCurrentState();
			const newCatalogEntry = await Service.getObject(id);
			const thumb = await newCatalogEntry.getThumbnail();

			state.recent = state.recent.map(x => {
				if (x.id === newCatalogEntry.getId()) {
					return {
						...x,
						thumb,
					};
				}

				return x;
			});

			this.setState(state);
		},
	}
);
