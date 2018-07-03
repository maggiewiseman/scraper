//start with element list

function IsotopeGrabber() {
  var elementString = "hydrogen|helium|lithium|Beryllium|Boron|Carbon|nitrogen|Nitrogen|oxygen|fluorine|neon|sodium|magnesium|aluminium|silicon|phosphorus|sulfur|chlorine|argon|potassium|calcium|scandium|titanium|vanadium|chromium|manganese|iron|cobalt|nickel|copper|zinc|gallium|germanium|arsenic|selenium|bromine|krypton|rubidium|strontium|yttrium|zirconium|niobium|molybdenum|technetium|ruthenium|rhodium|Palladium|silver|Cadmium|indium|tin|antimony|tellurium|iodine|xenon|Caesium|Barium|lanthanum|cerium|praseodymium|neodymium|promethium|samarium|europium|gadolinium|terbium|dysprosium|holmium|erbium|thulium|ytterbium|lutetium|hafnium|tantalum|tungsten|rhenium|osmium|iridium|platinum|gold|mercury|thallium|lead|Bismuth|polonium|astatine|radon|francium|radium|actinium|thorium|protactinium|uranium|neptunium|Plutonium|plutonium|americium|curium|Berkelium|Californium|einsteinium|fermium|mendelevium|nobelium|dubnium|seaborgium|Bohrium|rutherfordium|hassium|meitnerium|darmstadtium|copernicium|nihonium|flerovium|oganesson"

  var elementArr = elementString.split('|');

  this.go = function() {
    //looop through the element array.
    elementArr.forEach(element => {
      //create the url, call Json and give callback
      let url = `http://en.wikipedia.org/w/api.php?action=parse&page=Isotopes_of_${element.toLowerCase()}&prop=text&format=json&callback=?`
      getJson(url, makeHtml, element);
    });
  }

  function getJson(url, callback, elementName) {
    $.getJSON(url, function(json) {
        console.log(elementName);
        callback(json.parse.text["*"], elementName);
    });
  }


  function makeHtml(wikiHtml, elementName) {
    $('#elementData').append(`<div class=${elementName}>${wikiHtml}</div>`);
    console.log()
    parseIsotopeData(elementName);

  }

  function parseIsotopeData(elementName) {
    console.log(elementName);
  }
  //add the data to an array of arrays
}

var isotopeGrabber  = new IsotopeGrabber();
