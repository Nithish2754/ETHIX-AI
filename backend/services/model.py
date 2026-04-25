import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

class ModelService:
    def __init__(self):
        self.model_path = os.path.join(MODEL_DIR, "ethix_model.joblib")
        self.encoder_path = os.path.join(MODEL_DIR, "encoders.joblib")
        self.features_path = os.path.join(MODEL_DIR, "features.joblib")
        self.model = None
        self.encoders = {}
        self.feature_names = None

    def train(self, df: pd.DataFrame, target_col: str):
        # Preprocessing
        df_clean = df.copy()
        for col in df_clean.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            df_clean[col] = le.fit_transform(df_clean[col].astype(str))
            self.encoders[col] = le
            
        X = df_clean.drop(columns=[target_col])
        self.feature_names = X.columns.tolist()
        y = df_clean[target_col]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)
        
        # Save model and encoders
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.encoders, self.encoder_path)
        joblib.dump(self.feature_names, self.features_path)
        
        return {"accuracy": float(self.model.score(X_test, y_test))}

    def predict(self, input_data: dict, apply_correction: bool = False, sensitive_attr: str = "gender"):
        if not self.model:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                self.encoders = joblib.load(self.encoder_path)
                self.feature_names = joblib.load(self.features_path)
            else:
                raise Exception("Model not trained")

        df = pd.DataFrame([input_data])
        
        # Ensure all training features are present (fill with 0 if missing)
        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0
                
        # Reorder to match training
        df = df[self.feature_names]
        # Encode
        for col, le in self.encoders.items():
            if col in df.columns:
                try:
                    df[col] = le.transform(df[col].astype(str))
                except:
                    df[col] = 0 # Fallback for unseen

        probs = self.model.predict_proba(df)[0]
        raw_pred = int(np.argmax(probs))
        
        corrected_pred = raw_pred
        if apply_correction:
            # Simple threshold adjustment for demo
            # If sensitive attribute value indicates potentially disadvantaged group (e.g. female)
            # Lower the threshold for positive outcome
            is_disadvantaged = str(input_data.get(sensitive_attr, "")).lower() == "female"
            if is_disadvantaged and probs[1] > 0.4:
                corrected_pred = 1
                
        return {
            "original_prediction": raw_pred,
            "corrected_prediction": corrected_pred,
            "probabilities": probs.tolist()
        }

    def counterfactual(self, input_data: dict, sensitive_attr: str):
        # Original prediction
        orig = self.predict(input_data)
        
        # Flip sensitive attribute
        cf_data = input_data.copy()
        val = str(cf_data.get(sensitive_attr, "")).lower()
        if val == "male":
            cf_data[sensitive_attr] = "female"
        elif val == "female":
            cf_data[sensitive_attr] = "male"
            
        cf_result = self.predict(cf_data)
        
        return {
            "original": orig["original_prediction"],
            "counterfactual": cf_result["original_prediction"],
            "bias_flag": orig["original_prediction"] != cf_result["original_prediction"]
        }
