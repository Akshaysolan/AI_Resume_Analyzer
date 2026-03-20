import io
import PyPDF2
import docx


def extract_text_from_pdf(file_obj) -> str:
    """Extract text from a PDF file object."""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_obj.read()))
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        return "\n".join(text_parts)
    except Exception as e:
        raise ValueError(f"Failed to extract PDF text: {str(e)}")


def extract_text_from_docx(file_obj) -> str:
    """Extract text from a DOCX file object."""
    try:
        doc = docx.Document(io.BytesIO(file_obj.read()))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        raise ValueError(f"Failed to extract DOCX text: {str(e)}")


def extract_text_from_txt(file_obj) -> str:
    """Extract text from a plain text file."""
    try:
        content = file_obj.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8', errors='replace')
        return content
    except Exception as e:
        raise ValueError(f"Failed to read text file: {str(e)}")


def extract_resume_text(uploaded_file) -> str:
    """
    Dispatch extraction based on file extension.
    Returns cleaned plain text.
    """
    filename = uploaded_file.name.lower()
    if filename.endswith('.pdf'):
        text = extract_text_from_pdf(uploaded_file)
    elif filename.endswith('.docx'):
        text = extract_text_from_docx(uploaded_file)
    elif filename.endswith('.txt'):
        text = extract_text_from_txt(uploaded_file)
    else:
        raise ValueError(f"Unsupported file type. Please upload PDF, DOCX, or TXT.")

    if not text.strip():
        raise ValueError("No text could be extracted from the file.")

    return text.strip()
