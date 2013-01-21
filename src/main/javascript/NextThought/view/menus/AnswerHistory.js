Ext.define('NextThought.view.menus.AnswerHistory',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.answer-history-menu',
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
	cls:'answer_history_menu',
	autoScroll:true,
	constrainTo: Ext.getBody(),
//	constrain: true,
	items: [
		{
			text: 'ANSWER HISTORY', cls:'answer-title', allowUncheck: false, answerHistoryTitle: true},
		{
			text: 'loading...', allowUncheck: false, noAnswerHistory: true
		}
	],

	defaults: {
		ui: 'nt-menuitem',
		xtype: 'menucheckitem',
		plain: true,
		listeners: {
			'beforecheckchange':function(item, checked){ return item.allowUncheck!==false; },
			'click': function(item){item.up('menu').handleClick(item);}
		}
	},

	initComponent: function(){
		this.callParent(arguments);
		this.store.on('changed', this.reload, this);
		this.store.on('load', this.reload, this);
	},

	reload: function(){
		var items= [], me= this;

		this.removeAll();
		items.push( {text: 'ANSWER HISTORY', cls:'answer-title', allowUncheck: false, answerHistoryTitle: true});

		this.store.each(function(r){
			var parts = r.get('parts'),
				part = parts[me.renderedData.partNum],
				t = part.get('submittedResponse');
			items.push({
				xtype: me.renderedData.menuItemType || 'menuitem',
				text: t
			});
		});

		if(items.length === 1){
			items.push({text: 'Not Yet Attempted', cls:'no-answer-history', allowUncheck: false, noAnswerHistory: true});
		}
		this.add(items);
		if(this.el){
			this.doConstrain();
		}
		if(this.isVisible() && this.showByArgs){
			this.showBy.apply(this,this.showByArgs);
		}
	},

	handleClick: function(item){
		if( !item.is('[answerHistoryTitle]') && !item.is('[noAnswerHistory]') ){
			this.ownerCmp.setValue(item.text);
			if(this.ownerCmp.enableSubmission){
				this.ownerCmp.enableSubmission();
			}
		}
	},


	showBy: function(){
		this.showByArgs = Array.prototype.slice.call(arguments);
		this.callParent(arguments);
	}

});
