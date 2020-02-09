/* eslint-disable no-multi-str */

var textValues = {
  DEFAULT: 'Through a variety of partnerships, DC Vault provides training at 7 facilities in the Washington, DC metropolitan area. Each facility has been uniquely outfitted with a wide array of specialized equipment provided by the club, allowing for training targeted to athletes of all skill levels.',


  PREP: '<p class="minor-heading">Georgetown <span class="red-text">Preparatory</span> School (PREP)</p>\
<p class="content-text" style="font-weight: bold">Where</p>\
<p class="content-text smaller-text">Georgetown Preparatory School</p>\
<p class="content-text smaller-text">10900 Rockville Pike, North Bethesda, MD</p> \
<p class="content-text smaller-text">Facility - Hanley Athletic Center - Indoor Track</p>\
<p class="content-text" style="font-weight: bold">What</p>\
<p class="content-text smaller-text">Indoor training site, primarily used for DC based Level-I and Level-II development training.</p>',

  PG: '<p class="minor-heading">Prince George\'s <span class="red-text">Sports and Learning</span> Center (PG)</p>\
<p class="content-text" style="font-weight: bold">Where</p>\
<p class="content-text smaller-text">Prince George\'s Sports and Learning Center</p>\
<p class="content-text smaller-text">8001 Sheriff Rd, Landover, MD</p> \
<p class="content-text smaller-text">Facility - PG Sportsplex - Indoor Field House</p>\
<p class="content-text" style="font-weight: bold">What</p>\
<p class="content-text smaller-text">Indoor training site, primarily used for Level-V training.</p>',

  BALT: '<p class="minor-heading">Baltimore (BALT)</p>\
<p class="content-text" style="font-weight: bold">Where</p>\
<p class="content-text smaller-text">We Travel to You!</p>\
<p class="content-text" style="font-weight: bold">What</p>\
<p class="content-text smaller-text">We offer private lessons in the Baltimore area to athletes who are unable to make it to one of our facilities. </p>\
<p class="content-text smaller-text">We will bring poles or other needed equipment to the training location of your choice. Contact us for details!</p>',

  DCV: '<p class="minor-heading">DC <span class="red-text">VAULT</span> (DCV)</p>\
<p class="content-text" style="font-weight: bold">Where</p>\
<p class="content-text smaller-text">DC Vault</p>\
<p class="content-text smaller-text">2200 East Capitol Street NE DC</p>\
<p class="content-text smaller-text">(NW corner of 22nd and East Capitol)</p> \
<p class="content-text" style="font-weight: bold">What</p>\
<p class="content-text smaller-text"> DC Vault\'s premier home training facility is designed to work with athletes of all levels, from 5 year old beginners to World Champions! The quarter million-dollar, state of the art facility was constructed in 2018 and is recognized as one of the best equipped pole vault facilities in the USA. \ <br>\
\ <br>\
The facility features 3 Mondo runways, a UCS 1800 series pole vault mat, a UCS 1900 series pole vault mat and an elite grade UCS 2100 series pole vault mat. The facility also boasts 4 customized Sorinex Strength Training Rigs, a wire camera for in-motion video analysis, a high ring swing training station, a swing-up-inversion trainer, climbing ropes and a customized storage facility which doubles as an office and event check-in booth. Additional equipment includes an extensive array of Sorinex and Rogue strength equipment, customized vault training implements, a complete UCS pole series ranging from a 10\'8" 90lb pole straight through to a 17\'1" 205lb pole, as well as custom youth poles ranging from 8\' 40lbs to 9\' 90lbs in size. \
\ <br>\ <br>\
Parking is available in Lot 3 and metro access is available across the street at the Stadium-Armory metro station. </p>',

}

var locations = {
  PREP: {lat: 39.032617, lng: -77.108889},
  PG: {lat: 38.911269, lng: -76.866919},
  BALT: {lat: 39.284213, lng: -76.610312},
  DCV: {lat: 38.890134, lng: -76.976392},
}

var tooltips = {
  PREP: 'Georgetown Preparatory School',
  PG: 'Prince George\'s County Sportsplex',
  BALT: 'Baltimore',
  DCV: 'DC VAULT',
}

// Begin calculate center

var boundingBox = {
  minLat: locations[Object.keys(locations)[0]].lat,
  maxLat: locations[Object.keys(locations)[0]].lat,
  minLng: locations[Object.keys(locations)[0]].lng,
  maxLng: locations[Object.keys(locations)[0]].lng
}

for (var key in locations) {
  if (locations[key].lat < boundingBox.minLat) {
    boundingBox.minLat = locations[key].lat
  } else if (locations[key].lat > boundingBox.maxLat) {
    boundingBox.maxLat = locations[key].lat
  }

  if (locations[key].lng < boundingBox.minLng) {
    boundingBox.minLng = locations[key].lng
  } else if (locations[key].lng > boundingBox.maxLng) {
    boundingBox.maxLng = locations[key].lng
  }
}

locations.CENTER = {lat: (boundingBox.maxLat + boundingBox.minLat) / 2, lng: (boundingBox.maxLng + boundingBox.minLng) / 2}

// End calculate center

var map, markers // eslint-disable-line

var current = 'DEFAULT'
var textBox = document.getElementById('facilities-text-box')
var facilities = Object.keys(textValues)
facilities.shift() // Removes "default" as a clickable option

facilities.map(function (facility, index) {
  document.getElementById(facility).onclick = function () {
    for (var j = 0; j < facilities.length; j++) { // Reset bg color of all
      document.getElementById(facilities[j]).className = 'facility-tab'
    }

    if (current === facility) {
      current = 'DEFAULT'
      textBox.innerHTML = textValues.DEFAULT
      map.setCenter(locations.CENTER)
      map.setZoom(8)
    } else {
      current = facility
      textBox.innerHTML = textValues[facility]
      this.className = 'facility-tab facility-tab-selected'
      map.setCenter(locations[facility])
      map.setZoom(14)
    }
  }
})

window.initMap = function () {
  map = new window.google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: locations.CENTER,
    scrollwheel: false,
    // mapTypeControl: false,
    streetViewControl: false,
    styles: window.mapStyle
  })

  markers = {
    PREP: new window.google.maps.Marker({position: locations.PREP, map: map, title: tooltips.PREP}),
    PG: new window.google.maps.Marker({position: locations.PG, map: map, title: tooltips.PG}),
    BALT: new window.google.maps.Marker({position: locations.BALT, map: map, title: tooltips.BALT}),
    DCV: new window.google.maps.Marker({position: locations.DCV, map: map, title: tooltips.DCV}),
  }
}
