/*
var joPinPath = '/typo3conf/ext/jo_museo/Resources/Public/Images/joPin.svg';
var joPinPathActive = '/typo3conf/ext/jo_museo/Resources/Public/Images/joPin_3.svg';
var w_path = '/typo3conf/ext/jo_museo/Resources/Public/Images/joPin.svg';
var f_path = '/typo3conf/ext/jo_museo/Resources/Public/Images/joPin_3.svg';

if (typeof joMapSettings == 'undefined' || !joMapSettings) {
    joMapSettings = {};
}

joMapSettings['joNK_Münzfundkomplexe'] = {};
joMapSettings['joNK_Münzfundkomplexe']['pin'] = '/typo3conf/ext/jo_museo/Resources/Public/Images/coin.svg';
joMapSettings['joNK_Münzfundkomplexe']['hoverPin'] = '/typo3conf/ext/jo_museo/Resources/Public/Images/coin.svg';

joMapSettings['jodefault'] = {};
joMapSettings['jodefault']['pin'] = '/typo3conf/ext/jo_museo/Resources/Public/Images/joPin.svg';
joMapSettings['jodefault']['hoverPin'] = '/typo3conf/ext/jo_museo/Resources/Public/Images/joPin_3.svg';
*/


var clusters = [];
var map = null;

$(() => {
    initMapFuncIt();
    overlayBuild();
    collapseHelper();

    var $ajaxloader = $('#joAjaxloader');
});

function overlayBuild() {
    var $themap = $('#mapdiv, #ol4-mapdiv');
    var mobile = ($('#mobile-hidden').is(':visible')) ? false : true;
    if ($themap.length && !mobile) {
        var $map_overlay = $('<div class="map_overlay"><div class="map_overlay_text">Zum Benutzen der Karte bitte darauf klicken.</div></div>');
        $map_overlay.click(function () {
            $(this).fadeOut();
        });
        $themap.append($map_overlay);
    }
}

function collapseHelper() {
    var $themap = $('#mapdiv');
    if ($themap.length && $themap.parent().parent().parent().hasClass('inner_collapse_wrap')) {
        var $trigger = $themap.closest('.collapse');
        $trigger.on('shown.bs.collapse', function () {
            if (map != null) {
                map.updateSize();
            }
        });
    }
}

function initMapFuncIt() {
    setTimeout(function () {
        if (typeof geojson != 'undefined') {
            //initOnePointMap(geojson);
            //initOnePointMapThumb(geojson);
            if ($('#mapthumb').length) {
                initOnePointMapThumb(geojson);
            }
            if ($('#mapdiv').length) {
                initOnePointMap(geojson);
            }
        }
        if ($('#ol4-mapdiv').length) {
            initMap();
        }
        if (typeof geojsonRoute != 'undefined' && !$.isEmptyObject(geojsonRoute)) {
            joPinPath = '/typo3conf/ext/jo_museo/Resources/Public/Images/joPin_2.svg';
        }
    }, 100);
}

/* Map on Detail Site */
initOnePointMap = function (geojson) {
    var zoomed_map_layer = false;
    var newZoom = typeof zoomoff != 'undefined' && zoomoff == 1 ? null : 7;
    map = new ol.Map({
        target: 'mapdiv',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM({ crossOrigin: null })
            })
        ],
        view: new ol.View({
            center: [0, 0],
            zoom: 2,
            maxZoom: 18,
            // minZoom: newZoom
        })
    });

    var markerLayer = '';
    if (typeof geojson != 'undefined' && geojson && typeof showOnlyPolygone == 'undefined') {
        if ($.isArray(geojson)) {
            if (geojson.length) {
                markerLayer = getMarker(geojson);
                markerLayer.setZIndex(9999);
                map.addLayer(markerLayer);
            }
        } else {
            markerLayer = getMarker(geojson);

            markerLayer.setZIndex(9999);
            map.addLayer(markerLayer);
        }
    }

    var maxZoom = 12;
    if (typeof zoomlevelondetailmap != 'undefined') maxZoom = zoomlevelondetailmap;

    $('#mapdiv').data('map', map);
    if (typeof map_layer != 'undefined') {
        $.each(map_layer, function (key, val) {
            var tmp = new ol.layer.Vector({
                source: new ol.source.Vector({
                    url: val.i,
                    format: new ol.format.GeoJSON()
                }),
                style: function (feature) {
                    return new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#319FD3',
                            width: 3
                        }),
                    });
                },
                title: val.t
            });
            tmp.set('title', val.t);
            tmp.set('active', val.d);
            map.addLayer(tmp);
            if (val.d == 'active') {
                var interval = setInterval(function () {
                    var arr = tmp.getSource().getExtent();
                    if (!joInArray('Infinity', arr) && !joInArray('-Infinity', arr)) {
                        map.getView().fit(tmp.getSource().getExtent(), { size: map.getSize(), padding: [35, 35, 35, 35] });
                        clearInterval(interval);
                    }
                }, 100);
                zoomed_map_layer = true;
            } else {
                if (typeof markerLayer != 'undefined') {
                    map.getView().fit(markerLayer.getSource().getExtent(), { maxZoom: maxZoom, padding: [35, 35, 35, 35] });
                }
            }
        });
    } else {
        if (typeof markerLayer != 'undefined' && markerLayer != '') {
            map.getView().fit(markerLayer.getSource().getExtent(), { minZoom: maxZoom, padding: [35, 35, 35, 35] });
        }
    }

    if (typeof polygones != 'undefined') {
        var tmp = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(polygones, { featureProjection: 'EPSG:3857' })
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(10,45,64,1)',
                    width: 2
                }),
                fill: new ol.style.Stroke({
                    color: 'rgba(10,45,64,.3)'
                })
            })
        });
        map.addLayer(tmp);
        if (typeof markerLayer != 'undefined') {
            // markerLayer.setVisible(0);
        }

        if (!zoomed_map_layer) {
            map.getView().fit(tmp.getSource().getExtent(), map.getSize());

            if (typeof zoomlevelondetailmap != 'undefined' && polygones.type !== 'Polygon') {
                map.getView().setZoom(maxZoom);
            } else {
                map.getView().setZoom(map.getView().getZoom() - 1);
            }
        }
    }

    /* map click event */
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var loader = document.getElementById('popup-loader');
    var closer = document.getElementById('popup-closer');

    var info = new ol.Overlay({
        element: container,
        stopEvent: false
    });

    map.addOverlay(info);

    if (closer) {
        closer.onclick = function () {
            container.style.display = 'none';
            closer.blur();
            return false;
        };
    }

    mapClickEvent = function (evt) {
        var joLoader = $('#joAjaxloader');
        var foundLayer;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature, layer) {
                foundLayer = layer;
                return feature;
            }
        );

        if (feature) {
            var txt = feature.get('n');
            var title = feature.get('t');

            if (typeof txt != 'undefined' && (txt == 'Wallfahrtsort' || txt == 'verknüpfte Wallfahrtsorte' || txt == 'Fundort' || txt == 'Fund' || txt == 'Herkunft' || txt == 'Herstellung' || txt == 'verknüpfte Fundorte' || txt == 'abgebildeter Ort' || txt == 'erwähnter Ort')) {
                var coordinates = feature.getGeometry().getCoordinates();
                info.setPosition(coordinates);
                container.style.display = 'block';
                content.innerHTML = '<b>' + title + '</b><br>' + '(' + txt + ')';
            }
        } else {
            container.style.display = 'none';
        }
    }
    map.on('click', mapClickEvent);
}

/* Thumbnail Map on Detail Site */
initOnePointMapThumb = function (geojson) {
    map = new ol.Map({
        target: 'mapthumb',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM({ crossOrigin: null })
            }),
        ],
        view: new ol.View({
            center: [0, 0]
        }),
        interactions: [],
        controls: []
    });

    if (typeof geojson != 'undefined' && geojson) {
        if ($.isArray(geojson)) {
            if (geojson.length) {
                var markerLayer = getMarker(geojson);
                map.addLayer(markerLayer);
            }
        } else {
            var markerLayer = getMarker(geojson);
            map.addLayer(markerLayer);
        }
    }

    map.getView().fit(markerLayer.getSource().getExtent(), { maxZoom: 8, padding: [35, 35, 35, 35] });

    $('.map-effekt').click(function (event) {
        event.preventDefault();
        var href = $(this).attr('href');
        if (typeof href != 'undefined') {
            $('body,html').animate({
                scrollTop: $(href).offset().top
            }, 800);
        }
    });
}

String.prototype.trunc = String.prototype.trunc || function (n) {
    return this.length > n ? this.substr(0, n - 1) + '...' : this.substr(0);
};

var createTextStyle = function (text, fontcolor) {
    return new ol.style.Text({
        textAlign: 'left',
        textBaseline: 'middle',
        font: 'normal 12px Arial',
        text: text.trunc(20),
        fill: new ol.style.Fill({ color: fontcolor }),
        stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 }),
        offsetX: 20,
        offsetY: -20,
        placement: 'point'
    });
};

function getMarker(geojson) {
    return new ol.layer.Vector({
        source: new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(geojson, { featureProjection: 'EPSG:3857' })
        }),
        style: styleFunction
    });
}

var styleFunction = function (feature) {
    var newStyle = getIconStyle({ scale: 1, offsetY: '-33', pinpath: joPinPath });
    if (typeof feature.get('items') != 'undefined') {
        newStyle = typeof styles[feature.get('items')[0]] != 'undefined' ? styles[feature.get('items')[0]] : newStyle;
    }
    if (typeof feature.get('n') != 'undefined' && (feature.get('n') == 'Wallfahrtsort' || feature.get('n') == 'verknüpfte Wallfahrtsorte' || feature.get('n') == 'Fundort' || feature.get('n') == 'verknüpfte Fundorte')) {
        p_path = joPinPath;
        if (feature.get('n') == 'Wallfahrtsort' || feature.get('n') == 'verknüpfte Wallfahrtsorte') p_path = w_path;
        if (feature.get('n') == 'Fundort' || feature.get('n') == 'verknüpfte Fundorte') p_path = f_path;
        newStyle = getIconStyle({ scale: 1.2, pinpath: p_path });
    }
    return newStyle;
};

var getIconStyle = function (data) {
    var opacity = 1;
    text = '';
    if (data.feature) {
        if (data.t) {
            feat = data.feature;
            color = '#000';
            opacity = 1;
            font = 'normal 16px Arial';
        } else {
            feat = data.feature.get('features')[0];
            color = '#fff';
            opacity = feat.get('a') && feat.get('a') == true ? 1 : 0.5;
        }
        if (feat.get('n')) {
            text = new ol.style.Text({
                text: feat.get('n').toString(),
                font: font,
                offsetY: data.offsetY,
                fill: new ol.style.Fill({
                    color: color
                })
            });
        }

        if (feat.get('n') && feat.get('n') != '#') {
            //text = createTextStyle(data.feature.get('features')[0].get('n'), data.fontcolor);
        }
    }
    return new ol.style.Style({
        image: new ol.style.Icon(({
            scale: parseFloat(data.scale),
            opacity: parseFloat(opacity),
            anchor: [0.5, 1],
            src: data.pinpath
        })),
        text: text
    });
}

var getIconStyleCircle = function (data) {
    var opacity1 = 0.5;
    var opacity2 = 1;
    var color = document.getElementById('joMaps-container').getAttribute('data-dotcolor');

    if (data.color) {
        color = data.color;
    }

    if (typeof useIcons != 'undefined' && useIcons) {
        color = '154,21,21';
    }

    if (typeof data.feature.get('features')[0].get('c') != 'undefined' && data.feature.get('features')[0].get('c') == 'c2') {
        color = '239,126,25';
    }

    if (data.feature != '') {
        $.each(data.feature.get('features'), function (i, val) {
            if (false == val.get('a')) {
                opacity1 = 0.25;
                opacity2 = 0.5;
                return false;
            }
        });
    }

    return [
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: parseInt(data.radius),
                fill: new ol.style.Fill({
                    //color: 'rgba(242,148,1,' + opacity1 + ')'
                    color: 'rgba(' + color + ',' + opacity1 + ')'
                })
            })
        }),
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: parseInt(data.radius2),
                fill: new ol.style.Fill({
                    //color: 'rgba(242,148,1,' + opacity2 + ')'
                    color: 'rgba(' + color + ',' + opacity2 + ')'
                })
            }),
            text: new ol.style.Text({
                text: data.size.toString(),
                fill: new ol.style.Fill({
                    color: '#fff'
                })
            })
        })
    ]
}

var styles = {
    'manufacture': new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 1],
            src: joPinPath
        }))
    }),
    'authority': new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({
                color: 'magenta'
            }),
            stroke: new ol.style.Stroke({
                color: 'magenta'
            })
        })
    })
};

/* Main Map */
initMap = function () {
    if (typeof localgeojson != 'undefined' && localgeojson) geojson = localgeojson;

    if (typeof polygonsJson != 'undefined' || (typeof extbase_config != 'undefined' && extbase_config.mapconfig)) {

    } else {
        if (typeof geojson == 'undefined' || geojson.length == 0) {
            $('#ol4-mapdiv').addClass('nothing').append('<div class="map-nothing">Leider wurden keine Daten zu Ihrer Suchanfrage gefunden.</div>');
            return false;
        }
    }

    var color_stroke = '#319FD3';
    if (typeof TYPO3 != 'undefined' && typeof TYPO3.settings != 'undefined' && typeof TYPO3.settings.TS.geojsoncolor != 'undefined') {
        color_stroke = TYPO3.settings.TS.geojsoncolor;
    }

    var color_fill = '';
    if (typeof TYPO3 != 'undefined' && typeof TYPO3.settings != 'undefined' && typeof TYPO3.settings.TS.geojsoncolorfill != 'undefined') {
        color_fill = new ol.style.Stroke({
            color: TYPO3.settings.TS.geojsoncolorfill
        });
    }

    var style = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: color_stroke,
            width: 3
        }),
        fill: color_fill
    });

    var layers = [];

    if (typeof TYPO3 != 'undefined' && typeof TYPO3.settings != 'undefined' && typeof TYPO3.settings.TS.mapboxstyleUrl != 'undefined' && typeof TYPO3.settings.TS.mapboxaccessToken != 'undefined') {
        // if ('https://jln.gbv.de' == window.location.origin) {

        var mapboxLayer = new ol.layer.MapboxVector({
            styleUrl: TYPO3.settings.TS.mapboxstyleUrl,
            accessToken: TYPO3.settings.TS.mapboxaccessToken
        });
        mapboxLayer.setZIndex(-10);
        layers.push(mapboxLayer);

        var attribution = '<a href="http://mapbox.com/about/maps" class="mapbox-logo" target="_blank">Mapbox</a>' +
            '<div class="mapbox-attribution-container">' +
            '<a href="https://www.mapbox.com/about/maps/">© Mapbox | </a>' +
            '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap | </a>' +
            '<a href="https://www.mapbox.com/map-feedback/" target="_blank"><strong>Improve this map</strong></a>' +
            '</div>';

        $('#ol4-mapdiv').append($(attribution));
    } else {
        layers.push(
            new ol.layer.Tile({
                source: new ol.source.OSM({ crossOrigin: null })
            })
        );
    }

    if (typeof map_layer != 'undefined') {
        $.each(map_layer, function (key, val) {
            var tmp = new ol.layer.Vector({
                source: new ol.source.Vector({
                    url: val.i,
                    format: new ol.format.GeoJSON()
                }),
                style: function (feature) {
                    return style;
                },
                title: val.t
            });
            tmp.set('title', val.t);
            tmp.set('active', val.d);
            layers.push(tmp);
        });
    }

    var route;
    if (typeof geojsonRoute != 'undefined') {
        //if(geojsonRoute.coordinates && geojsonRoute.coordinates != '') {
        var route = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(geojsonRoute, { featureProjection: 'EPSG:3857' })
            }),
            style: function (feature) {
                return style;
            }
        });
        route.set('title', geojsonRoute.title);
        route.set('id', 'joGeojsonRoute');
        layers.push(route);
        //}
    }

    map = new ol.Map({
        target: 'ol4-mapdiv',
        layers: layers,
        view: new ol.View({
            center: ol.proj.fromLonLat([0, 0]),
            zoom: 9
        }),
    });

    if ($('#joMaps-container .map-search-container').length) {
        $('#joMaps-container').addClass('map-search-mark');
        map.getInteractions().forEach(x => x.setActive(false));
    }

    $('#ol4-mapdiv').data('map', map);

    getContent = function (url) {
        return $.ajax({
            'type': "GET",
            'url': url,
            'success': function (data) {
                return data;
            }
        });
    }


















    if (typeof iiif_url != 'undefined' && typeof iiifoverlaycoord != 'undefined') {
        /*
        var tmp = new ol.layer.Vector({
            source: new ol.source.Vector({
                // features: (new ol.format.GeoJSON()).readFeatures('{"type":"Polygon","coordinates":[[[-20.583333333333332,-38.266666666666666],[-20.583333333333332,38.95],[53.75,38.95],[53.75,-38.266666666666666],[-20.583333333333332,-38.266666666666666]]]}', {featureProjection: 'EPSG:3857'})
                features: (new ol.format.GeoJSON()).readFeatures('{"type":"Polygon","coordinates":[[[10.731574, 50.967992],[10.731574,50.931509],[10.676640, 50.931509],[10.676640,50.967992],[10.731574, 50.967992]]]}', {featureProjection: 'EPSG:3857'})
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: 'rgba(10,45,64,1)',
                  width: 2
                }),
                fill: new ol.style.Stroke({
                  color: 'rgba(10,45,64,.3)'
                })
            })
        });
        map.addLayer(tmp);
        */

        /*
        var ne_bound = ol.proj.fromLonLat([parseFloat(iiifoverlaycoord[0][0]), parseFloat(iiifoverlaycoord[0][1])]);
        var se_bound = ol.proj.fromLonLat([parseFloat(iiifoverlaycoord[1][0]), parseFloat(iiifoverlaycoord[1][1])]);
        var extent = se_bound.concat(ne_bound);
        */

        // var extent = ol.extent.boundingExtent(iiifoverlaycoord);
        // var destLoc = [6.18581,50.88093];
        // var currentLoc = [-122.29925626,37.47836852];
        /*
        var ne_bound = ol.proj.fromLonLat([10.731574, 50.967992]);
        var se_bound = ol.proj.fromLonLat([10.676640, 50.931509]);
        var extent = se_bound.concat(ne_bound);
        */


        //var destLoc = [10.731574, 50.967992];
        //var currentLoc = [10.676640, 50.931509];

        var extent = ol.extent.boundingExtent(iiifoverlaycoord);
        extent = ol.proj.transformExtent(extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'));



        // extent = tmp.getSource().getExtent();

        var projection = new ol.proj.Projection({
            code: 'xkcd-image',
            units: 'pixels',
            extent: extent,
        });

        var imgSource = new ol.source.ImageStatic({
            // attributions: '© <a href="https://xkcd.com/license.html">xkcd</a>',
            url: iiif_url,
            projection: projection,
            imageExtent: extent
        });

        var imgLayer = new ol.layer.Image({
            source: imgSource,
            extent: extent
        });

        // imgLayer.setZIndex(9999999999999999);

        // imgLayer.setZIndex(200);

        map.addLayer(imgLayer);

        /*
        map.setView(new ol.View({
                //resolutions: imgSource.getTileGrid().getResolutions(),
                // projection: projection,
                extent: extent,
                //projection: 'EPSG:4326',
            })
        );
        */

        setTimeout(function () {
            map.getView().fit(extent, { padding: [80, 80, 80, 80] });
        }, 500);
    }


    /*
       // var iiif_url = 'https://dhb.thulb.uni-jena.de/api/iiif/image/v2/ufb_derivate_00016276%2FSPK-40-02-A-02_00002.tif/info.json';
    
        var ne_bound = ol.proj.fromLonLat([-20.583333333333332, 38.95]);
        var se_bound = ol.proj.fromLonLat([53.75, -38.266666666666666]);
        var extent = se_bound.concat(ne_bound);
    
        extent = tmp.getSource().getExtent();
    
        fetch(iiif_url).then(function (response) {
            response.json().then(function (imageInfo) {
                layer = new ol.layer.Tile();
    
                var options = new ol.format.IIIFInfo(imageInfo).getTileSourceOptions();
                if (options === undefined || options.version === undefined) {
                    console.log('Data seems to be no valid IIIF image information.');
                    return;
                }
    
                var config = {
                    name: 'karte',
                    map:{
                        lat_top: 51.449620948774374, // Latitude of North bound of map
                        lon_left: -0.11981964111328126, // Longitude of West bound of map
                        lat_bottom: 51.42286816395111, // Latitude of South bound of map
                        lon_right: -0.07690429687500001, // Longitude of East bound of map
                    }
                }   
    
                var config = {
                    name: 'karte',
                    map:{
                        lat_top: -20.583333333333332, // Latitude of North bound of map
                        lon_left: 38.95, // Longitude of West bound of map
                        lat_bottom: 53.75, // Latitude of South bound of map
                        lon_right: -38.266666666666666, // Longitude of East bound of map
                    }
                }
    
                    // extent = tmp.getSource().getExtent();
               //options.extent = extent;
    
               // options.zDirection = -1;
              // var cc = new ol.proj.fromLonLat([0.01, -0.01]);
               
                const iiifTileSource = new ol.source.IIIF(options);
                layer.setSource(iiifTileSource);
    
    
                console.log(iiifTileSource.getTileGrid().getExtent());
               
                map.setView( new ol.View({
                        resolutions: iiifTileSource.getTileGrid().getResolutions(),
                        extent: iiifTileSource.getTileGrid().getExtent(),
                        projection: 'EPSG:4326',
                        //constrainOnlyCenter: true,
                        // center: ol.extent.getTopLeft(extent)
                    })
                );
                
                map.addLayer(layer);
                //map.getView().fit(iiifTileSource.getTileGrid().getExtent());
    
                map.getView().fit(new ol.geom.Point(ne_bound));
                
    
    
            }).catch((e) => {
                console.log(e);
                console.log('error2');
            });
        }).catch((e) => {
            console.log(e);
            console.log('error');
        });
    
        var layer1 = new ol.layer.Vector({
         source: new ol.source.Vector({
             features: [
                 new ol.Feature({
                     geometry: new ol.geom.Point(ne_bound)
                 })
             ]
         })
     });
    
    */






    var boxvector;
    if (typeof extbase_config != 'undefined' && extbase_config.mapconfig && extbase_config.mapconfig.poslat1) {
        var boxCoords = [];
        boxCoords.push(ol.proj.transform([parseFloat(extbase_config.mapconfig.poslon1), parseFloat(extbase_config.mapconfig.poslat1)], 'EPSG:4326', 'EPSG:3857'));
        boxCoords.push(ol.proj.transform([parseFloat(extbase_config.mapconfig.poslon2), parseFloat(extbase_config.mapconfig.poslat1)], 'EPSG:4326', 'EPSG:3857'));
        boxCoords.push(ol.proj.transform([parseFloat(extbase_config.mapconfig.poslon2), parseFloat(extbase_config.mapconfig.poslat2)], 'EPSG:4326', 'EPSG:3857'));
        boxCoords.push(ol.proj.transform([parseFloat(extbase_config.mapconfig.poslon1), parseFloat(extbase_config.mapconfig.poslat2)], 'EPSG:4326', 'EPSG:3857'));

        var boxfeature = new ol.Feature({
            geometry: new ol.geom.Polygon([boxCoords])
        });

        var boxsource = new ol.source.Vector({
            features: [boxfeature]
        });

        var boxvector = new ol.layer.Vector({
            source: boxsource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(10,45,64,1)',
                    width: 2
                }),
                fill: new ol.style.Stroke({
                    color: 'rgba(10,45,64,.3)'
                })
            })
        });
        map.addLayer(boxvector);


        /* Create Boundingbox map closer */
        var b_closer = document.getElementById('bound-closer');
        var o_b_closer = new ol.Overlay({
            element: b_closer,
            stopEvent: false
        });
        map.addOverlay(o_b_closer);

        b_closer.onclick = function () {
            if (extbase_config.mapconfig.del) {
                if (extbase_config.pagetype > 0) {
                    $('#joAjaxloader').show();
                    $.get(extbase_config.mapconfig.del).done(function (data) {
                        $('.joPageTimeline').closest('.frame').html($(data)).promise().done(function () {
                            if (typeof initMapFuncIt == 'function') initMapFuncIt();
                            if (typeof fc_drp_init == 'function') fc_drp_init();
                            if (typeof initSlider == 'function') initSlider();
                        });
                        $('#joAjaxloader').hide();
                    });
                } else {
                    window.location.href = extbase_config.mapconfig.del;
                }
            }
            return false;
        };

        b_closer.style.display = 'block';
        o_b_closer.setPosition(boxCoords[1]);
    }

    /* Cluster + Cluster Events */
    // var clusters = [];

    var altPin = false;
    if (typeof alternativePin != 'undefined') {
        altPin = true;
    }

    if (typeof geojson != 'undefined') {
        var distance = typeof geojsonRoute !== 'undefined' && geojsonRoute.length != 0 ? 0 : 40;
        $.each(geojson, function (i, val) {
            var title = i, id = 'jo' + i.replace(/ /g, '_');

            var clusterSource = new ol.source.Cluster({
                distance: distance,
                source: new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(val, { featureProjection: 'EPSG:3857' })
                })
            });

            if (altPin) {
                tmp_cluster = new ol.layer.AnimatedCluster({
                    name: 'AnimatedCluster',
                    source: clusterSource,
                    animationDuration: 700,

                    style: function (feature, resolution) {
                        var styleCache = {};
                        var size = feature.get('features').length;
                        var tmpPinPath = getPinPathById(id, false);
                        var style = styleCache[size];
                        if (!style) {
                            if (size === 1) {
                                if (typeof useIcons != 'undefined' && useIcons) {
                                    var adding = feature.get('features')[0].get('c');
                                    var tmpPinPath = getPinPathById(id + adding, false);
                                    style = getIconStyle({ scale: 2, feature: feature, offsetY: '-33', pinpath: tmpPinPath, fontcolor: '#aa3300' });
                                } else {
                                    style = getIconStyleCircle({ radius: 15, radius2: 10, size: 1, feature: feature });
                                }
                            } else {
                                style = getIconStyleCircle({ radius: 15, radius2: 10, size: size, feature: feature });
                            }
                            styleCache[size] = style;
                        }
                        return style;
                    }
                });
            } else {
                tmp_cluster = new ol.layer.Vector({
                    source: clusterSource,
                    style: function (feature, resolution) {
                        var styleCache = {};
                        var size = feature.get('features').length;
                        var tmpPinPath = getPinPathById(id, false);
                        var style = styleCache[size];
                        if (!style) {
                            if (size === 1) {
                                if (typeof useIcons != 'undefined' && useIcons) {
                                    var adding = feature.get('features')[0].get('c');
                                    var tmpPinPath = getPinPathById(id + adding, false);
                                    style = getIconStyle({ scale: 2, feature: feature, offsetY: '-33', pinpath: tmpPinPath, fontcolor: '#aa3300' });

                                } else {
                                    style = getIconStyleCircle({ radius: 15, radius2: 10, size: 1, feature: feature });
                                }

                                if (typeof feature.get('features')[0].getId() != 'undefined' && feature.get('features')[0].getId() == '41f0fc7d1cf12cadf3055d90debe23f0_12') {
                                    var tmpPinPath = '/typo3conf/ext/jo_template/Resources/Public/Images/EvaSchiffmann/maps_pin.svg';
                                    style = getIconStyle({ scale: 2, feature: feature, offsetY: '-33', pinpath: tmpPinPath, fontcolor: '#aa3300' });
                                }
                            } else {
                                style = getIconStyleCircle({ radius: 15, radius2: 10, size: size, feature: feature });
                            }
                            styleCache[size] = style;
                        }
                        return style;
                    }
                });
            }

            tmp_cluster.set('title', title);
            tmp_cluster.set('id', id);
            tmp_cluster.setZIndex(9999999999);

            map.addLayer(tmp_cluster);
            clusters.push(tmp_cluster);
        });

        var container = document.getElementById('popup');
        var content = document.getElementById('popup-content');
        var loader = document.getElementById('popup-loader');
        var closer = document.getElementById('popup-closer');
        var info = new ol.Overlay({
            element: container,
            stopEvent: false
        });

        map.addOverlay(info);

        if (closer) {
            closer.onclick = function () {
                container.style.display = 'none';
                closer.blur();
                return false;
            };
        }

        var overContainer = document.getElementById('joMaps-container');
        var infocontainer = document.getElementById('joInfo-container');
        var infocontent = document.getElementById('joInfo-content');
        var infocloser = document.getElementById('joInfo-content-closer');
        var infoloader = document.getElementById('joAjaxloader');

        if (infocloser) {
            infocloser.onclick = function () {
                overContainer.classList.remove('show');
                infocloser.blur();
                return false;
            };
        }

        var pauseMapClick = false;
        /* prevent map click event on carousel next and prev */
        $('body').on('mouseenter', '#popup .carousel-control-next, #popup .carousel-control-prev, #popup .joIndicator-item', function (e) {
            e.stopPropagation();
            pauseMapClick = true;
        });

        $('body').on('mouseleave', '#popup .carousel-control-next, #popup .carousel-control-prev, #popup .joIndicator-item', function (e) {
            e.stopPropagation();
            pauseMapClick = false;
        });

        mapClickEvent = function (evt) {
            var joLoader = $('#joAjaxloader');
            if (!pauseMapClick) {
                var mobile = ($('#mobile-hidden').is(':visible')) ? false : true;
                var foundLayer;
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature, layer) {
                        foundLayer = layer;
                        return feature;
                    }
                );
                if (feature) {
                    if (typeof foundLayer != 'undefined' && foundLayer.get('title') && foundLayer.get('title') == 'p') {
                        var coordinates = foundLayer.getSource().getExtent();
                        if (mobile && infocontent) {
                            overContainer.classList.add('show');
                        } else {
                            if (!$('.map-slide-box').length) {
                                info.setPosition([coordinates[2], coordinates[3] - ((coordinates[3] - coordinates[1]) / 2)]);
                                container.style.display = 'block';
                            }
                            joLoader.show();
                        }
                        if (mobile && infocontent) {
                            infoloader.style.display = 'block';
                            infocontent.innerHTML = '';
                        } else {
                            loader.style.display = 'block';
                            content.innerHTML = '';
                        }
                        var url = foundLayer.get('l');
                        var id = foundLayer.get('id');
                        if (typeof useIcons != 'undefined' && useIcons) {
                            var link = '';
                            if (url && url != '') link = '<a class="btn btn-popup" href="' + url + '">Diesen Ort auswählen</a>';
                            var pre = curFeature.get('c');
                            if (pre && pre == 'c2') pre = 'Fundort: ';
                            else pre = '';
                            var div = '<div class="popup-innerdiv">' + pre + foundLayer.get('t') + '</div>' + link;
                            if (mobile && infocontent) {
                                infoloader.style.display = 'none';
                                infocontent.innerHTML = div;
                            } else {
                                loader.style.display = 'none';
                                content.innerHTML = div;
                            }
                        } else {
                            $('.joListNotableContainer .list_notable.active').removeClass('active');
                            var $con = $('.map-slide-box');
                            $item = $con.find('.item-' + id);
                            if (!mobile && $item.length) {
                                $con.find('.map-slide-item.active').not($item).removeClass('active');
                                if ($item.hasClass('active')) {
                                    $con.removeClass('active');
                                    $item.removeClass('active');
                                } else {
                                    $con.addClass('active');
                                    $item.addClass('active');
                                }
                                joLoader.hide();
                            } else {
                                $con.removeClass('active');
                                if (url != '') {
                                    $.get(url).done(function (data) {
                                        if (mobile && infocontent) {
                                            infoloader.style.display = 'none';
                                            infocontent.innerHTML = data;
                                            var car = $(infocontent).find('.carousel');
                                            if (car.length) {
                                                car.carousel();
                                            }
                                        } else {
                                            loader.style.display = 'none';
                                            joLoader.hide();
                                            $con.find('.map-slide-item.active').removeClass('active');
                                            var div = '<div class="map-loaded map-slide-item item-' + id + ' active" data-id="' + id + '"><button type="button" class="close" aria-label="Close"><span aria-hidden="true">×</span></button>';
                                            div += data;
                                            div += '</div>';
                                            $con.append(div);
                                            $con.addClass('active');
                                        }
                                    });
                                } else {
                                    joLoader.hide();
                                }
                            }
                        }
                        return 0;
                    }
                    var id = feature.getId();

                    if (typeof id === 'undefined') {
                        var coordinates = feature.getGeometry().getCoordinates();
                        if (mobile && infocontent) {
                            overContainer.classList.add('show');
                        } else {
                            if (!$('.map-slide-box').length) {
                                info.setPosition(coordinates);
                            }
                            container.style.display = 'block';
                            joLoader.show();
                        }
                        var features = feature.get('features');
                        if (typeof features != 'undefined' && features.length === 1) {
                            if (mobile && infocontent) {
                                infoloader.style.display = 'block';
                                infocontent.innerHTML = '';
                            } else {
                                loader.style.display = 'block';
                                content.innerHTML = '';
                            }
                            var curFeature = features[0];
                            var url = curFeature.get('l');
                            var id = curFeature.get('i');
                            if (typeof useIcons != 'undefined' && useIcons) {
                                var link = '';
                                if (url && url != '') link = '<a class="btn btn-popup" href="' + url + '">Diesen Ort auswählen</a>';

                                var p_text = curFeature.get('c');
                                if (p_text && p_text == 'c2') p_text = 'Fundort: ';
                                else p_text = '';

                                var p_text = '';
                                if (curFeature.get('details')) {
                                    $.each(curFeature.get('details'), function (i, v) {
                                        p_text += '<p>' + v + '</p>';
                                    });
                                }

                                var div = '<div class="popup-innerdiv"><h4>' + curFeature.get('t') + '</h4>' + p_text + '</div>' + link;
                                if (mobile && infocontent) {
                                    infoloader.style.display = 'none';
                                    infocontent.innerHTML = div;
                                } else {
                                    loader.style.display = 'none';
                                    content.innerHTML = div;
                                }
                                joLoader.hide();
                            } else {
                                var $con = $('.map-slide-box');
                                $item = $con.find('.item-' + id);

                                if (!mobile && $item.length) {
                                    $con.find('.map-slide-item.active').not($item).removeClass('active');
                                    if ($item.hasClass('active')) {
                                        $con.removeClass('active');
                                        $item.removeClass('active');
                                    } else {
                                        $con.addClass('active');
                                        $item.addClass('active');
                                    }
                                    joLoader.hide();
                                } else {
                                    $con.removeClass('active');

                                    if (url != '') {
                                        $.get(url).done(function (data) {
                                            if (mobile && infocontent) {
                                                infoloader.style.display = 'none';
                                                infocontent.innerHTML = data;
                                                var car = $(infocontent).find('.carousel');
                                                if (car.length) {
                                                    car.carousel();
                                                }
                                                joLoader.hide();
                                            } else {
                                                loader.style.display = 'none';
                                                joLoader.hide();
                                                var div = '<div class="map-loaded map-slide-item item-' + id + ' active" data-id="' + id + '"><button type="button" class="close" aria-label="Close"><span aria-hidden="true">×</span></button>';
                                                div += data;
                                                div += '</div>';
                                                if ($con.length) {
                                                    $con.find('.map-slide-item.active').removeClass('active');
                                                    $con.append(div);
                                                    $con.addClass('active');
                                                } else {
                                                    content.innerHTML = div;
                                                }
                                            }
                                        });
                                    } else {
                                        joLoader.hide();

                                        var id = curFeature.get('i');
                                        var title = curFeature.get('n');
                                        var desc = curFeature.get('d');
                                        var web = '';

                                        if (typeof curFeature.get('w') != 'undefined') {
                                            web = '<p><a href="' + curFeature.get('w') + '" target="_blank">zur Webseite</a></p>';
                                        }

                                        var coordinates = feature.getGeometry().getCoordinates();
                                        info.setPosition(coordinates);
                                        loader.style.display = 'none';
                                        content.innerHTML = '<div class="p-3"><span style="font-size: 16px">' + id + '</span></br><strong>' + title + '</strong><p>' + desc + '</p>' + web + '</div>';
                                    }
                                }

                            }
                        } else if (typeof features != 'undefined') {
                            if (mobile && infocontent) {
                                overContainer.classList.remove('show');
                            } else {
                                container.style.display = 'none';
                                joLoader.hide();
                            }
                            var zoom = map.getView().getZoom() + 1;
                            map.getView().fit(feature.get('features')[0].getGeometry().getExtent(), { duration: 1000, maxZoom: zoom });
                        } else {
                            if (mobile && infocontent) {
                                overContainer.classList.remove('show');
                            } else {
                                container.style.display = 'none';
                                joLoader.hide();
                            }
                        }
                    } else {
                        if (mobile && infocontent) {
                            overContainer.classList.remove('show');
                        } else {
                            container.style.display = 'none';
                            joLoader.hide();
                        }
                    }
                } else {
                    if (mobile && infocontent) {
                        overContainer.classList.remove('show');
                    } else {
                        container.style.display = 'none';
                        joLoader.hide();
                    }
                }
            }
        }

        if (altPin) {
            function clStyle(feature, resolution) {
                var id = 'dd';

                var styleCache = {};

                var style = '';
                if (typeof feature.get('features') != 'undefined') {
                    var size = feature.get('features').length;
                    var tmpPinPath = getPinPathById(id, false);
                    style = styleCache[size];
                    if (!style) {
                        if (size === 1) {
                            if (typeof useIcons != 'undefined' && useIcons) {
                                var adding = feature.get('features')[0].get('c');
                                var tmpPinPath = getPinPathById(id + adding, false);
                                style = getIconStyle({ scale: 2, feature: feature, offsetY: '-33', pinpath: tmpPinPath, fontcolor: '#aa3300' });
                            } else {
                                style = getIconStyleCircle({ radius: 15, radius2: 10, size: 1, feature: feature, color: '0,128,0' });
                            }
                        } else {
                            style = getIconStyleCircle({ radius: 15, radius2: 10, size: size, feature: feature });
                        }
                        styleCache[size] = style;
                    }
                }
                return style;
            }

            function clStyle2(feature, resolution) {
                var zoom = map.getView().getZoom();

                if (zoom >= 20) {
                    var id = 'dd';

                    var styleCache = {};

                    var style = '';
                    if (typeof feature.get('features') != 'undefined') {
                        var size = feature.get('features').length;
                        var tmpPinPath = getPinPathById(id, false);
                        style = styleCache[size];
                        if (!style) {
                            if (size === 1) {
                                if (typeof useIcons != 'undefined' && useIcons) {
                                    var adding = feature.get('features')[0].get('c');
                                    var tmpPinPath = getPinPathById(id + adding, false);
                                    style = getIconStyle({ scale: 2, feature: feature, offsetY: '-33', pinpath: tmpPinPath, fontcolor: '#aa3300' });
                                } else {
                                    style = getIconStyleCircle({ radius: 15, radius2: 10, size: 1, feature: feature, color: '0,128,0' });
                                }
                            } else {
                                style = getIconStyleCircle({ radius: 15, radius2: 10, size: size, feature: feature });
                            }
                            styleCache[size] = style;
                        }
                    }
                    return style;
                } else {
                    map.getView().fit(feature.get('features')[0].getGeometry().getExtent(), { duration: 1000, maxZoom: zoom + 1 });
                    return [];
                }
            }

            var selectCluster = new ol.interaction.SelectCluster({
                // Point radius: to calculate distance between the features
                pointRadius: 20,
                // circleMaxObjects: 40,
                // spiral: false,
                // autoClose: false,
                animate: true,
                // Feature style when it springs apart
                featureStyle: clStyle2,
                // selectCluster: false,  // disable cluster selection
                // Style to draw cluster when selected
                style: clStyle
            });

            map.addInteraction(selectCluster);

            // On selected => get feature in cluster and show info
            selectCluster.getFeatures().on(['add'], function (e) {
                var features = e.element.get('features');
                if (typeof features != 'undefined' && features.length == 1) {
                    var joLoader = $('#joAjaxloader');
                    var mobile = ($('#mobile-hidden').is(':visible')) ? false : true;

                    var curFeature = features[0];
                    var url = curFeature.get('l');
                    var id = curFeature.get('i');
                    if (typeof useIcons != 'undefined' && useIcons) {
                        var link = '';
                        if (url && url != '') link = '<a class="btn btn-popup" href="' + url + '">Diesen Ort auswählen</a>';

                        var p_text = curFeature.get('c');
                        if (p_text && p_text == 'c2') p_text = 'Fundort: ';
                        else p_text = '';

                        var p_text = '';
                        if (curFeature.get('details')) {
                            $.each(curFeature.get('details'), function (i, v) {
                                p_text += '<p>' + v + '</p>';
                            });
                        }

                        var div = '<div class="popup-innerdiv"><h4>' + curFeature.get('t') + '</h4>' + p_text + '</div>' + link;
                        if (mobile && infocontent) {
                            infoloader.style.display = 'none';
                            infocontent.innerHTML = div;
                        } else {
                            loader.style.display = 'none';
                            content.innerHTML = div;
                        }
                        joLoader.hide();
                    } else {
                        var $con = $('.map-slide-box');
                        $item = $con.find('.item-' + id);

                        if (!mobile && $item.length) {
                            $con.find('.map-slide-item.active').not($item).removeClass('active');
                            if ($item.hasClass('active')) {
                                $con.removeClass('active');
                                $item.removeClass('active');
                            } else {
                                $con.addClass('active');
                                $item.addClass('active');
                            }
                            joLoader.hide();
                        } else {
                            $con.removeClass('active');

                            if (url != '') {
                                $.get(url).done(function (data) {
                                    if (mobile && infocontent) {
                                        infoloader.style.display = 'none';
                                        infocontent.innerHTML = data;
                                        var car = $(infocontent).find('.carousel');
                                        if (car.length) {
                                            car.carousel();
                                        }
                                        joLoader.hide();
                                    } else {
                                        loader.style.display = 'none';
                                        joLoader.hide();
                                        $con.find('.map-slide-item.active').removeClass('active');
                                        var div = '<div class="map-loaded map-slide-item item-' + id + ' active" data-id="' + id + '"><button type="button" class="close" aria-label="Close"><span aria-hidden="true">×</span></button>';
                                        div += data;
                                        div += '</div>';
                                        $con.append(div);
                                        $con.addClass('active');
                                    }
                                });
                            } else {
                                joLoader.hide();
                            }
                        }

                    }
                } else {

                }
            });

            selectCluster.getFeatures().on(['remove'], function (e) {
                selectCluster.clear();
                $('.map-slide-item.active').removeClass('active').parent().removeClass('active');
            });

            $('.map-slide-box').on('click', '.map-slide-item .close', function () {
                selectCluster.clear();
            });
        } else {
            if (!$('#joMaps-container').hasClass('map-search-mark')) {
                map.on('click', mapClickEvent);
            }
        }
    }

    layers = map.getLayers().getArray();

    var myposLayer = null;
    if (typeof extbase_config != 'undefined' && extbase_config.mapconfig && extbase_config.mapconfig.myposlat && extbase_config.mapconfig.myposlon) {
        var view = map.getView();
        var projection = view.getProjection();
        var resolutionAtEquator = view.getResolution();
        // var center = map.getView().getCenter();
        var center = [extbase_config.mapconfig.myposlon, extbase_config.mapconfig.myposlat];
        // var point = new ol.geom.Point(ol.proj.fromLonLat(place));
        center = ol.proj.fromLonLat(center);

        //var pointResolution = projection.getPointResolution(resolutionAtEquator, center);
        var pointResolution = ol.proj.getPointResolution(projection, resolutionAtEquator, center);
        var resolutionFactor = resolutionAtEquator / pointResolution;
        var radius = ((extbase_config.mapconfig.distance * 1000) / ol.proj.Units.METERS_PER_UNIT.m) * resolutionFactor;

        var circle = new ol.geom.Circle(center, radius);

        var circleFeature = new ol.Feature(circle);

        // Source and vector layer
        var vectorSource = new ol.source.Vector();
        vectorSource.addFeature(circleFeature);
        myposLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(10,45,64,1)',
                    width: 2
                }),
                fill: new ol.style.Stroke({
                    color: 'rgba(10,45,64,.3)'
                })
            })
        });

        map.addLayer(myposLayer);

        map.getView().fit(myposLayer.getSource().getExtent(), { padding: [80, 80, 80, 80] });


        var point = new ol.geom.Point(center);

        function createStyle(src) {
            return new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 0.96],
                    src: src
                }),
            });
        }

        var iconFeature = new ol.Feature(point);
        iconFeature.set('style', createStyle(joPinPath));

        var pointLayer = new ol.layer.Vector({
            style: function (feature) {
                return feature.get('style');
            },
            source: new ol.source.Vector({ features: [iconFeature] }),
        });

        map.addLayer(pointLayer);
    }

    if ((route || clusters) && myposLayer == null) {
        if (typeof extbase_config != 'undefined' && extbase_config.mapconfig && extbase_config.mapconfig.showselection == 1) {
            map.getView().fit(boxvector.getSource().getExtent(), { size: map.getSize(), padding: [80, 80, 80, 80] });
        } else {
            var tmpLayer = route ? route : clusters[0];
            if (typeof tmpLayer != 'undefined') {
                for (var i = 0; i < layers.length; i++) {
                    if (layers[i].get('active') == 'active') {
                        tmpLayer = layers[i];
                        break;
                    }
                }
                var counter = 0;
                var interval = setInterval(function () {
                    var arr = tmpLayer.getSource().getExtent();
                    if (!joInArray('Infinity', arr) && !joInArray('-Infinity', arr)) {
                        map.getView().fit(tmpLayer.getSource().getExtent(), { maxZoom: 11, padding: [35, 35, 35, 35] });
                        clearInterval(interval);
                    }
                    if (counter == 50) {
                        clearInterval(interval);
                    }
                    counter++;
                }, 100);
            }
        }

        /*if(route && false) {
            tmpLayer = route;
            var arr = tmpLayer.getSource().getExtent();
            if(!joInArray('Infinity', arr) && !joInArray('-Infinity', arr)) {
                map.getView().fit(arr, map.getSize());
            } else {
                tmpLayer.once('change',function(e){
                    if(tmpLayer.getSource().getState() === 'ready') {
                        map.getView().fit(tmpLayer.getSource().getExtent(), map.getSize());
                    }
                });
            }
        } else if(clusters) {
            var interval = setInterval(function(){
                var arr = clusters.getSource().getExtent();
                if(!joInArray('Infinity', arr) && !joInArray('-Infinity', arr)) {
                    map.getView().fit(clusters.getSource().getExtent(), map.getSize());
                    clearInterval(interval);
                }
            }, 100);
        }*/
    }

    if (typeof polygones != 'undefined' && !jQuery.isEmptyObject(polygones)) {
        var polyArr = [];
        $.each(polygones, function (i, val) {
            var tmptext = '';
            if (typeof val[1] != 'undefined' && val[1]) {
                tmptext = new ol.style.Text({
                    textAlign: 'left',
                    textBaseline: 'middle',
                    font: 'normal 20px Arial',
                    text: val[1].toString(),
                    fill: new ol.style.Fill({ color: '#ffffff' }),
                    stroke: new ol.style.Stroke({ color: '#000000', width: 3 })
                });
            }

            var tmp = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(val[0], { featureProjection: 'EPSG:3857' })
                }),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(10,45,64,1)',
                        width: 2
                    }),
                    fill: new ol.style.Stroke({
                        color: 'rgba(10,45,64,.3)'
                    }),
                    text: tmptext
                })
            });
            tmp.set('title', 'p');
            tmp.set('id', i);
            tmp.set('num', val[1]);
            tmp.set('l', val[2]);
            tmp.setVisible(0);
            map.addLayer(tmp);
            polyArr.push(tmp);
        });

        var curZoom = map.getView().getZoom();

        map.on('moveend', function (e) {
            var newZoom = map.getView().getZoom();
            if (newZoom != curZoom) {
                if (newZoom >= 11) {
                    $.each(clusters, (i, v) => { v.setVisible(0) });
                    $.each(polyArr, (i, v) => { v.setVisible(1) });
                } else {
                    $.each(clusters, (i, v) => { v.setVisible(1) });
                    $.each(polyArr, (i, v) => { v.setVisible(0) });
                }
            }
        });
    }

    if (typeof polygonsJson != 'undefined') {
        var p_image = new ol.style.Circle({
            radius: 3,
            fill: new ol.style.Stroke({ color: 'red' }),
            stroke: new ol.style.Stroke({ color: 'red', width: 1 })
        });

        var p_image_hover = new ol.style.Circle({
            radius: 3,
            fill: new ol.style.Stroke({ color: 'green' }),
            stroke: new ol.style.Stroke({ color: 'green', width: 1 })
        });

        var p_styles = {
            'Point': new ol.style.Style({
                image: p_image
            }),
            'Point_hover': new ol.style.Style({
                image: p_image_hover
            }),
            'Polygon': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(10,45,64,1)',
                    width: 2
                })
            }),
            'Polygon_hover': new ol.style.Style({
                fill: new ol.style.Fill({ color: 'rgba(10,45,64,.5)' }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(10,45,64,1)',
                    width: 2
                })
            })
        };
        var p_styleFunction = function (feature) {
            if (feature.get('hover') && typeof feature.get('hover') != 'undefined' && 'y' == feature.get('hover')) {
                return p_styles[feature.getGeometry().getType() + '_hover'];
            } else {
                return p_styles[feature.getGeometry().getType()];
            }
        };

        /*
        polygonsLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(polygonsJson,{featureProjection: 'EPSG:3857'})
            }),
            style: p_styleFunction
        });
        */

        var jsonSource = new ol.source.Vector({
            features: new ol.Collection()
        });
        jsonSource.addFeatures(new ol.format.GeoJSON().readFeatures(polygonsJson, { featureProjection: 'EPSG:3857' }));

        polygonsLayer = new ol.layer.Vector({
            source: jsonSource,
            style: p_styleFunction
        });

        var isPoint = true;

        polygonsLayer.getSource().getFeatures().forEach(function (feature) {
            if ('Point' != feature.getGeometry().getType()) isPoint = false;
        });

        polygonsLayer.set('title', 'Lokalisierung');
        polygonsLayer.set('id', 'Polygonlayer');

        map.addLayer(polygonsLayer);

        if (isPoint) {
            map.getView().fit(polygonsLayer.getSource().getExtent(), { maxZoom: 3, padding: [80, 80, 80, 80] });
        } else {
            map.getView().fit(polygonsLayer.getSource().getExtent(), { padding: [80, 80, 80, 80] });
        }

        var container = document.getElementById('popup');
        var content = document.getElementById('popup-content');
        var loader = document.getElementById('popup-loader');
        var closer = document.getElementById('popup-closer');
        var info = new ol.Overlay({
            element: container,
            stopEvent: false
        });

        map.addOverlay(info);

        if (closer) {
            closer.onclick = function () {
                container.style.display = 'none';
                closer.blur();
                return false;
            };
        }

        var overContainer = document.getElementById('joMaps-container');
        var infocontainer = document.getElementById('joInfo-container');
        var infocontent = document.getElementById('joInfo-content');
        var infocloser = document.getElementById('joInfo-content-closer');
        var infoloader = document.getElementById('joAjaxloader');

        if (infocloser) {
            infocloser.onclick = function () {
                overContainer.classList.remove('show');
                infocloser.blur();
                return false;
            };
        }

        var pauseMapClick = false;
        /* prevent map click event on carousel next and prev */
        $('body').on('mouseenter', '#popup .carousel-control-next, #popup .carousel-control-prev, #popup .joIndicator-item', function (e) {
            e.stopPropagation();
            pauseMapClick = true;
        });

        $('body').on('mouseleave', '#popup .carousel-control-next, #popup .carousel-control-prev, #popup .joIndicator-item', function (e) {
            e.stopPropagation();
            pauseMapClick = false;
        });

        mapClickEvent = function (evt) {
            var joLoader = $('#joAjaxloader');
            if (!pauseMapClick) {
                var mobile = ($('#mobile-hidden').is(':visible')) ? false : true;
                var foundLayer;
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature, layer) {
                        foundLayer = layer;
                        return feature;
                    }
                );
                if (feature) {
                    if (typeof foundLayer != 'undefined' && foundLayer.get('title') && foundLayer.get('title') == 'p') {
                        var coordinates = foundLayer.getSource().getExtent();
                        if (mobile && infocontent) {
                            overContainer.classList.add('show');
                        } else {
                            if (!$('.map-slide-box').length) {
                                info.setPosition([coordinates[2], coordinates[3] - ((coordinates[3] - coordinates[1]) / 2)]);
                                container.style.display = 'block';
                            }
                            joLoader.show();
                        }
                        if (mobile && infocontent) {
                            infoloader.style.display = 'block';
                            infocontent.innerHTML = '';
                        } else {
                            loader.style.display = 'block';
                            content.innerHTML = '';
                        }
                        var url = foundLayer.get('l');
                        var id = foundLayer.get('id');
                        if (typeof useIcons != 'undefined' && useIcons) {
                            var link = '';
                            if (url && url != '') link = '<a class="btn btn-popup" href="' + url + '">Diesen Ort auswählen</a>';
                            var pre = curFeature.get('c');
                            if (pre && pre == 'c2') pre = 'Fundort: ';
                            else pre = '';
                            var div = '<div class="popup-innerdiv">' + pre + foundLayer.get('t') + '</div>' + link;
                            if (mobile && infocontent) {
                                infoloader.style.display = 'none';
                                infocontent.innerHTML = div;
                            } else {
                                loader.style.display = 'none';
                                content.innerHTML = div;
                            }
                        } else {
                            $('.joListNotableContainer .list_notable.active').removeClass('active');
                            var $con = $('.map-slide-box');
                            $item = $con.find('.item-' + id);
                            if (!mobile && $item.length) {
                                $con.find('.map-slide-item.active').not($item).removeClass('active');
                                if ($item.hasClass('active')) {
                                    $con.removeClass('active');
                                    $item.removeClass('active');
                                } else {
                                    $con.addClass('active');
                                    $item.addClass('active');
                                }
                                joLoader.hide();
                            } else {
                                $con.removeClass('active');
                                if (url != '') {
                                    $.get(url).done(function (data) {
                                        if (mobile && infocontent) {
                                            infoloader.style.display = 'none';
                                            infocontent.innerHTML = data;
                                            var car = $(infocontent).find('.carousel');
                                            if (car.length) {
                                                car.carousel();
                                            }
                                        } else {
                                            loader.style.display = 'none';
                                            joLoader.hide();
                                            $con.find('.map-slide-item.active').removeClass('active');
                                            var div = '<div class="map-loaded map-slide-item item-' + id + ' active" data-id="' + id + '"><button type="button" class="close" aria-label="Close"><span aria-hidden="true">×</span></button>';
                                            div += data;
                                            div += '</div>';
                                            $con.append(div);
                                            $con.addClass('active');
                                        }
                                    });
                                } else {
                                    joLoader.hide();
                                }
                            }
                        }
                        return 0;
                    }
                    var id = feature.getId();

                    if (typeof id === 'undefined') {
                        var coordinates = feature.getGeometry().getCoordinates();
                        if (mobile && infocontent) {
                            overContainer.classList.add('show');
                        } else {
                            if (!$('.map-slide-box').length) {
                                info.setPosition(coordinates);
                            }
                            container.style.display = 'block';
                            joLoader.show();
                        }
                        var features = feature.get('features');

                        if (typeof features != 'undefined' && features.length === 1 || typeof feature.get('i') != 'undefined') {
                            if (mobile && infocontent) {
                                infoloader.style.display = 'block';
                                infocontent.innerHTML = '';
                            } else {
                                loader.style.display = 'block';
                                content.innerHTML = '';
                            }
                            var curFeature = null;

                            if (typeof feature.get('i') != 'undefined') {
                                curFeature = feature;
                            } else {
                                curFeature = features[0];
                            }

                            var url = curFeature.get('l');
                            var id = curFeature.get('i');

                            if (typeof useIcons != 'undefined' && useIcons) {
                                var link = '';
                                if (url && url != '') link = '<a class="btn btn-popup" href="' + url + '">Diesen Ort auswählen</a>';

                                var p_text = curFeature.get('c');
                                if (p_text && p_text == 'c2') p_text = 'Fundort: ';
                                else p_text = '';

                                var p_text = '';
                                if (curFeature.get('details')) {
                                    $.each(curFeature.get('details'), function (i, v) {
                                        p_text += '<p>' + v + '</p>';
                                    });
                                }

                                var div = '<div class="popup-innerdiv"><h4>' + curFeature.get('t') + '</h4>' + p_text + '</div>' + link;
                                if (mobile && infocontent) {
                                    infoloader.style.display = 'none';
                                    infocontent.innerHTML = div;
                                } else {
                                    loader.style.display = 'none';
                                    content.innerHTML = div;
                                }
                                joLoader.hide();
                            } else {
                                var $con = $('.map-slide-box');
                                $item = $con.find('.item-' + id);

                                if (!mobile && $item.length) {
                                    $con.find('.map-slide-item.active').not($item).removeClass('active');
                                    if ($item.hasClass('active')) {
                                        $con.removeClass('active');
                                        $item.removeClass('active');
                                    } else {
                                        $con.addClass('active');
                                        $item.addClass('active');
                                    }
                                    joLoader.hide();
                                } else {
                                    $con.removeClass('active');

                                    if (url != '') {
                                        $.get(url).done(function (data) {
                                            if (mobile && infocontent) {
                                                infoloader.style.display = 'none';
                                                infocontent.innerHTML = data;
                                                var car = $(infocontent).find('.carousel');
                                                if (car.length) {
                                                    car.carousel();
                                                }
                                                joLoader.hide();
                                            } else {
                                                loader.style.display = 'none';
                                                joLoader.hide();
                                                var div = '<div class="map-loaded map-slide-item item-' + id + ' active" data-id="' + id + '"><button type="button" class="close" aria-label="Close"><span aria-hidden="true">×</span></button>';
                                                div += data;
                                                div += '</div>';
                                                if ($con.length) {
                                                    $con.find('.map-slide-item.active').removeClass('active');
                                                    $con.append(div);
                                                    $con.addClass('active');
                                                } else {
                                                    content.innerHTML = div;
                                                }
                                            }
                                        });
                                    } else {
                                        joLoader.hide();

                                        var id = curFeature.get('i');
                                        var title = curFeature.get('n');
                                        var desc = curFeature.get('d');
                                        var web = '';

                                        if (typeof curFeature.get('w') != 'undefined') {
                                            web = '<p><a href="' + curFeature.get('w') + '" target="_blank">zur Webseite</a></p>';
                                        }

                                        var coordinates = feature.getGeometry().getCoordinates();
                                        info.setPosition(coordinates);
                                        loader.style.display = 'none';
                                        content.innerHTML = '<div class="p-3"><span style="font-size: 16px">' + id + '</span></br><strong>' + title + '</strong><p>' + desc + '</p>' + web + '</div>';
                                    }
                                }

                            }
                        } else if (typeof features != 'undefined') {
                            if (mobile && infocontent) {
                                overContainer.classList.remove('show');
                            } else {
                                container.style.display = 'none';
                                joLoader.hide();
                            }
                            var zoom = map.getView().getZoom() + 1;
                            map.getView().fit(feature.get('features')[0].getGeometry().getExtent(), { duration: 1000, maxZoom: zoom });
                        } else {
                            if (mobile && infocontent) {
                                overContainer.classList.remove('show');
                            } else {
                                container.style.display = 'none';
                                joLoader.hide();
                            }
                        }
                    } else {
                        if (mobile && infocontent) {
                            overContainer.classList.remove('show');
                        } else {
                            container.style.display = 'none';
                            joLoader.hide();
                        }
                    }
                } else {
                    if (mobile && infocontent) {
                        overContainer.classList.remove('show');
                    } else {
                        container.style.display = 'none';
                        joLoader.hide();
                    }
                }
            }
        }

        map.on('click', mapClickEvent);





    }

    var imgArr = [];
    var imgLayerArr = [];
    function joShowOverlayTrigger(id, scroll) {
        if (typeof id != 'undefined' && id != '') {
            var $that = $('.map-item-header[data-id="' + id + '"]');
            var $thatBlob = $that.find('.joShowOverlayTrigger');

            if ($that.length == 0) return false;

            var $src_wrapper = $('#map-list .joScrollWrap');
            var parentOffsetTop = $src_wrapper.offset().top;
            var childOffsetTop = $that.offset().top;

            if (scroll) {
                $src_wrapper.animate({
                    scrollTop: $src_wrapper.scrollTop() + childOffsetTop - parentOffsetTop
                }, 300);
            }

            var isVisible = false;
            if ($that.hasClass('map-img-loaded')) {
                isVisible = imgLayerArr[id].getVisible();
            }

            var map_layers = map.getLayers().getArray();

            map_layers.forEach(function (v, i) {
                var l_id = '';
                if (v.get('id') && typeof v.get('id') != 'undefined') {
                    l_id = v.get('id');
                } else {
                    return;
                }

                if (l_id.startsWith('marker-')) {
                    var features = v.getSource().getFeatures();

                    if (features.length == 0) return;

                    if ('marker-' + id == l_id) {
                        if (!isVisible) {
                            features.forEach(function (fv, fi) {
                                fv.set('act', 'y');
                            });
                        } else {
                            features.forEach(function (fv, fi) {
                                fv.set('act', 'n');
                            });
                        }
                    }
                    return;
                }
            });

            if ($that.hasClass('map-img-loaded')) {
                var extent = imgArr[id];
                var item = imgLayerArr[id];

                if (isVisible) {
                    //item.setOpacity(0);
                    item.setVisible(false);
                    $that.removeClass('mapactive');
                } else {
                    map.getView().fit(extent, { duration: 500, padding: [35, 35, 35, 35] });
                    //item.setOpacity(1);
                    item.setVisible(true);
                    $that.addClass('mapactive');
                }

                return true;
            }

            var extent = [0, 0, 0, 0];
            var index = 10;

            map_layers.forEach(function (v, i) {
                var l_id = '';
                if (v.get('id') && typeof v.get('id') != 'undefined') {
                    l_id = v.get('id');
                } else {
                    return;
                }

                if ('Polygonlayer' == l_id) {
                    var features = v.getSource().getFeatures();

                    if (features.length == 0) return;

                    features.forEach(function (fv, fi) {
                        if (fv.get('id') && typeof fv.get('id') != 'undefined' && id == fv.get('id')) {
                            extent = fv.getGeometry().getExtent();
                            index = (i + fi + 1) * 10;
                        }
                    });
                }
            });

            var iiif_url = $thatBlob.data('iiif');

            fetch(iiif_url).then(function (response) {
                response.json().then(function (imageInfo) {
                    var options = new ol.format.IIIFInfo(imageInfo).getTileSourceOptions();
                    if (options === undefined || options.version === undefined) {
                        console.log('Data seems to be no valid IIIF image information.');
                        return;
                    }

                    var xyzUrl = iiif_url.split('/info.json')[0];

                    var width = parseInt(options.size[0]);
                    var height = parseInt(options.size[1]);

                    // var newTileWidth = Math.ceil(width / 2);
                    // var newTileHeight = Math.ceil(height / 2);

                    // var gesW = extent[2] - extent[0];
                    // var gesH = extent[3] - extent[1];
                    var gesW = ol.extent.getWidth(extent);
                    var gesH = ol.extent.getHeight(extent);

                    // Weite 1px == 3669.6026832295934
                    // Höhe 1px == 3675.0050868495036

                    // 3x3 grid
                    // var newTileWidth = gesW / 3669.6026832295934;
                    // var newTileHeight = gesH / 3675.0050868495036;

                    var resolutionOfExtent = map.getView().getResolutionForExtent(extent);
                    var zoomOfResolution = map.getView().getZoomForResolution(resolutionOfExtent);

                    function calcTileWidth(numTiles) {
                        return gesW / (1223.2008944098645 * numTiles);
                    }

                    function calcTileHeight(numTiles) {
                        return gesH / (1225.0016956165011 * numTiles);
                    }

                    var newTileWidth = calcTileWidth(2);
                    var newTileHeight = calcTileHeight(2);

                    if (zoomOfResolution > 10) {
                        newTileWidth = calcTileWidth(2) * 2;
                        newTileHeight = calcTileHeight(2) * 2;
                    }

                    // var defaultTileGrid = ol.tilegrid.createXYZ({maxZoom: 10});
                    // defaultTileGrid.getResolutions()
                    var resolutions = [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525];

                    var xyzTileSource = new ol.source.XYZ({
                        url: xyzUrl + '/{z}/{x}/{y}.png',
                        crossOrigin: true,
                        tileGrid: new ol.tilegrid.TileGrid({
                            projection: options.projection,
                            tileSize: [newTileWidth, newTileHeight],
                            origin: ol.extent.getTopLeft(extent),
                            resolutions: resolutions,
                            extent: extent
                        }),
                        extent: extent
                    });

                    xyzTileSource.setTileUrlFunction(function (tileCoord, pixelRatio, projection) {
                        var tileGrid = this.getTileGrid();

                        var tileExtent = tileGrid.getTileCoordExtent(tileCoord);

                        if (!ol.extent.containsExtent(extent, tileExtent)) return;

                        var tileW = ol.extent.getWidth(tileExtent);
                        var tileH = ol.extent.getHeight(tileExtent);

                        var prozW = (tileW * 100) / gesW;
                        var prozH = (tileH * 100) / gesH;

                        var pixelW = Math.round((prozW * width) / 100);
                        var pixelH = Math.round((prozH * height) / 100);

                        var topLeftCoordsMaster = ol.extent.getTopLeft(extent);
                        var topLeftCoordsTile = ol.extent.getTopLeft(tileExtent);

                        // Abstand zwischen Tile und start berechnen
                        var diffW = Math.abs(topLeftCoordsTile[0] - topLeftCoordsMaster[0]);
                        var diffH = Math.abs(topLeftCoordsTile[1] - topLeftCoordsMaster[1]);

                        var prozDiffW = (diffW * 100) / gesW;
                        var prozDiffH = (diffH * 100) / gesH;

                        var pixelDiffW = Math.round((prozDiffW * width) / 100);
                        var pixelDiffH = Math.round((prozDiffH * height) / 100);

                        var region = pixelDiffW + ',' + pixelDiffH + ',' + pixelW + ',' + pixelH;

                        var mapZoom = map.getView().getZoom();
                        var zoom = 10;

                        mapZoom -= 6;
                        if (0 > mapZoom) mapZoom = 1;
                        zoom = (21 * mapZoom).toFixed(2);
                        if (zoom >= 80) zoom = 80;

                        return xyzUrl + '/' + region + '/pct:' + zoom + '/0/' + options.quality + '.' + options.format;
                        // return 'https://kartenspeicher.gbv.de/mir/api/iiif/image/v2/iflzkw_derivate_00000189%2FHK137.jpg/full/pct:25/0/default.jpg';
                    });

                    var layer = new ol.layer.Tile({
                        source: xyzTileSource,
                        extent: extent,
                    });

                    map.addLayer(layer);
                    map.getView().fit(extent, { duration: 500, padding: [35, 35, 35, 35] });

                    imgArr[id] = extent;
                    imgLayerArr[id] = layer;

                    $that.addClass('map-img-loaded mapactive');

                }).catch(function (e) {
                    console.log(e);
                    console.log('error2');
                });
            }).catch(function (e) {
                console.log(e);
                console.log('error');
            });

            /*
            var projection = new ol.proj.Projection({
                code: 'xkcd-image',
                units: 'pixels',
                extent: extent,
            });

            var imgUrl = $thatBlob.data('img');

            var imgSource = new ol.source.ImageStatic({
                // attributions: '© <a href="https://xkcd.com/license.html">xkcd</a>',
                url: imgUrl,
                projection: projection,
                imageExtent: extent
            });

            var imgLayer = new ol.layer.Image({
                source: imgSource,
                extent: extent
            });

            imgLayer.set('id', 'imgLayer-' + id);
            imgLayer.set('isImg', id);
            imgLayer.setZIndex(index);

            imgSource.on('imageloadstart', function(evt) {
                $('#joAjaxloader').show();
            });

            imgSource.on(['imageloadend', 'imageloaderror'], function(evt) {
                $('#joAjaxloader').hide();
            });

            map.addLayer(imgLayer);

            map.getView().fit(extent, {duration: 500, padding: [35,35,35,35]});

            imgArr[id] = extent;
            imgLayerArr[id] = imgLayer;

            $that.addClass('map-img-loaded mapactive');
            */
        }
    }

    if (typeof btnOnMapItem != 'undefined' && btnOnMapItem) {
        function mapIconBuilder(feature) {
            var img_url = '/typo3conf/ext/jo_museo/Resources/Public/Images/eye.svg';

            if (typeof feature.get('act') != 'undefined' && 'y' == feature.get('act')) img_url = '/typo3conf/ext/jo_museo/Resources/Public/Images/eye_close.svg';

            return new ol.style.Style({
                image: new ol.style.Icon(({
                    scale: 0.25,
                    //offset: [-57.1, 0],
                    //offset: [-57.1, 0],
                    //opacity: parseFloat(opacity),
                    anchor: [0.04, 1.15],
                    src: img_url
                }))
            });
        }

        var map_layers = map.getLayers().getArray();

        map_layers.forEach(function (v, i) {
            if (v.get('id') && typeof v.get('id') != 'undefined' && 'Polygonlayer' == v.get('id')) {
                var features = v.getSource().getFeatures();

                if (features.length == 0) return;

                features.forEach(function (fv, fi) {
                    if (typeof fv.get('d') != 'undefined' && fv.get('d') == null) return;

                    if (fv.get('id') && typeof fv.get('id') != 'undefined') {
                        var id = fv.get('id');
                        var geo = fv.getGeometry();

                        var layer = new ol.layer.Vector({
                            source: new ol.source.Vector({
                                features: [
                                    new ol.Feature({
                                        geometry: new ol.geom.Point(geo.getCoordinates()[0][0]),
                                        id: 'marker-' + id
                                    })
                                ]
                            }),
                            style: mapIconBuilder
                        });

                        layer.set('id', 'marker-' + id);

                        map.addLayer(layer);
                    }
                });
            }
        });

        var mapClickEvent2 = function (evt) {
            var joLoader = $('#joAjaxloader');
            var mobile = ($('#mobile-hidden').is(':visible')) ? false : true;
            var foundLayer;
            var feature = map.forEachFeatureAtPixel(evt.pixel,
                function (feature, layer) {
                    foundLayer = layer;
                    return feature;
                }
            );

            if (feature && typeof feature.get('id') != 'undefined') {
                var id = feature.get('id');
                if (id.startsWith('marker-')) {
                    id = id.replace('marker-', '');
                    joShowOverlayTrigger(id, true);
                }
            }

            var tmpLayer;
            var lastIndex = 0;
            var pixel = map.getEventPixel(evt.originalEvent);
            map.forEachLayerAtPixel(pixel,
                function (layer) {
                    if (typeof layer.get('isImg') != 'undefined') {
                        if (layer.getZIndex() > lastIndex) {
                            lastIndex = layer.getZIndex();
                            tmpLayer = layer;
                        }
                    }
                }
            );

            if (tmpLayer) {
                var id = tmpLayer.get('isImg');
                $('.list_notable[data-id="' + id + '"] .map-item-header').trigger('click');
            }
        }
        map.on('click', mapClickEvent2);

        map.on('pointermove', function (evt) {
            var feature = map.forEachFeatureAtPixel(evt.pixel,
                function (feature, layer) {
                    foundLayer = layer;
                    return feature;
                }
            );

            if (feature && typeof feature.get('id') != 'undefined') {
                var id = feature.get('id');
                if (id.startsWith('marker-')) {
                    map.getTargetElement().style.cursor = 'pointer';
                }
            } else {
                map.getTargetElement().style.cursor = 'initial';
            }
        });
    }

    $('.joShowOverlayTrigger').click(function (e) {
        e.stopPropagation();
        var $that = $(this);

        var id = $that.closest('.map-item-header').data('id');

        joShowOverlayTrigger(id, false);
    });

    //if (typeof btnOnMapItem != 'undefined' && btnOnMapItem) {
    class joLayerControl extends ol.control.Control {
        constructor(opt_options) {
            var options = opt_options || {};

            var button = document.createElement('button');
            button.className = 'joLayerButton';
            button.innerHTML = 'L';

            var element = document.createElement('div');
            element.className = 'joLayerContainer ol-unselectable ol-control';
            element.appendChild(button);

            var layerContent = document.createElement('div');
            layerContent.className = 'joLayerContent';
            element.appendChild(layerContent);

            button.onclick = function () {
                layerContent.classList.toggle('active');
            };

            var ul = document.createElement('ul');
            var tmplayers = map.getLayers().getArray();
            for (var i = 2; i < tmplayers.length; i++) {
                if (tmplayers[i].get('title') && tmplayers[i].get('title') == 'p') {
                    continue;
                }
                var id = 'layer_' + (i - 1);

                if (tmplayers[i].get('id')) {
                    id = tmplayers[i].get('id');
                }

                var li = document.createElement('li');
                var input = getInput(tmplayers[i], id);
                var label = document.createElement('label');

                label.htmlFor = id;
                label.innerHTML = tmplayers[i].get('title') ? tmplayers[i].get('title') : id;

                li.appendChild(input);
                li.appendChild(label);

                ul.appendChild(li);
            }

            layerContent.appendChild(ul);

            super({
                element: element,
                target: options.target,
            });

            // button.addEventListener('click', this.handleRotateNorth.bind(this), false);
        }
    }

    map.addControl(new joLayerControl());
    /*
} else {
    // layer switcher
    var joLayerControl = function(opt_options) {
        var options = opt_options || {};

        var button = document.createElement('button');
        button.className = 'joLayerButton';
        button.innerHTML = 'L';

        var element = document.createElement('div');
        element.className = 'joLayerContainer ol-unselectable ol-control';
        element.appendChild(button);

        var layerContent = document.createElement('div');
        layerContent.className = 'joLayerContent';
        element.appendChild(layerContent);

        button.onclick = function() {
            layerContent.classList.toggle('active');
        };

        var ul = document.createElement('ul');
        var tmplayers = map.getLayers().getArray();
        for (var i = 2; i < tmplayers.length; i++) {
            if (tmplayers[i].get('title') && tmplayers[i].get('title') == 'p') {
                continue;
            }
            var id = 'layer_' + (i - 1);
            var li = document.createElement('li');
            var input = getInput(tmplayers[i], id);
            var label = document.createElement('label');

            label.htmlFor = id;
            label.innerHTML = tmplayers[i].get('title') ? tmplayers[i].get('title') : id;

            li.appendChild(input);
            li.appendChild(label);

            ul.appendChild(li);
        }

        layerContent.appendChild(ul);

        ol.control.Control.call(this, {
          element: element,
          target: options.target
        });

        //@all --> layerswitcher set display none
        //button.style.display = 'none';
    };

    // @all OL version 6 kann dies nich bearbeiten, braucht man es überhaupt? 
    ol.inherits(joLayerControl, ol.control.Control);

    map.addControl(new joLayerControl());
}
*/

    if (typeof extbase_config != 'undefined' && typeof showBoundingBox != 'undefined' && showBoundingBox) {
        var draw; // global so we can remove it later
        var drawsource = new ol.source.Vector({ wrapX: false });
        var drawvector = new ol.layer.Vector({
            source: drawsource
        });
        map.addLayer(drawvector);

        // if (typeof btnOnMapItem != 'undefined' && btnOnMapItem) {
        class joDrawBoxControl extends ol.control.Control {
            constructor(opt_options) {
                var options = opt_options || {};

                var infobox = '<div class="alert drw-box-info">';
                infobox += '<p>Markieren des Bereichs durch klicken und ziehen.</p>';
                infobox += '<div class="drw-box-close"></div>';
                infobox += '</div>';

                var $infobox = $(infobox);

                $('#ol4-mapdiv').append($infobox);

                /*
                var ex_btn = $('<div class=" active">btn 1</div>');
                var ex_btn2 = $('<div class="">btn 2</div>');
                */

                $infobox.click(function () {
                    $infobox.hide();
                    $('.boundingbox_button').show().find('.joModeToggle').removeClass('active');
                });

                var button = document.createElement('button');
                button.className = 'joModeToggle';
                button.innerHTML = 'Suchbereich auswählen';
                button.setAttribute('title', 'Suchbereich auswählen');

                var element = document.createElement('div');
                element.className = 'boundingbox_button ol-control button';
                element.appendChild(button);

                button.onclick = function () {
                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                        $infobox.hide();
                        map.removeInteraction(draw);
                    } else {
                        $(this).addClass('active');
                        $(this).parent().hide();
                        $infobox.show();
                        var select = new ol.interaction.Select();
                        map.addInteraction(select);

                        var selectedFeatures = select.getFeatures();

                        draw = new ol.interaction.DragBox();

                        map.addInteraction(draw);

                        /* draw = new ol.interaction.Draw({
                            source: drawsource,
                            type: 'Circle',
                            geometryFunction: ol.interaction.Draw.createBox()
                        });

                        draw.on('drawstart', function(e) {
                            drawsource.clear();
                        }); */

                        //draw.on('drawend', function(e) {
                        draw.on('boxend', function (e) {
                            $('#joAjaxloader').show();
                            //var curFeature = e.feature;
                            //var curExtent = curFeature.getGeometry().getExtent();
                            var curExtent = draw.getGeometry().getExtent();
                            if (curExtent) {
                                // 0 = topleft lon, 1 topleft lat, 2 bottomright lon, 3 bottomright lat 
                                var pagetype = '';
                                var ceid = '';
                                if (extbase_config.ce_uid) {
                                    ceid = "&ceid=" + extbase_config.ce_uid;
                                }
                                if (extbase_config.pagetype > 0) {
                                    pagetype = "&type=" + extbase_config.pagetype;
                                }
                                var coords = ol.proj.transformExtent(curExtent, 'EPSG:3857', 'EPSG:4326');
                                var pageId = extbase_config.currentPageId;
                                var action = extbase_config.prefix + '%5Baction%5D=' + extbase_config.action;
                                var controller = extbase_config.prefix + '%5Bcontroller%5D=' + extbase_config.controller_name;
                                var lon1 = extbase_config.prefix + '%5Blon1%5D=' + coords[0];
                                var lon2 = extbase_config.prefix + '%5Blon2%5D=' + coords[2];
                                var lat1 = extbase_config.prefix + '%5Blat1%5D=' + coords[1];
                                var lat2 = extbase_config.prefix + '%5Blat2%5D=' + coords[3];
                                // var url = '/index.php?id=' + pageId + ceid + pagetype + '&' + action + '&' + controller + '&' + lon1 + '&' + lon2 + '&' + lat1 + '&' + lat2;
                                var url = '?' + ceid + pagetype + '&' + action + '&' + controller + '&' + lon1 + '&' + lon2 + '&' + lat1 + '&' + lat2;
                                // window.location.href = url;

                                if (extbase_config.pagetype > 0) {
                                    $('#joAjaxloader').show();
                                    $.get(url).done(function (data) {
                                        $('.joPageTimeline').closest('.frame').html($(data)).promise().done(function () {
                                            if (typeof initMapFuncIt == 'function') initMapFuncIt();
                                            if (typeof fc_drp_init == 'function') fc_drp_init();
                                            if (typeof initSlider == 'function') initSlider();
                                        });
                                        $('#joAjaxloader').hide();
                                    });
                                } else {
                                    window.location.href = url;
                                }
                            }
                        });

                        draw.on('boxstart', function () {
                            selectedFeatures.clear();
                        });
                        //map.addInteraction(draw);
                    }
                };

                super({
                    element: element,
                    target: options.target,
                });
            }
        }

        map.addControl(new joDrawBoxControl());
    }

    if (typeof geolocation != 'undefined' && geolocation) {
        var localizeItPointOuter = '';
        class localizeIt extends ol.control.Control {
            constructor(opt_options) {
                var options = opt_options || {};

                var button = document.createElement('button');
                button.className = 'localizeMap';
                button.innerHTML = 'Um meinen Standort suchen';
                button.setAttribute('title', 'Um meinen Standort suchen');

                var element = document.createElement('div');
                element.className = 'localizeMap_button ol-control button';
                element.appendChild(button);

                button.onclick = function () {
                    $('#joAjaxloader').show();
                    var options = {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    };

                    function success(pos) {
                        if (localizeItPointOuter != '') map.removeLayer(localizeItPointOuter);
                        var crd = pos.coords;

                        $('.localizeMap-box-info').remove();

                        var place = [crd.longitude, crd.latitude];
                        var point = new ol.geom.Point(ol.proj.fromLonLat(place));

                        function createStyle(src) {
                            return new ol.style.Style({
                                image: new ol.style.Icon({
                                    anchor: [0.5, 0.96],
                                    src: src
                                }),
                            });
                        }

                        var iconFeature = new ol.Feature(point);
                        iconFeature.set('style', createStyle(joPinPath));

                        var pointLayer = new ol.layer.Vector({
                            style: function (feature) {
                                return feature.get('style');
                            },
                            source: new ol.source.Vector({ features: [iconFeature] }),
                        });

                        localizeItPointOuter = pointLayer;
                        map.addLayer(pointLayer);

                        // map.getView().fit(pointLayer.getSource().getExtent(), {maxZoom: 15, padding: [35,35,35,35]});

                        // ol.proj.fromLonLat(place)
                        var pagetype = '';
                        var ceid = '';
                        if (extbase_config.ce_uid) {
                            ceid = "&ceid=" + extbase_config.ce_uid;
                        }
                        if (extbase_config.pagetype > 0) {
                            pagetype = "&type=" + extbase_config.pagetype;
                        }
                        var pageId = extbase_config.currentPageId;
                        var action = extbase_config.prefix + '%5Baction%5D=' + extbase_config.action;
                        var controller = extbase_config.prefix + '%5Bcontroller%5D=' + extbase_config.controller_name;
                        var lat = extbase_config.prefix + '%5Blat%5D=' + crd.latitude;
                        var lon = extbase_config.prefix + '%5Blon%5D=' + crd.longitude;
                        // var url = '/index.php?id=' + pageId + ceid + pagetype + '&' + action + '&' + controller + '&' + lat + '&' + lon;
                        var url = '?' + ceid + pagetype + '&' + action + '&' + controller + '&' + lat + '&' + lon;
                        // window.location.href = url;

                        if (extbase_config.pagetype > 0) {
                            $('#joAjaxloader').show();
                            $.get(url).done(function (data) {
                                $('.joPageTimeline').closest('.frame').html($(data)).promise().done(function () {
                                    if (typeof initMapFuncIt == 'function') initMapFuncIt();
                                    if (typeof fc_drp_init == 'function') fc_drp_init();
                                    if (typeof initSlider == 'function') initSlider();
                                });
                                $('#joAjaxloader').hide();
                            });
                        } else {
                            window.location.href = url;
                        }
                    }

                    function error(err) {
                        console.warn(`ERROR(${err.code}): ${err.message}`);
                        $('.localizeMap-box-info').remove();
                        var infobox = '<div class="alert localizeMap-box-info">';
                        infobox += '<p>' + err.message + '</p>';
                        infobox += '<div class="localizeMap-box-close"></div>';
                        infobox += '</div>';

                        var $infobox = $(infobox);

                        $infobox.click(function () {
                            $infobox.hide();
                        });

                        $('#ol4-mapdiv').append($infobox);
                        $infobox.show();
                        $('#joAjaxloader').hide();
                    }

                    navigator.geolocation.getCurrentPosition(success, error, options);
                };

                super({
                    element: element,
                    target: options.target,
                });
            }
        }

        map.addControl(new localizeIt());


        localizeIt2PointOuter = '';
        class localizeIt2 extends ol.control.Control {
            constructor(opt_options) {
                var options = opt_options || {};

                var button = document.createElement('button');
                button.className = 'localizeMap2';
                button.innerHTML = 'L2';
                button.setAttribute('title', 'L2');

                var element = document.createElement('div');
                element.className = 'localizeMap2_button ol-control button d-none';
                element.appendChild(button);

                button.onclick = function () {
                    if (localizeIt2PointOuter != '') map.removeLayer(localizeIt2PointOuter);
                    var mappoint = map.getView().getCenter();

                    var point = new ol.geom.Point(mappoint);

                    function createStyle(src) {
                        return new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.5, 0.96],
                                src: src
                            }),
                        });
                    }

                    var iconFeature = new ol.Feature(point);
                    iconFeature.set('style', createStyle(joPinPath));

                    var pointLayer = new ol.layer.Vector({
                        style: function (feature) {
                            return feature.get('style');
                        },
                        source: new ol.source.Vector({ features: [iconFeature] }),
                    });

                    localizeIt2PointOuter = pointLayer;
                    map.addLayer(pointLayer);

                    map.getView().fit(pointLayer.getSource().getExtent(), { maxZoom: 15, padding: [35, 35, 35, 35] });

                    // ol.proj.toLonLat(place)

                    var pagetype = '';
                    var ceid = '';
                    if (extbase_config.ce_uid) {
                        ceid = "&ceid=" + extbase_config.ce_uid;
                    }
                    if (extbase_config.pagetype > 0) {
                        pagetype = "&type=" + extbase_config.pagetype;
                    }
                    // var coords = ol.proj.transformExtent(curExtent, 'EPSG:3857', 'EPSG:4326');
                    var coords = ol.proj.toLonLat(mappoint);
                    var pageId = extbase_config.currentPageId;
                    var action = extbase_config.prefix + '%5Baction%5D=' + extbase_config.action;
                    var controller = extbase_config.prefix + '%5Bcontroller%5D=' + extbase_config.controller_name;
                    var lat = extbase_config.prefix + '%5Blat%5D=' + coords[1];
                    var lon = extbase_config.prefix + '%5Blon%5D=' + coords[0];
                    // var url = '/index.php?id=' + pageId + ceid + pagetype + '&' + action + '&' + controller + '&' + lat + '&' + lon;
                    var url = '?' + ceid + pagetype + '&' + action + '&' + controller + '&' + lat + '&' + lon;
                    // window.location.href = url;

                    if (extbase_config.pagetype > 0) {
                        $('#joAjaxloader').show();
                        $.get(url).done(function (data) {
                            $('.joPageTimeline').closest('.frame').html($(data)).promise().done(function () {
                                if (typeof initMapFuncIt == 'function') initMapFuncIt();
                                if (typeof fc_drp_init == 'function') fc_drp_init();
                                if (typeof initSlider == 'function') initSlider();
                            });
                            $('#joAjaxloader').hide();
                        });
                    } else {
                        window.location.href = url;
                    }
                };

                super({
                    element: element,
                    target: options.target,
                });
            }
        }

        map.addControl(new localizeIt2());
    }

    setTimeout(function () {
        if ($('.localizeMap_button, .boundingbox_button').length) {
            $('.localizeMap_button, .boundingbox_button').wrapAll('<div class="loc_bound_btn_wrapper" />');
        }
    }, 500);

    var parentEl;
    var childEl;
    var clusterID;
    /*
    $('.results .list_notable').hover(function() {
        var id = $(this).data('id');
        if(typeof id !== 'undefined' && id != '') {
            //var features = clusters[0].getSource().getFeatures();
            $.each(clusters, function(i, clu) {
                var tmpChild;
                var ready = false;
                $.each(clu.getSource().getFeatures(), function(i, val) {
                    $.each(val.get('features'), function(j, jval) {
                        if(id == jval.getId()) {
                            tmpChild = jval;
                            return false;                
                        }
                    });

                    if(tmpChild) {
                        parentEl = val;
                        childEl = tmpChild;
                        ready = true;
                        clusterID = clu.get('id');
                        return false;
                    }
                });
                if(ready) {
                    return false;
                }
            });
            var tmpPinPath = getPinPathById(clusterID, true);
            setIconStyles({radius: 25, radius2: 20, scale: 2.3, textOffset: -39, pinpath: tmpPinPath, fontcolor: 'blue'});
        }
    }, function() {
        var tmpPinPath = getPinPathById(clusterID, false);
        setIconStyles({radius: 15, radius2: 10, scale: 2, textOffset: -33, pinpath: tmpPinPath, fontcolor: '#aa3300'});
    });
    */

    function locatIt() {
        var _that = this;
        var $sl_item = $(_that).closest('.map-slide-item');
        var id = '';

        if ($sl_item.length) {
            id = $sl_item.data('id');
        } else {
            id = $(_that).closest('.list_notable').data('id');
        }

        if (typeof id !== 'undefined' && id != '') {
            var features = [];
            var was_found = false;

            if (clusters[0] && clusters[0].getVisible() == 0) {
                $.each(polyArr, function (i, clu) {
                    if (typeof clu.get('id') != 'undefined' && id == clu.get('id')) {
                        map.getView().fit(clu.getSource().getExtent(), { duration: 1000, maxZoom: 14, padding: [35, 35, 35, 35] });

                        if ($sl_item.length) {
                            $sl_item.removeClass('active');
                            $sl_item.parent().removeClass('active');
                        }

                        was_found = true;
                        return false;
                    }
                });
            }
            if (!was_found) {
                $.each(clusters, function (i, clu) {
                    var tmpChild;
                    var ready = false;
                    $.each(clu.getSource().getFeatures(), function (i, val) {
                        $.each(val.get('features'), function (j, jval) {
                            if (id == jval.getId()) {
                                tmpChild = jval;
                                return false;
                            }
                        });
                        if (tmpChild) {
                            parentEl = val;
                            childEl = tmpChild;
                            ready = true;
                            map.getView().fit(tmpChild.getGeometry().getExtent(), { duration: 1000, maxZoom: 14, padding: [35, 35, 35, 35] });
                            var tmpPinPath = getPinPathById(clu.get('id'), true);
                            if ($sl_item.length) {
                                $sl_item.removeClass('active');
                                $sl_item.parent().removeClass('active');
                            }
                            setTimeout(function () {
                                var features = [];
                                $.each(clusters, function (i, clu) {
                                    var tmpChild;
                                    var ready = false;
                                    $.each(clu.getSource().getFeatures(), function (i, val) {
                                        $.each(val.get('features'), function (j, jval) {
                                            if (id == jval.getId()) {
                                                tmpChild = jval;
                                                return false;
                                            }
                                        });
                                        if (tmpChild) {
                                            parentEl = val;
                                            childEl = tmpChild;
                                            ready = true;
                                            var tmpPinPath = getPinPathById(clu.get('id'), true);
                                            setIconStyles({ radius: 25, radius2: 20, scale: 2.3, textOffset: -39, pinpath: tmpPinPath, fontcolor: 'blue' });
                                            return false;
                                        }
                                    });
                                    if (ready) {
                                        return false;
                                    }
                                });
                            }, 1100);
                            return false;
                        }
                    });
                    if (ready) {
                        return false;
                    }
                });
            }
        } else {
            messageWriter('Bei Lokalisierung des Objektes ist ein Fehler aufgetreten.');
        }
    }

    $('#map-list .results .list_notable .locatePoint').click(locatIt);
    $('#map-list .map-slide-box').on('click', '.locatePoint', locatIt);

    var mapWorking = false;
    toggleMapIcons = function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (!mapWorking) {
            var loader = $('#joAjaxloader');
            loader.show();
            mapWorking = true;
            var that = $(this);
            var href = that.attr('href') ? that.attr('href') : that.data('href');
            $.get(href).done(function (data) {
                if (typeof data !== 'undefined') {
                    if (typeof data.geojson !== 'undefined') {
                        var newSource = new ol.source.Cluster({
                            distance: 0,
                            source: new ol.source.Vector({
                                features: (new ol.format.GeoJSON()).readFeatures(data.geojson.default, { featureProjection: 'EPSG:3857' })
                            })
                        });
                        clusters[0].setSource(newSource);
                    }

                    if (typeof data.geojsonRoute !== 'undefined' && data.geojsonRoute.coordinates) {
                        var newSource = new ol.source.Vector({
                            features: (new ol.format.GeoJSON()).readFeatures(data.geojsonRoute, { featureProjection: 'EPSG:3857' })
                        });
                        route.setSource(newSource);
                    } else {
                        route.setSource(new ol.source.Vector());
                    }

                    if (typeof data.geojsonRoute !== 'undefined' || typeof data.geojson !== 'undefined') {
                        if (that.parent().is('#delete_selected')) {
                            that.parent().hide();
                            $('.list_notable.inactive').removeClass('inactive');
                            $(".joCheck:checkbox:not(:checked)").each(function () {
                                checkboxCheck(this);
                            });
                        } else {
                            that.closest('.list_notable').toggleClass('inactive');
                        }
                    }

                    if (that.hasClass('joSwitch')) {
                        var checkbox = that.find('.joCheck');
                        if (checkbox.length) {
                            if (that.closest('.list_notable').hasClass('inactive')) {
                                checkboxUncheck(checkbox[0]);
                                if (that.hasClass('info-switcher')) {
                                    var otherCheckbox = $('#map-list .joCheck[data-id="' + checkbox.data('id') + '"]');
                                    otherCheckbox.closest('.list_notable').addClass('inactive');
                                    checkboxUncheck(otherCheckbox[0]);
                                }
                            } else {
                                checkboxCheck(checkbox[0]);
                                if (that.hasClass('info-switcher')) {
                                    var otherCheckbox = $('#map-list .joCheck[data-id="' + checkbox.data('id') + '"]');
                                    otherCheckbox.closest('.list_notable').removeClass('inactive');
                                    checkboxCheck(otherCheckbox[0]);
                                }
                            }
                        }
                    }

                    if ($('.list_notable.inactive').length) {
                        $('#delete_selected').show();
                    } else {
                        $('#delete_selected').hide();
                    }

                    if (data.routeInfo.length != $('#map-list .list_notable').length) {
                        var el = $('#map-list .list_notable:not(.inactive)');
                        $.each(el, function (key, val) {
                            if (data.routeInfo[key]) {
                                $(val).find('.joTime-zeit').html(data.routeInfo[key].time + " min");
                                $(val).find('.joTime-distanz').html(data.routeInfo[key].distance + " km");
                            }
                        });

                        var inactive = $('#map-list .list_notable.inactive');
                        inactive.find('.joTime-zeit').empty();
                        inactive.find('.joTime-distanz').empty();
                    }
                }

                mapWorking = false;
                loader.hide();
            }).fail(function (error) {
                loader.hide();
                messageWriter('Upps, etwas ging beim Laden der Daten schief. Bitte aktuallisieren Sie die Seite und versuchen Sie es nochmal.');
                mapWorking = false;
            });
        }
    }

    $('.toggleMapIcon').click(toggleMapIcons);
    $('.joMapMainContent').on('click', '.joSwitch', toggleMapIcons);

    checkboxUncheck = function (el) {
        el.checked = false;
        el.removeAttribute('checked');
    }

    checkboxCheck = function (el) {
        el.checked = true;
        el.setAttribute('checked', 'checked');
    }

    setIconStyles = function (data) {
        if (typeof parentEl !== 'undefined') {
            var size = parentEl.get('features').length;
            data.feature = parentEl;
            if (size > 1) {
                data.size = size;
                parentEl.setStyle(getIconStyleCircle(data));
            } else {
                parentEl.setStyle(getIconStyle(data));
            }
        }
    }

    additionalEffects();

    function listHover(event) {
        var isIn = event.type == 'mouseenter' || event.type == 'mouseover' ? true : false;

        $this = $(this);

        var id = $this.data('id');
        if (typeof id == 'undefined' || id == '') return false;

        var map_layers = map.getLayers().getArray();

        map_layers.forEach(function (v, i) {
            var l_id = '';
            if (v.get('id') && typeof v.get('id') != 'undefined') {
                l_id = v.get('id');
            } else {
                return;
            }

            if ('Polygonlayer' == l_id) {
                var features = v.getSource().getFeatures();

                if (features.length == 0) return;

                features.forEach(function (fv, fi) {
                    // if (typeof fv.get('d') != 'undefined' && fv.get('d') == null) return;

                    if (fv.get('id') && typeof fv.get('id') != 'undefined') {
                        var fv_id = fv.get('id');

                        if (fv_id == id) {
                            if (isIn) {
                                fv.set('hover', 'y');
                            } else {
                                fv.set('hover', 'n');
                            }
                        } else {
                            fv.set('hover', 'n');
                        }
                    }
                });
                return;
            }
        });

        if (isIn) {
            $this.parent().addClass('hover');
        } else {
            $this.parent().removeClass('hover');
        }
    }

    $('#map-list .list_notable .map-item-header').hover(listHover, listHover);

    $('#map-tab').click(function () {
        setTimeout(function () {
            map.updateSize();
            if (route || clusters) {
                if (typeof extbase_config != 'undefined' && extbase_config.mapconfig && extbase_config.mapconfig.showselection == 1) {
                    map.getView().fit(boxvector.getSource().getExtent(), { size: map.getSize(), padding: [35, 35, 35, 35] });
                } else {
                    var tmpLayer = route ? route : clusters[0];

                    if (typeof tmpLayer != 'undefined') {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].get('active') == 'active') {
                                tmpLayer = layers[i];
                                break;
                            }
                        }

                        var counter = 0;
                        var interval = setInterval(function () {
                            var arr = tmpLayer.getSource().getExtent();
                            if (!joInArray('Infinity', arr) && !joInArray('-Infinity', arr)) {
                                map.getView().fit(tmpLayer.getSource().getExtent(), { size: map.getSize(), padding: [35, 35, 35, 35] });
                                clearInterval(interval);
                            }
                            if (counter == 50) {
                                clearInterval(interval);
                            }
                            counter++;
                        }, 100);
                        setTimeout(function () {
                            var counter = 0;
                            var interval = setInterval(function () {
                                var arr = tmpLayer.getSource().getExtent();
                                if (!joInArray('Infinity', arr) && !joInArray('-Infinity', arr)) {
                                    map.getView().fit(tmpLayer.getSource().getExtent(), { size: map.getSize(), padding: [35, 35, 35, 35] });
                                    clearInterval(interval);
                                }
                                if (counter == 50) {
                                    clearInterval(interval);
                                }
                                counter++;
                            }, 100);
                        }, 300);
                    }
                }
            }
        }, 300);
    });
}

var getPinPathById = function (id, hover) {
    if (joMapSettings) {
        var tmppin = hover ? joMapSettings.jodefault.hoverPin : joMapSettings.jodefault.pin;
        $.each(joMapSettings, function (i, val) {
            if (i === id) {
                tmppin = hover ? val.hoverPin : val.pin;
            }
        });
        return tmppin;
    }
};

var joInArray = function (val, arr) {
    if ($.isArray(arr)) {
        for (var i = 1; i < arr.length; i++) {
            if (val == arr[i]) {
                return true;
            }
        }
    }
    return false;
};

var getInput = function (layer, id) {
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    input.id = id;
    input.onchange = function (e) {
        layer.setVisible(e.target.checked);
    };
    return input;
};

var additionalEffects = function () {
    $('#map-jo-icon').click(function () {
        $('#map-list').toggleClass('active');
        $('#ol4-map-container').toggleClass('active');
        $('#joMaps-container').removeClass('show');
    });

    /*
    $('#map-list .list_notable .map-item-header').click(function(e) {
        var parent = $(e.currentTarget).parent();
        if(!parent.hasClass('slider')) {
            if(parent.find('.img').is(':hidden')) {
                $('#map-list .joScrollWrap').animate({
                    scrollTop: $(parent).position().top + $('.joTop').outerHeight() + $('.joScrollWrap').position().top - $(e.currentTarget).outerHeight() + $('#map-list .joScrollWrap .joTimeLineAndFilter .facettes.container').outerHeight() + $('#map-list .joScrollWrap .akt_filter').outerHeight() + $('#map-list .joFound.joFix').outerHeight()
                }, 500);
            }
            parent.find('.joTime-container').toggle();
            parent.find('.img').toggle();
            parent.find('.txt').toggle();
        }
    });
    */

    $('#map-list .list_notable .map-item-header').click(function (e) {
        $this = $(this);
        var id = $this.data('id');
        if (typeof id == 'undefined' || id == '') return false;

        var $con = $('.map-slide-box');
        if (!$con.length) return false;

        // fix backslash in ids
        id = String(id).replaceAll('/', '\\/');

        $item = $con.find('div[data-id="' + id + '"]');
        $con.find('.map-slide-item.active').not($item).removeClass('active');
        $this.closest('.joListNotableContainer').find('.list_notable.active').removeClass('active');


        var mobile = ($('#mobile-hidden').is(':visible')) ? false : true;
        if (mobile) {
            $('#map-jo-icon').trigger('click');
            $('#joInfo-content').html($item.clone().attr('class', 'results map_view'));
            $('#joMaps-container').addClass('show');
        } else {
            if ($item.length) {
                if ($item.hasClass('active')) {
                    $con.removeClass('active');
                    $item.removeClass('active');
                    $this.parent().removeClass('active');
                } else {
                    $con.addClass('active');
                    $item.addClass('active');
                    $this.parent().addClass('active');
                }
            } else {
                $con.removeClass('active');
                $this.parent().removeClass('active');
            }
        }

    });

    $('.map-slide-box').on('click', '.map-slide-item .close', function () {
        $that = $(this);
        $that.parent().removeClass('active').parent().removeClass('active');
        $('.joListNotableContainer .list_notable.active').removeClass('active');
    });
}

var messageWriter = function (message) {
    var container = $('.typo3-messages');
    if (container.length) {
        container.remove();
    }

    container = '<ul class="typo3-messages"><li class="alert alert-success"><p class="alert-message">' + message + '</p></li></ul>';
    $('#ol4-map-container').append(container);
}
