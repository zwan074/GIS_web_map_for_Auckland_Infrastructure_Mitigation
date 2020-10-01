import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {WFS, GeoJSON} from 'ol/format';
import {Heatmap as HeatmapLayer,Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import VectorSource from 'ol/source/Vector';
import {Stroke, Style,Fill} from 'ol/style';
import Overlay from 'ol/Overlay';
import {defaults as defaultControls, ScaleLine} from 'ol/control';
import OSM from 'ol/source/OSM';

//init variables
var vectorSource_waterservice = new VectorSource({
  format: new GeoJSON(),
  strategy: bboxStrategy,
});

var vector_waterservice = new VectorLayer({
  source: vectorSource_waterservice,
  style: new Style({stroke: new Stroke({color: 'rgba(0, 255, 0, 1.0)',width: 2})})
});

var vectorSource_bus = new VectorSource({
  format: new GeoJSON(),
  strategy: bboxStrategy,
});

var vector_bus = new HeatmapLayer({
  source: vectorSource_bus,
  blur: 10,
  radius: 10,
  weight: function(feature) {
    var patronage = feature.get('month_' + monthInput.value);
    var magnitude = parseFloat(patronage)/1500.0;
    return magnitude;
  }
});

var vectorSource_property = new VectorSource({
  format: new GeoJSON(),
  strategy: bboxStrategy
  
});

var vector_property = new VectorLayer({
  source: vectorSource_property,
  style: new Style({stroke: new Stroke({color: 'rgba(255, 0, 255, 1.0)',width: 2})})
});

var vectorSource_water = new VectorSource({
  format: new GeoJSON(),
  strategy: bboxStrategy
});

var vector_water = new VectorLayer({
  source: vectorSource_water,
  style: new Style({stroke: new Stroke({color: 'rgba(0, 0, 255, 1.0)',width: 2})})
});

var vectorSource_wastewater = new VectorSource({
  format: new GeoJSON(),
  strategy: bboxStrategy
});

var vector_wastewater = new VectorLayer({
  source: vectorSource_wastewater,
  style: new Style({stroke: new Stroke({color: 'rgba(255, 0, 0, 1.0)',width: 2})})
});

var xyz = new TileLayer({
  source: new OSM(),
})

//attribute pop ups and close
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};


var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

//scale line on the map
function scaleControl() {
  var control = new ScaleLine({
    units: 'metric'
  });
  return control;
}

//add things into map object
var map = new Map({
  layers: [xyz],//vector_bus],//vector_bus,vector_water,vector_wastewater],
  target: document.getElementById('map'),
  overlays: [overlay],
  controls: defaultControls().extend([
    scaleControl()
  ]),
  
  view: new View({
   
    center:[19454274.805564255,-4418769.487978216],
    zoom: 18,
    minZoom: 10,
    maxZoom: 21
  })
});
//console.log(map.getView())

//turn on and off layers
map.set('vector_water','off');
map.set('vector_wastewater','off');
map.set('vector_property','off');
map.set('vector_bus','off');
map.set('vector_waterservice','off');

var water_checkbox = document.getElementById('water');
var wastewater_checkbox = document.getElementById('wastewater');
var property_checkbox = document.getElementById('property');
var bus_checkbox = document.getElementById('bus');
var waterservice_checkbox = document.getElementById('waterservice');

function update_water_layer () {
  let yearBefore = 2020 - parseInt(yearInput.value);
  if(water_checkbox.checked) {
    if (map.get('vector_water') == 'off' ) {
      map.addLayer(vector_water);
      map.set('vector_water','on');
    }
    let url = function(extent) {
      
      return 'http://localhost:8080/geoserver/geoinfo/ows?service=WFS' + 
        '&version=1.0.0&request=GetFeature&typeName=geoinfo%3Awaterpipe_3857&outputFormat=application%2Fjson'
         +'&srsname=EPSG:3857&' + 'cql_filter=(bbox(geom,' + extent.join(',') + ',%27EPSG:3857%27)and(installed<%27' + yearBefore + '-1-1%27))'; 
    }
    vectorSource_water.setUrl(url);
    vectorSource_water.refresh();
  } else {
    map.set('vector_water','off');
    map.removeLayer(vector_water)
  }
}

function update_waterservice_layer () {
  let yearBefore = 2020 - parseInt(yearInput.value);
  if(waterservice_checkbox.checked) {
    if (map.get('vector_waterservice') == 'off' ) {
      map.addLayer(vector_waterservice);
      map.set('vector_waterservice','on');
    }
    let url = function(extent) {
      
      return 'http://localhost:8080/geoserver/geoinfo/ows?service=WFS' + 
        '&version=1.0.0&request=GetFeature&typeName=geoinfo%3Awater_servicearea_3857&outputFormat=application%2Fjson'
         +'&srsname=EPSG:3857&' + 'cql_filter=(bbox(geom,' + extent.join(',') + ',%27EPSG:3857%27)and(installed<%27' + yearBefore + '-1-1%27))'; 
    }
    vectorSource_waterservice.setUrl(url);
    vectorSource_waterservice.refresh();
  } else {
    map.set('vector_waterservice','off');
    map.removeLayer(vector_waterservice)
  }
}

function update_wastewater_layer () {
  let yearBefore = 2020 - parseInt(yearInput.value);

  if(wastewater_checkbox.checked) {
    if (map.get('vector_wastewater') == 'off' ) {
      map.addLayer(vector_wastewater);
      map.set('vector_wastewater','on');
    }
    
    let url = function(extent) {
      return 'http://localhost:8080/geoserver/geoinfo/ows?service=WFS' + 
      '&version=1.0.0&request=GetFeature&typeName=geoinfo%3Awastewater_pipe_3857&outputFormat=application%2Fjson'
      +'&srsname=EPSG:3857&' + 'cql_filter=(bbox(geom,' + extent.join(',') + ',%27EPSG:3857%27)and(installed<%27' 
      + yearBefore + '-1-1%27))';
    }
    vectorSource_wastewater.setUrl(url);
    vectorSource_wastewater.refresh();
  } else {
    map.removeLayer(vector_wastewater);
    map.set('vector_wastewater','off');
  }
  
}

function update_property_layer () {
  let yearBefore = 2020 - parseInt(yearInput.value);

  if(property_checkbox.checked) {
    if (map.get('vector_property') == 'off' ) {

      map.addLayer(vector_property);
      map.set('vector_property','on');
    }
    
    let url = function(extent) {
      return 'http://localhost:8080/geoserver/geoinfo/ows?service=WFS' + 
      '&version=1.0.0&request=GetFeature&typeName=geoinfo%3Anz-property-titles_3857&outputFormat=application%2Fjson'
      +'&srsname=EPSG:3857&' + 'cql_filter=(bbox(geom,' + extent.join(',') + ',%27EPSG:3857%27)and(issue_date<%27' 
      + yearBefore + '-1-1%27))';
    }
    vectorSource_property.setUrl(url);
    vectorSource_property.refresh();
  } else {
    map.removeLayer(vector_property);
    map.set('vector_property','off');
  }
  
}

function update_bus_layer () {
  
  if(bus_checkbox.checked) {
    if (map.get('vector_bus') == 'off' ) {

      map.addLayer(vector_bus);
      map.set('vector_bus','on');
    }
    
    let url = function(extent) {
      return 'http://localhost:8080/geoserver/geoinfo/ows?service=WFS' + 
      '&version=1.0.0&request=GetFeature&typeName=geoinfo%3Abus_patronage_3857&outputFormat=application%2Fjson'
      +'&srsname=EPSG:3857&' + 'cql_filter=(bbox(geom,' + extent.join(',') + ',%27EPSG:3857%27))';
    }
    vectorSource_bus.setUrl(url);
    vectorSource_bus.refresh();
  } else {
    map.removeLayer(vector_bus);
    map.set('vector_bus','off');
  }
  
}

water_checkbox.addEventListener('change',update_water_layer);
wastewater_checkbox.addEventListener('change',update_wastewater_layer);
property_checkbox.addEventListener('change',update_property_layer);
bus_checkbox.addEventListener('change',update_bus_layer);
waterservice_checkbox.addEventListener('change',update_waterservice_layer);

//restrict displaying items based on zoom level 15
map.on('moveend',  e => {
  console.log(map.getView().getZoom())
  if(map.getView().getZoom() > 15) {
    console.log('appear ' + map.getView().getZoom() )
    vector_water.setVisible(true);
    vector_waterservice.setVisible(true);
    vector_wastewater.setVisible(true);
    vector_property.setVisible(true);
    vector_bus.setVisible(true);
    update_water_layer ();
    update_wastewater_layer ();
    update_property_layer ();
    update_waterservice_layer ();
  }
  else {
    console.log('disappear ' + map.getView().getZoom() )
    vector_water.setVisible(false);
    vector_waterservice.setVisible(false);
    vector_wastewater.setVisible(false);
    vector_property.setVisible(false);
    vector_bus.setVisible(false);
  }


})

//item select logic
var selected = null;
var attr = document.getElementById('attr');
var highlightStyle = new Style({
  fill: new Fill({
    color: 'rgba(255,255,255,0.7)'
  }),
  stroke: new Stroke({
    color: '#3399CC',
    width: 5
  })
});


map.on('click', function(evt) {
  vectorSource_highlight_feature.clear();
  //var coordinates = evt.coordinate;
  //alert(coordinates);
});

map.on('singleclick', function(e) {
  if (selected !== null) {
    selected.setStyle(undefined);
    selected = null;
    
    //map.addLayer(vector_highlight_feature);
  }

  map.forEachFeatureAtPixel(e.pixel, function(f) {
    selected = f;
    f.setStyle(highlightStyle);
    return true;
  });

  if (selected) {
    let layer = document.getElementById('layer').value;
    let hdms = '';
    console.log(selected.id_.split("."))
    if( selected.id_.split(".")[0] == 'waterpipe_3857' || selected.id_.split(".")[0] == 'water_servicearea_3857') {
      hdms = 'Item id : ' + selected.id_ + 
          '<br>Zone : ' +  selected.get('fac_desc') + 
          '<br>gis_id : ' + selected.get('gis_id') + 
          '<br>Material : ' + selected.get('material') +
          '<br>Diameter : ' + selected.get('nom_dia_mm') +
          '<br>Installed Date : ' + selected.get('installed');
    }
    else if(selected.id_.split(".")[0] == 'wastewater_pipe_3857') {
      hdms = 'Item id : ' + selected.id_ + 
      '<br>Zone : ' +  selected.get('fac_desc') + 
      '<br>gis_id : ' + selected.get('gis_id') + 
      '<br>Material : ' + selected.get('material') +
      '<br>Diameter : ' + selected.get('nom_dia_mm') +
      '<br>Installed Date : ' + selected.get('installed');
    }
    else if(selected.id_.split(".")[0] == "nz-property-titles_3857") {
      hdms = 'Item id : ' + selected.id_ + 
      '<br>Estate_des : ' +  selected.get('estate_des') + 
      '<br>id : ' + selected.get('id') + 
      '<br>Title_no : ' + selected.get('title_no') +
      '<br>Type : ' + selected.get('type') +
      '<br>Issue Date : ' + selected.get('issue_date');
    }
    else if(selected.id_.split(".")[0] == "bus_patronage_3857") {
      hdms = 'Bus Stop id : ' + selected.get('objectid') + 
      '<br>Stop Name : ' +  selected.get('stopname') + 
      '<br>Month Before: ' + monthInput.value +
      '<br>Monthly Bus Patronage  : ' + selected.get('month_' + monthInput.value);
    }

    let coordinate = e.coordinate;

    content.innerHTML = '<p>Attribute:</p><code>' + hdms +'</code>';
    overlay.setPosition(coordinate);

  } 
});

//month scorll bar logic for bus patronage
var monthInput = document.getElementById('month-before');
function updateMonth(){
  var div = document.getElementById('bus_status');
  div.querySelector('span.month-before').textContent = monthInput.value;
  update_bus_layer ();
}
monthInput.addEventListener('input', updateMonth);
monthInput.addEventListener('change', updateMonth);


//year scoll bar logic
var yearInput = document.getElementById('year-before');
function updateYear() {
  var yearBefore = 2020 - parseInt(yearInput.value);
  var div = document.getElementById('status');
  div.querySelector('span.year-before').textContent = yearInput.value;
  console.log(yearBefore);
  update_water_layer ();
  update_wastewater_layer ();
  update_property_layer ();
  update_waterservice_layer ();
}

//search text input logic
var vectorSource_highlight_feature = new VectorSource({
  format: new GeoJSON(),
}); 
var vector_highlight_feature = new VectorLayer({
  source: vectorSource_highlight_feature,
  style: highlightStyle
});

function logSearch(event) {
  vectorSource_highlight_feature.clear();
  let item = document.getElementById('item').value;
  let layer = document.getElementById('layer').value;
  let search_layer = '';
  let search_url = '';
  if( layer == 'water' && map.get('vector_water') == 'on') {
    search_layer = 'waterpipe_3857';
    search_url = 'http://localhost:8080/geoserver/geoinfo/ows?service=WFS' + 
  '&version=1.0.0&request=GetFeature&typeName=geoinfo%3A' + search_layer + '&outputFormat=application%2Fjson'
  +'&cql_filter=(gis_id =%27' + item + '%27)';
  }
  else if(layer == 'wastewater' && map.get('vector_wastewater') == 'on') {
    search_layer = 'wastewater_pipe_3857';
    search_url = 'http://localhost:8080/geoserver/geoinfo/ows?service=WFS' + 
  '&version=1.0.0&request=GetFeature&typeName=geoinfo%3A' + search_layer + '&outputFormat=application%2Fjson'
  +'&cql_filter=(gis_id =%27' + item + '%27)';
  }
  else if(layer == 'property' && map.get('vector_property') == 'on') {
    search_layer = 'nz-property-titles_3857';
    search_url = 'http://localhost:8080/geoserver/geoinfo/ows?service=WFS' + 
  '&version=1.0.0&request=GetFeature&typeName=geoinfo%3A' + search_layer + '&outputFormat=application%2Fjson'
  +'&cql_filter=(id =%27' + item + '%27)';
  }
  else if(layer == 'bus_stop' && map.get('vector_bus') == 'on') {
    search_layer = 'bus_patronage_3857';
    search_url = 'http://localhost:8080/geoserver/geoinfo/ows?service=WFS' + 
  '&version=1.0.0&request=GetFeature&typeName=geoinfo%3A' + search_layer + '&outputFormat=application%2Fjson'
  +'&cql_filter=(objectid =%27' + item + '%27)';
  }
  else {
    search_layer = '';
  }

  console.log('url'+search_url)

  // search layer and zoom to requested item
  
  fetch(search_url).then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log('url success')
      var feature = new GeoJSON().readFeatures(json);
      var polygon = feature[0].values_.geometry;
      map.getView().fit(polygon, {padding: [170, 50, 30, 150]});
      log.textContent = `Search Result: Item Found and Zoomed`;
      //add searched feature for highlight
      vectorSource_highlight_feature.addFeatures(feature);
      map.addLayer(vector_highlight_feature);
      
    }).catch(error => {
      console.log('url fail')
      log.textContent = `Search Result: Item Not Found`;
    });
    
  event.preventDefault();
}

var search = document.getElementById('search');
var log = document.getElementById('log');

search.addEventListener('submit', logSearch);
yearInput.addEventListener('input', updateYear);
yearInput.addEventListener('change', updateYear);

updateYear();
updateMonth();

