import numpy as np
import tensorflow as tf
import joblib
from pathlib import Path


# Get the project folder
PROJECT_FOLDER = Path(__file__).resolve().parent


# Load the trained CNN-LSTM model
model = tf.keras.models.load_model(
    PROJECT_FOLDER / "models" / "best_cnn_lstm.keras"
)


# Load the saved scalers
target_scaler = joblib.load(
    PROJECT_FOLDER / "models" / "target_scaler.pkl"
)

feature_scaler = joblib.load(
    PROJECT_FOLDER / "models" / "feature_scaler.pkl"
)


def predict_power(input_sequence):
    """
    Predict solar power for the next four hours.
    Input must contain scaled features from the previous four hours.
    """

    input_sequence = np.asarray(
        input_sequence,
        dtype=np.float32
    )

    # Add batch dimension if input is a single sequence
    if input_sequence.ndim == 2:
        input_sequence = np.expand_dims(
            input_sequence,
            axis=0
        )

    # Generate scaled predictions
    predicted_scaled = model.predict(
        input_sequence,
        verbose=0
    )

    # Convert predictions back to watts
    predicted_power = target_scaler.inverse_transform(
        predicted_scaled.reshape(-1, 1)
    ).reshape(predicted_scaled.shape)

    # Prevent negative power predictions
    predicted_power = np.maximum(
        predicted_power,
        0
    )

    return predicted_power


if __name__ == "__main__":

    # Load the test dataset
    X_test = np.load(
        PROJECT_FOLDER / "data" / "X_test.npy"
    )

    # Select one test sequence
    sample_sequence = X_test[0]

    # Generate the forecast
    forecast = predict_power(sample_sequence)

    print("\n===== GridPulse Solar Power Forecast =====")

    print("Forecast duration: 4 hours")
    print("Forecast interval: 15 minutes")
    print("Number of predictions:", forecast.shape[1])

    print("\nPredicted solar power:")

    for index, power in enumerate(forecast[0], start=1):
        minutes = index * 15

        print(
            f"After {minutes:3d} minutes: "
            f"{power:.2f} W"
        )

    print("\nPrediction completed successfully!")

