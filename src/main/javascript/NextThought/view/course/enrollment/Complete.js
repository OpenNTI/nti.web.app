Ext.define('NextThought.view.course.enrollment.Complete',{
	extend: 'Ext.Component',
	alias: 'widget.enrollment-complete',

	ui: 'purchasecomplete-panel',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'h3', cls:'gap', html: 'Enrollment Successful!'},
		{ html: 'Your content has been added to your library.'},
		{ cls:'gap', cn: [
			{ tag: 'a', href:'#', html:'View your content now!' }
		]}
	]),


	renderSelectors:{
		linkEl: 'a[href]'
	},


	ordinal: 2,
	confirmLabel: 'Close',
	omitCancel: true,
	closeWithoutWarn: true,

	onConfirm: function(){
		this.fireEvent('close', this);
	},


	afterRender: function(){
		var win;
		this.callParent(arguments);

		if(this.linkEl){
			this.mon(this.linkEl,'click','onNavigateToNewlyEnrolledContentClicked',this);
		}

		win = this.up('window');
		win.headerEl.select('.tab').addCls('visited locked');

		//reload the library
		Library.getStore().load();
		//Refresh the user
		$AppConfig.userObject.refresh();
	},


	onNavigateToNewlyEnrolledContentClicked: function(e){
		var items = this.record.get('Items') || [];
		e.stopEvent();

		//Again with these damn assumptions
		if(items.length > 1){
			console.log('More than one item for this purchasable.  Content roulette', items);
		}

		items = items.first();
		if(items){
			this.fireEvent('set-location',items);
			this.up('window').close();
		}

		return false;
	}
});
