const Ext = require('extjs');
const Form = require('legacy/common/form/Form');
var {getURL} = require('legacy/util/Globals');

module.exports = exports = Ext.define('NextThought.app.redeem.Redeem', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-redemption',

	cls: 'library-redemption',
	layout: 'none',
	items: [],
	schema: [
		{type: 'text', required: true, cls: 'code', name: 'invitation_codes', placeholder: 'Enter your redemption code'},
		{type: 'submit', cls: 'reedem', text: 'Redeem'}
	],

	renderSelectors: {
		errorLabel: '.error-label'
	},

	initComponent () {
		this.callParent(arguments);

		const collection = Service.getCollection('Invitations', 'Invitations');
		const invite = collection && Service.getLinkFrom(collection.Links, 'accept-course-invitations');


		this.label = this.add({
			xtype: 'label',
			cls: 'redeemLabel',
			text: 'Redeem'
		});

		this.form = this.add({
			xtype: 'common-form',
			schema: this.schema,
			action: invite,
			onSuccess: this.onSuccess,
			onError: this.onError.bind(this),
			onFormChange: this.onFormChange.bind(this),
			noFocus: true
		});

		this.errorContainer = this.add({
			xtype: 'box',
			autoEl: {cls: 'error-container', cn: [
				{tag: 'label', cls: 'error-label', html: ''}
			]}
		});

		this.errorContainer.hide();
	},


	afterRender () {
		this.callParent(arguments);

		if(this.code) {
			this.form.setValue('invitation_codes', this.code);
			this.form.enableSubmission();
			wait()
				.then(() => this.form.focusField('invitation_codes'));
		}
	},

	onSuccess () {},

	onError (error) {
		let response = error && JSON.parse(error.responseText),
			errorMessage = response.message || 'Error with the code.';

		this.errorLabel.setHTML(errorMessage);
		this.errorContainer.show();
		this.form.addCls('error');
	},

	onFormChange (e) {
		if(!e) { return; }
		
		if(e.type === 'keyup' || e.type === 'keydown') {
			this.errorContainer.hide();
			this.form.removeCls('error');
		}
	}

});
