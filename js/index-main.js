		//URLパラメータ取得

		var urlParameter = new Object;
		var pair = location.search.substring(1).split('&');
		for (var i = 0; pair[i]; i++) {
			var parameter = pair[i].split('=');
			urlParameter[parameter[0]] = parameter[1];
		}

		//オーバレイ用グローバル変数

		var openStreetMap = {};
		var overlayDataArray = [];

		//KML,CZMLファイル指定

		var tuvaluStarKml = 'data/star.kml';
		var tuvaluTestimonyCzml = 'data/testimonies.czml';
		var tuvaluLineCzml = 'data/line.czml';
		var tuvaluTestimonyJson = 'data/testimonies.json';
		var tuvaluLineJson = 'data/line.json';

		//機種判別，画面サイズによる画面レイアウト変更

		var mobile = 0;
		var smallScreen = 0;

		var getDevice = (function () {
			var ua = navigator.userAgent;
			if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf(
					'Mobile') > 0) {
				mobile = 1;
			} else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
				mobile = 2;
			} else {
				mobile = 0;
			}
		})();

		var screenWidth = window.parent.screen.width;
		if (screenWidth <= 640) {
			smallScreen = 1;
		} else {
			smallScreen = 0;
		}

		if (smallScreen == 0) {
			$(function () {
				$('#timeCounter').css('bottom', '16px');
				$('#timeCounter').css('font-size', '22px');
				$('#timeCounter').css('line-height', '22px');
			});
		}

		$(window).on('resize', function () {
			setTimeout('widgetsInit()', 100);
		});

		//画面サイズ調整

		if (mobile != 1) {
			setTimeout('resizeWindow()', 0);
		} else {
			$('.titleImage').css('width', '100%');
			setTimeout('resizeWindow()', 1000);
		}

		function resizeWindow() {
			if (mobile != 0) {
				var screenWidth = window.innerWidth;
				var screenHeight = window.innerHeight;
				$(function () {
					document.body.style.height = screenHeight;
					$('#cesiumContainer').height(screenHeight);
					$('#blackOut').height(screenHeight);
				});
			}
			setTimeout('loadCesium()', 100);
		}

		//ローディングDIV

		var blackOutDiv = document.getElementById("blackOut");

		function blackOut(param) {
			if (param == 0) {
				$(function () {
					$(blackOutDiv).fadeOut("slow");
				});
			} else {
				$(function () {
					$(blackOutDiv).fadeIn("slow");
				});
			}
		}

		//視点配列生成

		function viewPoints(_label, _lat, _lng, _heading, _pitch, _range) {
			this.label = _label;
			this.lat = _lat;
			this.lng = _lng;
			this.heading = _heading;
			this.pitch = _pitch;
			this.range = _range;
		}

		var viewPointsArray = [];
		viewPointsArray[0] = new viewPoints("Vaitupu", -7.476733, 178.679767, 0, -25, 7200);
		viewPointsArray[1] = new viewPoints("Nukulaelae", -9.387985, 179.845492, 0, -15, 9500);
		viewPointsArray[2] = new viewPoints("Tuvalu", -7.508104, 178.024189, 0, -89, 1000000);
		viewPointsArray[3] = new viewPoints("Earth", -7.508104, 178.024189, 0, -89, 8000000);

		var viewPointChangeMenu = document.getElementById('slide_menu');
		var dropDownList = "";

		for (var i = 0; i < viewPointsArray.length; i++) {
			dropDownList = dropDownList + '<li><a href="#" onclick = "changeViewPoint(' + i + ',' + '4.0);return false;">' +
				viewPointsArray[i].label + '</a></li>';
		}

		var viewPointChangeMenuHtml = '<ul class="viewpoint">' + dropDownList + '</ul>';
		viewPointChangeMenu.innerHTML = viewPointChangeMenuHtml;

		//ビューア初期化

		var viewer;
		var scene;
		var ellipsoid;

		function loadCesium() {
			Cesium.Ion.defaultAccessToken =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZjdkOGRkYi1hYzIxLTQ4MDMtYjZiMC0zODg5YjI2ZTRlZjIiLCJpZCI6MjgyLCJzY29wZXMiOlsiYXNsIiwiYXNyIiwiYXN3IiwiZ2MiXSwiaWF0IjoxNTYyMDEyNTIyfQ.aVsGtowVeK_5C25G5-WCK7bZHyfXUl_zQ5Ud7TKsq0U';
			viewer = new Cesium.Viewer('cesiumContainer', {
				infoBox: false,
				selectionIndicator: false,
				terrain: Cesium.Terrain.fromWorldTerrain({
					requestVertexNormals: false,
					requestWaterMask: false
				}),
				navigationHelpButton: false,
				navigationInstructionsInitiallyVisible: false,
				geocoder: false,
				sceneModePicker: false,
				baseLayerPicker: false,
				timeline: false,
				animation: false,
				scene3DOnly: true,
				requestRenderMode: true,
				maximumRenderTimeChange: Infinity
			});

				scene = viewer.scene;
				ellipsoid = scene.globe.ellipsoid;
				viewer.scene.postRender.addEventListener(updateOriginalInfoBoxPosition);

			//ダブルクリック操作を不可に

			viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

				//ビルボード準備

				billboards = scene.primitives.add(new Cesium.BillboardCollection());
				selectionBillboards = scene.primitives.add(new Cesium.BillboardCollection());
				scaleByDistance = new Cesium.NearFarScalar(1.5e3, 2.0, 1.5e4, 0.5);

			//devicePixelRatioの設定
			/*
			if(Cesium.FeatureDetection.supportsImageRenderingPixelated()){
				viewer.resolutionScale = window.devicePixelRatio;
			}
			*/
			//フォグ
			/*
			var fog = new Cesium.Fog();
			fog.density = 0.003;
			fog.screenSpaceErrorFactor = 100.0;
			*/
			//起動シークエンス

			$(function () {
				//			$('.cesium-viewer-animationContainer').fadeOut(0);
				//			$('.cesium-viewer-timelineContainer').fadeOut(0);
				$('#button').fadeOut(0);
				$('#button2').fadeOut(0);
				$('#button3').fadeOut(0);
				$('#buttonGeo').fadeOut(0);
				//$('.sharebutton').fadeOut(0);
					$('#originalInfoBox').hide();
				});

			blackOut(0);
			loadKml(tuvaluStarKml);
		}

			function groundZero() {
				changeViewPoint(2, 3);
				if (mobile == 0) {
					setTimeout('landing()', 4000);
				} else {
					setTimeout('landing()', 4000);
				}
			}

		function landing() {
			if (urlParameter.location) {
				changeViewPoint([urlParameter.location], 3);
			} else {
				changeViewPoint(1, 3);
			}
			setTimeout('blackOut(1)', 3000);
			//			setTimeout('loadJsonTestimony(tuvaluTestimonyJson)',3000);
			setTimeout('loadJsonLine(tuvaluLineJson)', 3000);
		}

		//KMLとCZMLのロード

		function loadKml(url) {
			var promise = Cesium.KmlDataSource.load(url);
			promise.then(function (dataSource) {
				viewer.dataSources.add(dataSource);
				setTimeout('groundZero()', 1000);
			}).catch(function (error) {
				alert('Cannot Load KML Data');
			});
		}

		function loadCzml(url) {
			var promise = Cesium.CzmlDataSource.load(url);
			promise.then(function (dataSource) {
				viewer.dataSources.add(dataSource);
			}).catch(function (error) {
				alert('Cannot Load CZML Data');
			});
		}

		//顔アイコン追加

			var billboards;
			var selectionBillboards;
			var positionsCartesian3;
			var scaleByDistance;
			var handler;
			var infoWindowPosition;
			var infoBoxConnector = document.getElementById('originalInfoBoxConnector');

			function hideOriginalInfoBox() {
				infoWindowPosition = null;
				$('#originalInfoBox').hide();
				infoBoxConnector.style.display = 'none';
			}

			function updateOriginalInfoBoxConnector(anchorPosition, infoBox) {
				var anchorX = Number(anchorPosition.x);
				var anchorY = Number(anchorPosition.y);
				if (!isFinite(anchorX) || !isFinite(anchorY)) {
					infoBoxConnector.style.display = 'none';
					return;
				}
				var rect = infoBox.getBoundingClientRect();
				var targetX = Math.max(rect.left, Math.min(anchorX, rect.right));
				var targetY = Math.max(rect.top, Math.min(anchorY, rect.bottom));
				var dx = targetX - anchorX;
				var dy = targetY - anchorY;
				var length = Math.sqrt(dx * dx + dy * dy);

				if (!isFinite(length) || length <= 0) {
					infoBoxConnector.style.display = 'none';
					return;
				}

				infoBoxConnector.style.width = length + 'px';
				infoBoxConnector.style.left = anchorX + 'px';
				infoBoxConnector.style.top = anchorY + 'px';
				infoBoxConnector.style.transform = 'rotate(' + Math.atan2(dy, dx) + 'rad)';
				infoBoxConnector.style.display = 'block';
			}

			function updateOriginalInfoBoxPosition() {
				if (!infoWindowPosition) {
					return;
				}
				var canvasPosition = Cesium.SceneTransforms.worldToWindowCoordinates(scene, infoWindowPosition);
				if (!Cesium.defined(canvasPosition)) {
					$('#originalInfoBox').hide();
					infoBoxConnector.style.display = 'none';
					return;
				}
				var infoBox = document.getElementById('originalInfoBox');
				var margin = 8;
				var gapX = 18;
				var gapY = 24;
				var maxLeft = window.innerWidth - infoBox.offsetWidth - margin;
				var maxTop = window.innerHeight - infoBox.offsetHeight - margin;
				var preferredLeft = canvasPosition.x + gapX;
				var fallbackLeft = canvasPosition.x - infoBox.offsetWidth - gapX;
				var preferredTop = canvasPosition.y - infoBox.offsetHeight - gapY;
				var fallbackTop = canvasPosition.y + gapY;
				var left;
				var top;

				if (preferredLeft <= maxLeft) {
					left = preferredLeft;
				} else if (fallbackLeft >= margin) {
					left = fallbackLeft;
				} else {
					left = Math.max(margin, Math.min(preferredLeft, maxLeft));
				}

				if (preferredTop >= margin) {
					top = preferredTop;
				} else if (fallbackTop <= maxTop) {
					top = fallbackTop;
				} else {
					top = Math.max(margin, Math.min(fallbackTop, maxTop));
				}

				infoBox.style.left = left + 'px';
				infoBox.style.top = top + 'px';
				updateOriginalInfoBoxConnector(canvasPosition, infoBox);
			}

			function showOriginalInfoBox(position, html) {
				infoWindowPosition = position;
				$('#originalInfoBox').html(html).show();
				updateOriginalInfoBoxPosition();
			}

		function loadJsonTestimony(fileName) {
			var jsonFile = fileName;
			handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

			$.getJSON(jsonFile, function (json) {
				for (var i in json) {
					var id = json[i].id;
					var name = json[i].name;
					var iconUrl = json[i].billboard.image;
					var positions = json[i].position.cartographicDegrees;
					positionsCartesian3 = Cesium.Cartesian3.fromDegreesArrayHeights(positions)[0];

					var billboardsAdd = billboards.add({
						id: id,
						position: positionsCartesian3,
						image: iconUrl,
						scaleByDistance: scaleByDistance,
						verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
						scale: 1.1
					});
					billboardsAdd.name = name;
					/*
										var polylinesAdd = polylines.add({
											id: id,
											positions : polylinePositionsCartesian3,
											width:1,
										});
										polylinesAdd.name = name;
										polylinesAdd.material.uniforms.color.alpha = 0.1;
										*/
				}
			});
			delete jsonFile;
				handler.setInputAction(
					function (movement) {
						var element = scene.pick(movement.position);
							if (element) {
								if (!(element.id && element.id.name === 'line') && element.primitive && element.primitive.position) {
									selectionBillboards.removeAll();
									selectionBillboards.add({
										position: element.primitive.position,
										image: 'data/select.png',
										pixelOffset: new Cesium.Cartesian2(0, -60),
										pixelOffsetScaleByDistance: new Cesium.NearFarScalar(2.0e3, 1, 2.0e5, 0.0),
										horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
										verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
										scale: 0.5,
										color: Cesium.Color.RED
									});

								var safeName = $('<div>').text(element.primitive.name || '').html();
								var safeId = encodeURIComponent(String(element.primitive.id || ''));
								var iframeHtml = '<p class="nameAndAge">' + safeName +
									'</p><div class="infoBox"><iframe scrolling="no" frameborder="no" sandbox="allow-same-origin allow-top-navigation allow-forms allow-scripts" class="infoBox" src="https://linemap.archiving.jp/doc4iframe.php?id=' +
									safeId + '"></iframe></div>';
								showOriginalInfoBox(element.primitive.position, iframeHtml);
								} else {
									selectionBillboards.removeAll();
									hideOriginalInfoBox();
								}
							} else {
								selectionBillboards.removeAll();
								hideOriginalInfoBox();
							}
					},
				Cesium.ScreenSpaceEventType.LEFT_CLICK);
			setTimeout('blackOut(0)', 3000);
			setTimeout('widgetsInit()', 3000);
			//			loadCzml(tuvaluLineCzml);
			//			timeSet();
			//			viewer.clock.onTick.addEventListener(function(clock){
			//			checkTime();
			//			});
		}

		// ライン追加

		function loadJsonLine(fileName) {
			var jsonFile = fileName;
			$.getJSON(jsonFile, function (json) {
				for (var i in json) {
					var positions = json[i].polyline.positions.cartographicDegrees;
					var description = json[i].description;
					var lineColor = Cesium.Color.fromBytes(48, 48, 255, 32);
					var positionsCartesian3 = Cesium.Cartesian3.fromDegreesArrayHeights(positions);
					viewer.entities.add({
						name: 'line',
						description: description,
						polyline: {
							positions: positionsCartesian3,
							width: 2,
							material: lineColor,
						}
					});
				}
			});
			delete jsonFile;
			loadJsonTestimony(tuvaluTestimonyJson);
		}

		//時間セット
		/*
				var endISO = '2015-11-10T00:00:00+09:00';
				var startISO = '1931-06-30T00:00:00+09:00';
				var stopISO = '2014-01-01T00:00:00+09:00';

				function timeSet(){
					clock = new Cesium.Clock({
						startTime : Cesium.JulianDate.fromIso8601(startISO),
						currentTime : Cesium.JulianDate.fromIso8601(startISO),
						stopTime : Cesium.JulianDate.fromIso8601(endISO),
						clockRange : Cesium.ClockRange.LOOP_STOP
					});
					viewer.clock.startTime = clock.startTime;
					viewer.clock.stopTime = clock.stopTime;
					viewer.clock.currentTime = clock.currentTime;
					viewer.clock.multiplier = 10 * 60 * 60 * 10000;
					viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);
					viewer.clock.clockRange = clock.clockRange;
					widgetsInit();
				}

		//タイムカウンター表示

				function checkTime(){

					var now = viewer.clock.currentTime;
					var stop = Cesium.JulianDate.fromIso8601(stopISO);
					var nowAndCurrent = Cesium.JulianDate.compare(now, stop);
					if (nowAndCurrent > 0){
						viewer.clock.shouldAnimate = false;
					}

					var nowDate = Cesium.JulianDate.toDate(now);
					var y = nowDate.getFullYear();
					var displayTime = y;
					timeCounter(displayTime);
				}

				function timeCounter(displayTime){
					var timeCounter = document.getElementById("timeCounter");
					timeCounter.innerHTML = '<p>' + displayTime +'</p>';
				}
				*/
		//視点変更関数

		function changeViewPoint(num, delay) {
			var newLat = viewPointsArray[num].lat;
			var newLng = viewPointsArray[num].lng;
			var newHeading = Cesium.Math.toRadians(viewPointsArray[num].heading);
			var newPitch = Cesium.Math.toRadians(viewPointsArray[num].pitch);
			var newRange = viewPointsArray[num].range;

			var center = Cesium.Cartesian3.fromDegrees(newLng, newLat);
			var boundingSphere = new Cesium.BoundingSphere(center, newRange);
			var headingPitchRange = new Cesium.HeadingPitchRange(newHeading, newPitch, newRange);

			viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
			viewer.camera.flyToBoundingSphere(boundingSphere, {
				duration: delay,
				offset: headingPitchRange,
				easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
			});
		}

		//ジオコード関数

		function geocode() {
			var geocoder = new google.maps.Geocoder();
			var input = document.getElementById('inputtext').value;
			geocoder.geocode({
					address: input
				},

				function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						var viewportObj = results[0].geometry.viewport;
						var southNorth = viewportObj[Object.keys(viewportObj)[0]];
						var westEast = viewportObj[Object.keys(viewportObj)[1]];

						var south = southNorth[Object.keys(southNorth)[0]];
						var north = southNorth[Object.keys(southNorth)[1]];
						var west = westEast[Object.keys(westEast)[0]];
						var east = westEast[Object.keys(westEast)[1]];
						var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);
						viewer.camera.flyTo({
							destination: rectangle,
							easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
						});
					} else {
						alert('Not Found');
					}
				}
			);
		}

		//現在地に移動する関数

		function flyToMyLocation() {
			function fly(position) {
				viewer.camera.flyTo({
					destination: Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude,
						5000.0),
					easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
				});
			}
			navigator.geolocation.getCurrentPosition(fly);
		}

		//写真

		function photographs() {
			location.href = 'photographs.html';
		}

		//ヘルプ

		function help() {
			window.open('https://tv.mapping.jp/');
		}

		//線をクリックした時はinfoBoxを非表示にする
		/*
				var scene = viewer.scene;
				handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
				handler.setInputAction(
					function(movement){
						var childNodesLength = 0;
						var element = scene.pick(movement.position);
						if (element) {
							setTimeout(function(){
								var iframeContents = $('iframe:first').contents().find('.cesium-infoBox-description');
								var childNodesLength = iframeContents[0].childNodes.length;
								if (childNodesLength == 0){
									$(function(){
										$('.cesium-infoBox-visible').hide();
									});
									viewer.selectedEntity = undefined;
								} else {
									$(function(){
										$('.cesium-infoBox-visible').show();
									});
								}
							},1);
						}
					},
				Cesium.ScreenSpaceEventType.LEFT_CLICK);
		*/
		//ボタン群のイニシャライズ関数

		function widgetsInit() {
			$(function () {
				//				$('.cesium-viewer-timelineContainer').css('left', '0px');
				//				$('.cesium-viewer-timelineContainer').fadeIn("slow");
				$('#button').fadeIn("slow");
				$('#button2').fadeIn("slow");
				$('#button3').fadeIn("slow");
				$('#buttonGeo').fadeIn("slow");
				/*
				if (mobile != 1){
					$('.sharebutton').fadeIn("slow");
				}
				*/
			});
		}
