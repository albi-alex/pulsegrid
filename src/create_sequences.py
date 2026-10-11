import pandas as pd
import numpy as np


# ---------------------------------------
# Configuration
# ---------------------------------------

LOOKBACK = 16
HORIZON = 16

FEATURE_COLUMNS = [
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

TARGET_COLUMN = "AC_POWER"


# ---------------------------------------
# Sequence creation function
# ---------------------------------------

def create_sequences(df):

    X = []
    y = []

    feature_values = df[FEATURE_COLUMNS].values
    target_values = df[TARGET_COLUMN].values
    continuous_values = df["CONTINUOUS"].values

    for i in range(
        LOOKBACK,
        len(df) - HORIZON + 1
    ):

        # Input window
        input_start = i - LOOKBACK
        input_end = i

        # Future target window
        target_start = i
        target_end = i + HORIZON

        # Check that the complete window is continuous
        window_continuous = continuous_values[
            input_start + 1 : target_end
        ]

        if not np.all(window_continuous):
            continue

        # Add input sequence
        X.append(
            feature_values[
                input_start:input_end
            ]
        )

        # Add target sequence
        y.append(
            target_values[
                target_start:target_end
            ]
        )

    return np.array(X), np.array(y)


# ---------------------------------------
# Load datasets
# ---------------------------------------

train_df = pd.read_csv(
    "data/train_scaled.csv"
)

validation_df = pd.read_csv(
    "data/validation_scaled.csv"
)

test_df = pd.read_csv(
    "data/test_scaled.csv"
)


# ---------------------------------------
# Create sequences
# ---------------------------------------

X_train, y_train = create_sequences(train_df)

X_validation, y_validation = create_sequences(
    validation_df
)

X_test, y_test = create_sequences(
    test_df
)


# ---------------------------------------
# Save sequences
# ---------------------------------------

np.save(
    "data/X_train.npy",
    X_train
)

np.save(
    "data/y_train.npy",
    y_train
)

np.save(
    "data/X_validation.npy",
    X_validation
)

np.save(
    "data/y_validation.npy",
    y_validation
)

np.save(
    "data/X_test.npy",
    X_test
)

np.save(
    "data/y_test.npy",
    y_test
)


# ---------------------------------------
# Print results
# ---------------------------------------

print("\nSequence creation complete!")

print("\nLookback:", LOOKBACK)
print("Forecast horizon:", HORIZON)

print("\nTraining:")
print("X_train shape:", X_train.shape)
print("y_train shape:", y_train.shape)

print("\nValidation:")
print("X_validation shape:", X_validation.shape)
print("y_validation shape:", y_validation.shape)

print("\nTest:")
print("X_test shape:", X_test.shape)
print("y_test shape:", y_test.shape)