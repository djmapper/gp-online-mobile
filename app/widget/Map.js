var app = {}
define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/dom-construct',
  'dojo/query',
  'dojo/on',
  'dojo/dom-attr',
  'dojo/_base/Color',
  
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleMarkerSymbol',
  
  'esri/renderers/SimpleRenderer',
  'esri/renderers/UniqueValueRenderer',
  'esri/renderers/Renderer',
  
  'esri/InfoTemplate',
  'esri/toolbars/draw',
  'esri/graphic',

  'esri/map',
  'esri/config', 
  'esri/dijit/Scalebar',
  'esri/dijit/PopupTemplate',
  'esri/dijit/HomeButton',
  'esri/dijit/LocateButton',
  'esri/dijit/Geocoder',
  
  
  
  'esri/layers/WebTiledLayer',
  'esri/layers/FeatureLayer',
  
  'esri/tasks/FeatureSet',
  'esri/tasks/Geoprocessor',
  'esri/tasks/GeometryService',
  
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  
  'dojo/dom',
  'dojo/dom-class',
  
  'bootstrap-map-js/js/bootstrapmap',
  'dojo/text!./templates/Map.html'
], function(declare, array, lang, domConstruct, query, on, domAttr, Color,
  SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol,
  SimpleRenderer, UniqueValueRenderer, Renderer,
  InfoTemplate, Draw, Graphic,
  Map, config, Scalebar, PopupTemplate, HomeButton, LocateButton, Geocoder,
  WebTiledLayer, FeatureLayer,
  FeatureSet, Geoprocessor, GeometryService,
  _WidgetBase, _TemplatedMixin,
  dom, domClass,
  BootstrapMap, template) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    editorLayerInfos: [],

    postCreate: function() {
      this.inherited(arguments);
      this._initMap();
    },

    _initMap: function() {
      if( this.config.map.id ) {
      config.defaults.geometryService = new GeometryService("http://maps.ci.perrysburg.oh.us/arcgis/rest/services/Utilities/Geometry/GeometryServer"); 
      BootstrapMap.createWebMap(this.config.map.id, this.mapNode, this.config.map.options).then(lang.hitch(this, function(response) {
        // Once the map is created we get access to the response which provides important info
        // such as the map, operational layers, popup info and more. This object will also contain
        // any custom options you defined for the template. In this example that is the 'theme' property.
        // Here' we'll use it to update the application to match the specified color theme.
        // console.log(this.config);
        this.map = response.map;
        app.mapLayers = response.itemInfo.itemData.operationalLayers;
		this._initWidgets();
        //domClass.add(map.infoWindow.domNode, "dark");
        this.config.response = response;;
	  }), this.reportError);
	  //this._initWidgets();
	  //this._mapLoaded();
	          // Toggle panel
     /*    on(dom.byId("chevron"), "click", function(e){
          if (query(".glyphicon.glyphicon-chevron-up")[0]) {
            query(".glyphicon").replaceClass("glyphicon-chevron-down","glyphicon-chevron-up");
            query(".panel-body.collapse").addClass("in");
          } else {
            query(".glyphicon").replaceClass("glyphicon-chevron-up","glyphicon-chevron-down");
            query(".panel-body.collapse").removeClass("in");
          }
        }); */
	  
      } else {
      this.map = BootstrapMap.create(this.mapNode, this.config.map.options);
      this._initLayers();
      this._initWidgets();
      }
    },
	
	_reportError: function(error) {
      // remove loading class from body
      domClass.remove(document.body, "app-loading");
      domClass.add(document.body, "app-error");
      // an error occurred - notify the user. In this example we pull the string from the
      // resource.js file located in the nls folder because we've set the application up
      // for localization. If you don't need to support multiple languages you can hardcode the
      // strings here and comment out the call in index.html to get the localization strings.
      // set message
      var node = dom.byId("loading_message");
      if (node) {
        if (this.config && this.config.i18n) {
          node.innerHTML = this.config.i18n.map.error + ": " + error.message;
        } else {
          node.innerHTML = "Unable to create map: " + error.message;
        }
      }
    },
	_initLandcover: function(test) {
      // remove loading class from body
      //domClass.remove(document.body, "app-loading");

      //Add the geocoder if search is enabled
            if (this.config.search) {
                var options = {
                    map: this.map,
                    config: this.config
                };
                var myGeocoder = new CreateGeocoder(options);

                if (myGeocoder.geocoder && myGeocoder.geocoder.domNode) {
                    domConstruct.place(myGeocoder.geocoder.domNode, "search");
                }
            }

	  
	  //on(dom.byId("btnLanduse"),"click", initDrawTool);
    			
      //get renderer
      dojo.forEach(app.mapLayers, function(layer) {
        if (layer.title == "LCDBv4") {
          app.luren = new UniqueValueRenderer(layer.layerObject.renderer.toJson());
        }
      });

      /*
       * Step: Implement the Draw toolbar
       */
	 

      tbDraw = new Draw(this.map);
      tbDraw.on("draw-end", this._runAnalysis);
      tbDraw.activate(Draw.FREEHAND_POLYGON);
	  this.map.disablePan();
      this.map.disableDoubleClickZoom();
	},
	
	_runAnalysis: function(evt) {

      domClass.add(document.body, "app-loading");
	  // Get the geometry from the event object
      var geometryInput = evt.geometry;

      // Define symbol for finished polygon
      var tbDrawSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 255, 0]), 2), new Color([255, 255, 0, 0.2]));

      // Clear the map's graphics layer
      this.map.graphics.clear();

      /*
       * Step: Construct and add the polygon graphic
       */
      var aGraphic = new Graphic(geometryInput, tbDrawSymbol);
	  
      this.map.graphics.add(aGraphic);
	  //disable drawing tool
	  tbDraw.deactivate()

        //map.graphics.clear();

        //create featureSet from selection

        var featureSet = new FeatureSet();
        featureSet.geometryType = "esriGeometryPolygon";
        featureSet.features = [aGraphic];
        //define gp task
        gp = new Geoprocessor(
          "http://s1-support.cloud.eaglegis.co.nz/arcgis/rest/services/LRIS/LCDBv4/GPServer/LCDBv4/"
        );
        //set gp parameters
        var taskParams = {
          "Feature": featureSet
        };
        //run analysis
		app.map = this.map
        gp.execute(taskParams, _gpResultAvailable, _gpFailure);

      function _gpResultAvailable(results, messages) {

        app.map.enablePan();
        app.map.enableDoubleClickZoom();
		
		//setup result popuptemplate

        template = new esri.dijit.PopupTemplate({
          title: "{Name}",
          fieldInfos: [{
            fieldName: "Name_2012",
            label: "Class",
            visible: true,
          }, {
            fieldName: "SHAPE_Area",
            label: "Land Cover (sqm)",
            visible: true,
            format: {
              places: 2,
              digitSeparator: false
            }
          }]
        });

        //display results on map
        var features = results[0].value.features;

        for (var f = 0, fl = features.length; f < fl; f++) {
          var feature = features[f];

          app.map.infoWindow.clearFeatures();
          feature.setInfoTemplate(template);
          app.map.graphics.setRenderer(app.luren);
          app.map.graphics.add(feature)

        }
		app.map.graphics.setOpacity(0.7)
        //use renderer and summary table to chart results
        var content = "";
        var data = [];
        var colors = [];


        if (results.length > 0) {

          //content = "Type=" + results[1].value.features[0].attributes.Name_2008 + " SUM=" + results[1].value.features[0];
          var table = results[1].value.features;
          for (var t = 0, tl = table.length; t < tl; t++) {
            var record = table[t];

            var lcClass = record.attributes.Class_2012;
            var lcName = record.attributes.Name_2012;

            dojo.forEach(app.luren.infos, function(item) {
              if (item.value == lcClass) {
                var lcColor = item.symbol.color.toHex();
                colors.push(lcColor);
              }
            });


            var lcHa = record.attributes.AreaHa;
            var ha = [lcHa];
            var item = {
              "name": lcName,
              "data": ha
            };

            data.push(item);
          }
        } else {
          content = "No Results Found";
        }

        //map.infoWindow.setContent(content);

        var chart1 = new Highcharts.Chart({
          chart: {
            
			renderTo: 'dir',
            type: 'column'
          },
          colors: colors,
          title: {
            text: ''
          },
          xAxis: {

            categories: ['Land Cover 2012 (LCDBv4)']
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Land Cover (Ha)'
            }
          },

            tooltip: {
            formatter: function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
            }

          },
          plotOptions: {
            column: {
              stacking: 'normal',
			  pointWidth: 100,
              dataLabels: {
                enabled: false,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) ||
                  'white',
                style: {
                  textShadow: '0 0 3px black, 0 0 3px black'
                }
              }
            }
          },
          series: data

        });
		domClass.remove(document.body, "app-loading");
		query('.graph-modal').modal('show');
      }

      function _gpFailure(error) {
    
        console.error("Error occurred: ", error);
		
      }
	  }, 

    _initLayers: function() {
      this.layers = [];
      var layerTypes = {
        dynamic: 'ArcGISDynamicMapService',
        feature: 'Feature',
        tiled: 'ArcGISTiledMapService'
      };
      // loading all the required modules first ensures the layer order is maintained
      var modules = [];
      array.forEach(this.config.map.operationalLayers, function(layer) {
        var type = layerTypes[layer.type];
        if (type) {
          modules.push('esri/layers/' + type + 'Layer');
        } else {
          console.log('Layer type not supported: ', layer.type);
        }
      }, this);
      require(modules, lang.hitch(this, function() {
        array.forEach(this.config.map.operationalLayers, function(layer) {
          var type = layerTypes[layer.type];
          if (type) {
            require(['esri/layers/' + type + 'Layer'], lang.hitch(this, 'initLayer', layer));
          }
        }, this);
        this.map.addLayers(this.layers);
      }));
    },

    initLayer: function(layer, Layer) {
      var l = new Layer(layer.url, layer.options);
      this.layers.unshift(l); // unshift instead of push to keep layer ordering on map intact
    },

    _initWidgets: function() {
      this.scalebar = new Scalebar({
        map: this.map,
        scalebarUnit: 'dual'
      });
      this.homeButton = new HomeButton({
        map: this.map
      }, this.homeNode);
      this.homeButton.startup();
      this.geoLocate = new LocateButton({
        map: this.map,
        'class': 'locate-button',
		geolocationOptions: {  
                      maximumAge: 0,  
                      timeout: 15000,  
                      enableHighAccuracy: true
					  }
      }, this.locateNode);
      this.geoLocate.startup();
      this.geocoder = new Geocoder({
        map: this.map,
        autoComplete: true,
        'class': 'geocoder'
      }, this.searchNode);
      this.geocoder.startup();
    },

    clearBaseMap: function() {
      var map = this.map;
      if (map.basemapLayerIds.length > 0) {
        array.forEach(map.basemapLayerIds, function(lid) {
          map.removeLayer(map.getLayer(lid));
        });
        map.basemapLayerIds = [];
      } else {
        map.removeLayer(map.getLayer(map.layerIds[0]));
      }
    },

    setBasemap: function(basemapText) {
      var map = this.map;
      var l, options;
      this.clearBaseMap();
      switch (basemapText) {
        case 'Water Color':
          options = {
            id: 'Water Color',
            copyright: 'stamen',
            resampling: true,
            subDomains: ['a', 'b', 'c', 'd']
          };
          l = new WebTiledLayer('http://${subDomain}.tile.stamen.com/watercolor/${level}/${col}/${row}.jpg', options);
          map.addLayer(l,0);
          break;

        case 'MapBox Space':

          options = {
            id: 'mapbox-space',
            copyright: 'MapBox',
            resampling: true,
            subDomains: ['a', 'b', 'c', 'd']
          };
          l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com/v3/eleanor.ipncow29/${level}/${col}/${row}.jpg', options);
          map.addLayer(l,0);
          break;

        case 'Pinterest':
          options = {
            id: 'mapbox-pinterest',
            copyright: 'Pinterest/MapBox',
            resampling: true,
            subDomains: ['a', 'b', 'c', 'd']
          };
          l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com/v3/pinterest.map-ho21rkos/${level}/${col}/${row}.jpg', options);
          map.addLayer(l,0);
          break;
        case 'Streets':
          map.setBasemap('streets');
          break;
        case 'Imagery':
          map.setBasemap('hybrid');
          break;
        case 'National Geographic':
          map.setBasemap('national-geographic');
          break;
        case 'Topographic':
          map.setBasemap('topo');
          break;
        case 'Gray':
          map.setBasemap('gray');
          break;
        case 'Open Street Map':
          map.setBasemap('osm');
          break;
      }
    }
  });
});