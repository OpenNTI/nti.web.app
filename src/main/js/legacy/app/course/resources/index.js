const Ext = require('extjs');
const Resources = require('nti-web-course-resources');
const {getService} = require('nti-web-client');
const ParseUtils = require('legacy/util/Parsing');

require('legacy/overrides/ReactHarness');
require('legacy/mixins/Router');


const EMPTY_CONTENT_PACKAGE = {
	'title': 'Untitled Reading',
	'Class': 'RenderableContentPackage',
	'MimeType': 'application/vnd.nextthought.renderablecontentpackage',
	'content': ''
};

module.exports = exports = Ext.define('NextThought.app.course.resources.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-resources',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'course-content-resources',

	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		this.resources = this.add({
			xtype: 'react',
			component: Resources,
			gotoResource: (id) => this.gotoReading(id),
			createResource: () => this.createReading()
		});

		this.initRouter();

		this.addRoute('/readings', this.showReadings.bind(this));

		this.addDefaultRoute('/readings');
	},


	bundleChanged (bundle) {
		this.currentBundle = bundle;
	},


	getCourse () {
		return getService()
			.then((service) => {
				return service.getObject(this.currentBundle.raw);
			});
	},


	createReading () {
		const link = this.currentBundle && this.currentBundle.getLink('Library');

		if (this.el) {
			this.el.mask('Loading...');
		}

		if (link) {
			Service.post(link, EMPTY_CONTENT_PACKAGE)
				.then((contentPackage) => {
					const pack = ParseUtils.parseItems(JSON.parse(contentPackage))[0];

					return this.currentBundle.updateFromServer()
						.then(() => {
							this.gotoReading(pack.get('OID'));
						});
				})
				.always(() => {
					if (this.el) {
						this.el.unmask();
					}
				});
		}
	},


	gotoReading (readingID) {
		if (this.gotoResource) {
			this.gotoResource(readingID);
		}
	},


	showReadings () {
		this.setTitle('Readings');

		return	this.getCourse()
			.then((course) => {
				if (this.editor) {
					this.editor.destroy();
					delete this.editor;
				}

				this.resources.setProps({
					course
				});
			});
	}
});
