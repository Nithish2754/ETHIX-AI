# ETHIX AI Setup Instructions

## 🎯 Platform Overview
ETHIX AI is a Real-Time AI Bias Detection & Fairness Correction system.

---

## 🛠 Prerequisites
- Node.js (v18+)
- Python (3.9+)

---

## 🚀 How to Run Locally

### 1. Backend Setup
1. Open a terminal in the `backend` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   python main.py
   ```
   *The API will run at http://localhost:8000*

### 2. Frontend Setup
1. Open a new terminal in the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The UI will run at http://localhost:5173*

---

## 🧪 Demo Walkthrough
1. **Home**: Explore the features of ETHIX AI.
2. **Upload**: Use the `sample_dataset.csv` provided in the backend folder. After upload, click **Analyze Architecture**.
3. **Train**: Click **Train Bias-Aware Model** to prepare the system.
4. **Dashboard**: Observe the bias score and demographic parity charts.
5. **Predict**: Enter user details (try flipping gender from Female to Male) to see how the system corrects for historical bias.
6. **Logs**: Verify the cryptographic hashes in the transparency ledger.
