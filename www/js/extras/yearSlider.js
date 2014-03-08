var outliers = outliers || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


outliers.extras.yearSlider = function(options)
{
    var self = {};

    // Pillo los parametros como global vars

    // Pongo lo que me venga por opciones en el self

    for (key in options){
        self[key] = options[key];
    }

    self.increment = self.increment || 1;

    self.parentSelect = "#" + self.parentId;

    // Global de playing

    self.playing = false;

    self.current = 0;

    self.init = function ()
    {

        var injectString =
            ['<div class="play"><img class="playImg" src="'+self.imgPath+self.imgPlay+'" height="25" width="25"></div>',
                '<div class="slider"></div>',
                '<div class="fechaText"></div>'
            ].join('\n');

        $(self.parentSelect).html(injectString);

        // Inserto el componente slider

        var sliderSelect = self.parentSelect + " .slider";

        // Y calculo el número de días

        self.numStages = self.years.length;//self.endDate.clone().diff(self.beginDate.clone(),'years')+1;

        self.nowDate = self.years[0];//self.beginDate.clone();

        self.slider = $(sliderSelect).slider({
            value:1,
            min: 1,
            max: self.numStages,
            step: self.increment,
            disabled: false
        });

        // Pongo el contenido de la fecha inicial

        $(self.parentSelect+" .fechaText").html(self.years[self.current]);//self.nowDate.format("YYYY"));



        // Ato el evento del cambio de slider

        self.slider.bind( "slidechange", function(event, ui)
        {

            //self.nowDate = self.beginDate.clone().add('days',ui.value-1);
            console.log("BIIIND");
            console.log(ui);
            self.current = ui.value-1;

            $(self.parentSelect+" .fechaText").html(self.years[self.current]);
            //$(self.parentSelect+" .fechaText").html(self.nowDate.format("YYYY"));

            // Y llamo al callback
            console.log("LLAMO AL CALLBACK");
            console.log(self.current);

            self.callBack(self.years[self.current]);//self.nowDate.clone());
        });

        // Voy con las alarmas y los clicks

        self.avanzaPlay = function ()
        {

            if((self.playing==true) && (self.current<self.years.length))//(self.nowDate<self.endDate))
            {

                self.current += self.increment;//self.nowDate.clone().add('days',self.increment);


                $( self.parentSelect + " .slider" ).slider('value', $( self.parentSelect + " .slider" ).slider('value') + self.increment);
            }

            // Es el ultimo dia: me paro y pongo a play el boton (estoy en pause)

            //var myDiff = self.endDate.clone().diff(self.nowDate,'days');


            if ((self.playing==true) && (self.current==self.years.length-1))//(self.endDate.clone().diff(self.nowDate,'days')<1))
            {
                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+self.imgPlay+'" height="25" width="25">');
                self.playing = false;
            }

        }

        // Manejo de play/pause


        $(self.parentSelect+" .play").click(function (){

            if(self.playing==false)
            {

                // Si esta parado, pero estoy en el ultimo dia...

                //if((self.endDate.clone().diff(self.nowDate.clone(),'days')<1))
                if(self.current==self.years.length-1)
                {
                    clearInterval(self.refreshId);

                    //self.nowDate = self.beginDate.clone().add('days',0);
                    self.current = 0;

                    $(self.parentSelect + " .slider" ).slider('value', 1);

                    self.refreshId = setInterval(self.avanzaPlay, self.interval);
                }

                self.playing = true;

                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+self.imgPause+'" height="25" width="25">');

            }
            else
            {

                self.playing = false;

                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+self.imgPlay+'" height="25" width="25">');

            }

        });

        self.refreshId = setInterval(self.avanzaPlay, self.interval);

        // NOOOOO--> Condicion de carrera

        // Llamo al callback para la fecha de ahora [primer render]

        //this.callBack.call(this.nowDate.clone());


        // Bug del setInterval de javascript: Cuando me cambio de ventana, me paro

        window.addEventListener('blur', function() {
            self.playing = false;

            $(self.parentSelect+" .play").html('<img src="'+self.imgPath+self.imgPlay+'" height="25" width="25">');

        });

    }

    self.init();

    return self;
}

