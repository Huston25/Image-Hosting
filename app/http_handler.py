import http
import json
import urllib
from http.server import BaseHTTPRequestHandler
import logging
import urllib.parse
from urllib.parse import parse_qs

from database import save_metadata
from utils import generate_uniqname
from utils import save_file, validate_image, delete_file
from database import get_image_metadata, get_metadata, delete_metadata, get_images_count

logging  = logging.getLogger(__name__)

class MyServer(http.server.BaseHTTPRequestHandler):
    server_version = 'ImageHosting/0.1'

    def do_GET(self):
        """Handle GET requests for image retrieval and pagination
        
        Routes:
        - /get_images/: Returns paginated list of images with metadata
        - /images/{filename}: Returns metadata for specific image
        """
        parsed_path = urllib.parse.urlparse(self.path)

        logging.info("GET request, path = " + parsed_path.path)

        page = int(parse_qs(parsed_path.query).get('page', [1])[0])
        page_size = int(parse_qs(parsed_path.query).get('page_size', [10])[0])
        logging.info(f'page, page_size = {page, page_size}')


        if parsed_path.path == '/get_images/':
            images = get_image_metadata(page, page_size)
            total_count = get_images_count()
            
            images_list = [
                {
                    'filename': i[1],
                    'original_name': i[2],
                    'size': i[3],
                    'date': i[4].strftime('%Y-%m-%d %H:%M:%S'),
                    'type': i[5]
                }
                for i in images
            ]
            
            response_data = {
                'images': images_list,
                'total': total_count,
                'page': page,
                'page_size': page_size,
                'total_pages': (total_count + page_size - 1) // page_size  # ceil division
            }
            
            self.send_json(response_data)
        elif parsed_path.path.startswith('/images/'):
            filename = parsed_path.path.split('/')[2]
            try:
                data = get_metadata(filename)
                self.send_json(data)
            except Exception as e:
                self.send_json({'error': str(e)}, 404)

        else:
            self.send_json({'error': 'Not Found'}, 404)


    def do_POST(self):
        """Handle POST requests for file upload and backup
        
        Routes:
        - /upload: Processes image uploads with validation and storage
        - /backup: Triggers database backup operation
        """
        parsed_path = urllib.parse.urlparse(self.path)
        logging.info(f"POST request, path: {parsed_path}")


        if parsed_path.path == '/upload':
            content_length = int(self.headers.get('Content-Length', 0))



            if content_length == 0:
                return self.send_json({'error': 'No content'}, 404)

            original_filename = self.headers.get('X-FileName', '')


            if not original_filename:
                return self.send_json({'error': 'No filename provided'}, 400)


            base, sep, ext = original_filename.rpartition('.')
            if not sep or not base or not ext:
                return self.send_json({'error': 'Invalid filename'}, 400)
            post_data = self.rfile.read(content_length)

            try:
                validate_image(post_data, ext)
            except Exception as e:
                return self.send_json({'error': str(e)}, 400)

            uniqname = f'{generate_uniqname(base)}.{ext}'

            save_file(uniqname, post_data)

            save_metadata(uniqname, original_filename, content_length // 1024, ext)




            return self.send_json({'result': 'success', 'url': f'http://localhost/images/{uniqname}'}, 201)

        elif parsed_path.path == '/backup':
            return self.send_json({'success': True}, 201)

        else:
            return self.send_json({'error': 'Not Found'}, 404)


    def do_DELETE(self):
        """Handle DELETE requests for image removal
        
        Routes:
        - /delete/{filename}: Deletes both file and database record
        """
        parsed_path = urllib.parse.urlparse(self.path)
        logging.info(f'Received DELETE request, path = {parsed_path.path}')

        if parsed_path.path.startswith('/delete/'):
            filename = parsed_path.path.split('/')[2]
            try:
                delete_file(filename)
                delete_metadata(filename)
                self.send_json({"message": "Image Deleted"}, 204)
            except Exception as e:
                self.send_json({'error': str(e)}, 404)

    def send_json(self, data:dict | list, status_code=200):
        """Utility function to send JSON responses with proper HTTP status codes"""
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
