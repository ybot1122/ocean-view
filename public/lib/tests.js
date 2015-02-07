// Tests the array location function
function getMapDataTEST(){
  data = [{coordinates:[0,0], id:0}, {coordinates:[5,7], id:1}, {coordinates:[9,9], id:2}];

  result = getMapData(data, [0,0], [10,10], [10, 10]);

  console.log("result", result);
}

function getArrayLoc_simple_TEST(){
  dataLoc = [1,3];

  result = getArrayLoc(dataLoc, [0,0], [10,10], [10, 10]);

  console.log(result);

  return (result[0] == 1) && (result[1] == 3);
}

function getArrayLoc_shifted_TEST(){
  dataLoc = [5,7];

  result = getArrayLoc(dataLoc, [3,4], [13,14], [10, 10]);

  return (result[0] == 5) && (result[1] == 7);
}
