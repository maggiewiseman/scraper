
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
  console.log('isLetter: ', str)
  return str.length === 1 && str.match(/[a-z]/i);
}

var rows = document.getElementsByTagName("tr");

var arrOfRows = [];
var rowSpan = -1;
var elementIndex = -1;
for (var i = 0; i < rows.length; i++) {
  var data = rows[i].children;
  var dataToStore = [];
  if(data[0] && data[1]) {

    if(isLetter(data[1].innerText.charAt(0))) {
      rowSpan = data[0].getAttribute('rowspan');
      elementIndex = i;
      console.log('rowspan: ' + rowSpan + ' elementIndex: ' + elementIndex);
    }

    if(i > elementIndex && rowSpan > 0) {

        for(var k = 0; k < 2; k++) {
          console.log('adding xpaces');
          dataToStore.push(" ");
        }
    }


    for (var j = 0; j < data.length; j++) {
      dataToStore.push(data[j].innerText.replace(/ *\([^)]*\) */g, ""));
      //console.log(data[j].innerText);
    }
    arrOfRows.push(dataToStore);
  }

}
console.log(arrOfRows);
var csv = convertArrayToCsv(arrOfRows);
downloadCsv(csv, "testcase.csv");
