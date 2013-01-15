Ext.define('NextThought.view.whiteboard.editor.mixins.ToolOptionsState', {

	constructor: function(){
		var t = this.callParent(arguments);

		this.toolOptionsState = NextThought.view.whiteboard.editor.mixins.ToolOptionsState;
		this.on( 'afterrender', function(){
			this.on('wb-tool-change', this.toolChange);
			this.on('wb-options-change', this.toolOptionsChange);
			//Select previous choices
			this.applyPrevioustoolState();
		});

		return t;
	},

	applyPrevioustoolState: function(){
		var tool = this.toolOptionsState.selectionsConfig.activeTool;
		var options = this.toolOptionsState.selectionsConfig.options;
		if(tool ){
			this.toolbar.setCurrentTool(tool);
			//Set options now.
			this.toolbar.getCurrentTool().setOptions(options);
		}
	},

	toolChange: function(tools){
		var t = tools.down('button[pressed]').tool;
		console.log('tool was changed to: ', t);
		this.toolOptionsState.saveToolState('activeTool', t);
	},

	toolOptionsChange: function(tool){
		this.toolOptionsState.saveToolOptionState('options', tool.getOptions());
	},

	statics: {
		selectionsConfig: {},

		saveToolOptionState: function(name, state){
			this.selectionsConfig[name] = state;
			console.log('save the state: ', state,' for: ', name);
		},
		saveToolState: function(name, state){
			//remove previous selections
			delete this.selectionsConfig;
			this.selectionsConfig = {};
			this.selectionsConfig[name] = state;
		}
	}

});