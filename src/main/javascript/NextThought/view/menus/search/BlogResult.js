Ext.define('NextThought.view.menus.search.BlogResult', {
	extend: 'NextThought.view.menus.search.Result',
	alias: 'widget.search-result-post',

	renderTpl: Ext.DomHelper.markup([
		{cls:'title',html:'{title}'},
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
			me.renderData = Ext.apply(me.renderData, r.getData());

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