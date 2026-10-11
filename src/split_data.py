import pandas as pd

# -----------------------------
# 1. Load final feature dataset
# -----------------------------
df = pd.read_csv("data/plant1_features.csv")

# Convert timestamp
df["DATE_TIME"] = pd.to_datetime(df["DATE_TIME"])

# Make sure data is chronological
df = df.sort_values("DATE_TIME").reset_index(drop=True)

# -----------------------------
# 2. Calculate split sizes
# -----------------------------
n = len(df)

train_end = int(n * 0.70)
validation_end = int(n * 0.85)

# -----------------------------
# 3. Chronological split
# -----------------------------
train_df = df.iloc[:train_end].copy()

validation_df = df.iloc[
    train_end:validation_end
].copy()

test_df = df.iloc[
    validation_end:
].copy()

# -----------------------------
# 4. Save the splits
# -----------------------------
train_df.to_csv(
    "data/train.csv",
    index=False
)

validation_df.to_csv(
    "data/validation.csv",
    index=False
)

test_df.to_csv(
    "data/test.csv",
    index=False
)

# -----------------------------
# 5. Print information
# -----------------------------
print("\nDataset split complete!")

print("\nTrain:")
print("Rows:", len(train_df))
print("Start:", train_df["DATE_TIME"].min())
print("End:", train_df["DATE_TIME"].max())

print("\nValidation:")
print("Rows:", len(validation_df))
print("Start:", validation_df["DATE_TIME"].min())
print("End:", validation_df["DATE_TIME"].max())

print("\nTest:")
print("Rows:", len(test_df))
print("Start:", test_df["DATE_TIME"].min())
print("End:", test_df["DATE_TIME"].max())