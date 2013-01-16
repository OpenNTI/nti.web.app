Ext.define('NextThought.view.whiteboard.editor.mixins.ToolOptionsState', {

	constructor: function(){
		this.toolOptionsState = NextThought.view.whiteboard.editor.mixins.ToolOptionsState;
		this.on( 'afterrender', function(){
			this.on('wb-tool-change', this.toolChange);
			this.on('wb-options-change', this.toolOptionsChange);
			//Select previous choices
			this.applyPrevioustoolState();
		});
		return this;
	},

	applyPrevioustoolState: function(){
		var tool = this.getCurrentState().activeTool,
			options = this.getCurrentState().options;
		if(tool ){
			this.toolbar.setCurrentTool(tool);
			//Set options now.
			this.toolbar.getCurrentTool().setOptions(options);
		}
	},

	toolChange: function(tools){
		var t = tools.down('button[pressed]').tool,
			options = this.toolbar.getCurrentTool().getOptions();

		this.toolOptionsState.saveToolState('activeTool', t);
		//Save the options as well -- keep them in sync.
		this.toolOptionsState.saveToolOptionState('options', options);
	},

	toolOptionsChange: function(toolOptions){
		var currentTool = this.toolbar.getCurrentTool().forTool;
		this.toolOptionsState.saveToolOptionState('options', toolOptions.getOptions());
		this.toolOptionsState.saveToolState('activeTool', currentTool);
	},

	getCurrentState: function(){
		return this.toolOptionsState.selectionsConfig;
	},

	statics: {
		selectionsConfig: {},

		saveToolOptionState: function(name, state){
			this.selectionsConfig[name] = state;
		},
		saveToolState: function(name, state){
			this.selectionsConfig[name] = state;
		}
	}

});
