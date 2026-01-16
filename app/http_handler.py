import json
import urllib
from http.server import BaseHTTPRequestHandler
import logging
import urllib.parse

from app.database import delete_metadata
from database import get_image_metadata, get_metadata

logging  = logging.getLogger(__name__)

class MyServer(BaseHTTPRequestHandler):
    server_version = 'ImageHisting/0.1'



    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)

        logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(parsed_path), str(self.headers))


        if parsed_path.path == '/images':
            self.send_json(get_image_metadata())
        elif parsed_path.path.startswith('/images/'):
            image_id = parsed_path.path.split('/')[2]
            if not image_id.isdigit():
                self.send_json({'error': 'Invalid image ID'}, 404)
            try:
                data = get_metadata(image_id)
                self.send_json(data)
            except Exception as e:
                self.send_json({'error': str(e)}, 404)

        else:
            self.send_json({'error': 'Not Found'}, 404)


    def do_POST(self):
        # content_length = int(self.headers['Content-Length'])
        # post_data = self.rfile.read(content_length)
        # try:
        #     data = json.loads(post_data)
        #     response_message = f"Received POST data: {data}"
        # except json.JSONDecodeError as e:
        #     response_message = f"Received POST data: {post_data}"
        # # logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
        # #              str(self.path), str(self.headers), post_data.decode('utf-8'))
        # self.send_response(200)
        # self.end_headers()
        # response = {"status":"success", "message": response_message}
        # self.wfile.write(json.dumps(response).encode())
        pass
    def do_DELETE(self):
        """Handle a DELETE request"""
        parsed_path = urllib.parse.urlparse(self.path)
        logging.info(f'Received DELETE request, path = {parsed_path.path}')

        if self.path.startswith('/images'):
            image_id = parsed_path.path.split('/')[2]
            if not image_id.isdigit():
                self.send_json({}, 404)
            try:
                delete_metadata(image_id)
                self.send_json({"message": "Image Deleted"}, 204)
            except Exception as e:
                self.send_json({'error': str(e)}, 404)

    def send_json(self, data:dict | list, status_code=200):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
