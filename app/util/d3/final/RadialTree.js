/**
 * @class
 * @author Mark Fehrenbacher (kendopunk@hotmail.com)
 * @memberOf App.util.d3.final
 * @description Radial treemap (sunburst)
 */
Ext.define('App.util.d3.final.RadialTree', {
	
	svg: null,
	gTitle: null,
	gLabel: null,
	gLegend: null,

	canvasWidth: 300,
	canvasHeight: 300,
	
	dataMetric: 'count',
	
	radius: null,
	colorScale: d3.scale.category20(),
	
	partition: null,
	arc: null,
	path: null,
	
	/**
 	 * CONSTRUCTOR
 	 */
	constructor: function(config) {
		var me = this;
		
		Ext.apply(me, config);
	},
	
	/**
 	 * @function
 	 * @description Initial drawing
 	 */
 	draw: function() {
	 	var me = this;
	 	
	 	var colorScale = me.colorScale,
	 		dataMetric = me.dataMetric,
	 		cfn = me.computeTextRotation;
	 	
	 	if(me.radius == null) {
		 	me.radius = Math.min(me.canvasWidth, me.canvasHeight)/3;
		}
 	
 		me.partition = d3.layout.partition()
    		.sort(null)
    		.size([2 * Math.PI, me.radius * me.radius])
    		.value(function(d) {
	    		if(dataMetric == 'count') {
		    		return 1;
		    	}
		    	return d[dataMetric];
		    });
    
    	me.arc = d3.svg.arc()
    		.startAngle(function(d) { return d.x; })
    		.endAngle(function(d) { return d.x + d.dx; })
    		.innerRadius(function(d) { return Math.sqrt(d.y); })
    		.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

    		
    	me.path = me.svg.datum(me.graphData)
    		.selectAll('path')
			.data(me.partition.nodes)  // count
	    	.enter()
	    	.append('path')
	    	.attr('display', function(d) {
		    	return d.depth ? null : 'none';	// hide inner ring
		    })
		    .attr('d', me.arc)
		    .style('stroke', '#FFFFFF')
		    .style('fill', function(d) {
			    return colorScale((d.children ? d : d.parent).name);
			})
			.style('fill-rule', 'evenodd')
			.each(me.stash);
 	},
 	
 	computeTextRotation: function(d) {
	 	var me = this;
	 	
 		var xScale = d3.scale.linear().range([0, 2 * Math.PI]);
 
 		var yScale = d3.scale.linear().range([0, me.radius]);
 	
 		return (xScale(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
 	
 	},
 	
 	transition: function() {
	 	var me = this;
		var dataMetric = me.dataMetric;
	 	me.path.data(me.partition.value(function(d) {
		 	if(dataMetric == null || dataMetric == 'count') {
			 	return 1;
			}
			return d[dataMetric];
	 	}).nodes)
	 	.transition()
	 	.duration(500)
	 	.attrTween('d', function(a) {
		 	return me.arcTween(a);
		 });
 	},
 	
 	stash: function(d) {
	 	d.x0 = d.x;
	 	d.dx0 = d.dx;
	},
	
	arcTween: function(a) {
		var me = this;
		
		//console.debug(me.arc);
		
		var arc = me.arc;
		
		//var arc = me.arc;
		
		/*var arc = d3.svg.arc()
    		.startAngle(function(d) { return d.x; })
    		.endAngle(function(d) { return d.x + d.dx; })
    		.innerRadius(function(d) { return Math.sqrt(d.y); })
    		.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });*/
    		
		//console.log('In arcTween()...');
		//console.debug(arc);
		
		var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
		
		return function(t) {
			var b = i(t);
			a.x0 = b.x;
			a.dx0 = b.dx;
			return arc(b);
		};
	},
	
	setDataMetric: function(metric) {
		var me = this;
		
		me.dataMetric = metric || 'count';
	}
});