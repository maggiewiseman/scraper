var halfLifeData = null;
var missingElements = [];
var elementList = []
function convertArrayToCsv(listToConvert)
{
    let csv = "\ufeff";
    listToConvert.forEach(function (row)
    {
        csv += row.join(',');
        csv += '\n';
    });

    return csv;
}

function downloadCsv(data, filename)
{
    var csvData = new Blob([data], { type: 'text/csv' })
    var csvUrl = URL.createObjectURL(csvData);

    pushDownload(filename, csvUrl)
}

function pushDownload(filename, data)
{
    let hiddenElement = document.createElement('a');
    hiddenElement.setAttribute('href', data);
    hiddenElement.setAttribute('download', filename);
    hiddenElement.download = filename;
    hiddenElement.click();
}

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function processJson(data) {
  console.log('JSON Returned! ', data);
}

function getTable() {

  $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&page=Isotopes_of_fluorine&section=6&format=json&callback=?', function(json) {
    console.log(json.parse.text["*"]);
    $('#isotopeData').html(json.parse.text['*']);
  });


}

function getHtmlData() {
  var rows = document.getElementsByTagName("tr");

  var arrOfRows = [['Atomic Number', 'Symbol', 'Mass Number', 'Atomic Mass (specific)', 'Percent Abundance', 'Half-life', 'Half-life Units', 'Element Name', 'Isotope Name', 'Neutrons', 'Stable'] ];

  var rowSpan = -1;
  var elementIndex = -1;
  var elSymbol;
  var atomicNumber;

  for (var i = 0; i < rows.length; i++) {
    var data = rows[i].children;
    var dataToStore = [];
    if(data[0] && data[1]) {

      if(isLetter(data[1].innerText.charAt(0))) {
        rowSpan = data[0].getAttribute('rowspan');
        elementIndex = i;
        elSymbol = data[1].innerText;
        atomicNumber = data[0].innerText;
      }

      if(i > elementIndex && rowSpan > 0) {

        dataToStore.push(atomicNumber);
        dataToStore.push(elSymbol);

      }


      for (var j = 0; j < data.length; j++) {
        //remove stuff between ()
        let item = data[j].innerText.replace(/ *\([^)]*\) */g, "");
        //remove non ascii characters
        dataToStore.push(item.replace(/[^\x00-\x7F]/g, ""));
        //console.log(data[j].innerText);
      }
      arrOfRows.push(dataToStore);
    }

  }
  arrOfRows.splice(1,1);
  return arrOfRows;
}


function uploadIsotopData(callback) {
  $.ajax({
    url: 'data/isotopeData2.csv',
    method: 'GET',
    success: function(data){
        configureIsotopeData(data, callback);
    },
    error: function(e) {
      console.log(e)
    }
  })
}

function createBuildConfig(callback) {
  return {
  				delimiter: "",	// auto-detect
  				newline: "",	// auto-detect
  				quoteChar: '"',
  				header: true,
  				dynamicTyping: false,
  				preview: 0,
  				encoding: "UTF-8",
  				worker: false,
  				comments: false,
  				step: undefined,
  				complete: callback,
  				error: this.errorFn,
  				download: false,
  				skipEmptyLines: true,
  				chunk: undefined,
  				fastMode: undefined,
  				beforeFirstChunk: undefined,
  				withCredentials: undefined
  			}
}


function configureIsotopeData(data, callback) {

    Papa.parse(data, createBuildConfig(callback))
    console.log('parsed files!');
}

function matchIsotopeDataWithHtmlData(data) {
  halfLifeData = data.data;

  processHalifLifeData(halfLifeData);
  console.log(halfLifeData)

  var allTheIsotopes = getHtmlData();

  fillInElementData(allTheIsotopes);

  let csv = convertArrayToCsv(allTheIsotopes);
  downloadCsv(csv, "testcase.csv");
  //console.log('All the isotopes', allTheIsotopes);

}


function fillInElementData(allTheIsotopes) {
  //loop through all the isotope data which is an array of arrays
  //atomic number, symbol, mass number, mass, abundance, some data to delete
  allTheIsotopes.forEach(isotope => {
    let massNum = isotope[2];
    let symbol = isotope[1];

    let elementData = findHalfLife(massNum, symbol);
    if(elementData) {
      isotope[5] = elementData.halfLife;
      isotope[6] = elementData.units;
      isotope[7] = elementData.name;
      isotope[8] = elementData.isotopeName;
      isotope[9] = elementData.neutrons;
    }

    if(isotope[4]) {
      isotope[10] = 'stable';
    }

  });
}



function findHalfLife(massNum, symbol) {
  for(var i = 0; i < halfLifeData.length; i++) {
    if(halfLifeData[i].Symbol === symbol && halfLifeData[i].massNumber == massNum) {
      return {
        halfLife: halfLifeData[i].halfLife,
        units: halfLifeData[i].units,
        name: halfLifeData[i].elementName.toLowerCase(),
        isotopeName: halfLifeData[i].isotopeName.toLowerCase(),
        neutrons: massNum - parseInt(halfLifeData[i].atomicNumber, 10)
      };
    }
  }
  missingElements.push({massNum, symbol});
  //console.log(missingElements);
}

function getListOfElements() {
  uploadIsotopeData(callback)
}


function processHalifLifeData(data) {
  updateHalfLife(data);
  updateMassNumber(data);
}

function updateMassNumber(data) {
  data.forEach(row => {
    if(!row["massNumber"]) {
      row["massNumber"] = row["isotopeName"].split('-')[1];
    }
  })
}

function updateHalfLife(data) {
  //loop through each row
  data.forEach(row => {
    let halfLife = null;
    let units = null;
    if(row["halfLife-years"]) {
      halfLife = row["halfLife-years"] + 'e' + row["halfLife-power10years"];
      units = 'years';
    } else if (row["halfLife-days"]) {
      halfLife = row["halfLife-days"];
      units = 'days';
    } else if (row["halfLife-hours"]) {
      halfLife = row["halfLife-hours"];
      units = 'hours';
    } else if (row["halfLife-minutes"]) {
      halfLife = row["halfLife-minutes"];
      units = 'minutes';
    } else if (row["halfLife-seconds"]) {
      halfLife = row["halfLife-seconds"] + 'e' + row["halfLife-power10seconds"];
      units = 'seconds';
    }

    row["halfLife"] = halfLife;
    row["units"] = units;
  });
}

function createFile() {
  uploadIsotopData(matchIsotopeDataWithHtmlData);
}

function getElementList() {
  if(!halfLifeData) {
    alert('Push download button first');
  }

  halfLifeData.forEach(isotope => {
    if(elementList.indexOf(isotope.elementName) === -1) {
      elementList.push(isotope.elementName);
    }
  });
  console.log('elementList', elementList.join('|'));

}
