const queryString = require('querystring');
const url = require('url');

const Ext = require('extjs');
const { Scorm } = require('nti-web-course');
const { getService } = require('nti-web-client');

require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.course.scorm-content.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-scorm-content',
	title: 'Content',
	cls: 'course-scorm-content',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],

	statics: {
		showTab: function (bundle) {
			const metadata = bundle.get('Metadata');
			return bundle && bundle.isScormCourse && (bundle.hasLink('ImportSCORM') || (metadata && metadata.hasLink('LaunchSCORM')));
		}
	},

	onRouteActivate () {
		this.setTitle('Content');
	},

	initComponent () {
		this.callParent(arguments);

		this.addDefaultRoute(this.showScormContent.bind(this));
	},

	async bundleChanged (legacyBundle) {
		if (this.currentBundle === legacyBundle) { return; }

		this.currentBundle = legacyBundle;

		if (!legacyBundle) {
			delete this.currentBundle;
			return;
		}

		const service = await getService();

		const bundle = await service.getObject(legacyBundle.raw);
		this.libBundle = bundle;

		if (this.scormContent) {
			this.scormContent.setProps({ bundle });
		}
	},


	async onBundleUpdate (newBundle) {
		if (this.scormContent && this.libBundle) {
			const bundle = await this.libBundle.refresh(newBundle);
			this.scormContent.setProps({ bundle });
		}
	},

	showScormContent (route) {
		const queryParams = queryString.decode((global.location.search || '').replace(/^\?/, ''));
		const error = queryParams && queryParams.error;

		if (queryParams) {
			delete queryParams.error;
			delete queryParams.regid;
		}

		const updatedRoute = url.parse(global.location.href);
		updatedRoute.search = Object.keys(queryParams).length === 0 ? '' : queryString.stringify(queryParams);
		history.replaceState(history.state, '', updatedRoute.format());


		if (this.scormContent) {
			this.scormContent.setProps({
				error: error === '' ? 'Unknown Scorm Error' : (error || null)
			});
		} else {
			this.scormContent = this.add({
				xtype: 'react',
				component: Scorm,
				bundle: this.libBundle,
				error: error === '' ? 'Unknown Scorm Error' : (error || null),
				onBundleUpdate: this.onBundleUpdate.bind(this)
			});
		}
	}
});
