import { pool, semestersContainer } from "./main.js";

export function buildJson(){
    const rows = semestersContainer.querySelectorAll('.semester-row');
    const data = {
        timestamp: new Date().toISOString(),
        semesters: [],
        unassignedPool: []
    };

    rows.forEach((row, idx) => {
        const semesterData = {
            semesterNumber: idx + 1,
            modules: []
        };

        row.querySelectorAll('.module-card').forEach(card => {
            semesterData.modules.push({
                id: card.id,
                name: card.dataset.name,
                ects: parseInt(card.dataset.ects, 10),
                passed: card.dataset.passed === 'true',
                color: card.dataset.color
            });
        });

        data.semesters.push(semesterData);
    });

    pool.querySelectorAll('.module-card').forEach(card => {
        data.unassignedPool.push({
            id: card.id,
            name: card.dataset.name,
            ects: parseInt(card.dataset.ects, 10),
            passed: false,
            color: card.dataset.color
        });
    });
    return data;
}
