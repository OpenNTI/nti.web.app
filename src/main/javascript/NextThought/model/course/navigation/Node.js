Ext.define('NextThought.model.course.navigation.Node',{
	extend: 'Ext.data.Model',
	requires: [
		'Ext.data.reader.Xml'
	],

	idProperty: 'NTIID',

	proxy: {
		type: 'memory',
		reader: {
		    type: 'xml',
		    root: 'course',
			record: 'unit,lesson'//flatten the tree
		}
	},

	fields: [
			//id
		{ name:'NTIID', type:'string', mapping: '@topic-ntiid',
			convert: function(v,m){
				//no topic ntiid? ok, use the actual ntiid... (why we cant use an "or" in the mapping query, i donno)
				return v || m.raw.getAttribute('ntiid');
			}
		},

			//sort order
		{ name:'position', type:'string',
			convert:function(v,m){
				function toPostionString(n){
					var p = n && n.parentNode;
					if(!p){return 0;}
					return [toPostionString(p), Ext.Array.indexOf(p.children||p.childNodes,n)].join(',');
				}
				return toPostionString(m.raw);
			}
		},

			//(nti)id of parent
		{ name:'parent', type:'string', mapping:'@parentNode',
			convert:function(v){return v && (v.getAttribute('topic-ntiid')||v.getAttribute('ntiid'));} },


		{ name:'tocNode', type:'auto',
			convert:function(v,m){
				return m.raw;
			}
		},

			//string displayed in the UI
		{ name:'label', type:'string', mapping:'@label',
			convert:function(v,m){
				return v || Ext.DomQuery.selectValue(this.mapping,m.getAssociatedNode());
			}
		},

			 //unit, lesson
		{ name:'type', type:'string', mapping:'@nodeName', convert: function(v){return v && v.toLowerCase(); } },

			//due date
		{ name:'date', type:'date', mapping:'@date', dateFormat:'c', exampleValue:'2013-10-16T00:00:00Z' }
	],


	getAssociatedNode: function(){
		var n = this.raw;
		if(!this.associatedNode){
			this.associatedNode = /topic/i.test(n.nodeName)? n : Ext.DomQuery.selectNode(
					'topic[ntiid="'+n.getAttribute('topic-ntiid')
							.replace(/:/g,'\\3a ') //no colons
							.replace(/,/g,'\\2c ') //no commas
							+'"]',
					n.ownerDocument);
		}
		return this.associatedNode;
	},


	getChildren: function(){
		var n = this.get('tocNode'),
			c = n && n.children;

		n = (c && c.length) ? n : this.getAssociatedNode();

		if(!n){
			return null;
		}

		return Ext.Array.clone(n.children);
	}
});
