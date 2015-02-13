$('document').ready(function(e) {

  // apply hover and click behavior to each td element
  $('#cities td').hover(function(e) {
    $(this).css('text-decoration', 'underline');
    $(this).css('cursor', 'pointer');
  }, function(e) {
    $(this).css('text-decoration', 'none');
    $(this).css('cursor', 'auto');
  });

  $('#cities td').one('click', function(e) {
    $(this).append('<img src="img/loading.gif" />');
    var $curr_cell = $(this);
    var coordinates = {
      'seattle': [-122.459696, 47.48172, -122.224433, 47.734145],
      'sanfrancisco': [-123.173825, 37.63983, -122.28178, 37.929824],
      'houston': [-95.909985, 29.523671, -95.014608, 30.110732],
      'chicago': [-87.940101, 41.644286, -87.523661, 42.023135],
      'durham': [-79.00765, 35.866352, -78.762172, 36.136929],
      'miami': [-80.31976, 25.709042, -80.132179, 25.855786],
      'newyorkcity': [-74.25909, 40.477399, -73.700272, 40.917577],
      'littlerock': [-92.521583, 34.625597, -92.156623, 34.821821]
    }
    var city = $(this).data('name');
    if (city && coordinates[city]) {
      getMapData(coordinates[city], function(r) {
        processData(r);
        postClick($curr_cell);
      });
    } else {
      postClick($curr_cell);
      $curr_cell.append('Error!');
    }
  });
});

function postClick(element) {
  element.find('img').remove();
  element.css('color', 'blue');
  element.css('cursor', 'auto');
  element.hover(function(e) {
    return;
  });
}

function processData(response) {
  var blocks = response;

  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];

    var coordinates = block.coordinates;
    if (coordinates.length == 1)
      coordinates = coordinates[0];

    var ncs = [];
    for (var j = 0; j < coordinates.length; j++) {
      var longitude = coordinates[j][0];
      var latitude = coordinates[j][1];
      ncs[ncs.length] = new nokia.maps.geo.Coordinate(latitude, longitude);
    };

    var color = colorize(Math.log(20000), Math.log(100000), Math.log(block.median_income));
    var polygon = new nokia.maps.map.Polygon(ncs, {
      pen: { strokeColor: "#000000" + lineVisibility, lineWidth: 1 },
      brush: { color: color }
    });
    polygon.block = block;

    // On mouse click we fire off the default event handler
    polygon.addListener("click", clickHandler);
    polygon.addListener("mouseenter", enterHandler);
    polygon.addListener("mouseleave", leaveHandler);
    map.objects.add(polygon);
  }

  for (var i = 0; i < blocks.length; i++) {
    for (var n = 0; n < blocks[i].buildings.length; n++) {
      var building = blocks[i].buildings[n];
      var longitude = building.coordinates[0];
      var latitude = building.coordinates[1];
      var coordinate = new nokia.maps.geo.Coordinate(latitude, longitude);

      var color = null;
      if (building.type == "Elderly")
        color = "#7ED321";
      else if (building.type == "Disabled")
        color = "#3BC1C3";
      else if (building.type == "Family")
        color = "#4A90E2";
      else
        color = "#000000";
      var marker = new nokia.maps.map.StandardMarker(coordinate, {
        brush: { color: color }
      });

      map.objects.add(marker);
    }
  }
}