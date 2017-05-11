var map;
var markers = [];
var largeInfoWindow;
var locations = [
	{title: 'Academic Block',location: {lat: 30.516489, lng: 76.659687}},
	{title: 'Uco Bank',location: {lat: 30.516882, lng: 76.657332}},
	{title: 'Canteen',location: {lat: 30.517575, lng: 76.660599}},
	{title: 'Punjab National Bank Atm', location: {lat: 30.518227, lng: 76.659333}},
	{title: 'Cafe coffee day',location: {lat: 30.522949, lng: 76.664751}},
	{title: 'Vaya cafe',location: {lat: 30.523809, lng: 76.666210}},
	{title: 'Amrit diary',location: {lat: 30.525916, lng: 76.662712}},
	{title: 'Gill hotel', location: {lat: 30.510305, lng: 76.640847}},
];

function initMap() {
	var styles = [
	{
		featureType: 'water',
		stylers:[
		{ color: '#19a0d8'}
		]
	},
	{
		featureType: 'road.highway',
		elementType: 'geometry.stroke',
		stylers: [
			{ color: "#efe9e4"}
		]
	},
	{
		featureType: 'poi',
		elementType: 'labels.text.fill',
		stylers: [{ color: '#d59563'}]
	},
	{
		featureType: 'poi.park',
		elementType: 'labels.text.fill',
		stylers: [{ color: '263c3f'}]
	},
	{
		featureType: 'road',
		elementType: 'geometry',
		stylers: [{ color: '#6b9a76'}]
	},
	{
		featureType: 'road',
		elementType: 'geometry.stroke',
		stylers: [{ color: '#212a37'}]
	}
	];

	largeInfoWindow = new google.maps.InfoWindow();
	var defaultIcon = makeMarkerIcon('FF0000');
	var highlightedIcon = makeMarkerIcon('FF6347');
	map = new google.maps.Map(document.getElementById('map'),{
		center: {lat:30.516147, lng: 76.659429},
		styles: styles,
		mapTypeControl: false,
		zoom: 13,
	});

	for(i = 0; i < locations.length; i++){
		var position = locations[i].location;
		var title = locations[i].title;

		var marker = new google.maps.Marker({
			position: position,
			title: title,
			map:map,
			animation: google.maps.Animation.DROP,
			icon: defaultIcon,
			id: i
		});
		markers.push(marker);
		marker.addListener('click', function(){
			populateInfoWindow(this, largeInfoWindow);
		});
		marker.addListener('mouseover', function(){
			this.setIcon(highlightedIcon);
		});
		marker.addListener('mouseout', function(){
			this.setIcon(defaultIcon);
		});
	}
	showListings();
}

	function populateInfoWindow(marker, infowindow){
		//console.log( infowindow );
		if(  infowindow.marker != marker && infowindow.marker !== undefined){

		}
			infowindow.marker = marker;
			infowindow.setContent('');
			getDetails( infowindow , marker);
			infowindow.open(map,marker);
			infowindow.addListener('closeclick', function(){
				infowindow.marker = null;
			});			
	}	
	
	function showListings(){
		var bounds = new google.maps.LatLngBounds();
		for(var i = 0; i < markers.length; i++){
			//console.log( markers[ i ] );
			markers[i].setMap(map);
			bounds.extend(markers[i].position);
		}
	}

	function hideListings(){
		for(var i = 0; i < markers.length; i++){
			markers[i].setMap(null);
		}
	}
	function makeMarkerIcon(markerColor){
		var markerImage = new google.maps.MarkerImage(
			'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+markerColor+'|40|_|%E2%80%A2',
			new google.maps.Size(21,34),
			new google.maps.Point(0,0),
			new google.maps.Point(10,34),
			new google.maps.Size(21, 34));
		return markerImage;
	}

googleapiError = () => {
	viewModal.showError(true);
	viewModal.error("Error while loading map");
}

function getDetails( infowindow , marker){
	 content = '<div class="infoTitle"><h2>'+marker.title+'</h2></div>';
	//console.log( content );
	var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+
                    marker.title+'&format=json&callback=wikiCallback';
	// Wikipedia AJAX request goes here
	var wikiRequestTimeout = setTimeout(function(){
    	viewModel.showError(true);
        viewModel.error('Error loading data')
        largeInfoWindow.setContent('Error to load data')
    }, 7000);
	$.ajax({
		url: wikiUrl,
		dataType: 'jsonp',
		success: function display(response){
        	var articleList = response[1];
        	console.log("nsid" + articleList.length);
            for(var i = 0; i < articleList.length; i++){
            	article = articleList[i];
        		url='http://en.wikipedia.org/wiki/'+article;
        		//console.log("url" + url);
        		content += '<ul><li><a href="'+url+'">' + article + '</a></li></ul>';
        	};
        	if (articleList.length == 0){
        		url='http://en.wikipedia.org/wiki/'+marker.title;
        		content += '<ul><li><a href="'+url+'">' + marker.title + '</a></li></ul>';
        	}
        	clearTimeout(wikiRequestTimeout);
        	content += '<div class="infoPosition">'+marker.position.lat().toFixed(5) + ' ' + marker.position.lng().toFixed(5)+'</div>';
	    	infowindow.setContent(content);
       		showListings();
			viewModel.showError(false);
			viewModel.error('');
        }
    });
        //console.log(content);
		
    }

function showMarker(value){
		for(var i = 0; i < markers.length; i++){
			if(markers[i].title == value.title){
				populateInfoWindow(markers[i], largeInfoWindow);
				break;
			}
		}
}

//view model
var viewModel = {
	list: ko.observableArray([]),
	error: ko.observable(''),
	searchQuery: ko.observable(''),
	showError: ko.observable(false),
	init: function(query){
		for (var i in locations){
			viewModel.list.push(locations[i]);
		}
	},
	//search queries
	search: function(query){
		viewModel.list.removeAll();
		for(var i = 0; i < markers.length; i++){
			markers[i].setVisible(false);
		}
		for(var i = 0; i < locations.length; i++){
			if(locations[i].title.toLowerCase().indexOf(query.toLowerCase()) >=0){
				viewModel.list.push(locations[i]);
				var marker = locations[i].location;
				for(var j = 0; j < markers.length; j++){
					if(markers[j].position.lat().toFixed(5) == marker.lat.toFixed(5)&&
						markers[j].position.lng().toFixed(5) == marker.lng.toFixed(5)){
							markers[i].setVisible(true);
					}
				}	
			}
		}
	}
};
ko.applyBindings( viewModel );
viewModel.init();
viewModel.searchQuery.subscribe(viewModel.search);