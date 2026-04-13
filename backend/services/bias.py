import pandas as pd
from fairlearn.metrics import (
    demographic_parity_difference,
    equal_opportunity_difference
)

class BiasService:
    @staticmethod
    def calculate_fairness_metrics(df: pd.DataFrame, target_col: str, sensitive_col: str, predictions=None):
        if predictions is None:
            # If no predictions provided, use actual targets as a baseline
            predictions = df[target_col]
        
        sensitive_features = df[sensitive_col]
        y_true = df[target_col]
        
        # Demographic Parity Difference
        dp_diff = demographic_parity_difference(
            y_true, predictions, sensitive_features=sensitive_features
        )
        
        # Equal Opportunity Difference
        eo_diff = equal_opportunity_difference(
            y_true, predictions, sensitive_features=sensitive_features
        )
        
        # Detailed group rates for charts
        groups = df.groupby(sensitive_col)[target_col].mean().to_dict()
        detailed_metrics = []
        for group, rate in groups.items():
            detailed_metrics.append({"group": str(group), "rate": round(float(rate), 4)})
            
        bias_detected = dp_diff > 0.1 or eo_diff > 0.1
        
        return {
            "attribute": sensitive_col,
            "metrics": detailed_metrics,
            "demographic_parity": round(float(dp_diff), 4),
            "equal_opportunity": round(float(eo_diff), 4),
            "bias_score": round(float(dp_diff), 4), # Alias for frontend
            "bias_detected": bool(bias_detected)
        }

    @staticmethod
    def get_fairness_score(metrics: dict):
        # Weighted score out of 100
        dp = metrics["demographic_parity"]
        eo = metrics["equal_opportunity"]
        
        score = 100 - (dp * 50 + eo * 50)
        score = max(0, min(100, score))
        
        risk_level = "High" if score < 60 else "Medium" if score < 85 else "Low"
        
        suggestions = []
        if dp > 0.1:
            suggestions.append("High demographic disparity found. Consider reweighing samples.")
        if eo > 0.1:
            suggestions.append("Equal opportunity gap detected. Try threshold adjustment.")
            
        return {
            "fairness_score": int(score),
            "risk_level": risk_level,
            "suggestions": suggestions
        }
