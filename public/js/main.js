import { makeDropzone } from "./render.js";
import { loadPlan, savePlan, deletePlan } from "./server.js";
import { addSemester, importPlan, exportPlan, addModule } from "./actions.js";

export const pool = document.getElementById('pool');
export const semestersContainer = document.getElementById('semesters-container');

function init() {
    document.getElementById('module-form').addEventListener('submit', (e) => {e.preventDefault(); addModule();});
    document.getElementById('add-sem-btn').addEventListener('click', (e) => {addSemester();});
    document.getElementById('save-plan-btn').addEventListener('click', (e) => {savePlan();});
    document.getElementById('import-plan-btn').addEventListener('click', (e) => {importPlan();});
    document.getElementById('export-plan-btn').addEventListener('click', (e) => {exportPlan();});
    document.getElementById('delete-plan-btn').addEventListener('click', (e) => {deletePlan();});

    makeDropzone(pool);
    loadPlan();
}

init();
