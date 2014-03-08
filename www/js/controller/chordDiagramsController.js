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



     //Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    self.rellenaInfoChord = function(sourceCountryISO,targetCountryISO){
        console.log("LEYENDA A TOPE");
        console.log(self.countries[sourceCountryISO.index]);
        console.log(self.data.data[self.year][sourceCountryISO.index][targetCountryISO.index]);
        d3.select("#zonaInfo").html(self.countries[sourceCountryISO.index]+" -> "+self.countries[targetCountryISO.index]+": "+self.data.data[self.year][sourceCountryISO.index][targetCountryISO.index]);
    };

    self.rellenaInfoGroup = function(countryISO){
        d3.select("#zonaInfo").html(self.data.datalabel.countries_data[countryISO.index].name);
    };

    self.clearInfoGroup = function(){
        //console.log("BORRO GROUP");
        d3.select("#zonaInfo").html('');
    };

    self.clearInfoChord = function(){
        //console.log("BORRO Chord");
        d3.select("#zonaInfo").html('');
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
            '<div id="chartContent" class="chartContent"></div>',
            '</div>',
            '</div>',
        ].join('\n');


        $(self.parentSelect).html(injectString);

        self.colorScale = d3.scale.category20();

        self.chordDiagram = outliers.viz.chordDiagram({
            'parentId':"chartContent",
            'width':self.width,
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
            'myLog':myLog
        });



        self.beginDate = moment("1990","YYYY");
        self.endDate = moment("2013","YYYY");
        self.years = [1990,2000,2010,2013];
        self.year = 1990;

        self.callBack = function(year)
        {
            console.log("CALLBAKC");
            console.log(year);
            self.chordDiagram.render(self.data.datalabel,self.data.data[year]);
            self.year = year;
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

    });

}

