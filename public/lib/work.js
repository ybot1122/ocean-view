
// returns list of coordinates for buildings that qualify for a subsidy program
function get_subsidized_buildings(callback) {
  var subsidies = "IS_202_811_IND='y' OR IS_202_CAPITAL_ADVANCE_IND='y' OR IS_202_DIRECT_LOAN_IND='y' OR IS_221D3_IND='y'"
       + " OR IS_221D4_IND='y' OR IS_236_IND='y' OR IS_811_CAPITAL_ADVANCE_IND='y' OR IS_ACC_OLD_IND='y' OR IS_ACC_PERFORMANCE_BASED_IND='y'"
       + " OR IS_ACTIVE_DEC_CASE_IND='y' OR IS_AFS_REQUIRED_IND='y' OR IS_ALL_CONTRACT_PIPELINE_IND='y' OR IS_ALL_FINANCING_PIPELINE_IND='y'"
       + " OR IS_ASSISTED_LIVING_IND='y' OR IS_BMIR_IND='y' OR IS_BOARD_AND_CARE_IND='y' OR IS_CO_INSURED_IND='y' OR IS_FLEXIBLE_SUBSIDY_IND='y'"
       + " OR IS_GREEN_RETROFIT_IND='y' OR IS_HOSPITAL_IND='y' OR IS_HUD_HELD_IND='y' OR IS_HUD_OWNED_IND='y' OR IS_IN_DEFAULT_DELINQUENT_IND='y'"
       + " OR IS_INSURED_IND='y' OR IS_MIP_IND='y' OR IS_NON_INSURED_IND='y' OR IS_NURSING_HOME_IND='y'";

  var request = $.ajax({
    url: 'http://services.arcgis.com/VTyQ9soqVukalItT/ArcGIS/rest/services/MultiFamilyProperties/FeatureServer/0/query?where='
        + subsidies + '&f=geojson',
    type: 'GET',
    datatype: 'JSON'
  });

  request.done(function(res, msg) {
    var response = { status: 'failure', data: [] };
    if (!res || res === null || res.status === 'failure') {
      // request went to server but didn't work
      console.log('error');
    } else {
      // request succeeded
      response.status = 'success';
      var result = JSON.parse(res);
      for (var item in result.features) {
        var curr = {
          coordinates: result.features[item].geometry.coordinates
        };
        response.data.push(curr);
      }
      callback(response);
    }
  });

  // request failed to even make it to server
  request.fail(function(data, msg) {
    console.log('couldn\'t hit them');
    callback({status: 'failure'});
  });
}

// returns list of 'blocks' with each group 
function get_population(callback) {
  var request = $.ajax({
    url: 'http://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/LocationAffordabilityIndexData/FeatureServer/0/query?'
        + 'where=OBJECTID%251%3D0&outFields=households%2C+area_median_income&f=pgeojson',
    type: 'GET',
    datatype: 'JSON'
  });

  request.done(function(res, msg) {
    var response = { status: 'failure', data: [] };
    if (!res || res === null || res.status === 'failure') {
      // request went to server but didn't work
      console.log('error');
    } else {
      // request succeeded
      response.status = 'success';
      var result = JSON.parse(res);
      for (var item in result.features) {
        for (var ring in result.features[item].geometry.coordinates) {
          var curr = {
            coordinates: result.features[item].geometry.coordinates[ring],
            num_households: result.features[item].properties.households,
            median_income: result.features[item].properties.area_median_income,
          }
          response.data.push(curr);
        }
      }
      callback(response);
    }
  });

  // request failed to even make it to server
  request.fail(function(data, msg) {
    console.log('couldn\'t hit them');
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
function combineResponses() {
  get_subsidized_buildings(function(a) {
    var buildings = a;
    get_population(function(b) {
      var blocks = b;
      for (var build in buildings.data) {
        // ASSUMPTION: no two block polygons overlap each other
        var buildingLoc = buildings.data[build].coordinates;
        var i = 0;
        while (i < blocks.data.length && !pointInPoly(buildingLoc, blocks.data[i].coordinates)) {
          i++;
        }
        console.log(buildingLoc);
      }
    });
  });
}

/*
  checks if a point is contained within a polygon
  credit: https://github.com/substack
*/
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
}

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