Ext.define('NextThought.app.assessment.results.Poll', {
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-result',

	requires: [
		'NextThought.app.assessment.results.parts.MultiChoice',
		'NextThought.app.assessment.results.parts.Matching',
		'NextThought.app.assessment.results.parts.Ordering',
		'NextThought.app.assessment.results.parts.ModeledContent'
	],

	cls: 'assessment-result',
	layout: 'none',

	items: [
		{xtype: 'container', layout: 'none', isResultContainer: true},
		{xtype: 'container', layout: 'none', cls: 'footer', isFooter: true}
	],

	initComponent: function() {
		this.callParent(arguments);

		var parts = NextThought.app.assessment.results.parts;

		this.fillInMimeTypeToComponent([
			parts.MultiChoice,
			parts.Matching,
			parts.Ordering,
			parts.ModeledContent
		]);

		this.resultContainer = this.down('[isResultContainer]');
		this.footerContainer = this.down('[isFooter]');

		this.footerContainer.add({
			xtype: 'box',
			autoEl: {cls: 'action right', html: 'Hide Results'},
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


	fillInMimeTypeToComponent: function(cmps) {
		this.mimeToComponent = cmps.reduce(function(acc, cmp) {
			acc[cmp.mimeType] = cmp;

			return acc;
		}, {});

	},


	getCmpForMimeType: function(mimeType) {
		return this.mimeToComponent[mimeType];
	},


	removeLoadingCmp: function() {
		if (this.loadingCmp) {
			this.loadingCmp.destroy();
			delete this.loadingCmp;
		}
	},


	resize: function() {
		this.syncHeight();
		this.syncPositioning();
	},


	showError: function() {
		this.removeLoadingCmp();
	},


	showResults: function(results) {
		this.removeLoadingCmp();

		var me = this,
			resultParts = results.parts,
			questionParts = me.poll.get('parts');

		resultParts.forEach(function(part, idx) {
			me.addPart(part, questionParts[idx]);
		});
	},


	addPart: function(resultPart, questionPart) {
		var cmp = this.getCmpForMimeType(resultPart.MimeType);

		if (cmp) {
			this.resultContainer.add(new cmp({
				resultPart: resultPart,
				questionPart: questionPart,
				resize: this.resize.bind(this)
			}));
		} else {
			console.warn('Unknown result type: ', resultPart);
		}
	},


	onHideResults: function() {
		if (this.doHideResults) {
			this.doHideResults();
		}
	}
});
