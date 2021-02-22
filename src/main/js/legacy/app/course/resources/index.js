require('./index.scss');
const Ext = require('@nti/extjs');

const Resources = require('nti-web-course-resources');
const SearchStateStore = require('legacy/app/search/StateStore');
const ContentActions = require('legacy/app/content/Actions');
const AssessmentActions = require('legacy/app/course/assessment/Actions');

require('legacy/overrides/ReactHarness');
require('legacy/mixins/Router');

module.exports = exports = Ext.define(
	'NextThought.app.course.resources.Index',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.course-resources',

		mixins: {
			Router: 'NextThought.mixins.Router',
		},

		cls: 'course-content-resources',

		layout: 'none',
		items: [],

		initComponent() {
			this.callParent(arguments);

			this.resources = this.add({
				xtype: 'react',
				component: Resources,
				gotoResource: id => this.gotoReading(id),
				createResource: type => {
					if (type === 'readings') {
						this.createReading();
					} else if (type === 'surveys') {
						this.createSurvey();
					}
				},
			});

			this.initRouter();

			this.addRoute('/readings', this.showReadings.bind(this));

			this.addDefaultRoute('/readings');

			this.SearchStore = SearchStateStore.getInstance();
			this.ContentActions = ContentActions.create();
			this.AssessmentActions = AssessmentActions.create();

			this.initSearchHandler(this.SearchStore);
		},

		onRouteActivate() {
			clearTimeout(this.deactivateTimeout);
		},

		onRouteDeactivate() {
			this.deactivateTimeout = setTimeout(() => {
				this.resources.setProps({
					course: null,
				});
			}, 500);
		},

		bundleChanged(bundle) {
			this.currentBundle = bundle;
		},

		getCourse() {
			return this.currentBundle.getInterfaceInstance();
		},

		initSearchHandler(store) {
			const handleSearch = () => {
				this.readingTitleFilter = str =>
					new RegExp(store.getTerm(), 'i').test(str);
				this.resources.setProps({
					filter: this.readingTitleFilter,
				});
			};

			this.mon(store, 'context-updated', handleSearch);
		},

		createReading() {
			if (this.el) {
				this.el.mask('Loading...');
			}

			this.ContentActions.createReading(this.currentBundle)
				.then(pack => {
					this.gotoReading(pack);
					this.setTitle('Untitled Reading');
				})
				.always(() => {
					if (this.el) {
						this.el.unmask();
					}
				});
		},

		createSurvey() {
			if (this.el) {
				this.el.mask('Loading...');
			}

			this.AssessmentActions.createSurveyIn(this.currentBundle)
				.then(survey => {
					this.gotoReading(survey);
					this.setTitle('Untitled Survey');
				})
				.always(() => {
					if (this.el) {
						this.el.unmask();
					}
				});
		},

		gotoReading(reading) {
			if (this.gotoResource) {
				this.gotoResource(reading);
			}
		},

		showReadings() {
			this.setTitle('Readings');

			const filter = name => {
				return this.readingTitleFilter
					? this.readingTitleFilter(name)
					: true;
			};

			return this.getCourse().then(course => {
				if (this.editor) {
					this.editor.destroy();
					delete this.editor;
				}

				this.resources.setProps({
					course,
					filter,
				});
			});
		},
	}
);
