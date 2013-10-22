"use strict";

function XivelyKit(myname) {

    ObservationKit.call(this);  //super constructor

    this.name = myname;
    this.graphs = {};
    this.kitConfig=[];
}

XivelyKit.prototype = Object.create(ObservationKit.prototype);  //inherit ObservationKit

XivelyKit.prototype.constructor = XivelyKit;

XivelyKit.prototype.clone = function() {
    var other = new XivelyKit(this.getName());
    other.setId(this.getId());
    return other;
};
XivelyKit.prototype.getConfig = function() {
    var tag = "#xivelyKit-"+this.getId();
    return JSON.stringify( {
        datastreams: this.kitConfig,
        start: $(tag+' .fromTimestamp').datepicker('getDate'),
        end:   $(tag+' .toTimestamp').datepicker('getDate')
    });
};
XivelyKit.prototype.setConfig = function(c) {
    var stuff = JSON.parse(c);
    this.kitConfig = stuff.datastreams;
    this.start = stuff.start;
    this.end =   stuff.end;
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
        if( this.graphs.hasOwnProperty(key) && this.graphs[key] ) {
            arr.push(this.graphs[key].getRickshawGraph());
        }
    }
    return arr;
}

XivelyKit.prototype.getName = function() {
    return this.name;
};

XivelyKit.prototype.getType = function() {
    return "Xively Data Viewer";
};

XivelyKit.prototype.render = function() {
    var contents = $(this.getHtml());
    this.updateManageDSBtn()
    return contents;
};

XivelyKit.prototype.updateSelectList = function() {
    var myKit = this;
    var query = [];
    var ds_filterText = $("#ds_filterText").val();
    if( ds_filterText != "" ) {
        query.push("tags[]="+encodeURIComponent(ds_filterText));
    }
    $.each( $(".dsFilterCheckbox"), function(idx,chkbox) {
        if( $(chkbox).is(':checked') ) {
            if( ds_filterText != $(chkbox).val()) {
                query.push("tags[]="+encodeURIComponent($(chkbox).val()));
            }
        }
    });
    $.getJSON('plugins/xively/getDatasources.json.php?'+query.join("&"), function(data){
        $("#ds_select").empty();
        $.each( data, function(idx, dsItem) {
            $("#ds_select").append("<option value='"+dsItem.datastream+"!"+dsItem.units+"'>"+dsItem.datastream+(dsItem.units=="" ? "" : " ("+dsItem.units+")")+"</option>");
        });
    });

};

XivelyKit.prototype.createAddDSDialog = function() {

    var myKit = this;

    var addDSDialog = $("#newDSDialog" ).dialog({
        autoOpen: false,
        modal: true,
        width: 750,
        minWidth: 600,
        buttons: {
            Add: function() {

                $("#ds_select").find("option:selected").each( function() {
                    var parts = $(this).val().split("!");
                    addDSDialog.dialog("option","kit").addDatastream({datastream:parts[0]+"!"+parts[1], units:parts[2],name:$("#ds_name").val()});
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

    $(myKit.tag+' .addDS').click(function(){
        addDSDialog.dialog("open");
        addDSDialog.dialog("option","kit",myKit);
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
            $("#ds_name").val("");
            $(".dsFilterCheckbox").change(function() {
                myKit.updateSelectList();
            });
            $("#ds_filterText").keyup( function(ev) {  //call updateSelectList 500ms after last character typed.

                if( myKit.ds_filterTextTimeout ) {
                    clearTimeout(this.ds_filterTextTimeout);
                }

                this.ds_filterTextTimeout = setTimeout(function() {
                    myKit.updateSelectList();
                    myKit.ds_filterTextTimeout = false;
                }, 500);

            });
        });
        return false;
    });
};

XivelyKit.prototype.updateManageDSBtn = function() {
    var myKit = this;
    setTimeout( function() {
        if( myKit.getRickshawGraphs().length > 0 ) {
            $(myKit.tag+" .manageDS").removeClass("hidden");
            $(myKit.tag+" .downloadCSV").removeClass("hidden");
        } else {
            $(myKit.tag+" .manageDS").addClass("hidden");
            $(myKit.tag+" .downloadCSV").addClass("hidden");
        }
    },1000);
};
XivelyKit.prototype.createManageDSDialog = function() {

    var myKit = this;

    var manageDSDialog = $("#manageDSDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 750,
        minWidth: 600,
        buttons: {
            Delete: function() {

                $("#manage_ds_select").find("option:selected").each( function() {
                    manageDSDialog.dialog("option","kit").deleteDatastream($(this).val());
                });
                $( this ).dialog( "close" );
                myKit.updateManageDSBtn();
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
        }
    });

    $(myKit.tag+' .manageDS').click(function(){
        $("#manage_ds_select").empty();
        manageDSDialog.dialog("option","kit",myKit);
        manageDSDialog.dialog("open");

        $.each( myKit.kitConfig, function(idx, cfg) {
            var units = cfg.units=="" || cfg.units == undefined ? "" : " ("+cfg.units+")";
            $("#manage_ds_select").append("<option value='"+cfg.datastream+"'>"+ (cfg.name ? (cfg.name + " ["+cfg.datastream+"] ") : cfg.datastream) + units+"</option>");
        });
        return false;
    });

    $(myKit.tag+' .downloadCSV').click(function(e){
        e.preventDefault();
        var start = $(myKit.tag+' .fromTimestamp').datepicker('getDate');
        var end   = $(myKit.tag+' .toTimestamp').datepicker('getDate');
        var interval = myKit.makeOptions( start, end).interval;

        $("#getCSV_form .username").val($("#username").val());
        $("#getCSV_form .token").val($("#token").val());
        $("#getCSV_form .start").val(start);
        $("#getCSV_form .end").val(end);
        $("#getCSV_form .interval").val(interval);
        $("#getCSV_form .kitData").val(myKit.getConfig());
        $("#getCSV_form .kitName").val(myKit.getName());
        $("#getCSV_form").submit();

        return false;
    });
};

XivelyKit.prototype.config = function() {

    this.tag = "#xivelyKit-"+this.getId();

    var myKit = this;

    this.createAddDSDialog();
    this.createManageDSDialog();


 //   this.kitConfig = JSON.parse(this.getConfig());

    this.setupGraphs();

    var fromTimestamp = $(myKit.tag+' .fromTimestamp');
    var toTimestamp = $(myKit.tag+' .toTimestamp');
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

//    var maxFrom = myKit.start ?  new Date(Date.parse(myKit.start)) : new Date( new Date().getTime() - 6*60*60*1000);   //TODO: if you want to specify the start-time based on the stored value
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

//    toTimestamp.datetimepicker('setDate', myKit.end ? new Date(Date.parse(myKit.end)) : new Date());   //TODO: if you want to specify the end-time based on stored value
    toTimestamp.datetimepicker('setDate', new Date());

    var maxTo = new Date(Math.min(new Date().getTime(), fromTimestamp.datetimepicker('getDate').getTime()+365*24*60*60*1000));
    toTimestamp.datetimepicker('option', 'maxDateTime', maxTo);
    toTimestamp.datetimepicker('option', 'maxDate', maxTo);;

    var minFrom = new Date( toTimestamp.datetimepicker('getDate').getTime() - 365*24*60*60*1000);
    fromTimestamp.datetimepicker('option', 'minDateTime', minFrom);
    fromTimestamp.datetimepicker('option', 'minDate', minFrom);

    if( this.getConfig() === undefined ) {
        window.alert("Error - config not found.");
    } else {
        var cfg = JSON.parse(this.getConfig());
        this.kitConfig = cfg.datastreams;
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
//theKit.setApiKey("6uhS3aF5Pwv4fkNlfBM4c0opqqyQfuSRGa0QjwZG6KKNi5a8");   //calumbarnes api key
xively.setKey("680dCuji2cKgPYrCsGErbtkRumbCRuUx9WRR3mH9iRFPYPAn");   //iostp READPRIVATE key
IOSTP.getInstance().register( theKit );


//*****************************************GRAPH WRAPPER***************************************
function Graph(i,kit) {
    this.index = i;
    //for help on colorblind colors, see  http://www.mrexcel.com/forum/lounge-v-2-0/374530-color-choices-colorblind-viewers.html
    this.colorBlindColors = new Array("#F0E442","#0072B2","#D55E00","#CC79A7","#2B9578","#56B4E9","#E69F00","#000000");
    this.colorBlindColorIndex = 0;
    this.datastreams = [];
    this.kit = kit;
}
Graph.prototype = {
    getUnits: function() {
        return this.units;
    },
    setUnits: function(u) {
        this.units = u;
    },

    getId: function() {
        return "graph-"+this.index;
    },

    setGraphDiv: function(d) {
        this.graphDiv = d;
        return d;
    },
    getGraphDiv: function() {
        return this.graphDiv;
    },
    setLegendDiv: function(d) {
        this.legendDiv = d;
        return d;
    },
    getLegendDiv: function() {
        return this.legendDiv;
    },
    setYAxisDiv: function(d) {
        this.yAxisDiv = d;
        return d;
    },
    getYAxisDiv: function() {
        return this.yAxisDiv;
    },

    setRickshawGraph: function(g) {
        this.rickshawGraph = g;
    },
    getRickshawGraph: function() {
        return this.rickshawGraph;
    },
    setLegend: function(l) {
        this.legend = l;
    },
    getLegend: function() {
        return this.legend;
    },
    setSlider: function(s) {
        this.slider = s;
    },
    getSlider: function() {
        return this.slider;
    },
    setToggle: function(t) {
        this.toggle = t;
    },
    getToggle: function() {
        return this.toggle;
    },
    getNextColor: function() {
        var color = this.colorBlindColors[this.colorBlindColorIndex];
        this.colorBlindColorIndex = ++this.colorBlindColorIndex % this.colorBlindColors.length;
        return color;
    },

    updateLegend: function() {
        this.getLegendDiv().empty();
        this.setLegend(new Rickshaw.Graph.Legend( {
            element: document.querySelector(this.kit.tag+'-'+this.getId()+'-legend'),
            graph:   this.getRickshawGraph()
        } ) );

        if( this.getRickshawGraph().series.length > 1 ) {
            this.setToggle(new Rickshaw.Graph.Behavior.Series.Toggle({
                graph:  this.getRickshawGraph(),
                legend: this.getLegend()
            }));
        }
    },

    hasDatastream: function(ds) {
        var found = false;
        this.rickshawGraph.series.forEach( function(serie) {
            if( serie.datastream == ds) {
                found = true;
            }
        });
        return found;
    },

    /**
     * removes the series from the graph
     * @param ds
     * @returns true if the graph is empty, false otherwise
     */
    removeSeries: function(ds) {
        if( this.hasDatastream(ds) ) {
            for( var i=0; i<this.rickshawGraph.series.length; i++ ) {
                if( this.rickshawGraph.series[i].datastream == ds ) {
                    this.rickshawGraph.series.splice(i,1);
                }
            }
            if( this.rickshawGraph.series.length == 0 ) {  //no more series, remove graph
                return true;
            } else {
                this.rickshawGraph.update();
                this.updateLegend();
                return false;
            }
        }
    },
    clear: function() {
        this.rickshawGraph = undefined;
        $(this.kit.tag+'-'+this.getId()).empty();
        $(this.kit.tag+'-'+this.getId()+'-legend').empty();
        $(this.kit.tag+'-'+this.getId()+'-yAxis').empty();
        $(this.kit.tag+'-'+this.getId()+'-yAxisLabel').empty();
    //    $(this.kit.tag+'-graphWrapper-'+this.index).empty();

    },
    destroy: function() {
        this.getSlider().graph.remove(this.getRickshawGraph());
        this.clear();
        $(this.kit.tag+'-graphWrapper-'+this.index).empty();
    }
};
//*************************************END OF GRAPH WRAPPER************************************


XivelyKit.prototype.clearGraphs = function() {
    for( var key in this.graphs ) {
        if( this.graphs.hasOwnProperty(key) && this.graphs[key]) {
            this.graphs[key].clear();
        }
    }
};

XivelyKit.prototype.addGraph = function(i) {
    this.graphs[i] = new Graph(i,this);
    var rootId = this.tag.replace(/^#/,'');
    $(this.tag+' .graphWrapperTemplate').clone().attr('id',rootId+'-graphWrapper-'+i).removeClass("graphWrapperTemplate").removeClass('hidden').appendTo($(this.tag+' .graphs'));

    var graphId = rootId+"-"+this.graphs[i].getId();
    var legendId= graphId+'-legend';
    var yAxisId=  graphId+'-yAxis';

    this.graphs[i].setGraphDiv( $(this.tag+'-graphWrapper-'+i+' .graph').attr('id', graphId));
    this.graphs[i].setLegendDiv($(this.tag+'-graphWrapper-'+i+' .legend').attr('id', legendId));
    this.graphs[i].setYAxisDiv($(this.tag+'-graphWrapper-' +i+' .yAxis').attr('id', yAxisId));
    $(this.tag+'-graphWrapper-' +i+' .yAxisLabel').attr('id', yAxisId+'Label');
    return this.graphs[i];
};

/*
 * Each datastream goes in a particular graph (based on the index field of the configData).  When the datastreams are specified by the user
 * we will want to put the datastream in a particular graph based on the units of the datastream... ie: all celsius data would be put in a single
 * graph and all %Humidity would appear in their own graph.  So when creating the config, we define which graph we put a particular
 * datastream into.  If the units change after the config is defined, the graphs will probably start looking pretty weird as celsius data would be
 * graphed on the same graph as Farhenheit data.
 */
XivelyKit.prototype.setupGraphs = function() {
    var maxGraphId = -1;
    for(var j=0; j<this.kitConfig.length; j++ ) {
        var cfg = this.kitConfig[j];
        maxGraphId = Math.max(maxGraphId, cfg.index);
    }
    for( var i=0; i <= maxGraphId; i++ ) {
        this.addGraph(i);
    }
};

XivelyKit.prototype.addDatastream = function( cfg ) {

    var myKit = this;

    var start = $(myKit.tag+' .fromTimestamp').datetimepicker('getDate');
    var end = $(myKit.tag+' .toTimestamp').datetimepicker('getDate');


    var units = cfg.units;
    var addToGraph = false;
    var maxGraphId = -1;
    var slider = false;
    for( var key in this.graphs ) {
        if( this.graphs.hasOwnProperty(key) && this.graphs[key] ) {
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
                var ds_max_value = Math.max(1.0, parseFloat(datastream.max_value) + .25*range);
                if( datastream.id == datastreamId ) {

                    if( addToGraph === false ) { //we're creating a new graph
                        if( maxGraphId >= 0 ) {
                            slider = myKit.getGraph(maxGraphId).getSlider();
                        }
                        addToGraph = myKit.addGraph(++maxGraphId);
                    }
                    cfg.index = maxGraphId;
                    cfg.units = (datastream.unit && datastream.unit.label) ? datastream.unit.label : "no units";
                    addToGraph.setUnits(cfg.units);

                    xively.datastream.history(feedId, datastreamId, options, function(datastreamData) {
                        // Historical Datapoints
//                        if( !datastreamData.datapoints ) {
//                            alert("No data found for datastream");
//                        } else {

                            var points = [];

                            // Add Each Datapoint to Array
                            if( !datastreamData.datapoints ) {
                                datastreamData.datapoints.forEach(function(datapoint) {
                                    points.push({x: new Date(datapoint.at).getTime()/1000.0, y: parseFloat(datapoint.value)});
                                });
                            } else {  // no data - need to put dummy stuff in there so that a graph can be displayed.
                                points.push( {x: start.getTime()/1000, y:0.0});
                                points.push( {x:   end.getTime()/1000, y:0.0});
                            }
                            // Add Datapoints Array to Graph Series Array
                            var series = {
                                datastream: cfg.datastream,
                                name: (cfg.name?cfg.name:datastream.id) + (datastreamData.datapoints ? "" : "(no data)" ),
                                data: points,
                                color: addToGraph.getNextColor()
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

                                if( ! slider ) {
                                    slider = new Rickshaw.Graph.RangeSlider({
                                        graph: [rickshawGraph],
                                        element: $(myKit.tag + ' .slider'),
                                        onslide: function(min,max) {
                                            var tzOffset = new Date().getTimezoneOffset();
                                            $(myKit.tag+' .fromTimestamp').datetimepicker("setDate", new Date(tzOffset*60*1000+min*1000));
                                            $(myKit.tag+' .toTimestamp').datetimepicker("setDate", new Date(tzOffset*60*1000+max*1000));
                                        }
                                    });
                                    $(myKit.tag+' .timeControl').removeClass("hidden");
                                }
                                addToGraph.setRickshawGraph(rickshawGraph);
                                addToGraph.setSlider(slider);

                                // Define and Render X Axis (Time Values)
                                var xAxis = new Rickshaw.Graph.Axis.Time( {
                                    graph: rickshawGraph,
                                    ticksTreatment: 'glow'
                                });
                                xAxis.render();
                                // Define and Render Y Axis (Datastream Values)
                                var yAxis = new Rickshaw.Graph.Axis.Y( {
                                    element: document.querySelector(myKit.tag+'-'+addToGraph.getId()+'-yAxis'),
                                    width: 50,
                                    graph: rickshawGraph
                                });
                                yAxis.render();
                                $(myKit.tag+'-'+addToGraph.getId()+'-yAxisLabel').text(addToGraph.getUnits());

                            } else {
                                series.color = addToGraph.getNextColor();
                                rickshawGraph = addToGraph.getRickshawGraph();
                                rickshawGraph.series.push(series);
                                rickshawGraph.min = Math.min(rickshawGraph.min, ds_min_value);
                                rickshawGraph.max = Math.max(rickshawGraph.max, ds_max_value);
                                rickshawGraph.update();
                            }

                            addToGraph.updateLegend();

                            // Enable Datapoint Hover Values
                            var hoverDetail = new Rickshaw.Graph.HoverDetail({
                                graph: rickshawGraph,
                                formatter: function(series, x, y) {
                                    return '<span class="detail_swatch" style="background-color: ' + series.color + ' padding: 4px;"></span>&nbsp;&nbsp;' + parseFloat(y) + '&nbsp;&nbsp;<br>';
                                }
                            });

                            rickshawGraph.render();

//                        }

                        //we need to hook up the slider AND legends to the new graph

                        $(myKit.tag+" .loading").addClass('hidden');
                        slider.graph = myKit.getRickshawGraphs();

                        var legend = addToGraph.getLegend();
                        if( !legend ) {
                            legend = new Rickshaw.Graph.Legend( {
                                    element: document.querySelector(myKit.tag+'-'+addToGraph.getId()+'-legend'),
                                    graph:   addToGraph.getRickshawGraph()
                            } );
                            addToGraph.setLegend(legend);
                        }

                    });

                    myKit.kitConfig.push(cfg);
                }
            });

        } else {
            window.alert("could not access feed");
        }

        myKit.updateManageDSBtn();

    });
    //******************************************************************************************************************

};
XivelyKit.prototype.deleteDatastream = function( datastream ) {

    var myKit = this;
    for( var key in this.graphs ) {
        if( this.graphs.hasOwnProperty(key) ) {
            if( this.graphs[key] && this.graphs[key].hasDatastream(datastream)) {
                var deletedGraph = false;
                if( this.graphs[key].removeSeries(datastream) ) {
                    this.graphs[key].destroy();
                    delete this.graphs[key];
                    deletedGraph = true;
                }
                for( var i=0; i< myKit.kitConfig.length; i++ ) {
                    var cfg = myKit.kitConfig[i];
                    if( cfg.datastream == datastream) {
                        myKit.kitConfig.splice(i,1);
                        i--;
                    } else {
                        /* NOTE:  a bit of a hack..
                         * because we store the index of the graph for each datastream, if we are deleting a graph, we need to
                         * decrement the index of all datastreams which are affected.  The only reason we had to store the index
                         * that a datastream goes on is that we discover the units of the datastream asyncronously and therefore
                         * had to know where the datastream was going to be placed before we actually requested the data for the datastream.
                         */
                        if( deletedGraph && cfg.index > key ) {
                            cfg.index = cfg.index-1;
                        }
                    }
                }
                return;
            }
        }
    }
    alert("ERROR: datastream: "+datastream+" not found in any graph");
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
                        $(myKit.tag+" .loading").removeClass('hidden');

                        var graph = myKit.getGraph( graphIndex );

                        graph.setUnits((datastream.unit && datastream.unit.label) ? datastream.unit.label : "no units");

                        xively.datastream.history(feedId, datastreamId, options, function(datastreamData) {

                            var points = [];

                            // Add Each Datapoint to Array
                            if( datastreamData.datapoints ) {
                                datastreamData.datapoints.forEach(function(datapoint) {
                                    points.push({x: new Date(datapoint.at).getTime()/1000.0, y: parseFloat(datapoint.value)});
                                });
                            } else {  // no data - need to put dummy stuff in there so that a graph can be displayed.
                                points.push( {x: start.getTime()/1000, y:0.0});
                                points.push( {x:   end.getTime()/1000, y:0.0});
                            }

                            // Add Datapoints Array to Graph Series Array
                            var series = {
                                datastream: cfg.datastream,
                                name: (cfg.name ? cfg.name : datastream.id) + (datastreamData.datapoints ? "" : " (no data)" ),
                                data: points,
                                color: graph.getNextColor()
                            };

                            var rickshawGraph = null;
                            if( graph.getRickshawGraph() == undefined ) {

                                console.log("about to create a rickshaw graph on id: "+myKit.tag+'-'+graph.getId());

                                $(myKit.tag+'-'+graph.getId()).empty();  //get rid of anything that is currently there

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
                                console.log(" existing graph needs to be reconfigured");
                                series.color = graph.getNextColor();
                                rickshawGraph = graph.getRickshawGraph();
                                rickshawGraph.series.push(series);
                                rickshawGraph.min = Math.min(rickshawGraph.min, ds_min_value);
                                rickshawGraph.max = Math.max(rickshawGraph.max, ds_max_value);
                                rickshawGraph.update();
                            }

                            rickshawGraph.render();

                            // we have to do this delayed as we need to wait until all datastreams have loaded before we create the legends and hook up the slider.
                            datastreamsToLoad--;
                            if( delayedTimeout !== undefined) clearTimeout(delayedTimeout);
                            delayedTimeout = setTimeout( function() {
                                if( datastreamsToLoad == 0 ) {
                                    $(myKit.tag+" .loading").addClass('hidden');
                                    $(myKit.tag+' .timeControl').removeClass("hidden");
                                    var slider = new Rickshaw.Graph.RangeSlider({
                                        graph: myKit.getRickshawGraphs(),
                                        element: $(myKit.tag + ' .slider'),
                                        onslide: function(min,max) {
                                            var tzOffset = new Date().getTimezoneOffset();
                                            $(myKit.tag+' .fromTimestamp').datetimepicker("setDate", new Date(tzOffset*60*1000+min*1000));
                                            $(myKit.tag+' .toTimestamp').datetimepicker("setDate", new Date(tzOffset*60*1000+max*1000));
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


                                        // Define and Render X Axis (Time Values)
                                        var xAxis = new Rickshaw.Graph.Axis.Time( {
                                            graph: graph.getRickshawGraph(),
                                            ticksTreatment: 'glow'
                                        });
                                        xAxis.render();

                                        // Define and Render Y Axis (Datastream Values)
                                        console.log("creating yAxis: "+myKit.tag+'-'+graph.getId()+'-yAxis');

                                        var yAxis = new Rickshaw.Graph.Axis.Y( {
                                            width: 50,
                       //                     height: 200,
                                            element: document.querySelector(myKit.tag+'-'+graph.getId()+'-yAxis'),
                                            graph: graph.getRickshawGraph(),
                       //                     orientation: 'left',
                                            tickFormat: Rickshaw.Fixtures.Number.formatKMBT
                   //                         ticksTreatment: 'glow'
                                        });
                                        yAxis.render();

                                        $(myKit.tag+'-'+graph.getId()+'-yAxisLabel').text(graph.getUnits());

                                        // Enable Datapoint Hover Values
                                        var hoverDetail = new Rickshaw.Graph.HoverDetail({
                                            graph: graph.getRickshawGraph(),
                                            formatter: function(series, x, y) {
                                                return '<span class="detail_swatch" style="background-color: ' + series.color + ' padding: 4px;"></span>&nbsp;&nbsp;' + parseFloat(y) + '&nbsp;&nbsp;<br>';
                                            }
                                        });
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



/**
 * Note that everything is under a "uniqu-ified" div tag - this makes it possible for different instances of kits to exist
 * nicely together and make it so one instance does not interfere with another instance.
 * @returns {string}
 */
XivelyKit.prototype.getHtml = function () {
    return '\
         <div id="xivelyKit-'+this.getId()+'">\
              <div style="margin:20px 0">\
                  <a class="ui-state-default ui-corner-all addDS" href="#" style="padding:6px 6px 6px 17px;text-decoration:none;position:relative">\
                      <span class="ui-icon ui-icon-plus" style="position:absolute;top:4px;left:1px"></span>\
                          Add Data Source\
                  </a>\
                  <a class="ui-state-default ui-corner-all manageDS" href="#" style="padding:6px 6px 6px 17px;text-decoration:none;position:relative">\
                      <span class="ui-icon ui-icon-plus" style="position:absolute;top:4px;left:1px"></span>\
                          Manage Data Sources\
                  </a>\
                  <a class="ui-state-default ui-corner-all downloadCSV" href="#" style="padding:6px 6px 6px 17px;text-decoration:none;position:relative">\
                      <span class="ui-icon ui-icon-plus" style="position:absolute;top:4px;left:1px"></span>\
                          Download CSV\
                  </a>\
              </div>\
              <div class="loading hidden large-12 columns">\
                  <h2 class="subheader value">Loading Feed Data...</h2>\
              </div>\
              <div class="graphs">\
                  <div class="graphWrapperTemplate graphWrapper hidden" >\
                      <div class="yAxisLabel"></div>\
                      <div class="yAxis"></div>\
                      <div class="graph" ></div>\
                      <div class="legend"></div>\
                  </div>\
              </div>\
              <div class="row" style="padding-left:20px"> <!-- TODO:  figure out why padding-left is needed -->\
                  <div class="large-12 columns" style="overflow-x:auto; margin-left:auto; margin-right:auto; overflow-y:hidden">\
                      <div class="timeControl hidden" style="width:100%;">\
                          <input style="width:11em; float:left" type="text" name="fromTimestamp" class="fromTimestamp" value=""/>\
                          <div class="slider" style="width: 400px; height: 15px; margin: auto; float:left; margin:15px;"></div>\
                          <input style="width:11em; float:left" type="text" name="toTimestamp" class="toTimestamp" value=""/>\
                      </div>\
                  </div>\
              </div>\
         </div>\
    ';
};

$(function () {   // only include this once per page (not inside every kit instance
   $("body").append('\
       <div id="newDSDialog" title="Add a new data source">\
           <form>\
               <fieldset class="ui-helper-reset">\
                   <div id="ds_filters"></div>\
                   <label>Specific filter:\
                       <input type="text" name="ds_filterText" id="ds_filterText" value="" class="ui-widget-content ui-corner-all" />\
                   </label>\
                   <hr>\
                   <label>What do you want to call it?\
                       <input type="text" name="ds_name"   id="ds_name" value="" class="ui-widget-content ui-corner-all" />\
                   </label>\
                   <select id="ds_select"></select>\
               </fieldset>\
           </form>\
       </div>\
       <div id="manageDSDialog" title="Manage your data sources">\
           <form>\
               <fieldset class="ui-helper-reset">\
                   <label>Data Source\
                       <select id="manage_ds_select" multiple></select>\
                   </label>\
               </fieldset>\
           </form>\
       </div>\
       <iframe name="hidden_iframe" style="display: none;"></iframe>\
       <form id="getCSV_form" target="hidden_iframe" action="/server/getDataCSV.php" class="hidden" method="POST">\
          <input type="hidden" name="username" class="username"/>\
          <input type="hidden" name="token" class="token"/>\
          <input type="hidden" name="start" class="start"/>\
          <input type="hidden" name="end" class="end"/>\
          <input type="hidden" name="interval" class="interval"/>\
          <input type="hidden" name="kitData" class="kitData"/>\
          <input type="hidden" name="kitName" class="kitName"/>\
       </form>"\
   ');
});


//TODO:   Current bugs/edge-cases
/**
 *
 * 1) if you specify a from (or to) time which is outside the range of the data, the slider will behave a bit odd.
 */