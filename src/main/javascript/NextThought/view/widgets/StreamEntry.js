Ext.define('NextThought.view.widgets.StreamEntry', {
	extend: 'Ext.Component',
	alias: 'widget.streamEntry',

	requires: [
		'NextThought.util.AnnotationUtils'
	],

	renderTpl: new Ext.XTemplate(
			  '<div class="x-stream-entry {cls}">',
				  '<img src="{avatarURL}" width=48 height=48"/>',
				  '<div>',
						'<span class="name">{creator}</span> ',
						'<div class="stream-text">{text}</div>',
				  '</div>',
			  '</div>'
			  ),

   renderSelectors: {
		box: 'div.x-stream-entry',
		name: '.x-stream-entry span.name',
		text: '.x-stream-entry span.text',
		icon: 'img'
	},


	change: null,

	initComponent: function(){
		var me = this,
			c = me.change.get('Creator'),
			ct = me.change.get('ChangeType'),
			i = me.change.get('Item'),
			u = NextThought.cache.UserRepository.getUser(c),
			it = (i) ? i.raw.Class : null;

		//failsafe
		if (!i) {
			return {};
		}

		//set things that will remain the same regardless of change type:
		me.renderData = {
			avatarURL: u.get('avatarURL'),
			creator: u.get('realname')
		};

		//type specific action, note that compileBody requires callback
		if (it === 'Note'){
			AnnotationUtils.compileBodyContent(i, function(noteText){
				me.renderData.text = ct.toLowerCase() + ' a note: "<i>' + noteText + '</i>"';
			});
		}
		else if (ct === 'Circled' && it === 'User') {
			me.renderData.text = 'added you to a group.';
		}
		else if (it === 'Highlight') {
			me.renderData.text = ct.toLowerCase() + ' a highlight: "<i>' + this.cleanText(i.get('text')) + '</i>"';
		}
		else {
			//if we made it here, we don't know what to do with...
			console.warn('Not sure what to do with this in the stream!', this.change);
		}

		me.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.el.on('dblclick', function(){this.fireEvent('dblclick', this.change.get('Item'));}, this);
	},

	cleanText: function(t) {
		return Ext.String.ellipsis(Ext.String.trim(t.replace(/<.*?>/g, '')), 256, true);
	}
});
