from imblearn.over_sampling import SMOTE
import pandas as pd
from sklearn.preprocessing import LabelEncoder

class RepairService:
    @staticmethod
    def fix_imbalance(df: pd.DataFrame, target_col: str):
        df_encoded = df.copy()
        encoders = {}
        
        # Encode categorical for SMOTE
        for col in df_encoded.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
            encoders[col] = le
            
        X = df_encoded.drop(columns=[target_col])
        y = df_encoded[target_col]
        
        smote = SMOTE(random_state=42)
        X_res, y_res = smote.fit_resample(X, y)
        
        # Reconsolidate
        df_res = pd.DataFrame(X_res, columns=X.columns)
        df_res[target_col] = y_res
        
        # Decode back for CSV return if needed, but usually we return stats
        # For this module, we return the repaired stats
        
        return {
            "original_size": len(df),
            "repaired_size": len(df_res),
            "class_distribution": y_res.value_counts().to_dict(),
            "status": "Balanced using SMOTE"
        }
