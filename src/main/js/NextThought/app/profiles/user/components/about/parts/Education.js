Ext.define('NextThought.app.profiles.user.components.about.parts.Education', {
	extend: 'NextThought.app.profiles.user.components.about.parts.EntrySet',
	alias: 'widget.profile-user-about-education',

	cls: 'education fieldset groupset',

	title: 'Education',

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry-container', cn: [
			{cls: 'remove-entry'},
			{cls: 'entry', cn: [
				{tag: 'span', cls: 'field-label edit-only', html: 'School'},
				{cls: 'field school', 'data-field': 'school', html: '{school}', tabindex: '0'},
				{cls: 'wrap', cn: [
					{cls: 'title-container', cn: [
						{tag: 'span', cls: 'field-label edit-only', html: 'Degree'},
						{cls: 'field degree', 'data-field': 'degree', html: '{degree}', tabindex: '0'}
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

		data.education.push({
			school: 'University of Oklahoma',
			degree: 'Computer Science',
			startYear: '2009',
			endYear: '2014'
		});

		data.education.forEach(this.addEntry.bind(this));

		this.applySchema();

		if (!data.education.length && !isMe) {
			this.hide();
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
			description = entry.querySelector('[data-field=description');

		school = school && school.innerText;
		degree = degree && degree.innerText;
		startYear = startYear && startYear.innerText;
		endYear = endYear && endYear.innerText;
		description = description && description.innerText;

		return {
			school: school,
			degree: degree,
			startYear: startYear,
			endYear: endYear,
			description: description
		};
	}
});