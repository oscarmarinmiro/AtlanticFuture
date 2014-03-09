var outliers = outliers || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };
outliers.viz.arcDiagram = function (options) {
    // Object
    var self = {};
    // Get options data
    for (key in options){
        self[key] = options[key];
    }
    self.parentSelect = '#' + self.parentId;
    self.init = function () {
        self.width = self.width || $(self.parentSelect).innerWidth();
        self.height = self.height || $(self.parentSelect).innerHeight();
        self.margin = self.margin || {top: 20, left:20, bottom:20, right:20};
        self.colors = self.colors || d3.scale.category20();
        self.nodeSizeVar = self.nodeSizeVar || null;
        self.nodeIdVar = self.nodeIdVar || null;
        self.nodeNameVar = self.nodeNameVar || null;
        self.nodeColorVar = self.nodeColorVar || null;
        self.linkWidthVar = self.linkWidthVar || 'value';
        self.year = self.year || 1990;
        self.firstRender = true;

        self.yFixedNodes = (self.height - self.margin.top - self.margin.bottom) / 2;
        //Create SVG.
        self.svg = d3.select(self.parentSelect)
                     .append('svg')
                     .attr('id', 'arcDiagram-' + self.parentId)
                     .attr('width', self.width)
                     .attr('height', self.height);
        //Create plot area.
        self.plotArea = self.svg.append('g')
                                .attr('id', 'plotArea-' + self.parentId)
                                .attr('transform', 'translate(' + self.margin.top + ', ' +
                                      self.margin.left + ')');


        self.prerender(1990);
    };
    self.prerender = function (year) {
        console.log("prerender");
        
        self.year = year;
        //self.yFixedNodes = (self.height - self.margin.top - self.margin.bottom) / 2;
        //Create SVG.
        //self.svg = d3.select(self.parentSelect)
        //             .append('svg')
        //             .attr('id', 'arcDiagram-' + self.parentId)
        //             .attr('width', self.width)
        //             .attr('height', self.height);
        //Create plot area.
        //self.plotArea = self.svg.append('g')
        //                        .attr('id', 'plotArea-' + self.parentId)
        //                        .attr('transform', 'translate(' + self.margin.top + ', ' +
        //                              self.margin.left + ')');
        self.data.links[self.year].forEach(function (d, i) {
            d.source = isNaN(d.source) ? d.source : self.data.nodes[d.source];
            d.target = isNaN(d.target) ? d.target : self.data.nodes[d.target];
        });
        self.prepareNodes();
        self.drawLinks();
        if(self.firstRender){
            self.drawNodes();
        }
        self.firstRender = false;
    };
    self.prepareNodes = function () {
        self.xScale = d3.scale.linear()
                              .domain([0, self.data.nodes.length - 1])
                              .range([0, self.width - self.margin.right - self.margin.left]);
        var maxNodeSize = 10;
        if (self.nodeSizeVar != null) {
            maxNodeSize = d3.max(self.data.nodes, function (d) {
                return +d[self.nodeSizeVar];
            });
        }
        self.colors.domain([0, maxNodeSize]);
        self.nodeRadiusScale = d3.scale.sqrt()
                                       .domain([0, maxNodeSize])
                                       .range([0, ((self.width - self.margin.right - self.margin.left) / self.data.nodes.length) * 0.5]);
        self.data.nodes.forEach(function (d, i) {
            d.i = i;
            d.x = self.xScale(i);
            d.y = self.yFixedNodes;
            d.r = self.nodeRadiusScale(self.nodeSizeVar == null ? Math.floor((Math.random()*10)+1) : d[self.nodeSizeVar]);
            d.color = self.colors(self.nodeColorVar == null ? i % maxNodeSize : d[self.nodeColorVar]);
        });
    };
    self.nodeId = function (d, i) {
        return 'node' + (self.nodeIdVar == null ? d.i : d[self.nodeIdVar]);
    };
    self.drawInfo = function (node, selected) {
        var x = parseFloat(node.attr('cx'));
        var y = parseFloat(node.attr('cy'));
        var r = parseFloat(node.attr('r'));
        var text = self.nodeNameVar == null ? node.attr('id') : node[0][0].__data__[self.nodeNameVar];
        var tooltip = self.plotArea
                          .append('text')
                          .attr('class', 'tooltiparc ' + (selected ? 'tooltiparctop' : 'tooltiparcbottom'))
                          .text(text)
                          .attr('x', x)
                          .attr('y', y)
                          .attr('dy', (selected ? -10 - (r * 2) : 10 + (r * 2)))
                          .attr('id', 'tooltip-' + node.attr('id'));
        var bbox = tooltip.node().getBBox(),
            offset = bbox.width / 2;
        if ((x - offset) < 0) {
            tooltip.attr('text-anchor', 'start');
            tooltip.attr('dx', -r);
        }
        else if ((x + offset) > (self.width - self.margin.left - self.margin.right)) {
            tooltip.attr('text-anchor', 'end');
            tooltip.attr('dx', r);
        }
        else {
            tooltip.attr('text-anchor', 'middle');
            tooltip.attr('dx', 0);
        }
    };
    self.drawNodes = function () {
        self.plotArea
          .selectAll('.node')
          .data(self.data.nodes)
          .enter()
          .append('circle')
          .attr('id', function (d, i) {
              return self.nodeId(d, i);
          })
          .attr('class', function (d, i) {
              return 'node ' + self.nodeId(d, i);
          })
          .attr('cx', function (d, i) { return d.x; })
          .attr('cy', function (d, i) { return d.y; })
          .attr('r', function (d, i) { return d.r; })
          .style('fill', function (d, i) { return d.color; })
          .on('mouseover', function (d, i) {
              self.plotArea.selectAll('.node').style('opacity', 0.3);
              self.plotArea.selectAll('.link').style('opacity', 0.01);
              var connectedLinks = self.plotArea.selectAll('.link.' + self.nodeId(d));
              connectedLinks.style('opacity', 0.7);
              var currentNode = d3.select(this);
              connectedLinks[0].forEach(function (d, i) {
                  self.plotArea.selectAll('.node.' + self.nodeId(d.__data__.target)).style('opacity', 1.0);
                  self.plotArea.selectAll('.node.' + self.nodeId(d.__data__.source)).style('opacity', 1.0);
                  var targetNode = d3.select('.node.' + self.nodeId(d.__data__.target)),
                      sourceNode = d3.select('.node.' + self.nodeId(d.__data__.source));
                  if (targetNode.attr('id') != currentNode.attr('id')) {
                      self.drawInfo(targetNode, false);
                  }
                  if (sourceNode.attr('id') != currentNode.attr('id')) {
                      self.drawInfo(sourceNode, false);
                  }
              });
              self.drawInfo(currentNode, true);
          })
          .on('mouseout', function (d, i) {
              d3.selectAll('.tooltiparc').remove();
              d3.selectAll('.node').style('opacity', 1.0);
              d3.selectAll('.link').style('opacity', 0.5);
          });
    };
    self.drawLinks = function () {
        var radians = {
            bottom: d3.scale.linear().range([Math.PI / 2, 3 * Math.PI / 2]),
            top: d3.scale.linear().range([-Math.PI / 2, Math.PI / 2])
        };
        var arc = {
            bottom: d3.svg.line.radial().interpolate('basis').tension(0).angle(function (x) { return radians.bottom(x); }),
            top: d3.svg.line.radial().interpolate('basis').tension(0).angle(function (x) { return radians.top(x); })
        };
        /*var maxStrokeWidth = 10;
        if (self.linkWidthVar != null) {
            maxStrokeWidth = d3.max(self.data.links, function (d) {
                return +d[self.linkWidthVar];
            });
        }*/
        self.linkStrokeWidthScale = d3.scale.sqrt()
                                            .domain([0, 12000000])
                                            .range([0, 10]);
        self.links = self.plotArea
          .selectAll('.link')
          .data(self.data.links[self.year],function(d,i){
                var id_str = d.source.iso2+"&&##&&"+d.target.iso2;
                return id_str;
          });

        self.links.transition().duration(self.transTime)
          .attr('transform', function (d, i) {
              var xshift = d.source.x + (d.target.x - d.source.x) / 2;
              var yshift = self.yFixedNodes;
              return 'translate(' + xshift + ', ' + yshift + ')';
          })
          .attr('d', function (d, i) {
              var xdist = Math.abs(d.source.x - d.target.x);
              var points = d3.range(0, Math.ceil(xdist / 3));
              if (d.type === 'IN'){
                  arc.top.radius(xdist / 2);
                  radians.top.domain([0, points.length - 1]);
                  return arc.top(points);
              } else if (d.type === 'OUT') {
                  arc.bottom.radius(xdist / 2);
                  radians.bottom.domain([0, points.length - 1]);
                  return arc.bottom(points);
              }
          })
          .style('stroke-width', function (d, i) {
              console.log(d['value']);
              console.log(self.linkStrokeWidthScale(d['value']));
              return self.linkStrokeWidthScale(d[self.linkWidthVar])+'px';
              //return (self.linkWidthVar == null ? self.linkStrokeWidthScale(Math.floor((Math.random()*10)+1)) : self.linkStrokeWidthScale(d[self.linkWidthVar])) + 'px';
          });
          
        self.links.exit().remove();

        self.links.enter()
          .append('path')
          .attr('class', function (d, i) {
              return 'link ' + d.type + ' ' + self.nodeId(d.source) + ' ' + self.nodeId(d.target);
          })
          .attr('transform', function (d, i) {
              var xshift = d.source.x + (d.target.x - d.source.x) / 2;
              var yshift = self.yFixedNodes;
              return 'translate(' + xshift + ', ' + yshift + ')';
          })
          .attr('d', function (d, i) {
              var xdist = Math.abs(d.source.x - d.target.x);
              var points = d3.range(0, Math.ceil(xdist / 3));
              if (d.type === 'IN'){
                  arc.top.radius(xdist / 2);
                  radians.top.domain([0, points.length - 1]);
                  return arc.top(points);
              } else if (d.type === 'OUT') {
                  arc.bottom.radius(xdist / 2);
                  radians.bottom.domain([0, points.length - 1]);
                  return arc.bottom(points);
              }
          })
          .style('stroke-width', function (d, i) {
              return (self.linkWidthVar == null ? self.linkStrokeWidthScale(Math.floor((Math.random()*10)+1)) : self.linkStrokeWidthScale(d[self.linkWidthVar])) + 'px';
          });
    };
    self.render = function () {
    };
    self.init();
    return self;
}
