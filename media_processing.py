import os
import tempfile
from pathlib import Path

from fastapi import UploadFile


_WHISPER_MODEL = None


def transcribe_audio_file(file: UploadFile) -> str:
    path = _save_upload_to_temp(file)
    try:
        try:
            from faster_whisper import WhisperModel
        except ImportError as exc:
            raise RuntimeError(
                "faster-whisper is not installed. Run: .venv/bin/python -m pip install faster-whisper"
            ) from exc

        global _WHISPER_MODEL
        if _WHISPER_MODEL is None:
            _WHISPER_MODEL = WhisperModel(
                os.getenv("WHISPER_MODEL_SIZE", "tiny"),
                device=os.getenv("WHISPER_DEVICE", "cpu"),
                compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "int8"),
            )

        language = os.getenv("WHISPER_LANGUAGE") or None
        try:
            segments, _ = _WHISPER_MODEL.transcribe(str(path), language=language)
            transcript = " ".join(segment.text.strip() for segment in segments).strip()
        except Exception as exc:
            raise RuntimeError(f"Local audio transcription failed: {exc}") from exc

        if not transcript:
            raise RuntimeError("No speech text could be transcribed from the audio file.")
        return transcript
    finally:
        path.unlink(missing_ok=True)


def extract_text_from_image_file(file: UploadFile) -> str:
    path = _save_upload_to_temp(file)
    try:
        try:
            from PIL import Image
            import pytesseract
        except ImportError as exc:
            raise RuntimeError(
                "pillow and pytesseract are required for image OCR. Run: .venv/bin/python -m pip install pillow pytesseract"
            ) from exc

        tesseract_cmd = os.getenv("TESSERACT_CMD")
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

        try:
            pytesseract.get_tesseract_version()
        except Exception as exc:
            raise RuntimeError(
                "Tesseract OCR is not installed or not on PATH. On macOS run: brew install tesseract"
            ) from exc

        try:
            image = Image.open(path)
            text = pytesseract.image_to_string(image, lang=os.getenv("TESSERACT_LANG", "eng"))
        except Exception as exc:
            raise RuntimeError(f"Local image OCR failed: {exc}") from exc

        text = " ".join(text.split())
        if not text:
            raise RuntimeError("No readable text could be extracted from the image.")
        return text
    finally:
        path.unlink(missing_ok=True)


def _save_upload_to_temp(file: UploadFile) -> Path:
    suffix = Path(file.filename or "").suffix or ".upload"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(file.file.read())
        return Path(temp_file.name)
