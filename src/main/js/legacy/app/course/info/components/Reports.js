const Ext = require('@nti/extjs');
const {getService} = require('@nti/web-client');
const {List} = require('@nti/web-reports');

require('legacy/overrides/ReactHarness.js');

module.exports = exports = Ext.define('NextThought.app.course.info.components.Reports', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-reports',

	cls: 'course-reports',

	layout: 'none',
	items: [],


	initComponent () {
		this.callParent(arguments);

		if (this.bundle) {
			this.setContent(this.bundle);
		}
	},

	async setContent (bundle) {
		if (this.currentBundle === bundle || !bundle) {
			return;
		}

		this.currentBundle = bundle;
		const context = await bundle.getInterfaceInstance();

		this.removeAll(true);
		this.add({
			xtype: 'react',
			component: List,
			context
		});
	}
});

// const {wait} = require('@nti/lib-commons');
// const {getString} = require('legacy/util/Localization');


// //TODO: move this in to the strings file once we get that figured out
// const labels = {
// 	'report-CourseSummaryReport.pdf': {
// 		title: getString('NextThought.view.courseware.reports.View.coursetitle'),
// 		description: getString('NextThought.view.courseware.reports.View.coursereport')
// 	},
// 	'report-SelfAssessmentSummaryReport.pdf': {
// 		title: 'Self-Assessment Summary Report',
// 		description: 'Viewable summary of self-assessment activity by assessment and by student.'
// 	}
// };

// require('legacy/mixins/FillScreen');


// module.exports = exports = Ext.define('NextThought.app.course.info.components.Reports', {
// 	extend: 'Ext.Component',
// 	alias: 'widget.course-info-reports',

// 	mixins: {
// 		FilScreen: 'NextThought.mixins.FillScreen'
// 	},

// 	cls: 'course-reports',

// 	cardTpl: new Ext.XTemplate(Ext.DomHelper.markup({
// 		cls: 'report-card overview-section',
// 		cn: [
// 			{cls: 'description', cn: [
// 				{cls: 'title', html: '{title}'},
// 				{cls: 'about', html: '{about}'}
// 			]},
// 			{cls: 'content-card link target', 'data-link': '{link}', cn: [
// 				{cls: 'thumbnail'},
// 				{cls: 'meta', cn: [
// 					{cls: 'sub-heading', html: '{courseNumber}'},
// 					{cls: 'heading', html: '{courseName}'}
// 				]}
// 			]}
// 		]
// 	})),


// 	afterRender () {
// 		this.callParent(arguments);


// 		if (this.bundle) {
// 			this.setContent(this.bundle);
// 		}


// 		this.mon(this.el, 'click', function (e) {
// 			let target = e.getTarget('.target');
// 			let link = target && target.getAttribute('data-link');

// 			if (link) {
// 				Ext.widget('iframe-window', {
// 					width: 'max',
// 					link: link,
// 					saveText: getString('NextThought.view.menus.Reports.savetext'),
// 					loadingText: getString('NextThought.view.menus.Reports.loadingtext')
// 				}).show();
// 			}
// 		});

// 		wait()
// 			.then(this.fillScreen.bind(this, this.el.dom));

// 		this.on('activate', this.fillScreen.bind(this, this.el.dom));
// 	},


// 	setContent (bundle) {
// 		this.bundle = bundle;

// 		let links = bundle && bundle.getReportLinks();
// 		let catalog = bundle && bundle.getCourseCatalogEntry();
// 		let courseNumber = catalog && catalog.get('ProviderUniqueID');
// 		let courseName = catalog && catalog.get('title');

// 		if (!this.rendered || !links) {
// 			return;
// 		}

// 		this.el.dom.innerHTML = '';

// 		links.forEach((link) => {
// 			let rel = link.rel;
// 			let label = labels[rel];
// 			let title = label && label.title;
// 			let description = label && label.description;

// 			this.cardTpl.append(this.el, {
// 				title: title || '',
// 				about: description || '',
// 				link: link.href,
// 				courseName: courseName,
// 				courseNumber: courseNumber
// 			});
// 		});
// 	}
// });
