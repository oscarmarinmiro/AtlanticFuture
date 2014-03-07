var outliers = outliers || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

outliers.controller.chordDiagramsController = function(options)
{

    // Referencia a esta instancia

    var self = {};



    for (key in options){
        self[key] = options[key];
    }


    self.parentSelect = "#"+self.idName;

    self.DATA_FILE = self.baseJUrl+self.dataFile;



    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    self.rellenaInfoChord = function(){
        console.log("LEYENDA A TOPE");

    };


    // El document ready

    $(document).ready(function()
    {

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div class="opcionesContent">',
                '<form>',
                '<label><input type="radio" name="dataIn" value="0" checked>0</label>',
                '<label><input type="radio" name="dataIn" value="1">1</label>',
                '</form>',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
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
            'transTime':1000,
            'rellenaInfoChord':self.rellenaInfoChord,
            'chordPadding': 0.1,
            'colorScale': self.colorScale,
            'myLog':myLog
        });



        $.getJSON(self.DATA_FILE,function(data){
            console.log(data);
            self.chordDiagram.render(data.datalabel,data.data[2013]);
        //
        });

    });

}

