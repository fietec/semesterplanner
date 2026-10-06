import { semestersContainer } from "./main.js";
import { deleteSemester, deleteModuleCard, setModulePassed } from "./actions.js";

export function renderPlanFromJSON(data) {
    semestersContainer.innerHTML = '';
    pool.innerHTML = '';

    if (data.semesters && data.semesters.length > 0) {
        data.semesters.forEach(semData => {
            const row = createSemesterRow();
            const dropzone = row.querySelector('.semester-dropzone');
            
            if (semData.modules) {
                semData.modules.forEach(m => {
                    dropzone.appendChild(createModuleCard(m.id, m.name, m.ects, m.passed, m.color));
                });
            }
        });
    } else {
        renderDefaultLayout();
        return;
    }

    if (data.unassignedPool) {
        data.unassignedPool.forEach(m => {
            pool.appendChild(createModuleCard(m.id, m.name, m.ects, false, m.color));
        });
    }

    updateECTSCounts();
}

export function renderDefaultLayout() {
    semestersContainer.innerHTML = '';
    pool.innerHTML = '';

    for (let i = 1; i <= 6; i++) {
        createSemesterRow();
    }

    updateECTSCounts();
}

export function createSemesterRow() {
    const row = document.createElement('div');
    row.className = 'semester-row';
    
    row.innerHTML = `
        <div class="semester-label">
          <div class="semester-header-actions">
            <span class="sem-title">Semester</span>
            <button class="btn-danger sem-delete-btn" title="Delete Semester">✕</button>
          </div>
          <span class="ects-badge">0 ECTS</span>
        </div>
        <div class="semester-dropzone dropzone"></div>
      `;

    semestersContainer.appendChild(row);
    makeDropzone(row.querySelector('.semester-dropzone'));
    renumberSemesters();

    const btn = row.querySelector('.sem-delete-btn');
    btn.addEventListener('click', (e) => {deleteSemester(btn)});

    return row;
}

export function renumberSemesters() {
    const rows = semestersContainer.querySelectorAll('.semester-row');
    rows.forEach((row, idx) => {
        row.querySelector('.sem-title').textContent = `${idx + 1}. Semester`;
    });
}

export function createModuleCard(id, name, ects, passed, colorClass) {
    const card = document.createElement('div');
    card.className = `module-card ${colorClass}`;
    card.id = id || 'mod-' + Date.now() + Math.random().toString(36).substr(2, 4);
    card.draggable = true;
    card.dataset.name = name;
    card.dataset.ects = ects;
    card.dataset.color = colorClass;
    card.dataset.passed = passed? 'true' : 'false';

    card.innerHTML = `
            <label class="card-pass-toggle">
              <input type="checkbox" ${passed ? 'checked' : ''} class="card-passed-btn">
              <span class="card-pass-label">✓</span>
            </label>
            <button class="card-delete-btn" title="Delete Module">✕</button>
            <div>${name}</div>
            <div style="font-size:0.75rem; opacity:0.9;">(${ects})</div>
          `;

    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id);
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });

    const modulePassed = card.querySelector('.card-passed-btn');
    modulePassed.addEventListener('click', (e) => {setModulePassed(e, modulePassed);});

    const deleteModule = card.querySelector('.card-delete-btn');
    deleteModule.addEventListener('click', (e) => {deleteModuleCard(e, deleteModule);});

    return card;
}

export function makeDropzone(zone) {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        
        const cardId = e.dataTransfer.getData('text/plain');
        const card = document.getElementById(cardId);
        
        if (card) {
            zone.appendChild(card);
            updateECTSCounts();
        }
    });
}

export function updateECTSCounts() {
    let grandTotal = 0;
    let passed = 0;
    const rows = semestersContainer.querySelectorAll('.semester-row');

    rows.forEach(row => {
        const cards = row.querySelectorAll('.module-card');
        let semTotal = 0;
        cards.forEach(card => {
            let ects = parseInt(card.dataset.ects, 10) || 0;
            semTotal += ects;
            if (card.dataset.passed === 'true') passed += ects;
        });
        row.querySelector('.ects-badge').textContent = `${semTotal} ECTS`;
        grandTotal += semTotal;
    });

    document.getElementById('grand-total').textContent = `Total ECTS: ${passed} / ${grandTotal}`;
}
