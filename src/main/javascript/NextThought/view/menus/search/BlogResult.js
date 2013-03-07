Ext.define('NextThought.view.menus.search.BlogResult', {
	extend: 'NextThought.view.menus.search.Result',
	alias: 'widget.search-result-post',

	renderTpl: Ext.DomHelper.markup([
		{cls:'title', cn: [
			{tag:'span', html:"{title}"},
			{tag:'tpl', 'if':'name',cn:[{cls:'by',html:'By: {name}'}]},
			{tag:'tpl', 'if':'tags', cn:[{cls:'wrap', html:'{tags}'}]}
		]},
		{
			cls:'wrap',
			cn:[
				{cls: 'fragments', cn: [
					{tag:'tpl', 'for':'fragments', cn:[
						{cls: 'fragment', ordinal: '{#}', html: '{.}'}
					]}
				]}
			]
		}
	]),

	fillInData: function(){
		var me = this,
			hit = me.hit,
			containerId = hit.get('ContainerId'),
			name = hit.get('Creator');

		me.renderData = Ext.apply(me.renderData || {},{
			title: 'Resolving...',
			name: name,
			fragments: Ext.pluck(hit.get('Fragments'), 'text')
		});

		function finish(r){
			var tags = r.get('headline').get('tags'), tagMsg;
			me.renderData = Ext.apply(me.renderData, r.getData());
			
			//check how many tags there are and display accordingly
			if(tags.length == 0){
				//no tags display nothing
				tagMsg = false;
			}else{
				//comma seperate the tags
				tagMsg = ((tags.length > 2)? "Tags" : "Tag") + ": "+tags.join(", ");
			}

			me.renderData.tags = tagMsg;

			me.record = r;
			if(isMe(name)){
				me.renderData.name = 'me';
				me.user = $AppConfig.userObject;
			}
			if(!isMe(name) && name){
				UserRepository.getUser(name,function(user){
					var n = user.getName();
					me.user = user;

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
		}

		function fail(){
			console.log('there was an error retrieving the object.', arguments);
		}

		$AppConfig.service.getObject(containerId, finish, fail, me);
	},

	clicked: function(){
		this.fireEvent('click-blog-result', this);
	}
});