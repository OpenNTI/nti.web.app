const { extname } = require('path');

const Ext = require('extjs');

const UserCourseInvitations = require('legacy/model/courses/UserCourseInvitations');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));

require('legacy/common/form/Form');
require('legacy/app/invite/EmailTokens');


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

	accepts: [
		'.csv'
	],

	getDefaultValues: function () {
		return {
			MimeType: UserCourseInvitations.mimeType
		};
	},

	initComponent () {
		this.callParent(arguments);

		this.inviteUrl = this.record.getLink('SendCourseInvitations');

		this.unfocusedTokens = this.add({
			xtype: 'email-tokens',
			tokens: []
		});

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
				{cls: 'control upload', 'data-qtip': 'Upload Contacts in CSV Format', html: 'BULK', cn: [
					{ tag: 'input', accept:'.csv', type: 'file'}
				]}
			]}
		});
	},

	afterRender () {
		this.callParent(arguments);
		const el = this.el,
			emailTokenField = el.down('.email-token-field'),
			tagInput = el.down('.tag-input'),
			message = el.down('.message textarea'),
			fileUpload = el.down('.control.upload input');

		this.emailToken = Ext.getDom(emailTokenField.dom);
		this.tagInput = Ext.getDom(tagInput);
		this.message = Ext.getDom(message);

		this.unfocusedTokens.addCls('hidden');
		this.mon(tagInput, {
			'keydown': () => this.maybeShowBulk(),
			'focus': () => this.tagInputOnFocus()
		});
		this.mon(message, 'focus', () => this.messageOnFocus());
		this.mon(emailTokenField, 'mouseup', () => setTimeout(()=> this.maybeShowBulk(),1));
		this.mon(this.unfocusedTokens.el, 'click', () => this.unfocusedTokensClick());
		this.mon(fileUpload, 'change', (e) => this.onFileInputChange(e));
	},


	tagInputOnFocus () {
		this.emailToken.classList.add('focused');
		this.emailToken.classList.remove('hidden');
		this.unfocusedTokens.addCls('hidden');
	},

	messageOnFocus () {
		const tags = this.form.getValueOf('emails');
		if(Array.isArray(tags) && tags.length > 0) {
			this.emailToken.classList.add('hidden');
			this.unfocusedTokens.addTags(tags);
			this.unfocusedTokens.removeCls('hidden');
		}
		this.emailToken.classList.remove('focused');
	},


	unfocusedTokensClick () {
		this.unfocusedTokens.addCls('hidden');
		this.emailToken.classList.remove('hidden');
		this.emailToken.classList.add('focused');
	},

	maybeShowBulk () {
		let dom = this.el.dom,
			token = dom && dom.querySelector('.email-token-field .token');

		if(token || (this.tagInput.value !== '' && !token)) {
			this.button.hide();
		} else {
			this.button.show();
		}
	},

	onError (error) {
		console.log(error);
	},

	onSuccess () {},

	onFileInputChange (e) {
		let input = e.getTarget(),
			file = input && input.files && input.files[0];

		input.value = null;
		e.stopEvent();

		if (file && this.accepts.includes(extname(file.name))) {
			this.onFileChange(file);
			this.form.removeErrorOn('emails');
		} else {
			this.showErrors(void 0, 'Please upload a .csv file.');
		}
	},

	onFileChange (file) {
		const me  = this;
		let url = me.record.getLink('CheckCourseInvitationsCSV'),
			submit = me.__submitFormData(me.getFormData(file), url, 'POST');

		submit
			.then( results => {
				const courseInvitations = lazy.ParseUtils.parseItems(results)[0],
					emails = courseInvitations && courseInvitations.get('Items').map(item => item.email),
					warnings = courseInvitations.get('Warnings'),
					invalidEmails = courseInvitations.get('InvalidEmails') && courseInvitations.get('InvalidEmails').Items;

				me.button.hide();
				me.form.setValue('emails', emails);

				if (this.tagInput) { this.tagInput.focus(); }

				if(invalidEmails || warnings) {
					me.showErrors(invalidEmails || [], warnings || '');
				}
			})
			.catch( error => {
				const bulkUploadError = JSON.parse(error.responseText).message;
				me.showErrors(void 0, bulkUploadError);
			})
			.catch(() => {
				me.showErrors(void 0, 'Server Error.');
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

	onSave () {
		let changedValues = this.form.getChangedValues();
		let values = {};

		values.message = changedValues.message;
		values.MimeType = changedValues.MimeType;
		values.Items = changedValues.emails.map( email => ({ 'email': email }) );

		return this.__submitJSON(values, this.inviteUrl, 'POST')
			.catch( error => {
				const inviteErrors = JSON.parse(error.responseText);

				// treat 'warnings' and 'message' field the same. either way,
				// it's an error message unrelated to 'invalidEmails'
				let msg = inviteErrors && (inviteErrors.warnings || inviteErrors.message),
					invalidEmails = inviteErrors.InvalidEmails,
					emails = invalidEmails && invalidEmails.Items;

				if(emails || msg) {
					this.showErrors(emails || [], msg || '');
				}
				return Promise.reject('Unable to save');
			});
	},

	showErrors (invalidEmails, msg = '') {
		if(Array.isArray(invalidEmails) && invalidEmails.length !== 0) {
			if(invalidEmails[0].slice(0, -1).toLowerCase() === 'email') {
				invalidEmails.shift();
				if(invalidEmails.length === 0) { return; }
			}

			this.form.showErrorOn('emails', `The following emails are invalid: ${invalidEmails.join(', ')}. ${msg}`);
		} else if (msg !== '') {
			this.form.showErrorOn('emails', msg);
		}
	}
});
