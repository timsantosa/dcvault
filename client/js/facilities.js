const textValues = {
  DEFAULT: 'Through a variety of partnerships, DC Vault provides training at 5 facilities in the Washington, DC metropolitan area. Each facility has been uniquely outfitted with a wide array of specialized equipment provided by the club, allowing for training targeted to athletes of all skill levels.',

  NCS: '<p class="minor-heading">National <span class="red-text">Cathedral</span> Site (NCS)</p>\
<p class="content-text" style="font-weight: bold">Where</p>\
<p class="content-text smaller-text">Washington National Cathedral</p>\
<p class="content-text smaller-text">3501 Garfield St NW, Washington, DC 20007</p> \
<p class="content-text smaller-text">Facility - Steuart Field - Outdoor Track</p>\
<p class="content-text" style="font-weight: bold">What</p>\
<p class="content-text smaller-text">Outdoor training site, primarily used for Level-II thru Level-V training, private lessons and small group lessons.</p>',

  CUA: '<p class="minor-heading">Catholic <span class="red-text">University</span> Of America (CUA)</p>\
<p class="content-text" style="font-weight: bold">Where</p>\
<p class="content-text smaller-text">Catholic University of America</p>\
<p class="content-text smaller-text">4026 John McCormack Rd NE, Washington, DC</p> \
<p class="content-text smaller-text">Facility - DuFour Athletic Center - Fieldhouse / Outdoor Track</p>\
<p class="content-text" style="font-weight: bold">What</p>\
<p class="content-text smaller-text">Indoor and Outdoor training site, primarily used for Level-III and Level-IV training.</p>',

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

  BALT: '<p class="minor-heading">Loyola <span class="red-text">Blakefield</span> (BALT)</p>\
<p class="content-text" style="font-weight: bold">Where</p>\
<p class="content-text smaller-text">Loyola Blakefield</p>\
<p class="content-text smaller-text">500 Chestnut Ave, Towson, MD</p> \
<p class="content-text smaller-text">Facility - Knott Hall - Fieldhouse / Outdoor Track</p>\
<p class="content-text" style="font-weight: bold">What</p>\
<p class="content-text smaller-text">Indoor and Outdoor Training site, primarily used for Baltimore based Level-I and Level-II development training.</p>',

  DCV: '<p class="minor-heading">DC <span class="red-text">VAULT</span> (DCV)</p>\
<p class="content-text" style="font-weight: bold">Where</p>\
<p class="content-text smaller-text">DC Vault</p>\
<p class="content-text smaller-text">2200 East Capitol Street NE DC</p>\
<p class="content-text smaller-text">(NW corner of 22nd and East Capitol)</p> \
<p class="content-text" style="font-weight: bold">What</p>\
<p class="content-text smaller-text">Outdoor Pole Vault Training Center located on East Capitol street near the RFK Stadium. Used for training entry level through elite athletes, youth through adult, in group and private settings.</p>',
};

const locations = {
  NCS: {lat: 38.927475, lng: -77.068477},
  CUA: {lat: 38.942606, lng: -76.998025},
  PREP: {lat: 39.032617, lng: -77.108889},
  PG: {lat: 38.911269, lng: -76.866919},
  BALT: {lat: 39.403604, lng: -76.626360},
  DCV: {lat: 38.890134, lng: -76.976392},
  CENTER: {lat: 39.168826, lng: -76.807406}
}
var map, markers;

var current = 'DEFAULT';
var textBox = document.getElementById('facilities-text-box');
var facilities = Object.keys(textValues);
facilities.shift(); // Removes "default" as a clickable option

for (let i = 0; i < facilities.length; i++) {
  document.getElementById(facilities[i]).onclick = function () {

    for (var j = 0; j < facilities.length; j++) { // Reset bg color of all, reset bouncing of all
      document.getElementById(facilities[j]).className = 'facility-tab';
      markers[facilities[j]].setAnimation(null);
    }

    if (current === facilities[i]) {
      current = 'DEFAULT';
      textBox.innerHTML = textValues.DEFAULT;
      map.setCenter(locations.CENTER);
      map.setZoom(9);
    } else {
      current = facilities[i];
      textBox.innerHTML = textValues[facilities[i]];
      this.className = 'facility-tab facility-tab-selected';
      map.setCenter(locations[facilities[i]]);
      map.setZoom(11);
      markers[facilities[i]].setAnimation(google.maps.Animation.BOUNCE);
    }
  }
}

window.initMap = function () {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    center: locations.CENTER,
    scrollwheel: false,
    mapTypeControl: false,
    streetViewControl: false
  });
  markers = {
    NCS: new google.maps.Marker({position: locations.NCS, map: map}),
    CUA: new google.maps.Marker({position: locations.CUA, map: map}),
    PREP: new google.maps.Marker({position: locations.PREP, map: map}),
    PG: new google.maps.Marker({position: locations.PG, map: map}),
    BALT: new google.maps.Marker({position: locations.BALT, map: map}),
    DCV: new google.maps.Marker({position: locations.DCV, map: map})
  }
}