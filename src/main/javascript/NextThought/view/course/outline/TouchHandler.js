Ext.define('NextThought.view.course.outline.TouchHandler', {
    extend: 'NextThought.modules.TouchHandler',

    alias: 'outline.touchHandler',

    setupHandlers: function() {
        var topContainer = this.container,
            leftSide = topContainer,
            rightPanel = this.getRightPanel(),
            leftPanel = this.getLeftPanel(),
            panel;

        if(this.left === true){
            panel = leftPanel;
        }
        else{
            panel = rightPanel;
        }

        //container.isScrollable = true;

        leftSide.on('touchScroll', function(ele, deltaY) {
            console.log("deltaY:" + deltaY);
            console.log("this.getPanel:" + this.getPanel());
            panel.scrollBy(0, deltaY, false);
        }, this);

        leftSide.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
        leftSide.on('touchTap', this.clickElement);
        leftSide.on('touchElementAt', this.elementAt);

       // rightSide.on('touchScroll', function(ele, deltaY) {
       //     console.log("deltaY:" + deltaY);
       //     console.log("this.getPanel:" + this.getPanel());
       //     this.getRightPanel().scrollBy(0, deltaY, false);
       // }, this);

       // rightSide.on('touchElementIsScrollable', function(ele, callback) {
        //    callback(true);
        //});

        ///rightSide.on('touchElementAt', function(x,y, callback) {
        //    var element = Ext.getDoc().dom.elementFromPoint(x, y);
        //    callback(element);
       // });
    },

    getLeftPanel: function() {
        return this.container.getEl()
            //.down('.course-outline')
            .down('.lesson-list');
    },

    getRightPanel: function() {
        return this.container.getEl();
    }
});