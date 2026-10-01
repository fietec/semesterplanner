import os
import json
import secrets
import sys
from flask import Flask, request, send_file, jsonify

app = Flask(__name__)

HOME_PATH = os.path.dirname(os.path.abspath(__file__))
PUBLIC_PATH = os.path.join(HOME_PATH, "public")
INDEX_HTML_PATH = os.path.join(PUBLIC_PATH, "index.html")
PLAN_HTML_PATH = os.path.join(PUBLIC_PATH, "plan.html")
PLANS_PATH = os.path.join(HOME_PATH, "plans")
PLAN_INDEX_PATH = os.path.join(PLANS_PATH, "index.json")

def load_file(path:str) -> dict | None:
    if not os.path.isfile(path): return None
    with open(path, "r") as f:
        return json.loads(f.read())
    return None

def save_file(path:str, data:dict) -> None:
    with open(path, "w") as f:
        f.write(json.dumps(data))

def get_plan_path(plan_id:str) -> str:
    return os.path.join(PLANS_PATH, f"{plan_id}.json")

def generate_id() -> str:
    return secrets.token_hex(6)

@app.route('/plan/<path:path>', methods=['GET', 'POST'])
def serve(path):
    if request.method == 'GET':
        return send_file(PLAN_HTML_PATH)
    elif request.method == 'POST':
        data = request.json
        if 'action' not in data.keys():
            return jsonify(success=False, message="missing 'action' field")
        plans = load_file(PLAN_INDEX_PATH)
        match data['action']:
            case 'load':
                if path not in plans.keys():
                    return jsonify(success=False, message=f"plan does not exist: '{path}'")

                data_path = get_plan_path(plans[path])
                data = load_file(data_path)
                if not data:
                    return jsonify(success=False, message=f"no repo found for plan {path}")
                return jsonify(success=True, data=data)
            case 'save':
                if 'data' not in data.keys():
                    return jsonify(success=False, message=f"missing data payload")
                plan_data = data['data']

                if path not in plans.keys():
                    plan_id = generate_id()
                    plans[path] = plan_id
                    save_file(PLAN_INDEX_PATH, plans)
                else:
                    plan_id = plans[path]

                plan_path = get_plan_path(plan_id)
                save_file(plan_path, plan_data)
                return jsonify(success=True)
            case 'delete':
                if path in plans.keys():
                    plan_id = plans[path]
                    del plans[path]
                    save_file(PLAN_INDEX_PATH, plans)

                    data_path = get_plan_path(plan_id)
                    try:
                        os.remove(data_path)
                    except OSError:
                        pass
                return jsonify(success=True)
            case _:
                return jsonify(success=False, message="invalid action")

@app.route('/public/<path:path>', methods=['GET'])
def style(path):
    return send_file(os.path.join(PUBLIC_PATH, path))

@app.route('/', methods=['GET'])
def root():
    return send_file(INDEX_HTML_PATH)

if __name__ == "__main__":
    port = 5000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except:
            pass

    app.run(port=port)
