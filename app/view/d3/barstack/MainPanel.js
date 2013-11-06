/**
 * @class
 * @memberOf App.view.d3.barstack
 * @description Stacked bar chart
 */
Ext.define('App.view.d3.barstack.MainPanel', {
	extend: 'Ext.Panel',
	alias: 'widget.barstackMainPanel',
	title: 'Bar Chart',
	closable: true,
	
	requires: [
		'App.util.MessageBus',
		'App.util.d3.StackedBarChart'
	],
	
	layout: 'fit',
	
	initComponent: function() {
		var me = this;
		
		/**
 		 * @properties
 		 * @description SVG properties
 		 */
 		me.svgInitialized = false,
 			me.graphData = [],
 			me.originalGraphData = [],
 			me.canvasWidth,
 			me.canvasHeight,
 			me.svg,
 			me.g,
 			me.panelId,
 			me.stackedBarChart = null,
 			me.eventRelay = Ext.create('App.util.MessageBus');
		
		/**
 		 * @property
 		 */
		me.chartDescription = '<b>Stacked Bar Chart</b><br><br>'
		 	+ '<i>Van Halen album sales in US and Canada.  Data from Wikipedia (for the most part)</i><br><br>'
			+ 'Demonstration of a D3 stacked bar chart using stack layout. Use the toolbar buttons view transitions and rescaling.';
			
		/**
		 * @property
		 * @description Message event relay
		 */
		me.eventRelay = Ext.create('App.util.MessageBus');
			
		/**
 		 * @properties
 		 * @description layout vars
 		 */
		me.width = parseInt((Ext.getBody().getViewSize().width - App.util.Global.westPanelWidth) * .95);
		me.height = parseInt(Ext.getBody().getViewSize().height - App.util.Global.titlePanelHeight);
		
		/**
 		 * @listener
 		 * @description On activate, publish a new message to the "Info" panel
 		 */
		me.on('activate', function() {
			me.eventRelay.publish('infoPanelUpdate', me.chartDescription);
		}, me);
		
		//////////////////////////////////////////////////
		// button configurations
		//////////////////////////////////////////////////
		me.albumRemoveButton = Ext.create('Ext.button.Button', {
			text: 'Remove From Right',
			tooltip: 'Transition demonstration',
			handler: function() {
				var newData = me.albumRemove();
				me.stackedBarChart.setGraphData(newData);
				me.stackedBarChart.transition();
			},
			scope: me
		}, me);
		
		me.albumRevertButton = Ext.create('Ext.button.Button', {
			text: 'Revert Data',
			tooltip: 'Revert back to original data',
			handler: function() {
				me.albumRevert();
			},
			scope: me,
			disabled: true
		}, me);
		
		/**
		 * @property
		 * @type Ext.toolbar.Toolbar
		 */
		me.tbar =[
			{xtype: 'tbtext', text: '<b>Van Halen Album Sales (US/Canada)</b>'},
			{xtype: 'tbspacer', width: 20},
			me.albumRemoveButton,
			'-',
			me.albumRevertButton
		];
		
		/**
 		 * @listener
 		 * @description After render, initialize the canvas
 		 */
		me.on('afterrender', function(panel) {
			me.initCanvas();
		}, me);
		
		me.callParent(arguments);
	},
	
	/**
 	 * @function
 	 * @memberOf App.view.d3.barstack.MainPanel
 	 * @description Initialize the drawing canvas
 	 */
 	initCanvas: function() {
 	
 		var me = this;
	 	
	 	// initialize SVG, width, height
 		me.svgInitialized = true,
 			me.canvasWidth = parseInt(me.getWidth() * .95),
 			me.canvasHeight = parseInt(me.getHeight() * .95) - 35,
 			me.panelId = '#' + me.body.id;
	 	
	 	// init svg
	 	me.svg = d3.select(me.panelId)
	 		.append('svg')
	 		.attr('width', me.canvasWidth)
	 		.attr('height', me.canvasHeight);
	 		
	 
	 
  	
 
	 		
	 	me.stackedBarChart = Ext.create('App.util.d3.StackedBarChart', {
			svg: me.svg,
			canvasWidth: me.canvasWidth,
			canvasHeight: me.canvasHeight,
			panelId: me.panelId,
			margins: {
				top: 40,
				right: 5,
				bottom: 20,
				left: 80
			},
			tooltipFunction: function(data, index) {
				return '<b>' + data.id + '</b><br>'
				+ data.category + ' Sales: '
				+ Ext.util.Format.currency(data.y, false, 0, false);
			}
		});
		
		// retrieve the graph data via AJAX and load the visualization
		Ext.Ajax.request({
			url: 'data/album_sales.json',
	 		method: 'GET',
	 		success: function(response) {
	 			var resp = Ext.JSON.decode(response.responseText);
	 			
	 			Ext.each(resp.data, function(rec) {
		 			me.graphData.push(rec);
		 			me.originalGraphData.push(rec);
		 		}, me);
		 		
		 		me.stackedBarChart.setGraphData(me.graphData);
		 		me.stackedBarChart.draw();
		 	},
		 	scope: me
		 });
		 
		 /*	normalizeChartData: function(dataObject) {
  	
  		var me = this;
  		
  		// me.selectedFiscalYear
  		// me.selectedQualifier (team|office)
  		// me.selectedMetric (hours|dollars)
  		// me.selectedValue (absolute | percent)
  		// me.selectedSplit (off|on)
  		
  		var ret = me.normalizeAbsolute(dataObject);
  		if(me.selectedValue == 'percent') {
	  		ret = me.normalizePercent(ret);
	  	}
	  	
	  	return ret;
  	},normalizeAbsolute: function(dataObject) {
  		var me = this,
  			ret = [];
  		
  		Ext.each(dataObject, function(item) {
	  	
	  		// match 'hours' or 'dollars'
	  		if(item.unit == me.selectedMetric) {
		  		var ind = 0;
		  		
	  			Ext.each(item.seriesLabels, function(label) {
		  			var values = me.getSeriesData(item.data, ind, label);
		  			
	  				ret.push({
			  			category: label,
			  			values: values
			  		});
			  		
			  		ind++;
			  		
		  		}, me);
	  		}
	  	}, me);
	  	
	  	return ret;
	  	normalizePercent() : func
	  	var idTotals = [],
			uniqueIds = [];
		
		// retrieve unique ID values from the first array
	  	Ext.each(normalizedData[0].values, function(obj) {
	  		uniqueIds.push(obj.id);
	  		idTotals.push(0);
	  	});
	  	
	  	// run through the data and sum up totals per ID
	  	for(var i=0; i<normalizedData.length; i++) {
		  	var plucked = Ext.pluck(normalizedData[i].values, 'y'),
		  		j = 0;
			
			plucked.map(function(el) {
				idTotals[j] += el;
				j++;
			});
		}
		
		// now, run through the normalized data again and calculate
		// percentage
		Ext.each(normalizedData, function(obj) {
			var ind = 0;
			
			Ext.each(obj.values, function(item) {
				item.y = (item.y/idTotals[ind] * 100);
				ind++;
			});
		});
		
		return normalizedData;
		*/
 	},
 	
 	/**
  	 * @function
  	 * @memberOf App.view.d3.barstack.MainPanel
  	 * @description Transition to new data set
  	 */
 	transition: function() {
	 	var me = this;
	 	
		me.stackedBarChart.setGraphData(newData);
		me.stackedBarChart.transition();
 	},
 	
 	/**
  	 * @function
  	 * @memberOf App.view.d3.barstack.MainPanel
  	 * @description Remove the last album from the layers in the data object
  	 */
  	albumRemove: function() {
	  	var me = this,
	  		slicedData = [];
		
		Ext.each(me.graphData, function(item) {
			slicedData.push({
				category: item.category,
				values: item.values.slice(0, item.values.length-1)
			});
		}, me);
		
		me.albumRevertButton.enable();
		
		if(slicedData[0].values.length == 1) {
			me.albumRemoveButton.disable();
		}
		
		me.graphData = slicedData;
		
		return slicedData;
  	},
  	
  	/**
   	 * @function
   	 * @description Revert back to original graphData values
   	 */
  	albumRevert: function() {
  		var me = this;
  		
  		me.graphData = me.originalGraphData;
  	
  		me.stackedBarChart.setGraphData(me.graphData);
		me.stackedBarChart.transition();
		
		me.albumRemoveButton.enable();
  	}
});
