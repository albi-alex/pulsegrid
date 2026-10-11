import pandas as pd
import joblib
from sklearn.preprocessing import MinMaxScaler

# -----------------------------
# 1. Load datasets
# -----------------------------
train_df = pd.read_csv("data/train.csv")
validation_df = pd.read_csv("data/validation.csv")
test_df = pd.read_csv("data/test.csv")

# -----------------------------
# 2. Define model features
# -----------------------------
feature_columns = [
    "AC_POWER",
    "AMBIENT_TEMPERATURE",
    "MODULE_TEMPERATURE",
    "IRRADIATION",
    "solar_elevation",
    "solar_azimuth",
    "hour_sin",
    "hour_cos",
    "day_of_year_sin",
    "day_of_year_cos"
]

target_column = "AC_POWER"

# -----------------------------
# 3. Create scalers
# -----------------------------
feature_scaler = MinMaxScaler()
target_scaler = MinMaxScaler()

# -----------------------------
# 4. Fit ONLY on training data
# -----------------------------
feature_scaler.fit(train_df[feature_columns])
target_scaler.fit(train_df[[target_column]])

# -----------------------------
# 5. Transform datasets
# -----------------------------
train_scaled = train_df.copy()
validation_scaled = validation_df.copy()
test_scaled = test_df.copy()

train_scaled[feature_columns] = feature_scaler.transform(
    train_df[feature_columns]
)

validation_scaled[feature_columns] = feature_scaler.transform(
    validation_df[feature_columns]
)

test_scaled[feature_columns] = feature_scaler.transform(
    test_df[feature_columns]
)

# Scale target separately
train_scaled[target_column] = target_scaler.transform(
    train_df[[target_column]]
).ravel()

validation_scaled[target_column] = target_scaler.transform(
    validation_df[[target_column]]
).ravel()

test_scaled[target_column] = target_scaler.transform(
    test_df[[target_column]]
).ravel()

# -----------------------------
# 6. Save scaled datasets
# -----------------------------
train_scaled.to_csv("data/train_scaled.csv", index=False)
validation_scaled.to_csv("data/validation_scaled.csv", index=False)
test_scaled.to_csv("data/test_scaled.csv", index=False)

# -----------------------------
# 7. Save scalers
# -----------------------------
joblib.dump(
    feature_scaler,
    "models/feature_scaler.pkl"
)

joblib.dump(
    target_scaler,
    "models/target_scaler.pkl"
)

# -----------------------------
# 8. Save feature list
# -----------------------------
with open("models/feature_columns.txt", "w") as f:
    for feature in feature_columns:
        f.write(feature + "\n")

# -----------------------------
# 9. Print results
# -----------------------------
print("\nScaling complete!")

print("\nFeature columns:")
print(feature_columns)

print("\nOriginal training AC_POWER:")
print(train_df["AC_POWER"].head().tolist())

print("\nScaled training AC_POWER:")
print(train_scaled["AC_POWER"].head().tolist())

print("\nScaled feature ranges in training data:")

for column in feature_columns:
    print(
        f"{column}: "
        f"min={train_scaled[column].min():.4f}, "
        f"max={train_scaled[column].max():.4f}"
    )