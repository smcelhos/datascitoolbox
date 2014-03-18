define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "dijit/_WidgetBase",
    "../d3/d3",
    "./d3-bullet"
], function (declare, lang, Memory, Observable, _WidgetBase, d3, d3Bullet) {

        // Summary:
        //      widgets.charting.BulletGraph
        //      A simple wrapper around, d3 version of bullet grap.  Simply renders when data is set, or on data change.


        
        /**
        * A series of bullets
        **/
        var BulletGraph = declare([_WidgetBase], {
            orient: "left",  
            tickFormat: null,
            store: null, // A store, for
            duration: 600, // animation duration
            idProperty: "id", // property that dicatates id, ids are necessary for observable to work correctly
            titleProperty: "title", // title property in data
            subTitleProperty: "subtitle", // subTitle Property in data
            rangeProperty: "ranges", // ranges property in data
            measureProperty: "measures", // measure property in data
            markerProperty: "markers", // marker property in data
            _setStoreAttr: function (store) {
                // summary:
                //      store setter

                // do initial query, and set-up observable
                var dataSet = store.query({});

                if (dataSet.observe) {
                    // set-up change listener
                    dataSet.observe(this.dataChange.bind(this), true);
                }
                this._set("store", store);
                // render
                this.buildGraphics();

                // inform any watch properties and such
                
            },
            constructor: function (args) {
                // initialize
                this.margin = { top: 5, right: 40, bottom: 20, left: 120 };
                this.width = 400;
                this.height = 50;

                
                
                // calculated dimensions
                this.width = this.width - this.margin.left - this.margin.right;
                this.height = this.height - this.margin.top - this.margin.bottom;
                lang.mixin(this, args);

            },
            startup: function() {
                this.inherited(arguments);
                  
            },
            
            dataChange: function (data, oldIndex, newIndex) {
                // summary:
                //      When resultSet for this.store.query({}) changes this function should fire
                //      essentially just tell svg to redraw
              
                var store = this.store;
                var idProperty = store.idProperty;
				
				if(oldIndex === -1){
					// data point added, we need new start
					 this.buildGraphics();
					 return;
					
				}
				if(newIndex === -1){
					var removed = this.svg.filter(function(d){ return d[idProperty] === data[idProperty]});
					removed.remove();
					return;
				}
				
                this.svg.datum(function (d) {
                    return store.get(d[idProperty]); // the store has already been updated, we just need to animate
                }).call(this.chart.duration(this.duration));
				

            },
            
            buildGraphics: function() {
                var margin = this.margin;
                var width = this.width;
                var height = this.height;
                
                var store = this.store;
                var dataSet = store.query({});

                var chart = d3.bullet(this.getBulletProps())
                    .width(width)
                    .height(height);

                this.chart = chart;

                var svg = d3.select(this.domNode).selectAll("svg")
                  .data(dataSet)
                .enter().append("svg")
                  .attr("class", "bullet")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(this.chart.duration(this.duration));



				
                this.svg = svg ;
                // build actual chart
                chart(svg);

                this.buildTitle(svg, height);                

                
            },
            
            buildTitle: function(svg, height) {
				var titleProperty = this.titleProperty;
				var subTitleProperty = this.subTitleProperty;
			
                var title = svg.append("g")
                    .style("text-anchor", "end")
                    .attr("transform", "translate(-6," + height / 2 + ")");

                title.append("text")
                    .attr("class", "title")
                    .text(function (d) { return d[titleProperty]; });

                title.append("text")
                    .attr("class", "subtitle")
                    .attr("dy", "1em")
                    .text(function (d) { return d[subTitleProperty]; });
            },

            getBulletProps: function() {
                return {
                    width: this.width,
                    height: this.height,
                    rangeProperty: this.rangeProperty,
                    measureProperty: this.measureProperty,
                    markerProperty: this.markerProperty,
					titleProperty: this.titleProperty,
					subTitleProperty: this.subTitleProperty,
                    duration: this.duration
                };
            }
        });

       

        return BulletGraph;
    });