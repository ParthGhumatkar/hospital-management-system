import pandas as pd
import numpy as np

np.random.seed(42)

n = 3000  # number of patients

# Demographics & vitals
df = pd.DataFrame({
    'Age': np.random.randint(1, 90, n),
    'Gender': np.random.choice(['Male', 'Female'], n),
    'BMI': np.round(np.random.uniform(15, 40, n), 1),
    'Temperature': np.round(np.random.uniform(36, 40, n), 1),
    'HeartRate': np.random.randint(60, 120, n),
    'SystolicBP': np.random.randint(90, 180, n),
    'DiastolicBP': np.random.randint(60, 120, n),
    'SpO2': np.random.randint(85, 100, n),
    'BloodSugar': np.random.randint(70, 250, n),
})

# Symptoms
symptoms = ['Fever', 'Cough', 'Fatigue', 'DifficultyBreathing', 'ChestPain', 'Nausea']
for s in symptoms:
    df[s] = np.random.choice([0, 1], n, p=[0.8, 0.2])  # 20% chance symptom

# History
histories = ['History_Diabetes', 'History_Hypertension', 'History_Asthma']
for h in histories:
    df[h] = np.random.choice([0, 1], n, p=[0.8, 0.2])

# Multi-label disease targets
df['Flu'] = np.random.choice([0, 1], n, p=[0.95, 0.05])
df['COVID'] = np.random.choice([0, 1], n, p=[0.97, 0.03])
df['Pneumonia'] = np.random.choice([0, 1], n, p=[0.99, 0.01])
df['Asthma'] = df['History_Asthma']
df['Diabetes'] = df['History_Diabetes']
df['Hypertension'] = df['History_Hypertension']
df['HeartDisease'] = np.random.choice([0, 1], n, p=[0.97, 0.03])

# Save CSV
df.to_csv("multi_disease_dataset.csv", index=False)
print("Dataset saved as multi_disease_dataset.csv")
