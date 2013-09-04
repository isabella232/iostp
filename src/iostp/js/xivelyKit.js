"use strict";

function XivelyKit(myname) {
    this.name = myname;
    this.graphs = {};
}

XivelyKit.prototype = new ObservationKit();  //inherit ObservationKit

// Set xively API Key
XivelyKit.prototype.setApiKey = function(key) {
	xively.setKey(key);
};

XivelyKit.prototype.getGraph = function(index) {
    return this.graphs[index];
};

XivelyKit.prototype.getGraphs = function() {
    return this.graphs;
};
XivelyKit.prototype.getRickshawGraphs = function() {
    var arr = [];
    for( var key in this.graphs ) {
        if( this.graphs.hasOwnProperty(key)) {
            arr.push(this.graphs[key].getRickshawGraph());
        }
    }
    return arr;
}

XivelyKit.prototype.constructor = XivelyKit; //correct constructor prototype to point to XivelyKit

XivelyKit.prototype.getName = function() {
    return this.name;
};

XivelyKit.prototype.getType = function() {
    return "Xively Data Viewer";
};

XivelyKit.prototype.render = function() {
    return $(this.getHtml());
};

XivelyKit.prototype.getTimespan = function() {
    return this.timespan;
};
XivelyKit.prototype.setTimespan = function(t) {
    this.timespan = t;
};

XivelyKit.prototype.config = function() {
    var myKit = this;

    this.tag = "#xivelyKit-"+this.getId();

    myKit.setupGraphs(JSON.parse(myKit.getConfig()));

    var fromTimestamp = $('#fromTimestamp');
    var toTimestamp = $('#toTimestamp');
    fromTimestamp.datetimepicker( {
        onClose:function() {
            var to = toTimestamp.datetimepicker('getDate');
            var from = fromTimestamp.datetimepicker('getDate');
            var minTo = new Date(Math.min(new Date().getTime(),from.getTime()+6*60*60*1000));
            toTimestamp.datepicker('option', 'minDate', minTo);
            toTimestamp.datepicker('option', 'minDateTime', minTo);
            myKit.makeGraphs(myKit.kitConfig, from, to);
        },
        beforeShow: function(input,inst)
        {
            inst.dpDiv.css({marginLeft: '-110px'});
        }
    });
    var maxFrom = new Date( new Date().getTime() - 6*60*60*1000);
    fromTimestamp.datetimepicker('setDate', maxFrom);
    fromTimestamp.datetimepicker('option', 'maxDateTime', maxFrom);
    fromTimestamp.datetimepicker('option', 'maxDate', maxFrom);

    toTimestamp.datetimepicker( {
        onClose:function() {
            var to = toTimestamp.datetimepicker('getDate');
            var from = fromTimestamp.datetimepicker('getDate');
            var maxFrom = new Date(to.getTime() - 6*60*60*1000);
            fromTimestamp.datepicker('option', 'maxDateTime', maxFrom);
            fromTimestamp.datepicker('option', 'maxDate', maxFrom);
            myKit.makeGraphs(myKit.kitConfig, from, to);

        }
    });
    toTimestamp.datetimepicker('setDate', new Date());
    toTimestamp.datetimepicker('option', 'maxDateTime', new Date());
    toTimestamp.datetimepicker('option', 'maxDate', new Date());

    if( this.getConfig() === undefined ) {
        window.alert("here we would configure UI this kit");
    } else {
        this.kitConfig = JSON.parse(this.getConfig());
        this.makeGraphs(this.kitConfig,new Date((new Date()).getTime()-6*60*60*1000),new Date());
    }


    return this;
};

/*
 * now register it globally so it can be used elsewhere.
 */
var theKit = new XivelyKit();
//TODO:  are we hardcoding in an api key?
//       A better architecture would be to have the server generate an api key PER-SESSION and do this server-side
//       This way each key can be throttled individually so that one user can't really affect other users
theKit.setApiKey("3u1S5zDeKvppr5w177GCxzF7heAxatl88EK0htLVcpaVPUvE");   //currently set to user: robertlight's master api key

IOSTP.getInstance().register( theKit );


//*****************************************GRAPH WRAPPER***************************************
function Graph(i) {
    this.index = i;
}
Graph.prototype.getUnits = function() {
    return this.units;
};
Graph.prototype.setUnits = function(u) {
    this.units = u;
};

Graph.prototype.getId = function() {
    return "graph-"+this.index;
};

Graph.prototype.setGraphDiv = function(d) {
    this.graphDiv = d;
    return d;
};
Graph.prototype.getGraphDiv = function() {
    return this.graphDiv;
};
Graph.prototype.setLegendDiv = function(d) {
    this.legendDiv = d;
    return d;
};
Graph.prototype.getLegendDiv = function() {
    return this.legendDiv;
};

Graph.prototype.setRickshawGraph = function(g) {
    this.rickshawGraph = g;
};
Graph.prototype.getRickshawGraph = function() {
    return this.rickshawGraph;
};
//*************************************END OF GRAPH WRAPPER************************************


XivelyKit.prototype.clearGraphs = function() {
    for( var key in this.graphs ) {
        if( this.graphs.hasOwnProperty(key)) {
            this.graphs[key].rickshawGraph = undefined;
            $(this.tag+'-'+this.graphs[key].getId()).empty();
            $(this.tag+'-'+this.graphs[key].getId()+'-legend').empty();
        }
    }
};

XivelyKit.prototype.setupGraphs = function(configData) {
    var myKit = this;

    var maxGraphId = 0;
    for(var i=0; i<configData.length; i++ ) {
        var cfg = configData[i];
        maxGraphId = Math.max(maxGraphId, cfg.index);
    }
    for( var i=0; i <= maxGraphId; i++ ) {
        this.graphs[i] = new Graph(i);
        this.graphs[i].setGraphDiv($(this.tag+' .graph').clone()).appendTo(this.tag+' .graphWrapper').attr('id', this.tag.replace(/^#/,'')+"-"+this.graphs[i].getId()).removeClass('hidden');
        this.graphs[i].setLegendDiv($(this.tag+' .legend').clone()).appendTo(this.tag+' .graphWrapper').attr('id', this.tag.replace(/^#/,'')+"-"+this.graphs[i].getId()+'-legend').removeClass('hidden');
    }
}

XivelyKit.prototype.unitString = function(datastream) {
    return (datastream.unit && datastream.unit.label) ? datastream.unit.label : "no units";
};

XivelyKit.prototype.makeGraphs = function(configData, start, end) {

    var myKit = this;

    this.clearGraphs();

    $(myKit.tag+" .loading").removeClass('hidden');

    var datastreamsToLoad = configData.length;
    var delayedTimeout = null;

    configData.forEach(function(cfg) {

        var feedId, datastreamId;
        var graphIndex = cfg.index;
        var loc = cfg.dataStream.indexOf("!");
        if(loc > 0) {
            feedId = cfg.dataStream.substring(0, loc);
            datastreamId = cfg.dataStream.substring(loc+1);
        }
        xively.feed.get(feedId, function(feedData) {
            if(feedData.datastreams) {
                feedData.datastreams.forEach(function(datastream) {
                    var range = parseFloat(datastream.max_value) - parseFloat(datastream.min_value);
                    var ds_min_value = parseFloat(datastream.min_value) - .25*range;
                    var ds_max_value = parseFloat(datastream.max_value) + .25*range;
                    if( datastream.id == datastreamId ) {
                        var graph = myKit.getGraph( graphIndex );

                        var diff = end.getTime() - start.getTime();
                        var options = null;
                        if( diff <= 6*60*60*1000 ) {
                            options = {interval:22};                     //6 hours
                        } else if( diff <= 12*60*60*1000 ) {
                            options = {interval:44};                     //12 hours
                        } else if( diff <= 24*60*60*1000 ) {
                            options = {interval:87};                     //1day
                        } else if( diff <= 5*24*60*60*1000 ) {
                            options = {interval:432};                    //5day
                        } else if( diff <= 14*24*60*60*1000 ) {
                            options = {interval:1210};                    //14day
                        } else if( diff <= 31*24*60*60*1000 ) {
                            options = {interval:2679};                   //1month
                        } else if( diff <= 90*24*60*60*1000 ) {
                            options = {interval:7776};                  //90days
                        } else if( diff <= 180*24*60*60*1000 ) {
                            options = {interval:15552};                  //180days
                        } else if( diff <= 365*24*60*60*1000 ) {
                            options = {interval:31536};                  //1year
                        }

                        if( options == null ) {  //TODO:  fix this - should never allow a timespan > 1 year
                            alert("Invalid timespan");
                        }
                        options.limit = 1000;
                        options.start= start;
                        options.end = end;

                        xively.datastream.history(feedId, datastreamId, options, function(datastreamData) {

                            var points = [];

                            // Historical Datapoints
                            if(datastreamData.datapoints) {

                                // Add Each Datapoint to Array
                                datastreamData.datapoints.forEach(function(datapoint) {
                                    points.push({x: new Date(datapoint.at).getTime()/1000.0, y: parseFloat(datapoint.value)});
                                });

                                // Add Datapoints Array to Graph Series Array
                                var series = {
                                    name: datastream.id,  //TODO:  Should we use datastream.title here??
                                    data: points,
                                    color: '#FF0000'// + dataColor
                                };

                                var rickshawGraph = null;
                                if( graph.getRickshawGraph() == undefined ) {
                                    $(myKit.tag+'-'+graph.getId()).empty();
                                    // Build Graph
                                    rickshawGraph = new Rickshaw.Graph( {
                                        element: document.querySelector(myKit.tag+'-'+graph.getId()),
                                        width: 600,
                                        height: 200,
                                        renderer: 'line',
                                        min: ds_min_value,
                                        max: ds_max_value,
                                        padding: {
                                            top: 0.02,
                                            right: 0.02,
                                            bottom: 0.02,
                                            left: 0.02
                                        },
                                        series: [series]
                                    });

                                    graph.setRickshawGraph(rickshawGraph);
                                } else {
                                    series.color = '#00FF00';
                                    rickshawGraph = graph.getRickshawGraph();
                                    rickshawGraph.series.push(series);
                                    rickshawGraph.min = Math.min(rickshawGraph.min, ds_min_value);
                                    rickshawGraph.max = Math.max(rickshawGraph.max, ds_max_value);
                                    rickshawGraph.update();
                                }

                                rickshawGraph.render();

                                var ticksTreatment = 'glow';

                                // Define and Render X Axis (Time Values)
                                var xAxis = new Rickshaw.Graph.Axis.Time( {
                                    graph: rickshawGraph,
                                    ticksTreatment: ticksTreatment
                                });
                                xAxis.render();

                                // Define and Render Y Axis (Datastream Values)
                                var yAxis = new Rickshaw.Graph.Axis.Y( {
                                    graph: rickshawGraph,
                                    orientation: 'left',
                                    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                                    ticksTreatment: ticksTreatment
                                });
                                yAxis.render();

                                // Enable Datapoint Hover Values
                                var hoverDetail = new Rickshaw.Graph.HoverDetail({
                                    graph: rickshawGraph,
                                    formatter: function(series, x, y) {
                                        var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + ' padding: 4px;"></span>';
                                        var content = swatch + "&nbsp;&nbsp;" + parseFloat(y) + '&nbsp;&nbsp;<br>';
                                        return content;
                                    }
                                });

                            }

                            // we have to do this delayed as we need to wait until all datastreams have loaded before we create the legends and hook up the slider.
                            datastreamsToLoad--;
                            $(myKit.tag+" .loading").addClass('hidden');
                            if( delayedTimeout != null ) clearTimeout(delayedTimeout);
                            delayedTimeout = setTimeout( function() {
                                if( datastreamsToLoad == 0 ) {
                                    $('.timeControl').removeClass("hidden");
                                    var slider = new Rickshaw.Graph.RangeSlider({
                                        graph: myKit.getRickshawGraphs(),
                                        element: $(myKit.tag + ' .slider'),
                                        onslide: function(min,max) {
                                            var tzOffset = new Date().getTimezoneOffset();
                                            $('#fromTimestamp').datetimepicker("setDate", new Date(tzOffset*60*1000+min*1000));
                                            $('#toTimestamp').datetimepicker("setDate", new Date(tzOffset*60*1000+max*1000));
                                        }
                                    });
                                    for( var key in myKit.getGraphs() ) {
                                        var graph = myKit.getGraphs()[key];
                                        var legend = new Rickshaw.Graph.Legend( {
                                                element: document.querySelector(myKit.tag+'-'+graph.getId()+'-legend'),
                                                graph:   graph.getRickshawGraph()
                                        } );
                                        if( graph.getRickshawGraph().series.length > 1 ) {
                                            var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                                                graph:  graph.getRickshawGraph(),
                                                legend: legend
                                            });
                                        }
                                    }
                                }
                            }, 250);
                        });
                    }
                });

            } else {
                window.alert("no datastreams found");
            }
        });
	});


};

XivelyKit.prototype.getHtml = function () {
    return '\
        <div id="xivelyKit-'+this.getId()+'">\
            <div class="loading large-12 columns">\
                <h2 class="subheader value">Loading Feed Data...</h2>\
            </div>\
            <div class="graphs">\
                <div class="graphWrapper" style="margin-top: 15px; padding: 10px; text-align: center;">\
                    <div class="graph hidden" ></div>\
                    <div class="legend hidden"></div>\
                </div>\
            </div>\
            <div class="row">\
                <div class="large-12 columns" style="overflow-x:auto; overflow-y:hidden">\
                    <div class="timeControl hidden" style="width:100%;">\
                        <input style="width:11em; float:left" type="text" name="fromTimestamp" id="fromTimestamp" value=""/>\
            			<div class="slider" style="width: 400px; height: 15px; margin: auto; float:left; margin:15px;"></div>\
                        <input style="width:11em; float:left" type="text" name="toTimestamp" id="toTimestamp" value=""/>\
                    </div>\
                </div>\
            </div>\
        </div>\
    ';
};