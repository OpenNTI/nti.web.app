var Ext = require('extjs');
var Globals = require('../../../util/Globals');
var PartContent = require('../PartContent');
var PartsMultiChoice = require('./parts/MultiChoice');
var PartsMultiAnswer = require('./parts/MultiAnswer');
var PartsMatching = require('./parts/Matching');
var PartsOrdering = require('./parts/Ordering');
var PartsModeledContent = require('./parts/ModeledContent');
var PartsFreeResponse = require('./Parts/FreeResponse');


module.exports = exports = Ext.define('NextThought.app.assessment.results.Poll', {
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-result',
	cls: 'assessment-result',
	layout: 'none',

	items: [
		{xtype: 'container', layout: 'none', isResultContainer: true},
		{xtype: 'container', layout: 'none', cls: 'footer', isFooter: true}
	],

	initComponent: function () {
		this.callParent(arguments);

		var parts = NextThought.app.assessment.results.parts;

		this.fillInMimeTypeToComponent([
			parts.MultiChoice,
			parts.Matching,
			parts.Ordering,
			parts.ModeledContent,
			parts.MultiAnswer,
			parts.FreeResponse
		]);

		this.resultContainer = this.down('[isResultContainer]');
		this.footerContainer = this.down('[isFooter]');

		if (!this.survey) {
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
		}

		this.loadingCmp = this.resultContainer.add(Globals.getContainerLoadingMask());

		this.resize();

		this.getResults()
			.then(this.showResults.bind(this))
			.catch(this.showError.bind(this))
			.always(this.resize.bind(this));
	},

	fillInMimeTypeToComponent: function (cmps) {
		this.mimeToComponent = cmps.reduce(function (acc, cmp) {
			acc[cmp.mimeType] = cmp;

			return acc;
		}, {});

	},

	getCmpForMimeType: function (mimeType) {
		return this.mimeToComponent[mimeType];
	},

	removeLoadingCmp: function () {
		if (this.loadingCmp) {
			this.loadingCmp.destroy();
			delete this.loadingCmp;
		}
	},

	resize: function () {
		this.syncHeight();
		this.syncPositioning();
	},

	showError: function () {
		this.removeLoadingCmp();
		this.resultContainer.add({
			xtype: 'box',
			autoEl: {cls: 'error', html: 'There was an error showing the results.'}
		});
	},

	showResults: function (results) {
		this.removeLoadingCmp();

		var me = this,
			resultParts = results.parts,
			questionParts = me.poll.get('parts');

		resultParts.forEach(function (part, idx) {
			me.addPart(part, questionParts[idx], idx);
		});
	},

	addPart: function (resultPart, questionPart, ordinal) {
		var cmp = this.getCmpForMimeType(resultPart.MimeType);
		var container = this.resultContainer;

		if (cmp) {
			if (questionPart.get('content')) {
				container = this.resultContainer.add({
					xtype: 'container',
					layout: 'none',
					cls: 'poll-results-container',
					items: [
						new PartContent({
							part: questionPart,
							reader: this.up('[reader]').reader,
							ordinal: ordinal
						})
					]
				});
			}

			container.add(new cmp({
				resultPart: resultPart,
				questionPart: questionPart,
				resize: this.resize.bind(this)
			}));
		} else {
			console.warn('Unknown result type: ', resultPart);
		}
	},

	onHideResults: function () {
		if (this.doHideResults) {
			this.doHideResults();
		}
	}
});
