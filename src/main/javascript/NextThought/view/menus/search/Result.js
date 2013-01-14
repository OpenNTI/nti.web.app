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
				{cls: 'fragments', cn: [
					{tag:'tpl', 'for':'fragments', cn:[
						{cls: 'fragment', ordinal: '{#}', html: '{.}'}
					]}
				]}
			]
		}
	]),

	initComponent: function(){
		var me = this,
			hit = me.hit,
			containerId = hit.get('ContainerId'),
			name = hit.get('Creator');
		me.callParent(arguments);

		me.renderData = Ext.apply(me.renderData || {},{
			title: 'Resolving...',
            chapter: '',
            section: 'Resolving...',
			name: name,
			fragments: Ext.pluck(hit.get('Fragments'), 'text')
		});

        LocationMeta.getMeta(containerId, function(meta){
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

            if(isMe(name)){
                me.renderData.name = 'me';
            }
            if(!isMe(name) && name){
                UserRepository.getUser(name,function(user){
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
		var fragments = this.hit.get('Fragments'),
			wrappedFragmentText = [];
			me = this;

		Ext.each(fragments, function(fragment, index){
			var wrappedText = fragment.text;
			if(!fragment.matches || fragment.matches.length === 0 || !fragment.text){
				console.warn('No matches or text for fragment. Dropping', fragment);
			}
			else{
				//Sort the matches backwards so we can do string replaces without invalidating
				fragment.matches.sort(function(a, b){return b[0] - a[0];});
				Ext.each(fragment.matches, function(match, idx){
					//Attempt to detect bad data from the server
					var next = idx + 1 < fragment.matches.length ? fragment.matches[idx + 1] : [0, 0],
						newString = '';
					if(next[1] > match[1]){
						console.warn('Found a match that is a subset of a previous match.  Server breaking its promise?', fragment.matches);
						return true; //continue
					}

					newString += wrappedText.slice(0, match[0]);
					newString += '<span>';
					newString += wrappedText.slice(match[0], match[1]);
					newString += '</span>';
					newString += wrappedText.slice(match[1]);
					wrappedText = newString;
				});
			}
			wrappedFragmentText.push(wrappedText);
		});

		this.renderData.fragments = wrappedFragmentText || this.renderData.fragments;

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

	clicked: function(e){
		var target = Ext.fly(e.target),
			selector = '.fragment',
			fragNode = target.is(selector) ? e.target : target.parent(selector, true),
			fragIdx, toFlash;

		if(fragNode){
			fragIdx = Ext.fly(fragNode).getAttribute('ordinal');
			fragIdx = fragIdx ? parseInt(fragIdx, 10) : undefined;
			//Make it 0 indexed
			if(fragIdx !== undefined){
				fragIdx--;
			}
			toFlash = fragNode;
		}
		else{
			toFlash = this.getEl();
		}

		Ext.fly(toFlash).addCls('pulse');
		Ext.defer(function(){
			Ext.fly(toFlash).removeCls('pulse');
		}, 1000);
		this.fireEvent('click', this, fragIdx);
	}
});
