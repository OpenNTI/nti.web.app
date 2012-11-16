Ext.define('NextThought.view.toast.Window',{
	extend: 'Ext.Component',
	alias: 'widget.toast',

	ui: 'toast-message',
	cls: 'toast',
	floating: true,
	plain: true,
	width: 275,

	renderTpl: Ext.DomHelper.markup([{
		cls: 'close'
	},{
		cls: 'icon {iconCls}'
	},{
		cls: 'wrapper',
		cn: [{
			cls: 'title', html: '{title}'
		},{
			cls: 'message', html: '{message}'
		}]
	},{
		cls: 'button-row'
	}]),

	buttonTpl: Ext.DomHelper.createTemplate({ cls: 'toast-button {cls}', cn: ['{label}'] }).compile(),

	renderSelectors: {
		closeEl: '.close',
		icon: '.icon',
		titleEl: '.title',
		messageEl: '.message',
		buttonRowEl: '.button-row'
	},

	initComponent: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData||{},{
			title: this.title,
			message: this.message,
			iconCls: this.iconCls || undefined
		});
	},

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.closeEl,'click',this.close,this);
		if(!this.iconCls){
			this.icon.remove();
		}
		Ext.each(this.buttons,this.renderButton,this);
	},

	renderButton: function(button){
		var b = this.buttonTpl.append(this.buttonRowEl,button,true);
		this.mon(b,'click',
				Ext.Function.createSequence(
						Ext.Function.createSequence(
							this.setActedOn,
							this.close,this),

						button.callback,
						button.scope||this),
				this, {buttonCfg: button});
	},


	setActedOn: function(clickEvent,dom,eOpts){
		this.actedOn = eOpts.buttonCfg || true;
	},


	close: function(e){
		if(e){ e.stopEvent(); }
		var size = Ext.dom.Element.getViewSize();
		this.animate({
			to:{ top: size.height + 10 },
			duration: 200,
			listeners: {
	            afteranimate: this.destroy,
	            scope: this
			}
		});

		Ext.callback(this.callback,this.scope||this,[this.actedOn||false]);
		return false;
	}
});
