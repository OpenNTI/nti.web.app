Ext.define('NextThought.model.Hit', {
	extend: 'NextThought.model.Base',

	requires: ['Ext.util.Inflector'],

	idProperty: null,

	statics: {
		mimeTypes: {
			'bookcontent':                  'Books',
			'forums.personalblogentrypost': 'Thoughts',
			'forums.personalblogcomment':   'Thoughts',
			'forums.communityheadlinepost': 'Forums',
			'forums.generalforumcomment':   'Forums',
			'messageinfo':                  'Chats',
			'videotranscript':              'Videos'
		}
	},

	fields: [
		{ name: 'Snippet', type: 'string' },
		{ name: 'Title', type: 'string' },
		{ name: 'Type', type: 'string' },
		{ name: 'Fragments', type: 'auto'},
		{ name: 'Score', type: 'auto'},
		{ name: 'StartMilliSecs', type: 'auto' },
		{ name: 'EndMilliSecs', type: 'auto' },
		//This really needs to move up onto a SearchResult object but we don't have that.  The proxy roots at Items
		{ name: 'PhraseSearch', type: 'auto'},
		{ name: 'GroupingField', persist: false, type: 'auto', convert: function (o, r) {
			var mime = r.get('MimeType'),
					group, type;

			if (mime) {
				group = NextThought.model.Hit.mimeTypes[mime.replace('application/vnd.nextthought.', '')];
				if (group) {
					return group;
				}
			}

			type = r.get('Type');
			if (type) {
				type = Ext.String.capitalize(type);
				type = Ext.util.Inflector.pluralize(type);
			}
			return type;
		}}
	],

	//We don't use the idProperty because there isn't a unique id,
	//but for legacy reasons people expect to call getId and get the ntiid
	getId:  function () {
		return this.get('NTIID');
	},

	isContent: function () {
		return (/content/i).test(this.get('Type'));
	}

});
