// longitude, latitude everytime

function inRange(latlong, lon, lat) {
  return lon >= latlong[0] && lon <= latlong[2] && lat >= latlong[1] && lat <= latlong[3];
}

/*
  latlong: 4 element array [minLon, minLat, maxLon, maxLat]
*/
// returns list of coordinates for buildings that qualify for a subsidy program
function get_subsidized_buildings(start, latlong, cumulative, callback) {
  var end = start + 1000;
  console.log('retrieving results from MULTIFAMILY PROPERTIES: ' + start + ' to ' + end);
  var request = $.ajax({
    url: 'http://services.arcgis.com/VTyQ9soqVukalItT/ArcGIS/rest/services/MultiFamilyProperties/FeatureServer/0/query?where='
        + "(IS_202_811_IND = 'y' OR IS_SEC8_IND = 'y' OR IS_RENT_SUPPLEMENT_IND = 'y')"
        + " AND (OBJECTID >= " + start + " AND OBJECTID < " + end + ")&outFields=LAT%2C+LON%2C+TOTAL_ASSISTED_UNIT_COUNT%2C+"
        + "CLIENT_GROUP_TYPE&f=geojson",
    type: 'GET',
    datatype: 'JSON'
  });

  request.done(function(res, msg) {
    if (!res || res === null) {
      // request went to server but didn't work
      console.log('error');
    } else {
      // request succeeded
      var result = JSON.parse(res);
      console.log(result);
      // ASSUME: if no result found in 1000 consecutive rows, then we are finished
      if (result.features.length == 0) {
        console.log('fin, found ' + cumulative.length + ' items');
        callback(cumulative);
        return;
      }
      for (var item in result.features) {
        if (inRange(latlong, result.features[item].properties.LON, result.features[item].properties.LAT)) {
          var curr = {
            coordinates: [result.features[item].properties.LON, result.features[item].properties.LAT],
            num_asst_units: result.features[item].properties.TOTAL_ASSISTED_UNIT_COUNT,
            type: result.features[item].properties.CLIENT_GROUP_TYPE
          };
          cumulative.push(curr);
        }
      }
      get_subsidized_buildings(end, latlong, cumulative, callback);
    }
  });

  // request failed to even make it to server
  request.fail(function(data, msg) {
    console.log('couldn\'t hit them');
    callback({status: 'failure'});
  });
}

/*
  FIGURE OUT OVERLAPPING RINGS
*/
// returns list of 'blocks' with each group 
function get_population(start, max, cumulative, callback) {
  var end = start + 1000;
  console.log('retrieving results from LOCATION AFFORDABILITY INDEX: ' + start + ' to ' + end);
  var request = $.ajax({
    url: 'http://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/LocationAffordabilityIndexData/FeatureServer/0/query?'
        + 'where=OBJECTID >= ' + start + ' AND OBJECTID < ' + end 
        +'&outFields=households%2C+area_median_income%2C+pct_renters%2C+blkgrp_median_income_renters&outSR={"wkid":4326}&f=geojson',
    type: 'GET',
    datatype: 'JSON'
  });

  request.done(function(res, msg) {
    var response = [];
    if (!res || res === null || res.status === 'failure') {
      // request went to server but didn't work
      console.log('function: get_population encountered error');
    } else {
      // request succeeded
      var result = JSON.parse(res);
      if (result.features.length == 0) {
        console.log('fin, found ' + cumulative.length + ' items [parsed entire dataset]');
        callback(cumulative);
        return;
      }
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
          }
          cumulative.push(curr);
          if (cumulative.length >= max) {
            console.log('fin, found ' + cumulative.length + ' items');
            callback(cumulative);
            return;
          }
        }
      }
      get_population(end, max, cumulative, callback);
    }
  });

  // request failed to even make it to server
  request.fail(function(data, msg) {
    console.log('function: get_population couldn\'t hit server');
    callback({status: 'failure'});
  });
}

/*
  using the data from the buildings and blocks, we combine to form a single
  dimension array of objects that are of the format
  {
    num_buildings: number of buildings in block
    centroid: the 'average' coordinate of the block
    pop_size: the population value
  }
*/
function combineResponsesToState(max_blocks, callback) {
  get_subsidized_buildings(0, [], function(a) {
    var buildings = a;
    get_population(0, max_blocks, [], function(b) {
      var blocks = b;
      var building_to_block = 0;
      var block_to_state = 0;
      console.log('attaching buildings to blocks...');
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
            break;
          }
        }
        if (i < blocks.length) {
          building_to_block += 1;
        }
        console.log('.');
      }

      console.log('attaching blocks to states, almost done...');
      // attach block to a state
      for (var j = 0; j < blocks.length; j++) {
        var blockLoc = blockCentroid(blocks[j].coordinates);
        for (var i = 0; i < states.length; i++) {
          for (var n = 0; n < states[i].coordinates.length; n++) {
            if (pointInPoly(blockLoc, states[i].coordinates[n])) {
              block_to_state += 1;
              states[i].blocks.push(blocks[j]);
              states[i].num_buildings += blocks[j].num_buildings,
              states[i].num_asst_units += blocks[j].num_asst_units,
              states[i].num_renters += blocks[j].num_renters
            }
          }
          console.log('.');
        }
      }
      console.log('fin, ' + building_to_block + ' out of ' + buildings.length + ' buildings successfully mapped to a block');
      console.log(block_to_state + ' out of ' + blocks.length + ' blocks successfully mapped to a state');
      callback(blocks);
    });
  });
}

function combineResponses(max_blocks, latlong, callback) {
  get_subsidized_buildings(0, latlong, [], function(a) {
    var buildings = a;
    get_population(0, max_blocks, [], function(b) {
      var blocks = b;
      var building_to_block = 0;
      var block_to_state = 0;
      console.log('attaching buildings to blocks...');
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
            break;
          }
        }
        if (i < blocks.length) {
          building_to_block += 1;
        }
        console.log('.');
      }
      console.log('fin, ' + building_to_block + ' out of ' + buildings.length + ' buildings successfully mapped to a block');
      console.log('compiling final result set...');
      /*
      var result = [];
      for (var n = 0; n < blocks.length; n++) {
        var center = blockCentroid(blocks[n].coordinates);
        if (inRange(latlong, center[0], center[1])) {
          result.push(blocks[i]);
        }
      }
      */
      callback(blocks);
    });
  });
};

function blockCentroid(vs) {
  var x1 = vs[0][0];
  var y1 = vs[0][1];
  var x2 = vs[0][0];
  var y2 = vs[0][1];
  for (var i = 0; i < vs.length; i++) {
    x1 = (vs[i][0] < x1) ? vs[i][0] : x1;
    y1 = (vs[i][1] < y1) ? vs[i][1] : y1;
    x2 = (vs[i][1] > x2) ? vs[i][0] : x2;
    y2 = (vs[i][1] > y2) ? vs[i][1] : y2;
  }
  return [x1 + ((x2 - x1) / 2), y1 + ((y2 - y1) / 2)];
}

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

// Function to get data for each map rectangle
// Uses the location to put the data in the correct cell
// Takes in the top left coudinate of map, bottom left cordinate of the map. numBlocks: 2 entry array with number of rows and columns
// returns a 2D array with data in each cell
// Loops through all of the data, and puts each into the correct location in the array
// Uses the getArrayLoc
// Assumes the data has a corrdinates feild with the center point
function getMapData(allData, mapTopLeft, mapBottomRight, numBlocks){
  //Initiialize the block array. Let me know if there's a better way to do this.
  var blockArray = new Array(numBlocks[0]);
  for (i = 0; i < blockArray.length; i++) {
    blockArray[i] = new Array(numBlocks[1]);
  }

  for (dataNum = 0; dataNum < data.length; dataNum ++) {
    dataEntry = allData[dataNum];
    dataLoc = dataEntry.coordinates;
    // Use this function to get where the entry belongs in the block array
    arrayLoc = getArrayLoc(dataLoc, mapTopLeft, mapBottomRight, numBlocks);
    // Add the entry to the appropriate location in the block array
    blockArray[arrayLoc[0]][arrayLoc[1]] = dataEntry;
  }
  return blockArray;
}
  
// Gives the row and column that the data should belong to in the array
function getArrayLoc(dataLoc, mapTopLeft, mapBottomRight, numBlocks){
  arrayLoc = [0,0];
  //loop for rows and cols
  for(cord=0; cord < 2; cord++){
    // For each cordinate: calculate which block the location belongs to
    blockLen = (mapBottomRight[cord] - mapTopLeft[cord])/numBlocks[cord];
    arrayLoc[cord] = Math.round(dataLoc[cord]/blockLen);
  }
  return arrayLoc;
}