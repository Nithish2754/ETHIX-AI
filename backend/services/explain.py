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
                df[col] = le.transform(df[col].astype(str))
                
        # For Tree models like RandomForest, use TreeExplainer
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(df)
        
        # Take values for class 1 if binary classification
        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0]
            
        feature_importance = []
        feature_names = df.columns.tolist()
        
        for name, val in zip(feature_names, sv):
            feature_importance.append({
                "feature": name,
                "impact": round(float(val), 4)
            })
            
        # Sort by impact
        feature_importance = sorted(feature_importance, key=lambda x: abs(x["impact"]), reverse=True)
            
        return {"feature_importance": feature_importance}
