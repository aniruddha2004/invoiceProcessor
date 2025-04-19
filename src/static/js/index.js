document.addEventListener("DOMContentLoaded", function() {
    // File Input Handler
    const fileInput = document.getElementById('fileInput');
    const defaultUploadState = document.getElementById('defaultUploadState');
    const selectedFileState = document.getElementById('selectedFileState');
    const selectedFileName = document.getElementById('selectedFileName');
    const changeFileBtn = document.getElementById('changeFileBtn');
    const form = document.getElementById('uploadForm');

    // File selection display handlers
    function updateFileDisplay(file) {
        if (file) {
            defaultUploadState.classList.add('hidden');
            selectedFileState.classList.remove('hidden');
            selectedFileName.textContent = file.name;
        } else {
            defaultUploadState.classList.remove('hidden');
            selectedFileState.classList.add('hidden');
            selectedFileName.textContent = 'No file selected';
        }
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        updateFileDisplay(file);
    });

    changeFileBtn?.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop handlers
    const dropZone = document.querySelector('.border-dashed');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone?.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone?.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone?.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('border-primary-500', 'bg-primary-100');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-primary-500', 'bg-primary-100');
    }

    dropZone?.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        fileInput.files = dt.files;
        updateFileDisplay(file);
    }

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Debug log
        console.log('ERP Data:', document.getElementById('refCsvInput').value);
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;
  
      try {
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData
        });
            
        const data = await response.json();
  
            if (response.ok) {
                const resultDiv = document.getElementById('result');
                
                // Get the ERP data from textarea
                const erpData = document.getElementById('refCsvInput').value;
                const erpRows = erpData.split('\n').filter(row => row.trim());
                
                // Get the extracted data
                let extractedRows;
                if (typeof data.result === 'string') {
                    extractedRows = data.result.split('\n').filter(row => row.trim());
                } else {
                    extractedRows = data.result;
                }
                
                // Create table HTML
                let tableHtml = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">';
                
                // Process each row
                extractedRows.forEach((row, rowIndex) => {
                    const extractedCols = typeof row === 'string' ? row.split(',').map(col => col.trim().replace(/"/g, '')) : row;
                    const erpCols = rowIndex < erpRows.length ? erpRows[rowIndex].split(',').map(col => col.trim().replace(/"/g, '')) : [];
                    
                    if (rowIndex === 0) {
                        // Header row
                        tableHtml += `
                            <thead class="bg-gray-50">
                                <tr>
                                    ${extractedCols.map(col => `
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            ${col}
                                        </th>
                                    `).join('')}
                                </tr>
                            </thead>
                            <tbody>
                        `;
                    } else {
                        // Data rows
                        tableHtml += `
                            <tr class="${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100">
                                ${extractedCols.map((col, colIndex) => {
                                    const erpValue = erpCols[colIndex] || '';
                                    // Clean and normalize both values for comparison
                                    const cleanExtracted = col.toLowerCase().trim().replace(/\s+/g, ' ');
                                    const cleanErp = erpValue.toLowerCase().trim().replace(/\s+/g, ' ');
                                    const matches = cleanExtracted === cleanErp;
                                    
                                    // For debugging
                                    console.log('Comparing:', {
                                        extracted: cleanExtracted,
                                        erp: cleanErp,
                                        matches: matches
                                    });

                                    return `
                                        <td class="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-100 ${!matches ? 'text-gray-900' : 'text-gray-600'}" 
                                            style="${!matches ? 'background-color: rgb(254, 202, 202) !important;' : ''}"
                                            title="${!matches ? `⬅️ ${col} | ➡️ ${erpValue}` : ''}">
                                            ${col}
                                        </td>
                                    `;
                                }).join('')}
                            </tr>
                        `;
                    }
                });
                
                tableHtml += `
                        </tbody>
                    </table>
                    <div class="mt-4 text-sm text-gray-500">
                        <div class="flex items-center space-x-2">
                            <div class="w-4 h-4 border border-gray-200" style="background-color: rgb(254, 202, 202);"></div>
                            <span>Indicates mismatched values between extracted data and ERP system data</span>
                        </div>
                    </div>
                </div>`;
                
                resultDiv.innerHTML = tableHtml;
            } else {
                throw new Error(data.error || 'Failed to process invoice');
            }
        } catch (error) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = `
                <div class="rounded-lg bg-red-50 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">Error Processing Invoice</h3>
                            <p class="mt-2 text-sm text-red-700">${error.message}</p>
                        </div>
                    </div>
                </div>
            `;
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Process Invoice
            `;
        }
    });
  });
  