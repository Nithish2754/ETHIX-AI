import shap
import pandas as pd
import joblib
import os

class ExplainService:
    @staticmethod
    def get_feature_importance(input_data: dict, model_path: str, encoders_path: str):
        if not os.path.exists(model_path):
            return {"error": "Model not found"}
            
        model = joblib.load(model_path)
        encoders = joblib.load(encoders_path)
        
        df = pd.DataFrame([input_data])
        for col, le in encoders.items():
            if col in df.columns:
                try:
                    df[col] = le.transform(df[col].astype(str))
                except:
                    df[col] = 0 # Fallback for unseen values
        
        # Ensure all columns are numeric before passing to SHAP
        for col in df.columns:
            if df[col].dtype == 'object':
                try:
                    df[col] = pd.to_numeric(df[col])
                except:
                    df[col] = 0 # Final fallback for non-numeric columns not in encoders
                
        # For Tree models like RandomForest, use TreeExplainer
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(df)
        
        if isinstance(shap_values, list):
            # List of arrays, one per class
            sv = shap_values[1][0]
        elif hasattr(shap_values, "values"):
            # Explanation object
            sv = shap_values.values[0]
            if len(sv.shape) > 1: sv = sv[:, 1]
        elif len(shap_values.shape) == 3:
            # Multi-class array (samples, features, classes)
            sv = shap_values[0, :, 1]
        else:
            # Standard 2D array (samples, features)
            sv = shap_values[0]
            
        feature_importance = []
        feature_names = df.columns.tolist()
        
        for name, val in zip(feature_names, sv):
            feature_importance.append({
                "feature": name,
                "importance": round(float(val), 4)
            })
            
        # Sort by importance
        feature_importance = sorted(feature_importance, key=lambda x: abs(x["importance"]), reverse=True)
            
        return {"feature_importance": feature_importance}
