# from fastapi import FastAPI, UploadFile, File, Request
# from fastapi.responses import HTMLResponse
# from fastapi.templating import Jinja2Templates
# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import FileResponse

# import mediapipe as mp

# from mediapipe.tasks import python
# from mediapipe.tasks.python import vision

# import tensorflow as tf
# import numpy as np
# import cv2
# import json


# app = FastAPI(
#     title="Bharatiya Natya Mudra Recognition API"
# )

# app.mount(
#     "/static",
#     StaticFiles(directory="static"),
#     name="static"
# )


# IMG_SIZE = 224

# MODEL_PATH = "mudra_cnn_final.keras"
# MAPPING_PATH = "class_mapping.json"


# # ============================================================
# # LOAD MODEL
# # ============================================================

# print("Loading CNN model...")

# model = tf.keras.models.load_model(
#     MODEL_PATH
# )

# print("CNN model loaded successfully.")


# # ============================================================
# # LOAD CLASS MAPPING
# # ============================================================

# with open(MAPPING_PATH, "r") as f:
#     class_mapping = json.load(f)

# print("Class mapping loaded successfully.")


# # ============================================================
# # MEDIAPIPE HAND DETECTOR
# # ============================================================

# # mp_hands = mp.solutions.hands

# # hands = mp_hands.Hands(
# #     static_image_mode=False,
# #     max_num_hands=1,
# #     min_detection_confidence=0.5,
# #     min_tracking_confidence=0.5
# # )

# print("Loading MediaPipe Hand Landmarker...")

# base_options = python.BaseOptions(
#     model_asset_path="hand_landmarker.task"
# )

# hand_options = vision.HandLandmarkerOptions(
#     base_options=base_options,
#     running_mode=vision.RunningMode.IMAGE,
#     num_hands=1,
#     min_hand_detection_confidence=0.5,
#     min_hand_presence_confidence=0.5,
#     min_tracking_confidence=0.5
# )

# hand_landmarker = vision.HandLandmarker.create_from_options(
#     hand_options
# )

# print("MediaPipe Hand Landmarker loaded successfully.")


# # ============================================================
# # TEMPLATES
# # ============================================================

# templates = Jinja2Templates(
#     directory="templates"
# )


# # ============================================================
# # IMAGE PREPROCESSING
# # ============================================================

# def preprocess_image(image_bytes):

#     image_array = np.frombuffer(
#         image_bytes,
#         dtype=np.uint8
#     )

#     image = cv2.imdecode(
#         image_array,
#         cv2.IMREAD_COLOR
#     )

#     if image is None:
#         raise ValueError("Invalid image.")

#     image = cv2.cvtColor(
#         image,
#         cv2.COLOR_BGR2RGB
#     )

#     image = cv2.resize(
#         image,
#         (IMG_SIZE, IMG_SIZE),
#         interpolation=cv2.INTER_AREA
#     )

#     image = image.astype(
#         np.float32
#     ) / 255.0

#     image = np.expand_dims(
#         image,
#         axis=0
#     )

#     return image


# # ============================================================
# # HOME PAGE
# # ============================================================

# @app.get("/", response_class=HTMLResponse)
# async def home(request: Request):

#     return templates.TemplateResponse(
#         request=request,
#         name="index.html",
#         context={}
#     )


# # ============================================================
# # API STATUS
# # ============================================================

# @app.get("/api/status")
# def status():

#     return {
#         "status": "running",
#         "service": "Bharatiya Natya Mudra Recognition API"
#     }


# @app.get("/hand_landmarker.task")
# async def hand_landmarker_model():
#     return FileResponse(
#         "hand_landmarker.task",
#         media_type="application/octet-stream"
#     )

# # ============================================================
# # IMAGE PREDICTION
# # ============================================================

# @app.post("/predict")
# async def predict(
#     file: UploadFile = File(...)
# ):

#     image_bytes = await file.read()

#     input_image = preprocess_image(
#         image_bytes
#     )

#     probabilities = model.predict(
#         input_image,
#         verbose=0
#     )

#     probabilities = np.asarray(
#         probabilities
#     ).reshape(-1)

#     predicted_id = int(
#         np.argmax(probabilities)
#     )

#     confidence = float(
#         probabilities[predicted_id]
#     )

#     predicted_mudra = class_mapping[
#         str(predicted_id)
#     ]

#     return {
#         "mudra": predicted_mudra,
#         "confidence": round(
#             confidence * 100,
#             2
#         ),
#         "class_id": predicted_id
#     }
    
    
# # ============================================================
# # LIVE CAMERA PREDICTION
# # ============================================================

# @app.post("/live_predict")
# async def live_predict(
#     file: UploadFile = File(...)
# ):

#     contents = await file.read()

#     # ========================================================
#     # DECODE IMAGE
#     # ========================================================

#     np_arr = np.frombuffer(
#         contents,
#         dtype=np.uint8
#     )

#     frame = cv2.imdecode(
#         np_arr,
#         cv2.IMREAD_COLOR
#     )

#     if frame is None:

#         return {
#             "detected": False,
#             "error": "Invalid image"
#         }

#     # ========================================================
#     # BGR -> RGB
#     # ========================================================

#     rgb = cv2.cvtColor(
#         frame,
#         cv2.COLOR_BGR2RGB
#     )

#     # ========================================================
#     # MEDIAPIPE IMAGE
#     # ========================================================

#     mp_image = mp.Image(
#         image_format=mp.ImageFormat.SRGB,
#         data=rgb
#     )

#     # ========================================================
#     # HAND DETECTION
#     # ========================================================

#     result = hand_landmarker.detect(
#         mp_image
#     )

#     if not result.hand_landmarks:

#         return {
#             "detected": False,
#             "mudra": None,
#             "confidence": 0,
#             "landmarks": []
#         }

#     # First detected hand
#     hand_landmarks = result.hand_landmarks[0]

#     height, width, _ = rgb.shape

#     # ========================================================
#     # CONVERT LANDMARKS TO PIXEL COORDINATES
#     # ========================================================

#     points = []

#     for landmark in hand_landmarks:

#         x = int(
#             landmark.x * width
#         )

#         y = int(
#             landmark.y * height
#         )

#         points.append({
#             "x": x,
#             "y": y
#         })

#     # ========================================================
#     # GET HAND BOUNDING BOX
#     # ========================================================

#     x_coords = [
#         point["x"]
#         for point in points
#     ]

#     y_coords = [
#         point["y"]
#         for point in points
#     ]

#     x_min = min(x_coords)
#     x_max = max(x_coords)

#     y_min = min(y_coords)
#     y_max = max(y_coords)

#     # ========================================================
#     # ADD MARGIN
#     # ========================================================

#     margin = 40

#     x_min = max(
#         0,
#         x_min - margin
#     )

#     y_min = max(
#         0,
#         y_min - margin
#     )

#     x_max = min(
#         width,
#         x_max + margin
#     )

#     y_max = min(
#         height,
#         y_max + margin
#     )

#     # ========================================================
#     # CROP HAND
#     # ========================================================

#     hand_crop = rgb[
#         y_min:y_max,
#         x_min:x_max
#     ]

#     if hand_crop.size == 0:

#         return {
#             "detected": False,
#             "mudra": None,
#             "confidence": 0,
#             "landmarks": []
#         }

#     # ========================================================
#     # CNN PREPROCESSING
#     # ========================================================

#     hand_crop = cv2.resize(
#         hand_crop,
#         (IMG_SIZE, IMG_SIZE),
#         interpolation=cv2.INTER_AREA
#     )

#     hand_crop = (
#         hand_crop.astype(
#             np.float32
#         ) / 255.0
#     )

#     hand_crop = np.expand_dims(
#         hand_crop,
#         axis=0
#     )

#     # ========================================================
#     # CNN PREDICTION
#     # ========================================================

#     probabilities = model.predict(
#         hand_crop,
#         verbose=0
#     )

#     probabilities = np.asarray(
#         probabilities
#     ).reshape(-1)

#     predicted_id = int(
#         np.argmax(probabilities)
#     )

#     confidence = float(
#         probabilities[predicted_id]
#     )

#     predicted_mudra = class_mapping[
#         str(predicted_id)
#     ]

#     # ========================================================
#     # RETURN RESULT
#     # ========================================================

#     return {

#         "detected": True,

#         "mudra": predicted_mudra,

#         "confidence": round(
#             confidence * 100,
#             2
#         ),

#         "class_id": predicted_id,

#         "landmarks": points,

#         "bbox": {
#             "x": x_min,
#             "y": y_min,
#             "width": x_max - x_min,
#             "height": y_max - y_min
#         }
#     }















































from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

import tensorflow as tf
import numpy as np
import cv2
import json


app = FastAPI(
    title="Bharatiya Natya Mudra Recognition API"
)


# ============================================================
# STATIC FILES
# ============================================================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


# ============================================================
# CONFIGURATION
# ============================================================

IMG_SIZE = 224

MODEL_PATH = "mudra_cnn_final.keras"
MAPPING_PATH = "class_mapping.json"


# ============================================================
# LOAD CNN MODEL
# ============================================================

print("Loading CNN model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("CNN model loaded successfully.")


# ============================================================
# LOAD CLASS MAPPING
# ============================================================

with open(MAPPING_PATH, "r") as f:
    class_mapping = json.load(f)

print("Class mapping loaded successfully.")


# ============================================================
# TEMPLATES
# ============================================================

templates = Jinja2Templates(
    directory="templates"
)


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_image(image_bytes):

    image_array = np.frombuffer(
        image_bytes,
        dtype=np.uint8
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise ValueError("Invalid image")

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    image = cv2.resize(
        image,
        (IMG_SIZE, IMG_SIZE)
    )

    image = image.astype(
        np.float32
    ) / 255.0

    image = np.expand_dims(
        image,
        axis=0
    )

    return image


# ============================================================
# HOME PAGE
# ============================================================

@app.get(
    "/",
    response_class=HTMLResponse
)
async def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )


# ============================================================
# API STATUS
# ============================================================

@app.get("/api/status")
def status():

    return {
        "status": "running",
        "service": "Bharatiya Natya Mudra Recognition API"
    }


# ============================================================
# MEDIAPIPE MODEL FOR BROWSER
# ============================================================

@app.get("/hand_landmarker.task")
async def hand_landmarker_model():

    return FileResponse(
        "hand_landmarker.task",
        media_type="application/octet-stream"
    )


# ============================================================
# IMAGE PREDICTION
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    image_bytes = await file.read()

    try:

        input_image = preprocess_image(
            image_bytes
        )

    except ValueError:

        return {
            "mudra": None,
            "confidence": 0,
            "class_id": None,
            "error": "Invalid image"
        }

    probabilities = model.predict(
        input_image,
        verbose=0
    )

    probabilities = np.asarray(
        probabilities
    ).reshape(-1)

    predicted_id = int(
        np.argmax(probabilities)
    )

    confidence = float(
        probabilities[predicted_id]
    )

    predicted_mudra = class_mapping[
        str(predicted_id)
    ]

    return {
        "mudra": predicted_mudra,
        "confidence": round(
            confidence * 100,
            2
        ),
        "class_id": predicted_id
    }
