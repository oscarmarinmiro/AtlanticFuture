var outliers = outliers || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

outliers.controller.arcDiagramController = function (options) {
    var self = {};
    for (key in options){
        self[key] = options[key];
    }
    self.parentSelect = "#"+self.idName;
    self.DATA_FILE = self.baseJUrl+self.dataFile;
    self.ARC_DATA_FILE = self.baseJUrl+self.arcDataFile;
    function myLog(myString, level) {
        if ((self.debugLevel!=0)&&(level<=self.debugLevel)) { console.log(myString); }
    };
    $(document).ready(function () {
        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaChart" class="zonaChart">',
                    '<div id="arcDiagramContent" class="chartContent"></div>',
                '</div>',
            '</div>',
        ].join('\n');
        $(self.parentSelect).html(injectString);
        self.year = 2013;
        d3.json(self.ARC_DATA_FILE, function (data) {
            self.arcData = data;
            self.arcDiagram = new outliers.viz.arcDiagram({
                parentId: 'arcDiagramContent',
                data: data,
                height: 850,
                width: ($("body").innerWidth() / 5) * 3,
                transTime: 2000,
                nodeNameVar: 'name',
                nodeSizeVar: 'pop2005',
                duplicateArcs: true,
                colors: d3.scale.linear().range(['#B5E3E3','#004556']),
                arcsPos: 'BOTH' // [UP, DOWN, BOTH]
            });
            self.arcDiagram.prerender(self.year);
        });

    });

}

