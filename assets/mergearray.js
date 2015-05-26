var mergetags = function(a,b){
    // result object
    var result = {};
    
    // tokenize
    for (var name in a) {
        result[name] = tokenize(a[name]);
    }
    
    for (var name in b) {
        if (result[name]) {
            result[name].push.apply(result[name], tokenize(b[name]));
        } else {
            result[name] = tokenize(b[name]);
        }
    }
    
    for (var name in result) {
        result[name] = result[name].filter(function (value, index, self) {
             return self.indexOf(value) === index;
        });
    }
    
    return result;
};

var tokenize = function (val) {
    if (val instanceof Array ){
        return val;
    }
    return (val+'').split(/\s+/);
};

function toArray(_Object){
       var _Array = new Array();
       for(var name in _Object){
               _Array[name] = _Object[name];
       }
       return _Array;
};