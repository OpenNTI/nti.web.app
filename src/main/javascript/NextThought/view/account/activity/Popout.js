Ext.define('NextThought.view.account.activity.Popout',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-popout',

	requires: [
		'NextThought.view.account.activity.Preview',
		'NextThought.ux.Pointer'
	],

	floating: true,
	shadow: false,

	width: 400,
	cls: 'activity-popout',
	hideMode: 'visibility',
	previewPrefix: 'widget.activity-preview-',


	initComponent: function(){
		this.callParent(arguments);

		this.pointer = Ext.widget('pointer',{
			baseCmp: this,
			pointToEl: this.refEl,
			getPointerStyle: Ext.bind(this.getPointerStyle,this)
		});

		this.on({
			destroy: this.pointer.destroy,
			show: this.pointer.show,
			hide: this.pointer.hide,
			scope: this.pointer
		});

		this.setupItems();
	},


	setupItems: function(){
		var	wName = this.getPreviewPanel();

		if(Ext.isArray(wName)){
			wName = wName.first();
		}

		if( Ext.isEmpty(wName) ){
			Ext.Error.raise('Developer Error: a view is not defined for: '+this.record.$className);
		}
		this.preview = this.add({ xtype: wName, record: this.record, user: this.user });
	},


	getPreviewPanel: function(){
		var c = this.record.getClassForModel( this.previewPrefix, false);
		return (c && c.xtype) || '';
	},


	getPointerStyle: function(x,y){
		var p = this.preview;
		return p.getPointerStyle ? p.getPointerStyle(x,y) : '';
	},


	updateRefEl: function(el){
		this.refEl = el;
		this.pointer.pointToEl = el;
		this.pointer.point();
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		me.mon(me.el,'click',function(e){e.stopPropagation();},me);

		me.on('blur',me.maybeHidePopout,me);

		Ext.defer(function(){
			me.mon(me.el.up('body'),{
				scope: me,
				'click':me.detectBlur,
				'mouseover':me.detectBlur
			});
		},1);
	},


	detectBlur: function(e){
		if(!e.getTarget('.'+this.cls) && !e.getTarget('#'+this.refEl.id) && !e.getTarget('.x-menu')){
			clearTimeout(this.hideTimer);
			this.hideTimer = Ext.defer(function(){this.fireEvent('blur');},500,this);
		}
		else {
			clearTimeout(this.hideTimer);
		}
	},


	maybeHidePopout: function(){
		// NOTE: This allows for children, especially the preview to cancel hiding the Popout
		// i.e when the editor is active.
		if(this.fireEvent('beforedeactivate') && this.preview.fireEvent('beforedeactivate')){
			this.destroy();
		}
	},


	inheritableStatics: {

		popup: function(record, el, viewRef){
			var id = record.getId(), open = false;
			Ext.each(Ext.ComponentQuery.query('activity-popout,contact-popout'),function(o){
				if(o.record.getId()!==id || record.modelName !== o.record.modelName){
					o.destroy();
				}
				else {
					o.updateRefEl(el);
					open = true;
				}
			});

			if(open){return;}

			UserRepository.getUser(record.get('Creator'),function(user){
				var pop = this.create({record: record, user: user, refEl: Ext.get(el)}),
					alignment = 'tr-tl?';

				function align(){
					pop.show();
					pop.alignTo(el,alignment,[0,0]);
				}

                pop.show().hide();
				pop.on('resize', align);

                if(viewRef) {
                    pop.mon( pop.getEl(), 'mouseover', function(){
						viewRef.cancelPopupTimeout();
					});
                }
				align();
			},this);
		}

	}
});
