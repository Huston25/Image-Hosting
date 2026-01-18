import os
import uuid
import logging


from config import MAX_FILE_SIZE, FILE_EXTENSIONS, IMAGE_DIRECTORY

logging = logging.getLogger(__name__)

def save_file(filename:str, post_data:bytes):
    with open(f'./{IMAGE_DIRECTORY}/{filename}', 'wb') as f:
        f.write(post_data)

def delete_file(filename:str):
    file_path = f'./{IMAGE_DIRECTORY}/{filename}'
    if os.path.exists(f'./{IMAGE_DIRECTORY}/{file_path}'):
        os.remove(f'./{IMAGE_DIRECTORY}/{file_path}')
        logging.info(f'Deleted {file_path}')
    else:
        logging.error(f'File {file_path} does not exist')

def validate_image(post_data, ext):
    if len(post_data) > MAX_FILE_SIZE:
        raise Exception('File too large')
    if ext not in FILE_EXTENSIONS:
        raise Exception('File extension not supported')

def generate_uniqname(filename) -> str:
    return f'{filename}-{uuid.uuid4().hex}'