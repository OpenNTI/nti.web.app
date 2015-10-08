Ext.define('NextThought.app.assessment.results.Poll', {
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-result',


	cls: 'assessment-result',
	layout: 'none',

	items: [
		{xtype: 'container', layout: 'none', isResultContainer: true},
		{xtype: 'container', layout: 'none', cls: 'footer', isFooter: true}
	],

	initComponent: function() {
		this.callParent(arguments);

		this.resultContainer = this.down('[isResultContainer]');
		this.footerContainer = this.down('[isFooter]');

		this.footerContainer.add({
			xtype: 'box',
			autoEl: {html: 'Hide Results'},
			listeners: {
				click: {
					element: 'el',
					fn: this.onHideResults.bind(this)
				}
			}
		});

		this.loadingCmp = this.resultContainer.add(Globals.getContainerLoadingMask());

		this.resize();

		this.getResults()
			.then(this.showResults.bind(this))
			.fail(this.showError.bind(this))
			.always(this.resize.bind(this));
	},


	resize: function() {
		this.syncHeight();
		this.syncPositioning();
	},


	showError: function() {
		debugger;
	},


	showResults: function(results) {
		if (this.loadingCmp) {
			this.loadingCmp.destroy();
			delete this.loadingCmp;
		}

		this.resultContainer.add({
			xtype: 'box',
			autoEl: {html: 'Results'}
		});
	},


	onHideResults: function() {
		if (this.doHideResults) {
			this.doHideResults();
		}
	}
});
