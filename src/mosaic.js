angular.module('mosaic', [])
		.controller('MosaicController', function($scope, $interval, MosaicService) {
			
			$scope.sorts = [
				{ order: "original-order", text: "No Order" },
				{ order: ".status", text: "Status" },
				{ order: ".name", text: "Name" }
			];

			$interval(fetchData, 30000);
			fetchData();

			function fetchData() {
				MosaicService.get('http://sensu.priv.future.net.uk/get_sensu').then(function(sensu) {
					$scope.clients = sensu.clients;
					$scope.tags = sensu.tags;
					$scope.last_update = new Date();
				});
			}
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
							angular.forEach(client.tags, function(tag) {
								tagjoin += " "+tag;
							});

							clients.push({events: events, name: client.name, size: size, tags: client.tags, tagjoin: tagjoin, status: client.status});
						});

						return {
							clients: clients,
							tags: remove_dups(tags)
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