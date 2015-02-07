/*

a) consume APIs and receive
  - list of buildings that are eligible for X subsidy programs
  - raw lower-income data for United States

b) 

*/

<<<<<<< HEAD
function get_subsidized_buildings() {
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
    if (!res || res === null || res.status === 'failure') {
      // request went to server but didn't work
      console.log('error');
    } else {
      // request succeeded
      console.log(res);
    }
  });

  // request failed to even make it to server
  request.fail(function(data, msg) {
    console.log('couldn\'t hit them');
  });
}

function get_population() {
  
}

//Function to get data for each map rectangle
//Uses the location to put the data in the correct cell
// Takes in the top left coudinate of map, bottom left cordinate of the map. numBlocks: 2 entry array with number of rows and columns
// returns a 2D array with data in each cell
// Loops through all of the data, and puts each into the correct location in the array
// Uses the getArrayLoc
function getMapData(allData, mapTopLeft, mapBottomRight, numBlocks){
  blockArray = [[]];
  for (dataNum = 0; dataNum < data.length; dataNum ++){
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
    blockLen = (mapBottomRight[cord] - mapTopLeft[cord])/num[cord];
    arrayLoc[cord] = dataLoc[cord]/blockLen[cord];
  }
}
