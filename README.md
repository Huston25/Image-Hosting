# Image Hosting Service

A modern, responsive image hosting application built with Python and PostgreSQL, featuring drag-and-drop upload, image management, and a clean web interface.

## Features

- **Drag & Drop Upload**: Intuitive file upload with drag-and-drop support
- **Image Management**: View, delete, and manage uploaded images
- **Responsive Design**: Mobile-friendly interface using Bootstrap and custom CSS
- **Pagination**: Efficient browsing through large image collections
- **File Validation**: Supports JPG, PNG, GIF formats with 5MB size limit
- **Database Storage**: PostgreSQL backend for metadata management
- **Docker Support**: Complete containerized deployment
- **NGINX Reverse Proxy**: Production-ready web server configuration

## Tech Stack

### Backend
- **Python 3.x**: Core application server
- **PostgreSQL**: Database for image metadata
- **psycopg**: PostgreSQL adapter for Python
- **HTTP Server**: Custom HTTP server using Python's http.server

### Frontend
- **HTML5/CSS3**: Modern responsive design
- **JavaScript**: Dynamic client-side functionality
- **Bootstrap 5**: UI framework
- **Custom CSS**: Tailored styling and animations

### Infrastructure
- **Docker & Docker Compose**: Containerization
- **NGINX**: Reverse proxy and static file serving
- **PostgreSQL 17**: Database server

## Project Structure

```
Image-Hosting/
├── app/                    # Backend application
│   ├── app.py             # Main application entry point
│   ├── config.py          # Configuration settings
│   ├── database.py        # Database operations
│   ├── http_handler.py    # HTTP request handlers
│   ├── utils.py           # Utility functions
│   └── Dockerfile         # Docker configuration for app
├── static/                # Frontend assets
│   ├── html/
│   │   └── images.html    # Main web interface
│   ├── css/
│   │   ├── style.css      # Custom styles
│   │   └── reset.css      # CSS reset
│   ├── skripts/
│   │   └── images.js      # Client-side JavaScript
│   └── Photo/             # Image assets
├── images/                # Uploaded image storage
├── logs/                  # Application logs
├── backups/               # Database backups
├── docker-compose.yml     # Docker services configuration
├── nginx.conf            # NGINX configuration
├── .env                  # Environment variables
└── .gitignore            # Git ignore rules
```

## API Endpoints

### Upload
- `POST /upload` - Upload an image file
  - Headers: `X-FileName` (original filename)
  - Returns: JSON with image URL

### Retrieve
- `GET /get_images/` - Get paginated list of images
  - Query params: `page`, `page_size`
  - Returns: JSON with images array and pagination info

- `GET /images/{filename}` - Get metadata for specific image
  - Returns: JSON with image details

### Delete
- `DELETE /delete/{filename}` - Delete an image
  - Returns: Success/error response

## Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Image-Hosting
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Web Interface: http://localhost
   - API: http://localhost:8000

### Environment Variables

Create a `.env` file with the following variables:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=image_hosting
BACKUP_DIRECTORY=backups
```

## Usage

### Uploading Images

1. Open the web interface at http://localhost
2. Click "Browse your file" or drag and drop images into the upload zone
3. Supported formats: JPG, PNG, GIF
4. Maximum file size: 5MB
5. Copy the generated URL to share your image

### Managing Images

1. Click the "Images" tab to view all uploaded images
2. Browse through pages using the pagination controls
3. Click "Open" to view an image in a new tab
4. Click the delete button to remove images

### API Usage

#### Upload an image
```bash
curl -X POST http://localhost:8000/upload \
  -H "X-FileName: example.jpg" \
  --data-binary @example.jpg
```

#### Get images list
```bash
curl "http://localhost:8000/get_images/?page=1&page_size=10"
```

#### Delete an image
```bash
curl -X DELETE http://localhost:8000/delete/example-uuid.jpg
```

## Development

### Running Locally

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL database**
   ```bash
   # Create database and configure connection in .env
   ```

3. **Run the application**
   ```bash
   cd app
   python app.py
   ```

### Project Architecture

The application follows a modular architecture:

- **`app.py`**: Main server entry point
- **`http_handler.py`**: HTTP request routing and handling
- **`database.py`**: Database operations and connection management
- **`utils.py`**: File operations and validation utilities
- **`config.py`**: Configuration management

### Database Schema

```sql
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size INTEGER NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_type TEXT NOT NULL
);
```

## Deployment

### Docker Deployment

The application is fully containerized with Docker Compose:

- **app**: Python application server
- **db**: PostgreSQL database
- **nginx**: Reverse proxy and static file server

### Backup

Database backups are automated and stored in the `backups/` directory. The backup script runs periodically and can be manually triggered via the API:

```bash
docker exec -t postgres_ih ./backup.sh
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the logs in the `logs/` directory
- Review the Docker container logs
- Verify database connectivity
- Ensure proper environment configuration
