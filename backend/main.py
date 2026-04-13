from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import os
import uvicorn
import time

from database.mongo import db
from services.bias import BiasService
from services.model import ModelService
from services.explain import ExplainService
from services.repair import RepairService

app = FastAPI(title="ETHIX AI - Expert Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_service = ModelService()
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class PredictionInput(BaseModel):
    data: Dict[str, Any]
    sensitive_attr: str = "gender"
    apply_correction: bool = True

class CounterfactualInput(BaseModel):
    data: Dict[str, Any]
    sensitive_attr: str

@app.get("/")
async def root():
    return {"status": "ETHIX AI Expert Backend Active"}

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        df = pd.read_csv(file_path)
        return {"filename": file.filename, "rows": len(df), "columns": df.columns.tolist()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze-bias")
async def analyze_bias(filename: str, target_col: str, sensitive_col: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path): raise HTTPException(status_code=404, detail="File not found")
    df = pd.read_csv(file_path)
    return BiasService.calculate_fairness_metrics(df, target_col, sensitive_col)

@app.post("/train-model")
async def train_model(filename: str, target_col: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path): raise HTTPException(status_code=404, detail="File not found")
    df = pd.read_csv(file_path)
    return model_service.train(df, target_col)

@app.post("/predict")
async def predict(payload: PredictionInput):
    try:
        result = model_service.predict(payload.data, payload.apply_correction, payload.sensitive_attr)
        db.log_prediction({"input": payload.data, "output": result, "bias_flag": result["original_prediction"] != result["corrected_prediction"]})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/counterfactual")
async def counterfactual(payload: CounterfactualInput):
    return model_service.counterfactual(payload.data, payload.sensitive_attr)

@app.get("/explain")
async def explain(age: int, income: float, gender: str, education: str):
    data = {"age": age, "income": income, "gender": gender, "education": education}
    return ExplainService.get_feature_importance(data, model_service.model_path, model_service.encoder_path)

@app.post("/repair-dataset")
async def repair_dataset(filename: str, target_col: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path): raise HTTPException(status_code=404, detail="File not found")
    df = pd.read_csv(file_path)
    return RepairService.fix_imbalance(df, target_col)

@app.get("/fairness-score")
async def fairness_score(filename: str, target_col: str, sensitive_col: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path): raise HTTPException(status_code=404, detail="File not found")
    df = pd.read_csv(file_path)
    metrics = BiasService.calculate_fairness_metrics(df, target_col, sensitive_col)
    return BiasService.get_fairness_score(metrics)

@app.get("/logs")
async def get_logs():
    logs = db.get_logs()
    for log in logs:
        if "_id" in log: log["_id"] = str(log["_id"])
    return logs

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
