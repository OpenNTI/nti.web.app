/**
 * @class NextThought.view.widgets.classroom.Chooser
 * @extends Ext.view.View
 */
Ext.define('NextThought.view.widgets.classroom.BrowserStudyGroups', {
	extend: 'Ext.view.View',
	alias: 'widget.classroom-browser-study-groups',

	singleSelect: true,
	autoScroll  : true,
	overItemCls: 'x-item-over',
	itemSelector: 'div.item-wrap',
	tpl: [
		'<div class="classroom-browser">',
			'<tpl for=".">',
				'<div class="item-wrap">',
					'<div class="item">',
						'<img src="{avatarURL}" width=22 height=22"/>',
						'<div>',
							'<div class="selector"><a href="#">Select</a></div>',
							'<span class="name">{realname}</span>',
						'</div>',
					'</div>',
				'</div>',
			'</tpl>',
		'</div>'
	],

	initComponent: function() {
		this.addEvents('selected');
		this.store = Ext.getStore('FriendsList');
		this.callParent(arguments);
		this.on('itemdblclick',this.fireSelected,this);
		this.on('selectionChange',this.selectionChangedScrollIntoFView,this);
	},


	selectionChangedScrollIntoFView: function(me, selections){
		var sel = selections[0], node;
		if( sel ){
			node = Ext.get(this.getNode(sel));
			if(!node.isInView(this.getEl())){
				node.scrollIntoView(this.getEl());
			}
		}
	},


	refresh: function(){
		this.callParent(arguments);
		Ext.each(
				this.getEl().query('.selector a'),
				function(dom){Ext.fly(dom).on('click',this.clickSelect, this);},
				this);
	},


	clickSelect: function(evt, dom){
		evt.preventDefault();
		evt.stopPropagation();

		var r = this.getRecord(Ext.fly(dom).up(this.itemSelector, this.getEl()));

		this.getSelectionModel().select([r]);
		this.fireSelected();
	},


	fireSelected: function() {
		var selected = this.selModel.getSelection()[0];
		if (selected) {
			this.fireEvent('selected', selected);
		}
	}


});
