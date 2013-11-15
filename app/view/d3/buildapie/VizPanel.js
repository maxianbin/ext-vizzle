/**
 * @class
 * @author Mark Fehrenbacher (kendopunk@hotmail.com)
 * @memberOf App.view.d3.buildapie
 * @description SVG panel
 * @extend Ext.panel.Panel
 */
Ext.define('App.view.d3.buildapie.VizPanel', {
	extend: 'Ext.panel.Panel',
	plain: true,
	autoScroll: true,
	
	requires: [
		'App.util.d3.BarChart',
	],
	
	listeners: {
		afterrender: function(panel) {
			panel.eventRelay.publish('BuildABarPanelRendered', true);
			
			panel.dropTarget = Ext.create('Ext.dd.DropTarget', panel.body.dom, {
		 		ddGroup: 'vizPanelDDGroup',
		 		notifyEnter: function(ddSource, e, data) {
			 		console.log('entered panel...');
			 	},
			 	notifyDrop: function(ddSource, e, data) {
			 		if(!panel.svgInitialized) {
			 			panel.initCanvas(data.records);
			 		} else {
				 		panel.transitionCanvas(data.records);
			 		}
				 	return true;
				}
			});
		}
	},
	
	initComponent: function() {
		var me = this;
		
		/**
 		 * @properties
 		 * @description SVG properties
 		 */
 		me.svgInitialized = false,
 			me.graphData = [],
 			me.canvasWidth,
 			me.canvasHeight,
 			me.svg,
 			me.g,
 			me.panelId,
 			me.pieChart = null,
 			me.defaultMetric = 'price',
 			me.currentMetric = 'price',
 			me.defaultMetricText = 'Price',
 			me.baseTitle = 'Pie Chart from Stock Data',
 			me.eventRelay = Ext.create('App.util.MessageBus'),
 			me.dropTarget;
 			
 		/**
  		 * @property
  		 */
  		me.eventRelay = Ext.create('App.util.MessageBus');
 			
 		////////////////////////////////////////
 		// button configs for 
 		// price
 		// change
 		// % change
 		////////////////////////////////////////
 		me.priceButton = Ext.create('Ext.button.Button', {
 			text: 'Price',
 			disabled: true,
 			metric: 'price',
 			iconCls: 'icon-tick',
 			handler: me.transitionHandler,
 			scope: me
 		});
 		
 		me.changeButton = Ext.create('Ext.button.Button', {
 			text: 'Change',
 			disabled: true,
 			metric: 'change',
 			handler: me.transitionHandler,
 			scope: me
 		});
 		
 		me.pctChangeButton = Ext.create('Ext.button.Button', {
 			text: '% Change',
 			disabled: true,
 			metric: 'pctChange',
 			handler: me.transitionHandler,
 			scope: me
 		});
 		
 		me.revertButton = Ext.create('Ext.button.Button', {
	 		text: 'Clear/Revert',
	 		iconCls: 'icon-refresh',
	 		disabled: true,
	 		handler: function(btn, e) {
		 		btn.disable();
		 		
		 		me.graphData = [];
		 		me.pieChart.setGraphData(me.graphData);
		 		me.pieChart.transition();
		 		
	 			me.eventRelay.publish('BuildABarRevert');
	 		}
	 	});
 		
 		/**
  		 * @property
  		 * @description Toolbar 
  		 */
  		me.tbar = [
  			me.priceButton,
  			{xtype: 'tbspacer', width: 10},
  			me.changeButton,
  			{xtype: 'tbspacer', width: 10},
  			me.pctChangeButton,
  			'->',
  			me.revertButton
  		];
  		 
		me.callParent(arguments);
	},
	
	/**
 	 * @function
 	 * @memberOf App.view.d3.buildapie.VizPanel
 	 * @description Initialize the drawing canvas
 	 * @param records Array of record objects
 	 */
 	initCanvas: function(records) {
	 	var me = this;
	 	
	 	me.getEl().mask('Drawing...');
	 	
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
	 		
	 	// init graph data
	 	Ext.each(records, function(rec) {
		 	me.graphData.push(rec.data);
		}, me);
		
		// notify grid
		me.eventRelay.publish('BuildABarRecordAdd', records);
		
		// enabled buttons
		Ext.each(me.getDockedItems()[0].query('button'), function(btn) {
			btn.enable();
		}, me);
		
		// init pie chart
 		me.pieChart = Ext.create('App.util.d3.PieChart', {
			svg: me.svg,
			canvasWidth: me.canvasWidth,
			canvasHeight: me.canvasHeight,
			margins: {
				top: 40
			},
			graphData: me.graphData,
			panelId: me.panelId,
			chartTitle: me.generateChartTitle(me.defaultMetricText),
			showLabels: true,
			labelFunction: function(data, index) {
				return data.ticker;
			},
			tooltipFunction: function(data, index) {
				return '<b>' + data.name + '</b> (' + data.ticker + ')<br><br>'
					+ 'Close Price: ' + Ext.util.Format.currency(data.price)
					+ '<br>'
					+ 'Change: ' + Ext.util.Format.currency(data.change)
					+ '<br>'
					+ '% Change: ' + Ext.util.Format.number(data.pctChange, '0,000.0') + '%';
			},
			dataMetric: me.defaultMetric
		}, me);
		
		me.pieChart.draw();
		
		me.getEl().unmask();
	},
	
	/**
 	 * @function
 	 */
	transitionCanvas: function(records) {
		var me = this;
		
		Ext.each(records, function(rec) {
			me.graphData.push(rec.data);
		}, me);
		
		// enable revert button
		me.revertButton.enable();
		
		// notify grid
		me.eventRelay.publish('BuildABarRecordAdd', records);
		
		me.pieChart.setGraphData(me.graphData);
		me.pieChart.transition();
	},
	
	/**
	 * @function
	 */
	transitionHandler: function(btn, event) {
		var me = this;
		
		btn.setIconCls('icon-tick');
		me.pieChart.setChartTitle(me.generateChartTitle(btn.text));
		
		// adjust the buttons
		if(btn.text == 'Change') {
			me.priceButton.setIconCls('');
			me.pctChangeButton.setIconCls('');
		} else if(btn.text == '% Change') {
			me.priceButton.setIconCls('');
			me.changeButton.setIconCls('');
		} else {
			me.changeButton.setIconCls('');
			me.pctChangeButton.setIconCls('');
		}
		
		me.pieChart.setDataMetric(btn.metric);
		me.pieChart.transition();
	},
	
	/** 
	 * @function
	 * @private
	 * @description Set a new chart title
	 */
	generateChartTitle: function(append) {
		var me = this;
		
		return me.baseTitle + ' : ' + append;
	}
});
