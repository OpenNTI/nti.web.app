Ext.define('NextThought.view.menus.Filter',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.filter-menu',
	ui: 'filter',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 300,

	defaults: {
		ui: 'filter-menuitem',
		xtype: 'menucheckitem',
		plain: true
	},

	initComponent: function(){
		this.callParent(arguments);
		this.store = Ext.getStore('FriendsList');
		this.store.on('load', this.reload, this);
		this.on('click',this.handleClick,this);
	},

	reload: function(){
		this.removeAll(true);

		var items = [];
		items.push({ cls: 'type-filter everything', text: 'Everything', checked: true, isEverything: true});
		items.push({ cls: 'type-filter highlight', text: 'Highlights', model: 'NextThought.model.Highlight' });
		items.push({ cls: 'type-filter note', text: 'Notes', model: 'NextThought.model.Note' });
		items.push({ cls: 'type-filter transcript', text: 'Transcripts', model: 'NextThought.model.TranscriptSummary' });
		items.push({ cls: 'type-filter quizresult', text: 'Quiz Results', model: 'NextThought.model.QuizResult' });
		items.push({ xtype: 'menuseparator'});
		items.push({ cls: 'group-filter everyone', text: 'Everyone', checked: true, isEveryone:true });
		items.push({ cls: 'group-filter', text: 'Me', isMe: true, isGroup: true });

		this.store.each(function(v){
			if(/everyone/i.test(v.get('ID'))){
				return;
			}

			items.push({
				cls: 'group-filter',
				text: v.get('realname'),
				record: v,
				isGroup: true
			});
		});

		this.add(items);
		this.fireEvent('filter-control-loaded',this);
	},


	handleClick: function(menu, item, e){
		if(!item){return;}

		if(item.checked){
			if(item.isEverything){
				Ext.each(this.query('[model]'),function(o){
					o.setChecked(false,true);
				});
			}
			else if(item.is('[model]')){
				this.query('[isEverything]').first().setChecked(false,true);
			}
			else if(item.isEveryone){
				Ext.each(this.query('[isGroup]'),function(o){
					o.setChecked(false,true);
				});
			}
			else if(item.is('[isGroup]')){
				this.query('[isEveryone]').first().setChecked(false,true);
			}
		}

		this.fireEvent('changed',this);
	}
});
