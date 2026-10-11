import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, LSTM, Dense, Dropout


# ---------------------------------------
# 1. Load training sequences
# ---------------------------------------

X_train = np.load("data/X_train.npy")
y_train = np.load("data/y_train.npy")


# ---------------------------------------
# 2. Get input dimensions
# ---------------------------------------

timesteps = X_train.shape[1]
num_features = X_train.shape[2]
forecast_horizon = y_train.shape[1]

print("Timesteps:", timesteps)
print("Features:", num_features)
print("Forecast horizon:", forecast_horizon)


# ---------------------------------------
# 3. Build CNN-LSTM model
# ---------------------------------------

model = Sequential([
    
    # CNN layer
    Conv1D(
        filters=32,
        kernel_size=3,
        activation="relu",
        input_shape=(timesteps, num_features)
    ),

    # Prevent overfitting
    Dropout(0.2),

    # LSTM layer
    LSTM(64),

    # Prevent overfitting
    Dropout(0.2),

    # Dense processing layer
    Dense(
        32,
        activation="relu"
    ),

    # 16 future predictions
    Dense(
        forecast_horizon
    )
])


# ---------------------------------------
# 4. Compile model
# ---------------------------------------

model.compile(
    optimizer="adam",
    loss="mse",
    metrics=["mae"]
)


# ---------------------------------------
# 5. Display model
# ---------------------------------------

print("\nCNN-LSTM Model:")
model.summary()