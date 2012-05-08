Ext.define('NextThought.view.account.contacts.Card',{
	extend: 'Ext.container.Container',
	alias: 'widget.contact-card',
	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.account.contacts.Activity'
	],
	cls: 'contact-card',
	layout: 'auto',
	componentLayout: 'templated-container',
	renderTpl: [
		'<img src="{avatarURL}">',
		'<div class="card-body">',
			'<div class="name">{name}</div>',
			'<div class="status">{status}</div>',
			'<div id="{id}-body" class="activities">',
				'{%this.renderContainer(out,values)%}',
			'</div>',
		'</div>'
	],

	childEls: ['body'],

	getTargetEl: function () {
		return this.body;
	},

	defaultType: 'contact-activity',

	initComponent: function(){
		this.callParent(arguments);
		if(!this.user){
			console.error('No user specified');
			return;
		}

		//for querying later:
		this.username = this.user.get('Username');

		this.renderData = Ext.apply(this.renderData||{},{
			avatarURL: this.user.get('avatarURL'),
			name: this.user.getName(),
			status: 'Number Theory'
		});

	},

	afterRender: function(){
		this.callParent(arguments);

		var me = this, e = this.getEl();

		e.on('click', this.clicked, this);

		this.dragZone = Ext.create('Ext.dd.DragZone', e, {

			getDragData: function(e) {
				var sourceEl = e.getTarget('.contact-card'), d;
				if (sourceEl) {
					d = sourceEl.cloneNode(true);
					Ext.fly(d).select('.activities').remove();
					Ext.fly(d).select('.status').remove();
					d.id = Ext.id();
					return this.dragData = {
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d,
						username: me.user.getId()
					};
				}
			},

			getRepairXY: function() {
				return this.dragData.repairXY;
			}
		});
	},

	clicked: function(){
		this.fireEvent('click', this, this.user.getId());
	}

});
