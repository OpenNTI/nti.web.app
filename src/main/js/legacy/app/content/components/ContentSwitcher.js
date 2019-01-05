const Ext = require('@nti/extjs');
const {getService} = require('@nti/web-client');
const {Navigation} = require('@nti/web-content');
const AppDispatcher = require('@nti/lib-dispatcher').default;
const {encodeForURI} = require('@nti/lib-ntiids');
const {Prompt} = require('@nti/web-commons');
const {PublishCourse} = require('@nti/web-course');

const BundleActions = require('../../bundle/Actions');
const BundleStateStore = require('../../bundle/StateStore');
const CourseActions = require('../../course/Actions');
const CourseStateStore = require('../../course/StateStore');
const CoursesStateStore = require('../../library/courses/StateStore');

require('legacy/mixins/State');
require('legacy/overrides/ReactHarness');

const DEFAULT = 'default';

const HANDLERS = {
	'course': {
		'edit': (item) => {
			return `/course/${encodeForURI(item.id)}/info`;
		},
		'delete': async (item, fireEvent) => {
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
		'publish': async (item, fireEvent) => {
			try {
				const savedEntry = PublishCourse.show(item.id);

				fireEvent('modified-course', savedEntry);
			} catch (e) {
				//swallow
			}
		},
		[DEFAULT]: (item) => {
			return `/course/${encodeForURI(item.id)}/`;
		}
	},
	'book': {
		'publish': () => {
			debugger;
		},
		[DEFAULT]: (item) => {
			return `/bundle/${encodeForURI(item.id)}/`;
		}
	}
};

module.exports = exports = Ext.define('NextThought.app.content.components.ContentSwitcher', {
	extend: 'Ext.container.Container',
	alias: 'widget.content-switcher',
	stateKey: 'content-switcher',

	mixins: {
		State: 'NextThought.mixins.State'
	},

	floating: true,
	layout: 'none',
	cls: 'content-switcher',

	initComponent () {
		this.callParent(arguments);

		this.LibraryCourseStateStore = CoursesStateStore.getInstance();

		this.add({
			xtype: 'component',
			autoEl: {
				tag: 'div',
				cls: 'course-nav-arrow'
			}
		});

		this.add({
			xtype: 'react',
			component: Navigation.ContentSwitcher,
			addHistory: true,
			getRouteFor: (item, context) => {
				return () => {
					this.navigateToItem(item, context);
				};
			}
		});
	},


	async navigateToItem (item, context) {
		this.hide();

		const typeHandler = HANDLERS[item.type];

		if (!typeHandler) { return; }

		const contextHandler = typeHandler[context] || typeHandler[DEFAULT];

		if (!contextHandler) { return; }

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


	xinitComponent: function () {
		this.callParent(arguments);

		this.BundleActions = BundleActions.create();
		this.BundleStateStore = BundleStateStore.getInstance();
		this.CourseActions = CourseActions.create();
		this.CourseStateStore = CourseStateStore.getInstance();

		var me = this;

		function onItemClick (item) {
			me.hide();

			if(item) {
				me.switchContent(item.rootRoute);
			}
		}

		function goToEditor (item) {
			me.hide();

			if(item) {
				me.switchContent(item.rootRoute + '/info');
			}
		}

		function onVisibilityChanged (catalogEntry) {
			me.onVisibilityChanged && me.onVisibilityChanged(catalogEntry);

			me.LibraryCourseStateStore.fireEvent('modified-course', catalogEntry);
		}

		function onDelete () {
			me.LibraryCourseStateStore.fireEvent('modified-course', null);

			me.switchContent('/library');
		}

		this.LibraryCourseStateStore.on('modified-course', (newCatalogEntry) => {
			var state = me.getCurrentState();

			if(newCatalogEntry) {
				state.recent = state.recent.map(x => {
					if(x.id === newCatalogEntry.CourseNTIID) {
						return {
							...x,
							title: newCatalogEntry.Title
						};
					}

					return x;
				});
			}

			me.setState(state);
		});

		this.add({
			xtype: 'component',
			autoEl: {
				tag: 'div',
				cls: 'course-nav-arrow'
			}
		});

		this.navMenu = this.add({
			xtype: 'react',
			component: Navigation.CourseNavMenu,
			onItemClick,
			goToEditor,
			onVisibilityChanged,
			onDelete
		});

		this.dispatcher = AppDispatcher.register(this.handleDispatch.bind(this));
	},


	handleDispatch (event) {
		const { action: { type, response} } = event;

		if (type === 'COURSE_ASSET_UPLOAD') {
			this.updateEntry(response && response.id);
		}
	},

	openAt: function (x, y) {
		this.show();

		var myWidth = this.getWidth(),
			viewWidth = Ext.Element.getViewportWidth(),
			top, left;

		top = y;
		left = x - (myWidth / 2);

		if (left <= 5) {
			left = 5;
		} else if ((left + myWidth) > (viewWidth + 5)) {
			left = left - ((left + myWidth) - (viewWidth + 5));
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


	updateRouteFor: function (bundle, route) {
		debugger;
	},


	applyState: function () {},


	async updateEntry (id) {
		const state = this.getCurrentState();
		const newCatalogEntry = await Service.getObject(id);
		const thumb = await newCatalogEntry.getThumbnail();

		state.recent = state.recent.map(x => {
			if (x.id === newCatalogEntry.getId()) {
				return {
					...x,
					thumb
				};
			}

			return x;
		});

		this.setState(state);
	}
});
