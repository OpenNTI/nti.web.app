const Ext = require('@nti/extjs');

require('legacy/model/User');
require('./EntrySet');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.about.parts.Positions', {
	extend: 'NextThought.app.profiles.user.components.about.parts.EntrySet',
	alias: 'widget.profile-user-about-positions',

	name: 'positions',

	cls: 'positions fieldset groupset position-entryset',
	title: 'Professional',
	missingErrorMsg: 'Missing Required Professional Field',
	errorMsg: this.missingErrorMsg,
	emptyText: 'Where do you work?',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry-container', cn: [
			{cls: 'remove-entry'},
			{cls: 'entry', cn: [
				{cls: 'field-container', cn: [
					{tag: 'span', cls: 'field-label edit-only required', html: 'Company'},
					{cls: 'error-msg'},
					{cls: 'field company', 'data-field': 'companyName', 'data-input-type': 'text-line', html: '{companyName}', tabindex: '0'}
				]},
				{cls: 'wrap', cn: [
					{cls: 'title-container field-container', cn: [
						{tag: 'span', cls: 'field-label edit-only required', html: 'Title'},
						{cls: 'error-msg'},
						{cls: 'field title', 'data-field': 'title', 'data-input-type': 'text-line', html: '{title}', tabindex: '0'}
					]},
					{cls: 'start-container field-container', cn: [
						{tag: 'span', cls: 'field-label edit-only required', html: 'Start Year'},
						{cls: 'error-msg'},
						{cls: 'field start', 'data-field': 'startYear', 'data-input-type': 'numeric', html: '{startYear}', tabindex: '0'}
					]},
					{cls: 'end-container field-container', cn: [
						{tag: 'span', cls: 'field-label edit-only', html: 'End Year'},
						{cls: 'field end', 'data-field': 'endYear', 'data-input-type': 'numeric', html: '{endYear}', tabindex: '0'}
					]}
				]},
				{cls: 'field-container', cn: [
					{tag: 'span', cls: 'field-label edit-only', html: 'Description'},
					{cls: 'error-msg'},
					{cls: 'field description multi-line', 'data-field': 'description', html: '{description}', tabindex: '0'}
				]}
			]}
		]
	})),



	setSchema: function (schema) {
		this.profileSchema = schema;

		if (!schema.ProfileSchema[this.name]) {
			this.hide();
		} else {
			if (!this.rendered) {
				this.on('afterrender', this.applySchema.bind(this));
			} else {
				this.applySchema();
			}
		}
	},


	getEmptyEntry: function () {
		return {
			companyName: '',
			title: '',
			startYear: '',
			endYear: '',
			description: ''
		};
	},


	setUser: function (user, isMe) {
		if (!this.rendered) {
			this.on('afterrender', this.setUser.bind(this, user, isMe));
			return;
		}

		var data = user.getAboutData();

		this.clearEntries();

		if (!data.positions.length && isMe) {
			this.showEmptyText();
		} else {
			this.hideEmptyText();
		}

		data.positions.forEach(this.addEntry.bind(this));

		if (!data.positions.length && !isMe) {
			this.hide();
		} else {
			this.show();
		}
	},


	isReadOnly: function () {
		var schema = this.profileSchema && this.profileSchema.ProfileSchema;

		return !schema || !schema.positions || schema.positions.readonly;
	},

	processNewline: (text) => {
		text = (text || '').replace(/\r?\n/g, '<br>');
		return text.replace(/\s{2,}/g, '').trim();
	},


	entryToValues: function (entry) {
		var companyName = entry.querySelector('[data-field=companyName]'),
			title = entry.querySelector('[data-field=title]'),
			startYear = entry.querySelector('[data-field=startYear]'),
			endYear = entry.querySelector('[data-field=endYear]'),
			description = entry.querySelector('[data-field=description]');

		companyName = companyName && (companyName.innerText || companyName.textContent);
		title = title && (title.innerText || title.textContent);
		startYear = startYear && (startYear.innerText || startYear.textContent);
		endYear = endYear && (endYear.innerText || endYear.textContent);
		description = description && this.processNewline(description.innerText || description.textContent);

		function normalizeYear (year) {
			return year || year === 0 ? parseInt(year, 10) : null;
		}

		return {
			MimeType: 'application/vnd.nextthought.profile.professionalposition',
			companyName: companyName,
			title: title,
			startYear: normalizeYear(startYear),
			endYear: normalizeYear(endYear),
			description: description
		};
	},

	validateEntry: function (entry) {
		var valid = true,
			values = this.entryToValues(entry),
			startEnd = 'Start';


		if (!values.companyName) {
			this.showErrorForField(entry, 'companyName', 'Required');
			valid = false;
		}

		if (!values.title) {
			this.showErrorForField(entry, 'title', 'Required');
			valid = false;
		}

		if (!values.startYear) {
			this.showErrorForField(entry, 'startYear', 'Required');
			valid = false;
		}

		if (values.endYear === 0) {
			this.showErrorForField(entry, 'endYear', 'Required');
			valid = false;
			startEnd = 'End';
		}

		if (!valid) {
			let dom = Ext.dom.Query.select('.profile-about'),
				el = Ext.get(dom[0]);

			el.removeErrors && el.removeErrors();
		}

		this.errorMsg = values.startYear === 0 || values.endYear === 0 ? `Position ${startEnd} Year Must Be Greater Than Or Equal To 1900` : this.missingErrorMsg;

		return valid ? '' : this.errorMsg;
	}
});
