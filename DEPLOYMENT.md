# Deployment Guide - Judicial Portal

## Frontend Deployment on Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)

### Steps

1. **Push code to GitHub**
```bash
cd judicial-portal
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Deploy on Vercel**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` directory as the root
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`

4. **Deploy**
   - Click "Deploy"
   - Your site will be live at `https://your-project.vercel.app`

### Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

## Backend Deployment on Railway

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Steps

1. **Create New Project on Railway**
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Select the `backend` directory

2. **Add MySQL Database**
   - Click "New" → "Database" → "MySQL"
   - Railway will create a MySQL instance
   - Copy the connection details

3. **Configure Environment Variables**
   - Go to your backend service
   - Click "Variables"
   - Add all variables from `.env.example`:

```
APP_NAME=Judicial Portal
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-railway-app.railway.app

DB_CONNECTION=mysql
DB_HOST=<from-railway-mysql>
DB_PORT=<from-railway-mysql>
DB_DATABASE=<from-railway-mysql>
DB_USERNAME=<from-railway-mysql>
DB_PASSWORD=<from-railway-mysql>

FRONTEND_URL=https://your-vercel-app.vercel.app

SESSION_DRIVER=database
CACHE_DRIVER=database
QUEUE_CONNECTION=database
```

4. **Add Build and Start Commands**
   - Build Command: `composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan db:seed --force && php artisan storage:link`
   - Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT`

5. **Deploy**
   - Railway will automatically deploy
   - Your backend will be live at `https://your-project.railway.app`

---

## Backend Deployment on Render

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)

### Steps

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` directory

2. **Configure Service**
   - Name: `judicial-portal-backend`
   - Environment: `PHP`
   - Build Command:
```bash
composer install --no-dev --optimize-autoloader
```
   - Start Command:
```bash
php artisan config:cache && php artisan route:cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
```

3. **Add Environment Variables**
   - Add all variables from `.env.example` (same as Railway section)

4. **Create Database**
   - On Render dashboard, click "New" → "PostgreSQL" (or use external MySQL)
   - Connect to your web service

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

---

## Backend Deployment on VPS (Hostinger/DigitalOcean)

### Prerequisites
- VPS with Ubuntu 20.04 or higher
- Root/sudo access
- Domain name (optional)

### Steps

1. **Connect to VPS**
```bash
ssh root@your-vps-ip
```

2. **Install Required Software**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.1
sudo apt install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.1 php8.1-fpm php8.1-mysql php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-curl php8.1-zip php8.1-gd -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Nginx
sudo apt install nginx -y

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

3. **Setup Database**
```bash
sudo mysql -u root -p

CREATE DATABASE judicial_portal;
CREATE USER 'judicialuser'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON judicial_portal.* TO 'judicialuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

4. **Deploy Application**
```bash
# Navigate to web directory
cd /var/www

# Clone repository
sudo git clone <your-repo-url> judicial-portal
cd judicial-portal/backend

# Install dependencies
sudo composer install --no-dev --optimize-autoloader

# Set permissions
sudo chown -R www-data:www-data /var/www/judicial-portal
sudo chmod -R 755 /var/www/judicial-portal
sudo chmod -R 775 /var/www/judicial-portal/backend/storage
sudo chmod -R 775 /var/www/judicial-portal/backend/bootstrap/cache

# Configure environment
sudo cp .env.example .env
sudo nano .env
# Update database credentials and APP_URL

# Generate key and setup
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
```

5. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/judicial-portal
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/judicial-portal/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/judicial-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Setup SSL with Let's Encrypt (Optional)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

7. **Setup Cron Jobs**
```bash
sudo crontab -e
```

Add:
```
* * * * * cd /var/www/judicial-portal/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## Post-Deployment Checklist

### Backend
- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Storage link created
- [ ] File permissions set correctly
- [ ] SSL certificate installed (production)
- [ ] CORS configured for frontend URL
- [ ] API endpoints accessible

### Frontend
- [ ] Environment variables configured
- [ ] API URL points to backend
- [ ] Build completes without errors
- [ ] All routes work correctly
- [ ] Authentication flow works
- [ ] Dark mode persists

### Testing
- [ ] User registration works
- [ ] User login works
- [ ] Cases CRUD operations work
- [ ] Hearings CRUD operations work
- [ ] Document upload/download works
- [ ] Notifications work
- [ ] Jitsi video conferencing works
- [ ] Charts render correctly
- [ ] Calendar shows hearings
- [ ] Mobile responsive design works

---

## Troubleshooting

### Frontend Issues

**Issue: API calls failing**
- Check `VITE_API_URL` in environment variables
- Verify backend is running and accessible
- Check browser console for CORS errors

**Issue: Build fails**
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Try: `npm run build`

### Backend Issues

**Issue: 500 Internal Server Error**
- Check `.env` file exists and is configured
- Run: `php artisan key:generate`
- Check storage permissions: `chmod -R 775 storage bootstrap/cache`
- Check Laravel logs: `storage/logs/laravel.log`

**Issue: Database connection failed**
- Verify database credentials in `.env`
- Check database exists
- Test connection: `php artisan migrate:status`

**Issue: CORS errors**
- Add frontend URL to `SANCTUM_STATEFUL_DOMAINS` in `.env`
- Add frontend URL to `config/cors.php` allowed origins

---

## Monitoring and Maintenance

### Logs
- **Backend**: `storage/logs/laravel.log`
- **Frontend**: Browser console
- **Server**: `/var/log/nginx/error.log`

### Updates
```bash
# Backend
cd backend
git pull
composer install
php artisan migrate
php artisan cache:clear
php artisan config:clear

# Frontend
cd frontend
git pull
npm install
npm run build
```

### Backups
```bash
# Database backup
mysqldump -u username -p judicial_portal > backup_$(date +%Y%m%d).sql

# Files backup
tar -czf judicial_portal_backup_$(date +%Y%m%d).tar.gz /var/www/judicial-portal
```

---

## Support

For deployment issues:
- Check logs first
- Review this guide
- Check Laravel/React documentation
- Contact: support@judicialportal.com
