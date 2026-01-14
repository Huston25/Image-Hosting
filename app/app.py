from http.server import BaseHTTPRequestHandler, HTTPServer
import logging

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        # logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write("<html><body><h1>Hello, World!</h1></body></html>".encode())

    def do_POST(self):
        # content_length = int(self.headers['Content-Length'])
        # post_data = self.rfile.read(content_length)
        # logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
        #              str(self.path), str(self.headers), post_data.decode('utf-8'))
        # self.send_response(200)
        # self.end_headers()
        # self.wfile.write(b"POST request received")
        pass

def run():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    server_address = ('localhost', 8000)
    httpd = HTTPServer(server_address, MyServer)
    logging.info('Starting httpd on port 8000...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd...\n')

if __name__ == '__main__':
    run()
