Ext.define('NextThought.app.profiles.user.components.about.parts.Positions', {
	extend: 'NextThought.app.profiles.user.components.about.parts.EntrySet',
	alias: 'widget.profile-user-about-positions',

	cls: 'positions fieldset groupset',
	title: 'Professional',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', cn: [
			{tag: 'span', cls: 'field-label edit-only', html: 'Company'},
			{cls: 'field company', 'data-field': 'companyName', html: '{companyName}', tabindex: '0'},
			{cls: 'wrap', cn: [
				{cls: 'title-container', cn: [
					{tag: 'span', cls: 'field-label edit-only', html: 'Title'},
					{cls: 'field title', 'data-field': 'title', html: '{title}', tabindex: '0'}
				]},
				{cls: 'start-container', cn: [
					{tag: 'span', cls: 'field-label edit-only', html: 'Start Year'},
					{cls: 'field start', 'data-field': 'startYear', 'data-input-type': 'numeric', html: '{startYear}', tabindex: '0'}
				]},
				{cls: 'end-container', cn: [
					{tag: 'span', cls: 'field-label edit-only', html: 'End Year'},
					{cls: 'field end', 'data-field': 'endYear', 'data-input-type': 'numeric', html: '{endYear}', tabindex: '0'}
				]}
			]},
			{tag: 'span', cls: 'field-label edit-only', html: 'Description'},
			{cls: 'field description multi-line', 'data-field': 'description', html: '{description}', tabindex: '0'}
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

		data.positions.push({
			companyName: 'NextThought',
			title: 'Supreme Overlord',
			startYear: '2013',
			endYear: '3000',
			description: 'Doin work like a boss'
		});

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
			companyName: companyName,
			title: title,
			startYear: startYear,
			endYear: endYear,
			description: description
		};
	}
});