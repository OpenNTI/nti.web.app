const Ext = require('@nti/extjs');
const {Navigation} = require('@nti/web-course');

const Globals = require('legacy/util/Globals');

const BundleActions = require('../../bundle/Actions');
const BundleStateStore = require('../../bundle/StateStore');
const CourseActions = require('../../course/Actions');
const CourseStateStore = require('../../course/StateStore');
const CoursesStateStore = require('../../library/courses/StateStore');

require('legacy/mixins/State');
require('legacy/overrides/ReactHarness');


module.exports = exports = Ext.define('NextThought.app.content.components.ContentSwitcher', {
	extend: 'Ext.container.Container',
	alias: 'widget.content-switcher',
	stateKey: 'content-switcher',

	mixins: {
		State: 'NextThought.mixins.State'
	},

	floating: true,
	cls: 'content-switcher',

	initComponent: function () {
		this.callParent(arguments);

		this.BundleActions = BundleActions.create();
		this.BundleStateStore = BundleStateStore.getInstance();
		this.CourseActions = CourseActions.create();
		this.CourseStateStore = CourseStateStore.getInstance();
		this.LibraryCourseStateStore = CoursesStateStore.getInstance();

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
	},

	afterRender: function () {
		this.callParent(arguments);

		this.applyState(this.getCurrentState());

		this.mon(this.el, 'click', this.onItemClicked.bind(this));
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

	getBundleData: function (bundle, route, cls) {
		var me = this,
			uiData = bundle.asUIData();

		return bundle.getThumbnail()
			.then(function (thumb) {
				return {
					id: uiData.id,
					title: uiData.title,
					thumb: thumb,
					cls: cls,
					rootRoute: me.BundleActions.getRootRouteForId(uiData.id),
					activeRoute: route
				};
			});
	},

	getCourseData: function (bundle, route, cls) {
		var me = this,
			uiData = bundle.asUIData();

		return bundle.getThumbnail()
			.then(function (thumb) {
				return {
					id: uiData.id,
					title: uiData.title,
					thumb: thumb,
					cls: cls,
					rootRoute: me.CourseActions.getRootRouteForId(uiData.id),
					activeRoute: route
				};
			});
	},

	getFamilyData: function (family, bundle, route) {
		const me = this;
		const id = family.get('CatalogFamilyID');

		let courses = !bundle.isCourse ? Promise.Resolve([]) : bundle.getCatalogFamilies().then(entries => {
			if (entries.length === 1) {
				return null;//this.getCourseData(bundle, route);
			}

			return entries.map(function (courseCatalogEntry) {
				if (courseCatalogEntry.isInFamily(id)) {
					const entry = bundle.getCourseCatalogEntry();
					const isCurrent = courseCatalogEntry.getId() === entry.getId();
					const uiData = {
						id: courseCatalogEntry.getId(),
						title: courseCatalogEntry.get('ProviderUniqueID'),
						thumb: courseCatalogEntry.get('thumb')
					};

					return {
						id: uiData.id,
						title: uiData.title,
						thumb: uiData.thumb,
						cls: isCurrent ? 'current' : null,
						rootRoute: me.CourseActions.getRootRouteForId(uiData.id),
						activeRoute: isCurrent ? route : me.CourseStateStore.getRouteFor(uiData.id)
					};
				}
			});
		});


		const uiData = family.asUIData();

		return Promise.all([
			courses,
			family.getThumbnail()
		]).then(function (results) {
			const subItems = results[0];

			uiData.cls = subItems ? 'has-sub-items' : '';
			uiData.subItems = subItems;
			uiData.thumb = results[1];
			uiData.rootRoute = me.CourseActions.getRootRouteForId(bundle.getId());
			uiData.activeRoute = me.CourseStateStore.getRouteFor(bundle.id);

			return uiData;
		});
	},

	getCourseOrFamilyData: function (bundle, route) {
		var family = bundle.getCatalogFamily();

		return family ? this.getFamilyData(family, bundle, route) : this.getCourseData(bundle, route);
	},

	addBundle: function (bundle, route) {
		var state = this.getCurrentState() || {recent: []},
			recent = state.recent || [],
			getData = bundle.isCourse ? this.getCourseOrFamilyData(bundle, route) : this.getBundleData(bundle, route);

		state.isAdmin = bundle.hasLink('delete');

		state.recent.forEach(function (item) {
			if (item.subItems) {
				item.subItems.forEach(function (subItem) {
					subItem.cls = '';
				});

				item.cls = 'has-sub-items collapsed';
			}
		});

		getData
			.then(function (data) {
				var currentIndex = -1;

				recent.forEach(function (item, idx) {
					if (item.id === data.id) {
						currentIndex = idx;
					}
				});

				if (currentIndex >= 0) {
					recent.splice(currentIndex, 1);
				}

				recent.unshift(data);
				state.recent = recent.slice(0, 5);

				return state;
			})
			.then(this.setState.bind(this));
	},

	updateRouteFor: function (bundle, route) {
		var id = bundle.getId(),
			// rootRoute = this[bundle.isCourse ? 'CourseActions' : 'BundleActions'].getRootRouteForId(id),
			state = this.getCurrentState() || {recent: []};

		state.recent.forEach(function (item) {
			if (item.id === id) {
				item.activeRoute = route;
			} else if (item.subItems) {
				item.subItems.forEach(function (subItem) {
					if (subItem.id === id) {
						subItem.activeRoute = route;

						if (item.rootRoute === subItem.rootRoute) {
							item.activeRoute = route;
						}
					}
				});
			}
		});

		this.setState(state);
	},

	applyState: function (state) {
		if (!this.rendered) { return; }

		this.navMenu.setProps({
			activeCourse: state.recent[0],
			recentCourses: state.recent.slice(1),
			isAdministrator: state.isAdmin
		});
	},

	onItemClicked: function (e) {
		if (!e.getTarget('li')) { return; }

		var item = e.getTarget('li'),
			arrow = e.getTarget('.arrow'),
			isTopLevel = item.classList.contains('item'),
			root, route;

		if (arrow) {
			item.classList.toggle('collapsed');
		} else if (!isTopLevel || (isTopLevel && e.getTarget('.meta'))) {
			root = item.getAttribute('data-root-route');
			route = item.getAttribute('data-route') || '';

			this.hide();
			this.switchContent(Globals.trimRoute(root) + '/' + Globals.trimRoute(route));
		}
	}
});
