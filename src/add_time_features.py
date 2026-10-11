import pandas as pd
import numpy as np

# -----------------------------
# 1. Load dataset
# -----------------------------
df = pd.read_csv("data/plant1_with_solar.csv")

# Convert timestamp
df["DATE_TIME"] = pd.to_datetime(df["DATE_TIME"])

# -----------------------------
# 2. Extract time information
# -----------------------------
minutes_since_midnight = (
    df["DATE_TIME"].dt.hour * 60
    + df["DATE_TIME"].dt.minute
)

day_of_year = df["DATE_TIME"].dt.dayofyear

# -----------------------------
# 3. Cyclic time-of-day features
# -----------------------------
df["hour_sin"] = np.sin(
    2 * np.pi * minutes_since_midnight / 1440
)

df["hour_cos"] = np.cos(
    2 * np.pi * minutes_since_midnight / 1440
)

# -----------------------------
# 4. Cyclic seasonal features
# -----------------------------
df["day_of_year_sin"] = np.sin(
    2 * np.pi * day_of_year / 365
)

df["day_of_year_cos"] = np.cos(
    2 * np.pi * day_of_year / 365
)

# -----------------------------
# 5. Save final feature dataset
# -----------------------------
df.to_csv(
    "data/plant1_features.csv",
    index=False
)

# -----------------------------
# 6. Display results
# -----------------------------
print("\nUpdated dataset:")
print(df.head())

print("\nColumns:")
print(df.columns.tolist())

print("\nShape:")
print(df.shape)

print("\nTime features:")
print(
    df[
        [
            "DATE_TIME",
            "hour_sin",
            "hour_cos",
            "day_of_year_sin",
            "day_of_year_cos"
        ]
    ].head(10)
)