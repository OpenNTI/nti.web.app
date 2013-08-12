Ext.define('NextThought.view.course.enrollment.Confirm', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-confirm',

	ui: 'purchase-form',

	ordinal: 1,
	confirmLabel: 'Continue',

	renderTpl: Ext.DomHelper.markup([
			{ tag: 'h3', cls:'gap', html: 'You are about to {enroll} this course.'},
			{ html: ''},
			{ cls:'gap', cn: [
				'Are you sure?'
			]}
		]),


	renderSelectors: {
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},{
			enroll: this.record.getLink('unenroll')?'drop':'enroll in'
		});
	},



	onConfirm: function () {
		var r = this.record,
			url = r.getLink('enroll') || r.getLink('unenroll'),
			req = {
				url: getURL(url),
				method: 'POST',
				jsonData: Ext.encode({courseId: r.getId()}),
				scope: this,
				callback: this.onResponse
			};

		Ext.Ajax.request(req);
	},


	onResponse: function(q,s,r){

		if(!s){
			console.log(arguments);
			this.handleError(r.statusText);
			return;
		}

		this.fireEvent('show-enrollment-complete', this, this.record);
	},

	enableSubmission: function (enabled) {
		var win = this.up('window');
		if (win) {
			win.setConfirmState(enabled);
		}
	},

	handleError: function (msg) {
		this.enableSubmission(false);
		this.up('window').showError(msg);
	}

});
