
CENTER_WIDTH = 768;
MIN_SIDE_WIDTH = 175;
MIN_WIDTH = 768;




function fixIE(){
    if(!Ext.isIE) return;

    Ext.panel.Panel.override({
        render: function(){
            this.callOverridden(arguments);
            var d=this.el.dom;
            d.firstChild.unselectable = true;
            d.unselectable = true;
        }
    });
}

function beforeRequest(connection,options)
{
    if(options&&options.async===false){
        var loc = '';
        try { loc = printStackTrace().splice(7); }
        catch (e) { loc = e.stack || e.stacktrace; }
        console.log('WARNING: Synchronous Call in: ', loc, ' Options:', options );
    }
}

function resizeBlocker(w, h, e){
    var i = !!(w<MIN_WIDTH), b = Ext.getBody(), m = b.isMasked();
    if(i && !m) b.mask("Your browser window is too narrow","viewport-too-small");
    else if(!i && m) b.unmask();
}

function encodeDate(d) {
    return Ext.Date.format(d, 'U');
}

function arrayEquals(a, b) {
    if (a.length != b.length) return false;
    return Ext.Array.merge(a, b).length == a.length;
}