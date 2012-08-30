Ext.define('NextThought.view.account.ActivityItem',{
	extend: 'Ext.Component',
	alias: 'widget.activity-item',

	renderTpl: Ext.DomHelper.markup({
		cls:"activity {type}",
		cn: [
			{cls: 'name', tag: 'span', html: '{name}'},
			' {message} ',
			{tag:'tpl', 'if':'with', cn:['with-name']}
		]
	}),

	renderSelectors: {
		name: '.name',
		box: '.activity'
	},

	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		Ext.applyIf(me.initialConfig,me.changeToActivity(me.change));
		Ext.applyIf(this,me.initialConfig);
		me.renderData = Ext.applyIf(me.renderData||{},me.initialConfig);

		UserRepository.getUser(me.change.get('Creator'),function(u){
			me.renderData.name = u[0].getName();
			if(me.rendered){
				me.name.update(me.renderData.name);
			}
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.box.on('click', function(e){
			var targets = (this.item.get('references') || []).slice();
			e.stopEvent();
			try{
				targets.push( this.item.getId() );
				console.log('nav to', targets);
				this.fireEvent('navigation-selected', this.ContainerId, targets);
			}
			catch(er){
				console.error(Globals.getError(er));
			}
			return false;
		}, this);
	},


	changeToActivity: function(c){
		var item = c.get('Item'),
			cid = item? item.get('ContainerId') : undefined;

		return {
			name: c.get('Creator'),
			item: item,
			type: item? item.getModelName().toLowerCase() : '',
			message: this.getMessage(c),
			ContainerId: cid,
			ContainerIdHash: cid? IdCache.getIdentifier(cid): undefined
		};
	},


	getMessage: function(change) {
		var item = change.get('Item'),
			type = change.get('ChangeType'),
			loc;

		if (!item){return 'Unknown';}

		if (item.getModelName() === 'User') {
			return item.getName() + (/circled/i).test(type)
					? ' added you to a group' : '?';
		}
		else if (item.getModelName() === 'Highlight') {
			loc = LocationProvider.getLocation(item.get('ContainerId'));
			return 'shared a highlight' +(loc ? (' in '+loc.label): '');
		}
		else if (item.getModelName() === 'Redaction') {
			loc = LocationProvider.getLocation(item.get('ContainerId'));
			return 'shared a redaction' +(loc ? (' in '+loc.label): '');
		}
		else if (item.getModelName() === 'Note'){
			return Ext.String.format('&ldquo;{0}&rdquo;',item.getBodyText());
		}
		else {
			console.error('Not sure what activity text to use for ', item, change);
			return 'Unknown';
		}
	}
});
