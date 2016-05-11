const Ext = require('extjs');
const Form = require('legacy/common/form/Form');
const UserCourseInvitations = require('legacy/model/courses/UserCourseInvitations');
const ParseUtils = require('legacy/util/Parsing');

module.exports = exports = Ext.define('NextThought.app.invite.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.invite-form',

	cls: 'invite-form',
	layout: 'none',
	items: [],
	schema: [
		{type: 'emailtoken', required: true, name:'emailtoken', placeholder: 'Add an email address'},
		{type: 'textarea', cls: 'message-area', required: false, placeholder: 'Type a message...'}
	],

	initComponent () {
		this.callParent(arguments);

		this.inviteUrl = this.record.getLink('SendCourseInvitations');

		this.form = this.add({
			xtype: 'common-form',
			schema: this.schema,
			action: this.inviteUrl,
			onSuccess: this.onSuccess,
			onError: this.onError
		});

		this.button = this.add({
			xtype: 'box',
			autoEl: {cls: 'button', cn: [
				{cls: 'control upload', 'data-qtip': 'Upload Contacts in CSV or Excel Format', html: 'BULK', cn: [
					{ tag: 'input', type: 'file'}
				]}
			]}
		});
	},

	afterRender () {
		this.callParent(arguments);

		this.setupFileUploadField();
	},

	onError (error) {
		console.log(error);
	},

	onSuccess (success) {
		console.log(success);
	},

	setupFileUploadField () {
		let dom = this.el.dom,
			input = dom && dom.querySelector('.control.upload input');

		if (input) {
			input.addEventListener('change', this.onFileInputChange.bind(this));
		}
	},


	onFileInputChange (e) {
		let input = e.target,
			file = input && input.files && input.files[0];

		e.preventDefault();

		if (file && (!this.accepts || file.type.match(this.accepts))) {
			this.onFileChange(file);
		}
	},


	onFileChange (file) {
		const me  = this;
		let url = me.record.getLink('CheckCourseInvitationsCSV'),
			submit = me.__submitFormData(me.getFormData(file), url, 'POST');

		submit
			.then( results => {
				const courseInvitations = ParseUtils.parseItems(results)[0];
				const emails = courseInvitations && courseInvitations.get('Items').map(item => item.email);

				me.form.setValue('emailtoken', emails);
			})
			.catch( error => {
				console.log(error);
			});
		// TODO: Send a response to the server
		// wait for response with Loading
		// load names into the token field
	},

	__buildXHR (url, method, success, failure) {
		var xhr = new XMLHttpRequest();
		//	progress = this.onSubmitProgress.bind(this);

		xhr.open(method || 'POST', url, true);

		// xhr.upload.addEventListener('progress', progress);
		// xhr.upload.addEventListener('load', progress);

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					success(xhr.responseText);
				} else {
					failure({
						status: xhr.status,
						responseText: xhr.responseText
					});
				}
			}
		};

		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		return xhr;
	},

	__submitFormData (formData, url, method) {
		var me = this;

		return new Promise(function (fulfill, reject) {
			var xhr = me.__buildXHR(url, method, fulfill, reject);

			xhr.send(formData);
		});
	},

	getFormData (file) {
		let formData = new FormData();

		if(file) {
			formData.append('csv', file);
		}

		return formData;
	},

	hideBulkUpload () {
		this.button.hide();
	},

	onSave () {
		return this.form.submitTo(this.inviteUrl);
	}
});
