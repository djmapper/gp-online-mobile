define(['esri/InfoTemplate'], function(InfoTemplate) {
  return {
    map: {
      id: '133cda82c77a4fde852959fb86285a36',
      //id: '4778fee6371d4e83a22786029f30c7e1',
      options: {
	    geometryServiceURL: "http://s1-support.cloud.eaglegis.co.nz/arcgis/rest/services/Utilities/Geometry/GeometryServer",
        basemap: 'gray',
        center: [-117.1, 33.6],
        zoom: 9
      },
      // TODO: add basemaps
      basemaps: {},
      // TODO: add operationallayers
      operationalLayers: [{
          type: 'feature',
          url: 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Earthquakes/Since_1970/MapServer/0',
          title: 'Earthquakes around the world',
          options: {
            id: 'earthquake',
            opacity: 1.0,
            visible: true,
            outFields: ['*'],
            infoTemplate: new InfoTemplate('Earthquake', '${*}'),
            mode: 0
          }
        }, {
          type: 'dynamic',
          url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/SF311/MapServer',
          title: 'SF311',
          options: {
            id: 'sf311',
            opacity: 0.5,
            visible: true
          }
        }
        // ,{
        //   type: 'feature',
        //   url: 'http://localhost:6080/arcgis/rest/services/SampleWorldCities/MapServer/0',
        //   title: 'Cities',
        //   options: {
        //     id: 'city',
        //     opacity: 1.0,
        //     visible: true,
        //     outFields: ['*'],
        //     infoTemplate: new InfoTemplate('City', '${*}'),
        //     mode: 0
        //   }
        // }
      ]
    },
    about: {
      moreInfoUrl: 'https://github.com/Esri/dojo-bootstrap-map-js'
    }
  };
});