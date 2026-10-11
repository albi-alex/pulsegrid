import pandas as pd
import pvlib

# -----------------------------
# 1. Load cleaned dataset
# -----------------------------
df = pd.read_csv("data/plant1_clean.csv")

# Convert DATE_TIME to datetime
df["DATE_TIME"] = pd.to_datetime(df["DATE_TIME"])

# -----------------------------
# 2. Plant location
# -----------------------------
latitude = 19.1176
longitude = 73.1162
timezone = "Asia/Kolkata"

# -----------------------------
# 3. Prepare timestamps for pvlib
# -----------------------------
times = pd.DatetimeIndex(
    df["DATE_TIME"]
).tz_localize(timezone)

# -----------------------------
# 4. Calculate solar position
# -----------------------------
solar_position = pvlib.solarposition.get_solarposition(
    times,
    latitude,
    longitude
)

# -----------------------------
# 5. Add solar features
# -----------------------------
df["solar_elevation"] = solar_position["apparent_elevation"].values
df["solar_azimuth"] = solar_position["azimuth"].values

# -----------------------------
# 6. Save updated dataset
# -----------------------------
df.to_csv("data/plant1_with_solar.csv", index=False)

# -----------------------------
# 7. Display result
# -----------------------------
print("\nUpdated dataset:")
print(df.head())

print("\nColumns:")
print(df.columns.tolist())

print("\nShape:")
print(df.shape)

print("\nSolar position examples:")
print(
    df[
        [
            "DATE_TIME",
            "solar_elevation",
            "solar_azimuth"
        ]
    ].head(10)
)