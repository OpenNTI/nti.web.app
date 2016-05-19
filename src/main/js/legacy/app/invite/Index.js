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
		{name: 'MimeType', type: 'hidden'},
		{type: 'emailtoken', required: true, name:'emails', placeholder: 'Add an email address'},
		{type: 'textarea', cls: 'message-area', name:'message', required: false, placeholder: 'Type a message...'}
	],

	getDefaultValues: function () {
		return {
			MimeType: NextThought.model.courses.UserCourseInvitations.mimeType
		};
	},

	initComponent () {
		this.callParent(arguments);

		this.inviteUrl = this.record.getLink('SendCourseInvitations');

		this.form = this.add({
			xtype: 'common-form',
			schema: this.schema,
			action: this.inviteUrl,
			defaultValues: this.getDefaultValues(),
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
		let dom = this.el.dom,
			emailTokenField = dom && dom.querySelector('.email-token-field');

		this.setupFileUploadField();
		this.setupBulkListener();
		this.setupTokenFocus();

		this.emailToken = emailTokenField;
	},

	setupTokenFocus () {
		let dom = this.el.dom,
			tagInput = dom && dom.querySelector('.tag-input'),
			message = dom && dom.querySelector('.message textarea');

		tagInput.addEventListener('focus', this.tagInputOnFocus.bind(this));
		message.addEventListener('focus', this.messageOnFocus.bind(this));
	},

	tagInputOnFocus () {
		this.emailToken.classList.add('focused');
	},

	messageOnFocus () {
		this.emailToken.classList.remove('focused');
		this.emailToken.scrollTop = 0;
	},

	setupBulkListener () {
		let dom = this.el.dom,
			tagInput = dom && dom.querySelector('.tag-input');

		if(tagInput) {
			tagInput.addEventListener('keydown', this.maybeShowBulk.bind(this));
		}
	},

	maybeShowBulk () {
		let dom = this.el.dom,
			tagInput = dom && dom.querySelector('.tag-input'),
			token = dom && dom.querySelector('.token');

		if(token || (tagInput.value !== '' && !token)) {
			this.button.hide();
		} else {
			this.button.show();
		}
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

		input.value = null;
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
				let warnings = courseInvitations.get('Warnings'),
					invalidEmails = courseInvitations.get('InvalidEmails') && courseInvitations.get('InvalidEmails').Items,
					dom = me.el.dom,
					tagInput = dom && dom.querySelector('.tag-input');

				me.button.hide();
				me.form.setValue('emails', emails);
				if (tagInput) { tagInput.focus(); }

				if(invalidEmails || warnings) {
					me.showErrors(invalidEmails || [], warnings || '');
				}
			})
			.catch( error => {
				console.log(error);
			});
	},

	__buildXHR (url, method, success, failure) {
		var xhr = new XMLHttpRequest();

		xhr.open(method || 'POST', url, true);
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


	__submitJSON: function (values, url, method) {
		var me = this;

		return new Promise(function (fulfill, reject) {
			var xhr = me.__buildXHR(url, method, fulfill, reject);

			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(values));
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
		let changedValues = this.form.getChangedValues();
		let values = {};

		values.message = changedValues.message;
		values.MimeType = changedValues.MimeType;
		values.Items = changedValues.emails.map( email => ({ 'email': email }) );

		return this.__submitJSON(values, this.inviteUrl, 'POST')
			.catch( error => {
				const inviteErrors = JSON.parse(error.responseText);

				let warnings = inviteErrors && inviteErrors.warnings,
					invalidEmails = inviteErrors.InvalidEmails,
					emails = invalidEmails && invalidEmails.Items;

				if(emails || warnings) {
					this.showErrors(emails || [], warnings || '');
				}
				return Promise.reject('Unable to save');
			});
	},

	showErrors (invalidEmails, warnings = '') {
		if(invalidEmails) {
			if(invalidEmails[0].slice(0, -1).toLowerCase() === 'email') {
				invalidEmails.shift();
			}

			this.form.showErrorOn('emails', `The following emails are invalid: ${invalidEmails.join(', ')}. ${warnings}`);
		} else if (warnings !== '') {
			this.form.showErrorOn('emails', warnings);
		}
	}
});
