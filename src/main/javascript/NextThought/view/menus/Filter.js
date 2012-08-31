Ext.define('NextThought.view.menus.Filter',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.filter-menu',
	requires: [
		'NextThought.view.menus.LabeledSeparator'
	],
	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	border: false,
	hideMode: 'display',
	minWidth: 300,

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'beforecheckchange':function(item, checked){ return checked || item.allowUncheck!==false; }
		}
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
		items.push({ cls: 'type-filter everything', text: 'Everything', checked: true, allowUncheck:false, isEverything: true});
		items.push({ cls: 'type-filter highlight', text: 'Highlights', model: 'NextThought.model.Highlight' });
		items.push({ cls: 'type-filter note', text: 'Notes', model: 'NextThought.model.Note' });
//		items.push({ cls: 'type-filter transcript', text: 'Transcripts', model: 'NextThought.model.TranscriptSummary' });
//		items.push({ cls: 'type-filter quizresult', text: 'Quiz Results', model: 'NextThought.model.QuizResult' });
		items.push({ xtype: 'labeledseparator', text: 'From' });
		items.push({ cls: 'group-filter everyone', text: 'Everyone', checked: true, allowUncheck:false, isEveryone:true });
		items.push({ cls: 'group-filter', text: 'Me', isMe: true, isGroup: true });

		this.store.each(function(v){
			if(/everyone/i.test(v.get('ID'))){
				return;
			}

			items.push({
				cls: 'group-filter',
				text: v.getName(),
				record: v,
				isGroup: true
			});
		});

		this.add(items);
		this.fireEvent('filter-control-loaded',this);
	},


	getDescription: function(){
		function toStrings(list){
			var out = [];
			Ext.each(list,function(o){out.push(o.text);});
			return out;
		}

		var things = toStrings(this.query('[model][checked=true]')),
			from = toStrings(this.query('[isGroup][checked=true]')),
			lastThing = things.pop(),
			lastFrom = from.pop(),
			what, who;

		what = (things.length > 0
				? Ext.String.format('{0} and {1}',things.join(', '),lastThing)
				: lastThing)
				|| 'Everything';
		who = (from.length > 0
				? Ext.String.format('{0} and {1}',from.join(', '),lastFrom)
				: lastFrom)
				|| 'Everyone';

		return Ext.String.format('{0} from {1}',
				Ext.String.ellipsis(what,30,false),
				Ext.String.ellipsis(who,30,true));
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
		else {
			if (!this.query('[isGroup][checked=true]').length){
				this.query('[isEveryone]').first().setChecked(true,true);
			}
			if (!this.query('[model][checked=true]').length){
				this.query('[isEverything]').first().setChecked(true,true);
			}
		}

		this.fireEvent('changed',this);
	}
});
