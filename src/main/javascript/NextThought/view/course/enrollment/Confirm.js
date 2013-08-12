Ext.define('NextThought.view.course.enrollment.Confirm', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-confirm',

	ui: 'purchase-form',

	ordinal: 1,
	confirmLabel: 'Continue',

	renderTpl: Ext.DomHelper.markup([{
		cls:'msg', 'html':'You are about to enroll in this class'
	}]),


	renderSelectors: {
	},




	onConfirm: function () {
		var r = this.record,
			url = r.getLink('enroll') || r.getLink('unenroll'),
			req = {
				url: getURL(url),
				method: 'POST',
				params:{
					courseId: r.getId()
				},
				scope: this,
				callback: this.onResponse
			};

		Ext.Ajax.request(req);
	},


	onResponse: function(){
		console.log(arguments);
	},


	handleError: function (msg) {
		this.enableSubmission(false);
		this.up('window').showError(msg);
	}

});
