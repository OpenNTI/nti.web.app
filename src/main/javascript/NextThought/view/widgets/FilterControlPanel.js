
Ext.define('NextThought.view.widgets.FilterControlPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.filter-control',
	requires: [
		'NextThought.util.Globals',
		'Ext.form.field.Checkbox'
	],

	width: MIN_SIDE_WIDTH,
	border: false,
	items: [{
		xtype: 'form', layout: 'anchor', cls: 'filter-controls',
		border: false, defaults:{border:false, anchor: '100%'}
	}],

	constructor: function(){
		this.addEvents('filter-control-loaded');
		this.callParent(arguments);
	},

	initComponent: function(){
		this.callParent(arguments);
		this.setWidth(MIN_SIDE_WIDTH);
		this.store = Ext.getStore('FriendsList');
		this.store.on('load', this.reload, this);
	},
	
	reload: function(){
		this.addGroups();
	},
	
	
	addGroups : function(){
		var form = this.items.get(0);
		form.removeAll(true);

		form.add({ border: false,html:'Who:', cls: 'sidebar-header'});

		form.add({
			border: false,
			boxLabel: 'All',
			cls: 'no-filter',
			name: 'allgroupsbutton',
			xtype: 'checkbox'
		});

		form.add({
			border: false,
			cls: 'user-filter',
			usergroup: true,
			xtype:'checkboxfield',
			boxLabel: 'Me',
			isMe: true
		});

		this.store.each(
			function(v){
				form.add({
					border: false,
					cls: v.isModifiable()? 'user-group' : 'system-group',
					usergroup: true,
					xtype:'checkboxfield',
					boxLabel: v.get('realname'),	
					record: v
				});
			},
			this
		);
		
		form.add({ border: false,html:'What:', cls: 'sidebar-header'});
		
		form.add({
			border: false,
			cls: 'no-filter',
			name: 'alltypesbutton',
			xtype: 'checkboxfield',
			boxLabel: 'All'
		});
		
		form.add({ xtype:'checkbox', cls: 'type-filter highlight', boxLabel: 'Highlights', model: 'NextThought.model.Highlight' });
		form.add({ xtype:'checkbox', cls: 'type-filter note', boxLabel: 'Notes', model: 'NextThought.model.Note' });
		form.add({ xtype:'checkbox', cls: 'type-filter transcript', boxLabel: 'Transcripts', model: 'NextThought.model.TranscriptSummary' });
		form.add({ xtype:'checkbox', cls: 'type-filter quizresult', boxLabel: 'Quiz Results', model: 'NextThought.model.QuizResult' });

		this.fireEvent('filter-control-loaded',this);

		this.doComponentLayout();
		this.doLayout();
	}
});
