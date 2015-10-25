Ext.define('NextThought.app.assessment.SurveyHeader', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.assessent-survey-header',

	layout: 'none',

	items: [],


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.surveyCmp = me.add({
			xtype: 'container',
			layout: 'none',
			cls: 'survey-header',
			items: []
		});

		me.updateSurvey(me.survey);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.syncElementHeight();
	},


	updateSurvey: function(survey) {
		var	items = [],
			reportLink = survey.getReportLink();

		if (!this.surveyCmp) {
			return;
		}

		this.surveyCmp.removeAll(true);

		if (survey.getLink('History')) {
			items.push({
				xtype: 'box',
				cls: 'survey-history',
				autoEl: {html: 'Thank You!'}
			});
		}

		if (reportLink) {
			items.push({
				xtype: 'box',
				cls: 'survey-report',
				autoEl: {html: 'View Report'},
				listeners: {
					click: {
						element: 'el',
						fn: this.showReports.bind(this, reportLink)
					}
				}
			});
		}

		if (survey.getLink('Aggregated')) {
			items.push({
				xtype: 'box',
				cls: 'survey-results',
				autoEl: {html: 'View Results'},
				listeners: {
					click: {
						element: 'el',
						fn: this.toggleResults.bind(this)
					}
				}
			});
		}

		this.surveyCmp.add(items);
		this.syncElementHeight();
	},


	showReports: function(link) {
		var win = Ext.widget('iframe-window', {
				width: 'max',
				saveText: getString('NextThought.view.menus.Reports.savetext'),
				link: link,
				loadingText: getString('NextThought.view.menus.Reports.loadingtext')
			});

		win.show();
	},


	toggleResults: function(e) {
		var button = e.getTarget('.survey-results'),
			hidden = e.getTarget('.hidden');

		if (hidden) {
			button.textContent = 'View Results';
			button.classList.remove('hidden');
			this.survey.fireEvent('hide-results');
		} else {
			button.textContent = 'Hide Results';
			button.classList.add('hidden');
			this.survey.fireEvent('show-results');
		}
	}
});
