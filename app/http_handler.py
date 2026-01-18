import http
import json
import urllib
from http.server import BaseHTTPRequestHandler
import logging
import urllib.parse

from database import save_metadata
from utils import generate_uniqname
from utils import save_file, validate_image, delete_file
from database import get_image_metadata, get_metadata, delete_metadata

logging  = logging.getLogger(__name__)

class MyServer(http.server.BaseHTTPRequestHandler):
    server_version = 'ImageHosting/0.1'



    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)

        logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(parsed_path), str(self.headers))


        if parsed_path.path == '/images':
            images = get_image_metadata()
            images = [
                {
                    'filename': i[1],
                    'original_name': i[2],
                    'size': i[3],
                    'date': i[4].strftime('%Y-%m-%d %H:%M:%S'),
                    'type': i[5]
                }
                for i in images
            ]



            self.send_json(images)
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
        parsed_path = urllib.parse.urlparse(self.path)
        logging.info(f"POST request, path: %s", parsed_path)


        if parsed_path.path == '/upload':
            content_length = int(self.headers.get('Content-Length', 0))
            filename = self.headers.get('FileName', '')

            if content_length == 0:
                return self.send_json({'error': 'No content'}, 404)


            if not filename:
                return self.send_json({'error': 'No filename provided'}, 400)


            *filename, ext = filename.split('.')
            filename = '.'.join(filename)
            post_data = self.rfile.read(content_length)

            try:
                validate_image(post_data, ext)
            except Exception as e:
                return self.send_json({'error': str(e)}, 400)

            uniqname = f'{generate_uniqname(filename)}.{ext}'

            save_file(uniqname, post_data)

            save_metadata(filename, f'{filename}.{ext}', content_length // 1024, ext)



            return self.send_json({'result': 'success'}, 201)

        else:
            return self.send_json({'error': 'Not Found'}, 404)


    def do_DELETE(self):
        """Handle a DELETE request"""
        parsed_path = urllib.parse.urlparse(self.path)
        logging.info(f'Received DELETE request, path = {parsed_path.path}')

        if self.path.startswith('/images'):
            filename = parsed_path.path.split('/')[2]
            try:
                delete_file(filename)
                delete_metadata(filename)
                self.send_json({"message": "Image Deleted"}, 204)
            except Exception as e:
                self.send_json({'error': str(e)}, 404)

    def send_json(self, data:dict | list, status_code=200):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
