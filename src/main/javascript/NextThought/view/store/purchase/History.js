Ext.define('NextThought.view.store.purchase.History',{
	extend: 'NextThought.view.store.purchase.DetailView',
	alias: 'widget.purchase-history',

	ui: 'purchase-history-panel',

	renderTpl:Ext.DomHelper.markup({cls:'loading', cn:{html:'Loading...'}}),

	errorTpl:Ext.DomHelper.createTemplate({cls:'loading problem', cn:{html:'Oops!'}}),

	historyTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'table',
		cn:[{
			tag: 'thead', cn:{ tag:'tr', cn:[
				{tag: 'th', cls: 'key', html: 'Licence or Activation Key'},
				{tag: 'th', cls: 'qty', html: 'Usage / Qty'},
				{tag: 'th', cls: 'tot', html: 'Total'}
			]}
		},{
			tag: 'tbody', cn:{ tag: 'tpl', 'for':'.', cn:{ tag:'tr', cls:'{type}', cn:[
				{tag: 'td', cls: 'key', cn:['{key}',{html:'Purchased {CreatedTime:date("F j, Y")}'}]},
				{tag: 'td', cls: 'qty', html: '{usage} / {Quantity}'},
				{tag: 'td', cls: 'tot', html: '{price}'}
			]}}
		}]
	})),

	ordinal: 'history',

	setupRenderData: function(){
		var req = {
				url: this.record.getLink('history'),
				scope: this,
				success: this.applyHistory,
				failure: this.failedToLoadHistoy
			};

		Ext.Ajax.request(req);
	},


	applyHistory: function(resp){
		var data = [];
		resp = Ext.decode(resp.responseText) || {};
		Ext.each(ParseUtils.parseItems(resp.Items||''),function(h){
			var d = h.getData();
			console.log(d);
			if(!Ext.isEmpty(d.InvitationCode)){
				d.type = 'bulk';
				d.key = d.InvitationCode;
			}
			else {
				d.key = d.Creator;
			}
			data.push(d);
		});

		this.historyTpl.overwrite(this.el,data);
	},


	failedToLoadHistoy: function(){
		console.error(arguments);
		this.errorTpl.overwrite(this.el);
		this.up('[showError]').showError('Could not load purchase history. Please try again later.')
	}


});
