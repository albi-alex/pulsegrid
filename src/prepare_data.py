import pandas as pd

# -----------------------------
# 1. Load the data
# -----------------------------

generation = pd.read_csv(
    "data/Plant_1_Generation_Data.csv"
)

weather = pd.read_csv(
    "data/Plant_1_Weather_Sensor_Data.csv"
)

# -----------------------------
# 2. Convert timestamps
# -----------------------------

generation["DATE_TIME"] = pd.to_datetime(
    generation["DATE_TIME"],
    format="%d-%m-%Y %H:%M"
)

weather["DATE_TIME"] = pd.to_datetime(
    weather["DATE_TIME"]
)

# -----------------------------
# 3. Aggregate inverter power
# -----------------------------

plant_power = (
    generation
    .groupby("DATE_TIME", as_index=False)["AC_POWER"]
    .sum()
)

# -----------------------------
# 4. Select weather columns
# -----------------------------

weather = weather[
    [
        "DATE_TIME",
        "AMBIENT_TEMPERATURE",
        "MODULE_TEMPERATURE",
        "IRRADIATION"
    ]
]

# -----------------------------
# 5. Merge power + weather
# -----------------------------

df = pd.merge(
    plant_power,
    weather,
    on="DATE_TIME",
    how="inner"
)

# -----------------------------
# 6. Sort chronologically
# -----------------------------

df = df.sort_values("DATE_TIME").reset_index(drop=True)

# -----------------------------
# 7. Remove rows with missing values
# -----------------------------

df = df.dropna().reset_index(drop=True)

# -----------------------------
# 8. Check time continuity
# -----------------------------

time_diff = df["DATE_TIME"].diff()

df["CONTINUOUS"] = (
    time_diff == pd.Timedelta(minutes=15)
)

# First row starts a valid sequence
df.loc[0, "CONTINUOUS"] = True

# -----------------------------
# 9. Save clean dataset
# -----------------------------

df.to_csv(
    "data/plant1_clean.csv",
    index=False
)

# -----------------------------
# 10. Display information
# -----------------------------

print("\nClean dataset created successfully!")

print("\nShape:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nNumber of gaps:")
print((~df["CONTINUOUS"]).sum())

print("\nFirst 5 rows:")
print(df.head())

print("\nLast 5 rows:")
print(df.tail())