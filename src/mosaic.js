angular.module('mosaic', [])
		.config(function($locationProvider) {
			$locationProvider.html5Mode({enabled: true, requireBase: false});
		})
		.controller('MosaicController', function($scope, $interval, $location, MosaicService) {

			$scope.mosaic = {
				sorts: [
					{order: "original-order", text: "No Order"},
					{name: "status", order: ".status", text: "Status", asc: false},
					{name: "name", order: ".name", text: "Name", asc: true}
				],
				data: {
					sort: null,
					clients: [],
					filters: {}
				},
				filters: {
					'status': [
						{filter: '', text: 'Any'},
						{filter: '.status-1', text: 'Ok'},
						{filter: ':not(.status-1)', text: 'Not-Ok'},
						{filter: '.status-2', text: 'Warning'},
						{filter: '.status-3', text: 'Critical'},
						{filter: '.status-4', text: 'Unknown'}
					]
				},
				tags: {}
			};

			$interval(fetchData, 10000);
			fetchData();

			$scope.$watch('mosaic.tags', function(newValue) {
				angular.forEach(newValue, function(filter, name) {
					if (!$scope.mosaic.data.filters[name]) {
						$scope.mosaic.data.filters[name] = filter[0];
					}
				});
			}, true);

			function fetchData() {
				MosaicService.get($location.search().url || 'data/sensu.test.json').then(function(sensu) {
					$scope.mosaic.data.clients = sensu.clients;
					$scope.mosaic.tags = sensu.tags;
					$scope.mosaic.last_update = new Date();
				});
			}
		})
		// @TODO maybe divide into more directives and join
		.directive('mosaicIsotope', function($timeout) {
			return {
				templateUrl: 'boxtemplate.html',
				scope: {
					mosaic: '=mosaic'
				},
				link: function(scope, element, attrs) {
					var options = {
						itemSelector: '.item',
						layoutMode: 'masonry',
						getSortData: {},
						sortAscending: {}
					};

					angular.forEach(scope.mosaic.sorts, function(sort) {
						if (sort.order !== "original-order") {
							options.getSortData[sort.name] = sort.order;
							options.sortAscending[sort.name] = sort.asc;
						}
					});

					scope.el = element.find('.mosaic-grid');
					scope.el.isotope(options);
					scope.mosaic.sorts = scope.mosaic.sorts || [{order: "original-order", text: "No Order"}];
					scope.mosaic.data.sort = scope.mosaic.sorts[0];

					angular.forEach(scope.mosaic.filters, function(filter, name) {
						if (!scope.mosaic.data.filters[name]) {
							scope.mosaic.data.filters[name] = filter[0];
						}
					});

					scope.$watch('mosaic.data.clients', function() {
						$timeout(function() {
							console.log("what is wrong")
							scope.el.isotope('reloadItems');
						});
					}, true);


					scope.$watch('mosaic.data.sort', function(value) {
						$timeout(function() {
							console.log("2what is wrong")
							scope.el.isotope({sortBy: value.name});
						});
					}, true);

					scope.$watch('mosaic.data.filters', function(value) {
						$timeout(function() {
							console.log(extract_filters(value))
							scope.el.isotope({filter: extract_filters(value), itemSelector: '.item',});
						});
					}, true);
					
					 function extract_filters(filters) {
						var filter_string = "";

						angular.forEach(filters, function(value, key) {
							if (value.filter) {
								filter_string += value.filter;
							}
						});

						return filter_string;
					}
				}
			};
		})
		.service('MosaicService', function($http, $q) {
			return {
				get: function(url) {
					return $http({
						method: "get",
						url: url
					}).then(function(response) {
						var clients = [];
						var tags = {};

						angular.forEach(response.data.Clients, function(client, i) {

							var size = client.status + 1;
							tags = merge_tags(tags, client.tags);

							var events = [];
							if (client.status > 0) {
								events = response.data.Events.filter(function(n) {
									// Only return checks for this client, that are handled
									return (n.client.name === client.name && n.check.handle !== false);
								});
								// If there are no handled events, the server is actually ok in disguises
								if (events.length === 0) {
									size = 1;
								}
							}

							var tagjoin = "";
							angular.forEach(client.tags, function(tag, key) {
								tagjoin += " " + key + "_" + tag;
							});

							clients.push({events: events, name: client.name, size: size, tags: client.tags, tagjoin: tagjoin, status: client.status});
						});

						var tags = remove_dups(tags);
						var final_tags = {};
						angular.forEach(tags, function(group, name) {
							final_tags[name] = group.map(function(val) {
								return {filter: '.' + name + '_' + val, text: val};
							});

							final_tags[name].unshift({filter: '', text: 'Any'})
						});

						return {
							clients: clients,
							tags: final_tags
						};

					}, function(response) {
						$q.reject("An unknown error occurred.");
					});
				}
			};


			function merge_tags() {
				var args = Array.prototype.slice.call(arguments);
				var result = {};

				args.forEach(function(obj) {
					obj && Object.keys(obj).forEach(
							function(key) {
								if (obj[key]) {
									var val = obj[key].split ? obj[key].split(/\s+/) : (obj[key] instanceof Array ? obj[key] : [obj[key]]);
									result[key] instanceof Array ? Array.prototype.push.apply(result[key], val) : result[key] = val;
								}
							}
					);
				});

				return result;

			}

			function remove_dups(arr) {
				// assuming that tags are always strings this should be fast and accurate
				Object.keys(arr).forEach(
						function(key) {
							var seen = {};
							arr[key] = arr[key].filter(function(item) {
								return seen.hasOwnProperty(item) ? false : (seen[item] = true);
							}).sort();
						}
				);

				return arr;
			}
		});