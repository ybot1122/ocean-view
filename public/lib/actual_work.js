/*
  queries the multi-family housing database for all the buildings within a certain region
    minmax must be formatted as [min long, min lat, max long, max lat]
*/
function get_buildings(minmax, callback) {
  console.log('retrieving multi-family housing objects');
  var request = $.ajax({
    url: "http://services.arcgis.com/VTyQ9soqVukalItT/ArcGIS/rest/services/MultiFamilyProperties/FeatureServer/0/query?"
      + "where=IS_202_811_IND = 'y' OR IS_SEC8_IND = 'y' OR IS_RENT_SUPPLEMENT_IND = 'y'&outFields="
      + "LAT%2C+LON%2C+TOTAL_ASSISTED_UNIT_COUNT%2C+CLIENT_GROUP_TYPE&geometry={\"xmin\":" + minmax[1] + ",\"ymin\":"
      + minmax[0] + ",\"xmax\":" + minmax[3] + ",\"ymax\":" + minmax[2] + ",\"spatialReference\":"
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

function get_blocks(minmax, callback) {
  console.log('retrieving results from LOCATION AFFORDABILITY INDEX');
  var request = $.ajax({
    url: "http://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/LocationAffordabilityIndexData/FeatureServer/0/query?"
        + "where=OBJECTID >= 0&outFields=households%2C+area_median_income%2C+pct_renters%2C+blkgrp_median_income_renters&outSR="
        + "{\"wkid\":4326}&geometry={\"xmin\":" + minmax[1] + ",\"ymin\":" + minmax[0] + ",\"xmax\":" + minmax[3] + ",\"ymax\":"
        + minmax[2] + ",\"spatialReference\":{\"wkid\":4236}}&f=geojson",
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
      }
    }
    callback(cumulative);
  });
}