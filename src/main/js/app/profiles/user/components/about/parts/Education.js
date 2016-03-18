var Ext = require('extjs');
var User = require('../../../../../../model/User');
var PartsEntrySet = require('./EntrySet');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.about.parts.Education', {
	extend: 'NextThought.app.profiles.user.components.about.parts.EntrySet',
	alias: 'widget.profile-user-about-education',

	cls: 'education fieldset groupset',
	name: 'education',

	title: 'Education',
	errorMsg: 'Missing Required Education Field',
	emptyText: 'Where did you go to school?',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry-container', cn: [
			{cls: 'remove-entry'},
			{cls: 'entry', cn: [
				{cls: 'field-container', cn: [
					{tag: 'span', cls: 'field-label edit-only required', html: 'School'},
					{cls: 'error-msg'},
					{cls: 'field school', 'data-field': 'school', 'data-input-type': 'text-line', html: '{school}', tabindex: '0'}
				]},
				{cls: 'wrap', cn: [
					{cls: 'title-container field-container', cn: [
						{tag: 'span', cls: 'field-label edit-only', html: 'Degree'},
						{cls: 'error-msg'},
						{cls: 'field degree', 'data-field': 'degree', 'data-input-type': 'text-line', html: '{degree}', tabindex: '0'}
					]},
					{cls: 'start-container field-container', cn: [
						{tag: 'span', cls: 'field-label edit-only required', html: 'Start Year'},
						{cls: 'error-msg'},
						{cls: 'field start', 'data-field': 'startYear', 'data-input-type': 'numeric', html: '{startYear}', tabindex: '0'}
					]},
					{cls: 'end-container field-container', cn: [
						{tag: 'span', cls: 'field-label edit-only', html: 'End Year'},
						{cls: 'error-msg'},
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


	getEmptyEntry: function() {
		return {
			school: '',
			degree: '',
			startYear: '',
			endYear: '',
			description: ''
		};
	},


	setUser: function(user, isMe) {
		if (!this.rendered) {
			this.on('afterrender', this.setUser.bind(this, user, isMe));
			return;
		}
		var data = user.getAboutData();

		this.clearEntries();

		if (!data.education.length && isMe) {
			this.showEmptyText();
		} else {
			this.hideEmptyText();
		}

		data.education.forEach(this.addEntry.bind(this));

		this.applySchema();

		if (!data.education.length && !isMe) {
			this.hide();
		} else {
			this.show();
		}
	},


	isReadOnly: function() {
		var schema = this.profileSchema && this.profileSchema.ProfileSchema;

		return !schema || !schema.education || schema.education.readonly;
	},


	entryToValues: function(entry) {
		var school = entry.querySelector('[data-field=school]'),
			degree = entry.querySelector('[data-field=degree]'),
			startYear = entry.querySelector('[data-field=startYear]'),
			endYear = entry.querySelector('[data-field=endYear]'),
			description = entry.querySelector('[data-field=description]');

		school = school && (school.innerText || school.textContent);
		degree = degree && (degree.innerText || degree.textContent);
		startYear = startYear && (startYear.innerText || startYear.textContent);
		endYear = endYear && (endYear.innerText || endYear.textContent);
		description = description && (description.innerText || description.textContent);

		function normalizeYear(year) {
		    return year ? parseInt(year, 10) : null;
		}

		return {
			MimeType: 'application/vnd.nextthought.profile.educationalexperience',
			school: school,
			degree: degree,
			startYear: normalizeYear(startYear),
			endYear: normalizeYear(endYear),
			description: description
		};
	},


	validateEntry: function(entry) {
		var valid = true;
			values = this.entryToValues(entry);

		if (!values.school) {
			this.showErrorForField(entry, 'school', 'Required');
			valid = false;
		}

		if (!values.startYear) {
			this.showErrorForField(entry, 'startYear', 'Required');
			valid = false;
		}

		return valid ? '' : this.errorMsg;
	}
});
