(function() {

  // globals
  var allData       = {};
  var defaultData   = 'totalAsylum';
  var defaultScale  = 'pctChg';
  var selectedData  = defaultData;
  var selectedScale = defaultScale;
  var europe;
  var quantize;

  // create the svg
  var svg = d3.select(".map").append("svg")
    .attr("class", "svg-elem")
    .attr("viewbox", "0 0 100 100")
    .append("g")
    .attr("class", "allCountries");

  // width/height of svg
  var width = $(".svg-elem").width();
  var height = $(".svg-elem").height();

  var scaleMultiplier;
  var mapCenter;
  var windowWidth = $(window).width();
  var isMobile;

  if (windowWidth < 600) {
    isMobile = true;
  }

  if (windowWidth > 1800) {
    scaleMultiplier = 1.1;
    mapCenter = [0, 54]
  } else if (windowWidth < 1801 && windowWidth > 1500) {
    scaleMultiplier = 1;
    mapCenter = [0, 53.5]
  } else if (windowWidth < 1501 && windowWidth > 769) {
    scaleMultiplier = 0.75;
    mapCenter = [0, 52.25]
  } else if (windowWidth < 769 && windowWidth > 414) {
    scaleMultiplier = 0.667;
    mapCenter = [0, 52.25]
  } else if (windowWidth < 415 && windowWidth > 350) {
    scaleMultiplier = 0.325;
    mapCenter = [0, 52.25]
  } else if (windowWidth < 351) {
    scaleMultiplier = 0.28;
    mapCenter = [0, 52.75]
  }

  // setting the projection
  var projection = d3.geo.albers()
    .center(mapCenter)
    .rotate([-20, 0])
    .parallels([50, 60])
    .scale(1200 * scaleMultiplier)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);

  // define the div for the tooltip
  var tooltip = d3.select(".map").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  function chgScale(dataType){
    selectedScale = dataType;
    redraw(selectedData);
  }

  function redraw(dataSet){
    selectedData = dataSet;

    //scale stuff below
    var countries = allData[selectedData];
    var range     = [];

    $.each(countries, function(country){
      range.push(countries[country][selectedScale]);
    });
    var max = d3.max(range) + 1;
    var min = d3.min(range);

    var scaleDomain;
    if (selectedData === 'totalAsylum' && selectedScale === 'pctChg') {
      scaleDomain = [min, 0, 100, 200, 400, 700, 800, 1000, max];
    } else if (selectedData === 'totalAsylum' && selectedScale === 'raw2015') {
      scaleDomain = [min, 5000, 10000, 40000, 60000, 80000, 90000, 200000, max];
    } else if (selectedData === 'unaccMinors' && selectedScale === 'pctChg') {
      scaleDomain = [min, 0, 100, 200, 400, 700, 950, 1500, max];;
    } else if (selectedData === 'unaccMinors' && selectedScale === 'raw2015') {
      scaleDomain = [min, 100, 500, 1000, 3500, 8000, 10000, 15000, max];
    }

    // quantize function
    quantize = d3.scale.threshold()
      .domain(scaleDomain)
      .range(d3.range(9).map(function(i) { return "q" + i; }));

    var allCountries = svg
        .selectAll("path")
        .data(topojson.feature(europe, europe.objects.subunits).features);

    allCountries
      .attr("class", setClasses)
      .attr("data-scale", setScale);

    allCountries
      .enter().append("path")
        .attr("class", setClasses)
        .attr("data-scale", setScale)
        .attr("d", path)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    allCountries.exit().remove();

    svg
    .append("path")
    .datum(topojson.mesh(europe, europe.objects.subunits, function(a, b) { return a !== b}))
    .attr("d", path)
    .attr("class", "countryBorders");
  }

  queue()
    .defer(d3.json, "data/eu.topojson")
    .defer(d3.csv, "data/total_asylum.csv")
    .defer(d3.csv, "data/unacc_minors.csv")
    .await(ready);

  function ready(error, topo, totalAsylum, unaccMinors) {

    europe = topo;

    totalAsylum.forEach(function(item){
      if(!allData['totalAsylum']){
        allData['totalAsylum'] = {};
      }
      allData['totalAsylum'][item.countryId] = {
        pctChg: +item.pctChg,
        raw2015: +item.raw2015
      };
    });

    unaccMinors.forEach(function(item){
      if(!allData['unaccMinors']){
        allData['unaccMinors'] = {};
      }
      allData['unaccMinors'][item.countryId] = {
        pctChg: +item.pctChg,
        raw2015: +item.raw2015
      };
    });

    redraw(selectedData);
  }

  //abstracted functions
  $('.btn').on('click', function(){
    var $this = $(this);

    if ($this.hasClass('data-cat')) {
      $('.data-cat').removeClass('active');
      $this.addClass('active');
      var id = $this.data('id');
      redraw(id);

    } else if ($this.hasClass('data-type')) {
      $('.data-type').removeClass('active');
      $this.addClass('active');
      var id = $this.data('id');
      chgScale(id);
    }
  });


  function setClasses(d){
    if (!allData[selectedData][d.properties.iso_a3]){
      return "country";
    } else {
      return "country " + d.properties.iso_a3 + " " +
      quantize(allData[selectedData][d.properties.iso_a3][selectedScale]);
    }
  }

  function setScale(d){
    if (!allData[selectedData][d.properties.iso_a3]){
      return;
    }
    return quantize(allData[selectedData][d.properties.iso_a3][selectedScale]);
  }

  function mouseover(d){
    if (isMobile) return;

    var countryObj = allData[selectedData][d.properties.iso_a3];

    if (!countryObj || isNaN(countryObj[selectedScale])){
      return;
    }

    var countryName = d.properties.name;
    var countryData = countryObj[selectedScale];

    var ttContent;
    if (selectedScale === 'pctChg') {
      ttContent = 'Pct. change: ' + numberWithCommas(countryData) + '%';
    } else if (selectedScale === 'raw2015') {
      ttContent = 'Applicants: ' + numberWithCommas(countryData);
    }

    tooltip.transition()
    .duration(200)
    .style("opacity", 1);

    tooltip.html("<span class='country-name'>" + countryName +"</span><span class='country-number'>"+ ttContent + "</span>")
    .style("left", (d3.event.pageX - 20) + "px")
    .style("top", (d3.event.pageY - 50 ) + "px")
    d3.select(this).classed("active", true);

    // simultaneously highlight scale value when hovering over a country
    var colorClass = setScale(d);
    $(".scale-step." + colorClass).css("border-color", "#FF9600");
  }

  function mousemove(d){
    if (isMobile) return;

    var $tooltip = $('.tooltip');

    //Mouse positions
    var mousePosition = d3.mouse(this);
    var xPos = mousePosition[0];
    var yPos = mousePosition[1];

    //Tooltip dimensions
    var ttWidth = $tooltip.width();
    var ttHeight = $tooltip.height();

    //Tooltip positions
    var ttLeft = xPos - (ttWidth / 2);
    var ttTop = yPos - ttHeight - 50;

    $tooltip.css({
      'top': ttTop + 'px',
      'left': ttLeft + 'px'
    });
  }

  function mouseout(){
    if (isMobile) return;

    tooltip.transition()
      .duration(200)
      .style("opacity", 0)
      d3.select(this).classed("active", false);

    $(".scale-step").css("border-color", "#fff");
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();