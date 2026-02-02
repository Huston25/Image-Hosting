import os
import uuid
import logging


from config import MAX_FILE_SIZE, FILE_EXTENSIONS, IMAGE_DIRECTORY

logging = logging.getLogger(__name__)

def save_file(filename:str, post_data:bytes):
    """Save uploaded file data to the images directory"""
    with open(f'./{IMAGE_DIRECTORY}/{filename}', 'wb') as f:
        f.write(post_data)

def delete_file(filename:str):
    """Remove file from filesystem with error handling"""
    file_path = f'./{IMAGE_DIRECTORY}/{filename}'
    if os.path.exists(file_path):
        os.remove(file_path)
        logging.info(f'Deleted {file_path}')
    else:
        logging.error(f'File {file_path} does not exist')

def validate_image(post_data, ext):
    """Validate file size and extension before upload"""
    if len(post_data) > MAX_FILE_SIZE:
        raise Exception('File too large')
    if ext not in FILE_EXTENSIONS:
        raise Exception('File extension not supported')

def generate_uniqname(filename) -> str:
    """Generate unique filename using UUID to prevent conflicts"""
    return f'{filename}-{uuid.uuid4().hex}'