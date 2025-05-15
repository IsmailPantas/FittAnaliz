import cv2
import mediapipe as mp
import numpy as np
import sys
import json
import os

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

def calculate_bmi(weight, height):
    # BMI = weight (kg) / (height (m))^2
    height_m = height / 100
    return round(weight / (height_m ** 2), 2)

def calculate_bmr(weight, height, age, gender):
    # Mifflin-St Jeor Equation
    if gender == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    return round(bmr)

def calculate_daily_calories(bmr, activity_level):
    activity_multipliers = {
        'sedentary': 1.2,      # Hareketsiz
        'light': 1.375,        # Hafif aktif
        'moderate': 1.55,      # Orta aktif
        'very': 1.725,         # Çok aktif
        'extra': 1.9           # Ekstra aktif
    }
    return round(bmr * activity_multipliers[activity_level])

def calculate_body_fat_percentage(bmi, age, gender):
    # Basit bir vücut yağ oranı hesaplama formülü
    if gender == 'male':
        body_fat = (1.20 * bmi) + (0.23 * age) - 16.2
    else:
        body_fat = (1.20 * bmi) + (0.23 * age) - 5.4
    return round(body_fat, 2)

def calculate_ideal_weight(height, gender):
    # Devine Formula
    if gender == 'male':
        ideal_weight = 50 + 2.3 * ((height / 2.54) - 60)
    else:
        ideal_weight = 45.5 + 2.3 * ((height / 2.54) - 60)
    return round(ideal_weight * 0.45359237, 2)  # Convert to kg

def calculate_body_fat(hip_width, shoulder_width, height_px, gender="male"):
    try:
        whr = hip_width / shoulder_width if shoulder_width > 0 else 0

        if gender == "male":
            body_fat = 495 / (1.0324 - 0.19077 * np.log10(hip_width) + 0.15456 * np.log10(height_px)) - 450
        else:
            body_fat = 495 / (1.29579 - 0.35004 * np.log10(hip_width + shoulder_width) + 0.22100 * np.log10(height_px)) - 450

        return round(body_fat, 2), round(whr, 2)
    except Exception as e:
        print(json.dumps({"error": f"Vücut yağ oranı hesaplanırken hata: {str(e)}"}))
        sys.exit(1)

def calculate_body_ratios(landmarks, image_shape, gender="male"):
    try:
        h, w, _ = image_shape
        def get_point(landmark):
            return int(landmark.x * w), int(landmark.y * h)

        # Gerekli noktaları al
        left_hip = get_point(landmarks[mp_pose.PoseLandmark.LEFT_HIP])
        right_hip = get_point(landmarks[mp_pose.PoseLandmark.RIGHT_HIP])
        left_shoulder = get_point(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER])
        right_shoulder = get_point(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER])
        left_ankle = get_point(landmarks[mp_pose.PoseLandmark.LEFT_ANKLE])
        right_ankle = get_point(landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE])

        # Mesafeleri hesapla
        hip_width = np.linalg.norm(np.array(left_hip) - np.array(right_hip))
        shoulder_width = np.linalg.norm(np.array(left_shoulder) - np.array(right_shoulder))
        height_px = np.linalg.norm(np.array(left_ankle) - np.array(left_shoulder))

        # Vücut yağ oranını hesapla
        body_fat, whr = calculate_body_fat(hip_width, shoulder_width, height_px, gender)

        return {
            "Vücut Yağ Oranı (%)": body_fat,
            "Bel-Kalça Oranı (WHR)": whr,
            "Omuz Genişliği (px)": round(shoulder_width, 2),
            "Kalça Genişliği (px)": round(hip_width, 2),
            "Boy Uzunluğu (px)": round(height_px, 2),
        }
    except Exception as e:
        print(json.dumps({"error": f"Vücut oranları hesaplanırken hata: {str(e)}"}))
        sys.exit(1)

def analyze_body(image_path, gender="male"):
    try:
        # Görüntüyü oku
        image = cv2.imread(image_path)
        if image is None:
            print(json.dumps({"error": "Görüntü yüklenemedi!"}))
            sys.exit(1)

        # MediaPipe Pose'u başlat
        with mp_pose.Pose(
            static_image_mode=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        ) as pose:
            # Görüntüyü RGB'ye çevir
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)

            if not results.pose_landmarks:
                print(json.dumps({"error": "Vücut noktaları tespit edilemedi!"}))
                sys.exit(1)

            # Vücut oranlarını hesapla
            body_ratios = calculate_body_ratios(results.pose_landmarks.landmark, image.shape, gender)

            # Sonuçları JSON olarak döndür
            print(json.dumps(body_ratios))

    except Exception as e:
        print(json.dumps({"error": f"Analiz sırasında hata: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Görüntü yolu belirtilmedi!"}))
        sys.exit(1)

    image_path = sys.argv[1]
    gender = sys.argv[2] if len(sys.argv) > 2 else "male"

    if not os.path.exists(image_path):
        print(json.dumps({"error": "Görüntü dosyası bulunamadı!"}))
        sys.exit(1)

    analyze_body(image_path, gender) 