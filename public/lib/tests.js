// Tests the array location function
//function getMapDataTEST(){
//  data = [{coordinates:[0,0], id:0}, {coordinates:[5,7], id:1}, {coordinates:[10,10], id:2}];
//
//    getMapData
//  
//}

function getArrayLoc_simple_TEST(){
  dataEntry = {coordinates:[1,3], id:0};

  result = getArrayLoc(dataEntry, [0,0], [10,10], 10, 10);

  return result == [1,3];
}


function getArrayLoc_shifted_TEST(){
  dataEntry = {coordinates:[1,3], id:0};

  result = getArrayLoc(dataEntry, [3,4], [13,14], 10, 10);

  return result == [4,7];
}
