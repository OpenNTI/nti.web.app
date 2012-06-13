Ext.define('NextThought.view.WindowManager',{
	singleton: true,

	registry: [],
	buttonMap: {},

	constructor: function(){
		this.tracker = Ext.DomHelper.append(Ext.getBody(),{
			tag: 'div',
			id: 'window-tracker',
			cls: 'window-tracker'
		}, true);

		this.tpl = Ext.DomHelper.createTemplate({
			cls: 'window-minimized',
			children: [
				{
					cls: 'closer',
					children: [ {
						tag: 'img',
						src: Ext.BLANK_IMAGE_URL,
						cls: 'closer-nib'
					} ]
				},
				{ cls: 'title', children: [
					{tag: 'span',html: '{0}'},
					{ cls: 'activity' }]
				}
			]
		});
		this.tpl.compile();

		this.mappedEvents = {
			scope: this,
			minimize: this.handleMinimize,
			close: this.handleClose,
			titleChange: this.handleTitleChange
		};
	},


	register: function(window){
		if(Ext.Array.contains(this.registry,window)){
			Ext.Error.raise('duplicate');
		}

		this.registry.push(window);

		window.mon(window,this.mappedEvents);

		var btn = this.tpl.append(this.tracker,[window.getTitle()], true),
			map = this.buttonMap;

		window.minimizedButton = btn;
		map[btn.id] = window;

		window.minimized ? btn.show(): btn.hide();

		btn.on({
			scope: this,
			click: function(e){
				var id = e.getTarget('.window-minimized',null,true).id;
				this.handleRestore(map[id]);
			}
		});

		btn.down('.closer').on('click',function(e){
			var id = e.getTarget('.window-minimized',null,true).id;
			map[id].close();
		});
	},


	unregister: function(window){
		Ext.Array.remove(this.registry,window);

		if(window.minimizedButton){
			window.minimizedButton.remove();
		}
	},


	handleClose: function(window){
		this.unregister(window);
	},


	handleMinimize: function(window){
		var btn = window.minimizedButton;
		window.minimized = true;
		window.hide();
		btn.show();
	},


	handleRestore: function(window){
		window.show();
		window.minimizedButton.hide();
	},


	handleTitleChange: function(){}


});
