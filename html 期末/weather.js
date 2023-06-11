fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-1521C3E9-1BA6-4C55-A019-5C6AEBEED5C4&format=JSON&elementName=Wx')
.then(response => response.json())
.then(data => {
  const table = createTable(data.records.location);
  const tableContainer = document.getElementById('tableContainer');
  tableContainer.appendChild(table);
})
.catch(error => {
  console.log('发生错误：', error);
});

function createTable(locations) {
const table = document.createElement('table');

// 创建表头
const thead = document.createElement('thead');
const headerRow = document.createElement('tr');

const headerCell = document.createElement('th');
headerCell.textContent = '县市';
headerRow.appendChild(headerCell);

const firstLocation = locations[0];
firstLocation.weatherElement[0].time.forEach(time => {
  const timeCell = document.createElement('th');
  timeCell.textContent = time.startTime;
  headerRow.appendChild(timeCell);
});

thead.appendChild(headerRow);
table.appendChild(thead);

// 创建表格主体
const tbody = document.createElement('tbody');
locations.forEach(location => {
  const locationRow = document.createElement('tr');

  const locationCell = document.createElement('td');
  locationCell.textContent = location.locationName;
  locationRow.appendChild(locationCell);

  location.weatherElement[0].time.forEach(time => {
    const dataCell = document.createElement('td');
    dataCell.textContent = time.parameter.parameterName;
    locationRow.appendChild(dataCell);
  });

  tbody.appendChild(locationRow);
});

table.appendChild(tbody);

return table;
}