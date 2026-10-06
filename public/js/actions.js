import { pool } from "./main.js";
import { buildJson } from "./data.js";
import { renderPlanFromJSON, renderDefaultLayout, createSemesterRow, updateECTSCounts, renumberSemesters, createModuleCard } from "./render.js";

export function importPlan() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);
            if (confirm("Importing plan. This will overwrite the current plan. Do you want to continue?")){
                renderPlanFromJSON(jsonData);
            }
        } catch (error) {
            alert('Invalid JSON file. Please check the file formatting and try again.');
            console.error(error);
        }
    };
    fileInput.click();
}

export function exportPlan() {
    const data = buildJson();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    const pathArray = window.location.pathname.split('/');
    const planName = pathArray.filter(Boolean).pop();
    downloadLink.download = `semesterplan_${planName}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

export function addSemester() {
    createSemesterRow();
    updateECTSCounts();
}

export function deleteSemester(buttonElement) {
    const row = buttonElement.closest('.semester-row');
    const dropzone = row.querySelector('.semester-dropzone');
    const cards = dropzone.querySelectorAll('.module-card');
    
    cards.forEach(card => pool.appendChild(card));
    row.remove();
    
    renumberSemesters();
    updateECTSCounts();
}

export function deleteModuleCard(event, btnElement) {
    event.stopPropagation();
    const card = btnElement.closest('.module-card');
    card.remove();
    updateECTSCounts();
}

export function setModulePassed(event, toggle){
    const card = toggle.closest('.module-card');
    const passed = card.dataset.passed === 'true';
    card.dataset.passed = passed? 'false' : 'true';
    updateECTSCounts();
}

export function addModule(){
    const nameInput = document.getElementById('m-name');
    const ectsInput = document.getElementById('m-ects');
    const colorInput = document.getElementById('m-color');

    const card = createModuleCard(
        null,
        nameInput.value,
        parseInt(ectsInput.value, 10),
        false,
        colorInput.value
    );

    pool.appendChild(card);
    nameInput.value = '';
    ectsInput.value = '';
}
