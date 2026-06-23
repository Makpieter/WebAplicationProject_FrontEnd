/**
 * Table Component
 * Creates a reusable data table with sorting and actions
 */

/**
 * Generate a table element with data and options
 * @param {Object[]} data - Array of data objects
 * @param {Object} options - Table configuration options
 * @returns {HTMLElement} - Table element
 */
function createTable(data, options) {
    const defaultOptions = {
        columns: [],
        tableClass: 'table table-striped table-hover align-middle', 
        idField: 'id',
        actions: {
            view: true,
            edit: true,
            delete: true
        },
        onView: null,
        onEdit: null,
        onDelete: null
    };

    const tableOptions = { ...defaultOptions, ...options };

    const table = document.createElement('table');
    table.className = tableOptions.tableClass;

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

	tableOptions.columns.forEach(column => {

		const th = document.createElement('th');

		th.textContent = column.title;

		if (column.width) {
			th.style.width = column.width;
		}

		if (column.sortable) {

			th.style.cursor = 'pointer';

			th.innerHTML = `
				${column.title}
				<i class="bi bi-arrow-down-up ms-1"></i>
			`;

			th.addEventListener('click', () => {

				if (tableOptions.onSort) {
					tableOptions.onSort(column.field);
				}
			});
		}

		headerRow.appendChild(th);
	});

    if (tableOptions.actions.view || tableOptions.actions.edit || tableOptions.actions.delete) {
        const actionsHeader = document.createElement('th');
        actionsHeader.textContent = 'Actions';
        actionsHeader.className = 'table-actions';
        // Rezerwujemy bezpieczną szerokość dla kolumny akcji
        actionsHeader.style.width = '240px'; 
        headerRow.appendChild(actionsHeader);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    data.forEach(item => {
        const row = document.createElement('tr');
        // KROK 1: Wymuszamy pozycjonowanie relatywne na wierszu, aby przyciski wiedziały do jakiej wysokości się przypiąć
        row.style.position = 'relative';

        tableOptions.columns.forEach(column => {
            const td = document.createElement('td');

            if (column.render) {
                td.innerHTML = column.render(item[column.field], item);
            } else {
                td.textContent = item[column.field] || '';
            }

            row.appendChild(td);
        });

        if (tableOptions.actions.view || tableOptions.actions.edit || tableOptions.actions.delete) {
            const actionCell = document.createElement('td');
            // KROK 2: Nadajemy stałą pozycję i rozciągamy kontener na 100% wysokości wiersza od krawędzi do krawędzi
            actionCell.className = 'd-flex gap-1 align-items-stretch';
            actionCell.style.position = 'absolute';
            actionCell.style.top = '0px';
            actionCell.style.bottom = '0';
            actionCell.style.right = '0';
            actionCell.style.left = 'auto'; // Trzyma kolumnę po prawej stronie
            actionCell.style.width = '240px'; // Musi być identyczna jak szerokość w nagłówku TH
            actionCell.style.padding = '14px'; // Minimalny, estetyczny odstęp od krawędzi wiersza
            actionCell.style.backgroundColor = 'transparent'; 

            // KROK 3: Klasy dla przycisków gwarantujące pełną wysokość (h-100) oraz idealne centrowanie tekstu i ikony
            const btnBaseClass = 'btn btn-sm h-100 d-flex align-items-center justify-content-center flex-grow-1 text-nowrap px-2';

            // View button
            if (tableOptions.actions.view) {
                const viewBtn = document.createElement('button');
                viewBtn.className = `${btnBaseClass} btn-info`;
                viewBtn.innerHTML = '<i class="bi bi-eye me-1"></i> View';
                viewBtn.onclick = () => {
                    if (tableOptions.onView) {
                        tableOptions.onView(item[tableOptions.idField], item);
                    }
                };
                actionCell.appendChild(viewBtn);
            }

            // Edit button
            if (tableOptions.actions.edit) {
                const editBtn = document.createElement('button');
                editBtn.className = `${btnBaseClass} btn-warning`;
                editBtn.innerHTML = '<i class="bi bi-pencil me-1"></i> Edit';
                editBtn.onclick = () => {
                    if (tableOptions.onEdit) {
                        tableOptions.onEdit(item[tableOptions.idField], item);
                    }
                };
                actionCell.appendChild(editBtn);
            }

            // Delete button
            if (tableOptions.actions.delete) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = `${btnBaseClass} btn-danger`;
                deleteBtn.innerHTML = '<i class="bi bi-trash me-1"></i> Delete';
                deleteBtn.onclick = () => {
                    if (tableOptions.onDelete) {
                        tableOptions.onDelete(item[tableOptions.idField], item);
                    }
                };
                actionCell.appendChild(deleteBtn);
            }

            row.appendChild(actionCell);
        }

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-responsive';
    tableContainer.appendChild(table);

    if (data.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'text-center my-4 text-muted';
        emptyState.innerHTML = '<p>No data available</p>';
        tableContainer.appendChild(emptyState);
    }

    return tableContainer;
}