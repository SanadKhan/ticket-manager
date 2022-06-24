const hbs = require('hbs')
var paginate = require('handlebars-paginate');

hbs.registerHelper('paginate', paginate);

hbs.registerHelper('select', function(selected, options) {
    return options.fn(this).replace(
        new RegExp(' value=\"' + selected + '\"'),
        '$& selected="selected"');
});

hbs.registerHelper('descp_slice', str => {
    const strFirst =  str.slice(0, 60);
    return strFirst;
})

hbs.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

hbs.registerHelper('serialNo', function (options) {
  var currentSerialNo = options.data.root['serialNo'];
  // console.log("############Current serial No is:"+currentSerialNo);
  if (currentSerialNo === undefined) {
    currentSerialNo = 1;  
  } else {
    currentSerialNo++;
  }

  options.data.root['serialNo'] = currentSerialNo;
  return currentSerialNo;
});