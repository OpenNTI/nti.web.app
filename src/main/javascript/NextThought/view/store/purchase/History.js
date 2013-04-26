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
				{tag: 'th', cls: 'key', cn:{tag: 'span', html: 'Licence or Activation Key'}},
				{tag: 'th', cls: 'qty', cn:{tag: 'span', html: 'Usage / Qty'}},
				{tag: 'th', cls: 'tot', cn:{tag: 'span', html: 'Total'}}
			]}
		},{
			tag: 'tbody', cn:{ tag: 'tpl', 'for':'.', cn:{ tag:'tr', cls:'{type}', cn:[
				{tag: 'td', cls: 'key', cn:[{tag: 'span', html: '{key}'},{html:'Purchased {CreatedTime:date("F j, Y")}'}]},
				{tag: 'td', cls: 'qty', cn:{tag: 'span', html: '{usage} / {Order.Quantity}'}},
				{tag: 'td', cls: 'tot', cn:{tag: 'span', html: '{Pricing.TotalPurchasePrice:ntiCurrency(values.Pricing.Currency)}'}}
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
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.applyHistory,arguments),this,{single:true});
			return;
		}

		var data = [], obj = Ext.decode(resp.responseText) || {};
		Ext.each(ParseUtils.parseItems(obj.Items||''),function(h){
			var d = h.getData(), q;
			d.Order = (d.Order && d.Order.getData()) || {};
			d.Pricing = (d.Pricing && d.Pricing.getData()) || {};
			d.key = d.Creator;
			d.Order.Quantity = d.Order.Quantity || 1;
			q = d.usage = d.Order.Quantity;


			console.log(d);

			if(!Ext.isEmpty(d.InvitationCode)){
				d.type = 'bulk';
				d.key = d.InvitationCode;
				d.usage = q - (d.RemainingInvitations||q);
			}

			data.push(d);
		});

		this.historyTpl.overwrite(this.el,data);
		this.el.select('tr.bulk td:first-of-type').selectable();
	},


	failedToLoadHistoy: function(){
		console.error(arguments);
		this.errorTpl.overwrite(this.el);
		this.up('[showError]').showError('Could not load purchase history. Please try again later.')
	}


});
