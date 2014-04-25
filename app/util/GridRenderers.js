/**
 * @class
 * @memberOf App.util
 * @description Common grid rendering functions
 */
Ext.define('App.util.GridRenderers', {
	statics: {
		emptyValueMarker: '--',
		
		toCurrency: function(num) {
			if(!isNaN(num)) {
				return Ext.util.Format.currency(num, '$', false, false);
			}
			return this.emptyValueMarker;
		},
		
		toWholeDollarCurrency: function(num) {
			if(!isNaN(num)) {
				return Ext.util.Format.currency(num, false, '0', false);
			}
			return this.emptyValueMarker;
		},
		
		// wrap text
		wordWrap: function(value) {
			return '<div style="white-space:normal !important">' + value + '</div>';
		},
		
		// int to IP address
		longToIp: function(value) {
			var ret = '';
			
			if(!isNaN(value) && value.toString().length >=1 && (value >= 0 || value <= 4294967295)) {
				ret = Math.floor(value / Math.pow(256, 3))
				+ '.'
				+ Math.floor((value % Math.pow(256, 3)) / Math.pow(256, 2))
				+ '.'
				+ Math.floor(((value % Math.pow(256, 3)) % Math.pow(256, 2)) / Math.pow(256, 1))
				+ '.'
				+ Math.floor((((value % Math.pow(256, 3)) % Math.pow(256, 2)) % Math.pow(256, 1)) / Math.pow(256, 0));
			}
			
			return ret;
		},
		
		/**getHexComplement: function(hex) {
		
		
		
		
	

function getHexComplement(hex) {
    var colorAsInt = parseInt(hex.substring(1), 16);
    
    var complement = 0xFFFFFFFF ^ colorAsInt;
    
    console.log(complement);
    console.log(complement.toString(16));
}

getHexComplement('#FFCC33');


var hex = '#FFCC33';
var color = parseInt(hex.substring(1), 16);
var complement = 0xffffff ^ color;

console.log(complement);

console.log(complement.toString(16));
*/
	}
});