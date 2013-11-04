/**
 * @class
 * @memberOf App.view.d3.barlegend
 * @description SVG panel
 * @extend Ext.panel.Panel
 */
Ext.define('App.view.d3.barlegend.GridPanel', {
	extend: 'Ext.grid.Panel',
	plain: true,
	autoScroll: true,
	title: 'Grid',
	
	listeners: {
	},
	
	initComponent: function() {
		var me = this;
		
		/**
 		 * @property
 		 * @description Column definitions
 		 */
 		me.columns = [
 			App.util.ColumnDefinitions.movieTitle,
 			App.util.ColumnDefinitions.grossBO,
 			App.util.ColumnDefinitions.numTheaters,
 			App.util.ColumnDefinitions.openingBO,
 			App.util.ColumnDefinitions.releaseDate,
 			App.util.ColumnDefinitions.imdbRating
		];
		
		me.callParent(arguments);
	}		
});