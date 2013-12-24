/**
 * @class
 * @author Mark Fehrenbacher (kendopunk@hotmail.com)
 * @memberOf App.view.d3.buildabar
 * @description SVG panel
 * @extend Ext.panel.Panel
 */
Ext.define('App.view.d3.buildabar.VizPanel', {
	extend: 'Ext.panel.Panel',
	plain: true,
	autoScroll: true,
	
	requires: [
		'App.util.d3.final.BarChart',
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
 			me.barChart = null,
 			me.defaultMetric = 'price',
 			me.currentMetric = 'price',
 			me.defaultMetricText = 'Price',
 			me.baseTitle = 'Random Stock Data',
 			me.eventRelay = Ext.create('App.util.MessageBus'),
 			me.dropTarget,
 			me.btnHighlightCss = 'btn-highlight-khaki';
 			
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
 			cls: me.btnHighlightCss,
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
		 		me.barChart.setGraphData(me.graphData);
		 		me.barChart.transition();
		 		
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
 	 * @memberOf App.view.d3.buildabar.VizPanel
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

		// build the chart
	 	me.barChart = Ext.create('App.util.d3.final.BarChart', {
			svg: me.svg,
			canvasWidth: me.canvasWidth,
			canvasHeight: me.canvasHeight,
			graphData: me.graphData,
			dataMetric: me.defaultMetric,
			panelId: me.panelId,
			showLabels: true,
			labelFunction: function(data, index) {
				return data.ticker;
			},
			margins: {
				top: 20,
				right: 10,
				bottom: 10,
				left: 100,
				leftAxis: 85
			},
			tooltipFunction: function(data, index) {
				return '<b>' + data.name + '</b> (' + data.ticker + ')<br><br>'
					+ 'Close Price: ' + Ext.util.Format.currency(data.price)
					+ '<br>'
					+ 'Change: ' + Ext.util.Format.currency(data.change)
					+ '<br>'
					+ '% Change: ' + Ext.util.Format.number(data.pctChange, '0,000.0') + '%';
			},
			handleEvents: false,
			chartTitle: me.generateChartTitle(me.defaultMetricText),
			yTickFormat: App.util.Global.svg.currencyTickFormat
		}, me);
		
		me.barChart.draw();
		
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
		
		me.barChart.setGraphData(me.graphData);
		me.barChart.transition();
	},
	
	/**
	 * @function
	 */
	transitionHandler: function(btn, event) {
		var me = this;
		
		btn.addCls(me.btnHighlightCss);
		
		me.barChart.setChartTitle(me.generateChartTitle(btn.text));
		
		// adjust the buttons
		if(btn.text == 'Change') {
			me.priceButton.removeCls(me.btnHighlightCss);
			me.pctChangeButton.removeCls(me.btnHighlightCss);
			
			me.barChart.setYTickFormat(App.util.Global.svg.currencyTickFormat);
		} else if(btn.text == '% Change') {
			me.priceButton.removeCls(me.btnHighlightCss);
			me.changeButton.removeCls(me.btnHighlightCss);
			
			me.barChart.setYTickFormat(App.util.Global.svg.percentTickFormat);
		} else {
			me.changeButton.removeCls(me.btnHighlightCss);
			me.pctChangeButton.removeCls(me.btnHighlightCss);
			
			me.barChart.setYTickFormat(App.util.Global.svg.currencyTickFormat);
		}
		
		me.barChart.setDataMetric(btn.metric);
		me.barChart.transition();
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