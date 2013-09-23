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
    var contents = $(this.getHtml());
    return contents;
};

XivelyKit.prototype.getTimespan = function() {
    return this.timespan;
};
XivelyKit.prototype.setTimespan = function(t) {
    this.timespan = t;
};

XivelyKit.prototype.updateSelectList = function() {
    var query = [];
    $.each( $(".dsFilterCheckbox"), function(idx,chkbox) {
        if( $(chkbox).is(':checked') ) {
            query.push("tags[]="+encodeURIComponent($(chkbox).val()));
        }
    });
    //TODO: get the type-in filter text, add to query
    $.getJSON('plugins/xively/getDatasources.json.php?'+query.join("&"), function(data){
        $("#ds_select").empty();
        $.each( data, function(idx, dsItem) {
            $("#ds_select").append("<option value='"+dsItem.datastream+"!"+dsItem.units+"'>"+dsItem.datastream+(dsItem.units=="" ? "" : " ("+dsItem.units+")")+"</option>");
        });
    });

};
XivelyKit.prototype.config = function() {
    var myKit = this;

    var addDSDialog = $( "#newDSDialog" ).dialog({
       autoOpen: false,
       modal: true,
       width: 750,
       minWidth: 600,
       buttons: {
         Add: function() {
             $( "#ds_select").find("option:selected").each( function() {
                var parts = $(this).val().split("!");
                var start = $('#fromTimestamp').datetimepicker('getDate');
                var end = $('#toTimestamp').datetimepicker('getDate');

                myKit.addDatastream({datastream:parts[0]+"!"+parts[1], units:parts[2]},  start, end);
             });
           $( this ).dialog( "close" );
         },
         Cancel: function() {
           $( this ).dialog( "close" );
         }
       },
       close: function() {
  //       form[ 0 ].reset();
       }
    });

    $('#addDS').click(function(){
        addDSDialog.dialog("open");
        $.getJSON('plugins/xively/getTags.json.php', function(data){
            var html = "";
            var col=0;
            $.each(data, function(idx,item) {
                if( col % 3 == 0 ) {
                    html += "<div class='grid_container_x3'>";
                }
                html += "<div class='grid_element column_x3'><input class='dsFilterCheckbox' type='checkbox' value='" + item + "'>" + item + "</input></div>";
                col++;
                if( col%3 == 0 ) {
                    html += "</div><div class='clear'></div>";
                }
            });
            html += "<div class='clear'></div>";
            var filters = $("#ds_filters");
            filters.empty();
            filters.append(html);
            $("#ds_select").empty();
            $(".dsFilterCheckbox").change(function() {
                myKit.updateSelectList();
            });
        });
        return false;
    });


    this.tag = "#xivelyKit-"+this.getId();

    myKit.setupGraphs(JSON.parse(myKit.getConfig()));

    var fromTimestamp = $('#fromTimestamp');
    var toTimestamp = $('#toTimestamp');
    fromTimestamp.datetimepicker( {
        onClose:function() {
            var to = toTimestamp.datetimepicker('getDate');
            var from = fromTimestamp.datetimepicker('getDate');
            var minTo = new Date(Math.min(new Date().getTime(),from.getTime()+6*60*60*1000));
            var maxTo = new Date(Math.min(new Date().getTime(),from.getTime()+365*24*60*60*1000));
            toTimestamp.datepicker('option', 'minDate', minTo);
            toTimestamp.datepicker('option', 'minDateTime', minTo);
            toTimestamp.datepicker('option', 'maxDate', maxTo);
            toTimestamp.datepicker('option', 'maxDateTime', maxTo);
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
            var from = new Date(Math.min(fromTimestamp.datetimepicker('getDate'), to.getTime()-6*60*60*1000));
            var maxFrom = new Date(to.getTime() - 6*60*60*1000);
            var minFrom = new Date(to.getTime() - 365*24*60*60*1000);
            fromTimestamp.datetimepicker('setDate', from);
            fromTimestamp.datepicker('option', 'maxDateTime', maxFrom);
            fromTimestamp.datepicker('option', 'minDateTime', minFrom);
            fromTimestamp.datepicker('option', 'maxDate', maxFrom);
            fromTimestamp.datepicker('option', 'minDate', minFrom);
            myKit.makeGraphs(myKit.kitConfig, from, to);

        }
    });
    toTimestamp.datetimepicker('setDate', new Date());
    var maxTo = new Date(Math.min(new Date().getTime(), fromTimestamp.datetimepicker('getDate').getTime()+365*24*60*60*1000));
    toTimestamp.datetimepicker('option', 'maxDateTime', maxTo);
    toTimestamp.datetimepicker('option', 'maxDate', maxTo);;

    var minFrom = new Date( toTimestamp.datetimepicker('getDate').getTime() - 365*24*60*60*1000);
    fromTimestamp.datetimepicker('option', 'minDateTime', minFrom);
    fromTimestamp.datetimepicker('option', 'minDate', minFrom);

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
//theKit.setApiKey("3u1S5zDeKvppr5w177GCxzF7heAxatl88EK0htLVcpaVPUvE");   //robertlight's master api key
theKit.setApiKey("6uhS3aF5Pwv4fkNlfBM4c0opqqyQfuSRGa0QjwZG6KKNi5a8");   //calumbarnes api key
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
Graph.prototype.setLegend = function(l) {
    this.legend = l;
};
Graph.prototype.getLegend = function () {
    return this.legend;
};
Graph.prototype.setSlider = function(s) {
    this.slider = s;
};
Graph.prototype.getSlider = function () {
    return this.slider;
};
Graph.prototype.setToggle = function(t) {
    this.toggle = t;
};
Graph.prototype.getToggle = function () {
    return this.toggle;
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

XivelyKit.prototype.addGraph = function(i) {
    this.graphs[i] = new Graph(i);
    var rootId = this.tag.replace(/^#/,'');
    $(this.tag+' .graphWrapper').clone().attr('id',rootId+'-graphWrapper-'+i).removeClass('graphWrapper').removeClass('hidden').appendTo($(this.tag+' .graphs'));

    var graphId = rootId+"-"+this.graphs[i].getId();
    var legendId= rootId+"-"+this.graphs[i].getId()+'-legend';

    this.graphs[i].setGraphDiv( $(this.tag+'-graphWrapper-'+i+' .graph') .attr('id', graphId));
    this.graphs[i].setLegendDiv($(this.tag+'-graphWrapper-'+i+' .legend').attr('id', legendId));
    return this.graphs[i];
};

/*
 * Each datastream goes in a particular graph (based on the index field of the configData).  When the datastreams are specified by the user
 * we will want to put the datastream in a particular graph based on the units of the datastream... ie: all celsius data would be put in a single
 * graph and all %Humidity would appear in their own graph.  So when creating the config, we define which graph we put a particular
 * datastream into.  If the units change after the config is defined, the graphs will probably start looking pretty weird as celsius data would be
 * graphed on the same graph as Farhenheit data.
 */
XivelyKit.prototype.setupGraphs = function(configData) {
    var myKit = this;

    var maxGraphId = 0;
    for(var j=0; j<configData.length; j++ ) {
        var cfg = configData[j];
        maxGraphId = Math.max(maxGraphId, cfg.index);
    }
    for( var i=0; i <= maxGraphId; i++ ) {
        this.addGraph(i);
    }
};

//TODO: we will need to create an addDatastream(cfg) which will create a new graph if necessary and add the cfg to the base configData

XivelyKit.prototype.addDatastream = function( cfg, start, end ) {

    var myKit = this;

    var units = cfg.units;
    var addToGraph = false;
    var maxGraphId = -1;
    var slider = false;
    for( var key in this.graphs ) {
        if( this.graphs.hasOwnProperty(key)) {
  //          this.graphs[key].rickshawGraph = undefined;
            maxGraphId = Math.max(maxGraphId, key);
             if( units == this.graphs[key].getUnits()) {
                 addToGraph = this.graphs[key];
                 slider = addToGraph.getSlider();
                 break;
             }
        }
    }


    //**** add a new series to an old graph or create a new Rickshaw graph with the new series on it *******************

    var feedId, datastreamId;
    var parts = cfg.datastream.split("!");
    if(parts.length >= 2) {
        feedId = parts[0];
        datastreamId = parts[1];
    } else {
        alert("Malformed datastream specification: "+cfg.datastream);
    }

    var options = myKit.makeOptions( start, end );

    xively.feed.get(feedId, function(feedData) {
 //       console.log( "adding new datastream: \n"+JSON.stringify(feedData));
        if(feedData.datastreams) {
            feedData.datastreams.forEach(function(datastream) {
                var range = parseFloat(datastream.max_value) - parseFloat(datastream.min_value);
                var ds_min_value = parseFloat(datastream.min_value) - .25*range;
                var ds_max_value = parseFloat(datastream.max_value) + .25*range;
                if( datastream.id == datastreamId ) {

                    if( addToGraph === false ) { //we're creating a new graph
                        slider = myKit.getGraph(maxGraphId).getSlider();
                        addToGraph = myKit.addGraph(++maxGraphId);
                    }
                    addToGraph.setUnits((datastream.unit && datastream.unit.label) ? datastream.unit.label : "no units");

                    xively.datastream.history(feedId, datastreamId, options, function(datastreamData) {
//                        console.log("datastreamData: "+JSON.stringify(datastreamData));
                        var points = [];

                        // Historical Datapoints
                        if( !datastreamData.datapoints ) {
                            alert("No data found for datastream");
                        } else {

                            // Add Each Datapoint to Array
                            datastreamData.datapoints.forEach(function(datapoint) {
                                points.push({x: new Date(datapoint.at).getTime()/1000.0, y: parseFloat(datapoint.value)});
                            });

                            // Add Datapoints Array to Graph Series Array
                            var series = {
                                name: datastream.id,
                                data: points,
                                color: '#FF0000'// + dataColor
                            };

                            var rickshawGraph = null;
                            if( addToGraph.getRickshawGraph() == undefined ) {

                                $(myKit.tag+'-'+addToGraph.getId()).empty();  //get rid of anything that is currently there

                                // Build Graph
                                console.log("about to create a rickshaw graph on id: "+myKit.tag+'-'+addToGraph.getId());
                                rickshawGraph = new Rickshaw.Graph( {
                                    element: document.querySelector(myKit.tag+'-'+addToGraph.getId()),
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

                                addToGraph.setRickshawGraph(rickshawGraph);
                                addToGraph.setSlider(slider);
                                addToGraph.setLegend(new Rickshaw.Graph.Legend( {
                                    element: document.querySelector(myKit.tag+'-'+addToGraph.getId()+'-legend'),
                                    graph:   addToGraph.getRickshawGraph()
                                } ) );

                            } else {
                                series.color = '#00FF00';
                                rickshawGraph = addToGraph.getRickshawGraph();
                                rickshawGraph.series.push(series);
                                rickshawGraph.min = Math.min(rickshawGraph.min, ds_min_value);
                                rickshawGraph.max = Math.max(rickshawGraph.max, ds_max_value);
                                addToGraph.getLegend().addLine(series);
                                if( addToGraph.getRickshawGraph().series.length == 2 ) { //when there was only 1, no toggle
                                    addToGraph.setToggle(new Rickshaw.Graph.Behavior.Series.Toggle({
                                        graph:  rickshawGraph,
                                        legend: addToGraph.getLegend()
                                    }));
                                } else {
                                    addToGraph.getToggle().updateBehaviour();
                                }
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
                                    return '<span class="detail_swatch" style="background-color: ' + series.color + ' padding: 4px;"></span>&nbsp;&nbsp;' + parseFloat(y) + '&nbsp;&nbsp;<br>';
                                }
                            });

                        }

                        //we need to hook up the slider AND legends to the new graph

                        $(myKit.tag+" .loading").addClass('hidden');
                        $('.timeControl').removeClass("hidden");
                        slider.graph = myKit.getRickshawGraphs();

                        var legend = addToGraph.getLegend();
                        if( !legend ) {
                            legend = new Rickshaw.Graph.Legend( {
                                    element: document.querySelector(myKit.tag+'-'+addToGraph.getId()+'-legend'),
                                    graph:   addToGraph.getRickshawGraph()
                            } );
                            addToGraph.setLegend(legend);
                        }

//                        if( addToGraph.getRickshawGraph().series.length > 1 ) {
//                            var toggle = addToGraph.getToggle();
//                            if( !toggle ) {
//                                toggle = new Rickshaw.Graph.Behavior.Series.Toggle({
//                                    graph:  addToGraph.getRickshawGraph(),
//                                    legend: legend
//                                });
//                                addToGraph.setToggle(toggle);
//                            }
//                        }
                    });
                }
            });

        } else {
            window.alert("no datastreams found");
        }
    });
    //******************************************************************************************************************

};

/**
 * Create options data for requesting datastream data
 * @param start - start time
 * @param end   - end time
 * @returns {interval, limit, start, end}
 */
XivelyKit.prototype.makeOptions = function (start, end) {
    var diff = end.getTime() - start.getTime();
    var options = {
        limit: 1000,
        start: start,
        end: end
    };
    if( diff <= 6*60*60*1000 ) {
        options.interval = 22;                     //6 hours
    } else if( diff <= 12*60*60*1000 ) {
        options.interval = 44;                     //12 hours
    } else if( diff <= 24*60*60*1000 ) {
        options.interval = 87;                     //1day
    } else if( diff <= 5*24*60*60*1000 ) {
        options.interval = 432;                    //5day
    } else if( diff <= 14*24*60*60*1000 ) {
        options.interval = 1210;                    //14day
    } else if( diff <= 31*24*60*60*1000 ) {
        options.interval = 2679;                   //1month
    } else if( diff <= 90*24*60*60*1000 ) {
        options.interval = 7776;                  //90days
    } else if( diff <= 180*24*60*60*1000 ) {
        options.interval = 15552;                  //180days
    } else {
        options.interval = Math.ceil( (end.getTime()-start.getTime())/(1000*1000));  //>180days
    }
    return options;
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
        var parts = cfg.datastream.split("!");
        if(parts.length >= 2) {
            feedId = parts[0];
            datastreamId = parts[1];
        } else {
            alert("Malformed datastream specification: "+cfg.datastream);
        }

        var options = myKit.makeOptions( start, end );

        xively.feed.get(feedId, function(feedData) {
            if(feedData.datastreams) {
                feedData.datastreams.forEach(function(datastream) {
                    var range = parseFloat(datastream.max_value) - parseFloat(datastream.min_value);
                    var ds_min_value = parseFloat(datastream.min_value) - .25*range;
                    var ds_max_value = parseFloat(datastream.max_value) + .25*range;
                    if( datastream.id == datastreamId ) {
                        var graph = myKit.getGraph( graphIndex );

                        graph.setUnits((datastream.unit && datastream.unit.label) ? datastream.unit.label : "no units");

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
                                    name: datastream.id,
                                    data: points,
                                    color: '#FF0000'// + dataColor
                                };

                                var rickshawGraph = null;
                                if( graph.getRickshawGraph() == undefined ) {

                                    $(myKit.tag+'-'+graph.getId()).empty();  //get rid of anything that is currently there

                                    // Build Graph
                                    console.log("about to create a rickshaw graph on id: "+myKit.tag+'-'+graph.getId());
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
                                        graph.setSlider(slider);
                                        graph.setLegend(new Rickshaw.Graph.Legend( {
                                                element: document.querySelector(myKit.tag+'-'+graph.getId()+'-legend'),
                                                graph:   graph.getRickshawGraph()
                                        }));
                                        if( graph.getRickshawGraph().series.length > 1 ) {
                                            graph.setToggle(new Rickshaw.Graph.Behavior.Series.Toggle({
                                                graph:  graph.getRickshawGraph(),
                                                legend: graph.getLegend()
                                            }));
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
    return '<div style="margin:20px 0">\
            <a class="ui-state-default ui-corner-all" id="addDS" href="#" style="padding:6px 6px 6px 17px;text-decoration:none;position:relative">\
                <span class="ui-icon ui-icon-plus" style="position:absolute;top:4px;left:1px"></span>\
                    Add Data Source\
            </a>\
        </div>\
        <div id="xivelyKit-'+this.getId()+'">\
            <div class="loading large-12 columns">\
                <h2 class="subheader value">Loading Feed Data...</h2>\
            </div>\
            <div class="graphs">\
                <div class="graphWrapper hidden" >\
                    <div class="graph" ></div>\
                    <div class="legend"></div>\
                </div>\
            </div>\
            <div class="row" style="padding-left:20px"> <!-- TODO:  figure out why padding-left is needed -->\
                <div class="large-12 columns" style="overflow-x:auto; margin-left:auto; margin-right:auto; overflow-y:hidden">\
                    <div class="timeControl hidden" style="width:100%;">\
                        <input style="width:11em; float:left" type="text" name="fromTimestamp" id="fromTimestamp" value=""/>\
            			<div class="slider" style="width: 400px; height: 15px; margin: auto; float:left; margin:15px;"></div>\
                        <input style="width:11em; float:left" type="text" name="toTimestamp" id="toTimestamp" value=""/>\
                    </div>\
                </div>\
            </div>\
        </div>\
        <div id="newDSDialog" title="Add a new data source">\
            <form>\
                <fieldset class="ui-helper-reset">\
                    <label for="ds_types">What type of data source?</label>\
                    <div id="ds_filters"></div>\
                    <label for="ds_name">What do you want to call it?</label>\
                    <input type="text" name="ds_name" id="ds_name" value="" class="ui-widget-content ui-corner-all" />\
                    <select id="ds_select" multiple></select>\
                </fieldset>\
            </form>\
        </div>\
    ';
};


//TODO:   Current bugs/edge-cases
/**
 *
 * 1) if you specify a from (or to) time which is outside the range of the data, the slider will behave a bit odd.
 */