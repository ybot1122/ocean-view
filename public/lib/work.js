/*

a) consume APIs and receive
  - list of buildings that are eligible for X subsidy programs
  - raw lower-income data for United States

b) 

*/

<script>

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


</script>
