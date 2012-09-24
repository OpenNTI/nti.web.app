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
            var lin = LocationProvider.getLineage(meta.NTIID),
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

            console.log('renderData', me.renderData);


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

	beforeRender: function() {
		var re = SearchUtils.searchRe(this.term, false, false);
		this.renderData.snippet = this.snippet.replace(re,  '<span>$1</span>');

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
