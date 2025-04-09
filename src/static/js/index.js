document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('uploadForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('fileInput');
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
  
      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
  
        // Retrieve user-provided reference CSV
        const referenceCSV = document.getElementById('refCsvInput').value;
  
        // Compare CSVs and render table
        document.getElementById('result').innerHTML = csvToTable(data.result, referenceCSV);
      } catch (error) {
        console.error(error);
        document.getElementById('result').textContent = "An error occurred while processing the file.";
      }
    });
  
    /**
     * Converts two CSV strings into an HTML table.
     * The header row (first row) is rendered without comparison.
     * For data rows, each cell is compared with the corresponding cell from the user-provided reference CSV.
     * If a cell's value doesn't match, the cell's background is set to red and a tooltip displays the expected value.
     *
     * @param {string|object} csv - The CSV result from the backend.
     * @param {string} refCsv - The reference CSV provided by the user.
     * @returns {string} HTML string representing the table.
     */
    function csvToTable(csv, refCsv) {
      if (typeof csv !== 'string') {
        return `<pre>${JSON.stringify(csv, null, 2)}</pre>`;
      }
  
      const rows = csv.split('\n').filter(row => row.trim() !== '');
      const refRows = refCsv.split('\n').filter(row => row.trim() !== '');
      if (rows.length === 0) return '';
  
      let html = '<table class="csv-table">';
  
      // Render header row without comparison.
      const headerCells = rows[0].split(',').map(cell => cell.replace(/"/g, '').trim());
      html += '<thead><tr>';
      headerCells.forEach(cell => {
        html += `<th>${cell}</th>`;
      });
      html += '</tr></thead>';
  
      // Render data rows with cell-by-cell comparison.
      html += '<tbody>';
      for (let i = 1; i < rows.length; i++) {
        const rowCells = rows[i].split(',').map(cell => cell.replace(/"/g, '').trim());
        html += '<tr>';
        // Grab corresponding reference row if available.
        const refRowCells = (i < refRows.length)
          ? refRows[i].split(',').map(cell => cell.replace(/"/g, '').trim())
          : [];
        for (let j = 0; j < rowCells.length; j++) {
          const cell = rowCells[j];
          const refCell = refRowCells[j] || "";
          if (cell !== refCell) {
            html += `<td style="background-color: rgba(247, 2, 2, 0.2);" title="Expected: ${refCell || "Empty"}">${cell}</td>`;
          } else {
            html += `<td>${cell}</td>`;
          }
        }
        html += '</tr>';
      }
      html += '</tbody></table>';
      return html;
    }
  });
  