from http.server import HTTPServer
import logging

from config import HOST, PORT
from database import create_tables
from http_handler import MyServer


def run():
    """Main function that starts the HTTP server, initializes logging, creates database tables, and handles server lifecycle"""
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    create_tables()

    httpd = HTTPServer((HOST, PORT), MyServer)
    logging.info(f'Starting httpd on {HOST}: {PORT}...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd...\n')

if __name__ == '__main__':
    run()
