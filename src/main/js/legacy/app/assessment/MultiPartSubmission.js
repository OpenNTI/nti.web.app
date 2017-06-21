const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');


module.exports = exports = Ext.define('NextThought.app.assessment.MultiPartSubmission', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-multipart-submission',
	cls: 'field multipart-submission',

	renderTpl: Ext.DomHelper.markup(
		{
			cls: 'footer',
			cn: [{cls: 'left'},
				{
					cls: 'right',
					cn: [
						{cls: 'action check disabled'}
					]
				}
			]
		}),

	renderSelectors: {
		checkItBtn: '.footer .right .check'
	},

	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.checkItBtn, {
			scope: this,
			click: this.checkit
		});
		this.reset();

		if (this.enabled) {
			delete this.enabled;
			this.enableSubmission();
		}
	},

	checkit: function () {
		this.up('assessment-question').checkIt();
	},

	reset: function () {
		this.checkItBtn.removeCls('wrong').update(getString('NextThought.view.assessment.MultiPartSubmission.check'));
	},

	enableSubmission: function () {
		if (!this.rendered) {
			this.enabled = true;
			return;
		}
		this.checkItBtn.removeCls('disabled');
	},

	disableSubmission: function () {
		if (!this.rendered) {
			delete this.enabled;
			return;
		}
		this.checkItBtn.addCls('disabled');
	},

	updateWithProgress: function (questionSubmission) {
		this.enableSubmission();
		this.checkitBtn.removeCls('wrong').update(getString('NextThought.view.assessment.MultiPartSubmission.redo'));
	},

	updateWithResults: function (assessmentQuestion) {
		this.enableSubmission();
		this.checkItBtn.removeCls('wrong').update(getString('NextThought.view.assessment.MultiPartSubmission.redo'));
		if (!assessmentQuestion.isCorrect()) {
			this.checkItBtn.addCls('wrong');
		}
	}
});
