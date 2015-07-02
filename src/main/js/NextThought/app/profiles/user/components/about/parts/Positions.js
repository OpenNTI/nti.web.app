Ext.define('NextThought.app.profiles.user.components.about.parts.Positions', {
	extend: 'NextThought.app.profiles.user.components.about.parts.EntrySet',
	alias: 'widget.profile-user-about-positions',

	name: 'positions',

	cls: 'positions fieldset groupset',
	title: 'Professional',
	errorMsg: 'Missing Required Professional Field',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry-container', cn: [
			{cls: 'remove-entry'},
			{cls: 'entry', cn: [
				{cls: 'field-container', cn: [
					{tag: 'span', cls: 'field-label edit-only required', html: 'Company'},
					{cls: 'error-msg'},
					{cls: 'field company', 'data-field': 'companyName', html: '{companyName}', tabindex: '0'}
				]},
				{cls: 'wrap', cn: [
					{cls: 'title-container field-container', cn: [
						{tag: 'span', cls: 'field-label edit-only required', html: 'Title'},
						{cls: 'error-msg'},
						{cls: 'field title', 'data-field': 'title', html: '{title}', tabindex: '0'}
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



	getEmptyEntry: function() {
		return {
			companyName: '',
			title: '',
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

		data.positions.forEach(this.addEntry.bind(this));

		if (!data.positions.length && !isMe) {
			this.hide();
		}
	},


	isReadOnly: function() {
		var schema = this.profileSchema && this.profileSchema.ProfileSchema;

		return !schema || !schema.positions || schema.positions.readonly;
	},


	entryToValues: function(entry) {
		var companyName = entry.querySelector('[data-field=companyName]'),
			title = entry.querySelector('[data-field=title]'),
			startYear = entry.querySelector('[data-field=startYear]'),
			endYear = entry.querySelector('[data-field=endYear]'),
			description = entry.querySelector('[data-field=description');

		companyName = companyName && companyName.innerText;
		title = title && title.innerText;
		startYear = startYear && startYear.innerText;
		endYear = endYear && endYear.innerText;
		description = description && description.innerText;

		return {
			MimeType: 'application/vnd.nextthought.profile.professionalposition',
			companyName: companyName,
			title: title,
			startYear: startYear,
			endYear: endYear,
			description: description
		};
	},

	validateEntry: function(entry) {
		var valid = true;
			values = this.entryToValues(entry);

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

		return valid ? '' : this.errorMsg;
	}
});