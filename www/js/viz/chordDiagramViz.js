var outliers = outliers || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


// Draws a d3.js chordDiagram
// Parameters
// idName => DOM id for drawing diagram
// width => SVG width
// height => SVG height
// transTime => transitions time (milliseconds)
// chordPadding => padding between groups
// loadingMessage => message to display while loading data
// Copy functions
//    'quitaInfoChord'
//        'quitaInfoGroup'
//        'rellenaInfoChord'
//        'rellenaInfoGroup'
// myLog => logging function

// idInfo ==> html div id to display aux information (# of calls, # of messages and so on)
// colorScale ==> ordinal color scale to pick chord & groups colors from

outliers.viz.chordDiagram = function (options)
{

    // Object

    var self = {};

    // Var to keep transition state

    self.onTransition = false;

    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.parentId;

    self.init = function(){

        console.log("INIT");

        // svg init

        self.myLog("Iniciando chordChart... en ",3);
        self.myLog(self.parentSelect,3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .append("g")
            .attr("transform", "translate("+(self.width/2)+","+(self.height/2)+")");

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","chordChartTextWarning")
            .attr("x", 0)
            .attr("y",0)
            .text(self.loadingMessage);

        // elements svg

        self.groups = self.svg.append("g");
        self.chords = self.svg.append("g");
        self.texts = self.svg.append("g");

        // chord diagram dimensions

        self.chartWidth = (self.width)-(self.height/10);
        self.chartHeight = (self.height)-(self.height/10);
        self.innerRadius = Math.min(self.chartWidth, self.chartHeight) * .41;
        self.outerRadius = self.innerRadius * 1.1;

        // chord and arc functions

        self.arc_svg = d3.svg.arc().innerRadius(self.innerRadius).outerRadius(self.outerRadius);

        self.chord_svg = d3.svg.chord().radius(self.innerRadius);

        // d3.layout.chord object....

        self.chord = d3.layout.chord()
            .padding(self.chordPadding)
            .sortSubgroups(d3.ascending)
            .sortChords(d3.ascending);


    }

    //self.render = function(data,data_label,color_rule,datum_label,legendDict)
    self.render = function(data_label,data)
    {
        //var data = [[1,4,8],
        //            [4,9,1],
        //            [6,5,9]
        //           ];
        console.log("RENDER");

        //self.warningMessage.remove();
        self.data = data;
        self.data_label = data_label;
        //self.datum_label = datum_label;

        /*d3.selectAll(".bigLegend").remove();
        d3.selectAll(".smallLegend").remove();

        self.svg.append("text")
            .attr("text-anchor", "begin")
            .attr("class","bigLegend")
            .attr("x",-(self.chartWidth/2))
            .attr("y",-(self.height/2)+30)
            .text(legendDict['big']);

        self.svg.append("text")
            .attr("text-anchor", "begin")
            .attr("class","smallLegend")
            .attr("x", -(self.chartWidth/2))
            .attr("y",-(self.height/2)+50)
            .text(legendDict['small']);


        if (self.chord.matrix())
        {
            self.myLog("Segunda ejecucion",3);

        }
        else
        {
            self.myLog("Primera ejecucion",3);
        }
        */

//      OJO: NO QUITAR, es un test interno para comprobar que las matrices ok
//        data[2][45] = 240;

//        console.log(data[17]);

//      FIN_OJO

        self.chord.matrix(data);

        var groupsBind = self.groups.selectAll(".groups").data(self.chord.groups);
        var textBind = self.texts.selectAll(".chordLegendText").data(self.chord.groups,function (d,i){return d.index;});
        var chordsBind = self.chords.selectAll(".chords").data(self.chord.chords,function(d,i){return getStringRepr(d.source.index, d.target.index);});


        // texto....

        textBind.exit().transition().duration(self.transTime).remove();

        textBind.transition()
            .duration(self.transTime)
            .attr("transform", function(d) {
                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
                    + "translate(" + (self.outerRadius + 16) + ")";
            });

        textBind.enter().append("text")
            .attr("dy", ".35em")
            .attr("class","chordLegendText")
            .attr("transform", function(d) {
                return "rotate(" + ( (d.startAngle + (d.endAngle - d.startAngle)/2) * 180 / Math.PI -90) + ")"
                    + "translate(" + (self.outerRadius + 16) + ")";
            })
            .text(function(d){return data_label.countries[d.index];});
            //.text(function(d){return data_label[d.index];});


        // groups....

        groupsBind.exit().transition().duration(self.transTime).remove();

        groupsBind.transition()
            .duration(self.transTime)
            .attrTween("d", arcTween(self.arc_svg, self.old));


        groupsBind.enter().append("path")
            .attr("class","groups")
            .style("fill", function(d) {return self.colorScale(d.index); })
            .style("stroke", function(d) { return "#000"; })
            .attr("d", d3.svg.arc()
                           .innerRadius(self.innerRadius)
                           .outerRadius(self.outerRadius))
            .on("mouseover", fadeOut(0.1))
            .on("mouseout", fadeIn(1));


        // chords....

        chordsBind.exit().transition().duration(self.transTime).style("opacity", 0).remove();

        chordsBind.transition()
            .duration(self.transTime)
            .style("fill", function(d,i) {return self.colorScale(i);})//chooseNodeRule(d,color_rule)); })
            .style("opacity",1)
            .attrTween("d", chordTween(self.chord_svg, self.old));

        chordsBind.enter()
            .append("path")
            .attr("class","chords")
            .attr("d", d3.svg.chord().radius(self.innerRadius))
            .style("fill", function(d) {return self.colorScale(d.target.index); })//function(d) {return self.colorScale(chooseNodeRule(d,color_rule)); })
            .style("opacity", 0.1)
            .on("mouseover", function(d,i){self.rellenaInfoChord(d.source,d.target);})
            .on("mouseout",function(d,i){self.clearInfoChord();})
            .transition()
            .each("start",function()
            {
                self.onTransition = true;
            }
        )
            .duration(self.transTime)
            .style("opacity",1)
            .each("end",function()
            {
                self.onTransition = false;
                self.old = {
                    groups: self.chord.groups(),
                    chords: chordsRepr(self.chord.chords())
                };
            });


        // Y ordeno las cuerdas....

        self.chords.selectAll(".chords").sort(function (a,b){return (a.target.value+ a.source.value)-(b.target.value+ b.source.value);});

    }

    // Main del objeto

    self.init();

    return self;

    function arcTween(arc_svg, old) {
        return function(d,i) {
            var i = d3.interpolate(old.groups[i], d);
            return function(t) {
                return arc_svg(i(t));
            }
        }
    }

    function chordTween(chord_svg, old) {
        return function(d,i) {
            var oldStrRepr = getStringRepr(d.source.index, d.target.index);
            var i = d3.interpolate(old.chords[oldStrRepr], d);
            return function(t) {
                return chord_svg(i(t));
            }
        }
    }

    function fadeIn(opacity) {
        return function (d, i) {
            self.clearInfoGroup();
            self.svg.selectAll(".chords")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .style("opacity", opacity);
        };
    }

    function fadeOut(opacity) {
        return function (d, i) {
            self.rellenaInfoGroup(d);
            self.svg.selectAll(".chords")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .style("opacity", opacity);
        };
    }


    function chordsRepr(chords)
    {
        var repr = [];

        for(var i=0;i<chords.length;i++)
        {
            var stringRepr = getStringRepr(chords[i].source.index,chords[i].target.index);

            repr[stringRepr] = chords[i];
        }

        return repr;
    }

    function getStringRepr(i,j)
    {
        return (i>j) ? i.toString()+"*"+ j.toString(): j.toString()+"*"+ i.toString();
    }

    function chooseNodeRule(d,color_rule)
    {
        var bigger = d.source.value > d.target.value ? d.source.index: d.target.index;
        var smaller = d.source.value < d.target.value ? d.source.index: d.target.index;

        if (color_rule=='bigger')
        {
            return bigger;
        }
        else
        {
            return smaller;
        }

    }

}
