from flask import Flask, request, jsonify
from flask_cors import CORS

from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Load the model
model = YOLO("C:\\Users\\oindr\\AI-powered-Classroom\\ML_Backend\\Models\\best.pt")  # your custom trained model

@app.route('/detect', methods=['POST'])
def detect():
    if 'frame' not in request.files:
        return jsonify({"error": "No frame received"}), 400

    file = request.files['frame']
    image = Image.open(file.stream).convert("RGB")
    image = image.resize((96, 96))
    image_np = np.array(image)

    # Run inference
    results = model(image_np)

    # Parse results
    class_names = model.names
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            detections.append({
                "class_id": cls_id,
                "class_name": class_names[cls_id],
                "confidence": round(conf, 3)
            })

    return jsonify({"detections": detections})

if __name__ == '__main__':
    app.run(debug=True,port=5000)