"""
Download a trained model from Google Drive.
Usage:
    python scripts/download_model.py --id <GDRIVE_FILE_ID>
    python scripts/download_model.py  # uses GDRIVE_MODEL_ID env var
"""

import argparse
import os
import sys

try:
    import gdown
except ImportError:
    print("Installing gdown...")
    os.system(f"{sys.executable} -m pip install gdown")
    import gdown


def download(file_id: str, output_dir: str = "models"):
    os.makedirs(output_dir, exist_ok=True)
    url = f"https://drive.google.com/uc?id={file_id}"
    output_path = os.path.join(output_dir, "best_model.pth")
    print(f"Downloading model from Google Drive: {file_id}")
    gdown.download(url, output_path, quiet=False)
    print(f"Model saved to: {output_path}")
    return output_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download model from Google Drive")
    parser.add_argument("--id", type=str, default=os.getenv("GDRIVE_MODEL_ID", ""),
                        help="Google Drive file ID")
    parser.add_argument("--output-dir", type=str, default="models",
                        help="Output directory (default: models)")
    args = parser.parse_args()

    if not args.id:
        print("ERROR: No file ID provided. Use --id or set GDRIVE_MODEL_ID env var.")
        sys.exit(1)

    download(args.id, args.output_dir)
