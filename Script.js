// Home page interactions can be added here in future
console.log("Xsheet Home Page Loaded");

// Future JS logic
console.log("SheetViz loaded.");

let currentChart = null;
let uploadedData = [];

window.onload = function () {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  const activePage = localStorage.getItem('activePage') || 'home';
  showPage(activePage);

  const fileInput = document.getElementById('excelFile');
  if (fileInput) {
    fileInput.addEventListener('change', handleExcelUpload);
  }

  const chartTypeSelect = document.getElementById('chartType');
  if (chartTypeSelect) {
    chartTypeSelect.addEventListener('change', () => {
      if (uploadedData.length > 0) {
        autoGenerateCharts(uploadedData);
      }
    });
  }
};

function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.style.display = 'none');
  const target = document.getElementById(pageId);
  if (target) {
    target.style.display = 'block';
    localStorage.setItem('activePage', pageId);
  }
}

function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (json.length > 1 && json[0].length >= 2) {
      uploadedData = json;
      displayTable(json);
      autoGenerateCharts(json);
    } else {
      alert('Excel must contain at least 2 columns and 2 rows.');
    }
  };
  reader.readAsArrayBuffer(file);
}

function displayTable(data) {
  let html = '<table>';
  data.forEach((row, i) => {
    html += '<tr>';
    row.forEach(cell => {
      html += i === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</table>';

  document.getElementById('output').innerHTML = html;
  document.getElementById('rowCount').textContent = data.length - 1;
  document.getElementById('colCount').textContent = data[0].length;
}

function autoGenerateCharts(data) {
  const header = data[0];
  const rows = data.slice(1);

  let labelIndex = -1;
  let valueIndex = -1;

  // Find label (text) column and numeric column
  for (let i = 0; i < header.length; i++) {
    const sample = rows.map(row => row[i]);
    const allNumbers = sample.every(val => !isNaN(parseFloat(val)));
    if (labelIndex === -1 && !allNumbers) labelIndex = i;
    else if (valueIndex === -1 && allNumbers) valueIndex = i;
  }

  if (labelIndex === -1 || valueIndex === -1) {
    alert('Could not detect a valid label and numeric column.');
    return;
  }

  const labels = rows.map(row => row[labelIndex]);
  const values = rows.map(row => parseFloat(row[valueIndex]));

  const chartType = document.getElementById('chartType')?.value || 'bar';
  renderChart(labels, values, header[valueIndex], chartType);
}

function renderChart(labels, values, datasetLabel, type) {
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: datasetLabel,
        data: values,
        backgroundColor: [
         '#A7C7E7', '#B2F2BB', '#FFF3B0', '#FADADD',
  '#FFD6A5', '#E0BBE4', '#D3D3D3', '#E8F0FE'
        ],
        borderColor: '#2c3e50',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: type !== 'bar' && type !== 'line',
        }
      },
      scales: (type === 'bar' || type === 'line' || type === 'scatter' || type === 'area') ? {
        y: {
          beginAtZero: true
        }
      } : {}
    }
  });
}

document.getElementById('excelFile').addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    // For demo: simulate rows/columns
    document.getElementById('rowCount').textContent = 100;
    document.getElementById('colCount').textContent = 10;
  }
});

let chart;

function handleUpload() {
  const fileInput = document.getElementById('excelFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select an Excel file.');
    return;
  }

  // Simulated data
  const totalRows = 25;
  const totalCols = 6;
  const dummyData = [12, 19, 3, 5, 2, 3];
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

  document.getElementById('rowCount').textContent = totalRows;
  document.getElementById('colCount').textContent = totalCols;

  const chartType = document.getElementById('chartType').value;
  drawChart(chartType, labels, dummyData);
}

function drawChart(type, labels, data) {
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: 'Sample Data',
        data: data,
        backgroundColor: [
          '#4e73df',
          '#1cc88a',
          '#36b9cc',
          '#f6c23e',
          '#e74a3b',
          '#858796'
        ],
        borderColor: '#fff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
                                                                     // upload js

let excelData = [];
let chart;

document.getElementById('excelFile').addEventListener('change', handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    excelData = json;
    renderTable(json);
    populateDropdowns(json[0]);
    document.getElementById('outputArea').style.display = 'block';
  };
  reader.readAsArrayBuffer(file);
}
function renderTable(data) {
  const container = document.getElementById('tableContainer');
  const table = document.createElement('table');
  table.innerHTML = '';
  data.forEach((row, i) => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const tag = i === 0 ? 'th' : 'td';
      const td = document.createElement(tag);
      td.textContent = cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  container.innerHTML = '';
  container.appendChild(table);
}

function populateDropdowns(headers) {
  const xSelect = document.getElementById('xAxis');
  const ySelect = document.getElementById('yAxis');
  xSelect.innerHTML = '';
  ySelect.innerHTML = '';

  headers.forEach((header, index) => {
    const optX = document.createElement('option');
    optX.value = index;
    optX.text = header;
    xSelect.appendChild(optX);

    const optY = document.createElement('option');
    optY.value = index;
    optY.text = header;
    ySelect.appendChild(optY);
  });
}

function generateChart() {
  const xIndex = document.getElementById('xAxis').value;
  const yIndex = document.getElementById('yAxis').value;
  const chartType = document.getElementById('chartType').value;

  const labels = [];
  const values = [];

  for (let i = 1; i < excelData.length; i++) {
    labels.push(excelData[i][xIndex]);
    values.push(Number(excelData[i][yIndex]));
  }

  if (chart) chart.destroy();

  const ctx = document.getElementById('chartCanvas').getContext('2d');
  chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: 'Data',
        data: values,
        backgroundColor: ['#6c5ce7', '#00cec9', '#fdcb6e', '#d63031', '#0984e3'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: chartType !== 'bar' && chartType !== 'line' }
      }
    }
  });
}