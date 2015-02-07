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
function getMapData(data, mapTopLeft, mapBottomRight, numBlocks){
  for (dataNum = 0; dataNum < data.length; dataNum ++){
     
  }
}
  
// Gives the row and column that the data should belong to in the array
function getArrayLoc(dataEntry, mapTopLeft, mapBottomRight, numBlocks){
  arrayLoc = [0,0];
  //loop for rows and cols
  for(cord=0; cord < 2; cord++){
    blockLen = (mapBottomRight - mapTopLeft)/num
  }
  
}


</script>
