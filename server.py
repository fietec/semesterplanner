import os
import json
from flask import Flask, request, send_file, jsonify

app = Flask(__name__)

HOME_PATH = os.path.dirname(os.path.abspath(__file__))
PUBLIC_PATH = os.path.join(HOME_PATH, "public")
INDEX_HTML_PATH = os.path.join(PUBLIC_PATH, "index.html")
PLAN_HTML_PATH = os.path.join(PUBLIC_PATH, "plan.html")
DATA_PATH = os.path.join(HOME_PATH, "data")
SAVE_FILE = "data.json"

def load_file(path:str) -> dict | None:
    if not os.path.isfile(path): return None
    with open(path, "r") as f:
        return json.loads(f.read())
    return None

def save_file(path:str, data:dict) -> None:
    with open(path, "w") as f:
        f.write(json.dumps(data))

@app.route('/plan/<path:path>', methods=['GET', 'POST'])
def serve(path):
    dir_path = os.path.join(DATA_PATH, path)
    if request.method == 'GET':
        return send_file(PLAN_HTML_PATH)
    elif request.method == 'POST':
        data_path = os.path.join(dir_path, SAVE_FILE)
        data = request.json
        if "action" not in data.keys():
            return jsonify(success=False, message="missing 'action' field")
        match data["action"]:
            case "load":
                content = load_file(data_path)
                if not content:
                    return jsonify(success=False, message=f"no data file for repo '{path}'")
                return jsonify(success=True, data=content)
            case "save":
                if not os.path.isdir(dir_path):
                    os.makedirs(dir_path)

                save_file(data_path, data['data'])
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
    app.run()
