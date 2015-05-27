var mergetags = function() {
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
};

var removedups = function(arr) {
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
};