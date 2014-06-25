Ext.define('NextThought.model.TopicNode', {
	extend: 'Ext.data.Model',
	requires: [
		'Ext.data.reader.Xml'
	],

	idProperty: 'NTIID',

	proxy: {
		type: 'memory',
		reader: {
			type: 'xml',
			root: 'toc',
			record: 'topic'
		}
	},

	fields: [
		//id
		{ name: 'NTIID', type: 'string', mapping: '@topic-ntiid',
			convert: function(v, m) {
				//no topic ntiid? ok, use the actual ntiid... (why we cant use an "or" in the mapping query, i donno)
				return v || m.raw.getAttribute('ntiid');
			}
		},

		//sort order
		{ name: 'position', type: 'string',
			convert: function(v, m) {
				function toPostionString(n) {
					var p = n && n.parentNode;
					if (!p) {return 0;}
					return [toPostionString(p), Ext.Array.indexOf(p.getChildren(), n)].join(',');
				}
				return toPostionString(m.raw);
			}
		},

		//(nti)id of parent
		{ name: 'parent', type: 'string', mapping: '@parentNode',
			convert: function(v) {return v && (v.getAttribute('topic-ntiid') || v.getAttribute('ntiid'));} },


		{ name: 'tocNode', type: 'auto',
			convert: function(v, m) {
				return m.raw;
			}
		},

		//string displayed in the UI
		{ name: 'label', type: 'string', mapping: '@label' },

		{ name: 'suppressed', type: 'bool', mapping: '@suppressed' },

		{ name: 'href', type: 'string', mapping: '@href' },
		{ name: 'type', type: 'string', mapping: '@level' },
		{ name: 'levelnum', type: 'int', mapping: '@levelnum' },

		{ name: 'isRoot', type: 'bool', defaultVale: false }
	],


	matches: function(substring) {
		var re = substring && new RegExp(substring, 'i');
		return !re || re.test(this.get('label'));
	},


	getChildren: function() {
		var n = this.get('tocNode'),
			c = n && n.getChildren();

		n = (c && c.length) ? n : this.getAssociatedNode();

		if (!n) {
			return null;
		}

		return Ext.Array.clone(n.getChildren());
	}

});
