Ext.define('NextThought.view.menus.search.Result',{
	extend: 'Ext.Component',
	alias: 'widget.search-result',
	cls: 'search-result',

	requires: ['NextThought.util.Search'],

	renderTpl: Ext.DomHelper.markup([
		{cls:'title',html:'{title}',cn:[
			{tag:'tpl', 'if':'chapter',cn:[' / ',{cls:'chapter', html:'{chapter}'}]},
			{tag:'tpl', 'if':'section',cn:[{cls:'section', html:'{section}'}]}
		]},
		{
			cls:'wrap',
			cn:[
				{tag:'tpl', 'if':'name',cn:[{cls:'name',html:'{name}'}]},
				{cls:'snippet',html:'{snippet}'}
			]
		}
	]),

	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		me.renderData = Ext.copyTo({},me,'title,chapter,name,section,snippet');

        Ext.apply(me.renderData, {
            title: 'Resolving...',
            chapter: '',
            section: 'Resolving...'
        });

        LocationMeta.getMeta(this.ntiid, function(meta){
            var lin = meta ? LocationProvider.getLineage(meta.NTIID) : [],
                chap = [];

            lin.pop(); //remove root, we will already have it after resolving "id"
            lin.shift();//remove the first item as its identical as id.

            Ext.each(lin,function(c){
                var i = LocationProvider.getLocation(c);
                if(!i){
                    console.warn(c+" could not be resolved");
                    return;
                }
                chap.unshift(i.label);//the lineage is ordered leaf->root...this list needs to be in reverse order.
            });

            me.renderData = Ext.apply(me.renderData || {}, {
                title: meta ? meta.title.get('title') : 'Untitled',
                chapter: chap.join(' / '),
                section: meta ? meta.label : 'Unlabeled'
            });

            if(isMe(this.name)){
                me.renderData.name = 'me';
            }
            if(!isMe(me.name) && me.name){
                UserRepository.getUser(me.name,function(user){
                    var n = user.getName();
                    if(!me.rendered){
                        me.renderData.name = n;
                        return;
                    }
                    me.renderTpl.overwrite(me.el, me.renderData);
                });
            }
            else if (me.rendered){
                me.renderTpl.overwrite(me.el, me.renderData);
            }
        }, me);
	},

	//This code assumes matches within fragments don't overlap, which I was told can be guarenteed
	wrapFragmentHits: function(){
		var fragmentSeparator = '...',
			wrappedSnippets = '';

		if(this.fragments.length == 0){
			console.warn('No fragments for term', this.term, ' and snippet ', this.snippet);
			this.renderData.snippet = this.snippet;
			return;
		}

		Ext.each(this.fragments, function(fragment, index){
			var fIdx = 0, wrappedText;
			if(!fragment.matches || fragment.matches.length == 0 || !fragment.text){
				console.warn('No matches or text for fragment. Dropping', fragment);
			}
			else{
			
				wrappedText = fragment.text;

				//Sort the matches backwards so we can do string replaces without invalidating
				fragment.matches.sort(function(a, b){return b[0] - a[0];});
				Ext.each(fragment.matches, function(match, idx){

					//Attempt to detect bad data from the server
					var next = idx + 1 < fragment.matches.length ? fragment.matches[idx + 1] : [0, 0] ;
					if(next[1] > match[1]){
						console.warn('Found a match that is a subset of a previous match.  Server breaking its promise?', fragment.matches);
						return true; //continue
					}
					lastGood = match;
					var newString = '';
					newString += wrappedText.slice(0, match[0]);
					newString += '<span>';
					newString += wrappedText.slice(match[0], match[1]);
					newString += '</span>';
					newString += wrappedText.slice(match[1]);
					wrappedText = newString;
				});

				wrappedSnippets += wrappedText;
				if(index < fragment.length-1){
					wrappedSnippets += fragmentSeparator;
				}
			}
		});

		this.renderData.snippet = wrappedSnippets ? wrappedSnippets : this.snippet;
		
	},

	beforeRender: function() {
		this.wrapFragmentHits();
		return this.callParent(arguments);
	},

	afterRender: function() {
		this.callParent(arguments);
		this.getEl().on({
			scope: this,
			animationend: this.animationEnd,
			webkitAnimationEnd: this.animationEnd,
			click: this.clicked
		});
	},


	animationEnd: function(){
		this.getEl().removeCls('pulse');
	},

	clicked: function(){
		this.getEl().addCls('pulse');
		this.fireEvent('click', this);
	}
});
