Ext.define('NextThought.model.Title', {
	extend: 'NextThought.model.Base',
	requires: ['NextThought.model.converters.DCCreatorToAuthor'],

	idProperty: 'index',
	fields: [
		{ name: 'Archive Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'archive', type: 'string' },
		{ name: 'icon', type: 'string' },
		{ name: 'index', type: 'string' },
		{ name: 'index_jsonp', type: 'string' },
		{ name: 'installable', type: 'bool' },
		{ name: 'root', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'author', type: 'DCCreatorToAuthor', mapping: 'DCCreator', defaultValue: ['Author Name Here']},
		{ name: 'version', type: 'string'},
		{ name: 'PresentationProperties', type: 'auto'},
		{ name: 'path', type: 'string', defaultValue: ''},
		{ name: 'sample', type: 'bool', defaultValue: false, persist: false},
			//for filtering
		{ name: 'isCourse', type: 'bool', defaultValue: false, persist: false}
	],


	asUIData: function() {
		return {
			id: this.getId(),
			isCourse: this.get('isCourse'),
			title: this.get('title'),
			label: this.get('author'),
			icon: this.get('icon')
		};
	},


	/** @deprecated Use {@link NextThought.model.courseware.CourseInstance#getScope()} instead */
	getScope: function(scope) {
		var toc = (this.toc = this.toc || Library.getToc(this)),
			entities = toc && toc.querySelectorAll('scope[type="' + scope + '"] entry'),
			values = [];

		Ext.each(entities, function(entity) {
			values.push(entity.textContent.trim());
		});

		return values;
	},


	fireNavigationEvent: function(eventSource) {
		eventSource.fireEvent('set-last-location-or-root', this.get('NTIID'));
	}
});
