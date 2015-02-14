/*
  queries the multi-family housing database for all the buildings within a certain region
    minmax must be formatted as [min long, min lat, max long, max lat]
*/
function get_buildings(minmax, callback) {
  console.log('retrieving multi-family housing objects');
  var request = $.ajax({
    url: "http://services.arcgis.com/VTyQ9soqVukalItT/ArcGIS/rest/services/MultiFamilyProperties/FeatureServer/0/query?"
      + "where=IS_202_811_IND = 'y' OR IS_SEC8_IND = 'y' OR IS_RENT_SUPPLEMENT_IND = 'y'&outFields="
      + "LAT%2C+LON%2C+TOTAL_ASSISTED_UNIT_COUNT%2C+CLIENT_GROUP_TYPE&geometry={\"xmin\":" + minmax[0] + ",\"ymin\":"
      + minmax[1] + ",\"xmax\":" + minmax[2] + ",\"ymax\":" + minmax[3] + ",\"spatialReference\":"
      + "{\"wkid\":4236}}&f=geojson",
    type: 'GET',
    datatype: 'JSON'
  });

  request.done(function(res, msg) {
    if (!res || res === null || res.error) {
      console.log(res.error.code);
      console.log(res.error.message.details);
      return;
    }
    // need to parse because api gives us text format
    var result = JSON.parse(res);
    var cumulative = [];
    for (var item in result.features) {
      var curr = {
        coordinates: [result.features[item].properties.LON, result.features[item].properties.LAT],
        num_asst_units: result.features[item].properties.TOTAL_ASSISTED_UNIT_COUNT,
        type: result.features[item].properties.CLIENT_GROUP_TYPE
      };
      cumulative.push(curr);
    }
    callback(cumulative);
  });
}

function get_blocks_recr(start, cumulative, minmax, callback) {

  var request = $.ajax({
    url: "http://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/LocationAffordabilityIndexData/FeatureServer/0/query?"
        + "where=OBJECTID>" + start + "&outFields=households%2C+area_median_income%2C+pct_renters%2C+blkgrp_median_income_renters"
        + "%2C+OBJECTID&outSR="
        + "{\"wkid\":4326}&geometry={\"xmin\":" + minmax[0] + ",\"ymin\":" + minmax[1] + ",\"xmax\":" + minmax[2] + ",\"ymax\":"
        + minmax[3] + ",\"spatialReference\":{\"wkid\":4236}}&f=geojson",
    type: 'GET',
    datatype: 'JSON'
  });

  request.done(function(res, msg) {
    if (!res || res === null || res.error) {
      console.log(res.error.code);
      console.log(res.error.message.details);
      return;
    }
    // need to parse because api gives us text format
    var result = JSON.parse(res);
    var end = 0;
    for (var item in result.features) {
      for (var ring in result.features[item].geometry.coordinates) {
        var curr = {
          coordinates: result.features[item].geometry.coordinates[ring],
          num_households: result.features[item].properties.households,
          median_income: result.features[item].properties.area_median_income,
          med_inc_renters:  result.features[item].properties.blkgrp_median_income_renters,
          num_renters: result.features[item].properties.pct_renters * result.features[item].properties.households,
          num_buildings: 0,
          num_asst_units: 0,
          buildings: []
        };
        cumulative.push(curr);
        if (result.features[item].properties.OBJECTID > end) {
          end = result.features[item].properties.OBJECTID;
        }
      }
    }
    if (result.features.length < 1000) {
      console.log('we got ' + cumulative.length + ' results');
      callback(cumulative);
      return;
    } else {
      get_blocks_recr(end, cumulative, minmax, callback);
    }
  });
}

function get_blocks(minmax, callback) {
  console.log('retrieving results from LOCATION AFFORDABILITY INDEX');
  get_blocks_recr(0, [], minmax, callback);
}

function getMapData(minmax, callback) {
  var buildings;
  var blocks;
  var building_to_block = 0;

  get_buildings(minmax, function(building_data) {
    buildings = building_data;
    get_blocks(minmax, function(block_data) {
      blocks = block_data;
      for (var build in buildings) {
        // ASSUMPTION: no two block polygons overlap each other
        var buildingLoc = buildings[build].coordinates;
        for (var i = 0; i < blocks.length; i++) {
          if (pointInPoly(buildingLoc, blocks[i].coordinates)) {
            blocks[i].num_buildings += 1;
            blocks[i].num_asst_units += buildings[build].num_asst_units;
            blocks[i].buildings.push({
              coordinates: buildings[build].coordinates,
              type: buildings[build].type
            });
            building_to_block += 1;
            break;
          }
        }
      }
      console.log('fin, ' + building_to_block + ' out of '
          + buildings.length + ' buildings successfully mapped to a block');
      callback(blocks);
    });
  });
}

// from github
function pointInPoly(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};