/**
 * This class is experimental, it does not totally work right.  However it can probably be fixed at some point so I've checked it in.
 * As of the checkin time, it is not referenced anywhere and will be tossed out by the minification process which is just fine.
 */

Ext.define('NextThought.view.whiteboard.CollisionDetection', {
    singleton: true,


    normal: function(vect) {
        return [vect[1],-vect[0]];
    },


    normalize: function (vect){
        return [vect[0]/this.magnitude(vect),vect[1]/this.magnitude(vect)];
    },


    dot_product: function(v1,v2){
        var dot = 0;
        for(var i=0;i<v1.length;i++){
            dot+=v1[i]*v2[i];
        }
        return dot;
    },


    magnitude: function(vect){
        return (Math.sqrt(vect[0]*vect[0]+vect[1]*vect[1]));
    },


    is_colliding: function(obj1, obj2){
        var w1 = obj1.width;
        var h1 = obj1.height;
        var x1 = obj1.x;
        var y1 = obj1.y;
        var angle_1 = obj1.angle;

        var w2 = obj2.width;
        var h2 = obj2.height;
        var x2 = obj2.x;
        var y2 = obj2.y;
        var angle_2 = obj2.angle;

        var axes = [];
        axes[0] = this.normal([Math.cos(angle_1),Math.sin(angle_1)]);
        axes[1] = this.normal([Math.cos(angle_1+Math.PI/2),Math.sin(angle_1+Math.PI/2)]);
        axes[2] = this.normal([Math.cos(angle_2),Math.sin(angle_2)]);
        axes[3] = this.normal([Math.cos(angle_2+Math.PI/2),Math.sin(angle_2+Math.PI/2)]);

        var l1 = Math.sqrt(w1*w1+h1*h1);
        var l2 = Math.sqrt(w2*w2+h2*h2);
        var ang1 = Math.atan2(h1,w1);
        var ang2 = Math.atan2(h2,w2);

        for (var j=0;j<4;j++){
            var p1 = [];
            var p2 = [];

            for (var i=0;i<4;i++){
                var newAng1 = angle_1;
                var newAng2 = angle_2;
                if (i===0){
                    newAng1 += ang1;
                    newAng2 += ang2;
                }
                else if (i===1){
                    newAng1 += Math.PI-ang1;
                    newAng2 += Math.PI-ang2;
                }
                else if (i===2){
                    newAng1 += Math.PI+ang1;
                    newAng2 += Math.PI+ang2;
                }
                else{
                    newAng1 -= ang1;
                    newAng2 -= ang2;
                }
                var point1 = [x1+l1*Math.cos(newAng1), y1+l1*Math.sin(newAng1)];
                point1 = this.dot_product(point1,axes[j])/this.magnitude(axes[j]);
                var point2 = [x2+l2*Math.cos(newAng2), y2+l2*Math.sin(newAng2)];
                point2 = this.dot_product(point2,axes[j])/this.magnitude(axes[j]);

                if ((point1<p1[0]) || (!p1[0]))
                    p1[0] = Math.round(point1);
                if ((point1>p1[1]) || (!p1[1]))
                    p1[1] = Math.round(point1);
                if ((point2<p2[0]) || (!p2[0]))
                    p2[0] = Math.round(point2);
                if ((point2>p2[1]) || (!p2[1]))
                    p2[1] = Math.round(point2);
            }
            if (!this.is_touching(p1,p2))
                return false;
        }
        return true;
    },


    is_touching: function(p1,p2){
        if ((p2[1]>=p1[0]) && (p2[1]<=p1[1]))
            return true;
        else if ((p2[0]<=p1[1]) && (p2[0]>=p1[0]))
            return true;
        else if ((p1[0]>p2[0]) && (p1[1]<p2[1]))
            return true;
        else if ((p2[0]>p1[0]) && (p2[1]<p1[1]))
            return true;
        else
            return false;
    }
},
function(){
    window.CollisionDetection = this;
});

