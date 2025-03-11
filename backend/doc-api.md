# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=1d

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=xmlfiscal
DB_USER=postgres
DB_PASSWORD=123456789

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# XML Storage Configuration
XML_STORAGE_PATH=./storage/xml
XML_RETENTION_DAYS=15

Na automação, o que deve ser pego diretamente no banco de dados para executar:
1. CNPJs
2. SIEG KEY
3. Data Inicial e Data Final (data base é 5 dias antes do dia da execução até o dia atual)
4. Tipo de Documento
5. Token do usuário, para ser executado com as configurações do mesmo