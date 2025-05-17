# Calendar Management App

This project is a simple web application using **React** for the frontend, **FastAPI** for the backend and **PostgreSQL** for persistence. All services are orchestrated using **Docker Compose**.

## Development

Build and start the application using Docker Compose:

```bash
docker-compose up --build
```

The backend will be available at `http://localhost:8000` and the frontend at `http://localhost:3000`.

## User Setup

No accounts are created automatically. You must insert an initial user manually before logging in. First generate a bcrypt hash using the backend container:

```bash
docker compose exec backend python - <<'EOF'
from passlib.context import CryptContext
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd.hash("YOUR_ADMIN_PASSWORD"))
EOF
```

Then insert the admin record into Postgres (note the escaped `$` characters):

```bash
docker compose exec db psql -U postgres -d postgres -c \
  "INSERT INTO users (username, hashed_password, type) VALUES ('admin', '\$2b\$...YOUR_HASH...', 'admin');"
```

After that you can request a token:

```bash
curl -X POST -d "username=admin&password=YOUR_ADMIN_PASSWORD" http://localhost:8000/token
```
