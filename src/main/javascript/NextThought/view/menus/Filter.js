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
		this.reload();
		LocationProvider.on('navigateComplete', this.maybeChangeVisibiltiy, this);
    },


	reload: function(){
		var items = [], communities = [], lists = [];//$AppConfig.userObject.getCommunities();

		this.removeAll(true);
		items.push({ cls: 'type-filter nothing', text: 'Nothing', checked: false, allowUncheck: true, isNothing: true});
		items.push({ cls: 'type-filter everything', text: 'Everything', checked: true, allowUncheck:false, isEverything: true});
		items.push({
			cls: 'type-filter highlight',
			text: 'Highlights',
			model: 'NextThought.model.Highlight',
			hidden: /mathcounts/i.test(LocationProvider.currentNTIID)
		});
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

		this.store.each(function(g){
			if(!g.isDFL){
				lists.push(g);
			}
		});

		if(!Ext.isEmpty(lists)){
			items.push({ xtype: 'labeledseparator', text: 'From Lists' });
			Ext.Array.each(lists, function(v){
				items.push({
					cls: 'group-filter',
					text: v.getName(),
					record: v,
					isGroup: true
				});
			});
		}

		this.add(items);
		if (this.resetCurrentSelections()){
		    this.fireEvent('filter-control-loaded',this);
        }

		this.maybeTurnOnEverything();

	},

	maybeTurnOnEverything: function(){
		var a = this.query('[model]'),
			b = Ext.Array.filter(a, function(i){ return i.checked; }, this);

		//Turn on everything and turn off the other options.
		if(a.length === b.length) {
			Ext.each(a, function(i){ i.setChecked(false, true); });
			this.query('[isEverything]').first().setChecked(true,true);
		}
		else if(b.length > 0) {
			//Turn off everything.
			this.query('[isEverything]').first().setChecked(false,true);
		}
		this.turnOffNothing();
	},

	maybeChangeVisibiltiy: function(){
		var i = this.down('[model=NextThought.model.Highlight]'),
			show = /mathcounts/i.test(LocationProvider.currentNTIID);
		if(!i){ return; }
		i[show?'hide':'show']();
		if(show && i.checked){
			i.setChecked(false);
		}
	},

    /**
     *
     * @return {Boolean} - true of you need to reload store
     */
	resetCurrentSelections: function(){
		var me = this,
			current = FilterManager.getScope(me.getId()).current,
            cantCheck = false;
		if(!current){
			return true;
		}
		current = current.flatten();

		Ext.each(current,function(o){
			var i, checked = false;
			if(o.fieldName === '$className'){
				i = me.down('[model='+o.value+']');
				if(i){i.setChecked(true,true);}
			}
			else if(o.fieldName === 'Creator'){
				if(isMe(o.value)){
					me.down('[isMe]').setChecked(true,true);
					// FIXME: turn everyone options off.
					// It seems like when 'me' is turned on, 'everyone' isn't.
					me.query('[isEveryone]').first().setChecked(false,true);
				}
				else if(o.value.isModel){
					Ext.each(me.query('[isGroup]'),function(g){
						if(g.record === o.value){
							g.setChecked(true,true);
                            checked = true;
						}
					});
                    cantCheck = cantCheck || !checked;
				}
			}
		});
        return cantCheck;
	},

	getDescription: function(){
		function toStrings(list){
			var out = [];
			Ext.each(list,function(o){out.push(o.text);});
			return out;
		}

		var things = toStrings(this.query('[model][checked=true]')),
			from = toStrings(this.query('[isGroup][checked=true]')),
			nothing = this.query('[isNothing][checked=true]'),
			lastThing = things.pop(),
			lastFrom = from.pop(),
			what, who;

		if(nothing && nothing.length > 0){
			return nothing[0].text;
		}

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

	nothingSelected: function(nothing){
		Ext.each(this.query('[model]'),function(o){
			if(o !== nothing){
				o.setChecked(false,true);
			}
		});
		Ext.each(this.query('[isGroup]'),function(o){
			o.setChecked(false,true);
		});
		this.query('[isEverything]').first().setChecked(false,true);
		this.query('[isEveryone]').first().setChecked(false,true);
	},

	turnOffNothing: function(){
		if (!this.query('[isGroup][checked=true]').length){
			this.query('[isEveryone]').first().setChecked(true,true);
		}
		if (!this.query('[model][checked=true]').length){
			this.query('[isEverything]').first().setChecked(true,true);
		}
		this.query('[isNothing]').first().setChecked(false,true);
	},

	handleClick: function(item){

		if(!item){return;}

		if(item.checked){
			if(item.isEverything){
				Ext.each(this.query('[model]'),function(o){
					o.setChecked(false,true);
				});
				this.turnOffNothing();
			}
			else if(item.isNothing){
				this.nothingSelected(item);
			}
			else if(item.is('[model]')){
				this.maybeTurnOnEverything();
			}
			else if(item.isEveryone){
				Ext.each(this.query('[isGroup]'),function(o){
					o.setChecked(false,true);
				});
				this.turnOffNothing();
			}
			else if(item.is('[isGroup]')){
				this.query('[isEveryone]').first().setChecked(false,true);
				this.turnOffNothing();
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
