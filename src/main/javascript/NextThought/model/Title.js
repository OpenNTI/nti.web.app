Ext.define('NextThought.model.Title', {
	extend: 'NextThought.model.Base',
	requires: ['NextThought.model.converters.DCCreatorToAuthor'],

	idProperty: 'index',
	fields: [
		{ name: 'Archive Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'archive', type: 'string' },
		{ name: 'courseName', type: 'string', defaultValue: ''},
		{ name: 'icon', type: 'string' },
		{ name: 'index', type: 'string' },
		{ name: 'index_jsonp', type: 'string' },
		{ name: 'installable', type: 'bool' },
		{ name: 'isCourse', type: 'bool', defaultValue: false, persist: false},
		{ name: 'root', type: 'string' },
		{ name: 'title', type: 'string', convert: function(v, m) { return m.raw.courseTitle || v; } }, //if there is a courseTitle use that instead of "title"
		{ name: 'author', type: 'DCCreatorToAuthor', mapping: 'DCCreator', defaultValue: ['Author Name Here']},
		{ name: 'version', type: 'string'},
		{ name: 'PresentationProperties', type: 'auto'},
		{ name: 'path', type: 'string', defaultValue: ''},
		{ name: 'sample', type: 'bool', defaultValue: false, persist: false}
	],

	getBoard: function() {
		return this.board || this.findBoard();
	},

	findBoard: function() {
		if (this.get('isCourse')) {
			this.board = this.getToc().querySelector('course').getAttribute('discussionBoard');
		}else {
			this.board = null;
		}

		return this.board;
	},

	getScope: function(scope) {
		var toc = this.getToc(),
			entities = toc && toc.querySelectorAll('scope[type="' + scope + '"] entry'),
			values = [];

		Ext.each(entities, function(entity) {
			values.push(entity.textContent.trim());
		});

		return values;
	},

	getToc: function() {
		this.toc = this.toc || Library.getToc(this);
		return this.toc;
	}
});
