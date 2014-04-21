var outliers = outliers || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

outliers.controller.chordDiagramsController = function(options)
{

     //Referencia a esta instancia

    var self = {};



    for (key in options){
        self[key] = options[key];
    }


    self.parentSelect = "#"+self.idName;

    self.DATA_FILE = self.baseJUrl+self.dataFile;
    self.ARC_DATA_FILE = self.baseJUrl+self.arcDataFile;



     //Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    
    self.formatValue = function(value){
        if(value=='-'){ return 0;}
        value_parts = value.toString().split("").reverse();
        var value_list = [];
        for(var i=0;i<value_parts.length;i++){
            if(i%3==0){
                value_list.push('.')
            }
            value_list.push(value_parts[i]);
        }
        value_str = value_list.reverse().slice(0,value_list.length-1).join("");
        return value_str;
    };

    self.rellenaInfoChord = function(sourceCountryISO,targetCountryISO){
        var sourceCountryAux = self.data.datalabel.countries_data[sourceCountryISO.index];
        var targetCountryAux = self.data.datalabel.countries_data[targetCountryISO.index];

        var movementAux = self.data.datalabel.movements_data[self.year][self.countries[sourceCountryISO.index]][self.countries[targetCountryISO.index]];
        var html = 'From '+sourceCountryAux.longName+"(HDI: "+sourceCountryAux.HDI+") to "+targetCountryAux.longName+"(HDI: "+targetCountryAux.HDI+"): "+self.formatValue(self.data.data[self.year][sourceCountryISO.index][targetCountryISO.index])+" migrants <br>From "+targetCountryAux.longName+"(HDI: "+targetCountryAux.HDI+") to "+sourceCountryAux.longName+"(HDI: "+sourceCountryAux.HDI+"): "+self.formatValue(self.data.data[self.year][targetCountryISO.index][sourceCountryISO.index])+" migrants<br>Same lang: "+movementAux.sameLanguage+'<br>Distance: '+parseFloat(movementAux.distance).toFixed(2)+'<br>Same currency: '+movementAux.sameCurrency;

        //d3.select("#zonaInfo").html(html);
        d3.select(".tooltip").style("opacity",1).html(html);
    };

    self.rellenaInfoGroup = function(countryISO){
        var countryAux = self.data.datalabel.countries_data[countryISO.index];
        var html = countryAux.longName+'<br>HDI: '+parseFloat(countryAux.HDI).toFixed(2)+'<br>Pop: '+self.formatValue(countryAux.Population);
        //d3.select("#zonaInfo").html(html);
        d3.select(".tooltip").style("opacity",1).html(html);
    };

    self.clearInfoGroup = function(){
        //console.log("BORRO GROUP");
        //d3.select("#zonaInfo").html('');
        d3.select(".tooltip").style("opacity",0).html("");
    };

    self.clearInfoChord = function(){
        //console.log("BORRO Chord");
        //d3.select("#zonaInfo").html('');
        d3.select(".tooltip").style("opacity",0).html("");
    };


     //El document ready

    $(document).ready(function()
    {

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div class="opcionesContent">',
                //'<form>',
                //'<label><input type="radio" name="dataIn" value="0" checked>0</label>',
                //'<label><input type="radio" name="dataIn" value="1">1</label>',
                //'</form>',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
                '<div id="zonaInfo"></div>',
                '<div id="zonaChart" class="zonaChart">',
                '<div id="chordDiagramContent" class="chartContent"></div>',
                '<div id="arcDiagramContent" class="chartContent"></div>',
            '</div>',
            '</div>',
        ].join('\n');


        $(self.parentSelect).html(injectString);

        self.colorScale = d3.scale.category20();

        console.log("CHART");
        console.log(d3.select("#zonaChart"));
        self.tooltip = d3.select("#zonaChart").append("div")
            .attr("id","tooltip")
            .html("")
            .attr("class", "tooltip")
            .style("opacity", 0);

        self.mousemove = function()
        {
              console.log(d3.event);
              self.tooltip
                .style("left", (d3.event.pageX +20) + "px")
                .style("top", (d3.event.pageY - 12) + "px");
        }

        self.chordDiagram = outliers.viz.chordDiagram({
            'parentId':"chordDiagramContent",
            //'width':self.width,
            'width': 2*$("body").innerWidth()/3,
            'height':self.height,
            'chartWidth':self.chartWidth,
            'chartHeight':self.chartHeight,
            'transTime':2000,
            'rellenaInfoChord':self.rellenaInfoChord,
            'rellenaInfoGroup': self.rellenaInfoGroup,
            'clearInfoChord': self.clearInfoChord,
            'clearInfoGroup': self.clearInfoGroup,
            'chordPadding': 0.1,
            'colorScale': self.colorScale,
            'mousemove': self.mousemove,
            'myLog':myLog
        });
        self.colors = {"es":"red","en":"yellow","ca":"blue","fr":"green"}


        self.beginDate = moment("1990","YYYY");
        self.endDate = moment("2013","YYYY");
        self.years = [1990,2000,2010,2013];
        self.year = 1990;

        self.callBack = function(year)
        {
            self.year = year;
            console.log("CALLBAKC");
            console.log(self.year);
            self.chordDiagram.render(self.data.datalabel,self.data.data[self.year]);
            //self.arcDiagram.prerender(self.year);
        };

        self.slider = outliers.extras.yearSlider(
        {
            'parentId': "zonaFecha",
            'className': "zonaFecha",
            'imgPath':"img/",
            'imgPause':'pause-on.gif',
            'imgPlay':'play-on.gif',
            'years': self.years,
            'beginDate': self.beginDate,
            'endDate': self.endDate,
            'callBack':self.callBack,
            'interval':3000,
            'increment':1
        });



        $.getJSON(self.DATA_FILE,function(data){
            self.data = data;
            self.countries = self.data.datalabel.countries;
            self.chordDiagram.render(data.datalabel,data.data[2013]);
        });
        /*d3.json(self.ARC_DATA_FILE, function (data) {
            self.arcData = data;
            self.arcDiagram = new outliers.viz.arcDiagram({
                parentId: 'arcDiagramContent',
                data: data,
                height: 1000,
                width: ($("body").innerWidth()/5)*3,
                transTime: 2000,
                nodeNameVar: 'name',
                nodeSizeVar: 'pop2005',
                colors: d3.scale.linear().range(['#B5E3E3','#004556'])
            });
        });*/

    });

}

