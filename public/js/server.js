import { renderDefaultLayout, renderPlanFromJSON } from "./render.js";
import { buildJson } from "./data.js";

export async function loadPlan() {
    try {
        const res = await fetch('', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 'action': 'load' }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data['success']){
            renderPlanFromJSON(data['data']);
        } else{
            renderDefaultLayout();
        }
    } catch (err) {
        console.warn('Backend fetch failed or not active. Falling back to default layout:', err.message);
        renderDefaultLayout();
    }
}

export async function deletePlan() {
    if (confirm("Do you really want to delete this plan forever (rip your studies)?")){
        try {
            const res = await fetch('', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    action: 'delete',
                })
            });

            if (res.ok) {
                alert('Plan successfully deleted!');
            } else {
                alert(`Failed to delete: HTTP ${res.status}`);
            }
        } catch (err) {
            alert(`Error connecting to backend API: ${err.message}`);
        }
        loadPlan();
    }
}

export async function savePlan() {
    const payload = buildJson();
    try {
        const res = await fetch('', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                action: 'save',
                data: payload,
            })
        });

        if (res.ok) {
            alert('Plan saved successfully!');
        } else {
            alert(`Failed to save: HTTP ${res.status}`);
        }
    } catch (err) {
        alert(`Error connecting to backend API: ${err.message}`);
    }
}
