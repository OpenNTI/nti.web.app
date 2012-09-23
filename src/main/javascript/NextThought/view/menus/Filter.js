Ext.define('NextThought.view.menus.Filter',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.filter-menu',
	requires: [
		'NextThought.view.menus.LabeledSeparator',
        'NextThought.providers.Location'
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
			'beforecheckchange':function(item, checked){ return checked || item.allowUncheck!==false; },
			'checkchange': function(item){item.up('menu').handleClick(item);}
		}
	},

	initComponent: function(){
		this.callParent(arguments);
		this.store = Ext.getStore('FriendsList');
		this.store.on('load', this.reload, this);
        LocationProvider.on('navigateComplete', this.reload, this);
    },


	reload: function(){
		this.removeAll(true);

		var items = [], communities = [];//$AppConfig.userObject.getCommunities();
		items.push({ cls: 'type-filter everything', text: 'Everything', checked: true, allowUncheck:false, isEverything: true});

        if (!LocationProvider.currentNTIID || LocationProvider.currentNTIID.indexOf('mathcounts') < 0) {
            items.push({ cls: 'type-filter highlight', text: 'Highlights', model: 'NextThought.model.Highlight' });
        }
        else {console.debug('hack alert, annotation context menu not showing while in mathcounts content...');}
		items.push({ cls: 'type-filter note', text: 'Notes', model: 'NextThought.model.Note' });
//		items.push({ cls: 'type-filter transcript', text: 'Transcripts', model: 'NextThought.model.TranscriptSummary' });
//		items.push({ cls: 'type-filter quizresult', text: 'Quiz Results', model: 'NextThought.model.QuizResult' });
		items.push({ xtype: 'labeledseparator', text: 'From' });
		items.push({ cls: 'group-filter everyone', text: 'Everyone', checked: true,
			allowUncheck:false, isEveryone:true, record: UserRepository.getTheEveryoneEntity() });
		items.push({ cls: 'group-filter', text: 'Me', isMe: true, record: $AppConfig.userObject, isGroup: true });


		if(communities.length>0){
			items.push({ xtype: 'labeledseparator', text: 'From Communities' });
			Ext.each(communities,function(c){
				items.push({
					cls: 'group-filter',
					text: c.getName(),
					record: c,
					isGroup: true
				});
			});
		}

		if(this.store.getCount()>0){
			items.push({ xtype: 'labeledseparator', text: 'From Groups' });
			this.store.each(function(v){
				items.push({
					cls: 'group-filter',
					text: v.getName(),
					record: v,
					isGroup: true
				});
			});
		}

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


	handleClick: function(item){

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
