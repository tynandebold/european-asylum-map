!function(){function t(t){y=t,a(g)}function a(t){g=t;var a=h[g],e=[];$.each(a,function(t){e.push(a[t][y])});var i,d=d3.max(e)+1,u=d3.min(e);"totalAsylum"===g&&"pctChg"===y?i=[u,0,100,200,400,700,800,1e3,d]:"totalAsylum"===g&&"raw2015"===y?i=[u,5e3,1e4,4e4,6e4,8e4,9e4,2e5,d]:"unaccMinors"===g&&"pctChg"===y?i=[u,0,100,200,400,700,950,1500,d]:"unaccMinors"===g&&"raw2015"===y&&(i=[u,100,500,1e3,3500,8e3,1e4,15e3,d]),p=d3.scale.threshold().domain(i).range(d3.range(9).map(function(t){return"q"+t}));var v=C.selectAll("path").data(topojson.feature(l,l.objects.subunits).features);v.attr("class",s).attr("data-scale",o),v.enter().append("path").attr("class",s).attr("data-scale",o).attr("d",j).on("mouseover",r).on("mousemove",n).on("mouseout",c),v.exit().remove(),C.append("path").datum(topojson.mesh(l,l.objects.subunits,function(t,a){return t!==a})).attr("d",j).attr("class","countryBorders")}function e(t,e,s,o){l=e,s.forEach(function(t){h.totalAsylum||(h.totalAsylum={}),h.totalAsylum[t.countryId]={pctChg:+t.pctChg,raw2015:+t.raw2015}}),o.forEach(function(t){h.unaccMinors||(h.unaccMinors={}),h.unaccMinors[t.countryId]={pctChg:+t.pctChg,raw2015:+t.raw2015}}),a(g)}function s(t){return h[g][t.properties.iso_a3]?"country "+t.properties.iso_a3+" "+p(h[g][t.properties.iso_a3][y]):"country"}function o(t){return h[g][t.properties.iso_a3]?p(h[g][t.properties.iso_a3][y]):void 0}function r(t){if(!v){var a=h[g][t.properties.iso_a3];if(a&&!isNaN(a[y])){var e,s=t.properties.name,r=a[y];"pctChg"===y?e="Pct. change: "+i(r)+"%":"raw2015"===y&&(e="Applicants: "+i(r)),x.transition().duration(200).style("opacity",1),x.html("<span class='country-name'>"+s+"</span><span class='country-number'>"+e+"</span>").style("left",d3.event.pageX-20+"px").style("top",d3.event.pageY-50+"px"),d3.select(this).classed("active",!0);var n=o(t);$(".scale-step."+n).css("border-color","#FF9600")}}}function n(t){if(!v){var a=$(".tooltip"),e=d3.mouse(this),s=e[0],o=e[1],r=a.width(),n=a.height(),c=s-r/2,i=o-n-50;a.css({top:i+"px",left:c+"px"})}}function c(){v||(x.transition().duration(200).style("opacity",0),d3.select(this).classed("active",!1),$(".scale-step").css("border-color","#fff"))}function i(t){return t.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}var l,p,d,u,v,h={},f="totalAsylum",m="pctChg",g=f,y=m,C=d3.select(".map").append("svg").attr("class","svg-elem").attr("viewbox","0 0 100 100").append("g").attr("class","allCountries"),w=$(".svg-elem").width(),b=$(".svg-elem").height(),A=$(window).width();600>A&&(v=!0),A>1800?(d=1.1,u=[0,54]):1801>A&&A>1500?(d=1,u=[0,53.5]):1501>A&&A>769?(d=.75,u=[0,52.25]):769>A&&A>414?(d=.667,u=[0,52.25]):415>A&&A>350?(d=.325,u=[0,52.25]):351>A&&(d=.28,u=[0,52.75]);var _=d3.geo.albers().center(u).rotate([-20,0]).parallels([50,60]).scale(1200*d).translate([w/2,b/2]),j=d3.geo.path().projection(_),x=d3.select(".map").append("div").attr("class","tooltip").style("opacity",0);queue().defer(d3.json,"data/eu.topojson").defer(d3.csv,"data/total_asylum.csv").defer(d3.csv,"data/unacc_minors.csv").await(e),$(".btn").on("click",function(){var e=$(this);if(e.hasClass("data-cat")){$(".data-cat").removeClass("active"),e.addClass("active");var s=e.data("id");a(s)}else if(e.hasClass("data-type")){$(".data-type").removeClass("active"),e.addClass("active");var s=e.data("id");t(s)}})}();