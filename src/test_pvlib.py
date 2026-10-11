import pandas as pd
import pvlib

# Plant location
latitude = 19.1176
longitude = 73.1162
timezone = "Asia/Kolkata"

# Example timestamps from our dataset
times = pd.DatetimeIndex([
    "2020-05-15 06:00:00",
    "2020-05-15 12:00:00",
    "2020-05-15 18:00:00"
]).tz_localize(timezone)

# Calculate solar position
solar_position = pvlib.solarposition.get_solarposition(
    times,
    latitude,
    longitude
)

print("\nSolar position:")
print(
    solar_position[
        ["apparent_elevation", "azimuth"]
    ]
)