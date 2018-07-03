//start with element list

function IsotopeGrabber() {
  var isotopeArray = [["elementName", "atomicNumber", "neutrons", "mass", "halfLife", "massNumber", "isotopeName"]];
  var counter = 0;
  var elementString = "hydrogen|helium|lithium|Beryllium|Boron|Carbon|nitrogen|Nitrogen|oxygen|fluorine|neon|sodium|magnesium|aluminium|silicon|phosphorus|sulfur|chlorine|argon|potassium|calcium|scandium|titanium|vanadium|chromium|manganese|iron|cobalt|nickel|copper|zinc|gallium|germanium|arsenic|selenium|bromine|krypton|rubidium|strontium|yttrium|zirconium|niobium|molybdenum|technetium|ruthenium|rhodium|Palladium|silver|Cadmium|indium|tin|antimony|tellurium|iodine|xenon|Caesium|Barium|lanthanum|cerium|praseodymium|neodymium|promethium|samarium|europium|gadolinium|terbium|dysprosium|holmium|erbium|thulium|ytterbium|lutetium|hafnium|tantalum|tungsten|rhenium|osmium|iridium|platinum|gold|mercury|thallium|lead|Bismuth|polonium|astatine|radon|francium|radium|actinium|thorium|protactinium|uranium|neptunium|Plutonium|plutonium|americium|curium|Berkelium|Californium|einsteinium|fermium|mendelevium|nobelium|dubnium|seaborgium|Bohrium|rutherfordium|hassium|meitnerium|darmstadtium|copernicium|nihonium|flerovium|oganesson";

  var elementArr = elementString.split('|');
  //var elementArr = ['boron', 'helium'];

  this.go = function() {
    //looop through the element array.
    elementArr.forEach(element => {
      counter++
      //create the url, call Json and give callback
      let url = `http://en.wikipedia.org/w/api.php?action=parse&page=Isotopes_of_${element.toLowerCase()}&prop=text&format=json&callback=?`
      getJson(url, makeHtml, element.toLowerCase());
    });
  }

  function getJson(url, callback, elementName) {
    $.getJSON(url, function(json) {
        console.log(elementName);
        callback(json.parse.text["*"], elementName);
    });
  }


  function makeHtml(wikiHtml, elementName) {
    counter--;
    $('#isotopeData').append(`<div id=${elementName}>${wikiHtml}</div>`);
    console.log()
    parseIsotopeData(elementName);
    console.log(counter);
    if(counter == 0) {
      addAdditionalColumns();
      let csv = convertArrayToCsv(isotopeArray);
      downloadCsv(csv, "isotopeData.csv");
    }
  }

  function parseIsotopeData(elementName) {
    console.log(elementName);
    let table  = $(`#isotopeData > div#${elementName} #List_of_isotopes`).parent().next();
    let htmlRows = table.children().children();

    for (var i = 1; i < htmlRows.length; i++) {
      //loop through children

      var row = htmlRows[i].children;
      if(row.length > 5) {
        let nuclideInfo = [elementName];
          for(var k= 1; k < 5; k++) {
            let data = row[k].innerHTML
            if(k == 3 || k == 4) {
              data = getRidOfCertainChar(data)
            }
            if(k==4 && row[k].innerHTML.includes('Stable')) {
              data = 'stable';
            }
            nuclideInfo.push(data);
          }
        isotopeArray.push(nuclideInfo);
      }

   }
   console.log('Isotope arry: ', isotopeArray);
  }

  function getRidOfCertainChar(str) {
    //get rid of stuff between (), then get rid of non ascii characters
    let result = str.replace(/ *\([^)]*\) */g, "").replace(/[^\x00-\x7F]/g, "");

    if(result.includes('<sup>')) {
      result = result.replace('<sup>', 'e');
      let units = result.slice(result.indexOf('&nbsp;'), result.length)
      result = result.slice(0, result.indexOf('</sup>')) + units;
    }
    result = result.replace('&nbsp;', ' ');
    // if(result.indexOf('<br>') >= -1) {
    //   result = result.slice(0, result.indexOf('<br>')+1);
    // }
    return result;
  }

  function addAdditionalColumns() {
    isotopeArray.forEach(isotope => {
      let massNumber = parseInt(isotope[1], 10) + parseInt(isotope[2], 10);
      let isotopeName = isotope[0] + '-' + massNumber;
      isotope[5] = massNumber;
      isotope[6] = isotopeName;
    })
  }
}

var isotopeGrabber  = new IsotopeGrabber();
