// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';

type Props = {};

import gdal from 'gdal';
import ogr from 'gdal';

// convert to geojson from shapefile
// from osgeo import ogr
// import os

// # Get a Layer's Extent
// inShapefile = "states.shp"
// inDriver = ogr.GetDriverByName("ESRI Shapefile")
// inDataSource = inDriver.Open(inShapefile, 0)
// inLayer = inDataSource.GetLayer()
// extent = inLayer.GetExtent()

// # Create a Polygon from the extent tuple
// ring = ogr.Geometry(ogr.wkbLinearRing)
// ring.AddPoint(extent[0],extent[2])
// ring.AddPoint(extent[1], extent[2])
// ring.AddPoint(extent[1], extent[3])
// ring.AddPoint(extent[0], extent[3])
// ring.AddPoint(extent[0],extent[2])
// poly = ogr.Geometry(ogr.wkbPolygon)
// poly.AddGeometry(ring)

// # Save extent to a new Shapefile
// outShapefile = "states_extent.shp"
// outDriver = ogr.GetDriverByName("ESRI Shapefile")

// # Remove output shapefile if it already exists
// if os.path.exists(outShapefile):
//     outDriver.DeleteDataSource(outShapefile)

// # Create the output shapefile
// outDataSource = outDriver.CreateDataSource(outShapefile)
// outLayer = outDataSource.CreateLayer("states_extent", geom_type=ogr.wkbPolygon)

// # Add an ID field
// idField = ogr.FieldDefn("id", ogr.OFTInteger)
// outLayer.CreateField(idField)

// # Create the feature and set values
// featureDefn = outLayer.GetLayerDefn()
// feature = ogr.Feature(featureDefn)
// feature.SetGeometry(poly)
// feature.SetField("id", 1)
// outLayer.CreateFeature(feature)
// feature = None

// # Save and close DataSource
// inDataSource = None
// outDataSource = None
const {dialog} = require('electron').remote;
var fs = require('fs');

// function readFile(filepath) {
//     fs.readFile(filepath, 'utf-8', function (err, data) {
//         if(err){
//             alert("An error ocurred reading the file :" + err.message);
//             return;
//         }
        
//         // document.getElementById("content-editor").value = data;
//         // document.getElementById("actual-file").innerText = fileNames[0];
//         var dataset = gdal.open("sample.shp");
//         var layer = dataset.layers.get(0);

//         console.log("number of features: " + layer.features.count());
//         console.log("fields: " + layer.fields.getNames());
//         console.log("extent: " + JSON.stringify(layer.extent));
//         console.log("srs: " + (layer.srs ? layer.srs.toWKT() : 'null'));
//     });
// }


export default class Home extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    console.log('constructor being called')
    this.state = {
      value: null,
    };
    console.log(this)
    this.handleShapefileSelection = this.handleShapefileSelection.bind(this);
    console.log(this.handleShapefileSelection)
  }

  componentDidMount() {
    document.getElementById('select-file').addEventListener('click', () => {
      dialog.showOpenDialog((fileNames) => {
          if(fileNames === undefined){
              console.log("No file selected");
          }else{
              // document.getElementById("actual-file").innerText = fileNames[0];
              this.handleShapefileSelection(fileNames[0]);
          }
          console.log(this)
      }); 
    },false);

  }
  
  handleShapefileSelection(filename) {
      fs.readFile(filename, 'utf-8', function (err, data) {
          if(err){
              alert("An error ocurred reading the file :" + err.message);
              return;
          }
          console.log('I read file good')
        });
          
    const dataset = gdal.open(filename);
    const layer = dataset.layers.get(0);

    console.log("number of features: " + layer.features.count());
    console.log("fields: " + layer.fields.getNames());
    console.log("extent: " + JSON.stringify(layer.extent));
    console.log("srs: " + (layer.srs ? layer.srs.toWKT() : 'null'));


    let multipolygon = new gdal.MultiPolygon()

    // # Create ring #1
    // ring1 = ogr.Geometry(ogr.wkbLinearRing)
    // ring1.AddPoint(1204067.0548148106, 634617.5980860253)
    // ring1.AddPoint(1204067.0548148106, 620742.1035724243)
    // ring1.AddPoint(1215167.4504256917, 620742.1035724243)
    // ring1.AddPoint(1215167.4504256917, 634617.5980860253)
    // ring1.AddPoint(1204067.0548148106, 634617.5980860253)

    // # Create polygon #1
    // poly1 = ogr.Geometry(ogr.wkbPolygon)
    // poly1.AddGeometry(ring1)
    // multipolygon.AddGeometry(poly1) 
    let polygon_def = { type: 'Feature', properties: {}, geometry: { type: "MultiPolygon", coordinates: [[]]}}

    console.log(polygon_def)
    for (let i = 0; i < layer.features.count(); i++) {
        let geom = layer.features.get(i).getGeometry()
      
        const geojson_geom = geom.toObject()
        console.log(geojson_geom.coordinates[0][0])
        console.log(geojson_geom.coordinates[0][1])
        const coords = []
        for (let polygon of geojson_geom.coordinates[0]) {
          coords.push([polygon[0], polygon[1]])
        }
        polygon_def.geometry.coordinates[0].push(coords)

        console.log(geojson_geom) 
    }

    const json_string = JSON.stringify(polygon_def);
    
    fs.writeFile('jsontest.geojson', json_string, function(err) {
      if(err) {
        console.log(err);
      } else {
          console.log("The file was saved!");
      }

    } );
  }

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Home</h2>
        <button id="select-file">Select Shapefile</button>
        <Link to={routes.COUNTER}>to Counter</Link>
      </div>
    );
  }
}
