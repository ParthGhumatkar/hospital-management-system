# multi_disease_model_train.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
import joblib

# -----------------------
# Step 1: Load dataset
# -----------------------
df = pd.read_csv("multi_disease_dataset.csv")

# -----------------------
# Step 2: Encode categorical features
# -----------------------
le_gender = LabelEncoder()
df['Gender'] = le_gender.fit_transform(df['Gender'])

# -----------------------
# Step 3: Prepare features and targets
# -----------------------
X = df.drop(['Flu','COVID','Pneumonia','Asthma','Diabetes','Hypertension','HeartDisease'], axis=1)
y = df[['Flu','COVID','Pneumonia','Asthma','Diabetes','Hypertension','HeartDisease']]

# -----------------------
# Step 4: Split into train/test
# -----------------------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# -----------------------
# Step 5: Train Multi-output Random Forest
# -----------------------
rf = RandomForestClassifier(n_estimators=200, random_state=42)
multi_model = MultiOutputClassifier(rf, n_jobs=-1)
multi_model.fit(X_train, y_train)

# -----------------------
# Step 6: Save model and encoders
# -----------------------
joblib.dump(multi_model, "multi_disease_model.pkl")
joblib.dump(le_gender, "le_gender.pkl")

# -----------------------
# Step 7: Evaluate model
# -----------------------
score = multi_model.score(X_test, y_test)  # subset accuracy
print(f"Model trained. Test subset accuracy: {score:.3f}")
