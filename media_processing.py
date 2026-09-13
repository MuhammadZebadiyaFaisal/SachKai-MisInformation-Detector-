import base64
import os
import tempfile
from pathlib import Path

from fastapi import UploadFile

_WHISPER_MODEL = None


def transcribe_audio_file(file: UploadFile) -> str:
    path = _save_upload_to_temp(file)
    try:
        # 1. Primary Cloud Execution: Groq Whisper API (Bypasses local ffmpeg/binary requirements on Vercel)
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            try:
                from groq import Groq

                client = Groq(api_key=groq_key)
                with open(path, "rb") as audio_file:
                    transcription = client.audio.transcriptions.create(
                        file=(path.name, audio_file.read()),
                        model=os.getenv("WHISPER_GROQ_MODEL", "whisper-large-v3-turbo"),
                    )
                text = (
                    transcription.text.strip()
                    if hasattr(transcription, "text")
                    else str(transcription).strip()
                )
                if text:
                    return text
            except Exception as cloud_exc:
                print(f"Groq Cloud Audio Transcription failed, attempting local fallback: {cloud_exc}")

        # 2. Local Fallback Execution: faster_whisper
        try:
            from faster_whisper import WhisperModel
        except ImportError as exc:
            raise RuntimeError(
                "No valid audio transcription engine available. Set GROQ_API_KEY or install faster-whisper."
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
        # 1. Primary Cloud Execution: Groq Vision API
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            try:
                from groq import Groq

                client = Groq(api_key=groq_key)
                with open(path, "rb") as img_file:
                    base64_image = base64.b64encode(img_file.read()).decode("utf-8")

                suffix = path.suffix.lower().lstrip(".")
                mime_type = f"image/{'jpeg' if suffix in ['jpg', 'jpeg'] else suffix or 'png'}"

                # Using reliable 90b vision model endpoint
                response = client.chat.completions.create(
                    model="llama-3.2-90b-vision-preview",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Extract and return ONLY the readable text present in this image. Do not include introductory notes or commentary.",
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{base64_image}"
                                    },
                                },
                            ],
                        }
                    ],
                    temperature=0.1,
                )
                extracted_text = response.choices[0].message.content.strip()
                if extracted_text:
                    return extracted_text
            except Exception as cloud_exc:
                print(f"Groq Cloud OCR error: {cloud_exc}")
                # If on Vercel/Cloud, return a clean error instead of trying Tesseract system binary
                if os.getenv("VERCEL"):
                    raise RuntimeError(f"Cloud Image OCR processing error: {cloud_exc}")

        # 2. Local Fallback Execution (Only runs locally if Tesseract is installed)
        try:
            from PIL import Image
            import pytesseract

            tesseract_cmd = os.getenv("TESSERACT_CMD")
            if tesseract_cmd:
                pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

            image = Image.open(path)
            text = pytesseract.image_to_string(image, lang=os.getenv("TESSERACT_LANG", "eng"))
            text = " ".join(text.split())
            if text:
                return text
        except Exception as local_exc:
            raise RuntimeError("Could not extract readable text from the image using Vision API.") from local_exc

        raise RuntimeError("No readable text could be extracted from the image.")

    finally:
        path.unlink(missing_ok=True)

def _save_upload_to_temp(file: UploadFile) -> Path:
    suffix = Path(file.filename or "").suffix or ".upload"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(file.file.read())
        return Path(temp_file.name)